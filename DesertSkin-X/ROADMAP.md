# DesertSkin-X | Development roadmap

Planning is complete. The owner authorized implementation on November 7, 2026.
All six implementation tasks and available automated/browser checks are complete.
The management-review corrections and launcher follow-up are complete in code,
with 52 tests passing. Windows PowerShell/laptop verification remains pending.
The initial isolated browser issue was resolved with a desktop-local server.
The remaining event check is installation and offline rehearsal on the owner's
actual laptop. Relative paths identify
likely components. Keep each task independently reviewable.

| Task and objective | Likely files | Depends on | Acceptance criteria | Verification | Complexity / risk |
|---|---|---|---|---|---|
| 1. Show the workbook record count. Start a local app, read only Telemetry Record ID, and display the count with the synthetic-data label. | `app.py`, `workbook.py`, `requirements.txt`, `tests/test_overview.py` | Authorization, accessible supplied XLSX | On the supplied file, the opening screen reads “Demo / synthetic” and “168 operational records”. Missing source produces a recovery message. | Run the app on loopback. One AppTest using a tiny local workbook fixture proves the count changes with input. Manually verify the real workbook. | Low / Low |
| 2. Complete the overview. Read Settings, Scenarios, Samples and Telemetry, validate joins and compute the four KPIs. | `workbook.py`, `metrics.py`, `app.py`, reader and metric tests | 1 | Show 15.12%, 72.64 L, 168 records and 8 scenarios. Identify the period and provenance. Reject missing required caches and duplicate IDs. | Compare summaries against Dashboard B2, B3, B6 and B7. Test an unequal-baseline fixture that distinguishes the mean of percentages from ratio of totals. | Medium / Medium |
| 3. Trace a scenario. Add scenario selector, trends, target band and telemetry detail. | `app.py`, `metrics.py`, scenario UI tests | 2 | All eight scenarios selectable. C05 shows 21 records, 16.39% and 4.30 L. Both RH traces and a temperature series use workbook time. Reset restores all-data totals. | AppTest select and reset. Inspect C05 and a second sector, axis units, absence of cross-scenario line segments and empty states. | Medium / Low |
| 4. Explain alerts. Filter all telemetry events and display source record, trigger and recommendation. | `app.py`, `metrics.py`, alert tests | 3 | 16 critical and 0 warning records overall, five critical in C05. T0005 explains the high-temperature trigger. Empty alert view explains that no matching events exist. | Compare against Dashboard B9:B10. Exercise exactly-at-threshold and warning examples in fixtures. Verify the 32-row Alerts sheet does not truncate the feed. | Low / Medium |
| 5. Compare materials. Select samples and RH, expose model provenance and separate S7 as a reference. | `workbook.py`, `app.py`, material tests | 2 | All seven formulations available at three RH levels, with optional S7 reference. Show WVTR, permeance and swelling with units and input conditions. | For Material Calculations row 2, match 166.424 g/m²/day, about 524.997 g/m²/day/kPa and 19.5%. Check matched RH and invalid denominators. | Low / Medium |
| 6. Rehearse and release. Pin the tested environment, document startup and check a clean restart offline. | Dependency manifest, `README.md`, journey tests, updated planning docs if needed | 3–5 | A presenter can complete the PROJECT.md journey on the demo laptop, recover from a missing file and restart with original totals. Only the approved demo file is accessible. | Run full pytest, then rehearse in a browser disconnected from the network. Check narrow-screen tables, keyboard selection, readable units, no stale data after failure and no public listener. | Low / Low |

## Milestones and review

- **First usable build, tasks 1–2.** A judge can already inspect the workbook overview. Keep the first task limited to a single count. It needs no chart, model port or data migration.
- **Presenter walkthrough, tasks 3–5.** Rehearse Storage → T0005 → S4, then switch to Packaging to demonstrate sector coverage.
- **Release candidate, task 6.** Record the dataset fingerprint, environment versions, test results and manual rehearsal outcome.

