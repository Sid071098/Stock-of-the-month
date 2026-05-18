"""Personalized onboarding email generation.

Uses Claude Haiku 4.5 when ANTHROPIC_API_KEY is set; falls back to a deterministic
template otherwise. The fallback path is also exercised when the API call fails,
so the agent never hard-fails on a missing/flaky LLM.
"""

from __future__ import annotations

import json
import os
from typing import Any

DEFAULT_MODEL = os.getenv("ANTHROPIC_MODEL", "claude-haiku-4-5-20251001")


def _build_prompt(user: dict[str, Any]) -> str:
    return f"""You are an enterprise B2B SaaS onboarding specialist for "Acme Platform", a developer tooling company.

Generate a warm, professional welcome email for the new signup below.

User profile:
- Name: {user.get('first_name')} {user.get('last_name')}
- Email: {user.get('email')}
- Company: {user.get('company') or 'individual'}
- Role: {user.get('role') or 'unspecified'}
- Plan: {user.get('plan')}
- Signup source: {user.get('signup_source')}

Rules:
- Reference their company AND role specifically (or acknowledge they're an individual builder if no company).
- Match tone to plan tier: enterprise = white-glove + dedicated CSM reference; pro = upgrade-focused; free = quickstart-focused.
- Body must be plain text (no markdown), 80-140 words, with line breaks between paragraphs.
- Sign as "The Acme Platform team".

Respond with ONLY a JSON object in this exact shape, no prose:
{{"subject": "...", "body": "..."}}"""


def _template_email(user: dict[str, Any], reason: str | None = None) -> dict[str, str]:
    """Deterministic fallback. Still personalized, just not LLM-generated."""
    first = user.get("first_name", "there")
    company = user.get("company")
    role = user.get("role")
    plan = user.get("plan", "free")

    plan_blurb = {
        "enterprise": "Your dedicated customer success manager will reach out within 24 hours to kick off your rollout.",
        "pro": "You're on the Pro plan — premium features and priority support are enabled on your workspace.",
        "free": "You're on the Free plan — head to the quickstart to ship your first integration in under 10 minutes.",
    }.get(plan, "Welcome aboard.")

    company_line = f" at {company}" if company else ""
    role_line = f" as {role}" if role else ""

    subject = f"Welcome to Acme Platform, {first}"
    body = (
        f"Hi {first},\n\n"
        f"Thanks for signing up{company_line}{role_line}. "
        f"{plan_blurb}\n\n"
        "Your workspace is ready — sign in any time at acme.example.com.\n\n"
        "If you have questions, reply to this email and a human will respond within one business day.\n\n"
        "The Acme Platform team"
    )
    return {
        "subject": subject,
        "body": body,
        "source": "template_fallback" + (f" ({reason})" if reason else ""),
    }


async def draft_onboarding_email(user: dict[str, Any]) -> dict[str, str]:
    """Returns {subject, body, source}. Source is 'llm' or 'template_fallback'."""
    api_key = os.getenv("ANTHROPIC_API_KEY")
    if not api_key:
        return _template_email(user, reason="no api key")

    try:
        from anthropic import AsyncAnthropic  # local import keeps cold-start light
    except ImportError:
        return _template_email(user, reason="anthropic sdk missing")

    try:
        client = AsyncAnthropic(api_key=api_key)
        msg = await client.messages.create(
            model=DEFAULT_MODEL,
            max_tokens=600,
            messages=[
                {"role": "user", "content": _build_prompt(user)},
                # Prefill assistant turn so the response is guaranteed to start
                # with `{` — makes JSON parsing trivial.
                {"role": "assistant", "content": "{"},
            ],
        )
        # Reattach the prefilled `{` and parse.
        raw = "{" + msg.content[0].text
        # Trim trailing junk after the closing brace if the model added any.
        end = raw.rfind("}")
        if end != -1:
            raw = raw[: end + 1]
        parsed = json.loads(raw)
        if not isinstance(parsed, dict) or "subject" not in parsed or "body" not in parsed:
            return _template_email(user, reason="llm output missing keys")
        return {
            "subject": str(parsed["subject"]).strip(),
            "body": str(parsed["body"]).strip(),
            "source": "llm",
        }
    except Exception as exc:  # noqa: BLE001 - fallback path must catch everything
        return _template_email(user, reason=f"llm error: {type(exc).__name__}")
