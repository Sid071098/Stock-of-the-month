"use client";

import Link from "next/link";
import type React from "react";
import { useState } from "react";
import { ArrowLeft, BarChart3, CheckCircle2, KeyRound } from "lucide-react";

export default function ResetPasswordForm({ token }: { token: string }) {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"idle" | "error" | "success">("idle");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!token) {
      setStatus("error");
      setMessage("This reset link is missing a token. Request a new password reset email.");
      return;
    }

    if (password.length < 6) {
      setStatus("error");
      setMessage("Password must be at least 6 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setStatus("error");
      setMessage("Passwords do not match.");
      return;
    }

    setIsSubmitting(true);

    try {
      const passwordHash = await hashPassword(password);
      const response = await fetch("/api/auth/password-reset/confirm", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ passwordHash, token })
      });
      const payload = (await response.json().catch(() => ({}))) as { email?: string; error?: string };

      if (!response.ok) {
        throw new Error(payload.error ?? "reset_failed");
      }

      updateLocalPassword(payload.email, passwordHash);
      setStatus("success");
      setMessage("Password updated. You can now log in with your new password.");
      setPassword("");
      setConfirmPassword("");
    } catch {
      setStatus("error");
      setMessage("This reset link is invalid or expired. Request a new password reset email.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f8fafc] px-6 py-10 text-[#0f172a]">
      <section className="w-full max-w-xl rounded-md border border-slate-200 bg-white p-8 shadow-2xl">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-md bg-[#ff4f00] text-white">
            <BarChart3 className="h-7 w-7" aria-hidden="true" />
          </div>
          <span className="text-2xl font-black tracking-tight">StockyMonth</span>
        </div>

        <div className="mt-8 flex h-12 w-12 items-center justify-center rounded-md bg-orange-50 text-[#ff4f00]">
          <KeyRound className="h-6 w-6" aria-hidden="true" />
        </div>

        <p className="mt-5 text-sm font-black uppercase tracking-[0.18em] text-[#ff4f00]">Reset password</p>
        <h1 className="mt-3 text-3xl font-black">Create a new password</h1>
        <p className="mt-3 text-sm leading-relaxed text-slate-600">
          Enter a new password for your StockyMonth account. Reset links expire after 30 minutes.
        </p>

        {message && (
          <div
            className={`mt-5 rounded-md border p-4 text-sm font-bold ${
              status === "success"
                ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                : "border-rose-200 bg-rose-50 text-rose-700"
            }`}
          >
            <div className="flex gap-2">
              {status === "success" && <CheckCircle2 className="h-5 w-5 shrink-0" aria-hidden="true" />}
              <span>{message}</span>
            </div>
          </div>
        )}

        <form className="mt-6 grid gap-4" onSubmit={handleSubmit}>
          <label className="block">
            <span className="text-xs font-black uppercase tracking-wide text-slate-500">New password</span>
            <input
              autoComplete="new-password"
              className="mt-2 h-12 w-full rounded-md border border-slate-200 bg-white px-4 text-sm font-bold outline-none transition focus:border-orange-300 focus:ring-4 focus:ring-orange-100"
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Minimum 6 characters"
              type="password"
              value={password}
            />
          </label>
          <label className="block">
            <span className="text-xs font-black uppercase tracking-wide text-slate-500">Confirm password</span>
            <input
              autoComplete="new-password"
              className="mt-2 h-12 w-full rounded-md border border-slate-200 bg-white px-4 text-sm font-bold outline-none transition focus:border-orange-300 focus:ring-4 focus:ring-orange-100"
              onChange={(event) => setConfirmPassword(event.target.value)}
              placeholder="Re-enter password"
              type="password"
              value={confirmPassword}
            />
          </label>
          <button
            className="mt-2 inline-flex h-12 w-full items-center justify-center rounded-full bg-[#ff4f00] px-6 text-sm font-black uppercase tracking-wide text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-60"
            disabled={isSubmitting}
            type="submit"
          >
            {isSubmitting ? "Updating password..." : "Update password"}
          </button>
        </form>

        <Link
          className="mt-6 inline-flex items-center gap-2 text-sm font-black text-[#ff4f00] hover:text-orange-700"
          href="/"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Back to login
        </Link>
      </section>
    </main>
  );
}

function updateLocalPassword(email: string | undefined, passwordHash: string) {
  if (!email) {
    return;
  }

  try {
    const rawUsers = window.localStorage.getItem("stockymonth.registeredUsers");
    const users = rawUsers ? (JSON.parse(rawUsers) as Array<{ email: string; passwordHash: string }>) : [];
    const nextUsers = users.map((user) => (user.email === email ? { ...user, passwordHash } : user));
    window.localStorage.setItem("stockymonth.registeredUsers", JSON.stringify(nextUsers));
  } catch {
    // Local cache repair is best-effort; Redis is the source of truth.
  }
}

async function hashPassword(password: string) {
  const bytes = new TextEncoder().encode(password);

  if (window.crypto?.subtle) {
    try {
      const digest = await window.crypto.subtle.digest("SHA-256", bytes);

      return Array.from(new Uint8Array(digest))
        .map((byte) => byte.toString(16).padStart(2, "0"))
        .join("");
    } catch {
      // Some local browser contexts disable Web Crypto. Fall back to a stable local-only hash.
    }
  }

  let hash = 5381;
  for (let index = 0; index < password.length; index += 1) {
    hash = (hash * 33) ^ password.charCodeAt(index);
  }

  return `local-${hash >>> 0}`;
}