Overall complexity is **medium**. Budget roughly 2–4 focused developer-days for implementation and rehearsal, assuming the supplied edition, one presenter laptop and read-only English UI. The main uncertainty is data fidelity. Compare the full dataset and at least one filtered view before spending time on visual polish. A public or live-sensor release needs a new estimate.

## Implementation status — November 7, 2026

### Task 1 — Complete; final browser rehearsal remains a release check

- Added `app.py`, `workbook.py`, runtime/development requirements, test and type
  configuration, local server/theme configuration, and startup instructions.
- The opening screen uses native components with a sand / forest-green palette,
  a persistent “Demo / synthetic” label and an input-derived operational count.
  No future dashboard controls or synthetic replacement demo dataset were added.
- The reader opens the workbook read-only, finds the Record ID column in
  Telemetry, ignores blank/styled rows, and rejects invalid IDs or missing
  structure. Errors omit local paths; failed reloads remove previous metrics.
- Verified with Python 3.12.14, Streamlit 1.67.0 and openpyxl 3.1.5 in `.venv`.
  Actual executed checks:
  - `.venv/bin/python -m pytest -q`: **9 passed**, temporary fixtures only.
  - `.venv/bin/python -m ruff check app.py workbook.py tests`: passed.
  - `.venv/bin/python -m ruff format --check app.py workbook.py tests`: passed.
  - `.venv/bin/python -m mypy`: passed, three source files.
  - Started `.venv/bin/python -m streamlit run app.py` with a temporary
    three-ID fixture. HTTP health check returned 200 / `ok`; the listener was
    confirmed at 127.0.0.1:8501. CORS and XSRF protections are enabled; static
    file serving and usage telemetry are disabled.
- **Supplied edition verified:** the workbook is now available under
  `project_sources/06-DesertSkin_X_Platform_Demo_Workbook.xlsx`. Its SHA-256
  matches the planning fingerprint. AppTest ran the normal entry point against
  that file and verified 168 operational records and the visible demo label.
- **Not visually verified:** the isolated browser returned connection refused
  for this workspace's loopback server. The automated AppTest renders passed,
  but they do not establish browser appearance or narrow-screen layout.
- The owner's instruction to continue through the MVP authorizes the remaining
  implementation. Proceed with Task 2; keep browser limitations explicit at release.

### Task 2 — Complete

- Added typed settings, samples, scenarios and readings, one cached read-only
  snapshot loader, header/join/finite-value/ID validation and pure summaries.
- All four opening KPIs reconcile with Dashboard values: 15.12%, 72.64 L,
  168 records and eight scenarios. Every real telemetry baseline, saved rate
  and percentage independently matches the input-based model.
- `.venv/bin/python -m pytest -q`: **20 passed**, including the supplied edition.
  Ruff lint/format and mypy passed. Tests cover missing/error caches, duplicate
  IDs, broken joins, invalid RH and denominators, unequal baselines, valid zeros,
  empty selections, changed counts and failed reloads. The source SHA is unchanged.
- openpyxl emits two warnings about unsupported workbook formatting extensions;
  reads remain read-only and source bytes are preserved.

### Task 3 — Complete

- Added all-scenario and deployment selection, reset, scoped metrics and timestamps,
  internal/external RH traces with the 45–65% band, temperature with the 38 °C
  threshold, and a detailed readings table. Every trace groups by scenario.
- Added Altair as an explicit dependency (already installed with Streamlit).
- Full suite: **22 passed**. Real C05 selection shows 21 records, 16.39% and 4.30 L;
  C03 Packaging and reset both pass. Chart specs verify the target band and
  deployment grouping. Ruff and mypy pass; browser rehearsal remains the release check.

### Task 4 — Complete

- The alert feed covers all readings, with scoped severity filtering, record
  inspection, trigger explanations and workbook recommendation wording.
