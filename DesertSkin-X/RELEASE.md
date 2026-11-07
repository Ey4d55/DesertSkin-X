# DesertSkin-X MVP release candidate

Updated November 8, 2026. Scope: local, read-only, English presentation platform.
No public deployment or sensor integration was performed.

## Data edition

`data/DesertSkin_X_Platform_Demo_Workbook.xlsx`

SHA-256: `1a00e092329cbdeab485f6a89f3ace3ceb2eda8936d0700aa00799c5e9092519`.
The bundled copy is byte-for-byte identical to the supplied workbook. Its 168
records are synthetic. S0–S6 are physical formulations; S7 is a reference.
The profile and three posters informed presentation and claim wording; their
percentages and different units do not enter any dashboard calculation.

## Automated verification

- Python 3.12.14, Streamlit 1.67.0, openpyxl 3.1.5, Altair 6.3.0.
- `python -m pytest -q`: **52 passed**, including real-edition integration tests.
- Ruff lint and format checks: passed. Strict mypy: passed (15 source files).
- `python -m pip check`: no broken requirements.
- The 30-file source archive was extracted into a clean directory; its test suite
  also passed all 52 tests using the bundled real workbook. Archive integrity,
  source fingerprint and documentation links passed verification.
- Global KPI reconciliation: 15.12%, 72.64 L, 168 records, eight scenarios.
- Per-reading baseline, savings and operational risk independently reconciled.
- C05: 21 readings, 16.39%, 4.30 L, five critical readings. Overall: 16 critical,
  zero warning. T0005 explains the temperature trigger with humidity risk zero.
- All 24 material rows reconcile against their gravimetric inputs. Missing caches,
  bad joins, duplicate IDs, invalid denominators, severity disagreement and stale
  property caches are rejected. Failure reloads remove previous metrics.
- A full AppTest presenter journey and clean new session pass with outbound socket
  connections blocked in the backend. This is distinct from a hardware/network
  rehearsal on the owner's laptop.
- Startup health was verified on loopback. The launcher explicitly binds
  127.0.0.1; CORS and XSRF protections remain enabled, static directory serving is
  disabled, and usage telemetry is disabled.

## Browser verification

The initial isolated-browser connection failed. Starting the server from the
native desktop terminal resolved the connection boundary, without exposing a
public listener. The Chromium browser then displayed the real workbook.

Visually reviewed the overview, C05 RH/temperature trends, T0005 trigger and
recommendation, material comparisons and the separately labeled S7 reference.
C03 selection worked with keyboard arrows and Enter; reset restored global
counts. Restarting through `run_demo.py` restored the original overview values.
Starting with a deliberately unavailable source displayed a friendly recovery
message and no metrics or charts; restarting with the bundled workbook restored
the normal overview.
At an effective compact viewport (200% browser zoom), the sidebar collapsed,
metric cards stacked with full values, and the operational table remained in its
scrollable container. Corrected truncated metric values and ambiguous day-axis
labels found during this review. Browser device emulation is unavailable by
organization policy; no device-specific test is claimed.

## Remaining event check

The implementation and available verification are complete. Rehearse the packaged
release on the actual presentation laptop, including installation and a restart
with its external network disconnected. Windows/macOS installation and physical
mobile devices have not been tested here. The release contains source, pinned
dependencies and the data file, not a bundled Python interpreter or cross-platform
wheelhouse. No scientific validation of performance is implied.

## Management review fixes

The launcher checks runtime dependencies and prints ASCII-only, project-relative
`.venv` setup/retry commands rather than embedding absolute interpreter paths. A new clean
venv reproduced missing packages without a traceback. A second fresh Python 3.12
Linux environment installed `requirements.txt`, started the launcher from another
directory and returned healthy HTTP 200 responses; AppTest and the restarted
in-app browser showed the expected real-workbook KPIs. These are Linux checks,
not verification on the reviewer's Windows interpreter or presentation laptop.

Savings caches now reconcile against baseline minus use and their percentage
ratio at load time. Regression tests cover plausible inconsistent values, valid
changes/zeros, and clearing stale results after a failed reload. All-normal
workbooks can omit unused critical recommendations. Empty scenarios and entirely
empty telemetry retain access to the independently sourced material library.

## Unicode recovery-command follow-up

The November 8 Windows review observed escaped Arabic characters in captured
recovery commands. Commands now contain only relative ASCII paths and must run
from the project directory. Regression coverage uses an Arabic-named project and
virtual environment plus ASCII/backslash-replacement output capture; no absolute
paths or literal Unicode escapes occur. Both Windows and POSIX templates are
checked. Actual Windows PowerShell execution and successful launch on the
presentation laptop remain pending; no such verification is claimed here.

## Launcher identity and transfer check

The fixed `run_demo.py` has SHA-256:

`8f7d8d9b0d7e24383b4c1951b40127df4c97d9e798c46e3cb10b0d2beb6bc6a2`.

The launcher in this source package is byte-identical to the working source.
The Windows copy reported by the reviewer has a different hash:
`d874574c7f3f28393117ccd52b137e974d09795f99b5d6ac3850e1f18eef8056`.
That copy does not contain the current correction. Updating a downloadable file
does not modify an already downloaded ZIP or an extracted Windows directory.

After replacing the launcher, run this from the folder containing it:

```powershell
Get-FileHash .\run_demo.py -Algorithm SHA256
```

It must match the fixed hash above before retesting. To update the adjacent ZIP
after correcting the extracted folder, run from the parent directory containing
`DesertSkin-X_MVP`:

```powershell
Compress-Archive -Path .\DesertSkin-X_MVP\DesertSkin-X -DestinationPath .\DesertSkin-X_MVP.zip -Force
```

This session cannot write to the separate Windows filesystem. Windows-side
replacement and PowerShell execution must be verified by the reviewer there.

## Complete-package fresh-extraction check — November 8, 2026

The reviewer confirmed that the corrected standalone launcher prints ASCII-only
recovery commands on Windows. Their loose copy was placed above the application
directory, while their nested launcher and ZIP still contained the earlier file.

The complete ZIP here contains the corrected launcher under `DesertSkin-X/`,
alongside `app.py`, `requirements.txt` and `data/`. Its launcher SHA remains
`8f7d8d9b0d7e24383b4c1951b40127df4c97d9e798c46e3cb10b0d2beb6bc6a2`.
Fresh extraction verification passed all 52 tests. Using the installed Python 3.12
Linux runtime, `python run_demo.py` started from that extracted directory with no
arguments and no `DESERTSKIN_WORKBOOK` override. Its loopback health check passed;
the extracted app/reader rendered 15.12%, 72.64 L, 168 records and eight scenarios.

Windows recovery output is now reviewer-confirmed. Installing runtime dependencies
and launching the full dashboard on the Windows presentation laptop remain pending.
The Windows folder cannot be overwritten by this workspace. To repair the
reviewer's existing copy using the already verified loose launcher, run these
commands in the outer `DesertSkin-X_MVP` folder that contains that loose file:

```powershell
Copy-Item -LiteralPath .\run_demo.py -Destination .\DesertSkin-X\run_demo.py -Force
Compress-Archive -Path .\DesertSkin-X -DestinationPath ..\DesertSkin-X_MVP.zip -Force
```

Then extract that rebuilt ZIP into a new folder and open its inner `DesertSkin-X`
directory. Verify the launcher hash, install the documented dependencies, and
launch there. This keeps the launcher and its application/data files together.
