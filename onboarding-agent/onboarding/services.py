"""Mock external services for the onboarding agent.

Each service simulates real-world latency and occasional transient failures so
the graph's fallback logic can be exercised. Special user_id prefixes force
deterministic failures for demo purposes.
"""

from __future__ import annotations

import asyncio
import random
import time
import uuid
from datetime import datetime, timezone
from typing import Any


class ServiceError(Exception):
    """Raised when a simulated downstream service fails."""


# ---------------------------------------------------------------------------
# In-memory user fixtures
# ---------------------------------------------------------------------------

_USERS: dict[str, dict[str, Any]] = {
    "u_001": {
        "user_id": "u_001",
        "email": "ada@quantumlabs.io",
        "first_name": "Ada",
        "last_name": "Lovelace",
        "company": "Quantum Labs",
        "role": "Head of Data Platform",
        "signup_source": "marketing_website",
        "created_at": "2026-05-18T18:00:00Z",
        "plan": "enterprise",
    },
    "u_002": {
        "user_id": "u_002",
        "email": "marcus@indie.dev",
        "first_name": "Marcus",
        "last_name": "Chen",
        "company": None,
        "role": "Solo developer",
        "signup_source": "github_oauth",
        "created_at": "2026-05-18T18:05:00Z",
        "plan": "free",
    },
    "u_003": {
        "user_id": "u_003",
        "email": "priya@northwind.com",
        "first_name": "Priya",
        "last_name": "Iyer",
        "company": "Northwind Logistics",
        "role": "VP Engineering",
        "signup_source": "partner_referral",
        "created_at": "2026-05-18T18:09:00Z",
        "plan": "pro",
    },
    # u_404 is intentionally absent — used to demo a hard fetch failure.
    "u_email_fail": {
        "user_id": "u_email_fail",
        "email": "test@deliverability.test",
        "first_name": "Test",
        "last_name": "User",
        "company": "Edge Case Co",
        "role": "QA",
        "signup_source": "internal_test",
        "created_at": "2026-05-18T18:10:00Z",
        "plan": "pro",
    },
    "u_crm_fail": {
        "user_id": "u_crm_fail",
        "email": "rate@limited.test",
        "first_name": "Rate",
        "last_name": "Limited",
        "company": "Rate Limit Co",
        "role": "QA",
        "signup_source": "internal_test",
        "created_at": "2026-05-18T18:11:00Z",
        "plan": "pro",
    },
}


# ---------------------------------------------------------------------------
# Database lookup
# ---------------------------------------------------------------------------

async def fetch_user_from_db(user_id: str) -> dict[str, Any]:
    """Looks up a user. Raises ServiceError if missing or if the simulated
    db drops the connection (~3% of the time)."""
    await asyncio.sleep(random.uniform(0.06, 0.18))
    if user_id not in _USERS:
        raise ServiceError(f"user '{user_id}' not found in users table")
    if random.random() < 0.03:
        raise ServiceError("db connection reset by peer (postgres)")
    return dict(_USERS[user_id])


# ---------------------------------------------------------------------------
# Email API
# ---------------------------------------------------------------------------

async def send_onboarding_email(
    *, to: str, subject: str, body: str, user_id: str
) -> dict[str, Any]:
    """Simulates an SMTP/REST mail API. user_id 'u_email_fail' always errors,
    otherwise ~10% transient failure rate."""
    await asyncio.sleep(random.uniform(0.30, 0.80))
    if user_id == "u_email_fail":
        raise ServiceError("smtp gateway returned 550: mailbox unavailable")
    if random.random() < 0.10:
        raise ServiceError("smtp connection timed out after 30s")
    return {
        "message_id": f"em_{uuid.uuid4().hex[:12]}",
        "to": to,
        "subject": subject,
        "body_bytes": len(body.encode("utf-8")),
        "sent_at": datetime.now(timezone.utc).isoformat(),
    }


# ---------------------------------------------------------------------------
# CRM (Salesforce / Jira style)
# ---------------------------------------------------------------------------

async def upsert_crm_record(user: dict[str, Any]) -> dict[str, Any]:
    """Routes the record to the right CRM object based on plan tier.
    user_id 'u_crm_fail' always errors. ~10% transient failure rate."""
    await asyncio.sleep(random.uniform(0.20, 0.60))
    if user.get("user_id") == "u_crm_fail":
        raise ServiceError("crm 429: rate limit exceeded, retry after 30s")
    if random.random() < 0.10:
        raise ServiceError("crm 503: temporarily unavailable")

    plan = user.get("plan", "free")
    # Enterprise → Account+Opportunity, paid → Lead, free → Contact
    object_type = {
        "enterprise": "Account",
        "pro": "Lead",
        "free": "Contact",
    }.get(plan, "Contact")

    record_id = f"{object_type.lower()}_{uuid.uuid4().hex[:10]}"
    return {
        "crm_id": record_id,
        "object_type": object_type,
        "queue": "enterprise-onboarding" if plan == "enterprise" else "self-serve",
        "synced_fields": [
            k for k in ("email", "first_name", "last_name", "company", "role", "plan")
            if user.get(k) is not None
        ],
        "synced_at": datetime.now(timezone.utc).isoformat(),
    }


# ---------------------------------------------------------------------------
# Telemetry helper (used by nodes to record timing)
# ---------------------------------------------------------------------------

def now_ms() -> int:
    return int(time.monotonic() * 1000)
