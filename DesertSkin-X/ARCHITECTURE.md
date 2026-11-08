# DesertSkin-X | Architecture

## Runtime

Use one Python process running Streamlit. Its browser UI provides scenario selection, native charts and tables. The same process reads the approved workbook through openpyxl and computes filtered summaries with ordinary Python functions. Use pytest for arithmetic and reader checks and Streamlit AppTest for selection and rendering. Pin compatible versions after testing on the demo laptop.

The MVP runs on Python 3.12.14 with Streamlit 1.67.0, openpyxl 3.1.5 and Altair
6.3.0. Direct dependencies and a full tested environment are pinned in the
manifests. The interface uses native Streamlit components and a sand / forest-green
theme, plus a local conceptual SVG. There is no raw HTML, remote imagery or font
dependency. `run_demo.py` supplies the operator-selected or bundled workbook path
and starts Streamlit from the project directory on loopback.

`models.py` holds typed records, `workbook.py` validates one cached snapshot,
`metrics.py` contains pure calculations, `charts.py` declares grouped charts,
`materials_view.py` renders matched-condition comparisons, and `app.py` composes
the presenter journey. The material reader independently reconciles every cached
property and the operational reader checks severity against the documented rules.
The launcher checks runtime package availability before starting and prints
ASCII-only setup/retry commands using project-relative `.venv` paths when packages
are missing. Commands must run from the project directory. This avoids absolute
Arabic paths becoming Unicode escape sequences in captured output. It does not
install packages or change interpreter environments automatically.

Recommendation wording is required only for severities present in the loaded
telemetry. Unused examples do not block all-normal datasets. All four views are
always accessible; telemetry tabs show empty states independently of the material
library, which reads a separate table.

The workbook is the read-only datastore. At 168 records, a SQL database or separate web API adds synchronization work without improving the presenter’s journey. Load the file from an operator-supplied local path, for example via `DESERTSKIN_WORKBOOK`. Use a single workbook snapshot per load. Bundle the reviewed workbook privately on the laptop for the event. Start with local reads and introduce caching only if actual interaction latency warrants it.

## Data model and boundaries

| Workbook source | Identity and relationship | Use |
|---|---|---|
| Settings | Parameter name | Read named values with units, including time step, RH band and alarm thresholds. |
| Samples | Sample ID | S0–S6 physical formulations and S7 control. Formulation, control effectiveness, permeance factor and validation label. |
| Scenarios | Scenario ID → Sample ID | Sector, use case, area, daily baseline, model projections and decision. Keep daily projections distinct from hourly telemetry. |
| Telemetry | Record ID → scenario and sample | Workbook timestamp, RH, temperature, water flow, baseline/use/saved rates, savings %, modeled WVTR, risk, severity and health. |
| Material Calculations | Sample + RH for this edition | 24 demo rows spanning 30%, 50% and 80% RH. Preserve area, duration, pressure difference, masses, calculated fields and units. |
| Alerts | 32 linked example rows | Source of recommendation wording. Derive the full event list from Telemetry severity. |
| Dashboard | Global aggregates | Reconciliation reference. Compute UI KPIs from selected detail records. |
| START HERE, Formula Guide, API Schema | Metadata | Provenance, descriptions and field names. Guide B2:B10 contain cached `#NAME?` errors. Read the operational formula cells for numeric semantics. |

Keep source IDs as strings. Skip styled blank rows and validate headers, required values, numeric finiteness, RH bounds, unique record IDs and foreign keys. Preserve the source timestamp without assigning UTC or a Saudi timezone. Group every trend by scenario so a line never connects different deployments. The observed eight-hour gap within one scenario does not make its rows eight-hour intervals.

## Calculation contract

| Display or check | Rule for this workbook |
|---|---|
| Average savings | Arithmetic mean of Telemetry Q expressed in percent, including valid zeros. Values already use a 0–100 scale. |
| Water saved | Sum Telemetry P in L/h × Settings time step (1 h). For this edition this reproduces Dashboard B7. Never multiply by gaps between readings of one scenario. |
| Savings cache validation | At load time require saved rate ≈ baseline − use and percentage ≈ 100 × (baseline − use) / baseline. Relative and absolute tolerances are 1e-8; inconsistencies stop the load with Excel recalculation guidance. |
| Record and scenario counts | Count valid Telemetry IDs and configured Scenarios IDs at overview. Scenario view explicitly scopes counts and stats to the selected scenario. |
| RH regulation | Show internal and external RH (%) by time against Settings’ 45–65% band. Use a table with timestamps alongside charts. |
| Alerts | Use Telemetry S across all records. CRITICAL if internal RH >75% or temperature >38 °C, else WARNING if risk >25, else NORMAL. Read thresholds from Settings. Recommendations follow Alerts H. Keep scenario WATCH/ACTION distinct from telemetry severity. |
| Material properties | WVTR = mass change (g) / area (m²) / duration (days). Permeance = WVTR / Δp (kPa). Swelling = 100 × (hydrated − dry mass) / dry mass. Use g/m²/day for workbook WVTR. Its telemetry proxy uses a different formula from the material sheet’s gravimetric calculation. |

