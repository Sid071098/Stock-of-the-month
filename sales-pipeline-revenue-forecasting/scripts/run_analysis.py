#!/usr/bin/env python3
"""Run SQL analytics, create dashboard data, and build revenue forecasts."""

from __future__ import annotations

import csv
import json
import sqlite3
from collections import defaultdict
from datetime import date
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
DB_PATH = ROOT / "data" / "processed" / "sales_pipeline.db"
OUT_DIR = ROOT / "data" / "processed"
DASHBOARD_JS = ROOT / "dashboard" / "dashboard-data.js"


QUERIES = {
    "funnel_by_stage": """
        SELECT
            stage,
            COUNT(*) AS opportunities,
            ROUND(SUM(amount), 2) AS pipeline_value,
            ROUND(SUM(weighted_pipeline), 2) AS weighted_pipeline
        FROM opportunities
        GROUP BY stage
        ORDER BY CASE stage
            WHEN 'Prospecting' THEN 1
            WHEN 'Discovery' THEN 2
            WHEN 'Proposal' THEN 3
            WHEN 'Negotiation' THEN 4
            WHEN 'Closed Won' THEN 5
            WHEN 'Closed Lost' THEN 6
        END;
    """,
    "rep_performance": """
        SELECT
            sales_rep,
            COUNT(*) AS total_opportunities,
            SUM(CASE WHEN status = 'Won' THEN 1 ELSE 0 END) AS won_deals,
            ROUND(100.0 * SUM(CASE WHEN status = 'Won' THEN 1 ELSE 0 END)
                / NULLIF(SUM(CASE WHEN status IN ('Won', 'Lost') THEN 1 ELSE 0 END), 0), 1) AS win_rate_pct,
            ROUND(SUM(CASE WHEN status = 'Won' THEN amount ELSE 0 END), 2) AS won_revenue,
            ROUND(AVG(CASE WHEN status = 'Won' THEN days_to_close END), 1) AS avg_days_to_close,
            ROUND(SUM(CASE WHEN status = 'Open' THEN weighted_pipeline ELSE 0 END), 2) AS open_weighted_pipeline
        FROM opportunities
        GROUP BY sales_rep
        ORDER BY won_revenue DESC;
    """,
    "source_performance": """
        SELECT
            lead_source,
            COUNT(*) AS total_opportunities,
            ROUND(100.0 * SUM(CASE WHEN status = 'Won' THEN 1 ELSE 0 END)
                / NULLIF(SUM(CASE WHEN status IN ('Won', 'Lost') THEN 1 ELSE 0 END), 0), 1) AS win_rate_pct,
            ROUND(SUM(CASE WHEN status = 'Won' THEN amount ELSE 0 END), 2) AS won_revenue,
            ROUND(AVG(CASE WHEN status = 'Won' THEN amount END), 2) AS avg_won_deal_size
        FROM opportunities
        GROUP BY lead_source
        ORDER BY won_revenue DESC;
    """,
    "monthly_revenue": """
        SELECT
            substr(close_date, 1, 7) AS month,
            COUNT(*) AS won_deals,
            ROUND(SUM(amount), 2) AS won_revenue
        FROM opportunities
        WHERE status = 'Won'
        GROUP BY substr(close_date, 1, 7)
        ORDER BY month;
    """,
    "pipeline_by_expected_month": """
        SELECT
            substr(expected_close_date, 1, 7) AS month,
            COUNT(*) AS open_opportunities,
            ROUND(SUM(amount), 2) AS open_pipeline,
            ROUND(SUM(weighted_pipeline), 2) AS weighted_pipeline
        FROM opportunities
        WHERE status = 'Open'
        GROUP BY substr(expected_close_date, 1, 7)
        ORDER BY month;
    """,
    "segment_performance": """
        SELECT
            account_segment,
            COUNT(*) AS total_opportunities,
            ROUND(100.0 * SUM(CASE WHEN status = 'Won' THEN 1 ELSE 0 END)
                / NULLIF(SUM(CASE WHEN status IN ('Won', 'Lost') THEN 1 ELSE 0 END), 0), 1) AS win_rate_pct,
            ROUND(SUM(CASE WHEN status = 'Won' THEN amount ELSE 0 END), 2) AS won_revenue,
            ROUND(AVG(CASE WHEN status = 'Won' THEN amount END), 2) AS avg_won_deal_size,
            ROUND(AVG(CASE WHEN status = 'Won' THEN days_to_close END), 1) AS avg_sales_cycle_days
        FROM opportunities
        GROUP BY account_segment
        ORDER BY won_revenue DESC;
    """,
}


def rows_for_query(conn: sqlite3.Connection, sql: str) -> list[dict[str, object]]:
    conn.row_factory = sqlite3.Row
    return [dict(row) for row in conn.execute(sql).fetchall()]


def write_csv(name: str, rows: list[dict[str, object]]) -> None:
    if not rows:
        return
    path = OUT_DIR / f"{name}.csv"
    with path.open("w", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=list(rows[0]))
        writer.writeheader()
        writer.writerows(rows)