- Real-data checks reproduce 16 critical / zero warning readings and five
  critical records for C05. T0005 explains the 38.59 °C trigger with risk zero.
  Events after the 32 example rows remain in the feed.
- Full suite: **28 passed**; lint, formatting and mypy pass. Strict threshold
  boundaries and warning fixtures pass. WARNING wording was verified directly
  against the unused literal branch in Alerts!H2 because no cached WARNING
  examples exist. Source severity is independently checked at load time.

### Task 5 — Complete

- Added the material library with S0–S6, 30/50/80% RH selection, matched-condition
  comparisons, input conditions and provenance, and a separate optional S7 table.
- All 24 cached material rows independently reconcile with their masses, area,
  duration and pressure difference. Invalid denominators, duplicate conditions
  and stale property caches fail safely. Row 2 matches 166.424 g/m²/day,
  524.996845 g/m²/day/kPa and 19.5% swelling.
- Full suite: **34 passed**. UI selection, S7 separation and empty selection pass;
  ruff lint/format and mypy pass. Source workbook remains unchanged.

### Task 6 — Implementation and available release checks complete

- Added a portable loopback-only launcher, the byte-identical source workbook
  under `data/`, a local bilayer SVG, complete startup/presenter/offline instructions,
  the tested dependency lock, release notes and source packaging.
- Final full suite: **37 passed**, including a socket-blocked backend journey and
  clean restart. Ruff lint/format and strict mypy pass; pip reports no broken
  requirements. Run commands and environment are recorded in RELEASE.md.
- Rehearsed the real workbook in Chromium via the desktop-local service:
  overview, Storage, T0005, material library, S7, Packaging via keyboard and reset.
  Fixed card truncation and date-axis labels found during this review. At 200%
  zoom the effective compact viewport stacks cards and keeps tables scrollable.
- Restarted through `run_demo.py` and verified original global totals. No public
  listener, authentication service, visitor upload/path, or actuator control was added.
- Browser source-failure rehearsal also passed: an unavailable file cleared all
  metrics/charts, displayed a recovery instruction, and recovered after restart.
- Packaged 29 source/data/document files, extracted the archive into a clean
  directory and ran its full suite: **37 passed**. Archive integrity, source
  fingerprint and Markdown cross-links also passed.
- **Remaining event check:** install/rehearse on the actual presentation laptop
  with its external network disconnected. The source package does not contain
  an interpreter or OS-specific wheels; README.md explains offline preparation.
  Physical-mobile and Windows/macOS execution have not been verified here.

## Management review corrections — Complete

- **Launcher:** detect missing Streamlit/openpyxl/Altair before spawning the
  server. Print installation and retry commands for the exact interpreter, with
  PowerShell-safe quoting on Windows. Return an actionable nonzero result rather
  than allowing a missing-module traceback. Do not install packages automatically.
- **Savings:** validate saved rate against baseline minus use and percentage
  against that ratio during every load (relative/absolute tolerances 1e-8).
  Plausible inconsistent values fail; consistent changes and valid zeros load.
  A failed reload removes the previous dashboard.
- **Recommendations:** require wording only for severities present in telemetry;
  absent/blank unused critical examples no longer block an all-normal workbook.
  An actual critical reading still requires its recommendation.
- **Independent views:** always render all four tabs. Telemetry views show their
  empty states while material comparisons remain available for an empty scenario
  or an entirely empty telemetry table.
- Verification: full `python -m pytest -q` **51 passed**, Ruff lint/format passed,
  strict mypy passed (15 source files). A clean venv without application packages
  reproduced the startup condition and verified the printed setup command.
- Created a second fresh Python 3.12 Linux venv, installed `requirements.txt`,
  launched `run_demo.py` from another directory, verified HTTP health/root 200,
  and checked the real-workbook UI. Restarted the in-app preview with that
  environment and verified the overview KPIs in the browser.
