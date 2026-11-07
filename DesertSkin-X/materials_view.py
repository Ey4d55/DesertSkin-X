"""Matched-condition material comparisons, separate from operational telemetry."""

from collections.abc import Sequence

import streamlit as st

from metrics import select_materials
from models import Dataset, MaterialReading


def _property_table(rows: Sequence[MaterialReading]) -> None:
    st.dataframe(
        [
            {
                "Sample": row.membrane_id,
                "WVTR (g/m²/day)": row.wvtr_g_m2_day,
                "Permeance (g/m²/day/kPa)": row.permeance_g_m2_day_kpa,
                "Swelling (%)": row.swelling_pct,
                "RH (%)": row.rh_pct,
                "Temperature (°C)": row.temperature_c,
                "Provenance": row.provenance,
            }
            for row in rows
        ],
        hide_index=True,
        width="stretch",
    )


def show_materials(dataset: Dataset) -> None:
    st.subheader("Different formulations. A shared test condition.")
    st.caption(
        "Demo material inputs · Gravimetric calculations · Not experimental validation. "
        "Material WVTR and the telemetry transport proxy use different models."
    )
    physical = [
        key
        for key, value in dataset.samples.items()
        if key != "S7" and value.sample_type != "Control"
    ]
    rh_levels = sorted({row.rh_pct for row in dataset.materials})
    if not rh_levels or not physical:
        st.info("No physical material conditions are available.")
        return
    condition, selection = st.columns([1, 2])
    with condition:
        rh = st.selectbox(
            "Relative humidity (%)",
            rh_levels,
            index=rh_levels.index(50) if 50 in rh_levels else 0,
            format_func=lambda value: f"{value:g}% RH",
            key="material_rh",
        )
    with selection:
        preferred = [key for key in ("S4", "S0") if key in physical]
        selected = st.multiselect(
            "Physical formulations",
            physical,
            default=preferred or physical[:1],
            key="material_samples",
        )
    matched = select_materials(dataset.materials, selected, rh)
    if not selected:
        st.info("Choose at least one physical formulation to compare.")
    elif len(matched) != len(selected):
        st.warning("A selected formulation has no material row at this RH.")
    else:
        _property_table(matched)
        for row in matched:
            sample = dataset.samples[row.membrane_id]
            with st.container(border=True):
                st.write(f"**{row.membrane_id} · {sample.sample_type}**")
                st.text(sample.formulation)
                st.caption(
                    f"{row.wvtr_g_m2_day:.2f} g/m²/day WVTR · "
                    f"{row.swelling_pct:.2f}% swelling · {sample.validation}"
                )
                st.caption(f"Permeance: {row.permeance_g_m2_day_kpa:.2f} g/m²/day/kPa")
    if "S7" in dataset.samples and st.checkbox(
        "Include S7 open-aperture reference", key="include_reference"
    ):
        st.subheader("Open aperture / S7")
        st.caption(
            "No membrane. This transport reference is excluded from physical formulations."
        )
        _property_table(select_materials(dataset.materials, ["S7"], rh))
    with st.expander("Calculation inputs and units"):
        st.dataframe(
            [
                {
                    "Sample": row.membrane_id,
                    "RH (%)": row.rh_pct,
                    "Area (m²)": row.area_m2,
                    "Duration (h)": row.duration_h,
                    "Vapor Δp (kPa)": row.vapor_delta_kpa,
                    "Mass change (g)": row.mass_change_g,
                    "Dry mass (g)": row.dry_mass_g,
                    "Hydrated mass (g)": row.hydrated_mass_g,
                }
                for row in matched
            ],
            hide_index=True,
            width="stretch",
        )
        st.write("WVTR = mass change / area / duration in days.")
        st.write("Permeance = WVTR / vapor pressure difference.")
        st.write("Swelling (%) = 100 × (hydrated mass − dry mass) / dry mass.")
