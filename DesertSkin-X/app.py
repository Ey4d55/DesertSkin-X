"""DesertSkin-X's local, read-only presenter interface."""

import os
from pathlib import Path

import streamlit as st

from charts import humidity_chart, temperature_chart
from materials_view import show_materials
from metrics import alert_events, alert_triggers, select_readings, summarize
from models import Dataset, Reading, Summary
from workbook import WorkbookError, load_dataset

ALL_SCENARIOS = "All scenarios"


def reset_scenario() -> None:
    st.session_state["scenario_selection"] = ALL_SCENARIOS


def show_alerts(readings: tuple[Reading, ...], dataset: Dataset) -> None:
    st.subheader("Know what needs attention")
    critical = sum(row.alert == "CRITICAL" for row in readings)
    warnings = sum(row.alert == "WARNING" for row in readings)
    st.write(f"**{critical} critical · {warnings} warning** in the current selection")
    st.caption(
        "All telemetry rows are checked. Scenario WATCH/ACTION is a separate projection."
    )
    severity = st.selectbox(
        "Alert severity", ["All alerts", "CRITICAL", "WARNING"], key="alert_severity"
    )
    events = alert_events(readings, None if severity == "All alerts" else severity)
    if not events:
        st.success(
            "No matching alerts. No readings in this selection trigger the chosen severity."
        )
        return
    options = [row.record_id for row in events]
    if st.session_state.get("alert_record") not in options:
        st.session_state["alert_record"] = options[0]
    selected = st.selectbox("Inspect alert", options, key="alert_record")
    event = next(row for row in events if row.record_id == selected)
    with st.container(border=True):
        st.badge(event.alert, color="red" if event.alert == "CRITICAL" else "orange")
        st.subheader(f"{event.record_id} / {event.scenario_id} / {event.membrane_id}")
        st.text(" ".join(alert_triggers(event, dataset.settings)))
        st.text(dataset.recommendations[event.alert])
        st.caption(
            f"Internal RH {event.internal_rh_pct:.2f}% · "
            f"Humidity risk {event.humidity_risk:.2f} · "
            f"{event.timestamp:%d %b %Y, %H:%M} (workbook time)"
        )
    st.dataframe(
        [
            {
                "Record": row.record_id,
                "Workbook time": row.timestamp,
                "Scenario": row.scenario_id,
                "Sample": row.membrane_id,
                "Severity": row.alert,
                "Trigger": " ".join(alert_triggers(row, dataset.settings)),
                "Recommendation": dataset.recommendations[row.alert],
            }
            for row in events
        ],
        hide_index=True,
        width="stretch",
    )


def show_summary(summary: Summary) -> None:
    cards = [
        (
            "Average water savings",
            f"{summary.average_savings_pct:.2f}%"
            if summary.average_savings_pct is not None
            else "—",
            "Mean of reading percentages",
        ),
        ("Water saved", f"{summary.water_saved_l:.2f} L", "Modeled hourly savings"),
        ("Operational records", str(summary.record_count), "Workbook readings"),
        ("Application scenarios", str(summary.scenario_count), "Configured scenarios"),
    ]
    # Two columns keep full values readable on laptop screens with an open sidebar.
    for start in (0, 2):
        for column, (label, value, note) in zip(
            st.columns(2), cards[start : start + 2], strict=True
        ):
            with column:
                with st.container(border=True):
                    st.metric(label, value)
                    st.caption(note)