def add_month(month: str, offset: int) -> str:
    year, mon = [int(part) for part in month.split("-")]
    mon += offset
    year += (mon - 1) // 12
    mon = ((mon - 1) % 12) + 1
    return f"{year:04d}-{mon:02d}"


def linear_forecast(monthly: list[dict[str, object]], horizon: int = 6) -> list[dict[str, object]]:
    recent = monthly[-12:] if len(monthly) >= 12 else monthly
    xs = list(range(len(recent)))
    ys = [float(row["won_revenue"]) for row in recent]
    if not ys:
        return []
    x_mean = sum(xs) / len(xs)
    y_mean = sum(ys) / len(ys)
    denominator = sum((x - x_mean) ** 2 for x in xs) or 1
    slope = sum((x - x_mean) * (y - y_mean) for x, y in zip(xs, ys)) / denominator
    intercept = y_mean - slope * x_mean
    last_month = str(monthly[-1]["month"])
    forecasts = []
    for step in range(1, horizon + 1):
        trend_value = max(0, intercept + slope * (len(recent) - 1 + step))
        forecasts.append({"month": add_month(last_month, step), "trend_forecast": round(trend_value, 2)})
    return forecasts


def build_pipeline_adjusted_forecast(
    trend: list[dict[str, object]], pipeline: list[dict[str, object]]
) -> list[dict[str, object]]:
    pipeline_by_month = {str(row["month"]): float(row["weighted_pipeline"]) for row in pipeline}
    forecast = []
    for row in trend:
        month = str(row["month"])
        trend_value = float(row["trend_forecast"])
        pipeline_value = pipeline_by_month.get(month, 0.0)
        forecast.append(
            {
                "month": month,
                "trend_forecast": round(trend_value, 2),
                "weighted_pipeline": round(pipeline_value, 2),
                "pipeline_adjusted_forecast": round((trend_value * 0.45) + (pipeline_value * 0.55), 2),
            }
        )
    return forecast


def summary_metrics(conn: sqlite3.Connection) -> dict[str, object]:
    row = conn.execute(
        """
        SELECT
            COUNT(*) AS total_opportunities,
            ROUND(SUM(amount), 2) AS total_pipeline_value,
            ROUND(SUM(CASE WHEN status = 'Open' THEN weighted_pipeline ELSE 0 END), 2) AS open_weighted_pipeline,
            ROUND(SUM(CASE WHEN status = 'Won' THEN amount ELSE 0 END), 2) AS won_revenue,
            ROUND(100.0 * SUM(CASE WHEN status = 'Won' THEN 1 ELSE 0 END)
                / NULLIF(SUM(CASE WHEN status IN ('Won', 'Lost') THEN 1 ELSE 0 END), 0), 1) AS win_rate_pct,
            ROUND(AVG(CASE WHEN status = 'Won' THEN days_to_close END), 1) AS avg_sales_cycle_days
        FROM opportunities;
        """
    ).fetchone()
    return dict(row)


def recommendations(data: dict[str, list[dict[str, object]]]) -> list[str]:
    sources = sorted(data["source_performance"], key=lambda r: float(r["win_rate_pct"] or 0), reverse=True)
    reps = sorted(data["rep_performance"], key=lambda r: float(r["open_weighted_pipeline"] or 0), reverse=True)
    segments = sorted(data["segment_performance"], key=lambda r: float(r["avg_sales_cycle_days"] or 999))
    return [
        f"Prioritize {sources[0]['lead_source']} and {sources[1]['lead_source']} because they show the strongest conversion quality.",
        f"Review late-stage pipeline coverage for {reps[0]['sales_rep']}; this rep owns the largest weighted open pipeline.",
        f"Use the {segments[0]['account_segment']} sales motion as the fast-cycle benchmark and document what shortens deal velocity.",
    ]


def main() -> None:
    if not DB_PATH.exists():
        raise FileNotFoundError(f"Missing {DB_PATH}. Run scripts/build_database.py first.")

    OUT_DIR.mkdir(parents=True, exist_ok=True)
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    try:
        data = {name: rows_for_query(conn, query) for name, query in QUERIES.items()}
        for name, rows in data.items():
            write_csv(name, rows)

        forecast = build_pipeline_adjusted_forecast(
            linear_forecast(data["monthly_revenue"]),
            data["pipeline_by_expected_month"],
        )
        data["revenue_forecast"] = forecast
        write_csv("revenue_forecast", forecast)

        dashboard = {
            "generated_on": date.today().isoformat(),
            "summary": summary_metrics(conn),
            "tables": data,
            "recommendations": recommendations(data),
        }
        DASHBOARD_JS.write_text("window.PIPELINE_DATA = " + json.dumps(dashboard, indent=2) + ";\n")
        (OUT_DIR / "dashboard_data.json").write_text(json.dumps(dashboard, indent=2) + "\n")
    finally:
        conn.close()

    print(f"Wrote analysis outputs to {OUT_DIR}")
    print(f"Wrote dashboard data to {DASHBOARD_JS}")


if __name__ == "__main__":
    main()
