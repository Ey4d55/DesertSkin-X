"""Release checks distinguish backend-offline checks from browser rehearsals."""

import socket
import subprocess
import sys
import tomllib
from pathlib import Path
from typing import Any

import pytest
from streamlit.testing.v1 import AppTest

ROOT = Path(__file__).resolve().parents[1]


def test_journey_without_network(demo_source: Path, monkeypatch: pytest.MonkeyPatch) -> None:
    def deny_network(*args: Any, **kwargs: Any) -> None:
        raise AssertionError("The local MVP must not initiate network connections")

    monkeypatch.setattr(socket.socket, "connect", deny_network)
    monkeypatch.setattr(socket.socket, "connect_ex", deny_network)
    monkeypatch.setattr(socket, "create_connection", deny_network)
    monkeypatch.setenv("DESERTSKIN_WORKBOOK", str(demo_source))
    app = AppTest.from_file(ROOT / "app.py").run()
    assert not app.exception
    assert [item.value for item in app.metric] == ["15.12%", "72.64 L", "168", "8"]
    app.selectbox(key="scenario_selection").select("C05").run()
    app.selectbox(key="alert_record").select("T0005").run()
    app.multiselect(key="material_samples").set_value(["S4", "S0"]).run()
    app.checkbox(key="include_reference").check().run()
    assert not app.exception
    app.button[0].click().run()
    assert [item.value for item in app.metric] == ["15.12%", "72.64 L", "168", "8"]
    # A new instance represents a clean session, without previous widget state.
    restarted = AppTest.from_file(ROOT / "app.py").run()
    assert not restarted.exception
    assert restarted.selectbox(key="scenario_selection").value == "All scenarios"
    assert restarted.metric[1].value == "72.64 L"


def test_local_server_boundaries() -> None:
    config = tomllib.loads((ROOT / ".streamlit" / "config.toml").read_text())
    assert config["server"]["address"] == "127.0.0.1"
    assert config["server"]["enableCORS"] is True
    assert config["server"]["enableXsrfProtection"] is True
    assert config["server"]["enableStaticServing"] is False
    assert config["browser"]["gatherUsageStats"] is False


def test_launcher_missing_source_is_actionable(tmp_path: Path) -> None:
    result = subprocess.run(
        [
            sys.executable,
            str(ROOT / "run_demo.py"),
            "--workbook",
            str(tmp_path / "private.xlsx"),
        ],
        capture_output=True,
        text=True,
        check=False,
    )
    assert result.returncode == 2
    assert "--workbook" in result.stderr
    assert str(tmp_path) not in result.stderr
