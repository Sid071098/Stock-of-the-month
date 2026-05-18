"""End-to-end demo runner.

Runs four scenarios through the agent and prints:
  1. Final rollup (per-step status + final_status + errors)
  2. The interleaved timeline — the proof of parallel execution

Run:    python run_demo.py
"""

from __future__ import annotations

import asyncio
import json
import os
from typing import Any

from onboarding import build_graph

SCENARIOS = [
    {
        "user_id": "u_001",
        "name": "enterprise account (happy path)",
        "expect": "complete",
    },
    {
        "user_id": "u_002",
        "name": "self-serve free user",
        "expect": "complete",
    },
    {
        "user_id": "u_404",
        "name": "missing user — DB fetch fails, downstream skipped",
        "expect": "failed",
    },
    {
        "user_id": "u_email_fail",
        "name": "email API down — CRM still succeeds (partial)",
        "expect": "partial",
    },
    {
        "user_id": "u_crm_fail",
        "name": "CRM rate-limited — email still goes (partial)",
        "expect": "partial",
    },
]


def _try_load_env() -> None:
    """Tiny .env loader so users don't need python-dotenv."""
    path = os.path.join(os.path.dirname(__file__), ".env")
    if not os.path.exists(path):
        return
    with open(path, encoding="utf-8") as fh:
        for line in fh:
            line = line.strip()
            if not line or line.startswith("#") or "=" not in line:
                continue
            key, _, value = line.partition("=")
            key = key.strip()
            value = value.strip().strip("\"'")
            if key and key not in os.environ:
                os.environ[key] = value


def _summarize(state: dict[str, Any]) -> dict[str, Any]:
    return {
        "final_status": state.get("final_status"),
        "fetch": state.get("fetch_result"),
        "draft": state.get("draft_result"),
        "email": state.get("email_result"),
        "crm": state.get("crm_result"),
        "errors": state.get("errors", []),
        "email_subject": state.get("email_subject"),
    }


def _print_timeline(events: list[dict[str, Any]]) -> None:
    if not events:
        print("  (no events recorded)")
        return
    base = min(e["t_ms"] for e in events)
    print(f"  {'ΔMS':>6}  {'NODE':<12} {'PHASE':<6}  DETAIL")
    print(f"  {'---':>6}  {'----':<12} {'-----':<6}  ------")
    for e in events:
        delta = e["t_ms"] - base
        detail = (e.get("detail") or "")[:80]
        print(f"  {delta:>6}  {e['node']:<12} {e['phase']:<6}  {detail}")


async def run() -> None:
    _try_load_env()
    graph = build_graph()

    overall_pass = True
    for scenario in SCENARIOS:
        print("\n" + "=" * 78)
        print(f"SCENARIO: {scenario['name']}")
        print(f"  user_id={scenario['user_id']}  expected={scenario['expect']}")
        print("=" * 78)

        result = await graph.ainvoke({"user_id": scenario["user_id"]})
        summary = _summarize(result)

        print("\nResult:")
        print(json.dumps(summary, indent=2))

        print("\nTimeline (Δms from first event):")
        _print_timeline(result.get("events", []))

        got = summary["final_status"]
        if got != scenario["expect"]:
            print(f"\n⚠  expected final_status={scenario['expect']!r} but got {got!r} "
                  "— this is fine if a random transient failure happened; rerun to verify.")
        else:
            print(f"\n✓  final_status={got!r} (matches expected)")

    print("\n" + "=" * 78)
    print("DONE. Tip: in the email_fail / crm_fail scenarios, notice that")
    print("send_email and sync_crm appear interleaved in the timeline —")
    print("that's LangGraph running them in parallel.")
    print("=" * 78)


if __name__ == "__main__":
    asyncio.run(run())
