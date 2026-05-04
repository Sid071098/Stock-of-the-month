# Sales Pipeline & Revenue Forecasting

An end-to-end data analytics portfolio project using CRM-style opportunity data. The project mirrors common revenue analytics work: sales funnel health, win rates, deal velocity, rep performance, source quality, and forward revenue forecasting.

## Project Story

A revenue leader wants to understand whether the sales team has enough healthy pipeline to hit upcoming targets. This analysis turns raw opportunity records into executive-ready KPIs, SQL outputs, and a dashboard that explains what is happening in the funnel and where to act.

## Tools Used

- Python 3 standard library for data generation and repeatable analysis
- SQLite for SQL analytics
- HTML, CSS, and JavaScript for the dashboard
- CSV and JSON outputs for dashboarding or BI-tool import

No external Python packages are required.

## Folder Structure

```text
sales-pipeline-revenue-forecasting/
  dashboard/                 Browser dashboard
  data/raw/                  Generated CRM opportunity data
  data/processed/            SQLite database, CSV outputs, dashboard JSON
  docs/                      Business insights, resume bullets, data dictionary
  scripts/                   Data generation, database load, analysis
  sql/                       Standalone SQL queries
```

## How To Run

From this folder:

```bash
python3 scripts/generate_data.py
python3 scripts/build_database.py
python3 scripts/run_analysis.py
```

Then open:

```text
dashboard/index.html
```

The dashboard uses `dashboard/dashboard-data.js`, so it can be opened directly in a browser without a server.

## Key Outputs

- `data/raw/crm_opportunities.csv`: raw CRM-style opportunity dataset
- `data/processed/sales_pipeline.db`: SQLite database
- `data/processed/funnel_by_stage.csv`: stage-level funnel health
- `data/processed/rep_performance.csv`: sales rep KPI table
- `data/processed/source_performance.csv`: lead-source conversion analysis
- `data/processed/monthly_revenue.csv`: historical won revenue
- `data/processed/revenue_forecast.csv`: six-month forecast
- `dashboard/index.html`: executive dashboard
- `docs/data_dictionary.md`: field definitions and stage probability logic

## KPIs Included

- Total pipeline value
- Weighted open pipeline
- Won revenue
- Win rate
- Average sales cycle length
- Funnel value by stage
- Lead source win rate
- Rep-level booked revenue and coverage
- Six-month revenue forecast

## Forecast Method

The forecast combines two signals:

1. A linear trend based on the most recent monthly won revenue.
2. Open weighted pipeline by expected close month.

The final forecast uses a blended value:

```text
pipeline_adjusted_forecast = trend_forecast * 0.45 + weighted_pipeline * 0.55
```

This keeps the model explainable for a business audience while still accounting for future-dated pipeline.

## Resume Bullet

Built an end-to-end sales pipeline analytics project using Python, SQLite, SQL, and JavaScript to analyze 2,600 CRM opportunities, measure funnel conversion and rep performance, and forecast six-month revenue using historical trends plus weighted open pipeline.
