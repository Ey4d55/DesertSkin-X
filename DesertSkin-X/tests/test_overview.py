"""Task 1 verification uses temporary synthetic workbooks, never a fake demo file."""

from collections.abc import Callable
from hashlib import sha256
from pathlib import Path

import pytest
from openpyxl import Workbook
from streamlit.testing.v1 import AppTest

from workbook import WorkbookError, count_operational_records

APP = Path(__file__).resolve().parents[1] / "app.py"


def test_overview_count_tracks_input(
    make_workbook: Callable[[int], Path], monkeypatch: pytest.MonkeyPatch
) -> None:
    app = AppTest.from_file(str(APP))
    for expected in (2, 5):
        path = make_workbook(expected)
        before = sha256(path.read_bytes()).hexdigest()
        monkeypatch.setenv("DESERTSKIN_WORKBOOK", str(path))
        app.run()
        assert not app.exception
        assert not app.error
        assert app.metric[2].label == "Operational records"
        assert app.metric[2].value == str(expected)
        assert any(f"{expected} operational records" in item.value for item in app.caption)
        assert any("Demo / synthetic" in item.value for item in app.markdown)
        assert sha256(path.read_bytes()).hexdigest() == before


def test_missing_configuration_has_recovery(monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.delenv("DESERTSKIN_WORKBOOK", raising=False)
    app = AppTest.from_file(str(APP)).run()
    assert not app.exception
    assert "Connect the demo workbook" in app.info[0].value
    assert not app.metric
    assert any("DESERTSKIN_WORKBOOK" in item.value for item in app.caption)


def test_failed_reload_removes_previous_count(
    make_workbook: Callable[[int], Path], monkeypatch: pytest.MonkeyPatch, tmp_path: Path
) -> None:
    monkeypatch.setenv("DESERTSKIN_WORKBOOK", str(make_workbook(3)))
    app = AppTest.from_file(str(APP)).run()
    assert app.metric[2].value == "3"
    private_path = tmp_path / "private-presenter-folder" / "missing.xlsx"
    monkeypatch.setenv("DESERTSKIN_WORKBOOK", str(private_path))
    app.run()
    assert not app.exception
    assert app.error
    assert not app.metric
    assert str(private_path) not in str(app)


def test_empty_telemetry(make_workbook: Callable[[int], Path]) -> None:
    assert count_operational_records(make_workbook(0)) == 0


@pytest.mark.parametrize("problem", ["missing_sheet", "missing_header", "invalid_id"])
def test_invalid_telemetry_reports_context(tmp_path: Path, problem: str) -> None:
    book = Workbook()
    sheet = book.active
    sheet.title = "Wrong" if problem == "missing_sheet" else "Telemetry"
    sheet.append(["Wrong" if problem == "missing_header" else "Record ID"])
    sheet.append(["=1+1" if problem == "invalid_id" else "TEST-1"])
    path = tmp_path / "invalid.xlsx"
    book.save(path)
    book.close()
    with pytest.raises(WorkbookError, match="Telemetry"):
        count_operational_records(path)


def test_corrupt_workbook_is_safe(tmp_path: Path) -> None:
    path = tmp_path / "private-name.xlsx"
    path.write_text("not an Excel archive")
    with pytest.raises(WorkbookError, match="could not be opened") as error:
        count_operational_records(path)
    assert str(path) not in str(error.value)


def test_record_id_header_is_located(tmp_path: Path) -> None:
    book = Workbook()
    sheet = book.active
    sheet.title = "Telemetry"
    sheet.append(["Other input", "record_id"])
    sheet.append(["ignored", "TEST-1"])
    path = tmp_path / "reordered.xlsx"
    book.save(path)
    book.close()
    assert count_operational_records(path) == 1
