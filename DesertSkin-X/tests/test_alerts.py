from dataclasses import replace
from pathlib import Path

import pytest
from streamlit.testing.v1 import AppTest

from metrics import alert_events, alert_triggers, classify_alert, select_readings
from workbook import load_dataset


def test_full_alert_feed(demo_source: Path, monkeypatch: pytest.MonkeyPatch) -> None:
    data = load_dataset(demo_source)
    assert (
        len(alert_events(data.readings, "CRITICAL")) == data.dashboard["Critical alerts"] == 16
    )
    assert len(alert_events(data.readings, "WARNING")) == data.dashboard["Warning alerts"] == 0
    assert len(alert_events(select_readings(data.readings, "C05"))) == 5
    assert (
        max(row.timestamp for row in alert_events(data.readings)) > data.readings[32].timestamp
    )
    t5 = next(row for row in data.readings if row.record_id == "T0005")
    assert t5.humidity_risk == 0
    assert alert_triggers(t5, data.settings) == ("Temperature 38.59 °C exceeds 38 °C.",)
    monkeypatch.setenv("DESERTSKIN_WORKBOOK", str(demo_source))
    app = AppTest.from_file(Path(__file__).resolve().parents[1] / "app.py").run()
    app.selectbox(key="scenario_selection").select("C05").run()
    app.selectbox(key="alert_record").select("T0005").run()
    assert not app.exception
    assert any("Temperature 38.59 °C exceeds 38 °C" in item.value for item in app.text)
    assert any("verify sensors" in item.value for item in app.text)
    events = next(table.value for table in app.dataframe if "Severity" in table.value.columns)
    assert len(events) == 5
    app.selectbox(key="alert_severity").select("WARNING").run()
    assert not app.exception
    assert "No matching alerts" in app.success[0].value


@pytest.mark.parametrize(
    ("rh", "temperature", "risk", "expected"),
    [
        (75, 38, 25, "NORMAL"),
        (75.01, 38, 0, "CRITICAL"),
        (55, 38.01, 0, "CRITICAL"),
        (70, 30, 25.01, "WARNING"),
        (80, 40, 50, "CRITICAL"),
    ],
)
def test_alert_boundaries(
    demo_source: Path, rh: float, temperature: float, risk: float, expected: str
) -> None:
    data = load_dataset(demo_source)
    row = replace(
        data.readings[0], internal_rh_pct=rh, temperature_c=temperature, humidity_risk=risk
    )
    assert classify_alert(row, data.settings) == expected
    assert bool(alert_triggers(row, data.settings)) == (expected != "NORMAL")
