"""Read trusted local workbook inputs without modifying the source."""

import logging
from datetime import datetime
from hashlib import sha256
from io import BytesIO
from math import isclose, isfinite
from pathlib import Path
from typing import Any
from xml.etree.ElementTree import ParseError
from zipfile import BadZipFile

from openpyxl import load_workbook
from openpyxl.utils.exceptions import InvalidFileException

from metrics import classify_alert, material_properties
from models import Dataset, MaterialReading, Reading, Sample, Scenario, Settings

logger = logging.getLogger(__name__)


class WorkbookError(Exception):
    """A source problem that can safely be displayed to the presenter."""


def count_operational_records(source: Path) -> int:
    """Count nonblank literal IDs under Telemetry's Record ID header.

    Read only the identifier column after finding its header. Formatting-only
    rows and unrelated column contents are not operational records. Accept
    spaces or underscores in the header to match the documented schema names.
    """
    try:
        with source.open("rb") as stream:
            workbook = load_workbook(stream, read_only=True, data_only=False)
            try:
                if "Telemetry" not in workbook.sheetnames:
                    raise WorkbookError("The workbook needs a Telemetry worksheet.")
                sheet = workbook["Telemetry"]
                headers = next(sheet.iter_rows(min_row=1, max_row=1), ())
                id_columns = [
                    index
                    for index, cell in enumerate(headers, start=1)
                    if isinstance(cell.value, str)
                    and " ".join(cell.value.replace("_", " ").split()).casefold() == "record id"
                ]
                if len(id_columns) != 1:
                    raise WorkbookError(
                        "Telemetry needs one Record ID column in its header row."
                    )
                count = 0
                for (cell,) in sheet.iter_rows(
                    min_row=2, min_col=id_columns[0], max_col=id_columns[0]
                ):
                    value = cell.value
                    if value is None or (isinstance(value, str) and not value.strip()):
                        continue
                    if cell.data_type in {"e", "f"} or not isinstance(value, str):
                        raise WorkbookError(
                            "Telemetry Record ID values must be plain text IDs."
                        )
                    count += 1
                return count
            finally:
                workbook.close()
    except WorkbookError:
        logger.warning("Workbook load failed: Telemetry / Record ID validation")
        raise
    except (OSError, BadZipFile, InvalidFileException, ParseError, KeyError, ValueError):
        logger.warning("Workbook load failed: source unavailable or invalid XLSX")
        raise WorkbookError(
            "The configured workbook could not be opened as an Excel file."
        ) from None


def _text(value: object, context: str) -> str:
    if not isinstance(value, str) or not value.strip() or value.startswith("#"):
        raise WorkbookError(f"{context}: a nonblank text value is required.")
    return value.strip()


def _number(value: object, context: str, *, minimum: float | None = None) -> float:
    if isinstance(value, bool) or not isinstance(value, (float, int)) or not isfinite(value):
        raise WorkbookError(
            f"{context}: a finite calculated value is required; recalculate in Excel."
        )
    result = float(value)
    if minimum is not None and result < minimum:
        raise WorkbookError(f"{context}: value is below its valid range.")
    return result


def _positive(value: object, context: str) -> float:
    result = _number(value, context, minimum=0)
    if result == 0:
        raise WorkbookError(f"{context}: a positive denominator is required.")
    return result


def _percent(value: object, context: str) -> float:
    result = _number(value, context, minimum=0)
    if result > 100:
        raise WorkbookError(f"{context}: percentage must be between 0 and 100.")
    return result


def _table(book: Any, name: str, required: tuple[str, ...]) -> list[dict[str, object]]:
    if name not in book.sheetnames:
        raise WorkbookError(f"{name}: required worksheet is missing.")
    rows = iter(book[name].values)
    headers = tuple(next(rows, ()))
    if any(headers.count(field) != 1 for field in required):
        raise WorkbookError(f"{name}: required column headers are missing or duplicated.")
    indexes = {field: headers.index(field) for field in required}
    result = []
    for values in rows:
        if not any(value is not None and str(value).strip() for value in values):
            continue
        result.append(
            {
                field: values[index] if index < len(values) else None
                for field, index in indexes.items()
            }
        )
    return result


