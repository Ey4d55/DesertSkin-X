# DesertSkin-X | Product brief

Part of **الأمن الغذائي والاستدامة البيئية النسخة الثالثة**. This plan covers the digital hackathon demonstration. The owner authorized roadmap implementation on November 7, 2026 and requested an eye-catching, presentation-ready interface. The read-only local MVP scope remains unchanged.

## Product and audience

DesertSkin-X pairs a passively responsive bilayer membrane with a separate monitoring system. The presenter needs to show a judge how humidity conditions relate to modeled water use, then trace a result to the scenario, formulation and rule that produced it. Potential pilot users include growers, building operators, packaging teams and industrial operators. The first release serves the presenter and judges.

## Evidence and scope

Reviewed the English project profile, all ten sheets of the supplied demo workbook and the three posters. The project folder initially held two empty directories, with no existing application or dependency manifest. The profile distinguishes development targets of up to 20% lower water use and 30% less condensate from validated outcomes. Passive operation refers to membrane actuation. Monitoring requires power. Use the workbook for displayed demo values and the profile for claim language. The posters provide visual and explanatory context.

| Scenario | Sector | Use case | Sample |
|---|---|---|---|
| C01 | Agriculture | Protected crop area | S4 |
| C02 | Buildings | Interior humidity buffer | S3 |
| C03 | Packaging | Moisture-sensitive enclosure | S5 |
| C04 | Textiles | Breathable protective layer | S1 |
| C05 | Storage | Equipment enclosure | S4 |
| C06 | Industry | Process air exchange | S6 |
| C07 | Agriculture | Open-field irrigation cover | S3 |
| C08 | Buildings | Warehouse envelope | S5 |

## Critical journey

1. Open the English overview. See the dataset period, a visible “Demo / synthetic” label, and four KPIs for the full workbook.
2. Select C05 Storage. See its 21 readings, internal and external relative humidity (RH), target band, temperature and modeled water savings.
3. Inspect record T0005. Its 38.59 °C temperature exceeds the 38 °C threshold. The presenter can explain the critical status even though internal RH is within the target band.
4. Inspect S4 alongside another physical sample at the same RH. Show the material assumptions, units and the open-aperture reference separately. Reset to all scenarios and recover the original totals.

## Release boundary

| Release | Functionality |
|---|---|
| MVP | Local read-only dashboard. Full-data KPIs, per-scenario trends and operational rows, RH target band, alert details and workbook recommendations, sample comparison at matched RH with WVTR, permeance and swelling. Include all eight scenarios. |
| Post-MVP | Session-only what-if inputs, Arabic interface, shared hosting, curated dataset refresh, ESP32 ingest after agreeing units, device identity and timestamp semantics. Prioritize these with pilot users. |
| Out of scope for this release | Actuator commands, production sensor alarms, predictive ML, multi-tenant accounts, billing, manufacturing workflows and experimental validation. |

## Assumptions and release checks

- One presenter can run a local Python service on the demo laptop. The browser UI is English. The original Excel file remains the editable authoring surface.
- Inputs describe a fixed demo week, November 1–7, 2026. Each of the 168 rows represents one modeled hour. The eight scenarios rotate, giving 21 readings each. Label times as workbook time with timezone unspecified.
- Reproduce 15.12% average water savings, 72.64 L total modeled water saved, 168 records and 8 scenarios from the supplied edition. Averages and totals have different denominators. Check 16 critical and 0 warning records across the same dataset.
- C05 alone shows 16.39%, 4.30 L and five critical records. Filtering and resetting must update the affected charts, table, alerts and metrics together.
- Physical samples are S0–S6. S7 is the open-aperture control. All material values carry their demo provenance. Project targets or poster percentages must never enter KPI calculations.
- A presenter can complete the journey with the network disconnected after environment setup. An invalid source yields a clear recovery instruction. These are planned release checks.

See [architecture](ARCHITECTURE.md), [implementation tasks](ROADMAP.md), [session instructions](AGENTS.md) and [decision history](DECISIONS.md).

## Browser edition — November 8, 2026

The owner requested GitHub Pages compatibility and a redesigned interface with
interactive 3D and hover behavior. `website/dist` is a separate, self-contained
browser edition using the same validated synthetic workbook snapshot. It includes
the overview, filtered telemetry, alert inspection and matched-RH material library.
The 3D bilayer study is explicitly conceptual, independent of measured or modeled
dashboard results. The original local Streamlit application remains available.
The first browser edition was rejected by the owner for its visual design and
nonworking 3D. It is superseded by build 02 below. GetLayers was abandoned at
the owner’s instruction.

## Field lab rebuild — November 8, 2026

The owner supplied `refrence.mp4` and requested a complete redesign. Build 02
uses a procedural, orbitable greenhouse diorama as the main workspace, with
component inspection and compact data views. It supports real geometry on WebGL2
and a software 3D rasterizer when GPU access is unavailable. Both use the same
meshes and camera; the fallback is not a screenshot. The source workbook,
calculation contract and distinction between concept geometry and evidence remain
unchanged. Changes are published to the existing GitHub Pages repository.
