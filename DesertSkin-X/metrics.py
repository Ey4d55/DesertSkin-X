"""Pure calculations; display formatting belongs to the interface."""

from collections.abc import Sequence
from math import fsum, isfinite

from models import MaterialReading, Reading, Settings, Summary


def summarize(readings: Sequence[Reading], time_step_h: float, scenario_count: int) -> Summary:
    return Summary(
        average_savings_pct=(
            fsum(row.water_savings_pct for row in readings) / len(readings)
            if readings
            else None
        ),
        water_saved_l=fsum(row.water_saved_lph * time_step_h for row in readings),
        record_count=len(readings),
        scenario_count=scenario_count,
    )


def select_readings(
    readings: Sequence[Reading], scenario_id: str | None
) -> tuple[Reading, ...]:
    return tuple(
        row for row in readings if scenario_id is None or row.scenario_id == scenario_id
    )


def classify_alert(row: Reading, settings: Settings) -> str:
    if (
        row.internal_rh_pct > settings.alert_rh_high_pct
        or row.temperature_c > settings.alert_temperature_high_c
    ):
        return "CRITICAL"
    return "WARNING" if row.humidity_risk > 25 else "NORMAL"


def alert_triggers(row: Reading, settings: Settings) -> tuple[str, ...]:
    reasons = []
    if row.internal_rh_pct > settings.alert_rh_high_pct:
        reasons.append(
            f"Internal RH {row.internal_rh_pct:.2f}% exceeds {settings.alert_rh_high_pct:g}%."
        )
    if row.temperature_c > settings.alert_temperature_high_c:
        reasons.append(
            f"Temperature {row.temperature_c:.2f} °C exceeds "
            f"{settings.alert_temperature_high_c:g} °C."
        )
    if not reasons and row.humidity_risk > 25:
        reasons.append(f"Humidity risk {row.humidity_risk:.2f} exceeds 25.")
    return tuple(reasons)


def alert_events(
    readings: Sequence[Reading], severity: str | None = None
) -> tuple[Reading, ...]:
    return tuple(
        row
        for row in readings
        if row.alert != "NORMAL" and (severity is None or row.alert == severity)
    )


def material_properties(
    mass_change_g: float,
    area_m2: float,
    duration_h: float,
    vapor_delta_kpa: float,
    dry_mass_g: float,
    hydrated_mass_g: float,
) -> tuple[float, float, float]:
    values = (mass_change_g, area_m2, duration_h, vapor_delta_kpa, dry_mass_g, hydrated_mass_g)
    if (
        not all(isfinite(value) for value in values)
        or min(area_m2, duration_h, vapor_delta_kpa, dry_mass_g) <= 0
        or mass_change_g < 0
        or hydrated_mass_g < dry_mass_g
    ):
        raise ValueError("Material inputs require finite values and positive denominators.")
    wvtr = mass_change_g / area_m2 / (duration_h / 24)
    return wvtr, wvtr / vapor_delta_kpa, 100 * (hydrated_mass_g - dry_mass_g) / dry_mass_g


def select_materials(
    rows: Sequence[MaterialReading], membrane_ids: Sequence[str], rh_pct: float
) -> tuple[MaterialReading, ...]:
    return tuple(
        row for row in rows if row.membrane_id in membrane_ids and row.rh_pct == rh_pct
    )