Read cached calculated cells for this immutable edition. Independently test critical arithmetic against inputs and the global Dashboard cells at full precision. For example, telemetry baseline is scenario daily baseline / 24. Its savings fraction is the lesser of 0.55 and absolute RH gap / 100 × sample effectiveness × Settings control efficiency. Multiply that fraction by baseline to get the hourly saved rate. Water flow in column H is a separate input. Round only for display. An empty selection shows zero counts and unavailable averages. Reject absent caches, Excel errors or invalid denominators in required operational inputs with sheet/field context. Keep descriptive Formula Guide errors isolated. A changed workbook needs fresh Excel calculation and reconciliation before release.

## API and integrations

The MVP integration contract is the local tabular schema. Map columns to names such as `record_id`, `scenario_id`, `water_flow_lph`, `water_savings_pct` and `wvtr_g_m2_day` from API Schema. One internal loader returns validated tables. Pure summary functions accept selected rows. The UI consumes these results directly. No network API is needed for this journey. A future device ingestion endpoint will need authenticated device IDs, timezone-aware timestamps, idempotency and separate provenance for field readings.

## Deployment, access and failure handling

Run the app on the presenter’s laptop bound to 127.0.0.1. The presenter controls access through the OS session, and all app actions are read-only. Package the interpreter environment and workbook before the event, verify startup disconnected, and keep the last rehearsed version for rollback. Shared deployment changes the access boundary and requires a separate decision on audience, HTTPS and identity.

Accept only a trusted local workbook configured by the operator. Do not expose upload or filesystem browsing, enable static file serving, evaluate spreadsheet formulas, execute macros, or publish personal paths or workbook contents in diagnostics. Keep framework request protections enabled. Show an actionable message for missing files, invalid headers, broken joins or cache failures. Stop rendering data for a failed load. Log sheet/column and error category locally.

Implementation references: [Streamlit AppTest](https://docs.streamlit.io/develop/api-reference/app-testing/st.testing.v1.apptest) and [openpyxl formula handling](https://openpyxl.readthedocs.io/en/stable/simple_formulae.html).

## Static browser edition — November 8, 2026

`website/scripts/export_data.py` calls the existing validated local reader and
exports a fixed snapshot as `website/dist/data.js`. No workbook parsing, formula
evaluation, Python service or third-party request happens in the browser.
`core.js` implements the same pure summary and classification contract; `app.js`
renders local DOM/SVG views with source strings assigned through textContent.
The static files use relative asset paths for GitHub Pages repository hosting.
Public hosting exposes the bundled synthetic snapshot; no original workbook or
personal filesystem path is needed. No credentials, ingest or device commands exist.

`scene.js` draws an original, procedural WebGL bilayer study with two perforated
surfaces, drag/keyboard rotation, layer separation and illustrative RH controls.
It is not a calibrated material model and never changes the dashboard data.
Animations respect reduced motion and pause when the scene is not visible;
WebGL failure leaves the dashboard usable with a conceptual fallback. Charts
retain per-scenario grouping, explicit workbook-time labels and accessible data
tables. Hover details also respond to focus and tapping. Browser rehearsal is
unverified because the managed preview relay was unavailable.

## Build 02 renderer and browser interface

`website/src/world.js` constructs the greenhouse, service building, solar panels,
water loop, plants, monitoring point and component anchors with Three.js 0.187.0.
No remote model, font or texture is requested. `src/ui.js` renders the scoped
dataset and component inspector. Esbuild 0.25.12 bundles the engine and source
into a classic local script; direct offline opening remains supported.

WebGL2 uses Three.js lighting and shadows. When unavailable, Canvas 2D receives
the same transformed triangles from a software rasterizer with per-pixel depth
testing and alpha composition. CPU raycasting, camera orbit/zoom, layer
separation and projected labels work on either renderer. Context loss switches
to compatibility rendering. Motion respects reduced motion; scenes pause when
the data panel or browser tab is hidden. This is concept geometry, not a
calibrated simulation or a live installation.

`scripts/build.mjs` produces content-hashed script/style names to avoid stale
asset caches after deployment. Source templates live under `src/`; only `dist`
is required at runtime. The existing GitHub repository is the source/deployment
target. Build 02 replaces the old shader and editorial landing-page UI.

## Build 03: original membrane specimen

`src/world.js` now builds only the membrane: a thin, undulating hydrogel sheet
with a cutaway variant, an irregular curved-strut aerogel network, schematic
GO/silica inclusions, interface bridges and illustrative water particles.
The proposed compositions come from the attached English project profile.
Geometry, sizes, hydration particles and deformation are not microscopy or a
calibrated constitutive model. No transport direction is inferred from RH alone.

`src/software.js` separates the compatibility triangle rasterizer from the model.
Both renderers use the same geometry and camera. Studio lighting is used on the
WebGL path; software provides depth-tested, shaded translucent geometry.
Camera views include Overview, Surface and Cross-section; presentation controls
include Assembled, Cutaway and Exploded. RH controls are illustrative and never
mutate metrics or material inputs. Camera framing compensates for exploded
separation. The inspector renders hydrogel, aerogel, interface and hydration
explanations instead of site components. `src/style.css` supplies a new dark
material-study palette, with warm hydrogel and cool support accents.
