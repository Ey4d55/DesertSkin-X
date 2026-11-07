"""Small typed records shared by the reader, calculations and interface."""

from dataclasses import dataclass
from datetime import datetime


@dataclass(frozen=True)
class Settings:
    target_rh_lower_pct: float
    target_rh_upper_pct: float
    alert_rh_high_pct: float
    alert_temperature_high_c: float
    time_step_h: float
    control_efficiency: float


@dataclass(frozen=True)
class Sample:
    membrane_id: str
    formulation: str
    sample_type: str
    control_effectiveness: float
    permeance_factor: float
    validation: str


@dataclass(frozen=True)
class Scenario:
    scenario_id: str
    sector: str
    use_case: str
    membrane_id: str
    area_m2: float
    baseline_water_l_day: float
    projected_water_l_day: float
    decision: str


@dataclass(frozen=True)
class Reading:
    record_id: str
    timestamp: datetime
    scenario_id: str
    membrane_id: str
    external_rh_pct: float
    temperature_c: float
    internal_rh_pct: float
    water_flow_lph: float
    area_m2: float
    rh_gradient_pct: float
    vapor_pressure_delta_kpa: float
    permeance_index: float
    wvtr_g_m2_day: float
    water_baseline_lph: float
    water_use_lph: float
    water_saved_lph: float
    water_savings_pct: float
    humidity_risk: float
    alert: str
    health_score: float


@dataclass(frozen=True)
class MaterialReading:
    membrane_id: str
    rh_pct: float
    temperature_c: float
    area_m2: float
    duration_h: float
    vapor_delta_kpa: float
    mass_change_g: float
    dry_mass_g: float
    hydrated_mass_g: float
    wvtr_g_m2_day: float
    permeance_g_m2_day_kpa: float
    swelling_pct: float
    provenance: str


@dataclass(frozen=True)
class Dataset:
    settings: Settings
    samples: dict[str, Sample]
    scenarios: dict[str, Scenario]
    readings: tuple[Reading, ...]
    dashboard: dict[str, float]
    fingerprint: str
    recommendations: dict[str, str]
    materials: tuple[MaterialReading, ...]


@dataclass(frozen=True)
class Summary:
    average_savings_pct: float | None
    water_saved_l: float
    record_count: int
    scenario_count: int