def main() -> None:
    st.set_page_config(
        page_title="DesertSkin-X | Water intelligence",
        page_icon=":material/water_drop:",
        layout="wide",
    )

    with st.sidebar:
        st.title(":material/water_drop: DesertSkin-X")
        st.caption("RESPONSIVE MATERIALS · RESOURCE INTELLIGENCE")
        st.divider()
        st.subheader("Built for a changing climate.")
        st.write("A window into humidity-responsive membranes and modeled water use.")
        st.divider()
        st.caption("LOCAL PRESENTATION · READ-ONLY")

    st.badge("Demo / synthetic", icon=":material/science:", color="orange")
    introduction, schematic = st.columns([1.6, 1], gap="large", vertical_alignment="center")
    with introduction:
        st.caption("DESERTSKIN-X / DIGITAL PLATFORM")
        st.title("One membrane. Many possibilities.")
        st.write(
            "Humidity-responsive materials meet water intelligence. "
            "Explore eight applications through transparent demo evidence."
        )
    with schematic:
        st.image(
            str(Path(__file__).resolve().parent / "assets" / "membrane.svg"), width="stretch"
        )
    st.divider()

    configured_source = os.environ.get("DESERTSKIN_WORKBOOK", "").strip()
    if not configured_source:
        st.info("Connect the demo workbook to begin.", icon=":material/folder_open:")
        st.caption(
            "Presenter setup: set DESERTSKIN_WORKBOOK to the trusted Excel workbook’s "
            "local path, then restart the app."
        )
        st.stop()

    try:
        dataset = load_dataset(Path(configured_source))
    except WorkbookError as error:
        st.error(str(error), icon=":material/error:")
        st.caption(
            "Check that DESERTSKIN_WORKBOOK points to the original, readable .xlsx file "
            "with its Telemetry sheet and Record ID header, then restart the app."
        )
        st.stop()

    with st.sidebar:
        st.divider()
        st.caption("EXPLORE A DEPLOYMENT")
        options = [ALL_SCENARIOS, *dataset.scenarios]
        if st.session_state.get("scenario_selection", ALL_SCENARIOS) not in options:
            reset_scenario()
        selected = st.selectbox(
            "Scenario",
            options,
            key="scenario_selection",
            format_func=lambda key: (
                key
                if key == ALL_SCENARIOS
                else (
                    f"{key} · {dataset.scenarios[key].sector} — "
                    f"{dataset.scenarios[key].use_case}"
                )
            ),
        )
        st.button("Reset to all scenarios", on_click=reset_scenario, width="stretch")
    scenario_id = None if selected == ALL_SCENARIOS else selected
    readings = select_readings(dataset.readings, scenario_id)
    if scenario_id:
        scenario = dataset.scenarios[scenario_id]
        st.subheader(f"{scenario.sector} / {scenario.use_case}")
        st.caption(
            f"{scenario.scenario_id} · {scenario.membrane_id} · "
            f"{scenario.area_m2:g} m² · Scenario projection: {scenario.decision}"
        )
        st.caption(
            f"Separate daily scenario model: {scenario.baseline_water_l_day:g} L/day baseline "
            "→ "
            f"{scenario.projected_water_l_day:.2f} L/day projected use."
        )
    else:
        st.subheader("Your water intelligence, at a glance.")
    if readings:
        st.caption(
            f"{readings[0].timestamp:%d %b %Y, %H:%M} — "
            f"{readings[-1].timestamp:%d %b %Y, %H:%M} · "
            "Workbook time · timezone unspecified"
        )
    show_summary(
        summarize(
            readings, dataset.settings.time_step_h, 1 if scenario_id else len(dataset.scenarios)
        )
    )
    st.caption(f"{len(readings)} operational records · Demo / synthetic")
    st.info(
        "Modeled operation, not experimentally validated performance. "
        f"Each reading represents {dataset.settings.time_step_h:g} modeled hour(s).",
        icon=":material/science:",
    )
    trends, detail, alerts, materials = st.tabs(
        ["Humidity & temperature", "Operational records", "Alerts", "Material library"]
    )
    with trends:
        if not readings:
            st.info("No operational records match this selection. Trends are unavailable.")
        else:
            st.subheader("The rhythm of the environment")
            st.caption(
                f"Shaded RH target band: {dataset.settings.target_rh_lower_pct:g}–"
                f"{dataset.settings.target_rh_upper_pct:g}% · Traces grouped by deployment"
            )
            st.altair_chart(humidity_chart(readings, dataset.settings), width="stretch")
            st.caption(
                f"Temperature alarm above {dataset.settings.alert_temperature_high_c:g} °C "
                "· Dashed line marks the threshold"
            )
            st.altair_chart(temperature_chart(readings, dataset.settings), width="stretch")
    with detail:
        if not readings:
            st.info("No operational records match this selection. The record table is empty.")
        else:
            st.subheader("Follow every reading")
            st.dataframe(
                [
                    {
                        "Record": row.record_id,
                        "Workbook time": row.timestamp,
                        "Scenario": row.scenario_id,
                        "Sample": row.membrane_id,
                        "External RH (%)": row.external_rh_pct,
                        "Internal RH (%)": row.internal_rh_pct,
                        "Temperature (°C)": row.temperature_c,
                        "Water flow input (L/h)": row.water_flow_lph,
                        "Baseline (L/h)": row.water_baseline_lph,
                        "Modeled use (L/h)": row.water_use_lph,
                        "Saved (L/h)": row.water_saved_lph,
                        "Savings (%)": row.water_savings_pct,
                        "Transport proxy WVTR (g/m²/day)": row.wvtr_g_m2_day,
                        "Humidity risk": row.humidity_risk,
                        "Health score": row.health_score,
                        "Alert": row.alert,
                    }
                    for row in readings
                ],
                hide_index=True,
                width="stretch",
            )
            st.caption(
                "Water flow and modeled use are different inputs. The time between readings "
                "of one deployment is not the modeled integration interval."
            )
    with alerts:
        show_alerts(readings, dataset)
    with materials:
        show_materials(dataset)
    st.divider()
    with st.expander("About the membrane & the evidence"):
        st.write(
            "A porous aerogel supports a humidity-sensitive hydrogel. Hydration and swelling "
            "may change vapor resistance; the direction and magnitude require experimental "
            "validation. Vapor flow depends on the vapor-pressure gradient."
        )
        st.write(
            "The profile's 20% lower water use and 30% less condensate are development "
            "targets. "
            "Passive actuation refers to the material; monitoring and analytics require power."
        )
        st.caption(
            "Source: DesertSkin-X English project profile and demo workbook. "
            "Poster percentages "
            "and kg/m²/day values are not combined with workbook metrics."
        )
        st.text(f"Workbook SHA-256: {dataset.fingerprint}")
    st.caption("DesertSkin-X · Passive material response. Powered monitoring.")


if __name__ == "__main__":
    main()
