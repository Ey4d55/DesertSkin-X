# DesertSkin-X | Decision record

These implementation decisions follow the reviewed project materials. The owner
authorized implementation on November 7, 2026. Proceed one roadmap task at a time
after the preceding task passes verification.

| Decision | Alternative considered | Rationale and trigger to revisit |
|---|---|---|
| One local Streamlit application | React frontend with a separate Python API | The demo is a small set of filtered tables, charts and rules owned by one presenter. A dedicated frontend and API become worthwhile if a separate client or custom product experience becomes essential. |
| Trusted XLSX as a read-only release input | Convert and maintain a second JSON dataset or use SQLite/PostgreSQL | Direct reads preserve worksheet lineage and avoid a sync step. Revisit persistence when multiple users write data or sensors append readings. |
| Read operational caches and independently check arithmetic | Reimplement the entire Excel model, or serve the four saved Dashboard cells as constants | Caches cover a fixed demo edition. Filtered results need row-level calculation. Excel recalculation remains with the source author. Editable what-if simulation warrants a separately tested model. |
| Report alerts across all telemetry rows | Reuse the Alerts sheet as an event log | It contains 32 linked examples, including normal readings. Full telemetry yields 16 critical readings. Use the workbook recommendation text for each severity. |
| Use profile and workbook provenance on screen | Present poster impact headlines as dashboard results | The profile describes 20% water and 30% condensation improvements as development targets. Demo percentages, measured pilot results and targets have different evidentiary status. |
| Serve one laptop on loopback without accounts | Public hosted dashboard with login | The walkthrough needs browsing and filtering only. A shared URL changes the audience and data-access boundary. |

## Source reconciliation

The reviewed inputs are `DesertSkin_X_Platform_Demo_Workbook.xlsx`, `DesertSkin_X_Hackathon_English_Project_Profile.docx` and three supplied posters. The workbook SHA-256 is `1a00e092329cbdeab485f6a89f3ace3ceb2eda8936d0700aa00799c5e9092519`. It contains ten sheets. S0–S6 are physical formulations. S7 is the open aperture with no membrane.

- Dashboard B6 is the unweighted mean of Telemetry Q. Dashboard B7 sums Telemetry P for one-hour modeled records. Reconstructing the two metrics from RH, control factors and scenario baselines yielded 15.121282238095239% and 72.63730153416667 L.
- C05 demonstrates why risk and severity are separate. T0005 has risk 0 and severity CRITICAL because its temperature exceeds the alarm threshold.
- The nine Formula Guide expressions in B2:B10 are stored as formulas with cached `#NAME?` values. The operational formulas and Dashboard caches are usable. For risk, Telemetry R applies the temperature term only above the temperature limit. The guide's descriptive expression differs on this point. Preserve the supplied workbook and test against the operational cells.
- Use workbook units of g/m²/day for WVTR. The posters use kg/m²/day in places and describe different values. Do not mix the two datasets or infer experimental validation.

## Owner decisions and unresolved questions

| Item | Working assumption | When an answer matters |
|---|---|---|
| Start implementation | Authorized November 7, 2026; Task 1 implementation started. | No additional approval needed within the approved roadmap; required verification still gates progression. |
| Venue access | One presenter laptop can run Python locally. | If judges need an independent URL or the laptop cannot run a local app, resolve hosting and access before packaging. |
| Language and interaction | English read-only interface; workbook author handles input edits. | If Arabic UI, in-app parameter changes or live ESP32 input are mandatory for judging, revise scope before coding. |
| Timestamp timezone | Show the supplied workbook time without an offset. | Confirm the zone before merging with external or live records. It does not block the local demo. |

No domain decision remains open about the four headline values or the role of S7 for this workbook edition.

## Implementation notes — November 7, 2026

Use Streamlit's native components and project theme for the requested visual
direction: sand backgrounds, forest-green typography/sidebar, rounded cards and
clear hierarchy. This preserves the no-raw-HTML boundary and adds no UI dependency.
The current environment uses Python 3.12.14, Streamlit 1.67.0 and openpyxl 3.1.5;
the demo laptop and offline release rehearsal are still pending.

Task 1 reads literal Record IDs only and rejects formulas in that identifier
column without evaluating them. Later tasks must still read operational numeric
caches and meet the independent arithmetic checks described in ARCHITECTURE.md.
The supplied workbook, profile and three posters are now available. Its fingerprint
matches the planning record. Both fixture and real-edition tests pass; source bytes
are preserved. The owner instructed continued implementation through the MVP.

## Release decisions — November 7, 2026

