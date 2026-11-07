"""Portable local launcher. Paths are configured by the presenter, never visitors."""

import argparse
import importlib.util
import os
import subprocess
import sys
from pathlib import Path


def recovery_commands(*, windows: bool = os.name == "nt") -> tuple[str, str, str]:
    """ASCII-only setup commands to run from the project directory."""
    if windows:
        return (
            "py -3.12 -m venv .venv",
            r".\.venv\Scripts\python.exe -m pip install -r requirements.txt",
            r".\.venv\Scripts\python.exe run_demo.py",
        )
    return (
        "python3.12 -m venv .venv",
        ".venv/bin/python -m pip install -r requirements.txt",
        ".venv/bin/python run_demo.py",
    )


def main() -> int:
    root = Path(__file__).resolve().parent
    parser = argparse.ArgumentParser(description="Start the local DesertSkin-X demo.")
    parser.add_argument(
        "--workbook", type=Path, default=None, help="Trusted local Excel workbook"
    )
    options = parser.parse_args()
    configured = os.environ.get("DESERTSKIN_WORKBOOK", "").strip()
    source = options.workbook or (
        Path(configured)
        if configured
        else root / "data" / "DesertSkin_X_Platform_Demo_Workbook.xlsx"
    )
    if not source.is_file():
        print(
            "Workbook unavailable. Use --workbook with the original Excel file's local path.",
            file=sys.stderr,
        )
        return 2
    missing = [
        module
        for module in ("streamlit", "openpyxl", "altair")
        if importlib.util.find_spec(module) is None
    ]
    if missing:
        print(
            f"Missing packages in this Python environment: {', '.join(missing)}.",
            file=sys.stderr,
        )
        print(
            "Open a terminal in the project directory (the folder containing run_demo.py).",
            file=sys.stderr,
        )
        print(
            "Create or use its Python 3.12 environment, then install and retry:",
            file=sys.stderr,
        )
        for command in recovery_commands():
            print(command, file=sys.stderr)
        print(
            "Repeat any --workbook option you supplied when retrying; otherwise the bundled "
            "workbook or DESERTSKIN_WORKBOOK is used.",
            file=sys.stderr,
        )
        print(
            "The preview is unavailable until the terminal reports that the server started.",
            file=sys.stderr,
        )
        return 3
    environment = dict(os.environ, DESERTSKIN_WORKBOOK=str(source.resolve()))
    try:
        return subprocess.run(
            [
                sys.executable,
                "-m",
                "streamlit",
                "run",
                str(root / "app.py"),
                "--server.address",
                "127.0.0.1",
            ],
            cwd=root,
            env=environment,
            check=False,
        ).returncode
    except KeyboardInterrupt:
        return 0


if __name__ == "__main__":
    raise SystemExit(main())
