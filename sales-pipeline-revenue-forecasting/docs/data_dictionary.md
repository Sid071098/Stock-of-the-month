# Data Dictionary

## `crm_opportunities.csv`

| Column | Description |
| --- | --- |
| `opportunity_id` | Unique CRM opportunity identifier. |
| `created_date` | Date the opportunity entered the pipeline. |
| `expected_close_date` | Expected close date for open or planned opportunities. |
| `close_date` | Actual close date for won or lost opportunities. Blank for open opportunities. |
| `sales_rep` | Salesperson assigned to the opportunity. |
| `region` | Sales region. |
| `account_segment` | Customer size segment: SMB, Mid-Market, Enterprise, or Strategic. |
| `industry` | Customer industry. |
| `lead_source` | Channel that sourced the opportunity. |
| `stage` | Current CRM stage. |
| `status` | Current outcome status: Open, Won, or Lost. |
| `amount` | Potential or booked deal value in USD. |
| `stage_probability` | Probability assigned to the current stage. |
| `weighted_pipeline` | `amount * stage_probability`, used for pipeline forecasting. |
| `days_to_close` | Number of days between creation and close for won or lost deals. |
| `is_won` | Binary won flag for closed opportunities. |

## Stage Probability Logic

| Stage | Probability |
| --- | ---: |
| Prospecting | 10% |
| Discovery | 25% |
| Proposal | 50% |
| Negotiation | 75% |
| Closed Won | 100% |
| Closed Lost | 0% |
