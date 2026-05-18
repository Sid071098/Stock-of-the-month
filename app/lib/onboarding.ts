/**
 * Onboarding orchestrator (TypeScript port of the LangGraph agent in
 * onboarding-agent/). Same workflow:
 *
 *   draft_email  →  ┬─ send_email   (Resend)
 *                   └─ sync_crm     (Redis append-only log)
 *
 * The two right-side branches run in parallel via Promise.allSettled, so a
 * failure in one doesn't stop the other. The final outcome is appended to the
 * onboarding log too, regardless of partial failures.
 *
 * Hook this from any signup route — it's fire-and-await, ~1-2s end to end.
 */

import { appendOnboardingLog } from "./persistentStore";

export type OnboardingUser = {
  email: string;
  firstName: string;
  lastName: string;
  company?: string | null;
  role?: string | null;
  plan?: "free" | "pro" | "enterprise";
  signupSource?: string;
};

export type StepStatus = "ok" | "failed" | "skipped";

export type StepResult = {
  status: StepStatus;
  detail?: string;
  error?: string;
  elapsedMs: number;
};

export type OnboardingOutcome = {
  user: string;
  signupSource: string;
  finalStatus: "complete" | "partial" | "failed";
  draftResult: StepResult;
  emailResult: StepResult;
  crmResult: StepResult;
  errors: string[];
  emailSubject?: string;
  startedAt: string;
  finishedAt: string;
  totalMs: number;
};

export async function runOnboarding(user: OnboardingUser): Promise<OnboardingOutcome> {
  const startedAt = new Date().toISOString();
  const startedMs = Date.now();
  const errors: string[] = [];

  // STEP 1 — draft (must complete before send)
  const draftT0 = Date.now();
  let draft: { subject: string; body: string; source: string } | null = null;
  let draftResult: StepResult;
  try {
    draft = await draftWelcomeEmail(user);
    draftResult = {
      status: "ok",
      detail: draft.source,
      elapsedMs: Date.now() - draftT0
    };
  } catch (err) {
    draftResult = {
      status: "failed",
      error: errMessage(err),
      elapsedMs: Date.now() - draftT0
    };
    errors.push(`draft_email: ${errMessage(err)}`);
  }

  // STEPS 2 & 3 — parallel: send email + sync to "CRM" (Redis log)
  const [emailSettled, crmSettled] = await Promise.allSettled([
    draft ? sendWelcomeEmail(user, draft) : Promise.reject(new Error("no draft")),
    syncCrmRecord(user, startedAt)
  ]);

  const emailResult: StepResult =
    emailSettled.status === "fulfilled"
      ? emailSettled.value
      : {
          status: draft ? "failed" : "skipped",
          error: draft ? errMessage(emailSettled.reason) : "no draft",
          elapsedMs: 0
        };
  if (emailResult.status === "failed" && emailResult.error) {
    errors.push(`send_email: ${emailResult.error}`);
  }

  const crmResult: StepResult =
    crmSettled.status === "fulfilled"
      ? crmSettled.value
      : { status: "failed", error: errMessage(crmSettled.reason), elapsedMs: 0 };
  if (crmResult.status === "failed" && crmResult.error) {
    errors.push(`sync_crm: ${crmResult.error}`);
  }

  // Roll up
  const statuses: StepStatus[] = [draftResult.status, emailResult.status, crmResult.status];
  const finalStatus: OnboardingOutcome["finalStatus"] = statuses.every((s) => s === "ok")
    ? "complete"
    : statuses.includes("ok")
      ? "partial"
      : "failed";

  const finishedAt = new Date().toISOString();
  const outcome: OnboardingOutcome = {
    user: user.email,
    signupSource: user.signupSource ?? "unknown",
    finalStatus,
    draftResult,
    emailResult,
    crmResult,
    errors,
    emailSubject: draft?.subject,
    startedAt,
    finishedAt,
    totalMs: Date.now() - startedMs
  };

  // Persist the rollup to the same Redis log (best-effort)
  try {
    await appendOnboardingLog({ type: "onboarding_outcome", ...outcome });
  } catch (err) {
    console.error("[onboarding] outcome log failed", errMessage(err));
  }

  return outcome;
}

// ---------------------------------------------------------------------------
// Step 1: LLM email drafter with templated fallback
// ---------------------------------------------------------------------------