- **Not claimed:** the Windows presentation laptop was not accessible here.
  The review's Windows launch failure is acknowledged; use README.md's explicit
  Python 3.12/.venv commands and repeat startup on that laptop before the event.

## Launcher follow-up — November 8, 2026

- Replaced absolute-path recovery commands with ASCII-only project-relative
  setup/install/retry commands. The operator is told to open a terminal in the
  project directory and repeat any supplied `--workbook` option. No path rename
  or move is required. Runtime source selection is unchanged.
- Updated regression runs from an Arabic-named project and virtual environment,
  from an external working directory, with `PYTHONIOENCODING=ascii:backslashreplace`.
  It verifies exit code 3, expected missing-package guidance, all relative commands,
  and absence of absolute paths or literal Unicode escapes in captured output.
- Full suite: **52 passed**. Ruff lint/format and strict mypy passed (15 source
  files). PowerShell and Windows are unavailable in this Linux workspace, so
  executing those commands on the presentation laptop remains explicitly pending.
- Updated the existing source ZIP and its version history; no separate release
  download is created for this correction.

## Delivery verification — November 8, 2026

- The reviewer reported launcher hash `d874574c7f3f28393117ccd52b137e974d09795f99b5d6ac3850e1f18eef8056` in both their extracted Windows folder and adjacent ZIP.
- Direct comparison here found `8f7d8d9b0d7e24383b4c1951b40127df4c97d9e798c46e3cb10b0d2beb6bc6a2` in both the fixed working source and packaged launcher. This identifies a copy/transfer mismatch; do not change the already fixed logic to address an older external copy.
- Added the fixed checksum and Windows replacement/repack verification guidance
  to RELEASE.md. Provide the corrected launcher directly as well as the existing
  project package. The user's separate Windows folder is not mounted here.
- Do not claim Windows-side replacement or a successful PowerShell launch until
  the reviewer confirms the corrected hash and executes the launcher there.

## Complete-package verification — November 8, 2026

- The reviewer confirmed ASCII-only recovery output from the corrected launcher
  on Windows. Their loose file is outside the inner application directory;
  their extracted inner launcher and adjacent ZIP still need replacement there.
- Verified that the complete ZIP here packages launcher SHA
  `8f7d8d9b0d7e24383b4c1951b40127df4c97d9e798c46e3cb10b0d2beb6bc6a2`
  beside `app.py`, `requirements.txt` and `data/` inside `DesertSkin-X/`.
- Extracted that ZIP afresh and ran its suite: **52 passed**. Launched its
  `run_demo.py` without arguments and without a workbook environment override
  using the installed Python 3.12 Linux runtime. Health returned 200/ok, and
  the extracted app/reader rendered the four expected real-workbook KPIs.
- Updated the same ZIP and included placement/repack guidance. Provide the
  actual workspace ZIP as a direct download to remove ambiguity about which
  downloaded file is being reviewed. Windows-side replacement and full dashboard
  startup remain pending; this workspace has no write access to that filesystem.

## Static browser edition — November 8, 2026

- Built `website/dist` with all eight deployments, input-derived global/scoped
  KPIs, grouped humidity/temperature charts, hover/focus/tap record details,
  telemetry and CSV export, full alert inspection, matched-RH S0–S6 comparison
  and optional separate S7 reference. Source workbook bytes were preserved.
- Added an interactive procedural 3D membrane: orbit by drag or keyboard,
  separate/join layers, illustrative RH controls, reduced-motion handling and
  WebGL fallback. All geometry is labeled conceptual, not calibrated prediction.
- Prepared relative static assets for GitHub Pages and direct offline opening.
  No external runtime asset, API key, Python server or upload flow is required.
- `node website/scripts/verify.mjs`: **9 verification groups passed**, covering
  exact source/global and C05 reconciliation, unequal baselines/zeros, every
  source severity, threshold edges, all material arithmetic, empty selections,
  asset references, source fingerprint and naive timestamp preservation.