- Use two KPI columns rather than four: browser review at laptop width showed
  truncated values with four cards and an expanded sidebar. Compact viewports
  stack the native columns. Explicit date-axis labels avoid repeated “12 PM”.
- The 32-row Alerts sheet has no cached WARNING recommendation. The verified
  literal branch of Alerts!H2 supplies “Review membrane response and ventilation”.
  NORMAL/CRITICAL wording comes from the cached examples. Conflicting wording
  requires review; no formula is evaluated.
- Include the original workbook in the private source package under `data/` and
  use a portable operator-side launcher. No personal machine path is committed.
- Browser verification became available using the desktop-local server. Keep the
  actual demo-laptop offline rehearsal as an event check; backend socket-blocked
  tests and a local browser rehearsal do not establish OS-specific installation.

## Management review corrections

The launch failure reported on Windows means that interpreter lacked Streamlit
and never started a server. Detect missing runtime packages before launch and
print project-relative `.venv` commands, without automatically installing into
system Python. The Windows setup guide explicitly selects Python 3.12.

Numeric type/range checks alone do not ensure savings caches are coherent. Add
load-time accounting checks against baseline and use, with 1e-8 tolerances, without
reimplementing the entire scenario model. Require recommendation text only for
severities that occur, and keep material views independent of telemetry availability.

## Launcher follow-up — November 8, 2026

The Windows reviewer confirmed clean dependency detection but reported literal
Unicode escapes in captured recovery commands containing the Arabic folder name.
Recovery output now uses fixed ASCII-only, project-relative commands, superseding
the earlier absolute-interpreter command formatting. Tell the operator to run
them from the directory containing `run_demo.py` and retain any custom `--workbook`
option. Runtime source selection and loopback binding remain unchanged.

Regression coverage executes the launcher from an Arabic project/interpreter path
with ASCII/backslash-replacement output encoding. Windows command templates are
checked as strings; Windows PowerShell execution remains a presentation-laptop check.

## Browser edition — November 8, 2026

- The owner's request for GitHub Pages and a 3D redesign authorizes a separate
  static frontend. Use plain HTML/CSS/JavaScript rather than adding a Python host
  or a framework build. The existing Streamlit release is preserved.
- Reuse the validated loader for a one-way, immutable synthetic snapshot export.
  The original workbook remains the authoring source; refresh explicitly and
  reconcile before publication. Browser summaries use the same row-level inputs.
- Use native procedural WebGL for the conceptual membrane so the extracted site
  has no CDN, remote model, font or package dependency. Humidity interaction is
  illustrative and is not presented as a validated material response.
- The requested GetLayers connection was not exposed; app and tool discovery
  found no matching provider. The independent original design must not be
  described as GetLayers-assisted. Applying GetLayers references remains pending
  until that connection is available in this conversation.
- Prepare a GitHub Pages package without publishing elsewhere. No repository
  destination or GitHub deployment was selected or changed in this task.

## Field lab rebuild — November 8, 2026

- Follow the supplied video’s spatial interaction pattern: a complete planted
  site, orbit/zoom controls, labeled components and compact surrounding metrics.
  Replace the previous isolated membrane panel and long marketing layout.
- Use procedural Three.js geometry rather than a remote asset dependency. A
  full software 3D renderer keeps the scene interactive when WebGL is blocked.
- Keep all 3D behavior illustrative. Component links open existing materials,
  readings and alerts; scene controls never mutate the workbook snapshot.
- Browser QA is required for this correction. With the local preview relay
  unavailable, publish to a separate path on the existing Pages repository,
  verify there, and then replace the main interface. Preserve the existing
  source/data and repository visibility.
- Cache files by content hash. A cached preview initially hid the depth and
  readability fixes; versioned asset names prevent that failure.
- The owner explicitly dropped GetLayers. No GetLayers dependency or design
  attribution is claimed.

## Membrane reference correction — November 8, 2026

- The owner rejected the garden subject. The new videos are inspiration for
  depth, smooth exploration and detailed structures only. Build an original
  membrane specimen and do not reproduce a cell, squid, garden or reference UI.
- Ground composition in the English profile: PVA/alginate/CMC/CNC hydrogel,
  investigated PSBMA additions, CNF/GO/silica aerogel. Do not invent measured
  pore size, layer thickness, swelling calibration or permeability direction.
- Use irregular schematic porosity and a translucent responsive layer. Exploded
  separation is a viewing aid, not in-service delamination. Water particles are
  explanatory marks, not a molecular simulation or a quantified flux.
- Keep operational data and matched-RH material comparisons independent of the
  visual RH controls. Preserve the existing workbook snapshot and formulas.
