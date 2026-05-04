#!/usr/bin/env python3
"""Load raw CRM CSV data into SQLite for repeatable SQL analysis."""

from __future__ import annotations

import csv
import sqlite3
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
RAW_CSV = ROOT / "data" / "raw" / "crm_opportunities.csv"
DB_PATH = ROOT / "data" / "processed" / "sales_pipeline.db"


SCHEMA = """
DROP TABLE IF EXISTS opportunities;

CREATE TABLE opportunities (
    opportunity_id TEXT PRIMARY KEY,
    created_date TEXT NOT NULL,
    expected_close_date TEXT NOT NULL,
    close_date TEXT,
    sales_rep TEXT NOT NULL,
    region TEXT NOT NULL,
    account_segment TEXT NOT NULL,
    industry TEXT NOT NULL,
    lead_source TEXT NOT NULL,
    stage TEXT NOT NULL,
    status TEXT NOT NULL,
    amount REAL NOT NULL,
    stage_probability REAL NOT NULL,
    weighted_pipeline REAL NOT NULL,
    days_to_close INTEGER,
    is_won INTEGER
);
"""


def clean_value(key: str, value: str):
    if value == "":
        return None
    if key in {"amount", "stage_probability", "weighted_pipeline"}:
        return float(value)
    if key in {"days_to_close", "is_won"}:
        return int(value)
    return value


def main() -> None:
    if not RAW_CSV.exists():
        raise FileNotFoundError(f"Missing {RAW_CSV}. Run scripts/generate_data.py first.")

    DB_PATH.parent.mkdir(parents=True, exist_ok=True)
    conn = sqlite3.connect(DB_PATH)
    try:
        conn.executescript(SCHEMA)
        with RAW_CSV.open(newline="") as f:
            reader = csv.DictReader(f)
            rows = [{k: clean_value(k, v) for k, v in row.items()} for row in reader]

        columns = list(rows[0])
        placeholders = ", ".join(["?"] * len(columns))
        conn.executemany(
            f"INSERT INTO opportunities ({', '.join(columns)}) VALUES ({placeholders})",
            [[row[column] for column in columns] for row in rows],
        )
        conn.commit()
    finally:
        conn.close()

    print(f"Loaded {len(rows):,} rows into {DB_PATH}")


if __name__ == "__main__":
    main()
