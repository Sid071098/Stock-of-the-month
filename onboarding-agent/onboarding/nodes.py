"""LangGraph nodes for the onboarding agent.

Conventions:
- Each node returns a partial state dict. Keys it doesn't touch are left alone.
- All exceptions are caught inside the node; the graph never crashes.
- Each node appends a TimelineEvent for {start, done|error} so we can later
  prove parallel execution from a single log.
"""

from __future__ import annotations

from .llm import draft_onboarding_email
from .services import (
    ServiceError,
    fetch_user_from_db,
    now_ms,
    send_onboarding_email,
    upsert_crm_record,
)
from .state import OnboardingState


def _event(node: str, phase: str, detail: str | None = None) -> dict:
    return {"node": node, "phase": phase, "t_ms": now_ms(), "detail": detail}


# ---------------------------------------------------------------------------
# 1. Fetch user from DB
# ---------------------------------------------------------------------------

async def fetch_user_node(state: OnboardingState) -> dict:
    started = now_ms()
    events = [_event("fetch_user", "start")]
    try:
        user = await fetch_user_from_db(state["user_id"])
        elapsed = now_ms() - started
        events.append(_event("fetch_user", "done", f"loaded {user['email']}"))
        return {
            "user": user,
            "fetch_result": {"status": "ok", "detail": user["email"], "elapsed_ms": elapsed},
            "events": events,
        }
    except ServiceError as exc:
        elapsed = now_ms() - started
        events.append(_event("fetch_user", "error", str(exc)))
        return {
            "fetch_result": {"status": "failed", "error": str(exc), "elapsed_ms": elapsed},
            "errors": [f"fetch_user: {exc}"],
            "events": events,
        }


# ---------------------------------------------------------------------------
# 2. Draft personalized email
# ---------------------------------------------------------------------------

async def draft_email_node(state: OnboardingState) -> dict:
    started = now_ms()
    events = [_event("draft_email", "start")]
    user = state.get("user")
    if not user:
        elapsed = now_ms() - started
        events.append(_event("draft_email", "done", "skipped: no user"))
        return {
            "draft_result": {"status": "skipped", "detail": "no user record", "elapsed_ms": elapsed},
            "events": events,
        }
    try:
        result = await draft_onboarding_email(user)
        elapsed = now_ms() - started
        events.append(_event("draft_email", "done", f"source={result.get('source')}"))
        return {
            "email_subject": result["subject"],
            "email_body": result["body"],
            "draft_result": {
                "status": "ok",
                "detail": result.get("source", "unknown"),
                "elapsed_ms": elapsed,
            },
            "events": events,
        }
    except Exception as exc:  # noqa: BLE001
        elapsed = now_ms() - started
        events.append(_event("draft_email", "error", str(exc)))
        return {
            "draft_result": {"status": "failed", "error": str(exc), "elapsed_ms": elapsed},
            "errors": [f"draft_email: {exc}"],
            "events": events,
        }


# ---------------------------------------------------------------------------
# 3a. Send onboarding email (PARALLEL branch A)
# ---------------------------------------------------------------------------

async def send_email_node(state: OnboardingState) -> dict:
    started = now_ms()
    events = [_event("send_email", "start")]
    user = state.get("user")
    subject = state.get("email_subject")
    body = state.get("email_body")
    if not (user and subject and body):
        elapsed = now_ms() - started
        events.append(_event("send_email", "done", "skipped: no draft"))
        return {
            "email_result": {"status": "skipped", "detail": "no draft", "elapsed_ms": elapsed},
            "events": events,
        }
    try:
        receipt = await send_onboarding_email(
            to=user["email"],
            subject=subject,
            body=body,
            user_id=user["user_id"],
        )
        elapsed = now_ms() - started
        events.append(_event("send_email", "done", receipt["message_id"]))
        return {
            "email_result": {
                "status": "ok",
                "detail": receipt["message_id"],
                "elapsed_ms": elapsed,
            },
            "events": events,
        }
    except ServiceError as exc:
        elapsed = now_ms() - started
        events.append(_event("send_email", "error", str(exc)))
        return {
            "email_result": {"status": "failed", "error": str(exc), "elapsed_ms": elapsed},
            "errors": [f"send_email: {exc}"],
            "events": events,
        }


# ---------------------------------------------------------------------------
# 3b. Sync to CRM (PARALLEL branch B)
# ---------------------------------------------------------------------------

async def sync_crm_node(state: OnboardingState) -> dict:
    started = now_ms()
    events = [_event("sync_crm", "start")]
    user = state.get("user")
    if not user:
        elapsed = now_ms() - started
        events.append(_event("sync_crm", "done", "skipped: no user"))
        return {
            "crm_result": {"status": "skipped", "detail": "no user record", "elapsed_ms": elapsed},
            "events": events,
        }
    try:
        record = await upsert_crm_record(user)
        elapsed = now_ms() - started
        events.append(
            _event("sync_crm", "done", f"{record['object_type']} {record['crm_id']}")
        )
        return {
            "crm_result": {
                "status": "ok",
                "detail": f"{record['object_type']} {record['crm_id']}",
                "elapsed_ms": elapsed,
            },
            "events": events,
        }
    except ServiceError as exc:
        elapsed = now_ms() - started
        events.append(_event("sync_crm", "error", str(exc)))
        return {
            "crm_result": {"status": "failed", "error": str(exc), "elapsed_ms": elapsed},
            "errors": [f"sync_crm: {exc}"],
            "events": events,
        }


# ---------------------------------------------------------------------------
# 4. Finalize — roll up results into a single status
# ---------------------------------------------------------------------------

def finalize_node(state: OnboardingState) -> dict:
    statuses = [
        (state.get(key) or {}).get("status")
        for key in ("fetch_result", "draft_result", "email_result", "crm_result")
    ]
    statuses = [s for s in statuses if s]

    if statuses and all(s == "ok" for s in statuses):
        final = "complete"
    elif "ok" in statuses:
        final = "partial"
    else:
        final = "failed"

    return {
        "final_status": final,
        "events": [_event("finalize", "done", final)],
    }
