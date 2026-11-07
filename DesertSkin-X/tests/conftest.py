"""Synthetic fixtures stay in temporary directories; real-edition tests are explicit."""

from collections.abc import Callable
from pathlib import Path

import pytest
from openpyxl import Workbook
from openpyxl.styles import Font

from workbook import MATERIAL_FIELDS, TELEMETRY_FIELDS


def write_fixture(path: Path, count: int) -> Path:
    book = Workbook()
    sheet = book.active
    sheet.title = "Telemetry"
    sheet.append(TELEMETRY_FIELDS)
    for index in range(count):
        first = index % 2 == 0
        baseline = 1 if first else 9
        savings = 10 if first else 50
        saved = baseline * savings / 100
        sheet.append(
            [
                f"TEST-{index + 1}",
                f"2026-01-01 {index // 60:02}:{index % 60:02}",
                "TEST-C1" if first else "TEST-C2",
                "S0",
                70,
                25,
                55,
                baseline,
                1,
                15,
                0.4755,
                1,
                190.2,
                baseline,
                baseline - saved,
                saved,
                savings,
                0,
                "NORMAL",
                100,
            ]
        )
    sheet.append([None] * 20)
    sheet.cell(count + 20, 1).font = Font(bold=True)
    settings = book.create_sheet("Settings")
    settings.append(["Parameter", "Value"])
    for item in [
        ("Target RH lower", 45),
        ("Target RH upper", 65),
        ("Alert RH high", 75),
        ("Alert temperature high", 38),
        ("Time step", 1),
        ("Control efficiency", 0.82),
    ]:
        settings.append(item)
    samples = book.create_sheet("Samples")
    samples.append(
        [
            "Sample ID",
            "Formulation",
            "Type",
            "Control effectiveness",
            "Permeance factor",
            "Validation",
        ]
    )
    samples.append(["S0", "Test formulation", "Aerogel", 0.62, 1.25, "TEST ASSUMPTION"])
    scenarios = book.create_sheet("Scenarios")
    scenarios.append(
        [
            "Scenario ID",
            "Sector",
            "Use case",
            "Membrane ID",
            "Area (m²)",
            "Baseline water (L/day)",
            "Projected water (L/day)",
            "Decision",
        ]
    )
    scenarios.append(["TEST-C1", "Agriculture", "Fixture one", "S0", 1, 24, 21.6, "NORMAL"])
    scenarios.append(["TEST-C2", "Storage", "Fixture two", "S0", 1, 216, 108, "NORMAL"])
    dashboard = book.create_sheet("Dashboard")
    dashboard.append(["Metric", "Value"])
    dashboard.append(["Total records", count])
    dashboard.append(["Active scenarios", 2])
    alerts = book.create_sheet("Alerts")
    alerts.append(["Severity", "Recommended action"])
    alerts.append(["NORMAL", "Continue monitoring"])
    alerts.append(["CRITICAL", "Inspect moisture and thermal load; verify sensors"])
    materials = book.create_sheet("Material Calculations")
    materials.append(MATERIAL_FIELDS)
    materials.append(
        [
            "S0",
            30,
            25,
            0.0025,
            24,
            0.317,
            0.41606,
            0.16,
            0.1912,
            166.424,
            166.424 / 0.317,
            19.5,
            "TEST INPUT",
        ]
    )
    book.save(path)
    book.close()
    return path


@pytest.fixture
def make_workbook(tmp_path: Path) -> Callable[[int], Path]:
    return lambda count: write_fixture(tmp_path / f"fixture-{count}.xlsx", count)


@pytest.fixture(scope="session")
def demo_source() -> Path:
    root = Path(__file__).resolve().parents[1]
    for source in (
        root / "data" / "DesertSkin_X_Platform_Demo_Workbook.xlsx",
        root / "project_sources" / "06-DesertSkin_X_Platform_Demo_Workbook.xlsx",
    ):
        if source.is_file():
            return source
    pytest.skip("Supplied demo edition not installed; fixture tests still run")
