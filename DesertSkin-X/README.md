# DesertSkin-X

A local, read-only presentation platform for humidity-responsive membranes and
modeled water efficiency. The MVP includes the workbook overview, eight scenario
views, RH/temperature trends, a complete alert feed and matched-RH material
comparisons. The interface uses a sand / forest-green theme and a conceptual
bilayer illustration. Every view carries the demo/synthetic provenance.

## Start the demo

Use **Python 3.12**. Extract the release ZIP and open a terminal in its
`DesertSkin-X` directory. The package includes the original reviewed workbook
under `data/`; no operating data is invented by the application.

The ZIP's application directory is `DesertSkin-X`. After Windows extraction into
`DesertSkin-X_MVP`, open the **inner** `DesertSkin-X` folder. `run_demo.py`,
`app.py`, `requirements.txt` and `data/` must be together in that folder. The
launcher finds its default workbook relative to its own file location.

Windows / PowerShell:

```powershell
py -3.12 -m venv .venv
.\.venv\Scripts\python.exe -m pip install -r requirements.txt
.\.venv\Scripts\python.exe run_demo.py
```

macOS / Linux:

```bash
python3.12 -m venv .venv
.venv/bin/python -m pip install -r requirements.txt
.venv/bin/python run_demo.py
```

Open **http://127.0.0.1:8501** in your browser. Stop the server with Ctrl+C.
There are no accounts, external APIs, sensor feeds or actuator controls.

If the browser says **“This site can’t be reached”**, first check the terminal.
`No module named streamlit` means that interpreter has no Streamlit installation,
so no server started. Install with the same `.venv` interpreter shown above;
installing into a different Python environment will not fix that launch.
The launcher checks Streamlit, openpyxl and Altair before starting and prints
ASCII-only setup/retry commands using project-relative `.venv` paths. Run them
from the folder containing `run_demo.py`. The project can stay in its Arabic-named
directory, including spaces; no absolute folder or interpreter path is printed.
If you supplied `--workbook`, repeat that option when retrying. No packages are
installed automatically. Keep the terminal running while you test the page.

`127.0.0.1` refers to the machine running your browser. A server running in a remote
workspace does not provide a working localhost link to a separate browser on your
Windows machine. For a local preview there, run these setup/start commands on that
same machine. Windows laptop verification is still required.

The launcher selects, in order: `--workbook <local-path>`, the operator's
`DESERTSKIN_WORKBOOK` environment variable, or the bundled workbook. Paths are
never visitor inputs. An unavailable source yields a recovery instruction.
The launcher changes to the project directory so its local server/theme config
is used even when invoked from another directory. Keep the server on loopback.

For example, to use a trusted copy elsewhere:

```powershell
.venv\Scripts\python run_demo.py --workbook 'C:\your-folder\DesertSkin_X_Platform_Demo_Workbook.xlsx'
```

When running `streamlit run app.py` directly, configure `DESERTSKIN_WORKBOOK`
yourself and run from the project directory. Source inputs are read-only;
formulas are never executed. A changed workbook needs Excel recalculation and
reconciliation before presentation. Restart after changing source or code;
file watching is deliberately disabled for a stable demo.

## Presenter walkthrough

1. Confirm **15.12%**, **72.64 L**, **168 records**, and **8 scenarios**.
2. Select **C05 Storage** in the sidebar: 21 records, 16.39%, and 4.30 L.
3. Open **Alerts** and inspect **T0005**. Temperature 38.59 °C exceeds 38 °C;
   internal RH is 60.47% and humidity risk is zero. Five C05 alerts are critical.
4. Open **Material library**, compare **S4** and **S0** at the same RH, and
   optionally show **S7**, the open-aperture reference with no membrane.
5. Switch to **C03 Packaging** to demonstrate sector coverage, then reset.

All charts use workbook time with timezone unspecified. Each reading represents
one modeled hour; the eight-hour spacing within a scenario is not its integration
interval. Average savings is an unweighted mean of percentages. Total saved water
is the sum of hourly saved rates times the configured time step. Scenario daily
projections and material-sheet properties are separate models.

The original workbook's Formula Guide has descriptive `#NAME?` cells. The app
uses validated operational caches instead. Alerts come from all 168 telemetry
rows; the 32-row Alerts sheet supplies recommendation wording. See
[ARCHITECTURE.md](ARCHITECTURE.md) for the numerical contract.

## Verification

Install the tested development environment with `requirements-lock.txt` (full
pinned environment), or use `requirements-dev.txt` for direct development pins.
Then run:

```powershell
.venv\Scripts\python -m pytest -q
.venv\Scripts\python -m ruff check app.py workbook.py metrics.py models.py charts.py materials_view.py run_demo.py tests
.venv\Scripts\python -m ruff format --check app.py workbook.py metrics.py models.py charts.py materials_view.py run_demo.py tests
.venv\Scripts\python -m mypy
.venv\Scripts\python -m pip check
```

Use `.venv/bin/python` on macOS/Linux. Tests include small temporary fixtures and
the bundled real edition. If the real file is absent, integration tests explicitly
skip; that is not a real-workbook acceptance pass. Current results and the source
fingerprint are in [RELEASE.md](RELEASE.md).

## Prepare for an offline event

Complete installation and the walkthrough on the actual demo laptop before the
event. The running application uses local files and assets. To retain installation
packages for offline recovery, run this on that laptop while online:

```powershell
.venv\Scripts\python -m pip download -r requirements-lock.txt -d wheelhouse
```

Install those packages later with `pip install --no-index --find-links wheelhouse
-r requirements-lock.txt`. A wheelhouse is specific to the laptop's OS and Python
version; it is not included in the source release. Test a clean restart with the
laptop's external network disconnected while keeping loopback available.