def _unique_id(value: object, seen: set[str], context: str) -> str:
    identifier = _text(value, context)
    if identifier in seen:
        raise WorkbookError(f"{context}: duplicate identifier.")
    seen.add(identifier)
    return identifier


def _settings(book: Any) -> Settings:
    values: dict[str, object] = {}
    for row in _table(book, "Settings", ("Parameter", "Value")):
        key = _text(row["Parameter"], "Settings / Parameter")
        if key in values:
            raise WorkbookError("Settings / Parameter: duplicate parameter.")
        values[key] = row["Value"]
    fields = (
        "Target RH lower",
        "Target RH upper",
        "Alert RH high",
        "Alert temperature high",
        "Time step",
        "Control efficiency",
    )
    if any(field not in values for field in fields):
        raise WorkbookError("Settings: required operating parameters are missing.")
    settings = Settings(
        _percent(values[fields[0]], "Settings / Target RH lower"),
        _percent(values[fields[1]], "Settings / Target RH upper"),
        _percent(values[fields[2]], "Settings / Alert RH high"),
        _number(values[fields[3]], "Settings / Alert temperature high"),
        _positive(values[fields[4]], "Settings / Time step"),
        _number(values[fields[5]], "Settings / Control efficiency", minimum=0),
    )
    if settings.target_rh_lower_pct >= settings.target_rh_upper_pct:
        raise WorkbookError("Settings: target RH lower must be below target RH upper.")
    if settings.control_efficiency > 1:
        raise WorkbookError("Settings / Control efficiency: fraction must not exceed 1.")
    return settings


def _samples(book: Any) -> dict[str, Sample]:
    fields = (
        "Sample ID",
        "Formulation",
        "Type",
        "Control effectiveness",
        "Permeance factor",
        "Validation",
    )
    samples = {}
    seen: set[str] = set()
    for row in _table(book, "Samples", fields):
        identifier = _unique_id(row[fields[0]], seen, "Samples / Sample ID")
        sample = Sample(
            identifier,
            _text(row[fields[1]], "Samples / Formulation"),
            _text(row[fields[2]], "Samples / Type"),
            _number(row[fields[3]], "Samples / Control effectiveness", minimum=0),
            _number(row[fields[4]], "Samples / Permeance factor", minimum=0),
            _text(row[fields[5]], "Samples / Validation"),
        )
        if sample.control_effectiveness > 1:
            raise WorkbookError("Samples / Control effectiveness: fraction must not exceed 1.")
        samples[identifier] = sample
    return samples


def _scenarios(book: Any, samples: dict[str, Sample]) -> dict[str, Scenario]:
    fields = (
        "Scenario ID",
        "Sector",
        "Use case",
        "Membrane ID",
        "Area (m²)",
        "Baseline water (L/day)",
        "Projected water (L/day)",
        "Decision",
    )
    scenarios = {}
    seen: set[str] = set()
    for row in _table(book, "Scenarios", fields):
        identifier = _unique_id(row[fields[0]], seen, "Scenarios / Scenario ID")
        membrane = _text(row[fields[3]], "Scenarios / Membrane ID")
        if membrane not in samples:
            raise WorkbookError("Scenarios / Membrane ID: sample reference is missing.")
        scenarios[identifier] = Scenario(
            identifier,
            _text(row[fields[1]], "Scenarios / Sector"),
            _text(row[fields[2]], "Scenarios / Use case"),
            membrane,
            _positive(row[fields[4]], "Scenarios / Area (m²)"),
            _positive(row[fields[5]], "Scenarios / Baseline water (L/day)"),
            _number(row[fields[6]], "Scenarios / Projected water (L/day)", minimum=0),
            _text(row[fields[7]], "Scenarios / Decision"),
        )
    return scenarios


TELEMETRY_FIELDS = (
    "Record ID",
    "Timestamp",
    "Scenario ID",
    "Membrane ID",
    "External RH (%)",
    "Temperature (°C)",
    "Internal RH (%)",
    "Water flow (L/h)",
    "Area (m²)",
    "RH gradient (%)",
    "Vapor pressure Δp (kPa)",
    "Permeance index",
    "WVTR (g/m²/day)",
    "Water baseline (L/h)",
    "Water use (L/h)",
    "Water saved (L/h)",
    "Savings (%)",
    "Humidity risk",
    "Alert",
    "Health score",
)


