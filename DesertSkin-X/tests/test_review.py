"""Regressions from the management review: startup, accounting and empty views."""

import os
import shutil
import subprocess
import sys
from collections.abc import Callable
from pathlib import Path

import pytest
from openpyxl import load_workbook
from streamlit.testing.v1 import AppTest

from run_demo import recovery_commands
from workbook import WorkbookError, load_dataset

ROOT = Path(__file__).resolve().parents[1]


def test_launcher_recovery_is_copyable_from_arabic_project_path(
    tmp_path: Path, make_workbook: Callable[[int], Path]
) -> None:
    project = tmp_path / "هاكاثون العرض" / "DesertSkin-X"
    (project / "data").mkdir(parents=True)
    for filename in ("run_demo.py", "requirements.txt"):
        shutil.copyfile(ROOT / filename, project / filename)
    shutil.copyfile(
        make_workbook(1), project / "data" / "DesertSkin_X_Platform_Demo_Workbook.xlsx"
    )
    environment = project / ".venv"
    subprocess.run([sys.executable, "-m", "venv", str(environment)], check=True)
    interpreter = environment / ("Scripts/python.exe" if os.name == "nt" else "bin/python")
    result = subprocess.run(
        [str(interpreter), str(project / "run_demo.py")],
        cwd=tmp_path,
        env=dict(os.environ, PYTHONIOENCODING="ascii:backslashreplace"),
        capture_output=True,
        text=True,
        check=False,
    )
    assert result.returncode == 3
    assert "streamlit, openpyxl, altair" in result.stderr
    for command in recovery_commands():
        assert command in result.stderr
    assert "project directory" in result.stderr
    assert result.stderr.isascii()
    assert "\\u" not in result.stderr
    assert str(project) not in result.stderr
    assert str(interpreter) not in result.stderr
    assert "No module named" not in result.stderr
    assert "Traceback" not in result.stderr


@pytest.mark.parametrize("windows", [True, False])
def test_recovery_commands_are_relative_and_ascii(windows: bool) -> None:
    create, install, retry = recovery_commands(windows=windows)
    assert all(command.isascii() for command in (create, install, retry))
    assert create == ("py -3.12 -m venv .venv" if windows else "python3.12 -m venv .venv")
    interpreter = r".\.venv\Scripts\python.exe" if windows else ".venv/bin/python"
    assert install == f"{interpreter} -m pip install -r requirements.txt"
    assert retry == f"{interpreter} run_demo.py"


@pytest.mark.parametrize(
    ("cell", "value", "message"),
    [
        ("P2", 0.2, "baseline minus use"),
        ("Q2", 20, "cached percentage"),
        ("N2", 2, "baseline minus use"),
        ("O2", 0.7, "baseline minus use"),
    ],
)
def test_plausible_but_inconsistent_savings_are_rejected(
    make_workbook: Callable[[int], Path],
    cell: str,
    value: float,
    message: str,
) -> None:
    source = make_workbook(1)
    book = load_workbook(source)
    book["Telemetry"][cell] = value
    book.save(source)
    book.close()
    with pytest.raises(WorkbookError, match=message):
        load_dataset(source)


@pytest.mark.parametrize(("saved", "use", "percentage"), [(0.2, 0.8, 20), (0, 1, 0)])
def test_consistent_updated_savings_and_valid_zeros_load(
    make_workbook: Callable[[int], Path],
    saved: float,
    use: float,
    percentage: float,
) -> None:
    source = make_workbook(1)
    book = load_workbook(source)
    for cell, value in [("P2", saved), ("O2", use), ("Q2", percentage)]:
        book["Telemetry"][cell] = value
    book.save(source)
    book.close()
    assert load_dataset(source).readings[0].water_savings_pct == percentage


def test_inconsistent_reload_clears_previous_dashboard(
    make_workbook: Callable[[int], Path],
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    source = make_workbook(1)
    monkeypatch.setenv("DESERTSKIN_WORKBOOK", str(source))
    app = AppTest.from_file(ROOT / "app.py").run()
    assert app.metric[0].value == "10.00%"
    book = load_workbook(source)
    book["Telemetry"]["P2"] = 0.2
    book.save(source)
    book.close()
    app.run()
    assert not app.exception
    assert "baseline minus use" in app.error[0].value
    assert not app.metric


@pytest.mark.parametrize("unused_example", ["absent", "blank"])
def test_all_normal_data_needs_no_critical_example(
    make_workbook: Callable[[int], Path],
    monkeypatch: pytest.MonkeyPatch,
    unused_example: str,
) -> None:
    source = make_workbook(1)
    book = load_workbook(source)
    if unused_example == "absent":
        book["Alerts"].delete_rows(3)
    else:
        book["Alerts"]["B3"] = None
    book.save(source)
    book.close()
    data = load_dataset(source)
    assert "CRITICAL" not in data.recommendations
    monkeypatch.setenv("DESERTSKIN_WORKBOOK", str(source))
    app = AppTest.from_file(ROOT / "app.py").run()
    assert not app.exception
    assert not app.error
    assert any("No matching alerts" in item.value for item in app.success)


def test_occurring_severity_requires_recommendation(
    make_workbook: Callable[[int], Path],
) -> None:
    source = make_workbook(1)
    book = load_workbook(source)
    book["Alerts"].delete_rows(3)
    book["Telemetry"]["F2"] = 40
    book["Telemetry"]["S2"] = "CRITICAL"
    book.save(source)
    book.close()
    with pytest.raises(WorkbookError, match="missing for CRITICAL"):
        load_dataset(source)


@pytest.mark.parametrize("count", [0, 1])
def test_material_library_remains_accessible_without_telemetry(
    make_workbook: Callable[[int], Path],
    monkeypatch: pytest.MonkeyPatch,
    count: int,
) -> None:
    monkeypatch.setenv("DESERTSKIN_WORKBOOK", str(make_workbook(count)))
    app = AppTest.from_file(ROOT / "app.py").run()
    app.selectbox(key="scenario_selection").select("TEST-C2").run()
    assert not app.exception
    assert [item.value for item in app.metric] == ["—", "0.00 L", "0", "1"]
    assert [tab.label for tab in app.tabs][-1] == "Material library"
    assert app.multiselect(key="material_samples").options == ["S0"]
    assert any("Trends are unavailable" in item.value for item in app.info)
    assert any("No matching alerts" in item.value for item in app.success)
    properties = next(
        table.value for table in app.dataframe if "WVTR (g/m²/day)" in table.value.columns
    )
    assert len(properties) == 1
