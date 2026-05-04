-- Sales Pipeline & Revenue Forecasting SQL Analysis
-- Run after scripts/build_database.py creates data/processed/sales_pipeline.db.

-- 1. Funnel health by current stage.
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

-- 2. Rep performance: win rate, booked revenue, cycle time, and open coverage.
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

-- 3. Lead source quality.
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

-- 4. Historical monthly won revenue.
SELECT
    substr(close_date, 1, 7) AS month,
    COUNT(*) AS won_deals,
    ROUND(SUM(amount), 2) AS won_revenue
FROM opportunities
WHERE status = 'Won'
GROUP BY substr(close_date, 1, 7)
ORDER BY month;

-- 5. Future open pipeline by expected close month.
SELECT
    substr(expected_close_date, 1, 7) AS month,
    COUNT(*) AS open_opportunities,
    ROUND(SUM(amount), 2) AS open_pipeline,
    ROUND(SUM(weighted_pipeline), 2) AS weighted_pipeline
FROM opportunities
WHERE status = 'Open'
GROUP BY substr(expected_close_date, 1, 7)
ORDER BY month;

-- 6. Segment performance and sales-cycle speed.
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