def _readings(book: Any, scenarios: dict[str, Scenario]) -> tuple[Reading, ...]:
    result = []
    seen: set[str] = set()
    for row in _table(book, "Telemetry", TELEMETRY_FIELDS):
        identifier = _unique_id(row["Record ID"], seen, "Telemetry / Record ID")
        scenario = _text(row["Scenario ID"], "Telemetry / Scenario ID")
        membrane = _text(row["Membrane ID"], "Telemetry / Membrane ID")
        if scenario not in scenarios or scenarios[scenario].membrane_id != membrane:
            raise WorkbookError("Telemetry: scenario/sample relationship is invalid.")
        stamp = row["Timestamp"]
        if isinstance(stamp, str):
            try:
                stamp = datetime.fromisoformat(stamp)
            except ValueError:
                raise WorkbookError("Telemetry / Timestamp: invalid workbook time.") from None
        if not isinstance(stamp, datetime) or stamp.tzinfo is not None:
            raise WorkbookError(
                "Telemetry / Timestamp: expected workbook time without timezone."
            )
        severity = _text(row["Alert"], "Telemetry / Alert")
        if severity not in {"NORMAL", "WARNING", "CRITICAL"}:
            raise WorkbookError("Telemetry / Alert: unknown severity.")
        # Every required cache is checked, including valid zero-valued results.
        numeric = {
            field: _number(row[field], f"Telemetry / {field}")
            for field in TELEMETRY_FIELDS[4:]
            if field != "Alert"
        }
        for field in (
            "External RH (%)",
            "Internal RH (%)",
            "Savings (%)",
            "Humidity risk",
            "Health score",
        ):
            _percent(numeric[field], f"Telemetry / {field}")
        for field in ("Area (m²)", "Water baseline (L/h)"):
            _positive(numeric[field], f"Telemetry / {field}")
        for field in (
            "Water flow (L/h)",
            "WVTR (g/m²/day)",
            "Water use (L/h)",
            "Water saved (L/h)",
            "Permeance index",
            "Vapor pressure Δp (kPa)",
        ):
            _number(numeric[field], f"Telemetry / {field}", minimum=0)
        expected_saved = numeric["Water baseline (L/h)"] - numeric["Water use (L/h)"]
        if not isclose(
            numeric["Water saved (L/h)"], expected_saved, rel_tol=1e-8, abs_tol=1e-8
        ):
            raise WorkbookError(
                "Telemetry / Water saved (L/h): cached value disagrees with baseline "
                "minus use; "
                "recalculate in Excel."
            )
        expected_pct = 100 * expected_saved / numeric["Water baseline (L/h)"]
        if not isclose(numeric["Savings (%)"], expected_pct, rel_tol=1e-8, abs_tol=1e-8):
            raise WorkbookError(
                "Telemetry / Savings (%): cached percentage disagrees with baseline and use; "
                "recalculate in Excel."
            )
        result.append(
            Reading(
                identifier,
                stamp,
                scenario,
                membrane,
                numeric["External RH (%)"],
                numeric["Temperature (°C)"],
                numeric["Internal RH (%)"],
                numeric["Water flow (L/h)"],
                numeric["Area (m²)"],
                numeric["RH gradient (%)"],
                numeric["Vapor pressure Δp (kPa)"],
                numeric["Permeance index"],
                numeric["WVTR (g/m²/day)"],
                numeric["Water baseline (L/h)"],
                numeric["Water use (L/h)"],
                numeric["Water saved (L/h)"],
                numeric["Savings (%)"],
                numeric["Humidity risk"],
                severity,
                numeric["Health score"],
            )
        )
    return tuple(sorted(result, key=lambda item: (item.timestamp, item.record_id)))


