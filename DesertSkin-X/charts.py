"""Local charts with explicit units, operating bands and deployment groups."""

from collections.abc import Sequence
from typing import cast

import altair as alt

from models import Reading, Settings


def humidity_chart(readings: Sequence[Reading], settings: Settings) -> alt.LayerChart:
    values = [
        {
            "time": row.timestamp.isoformat(),
            "scenario": row.scenario_id,
            "series": series,
            "rh": rh,
        }
        for row in readings
        for series, rh in (
            ("Internal RH", row.internal_rh_pct),
            ("External RH", row.external_rh_pct),
        )
    ]
    band = (
        alt.Chart(
            alt.Data(  # type: ignore[no-untyped-call]  # Altair's generated schema constructor.
                values=[
                    {
                        "lower": settings.target_rh_lower_pct,
                        "upper": settings.target_rh_upper_pct,
                    }
                ]
            )
        )
        .mark_rect(color="#D7E7CC", opacity=0.65)
        .encode(
            y=alt.Y("lower:Q", title="Relative humidity (%)", scale=alt.Scale(domain=[0, 100])),
            y2="upper:Q",
        )
    )
    traces = (
        alt.Chart(alt.Data(values=values))  # type: ignore[no-untyped-call]
        .mark_line(strokeWidth=2.2)
        .encode(
            x=alt.X(
                "time:T",
                title="Workbook time (timezone unspecified)",
                axis=alt.Axis(format="%d %b", tickCount=7, labelAngle=0),
            ),
            y=alt.Y("rh:Q", title="Relative humidity (%)", scale=alt.Scale(domain=[0, 100])),
            color=alt.Color(
                "series:N",
                title=None,
                scale=alt.Scale(
                    domain=["Internal RH", "External RH"], range=["#21684E", "#B17B30"]
                ),
            ),
            detail="scenario:N",
            tooltip=[
                alt.Tooltip("time:T", title="Workbook time", format="%d %b %H:%M"),
                alt.Tooltip("scenario:N", title="Scenario"),
                "series:N",
                alt.Tooltip("rh:Q", title="RH (%)", format=".2f"),
            ],
        )
    )
    return cast(alt.LayerChart, (band + traces).properties(height=290))


def temperature_chart(readings: Sequence[Reading], settings: Settings) -> alt.LayerChart:
    data = alt.Data(  # type: ignore[no-untyped-call]
        values=[
            {
                "time": row.timestamp.isoformat(),
                "scenario": row.scenario_id,
                "temperature": row.temperature_c,
            }
            for row in readings
        ]
    )
    traces = (
        alt.Chart(data)
        .mark_line(color="#AB6C42", strokeWidth=2)
        .encode(
            x=alt.X(
                "time:T",
                title="Workbook time (timezone unspecified)",
                axis=alt.Axis(format="%d %b", tickCount=7, labelAngle=0),
            ),
            y=alt.Y("temperature:Q", title="Temperature (°C)", scale=alt.Scale(zero=False)),
            detail="scenario:N",
            tooltip=[
                alt.Tooltip("time:T", title="Workbook time", format="%d %b %H:%M"),
                alt.Tooltip("scenario:N", title="Scenario"),
                alt.Tooltip("temperature:Q", title="Temperature (°C)", format=".2f"),
            ],
        )
    )
    threshold = (
        alt.Chart(alt.Data(values=[{"limit": settings.alert_temperature_high_c}]))  # type: ignore[no-untyped-call]
        .mark_rule(color="#B44432", strokeDash=[5, 4])
        .encode(
            y="limit:Q", tooltip=[alt.Tooltip("limit:Q", title="High-temperature limit (°C)")]
        )
    )
    return cast(alt.LayerChart, (traces + threshold).properties(height=190))
