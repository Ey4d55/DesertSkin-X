from collections.abc import Callable
from pathlib import Path

import pytest
from openpyxl import load_workbook
from streamlit.testing.v1 import AppTest

from metrics import material_properties, select_materials
from workbook import WorkbookError, load_dataset


def test_supplied_materials(demo_source: Path, monkeypatch: pytest.MonkeyPatch) -> None:
    data = load_dataset(demo_source)
    assert len(data.materials) == 24
    assert {row.rh_pct for row in data.materials} == {30, 50, 80}
    for rh in (30, 50, 80):
        assert {
            row.membrane_id for row in select_materials(data.materials, list(data.samples), rh)
        } == set(data.samples)
    first = data.materials[0]
    assert first.wvtr_g_m2_day == pytest.approx(166.424)
    assert first.permeance_g_m2_day_kpa == pytest.approx(524.9968454258674)
    assert first.swelling_pct == pytest.approx(19.5)
    monkeypatch.setenv("DESERTSKIN_WORKBOOK", str(demo_source))
    app = AppTest.from_file(Path(__file__).resolve().parents[1] / "app.py").run()
    assert set(app.multiselect(key="material_samples").options) == {f"S{i}" for i in range(7)}
    app.multiselect(key="material_samples").set_value(["S0", "S4"]).run()
    app.selectbox(key="material_rh").select(30).run()
    app.checkbox(key="include_reference").check().run()
    assert not app.exception
    tables = [table.value for table in app.dataframe]
    comparison = next(
        t for t in tables if set(t.columns) >= {"WVTR (g/m²/day)", "Swelling (%)"}
    )
    assert set(comparison["RH (%)"]) == {30}
    assert set(comparison["Sample"]) == {"S0", "S4"}
    assert any(set(t.get("Sample", [])) == {"S7"} for t in tables)
    app.multiselect(key="material_samples").set_value([]).run()
    assert any("Choose at least one" in item.value for item in app.info)


@pytest.mark.parametrize("invalid_index", [1, 2, 3, 4])
def test_material_denominators(invalid_index: int) -> None:
    values = [0.41606, 0.0025, 24.0, 0.317, 0.16, 0.1912]
    values[invalid_index] = 0
    with pytest.raises(ValueError):
        material_properties(*values)


def test_bad_material_cache(make_workbook: Callable[[int], Path]) -> None:
    source = make_workbook(2)
    book = load_workbook(source)
    book["Material Calculations"]["J2"] = 1
    book.save(source)
    book.close()
    with pytest.raises(WorkbookError, match="cached properties"):
        load_dataset(source)
