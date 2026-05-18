# Onboarding & CRM Sync Agent

A LangGraph backend agent that orchestrates a B2B user signup across multiple
internal systems — DB lookup, personalized email generation, mail delivery, and
CRM sync — with parallel execution and graceful per-step failure handling.

## Architecture

```
   START
     │
     ▼
 fetch_user        ← reads user record from the (mock) DB
     │
     ▼
 draft_email       ← personalized email via Claude Haiku, falls back to template
    ╱ ╲
   ╱   ╲            ← parallel fan-out: both children run in the same superstep
  ▼     ▼
send_email   sync_crm
   ╲   ╱
    ╲ ╱             ← finalize blocks until BOTH branches finish
     ▼
  finalize
     │
     ▼
    END
```

### Why this graph shape

- **`send_email` and `sync_crm` are independent** — neither one's input depends
  on the other's output. LangGraph notices both have the same parent
  (`draft_email`) and schedules them concurrently in one superstep. You can
  see this in the demo timeline: the two nodes' `start` events have the same
  `Δms = 0`, but their `done` events land at different times.
- **Each node catches its own exceptions.** A failing `send_email` does not
  prevent `sync_crm` from succeeding — the rollup just marks `final_status =
  "partial"`. The graph never throws.
- **`errors` and `events` use `operator.add` reducers** so parallel branches
  can append to them concurrently without clobbering each other (the standard
  LangGraph fan-in / fan-out safety pattern).

## Install & Run

```bash
cd onboarding-agent
python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt

# Optional — set your Anthropic key to get real LLM-generated emails.
# Without it, the agent uses a deterministic template (still personalized).
cp .env.example .env
# then edit .env to paste your key

python run_demo.py
```

You'll see five scenarios run end to end:

| user_id        | What it demonstrates                            | Expected `final_status` |
|----------------|-------------------------------------------------|------------------------|
| `u_001`        | Enterprise happy path                           | `complete`             |
| `u_002`        | Free-tier self-serve happy path                 | `complete`             |
| `u_404`        | DB lookup fails → email + CRM are skipped       | `failed`               |
| `u_email_fail` | Email API errors → CRM still succeeds           | `partial`              |
| `u_crm_fail`   | CRM rate-limited → email still goes through     | `partial`              |

## Files

```
onboarding-agent/
├── README.md
├── requirements.txt
├── .env.example
├── run_demo.py            # end-to-end demo with five scenarios
└── onboarding/
    ├── state.py           # TypedDict graph state + parallel-safe reducers
    ├── services.py        # mock DB, mail API, CRM (latency + injected failures)
    ├── llm.py             # Claude Haiku email drafter + templated fallback
    ├── nodes.py           # five LangGraph node functions (all async, all catch)
    └── graph.py           # graph wiring (fan-out + fan-in)
```

## State shape

```python
class OnboardingState(TypedDict, total=False):
    user_id: str
    user: Optional[UserRecord]
    email_subject: Optional[str]
    email_body: Optional[str]

    fetch_result: StepResult     # {status, detail, error?, elapsed_ms}
    draft_result: StepResult
    email_result: StepResult
    crm_result:   StepResult

    errors: Annotated[list[str], operator.add]          # parallel-safe
    events: Annotated[list[TimelineEvent], operator.add]  # parallel-safe

    final_status: Literal["complete", "partial", "failed"]
```

## Hooking up real services

Each function in `onboarding/services.py` has a clear async signature:

```python
async def fetch_user_from_db(user_id: str) -> dict
async def send_onboarding_email(*, to, subject, body, user_id) -> dict
async def upsert_crm_record(user: dict) -> dict
```

Swap them for real implementations (psycopg, SendGrid, Salesforce REST, etc.) —
the rest of the graph is unchanged. Raise `ServiceError` from the new bodies to
keep the existing per-node failure handling working.

## Extending the graph

Common next steps:
- **Retries:** wrap the failing nodes with `add_conditional_edges` that loop
  back N times on `status == "failed"`.
- **Checkpointing:** pass a `SqliteSaver`/`MemorySaver` to `compile()` so a
  partial onboarding can be resumed mid-graph.
- **More parallel branches:** add (e.g.) `provision_workspace` and
  `enqueue_segment_event` nodes as siblings of `send_email` / `sync_crm`.
  They'll join the same superstep automatically.