def load_dataset(source: Path) -> Dataset:
    """Load one validated, read-only cached snapshot; never execute Excel formulas."""
    try:
        snapshot = source.read_bytes()
        book = load_workbook(BytesIO(snapshot), read_only=True, data_only=True)
        try:
            settings = _settings(book)
            samples = _samples(book)
            scenarios = _scenarios(book, samples)
            readings = _readings(book, scenarios)
            if any(classify_alert(row, settings) != row.alert for row in readings):
                raise WorkbookError(
                    "Telemetry / Alert: cached severity disagrees with operating rules."
                )
            recommendations = _recommendations(book, {row.alert for row in readings})
            materials = _materials(book, samples)
            dashboard = {
                str(row[0]): float(row[1])
                for row in book["Dashboard"].values
                if len(row) > 1 and isinstance(row[1], (int, float))
            }
            return Dataset(
                settings,
                samples,
                scenarios,
                readings,
                dashboard,
                sha256(snapshot).hexdigest(),
                recommendations,
                materials,
            )
        finally:
            book.close()
    except WorkbookError:
        logger.warning("Workbook load failed: operational table validation")
        raise
    except (OSError, BadZipFile, InvalidFileException, ParseError, KeyError, ValueError):
        logger.warning("Workbook load failed: source unavailable or invalid XLSX")
        raise WorkbookError(
            "The workbook could not be opened; check the original Excel file."
        ) from None


def _recommendations(book: Any, required: set[str]) -> dict[str, str]:
    if not required:
        return {}
    # No WARNING examples exist in the reviewed edition. Wording was checked
    # against the literal WARNING branch in Alerts!H2; no formula is executed.
    result = (
        {"WARNING": "Review membrane response and ventilation"} if "WARNING" in required else {}
    )
    for row in _table(book, "Alerts", ("Severity", "Recommended action")):
        severity = _text(row["Severity"], "Alerts / Severity")
        if severity not in {"NORMAL", "WARNING", "CRITICAL"}:
            raise WorkbookError("Alerts / Severity: unknown severity.")
        if severity not in required:
            continue
        action = _text(row["Recommended action"], "Alerts / Recommended action")
        if severity in result and result[severity] != action:
            raise WorkbookError("Alerts: conflicting recommendations need review.")
        result[severity] = action
    missing = required - result.keys()
    if missing:
        raise WorkbookError(
            f"Alerts: recommendation wording is missing for {', '.join(sorted(missing))}."
        )
    return result


MATERIAL_FIELDS = (
    "Membrane",
    "RH (%)",
    "Temp (°C)",
    "Exposed area (m²)",
    "Duration (h)",
    "Vapor Δp (kPa)",
    "Mass change (g)",
    "Dry mass (g)",
    "Hydrated mass (g)",
    "WVTR (g/m²/day)",
    "Permeance (g/m²/day/kPa)",
    "Swelling (%)",
    "Demo input flag",
)


def _materials(book: Any, samples: dict[str, Sample]) -> tuple[MaterialReading, ...]:
    result = []
    seen: set[tuple[str, float]] = set()
    for row in _table(book, "Material Calculations", MATERIAL_FIELDS):
        identifier = _text(row["Membrane"], "Material Calculations / Membrane")
        if identifier not in samples:
            raise WorkbookError("Material Calculations: sample reference is missing.")
        numbers = [
            _number(row[field], f"Material Calculations / {field}")
            for field in MATERIAL_FIELDS[1:-1]
        ]
        rh = _percent(numbers[0], "Material Calculations / RH (%)")
        if (identifier, rh) in seen:
            raise WorkbookError("Material Calculations: duplicate sample/RH condition.")
        seen.add((identifier, rh))
        try:
            expected = material_properties(
                numbers[5], numbers[2], numbers[3], numbers[4], numbers[6], numbers[7]
            )
        except ValueError:
            raise WorkbookError(
                "Material Calculations: invalid mass or denominator inputs."
            ) from None
        if any(
            not isclose(value, cached, rel_tol=1e-8, abs_tol=1e-8)
            for value, cached in zip(expected, numbers[8:11], strict=True)
        ):
            raise WorkbookError(
                "Material Calculations: cached properties need Excel recalculation."
            )
        result.append(
            MaterialReading(
                identifier,
                numbers[0],
                numbers[1],
                numbers[2],
                numbers[3],
                numbers[4],
                numbers[5],
                numbers[6],
                numbers[7],
                numbers[8],
                numbers[9],
                numbers[10],
                _text(row["Demo input flag"], "Material Calculations / provenance"),
            )
        )
    for sample in samples.values():
        if sample.membrane_id == "S7" and sample.sample_type != "Control":
            raise WorkbookError("Samples / S7: the open aperture must be a control.")
        if not any(row.membrane_id == sample.membrane_id for row in result):
            raise WorkbookError("Material Calculations: a configured sample has no conditions.")
    return tuple(result)