- `node --check` passed for `app.js`, `core.js` and `scene.js`.
- `sites-preview start` and `sites-preview status` both reported preview relay
  unavailable. Browser visuals, mobile rendering and actual UI interactions
  remain unverified; no alternative browser route was substituted.
- GetLayers MCP discovery found no exposed matching provider. Applying its
  references is pending connection. No GitHub upload/publication is claimed.

## Field lab rebuild — November 8, 2026

- Reviewed the attached 23.6-second reference video at eight sampled moments.
  Replaced the interface with a sidebar workspace, interactive diorama, component
  inspector, compact KPIs and focused reading/material/alert views.
- Added original procedural 3D greenhouse, membrane roof, service building,
  solar array, tank, pond, planted beds, trees and monitoring point. Added camera
  drag/keyboard orbit, wheel/pinch/button zoom, reset, optional orbit, layer lift,
  raycast picking, projected component labels and dataset links.
- A software triangle rasterizer with per-pixel depth testing renders the same
  geometry when WebGL2 is unavailable. The observed browser used this path.
  GPU rendering and physical touch-device behavior are not claimed as tested.
- Browser checks on the actual Pages preview verified visible 3D geometry,
  mouse orbit, keyboard rotation, zoom, layer separation, component inspection,
  all-data reset, C05’s 21 readings / 16.39% / 4.30 L, T0005’s 38.59 °C trigger,
  the empty warning state, matched-RH materials and separate S7.
- At 250% browser zoom (545 CSS-pixel viewport), compact navigation and C05
  filtering worked without document horizontal overflow. This is a narrow-screen
  layout check, not a physical-phone test. Keyboard chart tooltips and Escape
  dismissal also passed.
- Fixed software depth sorting after visual review exposed occluded ground
  details. Added content-hashed bundles/styles after a cached asset hid fixes.
- `npm --prefix website run build` passed. `node website/scripts/verify.mjs`
  passed all **9 calculation/integrity verification groups**. Source workbook
  bytes and evidence boundaries remain unchanged.
- Published the rebuilt main interface in GitHub commit
  `81fa203260cabfc35adfa44789e5d9c821e7eb33`; Pages deployment succeeded.
  A fresh browser session verified the main address, new hashed assets, visible
  3D, keyboard rotation, C05 metrics and T0005 alert explanation, then reset to
  all deployments. Captured the final interface for the handoff.
- The GPU path remains unverified in this browser, which used software 3D.
  Physical-phone and presentation-laptop rehearsal remain separate checks.

## Membrane explorer correction — November 8, 2026

- Reviewed all three newly attached reference videos through multi-timepoint
  contact sheets. Read the English project profile’s composition/mechanism.
  Replaced the garden with original, project-specific membrane geometry.
- Added assembled/cutaway/exploded presentations; overview/surface/cross-section
  camera presets; layer/interaction inspection; illustrative 30/50/80% RH states.
  Kept drag/keyboard rotation, zoom, reset, hover feedback and reduced motion.
- Visual review replaced an overly regular initial lattice with an irregular
  curved-strut porous support and a softer translucent hydrogel surface.
- Browser preview verified visible membrane geometry, layer separation,
  one-active-button presentation states, camera presets, component inspection,
  80% illustrative RH in the inspector and unchanged 72.64 L global KPI.
  C05 still showed 21 readings / 16.39% / 4.30 L, and T0005 still explained
  38.59 °C > 38 °C. Separate S7 reference rendering also passed.
- At 545 CSS pixels, model controls, navigation and C05 filtering worked with
  document width 539 pixels: no page horizontal overflow. This is not a
  physical-phone test. Browser rendering used software 3D; GPU-specific
  appearance and physical touch-device behavior remain unverified.
- Build and all 9 calculation / asset / provenance verification groups passed.
  Original workbook bytes, thresholds, precision and timestamps are unchanged.
- Publish the checked specimen build to the existing Pages site, replacing
  build 02 while preserving the Python demo and unrelated repository files.
