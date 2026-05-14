import { randomBytes } from "crypto";
import { NextResponse } from "next/server";
import {
  getPersistentUser,
  isPersistentStoreConfigured,
  normalizePersistentEmail,
  savePasswordResetToken
} from "../../../../lib/persistentStore";

const resetTtlSeconds = 60 * 30;
const appUrlFallback = process.env.NEXT_PUBLIC_APP_URL ?? "https://easecaseinc.com";

export async function POST(request: Request) {
  if (!isPersistentStoreConfigured()) {
    return NextResponse.json({ error: "persistent_store_not_configured" }, { status: 503 });
  }

  const body = (await request.json().catch(() => ({}))) as { email?: string };
  const email = normalizePersistentEmail(body.email ?? "");

  if (!email) {
    return NextResponse.json({ error: "missing_email" }, { status: 400 });
  }

  const user = await getPersistentUser(email).catch(() => null);
  if (!user) {
    return NextResponse.json({ ok: true, emailSent: true });
  }

  const token = randomBytes(32).toString("hex");
  await savePasswordResetToken({
    email,
    token,
    ttlSeconds: resetTtlSeconds
  });

  const origin = request.headers.get("origin") || new URL(request.url).origin || appUrlFallback;
  const resetUrl = new URL("/reset-password", origin);
  resetUrl.searchParams.set("token", token);

  const emailSent = await sendPasswordResetEmail({
    email,
    firstName: user.firstName,
    resetUrl: resetUrl.toString()
  });

  return NextResponse.json({
    ok: true,
    emailSent,
    expiresInMinutes: resetTtlSeconds / 60,
    resetUrl: process.env.NODE_ENV === "production" ? undefined : resetUrl.toString()
  });
}

async function sendPasswordResetEmail({
  email,
  firstName,
  resetUrl
}: {
  email: string;
  firstName: string;
  resetUrl: string;
}) {
  const resendApiKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.PASSWORD_RESET_FROM_EMAIL ?? "StockyMonth <onboarding@resend.dev>";

  if (!resendApiKey) {
    console.log("Password reset link generated. Configure RESEND_API_KEY to email it.", resetUrl);
    return false;
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${resendApiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      from: fromEmail,
      to: email,
      subject: "Reset your StockyMonth password",
      html: `
        <div style="font-family: Arial, sans-serif; color: #0f172a; line-height: 1.6;">
          <h1 style="margin: 0 0 12px; color: #0f172a;">Reset your StockyMonth password</h1>
          <p>Hi ${escapeHtml(firstName || "there")},</p>
          <p>Use the secure link below to reset your password. This link expires in 30 minutes.</p>
          <p>
            <a href="${resetUrl}" style="display: inline-block; background: #ff4f00; color: #ffffff; padding: 12px 18px; border-radius: 999px; font-weight: 700; text-decoration: none;">
              Reset password
            </a>
          </p>
          <p>If you did not request this, you can safely ignore this email.</p>
        </div>
      `,
      text: `Reset your StockyMonth password: ${resetUrl}\n\nThis link expires in 30 minutes.`
    })
  }).catch(() => null);

  return Boolean(response?.ok);
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