async function draftWelcomeEmail(user: OnboardingUser): Promise<{ subject: string; body: string; source: string }> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return templatedWelcomeEmail(user, "no_api_key");

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      cache: "no-store",
      headers: {
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: process.env.ANTHROPIC_MODEL ?? "claude-haiku-4-5-20251001",
        max_tokens: 600,
        messages: [
          { role: "user", content: buildPrompt(user) },
          { role: "assistant", content: "{" }
        ]
      })
    });

    if (!response.ok) {
      return templatedWelcomeEmail(user, `llm_${response.status}`);
    }
    const payload = (await response.json()) as { content?: Array<{ text?: string }> };
    const text = payload.content?.[0]?.text ?? "";
    const raw = "{" + text;
    const end = raw.lastIndexOf("}");
    if (end === -1) return templatedWelcomeEmail(user, "llm_no_brace");
    const parsed = JSON.parse(raw.slice(0, end + 1)) as { subject?: unknown; body?: unknown };
    if (typeof parsed.subject !== "string" || typeof parsed.body !== "string") {
      return templatedWelcomeEmail(user, "llm_bad_keys");
    }
    return { subject: parsed.subject.trim(), body: parsed.body.trim(), source: "llm" };
  } catch (err) {
    return templatedWelcomeEmail(user, `llm_error:${errMessage(err).slice(0, 30)}`);
  }
}

function buildPrompt(user: OnboardingUser): string {
  return `You are an onboarding specialist for StockyMonth, a monthly stock-pick research platform.

Generate a warm, professional welcome email for a new signup.

User profile:
- Name: ${user.firstName} ${user.lastName}
- Email: ${user.email}
- Plan: ${user.plan ?? "free"}
- Signup source: ${user.signupSource ?? "unknown"}

Rules:
- Mention StockyMonth by name and reference one concrete benefit (monthly conviction pick, top quality screen, or All Picks vault).
- Body must be plain text (no markdown), 80-130 words, line breaks between paragraphs.
- Sign as "The StockyMonth team".

Respond with ONLY a JSON object in this exact shape, no prose:
{"subject": "...", "body": "..."}`;
}

function templatedWelcomeEmail(user: OnboardingUser, reason: string): { subject: string; body: string; source: string } {
  const subject = `Welcome to StockyMonth, ${user.firstName}`;
  const body =
    `Hi ${user.firstName || "there"},\n\n` +
    `Thanks for joining StockyMonth — your account is ready.\n\n` +
    `Every month we publish one high-conviction stock pick with the full thesis, plus a screened list of Top High Quality Stocks and access to the All Picks vault.\n\n` +
    `Sign in any time at https://easecaseinc.com — if you have questions, just reply to this email.\n\n` +
    `The StockyMonth team`;
  return { subject, body, source: `template_fallback (${reason})` };
}

// ---------------------------------------------------------------------------
// Step 2: send via Resend
// ---------------------------------------------------------------------------

async function sendWelcomeEmail(
  user: OnboardingUser,
  draft: { subject: string; body: string }
): Promise<StepResult> {
  const t0 = Date.now();
  const apiKey = process.env.RESEND_API_KEY;
  const fromEmail =
    process.env.WELCOME_FROM_EMAIL ??
    process.env.PASSWORD_RESET_FROM_EMAIL ??
    "StockyMonth <onboarding@resend.dev>";

  if (!apiKey) {
    return { status: "skipped", detail: "no_resend_api_key", elapsedMs: Date.now() - t0 };
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: fromEmail,
      to: user.email,
      subject: draft.subject,
      text: draft.body,
      html: textToHtml(draft.body)
    })
  });

  if (!response.ok) {
    const detail = await response.text().catch(() => "send_failed");
    throw new Error(`resend ${response.status}: ${detail.slice(0, 120)}`);
  }
  const payload = (await response.json()) as { id?: string };
  return { status: "ok", detail: payload.id ?? "sent", elapsedMs: Date.now() - t0 };
}

function textToHtml(text: string): string {
  const escaped = text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
  const paragraphs = escaped
    .split(/\n\n+/)
    .map((p) => `<p style="margin:0 0 14px;line-height:1.55;">${p.replace(/\n/g, "<br/>")}</p>`)
    .join("");
  return `<div style="font-family: Arial, Helvetica, sans-serif; color: #0f172a; font-size: 14px; max-width: 540px;">${paragraphs}</div>`;
}

// ---------------------------------------------------------------------------
// Step 3: sync to "CRM" (append to Redis log)
// ---------------------------------------------------------------------------

async function syncCrmRecord(user: OnboardingUser, signedUpAt: string): Promise<StepResult> {
  const t0 = Date.now();
  const objectType =
    user.plan === "enterprise" ? "Account" : user.plan === "pro" ? "Lead" : "Contact";

  await appendOnboardingLog({
    type: "crm_record",
    object: objectType,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    company: user.company ?? null,
    role: user.role ?? null,
    plan: user.plan ?? "free",
    signupSource: user.signupSource ?? "unknown",
    signedUpAt
  });

  return { status: "ok", detail: `redis_log:${objectType}`, elapsedMs: Date.now() - t0 };
}

// ---------------------------------------------------------------------------
// Misc
// ---------------------------------------------------------------------------

function errMessage(err: unknown): string {
  if (err instanceof Error) return err.message;
  if (typeof err === "string") return err;
  return String(err);
}
