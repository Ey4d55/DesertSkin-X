from collections.abc import Callable
from dataclasses import replace
from hashlib import sha256
from pathlib import Path

import pytest
from openpyxl import load_workbook
from streamlit.testing.v1 import AppTest

from metrics import summarize
from workbook import WorkbookError, load_dataset


def test_supplied_overview_reconciles(
    demo_source: Path, monkeypatch: pytest.MonkeyPatch
) -> None:
    before = sha256(demo_source.read_bytes()).hexdigest()
    data = load_dataset(demo_source)
    summary = summarize(data.readings, data.settings.time_step_h, len(data.scenarios))
    assert summary.record_count == data.dashboard["Total records"] == 168
    assert summary.scenario_count == data.dashboard["Active scenarios"] == 8
    assert summary.average_savings_pct == pytest.approx(data.dashboard["Avg water savings"])
    assert summary.water_saved_l == pytest.approx(data.dashboard["Total water saved"])
    assert summary.average_savings_pct == pytest.approx(15.121282238095239)
    assert summary.water_saved_l == pytest.approx(72.63730153416667)
    for row in data.readings:
        baseline = data.scenarios[row.scenario_id].baseline_water_l_day / 24
        fraction = min(
            0.55,
            abs(row.external_rh_pct - row.internal_rh_pct)
            / 100
            * data.samples[row.membrane_id].control_effectiveness
            * data.settings.control_efficiency,
        )
        assert row.water_baseline_lph == pytest.approx(baseline)
        assert row.water_saved_lph == pytest.approx(baseline * fraction)
        assert row.water_savings_pct == pytest.approx(fraction * 100)
        risk = min(
            100,
            max(
                0,
                (row.internal_rh_pct - data.settings.target_rh_upper_pct) * 2.5
                + max(0, row.temperature_c - data.settings.alert_temperature_high_c) * 2,
            ),
        )
        assert row.humidity_risk == pytest.approx(risk)
    monkeypatch.setenv("DESERTSKIN_WORKBOOK", str(demo_source))
    app = AppTest.from_file(Path(__file__).resolve().parents[1] / "app.py").run()
    assert not app.exception
    assert [item.value for item in app.metric] == ["15.12%", "72.64 L", "168", "8"]
    assert (
        data.fingerprint
        == before
        == "1a00e092329cbdeab485f6a89f3ace3ceb2eda8936d0700aa00799c5e9092519"
    )
    assert sha256(demo_source.read_bytes()).hexdigest() == before


def test_mean_percentages_is_not_weighted(make_workbook: Callable[[int], Path]) -> None:
    data = load_dataset(make_workbook(2))
    summary = summarize(data.readings, 1, 2)
    assert summary.average_savings_pct == 30  # (10% + 50%) / 2
    assert summary.water_saved_l == pytest.approx(4.6)
    assert summary.average_savings_pct != pytest.approx(4.6 / 10 * 100)
    zero = replace(data.readings[0], water_savings_pct=0, water_saved_lph=0)
    assert summarize([zero, data.readings[1]], 1, 2).average_savings_pct == 25
    assert summarize([], 1, 2).average_savings_pct is None
    assert summarize(data.readings, 0.5, 2).water_saved_l == pytest.approx(2.3)


@pytest.mark.parametrize(
    ("sheet", "cell", "value"),
    [
        ("Telemetry", "A3", "TEST-1"),
        ("Telemetry", "Q2", None),
        ("Telemetry", "Q2", "#VALUE!"),
        ("Telemetry", "E2", 101),
        ("Telemetry", "C2", "MISSING"),
        ("Telemetry", "D2", "WRONG"),
        ("Settings", "B6", 0),
        ("Scenarios", "F2", 0),
        ("Samples", "A3", "S0"),
    ],
)
def test_invalid_operational_inputs(
    make_workbook: Callable[[int], Path], sheet: str, cell: str, value: object
) -> None:
    source = make_workbook(2)
    book = load_workbook(source)
    book[sheet][cell] = value
    book.save(source)
    book.close()
    with pytest.raises(WorkbookError):
        load_dataset(source)
