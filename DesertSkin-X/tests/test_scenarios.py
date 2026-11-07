from pathlib import Path

import pytest
from streamlit.testing.v1 import AppTest

from charts import humidity_chart, temperature_chart
from metrics import select_readings, summarize
from workbook import load_dataset


def test_scenario_journey(demo_source: Path, monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.setenv("DESERTSKIN_WORKBOOK", str(demo_source))
    app = AppTest.from_file(Path(__file__).resolve().parents[1] / "app.py").run()
    assert len(app.selectbox(key="scenario_selection").options) == 9
    app.selectbox(key="scenario_selection").select("C05").run()
    assert not app.exception
    assert [item.value for item in app.metric] == ["16.39%", "4.30 L", "21", "1"]
    assert len(app.dataframe[0].value) == 21
    assert set(app.dataframe[0].value["Scenario"]) == {"C05"}
    app.selectbox(key="scenario_selection").select("C03").run()
    assert not app.exception
    assert len(app.dataframe[0].value) == 21
    assert set(app.dataframe[0].value["Scenario"]) == {"C03"}
    app.button[0].click().run()
    assert [item.value for item in app.metric] == ["15.12%", "72.64 L", "168", "8"]
    assert len(app.dataframe[0].value) == 168


def test_chart_grouping_and_operating_band(demo_source: Path) -> None:
    data = load_dataset(demo_source)
    humidity = humidity_chart(data.readings, data.settings).to_dict()
    temp = temperature_chart(data.readings, data.settings).to_dict()
    assert humidity["layer"][1]["encoding"]["detail"]["field"] == "scenario"
    assert temp["layer"][0]["encoding"]["detail"]["field"] == "scenario"
    assert humidity["layer"][0]["data"]["values"] == [{"lower": 45, "upper": 65}]
    assert temp["layer"][1]["data"]["values"] == [{"limit": 38}]
    scoped = select_readings(data.readings, "C05")
    assert round(summarize(scoped, 1, 1).water_saved_l, 2) == 4.30
    assert select_readings(data.readings, "MISSING") == ()
