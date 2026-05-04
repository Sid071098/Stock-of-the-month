#!/usr/bin/env python3
"""Generate realistic CRM opportunity data for a sales analytics portfolio project."""

from __future__ import annotations

import csv
import random
from datetime import date, datetime, timedelta
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / "data" / "raw" / "crm_opportunities.csv"
TODAY = date(2026, 4, 30)
START_DATE = date(2024, 1, 1)
random.seed(42)


REPS = [
    ("Avery Chen", "Enterprise"),
    ("Maya Patel", "Enterprise"),
    ("Jordan Smith", "Mid-Market"),
    ("Sofia Garcia", "Mid-Market"),
    ("Ethan Brown", "SMB"),
    ("Noah Wilson", "SMB"),
    ("Liam Davis", "Strategic"),
    ("Priya Shah", "Strategic"),
]

SEGMENTS = {
    "SMB": (3000, 18000),
    "Mid-Market": (15000, 65000),
    "Enterprise": (55000, 180000),
    "Strategic": (120000, 420000),
}

INDUSTRIES = ["Software", "Healthcare", "Financial Services", "Retail", "Manufacturing", "Education"]
REGIONS = ["West", "Northeast", "South", "Midwest", "International"]
SOURCES = ["Inbound Demo", "Outbound", "Partner Referral", "Webinar", "Paid Search", "Customer Referral"]
STAGES = ["Prospecting", "Discovery", "Proposal", "Negotiation", "Closed Won", "Closed Lost"]
PROBABILITY = {
    "Prospecting": 0.10,
    "Discovery": 0.25,
    "Proposal": 0.50,
    "Negotiation": 0.75,
    "Closed Won": 1.00,
    "Closed Lost": 0.00,
}


def random_date(start: date, end: date) -> date:
    span = (end - start).days
    return start + timedelta(days=random.randint(0, span))


def amount_for_segment(segment: str) -> int:
    low, high = SEGMENTS[segment]
    value = random.lognormvariate(0.0, 0.45)
    scaled = low + (high - low) * min(value / 2.6, 1)
    return int(round(scaled / 100.0) * 100)


def close_duration(segment: str) -> int:
    base = {
        "SMB": 34,
        "Mid-Market": 58,
        "Enterprise": 92,
        "Strategic": 126,
    }[segment]
    return max(9, int(random.gauss(base, base * 0.35)))


def win_probability(segment: str, source: str, industry: str, rep_name: str) -> float:
    probability = {
        "SMB": 0.24,
        "Mid-Market": 0.31,
        "Enterprise": 0.35,
        "Strategic": 0.28,
    }[segment]
    probability += {
        "Customer Referral": 0.16,
        "Partner Referral": 0.10,
        "Inbound Demo": 0.06,
        "Webinar": 0.01,
        "Paid Search": -0.03,
        "Outbound": -0.06,
    }[source]
    if industry in {"Software", "Financial Services"}:
        probability += 0.04
    if rep_name in {"Avery Chen", "Priya Shah", "Sofia Garcia"}:
        probability += 0.05
    return min(max(probability, 0.08), 0.70)


def current_open_stage(age_days: int, segment: str) -> str:
    cycle = close_duration(segment)
    progress = age_days / cycle
    if progress < 0.35:
        return random.choices(["Prospecting", "Discovery"], weights=[65, 35], k=1)[0]
    if progress < 0.65:
        return random.choices(["Discovery", "Proposal"], weights=[35, 65], k=1)[0]
    return random.choices(["Proposal", "Negotiation"], weights=[45, 55], k=1)[0]


def make_rows(count: int = 2600) -> list[dict[str, object]]:
    rows: list[dict[str, object]] = []
    for i in range(1, count + 1):
        rep_name, primary_segment = random.choice(REPS)
        segment = random.choices(
            list(SEGMENTS),
            weights=[38, 31, 22, 9] if primary_segment != "Strategic" else [8, 17, 35, 40],
            k=1,
        )[0]
        if random.random() < 0.58:
            segment = primary_segment

        created = random_date(START_DATE, TODAY - timedelta(days=7))
        source = random.choice(SOURCES)
        industry = random.choice(INDUSTRIES)
        region = random.choice(REGIONS)
        amount = amount_for_segment(segment)
        planned_cycle = close_duration(segment)
        expected_close = created + timedelta(days=planned_cycle + random.randint(-12, 18))

        age = (TODAY - created).days
        can_be_closed = age > planned_cycle * random.uniform(0.65, 1.3)
        status = "Open"
        stage = current_open_stage(age, segment)
        close_date = ""
        days_to_close = ""
        is_won = ""

        if can_be_closed and random.random() < 0.78:
            won = random.random() < win_probability(segment, source, industry, rep_name)
            stage = "Closed Won" if won else "Closed Lost"
            status = "Won" if won else "Lost"
            actual_cycle = max(7, int(random.gauss(planned_cycle, planned_cycle * 0.22)))
            close_dt = min(created + timedelta(days=actual_cycle), TODAY)
            close_date = close_dt.isoformat()
            days_to_close = (close_dt - created).days
            is_won = 1 if won else 0

        rows.append(
            {
                "opportunity_id": f"OPP-{i:05d}",
                "created_date": created.isoformat(),
                "expected_close_date": expected_close.isoformat(),
                "close_date": close_date,
                "sales_rep": rep_name,
                "region": region,
                "account_segment": segment,
                "industry": industry,
                "lead_source": source,
                "stage": stage,
                "status": status,
                "amount": amount,
                "stage_probability": PROBABILITY[stage],
                "weighted_pipeline": round(amount * PROBABILITY[stage], 2),
                "days_to_close": days_to_close,
                "is_won": is_won,
            }
        )
    return rows


def main() -> None:
    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    rows = make_rows()
    with OUTPUT.open("w", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=list(rows[0]))
        writer.writeheader()
        writer.writerows(rows)
    print(f"Wrote {len(rows):,} CRM opportunities to {OUTPUT}")


if __name__ == "__main__":
    main()
