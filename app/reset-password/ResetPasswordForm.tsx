"use client";

import Link from "next/link";
import type React from "react";
import { useMemo, useState } from "react";
import { ArrowLeft, BarChart3, CheckCircle2, Eye, EyeOff, KeyRound, ShieldCheck } from "lucide-react";

type Status = "idle" | "error" | "success";

export default function ResetPasswordForm({ token }: { token: string }) {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const strength = useMemo(() => scorePassword(password), [password]);
  const passwordsMatch = password.length > 0 && password === confirmPassword;

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
        headers: { "Content-Type": "application/json" },
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
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-b from-slate-200 via-slate-50 to-rose-100/70 px-6 py-12 text-[#0f172a]">
      {/* Reset-page backdrop: rose + orange + sky — recovery / security feel */}
      <div aria-hidden="true" className="animate-drift-wide pointer-events-none absolute -top-32 left-1/4 h-80 w-80 rounded-full bg-rose-300/30 blur-3xl" />
      <div aria-hidden="true" className="animate-drift-wide pointer-events-none absolute top-1/3 -right-32 h-80 w-80 rounded-full bg-orange-300/30 blur-3xl" style={{ animationDelay: "2.5s" }} />
      <div aria-hidden="true" className="animate-drift-wide pointer-events-none absolute -bottom-32 -left-32 h-80 w-80 rounded-full bg-sky-300/25 blur-3xl" style={{ animationDelay: "5s" }} />
      {/* Faint vertical stripes for a 'safety / scanning' vibe */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-[0.03] [background-image:repeating-linear-gradient(90deg,rgba(244,63,94,0.6)_0px,rgba(244,63,94,0.6)_1px,transparent_1px,transparent_28px)]"
      />

      <section className="relative w-full max-w-xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
        {/* Top hairline */}
        <div aria-hidden="true" className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[#ff4f00] via-rose-400 to-sky-400" />
        <div aria-hidden="true" className="pointer-events-none absolute -right-24 -top-24 h-56 w-56 rounded-full bg-orange-100/70 blur-3xl" />
        <div aria-hidden="true" className="pointer-events-none absolute -bottom-24 -left-24 h-56 w-56 rounded-full bg-sky-100/60 blur-3xl" />

        <div className="relative p-8 md:p-10">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-md bg-gradient-to-br from-[#ff8a3d] to-[#ff4f00] text-white shadow-md shadow-orange-500/30 ring-1 ring-white/20">
              <BarChart3 className="h-6 w-6" aria-hidden="true" />
            </div>
            <span className="text-2xl font-black tracking-tight">StockyMonth</span>
          </div>

          <div className="mt-8 inline-flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-orange-50 to-rose-50 text-[#ff4f00] ring-1 ring-orange-100">
            <KeyRound className="h-7 w-7 animate-pulse-glow" aria-hidden="true" />
          </div>

          <p className="mt-5 inline-flex items-center gap-2 rounded-full border border-orange-200 bg-orange-50 px-3 py-1 text-[10px] font-black uppercase tracking-[0.22em] text-[#ff4f00]">
            <ShieldCheck className="h-3 w-3" aria-hidden="true" />
            Reset password
          </p>
          <h1 className="mt-3 bg-gradient-to-r from-[#0f172a] via-[#0f1729] to-[#ff4f00] bg-clip-text text-3xl font-black text-transparent md:text-4xl">
            Create a new password
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-slate-600 md:text-base">
            Enter a new password for your StockyMonth account. Reset links expire after 30 minutes.
          </p>

          {message && (
            <div
              role="status"
              className={`mt-5 rounded-xl border p-4 text-sm font-bold ${
                status === "success"
                  ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                  : "border-rose-200 bg-rose-50 text-rose-700"
              }`}
            >
              <div className="flex items-start gap-2">
                {status === "success" && <CheckCircle2 className="h-5 w-5 shrink-0" aria-hidden="true" />}
                <span>{message}</span>
              </div>
              {status === "success" && (
                <Link
                  href="/"
                  className="mt-3 inline-flex h-10 items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#ff4f00] to-orange-500 px-4 text-xs font-black text-white shadow-md shadow-orange-200 transition hover:shadow-orange-300"
                >
                  Continue to login
                </Link>
              )}
            </div>
          )}

          {!token && status !== "success" && (
            <div role="alert" className="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm font-bold text-amber-800">
              No reset token found in the URL. Request a fresh reset email from the login page.
            </div>
          )}

          {status !== "success" && (
            <form className="mt-6 grid gap-4" onSubmit={handleSubmit}>
              <div>
                <label className="block">
                  <span className="text-[10px] font-black uppercase tracking-[0.22em] text-slate-500">New password</span>
                  <div className="relative mt-2">
                    <input
                      autoComplete="new-password"
                      className="h-12 w-full rounded-lg border border-slate-200 bg-white pl-4 pr-11 text-sm font-bold outline-none transition focus:border-orange-300 focus:ring-4 focus:ring-orange-100"
                      onChange={(event) => setPassword(event.target.value)}
                      placeholder="Minimum 6 characters"
                      type={showPassword ? "text" : "password"}
                      value={password}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((s) => !s)}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                      className="absolute inset-y-0 right-2 my-auto flex h-8 w-8 items-center justify-center rounded-md text-slate-500 hover:bg-slate-100 hover:text-slate-700"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" aria-hidden="true" /> : <Eye className="h-4 w-4" aria-hidden="true" />}
                    </button>
                  </div>
                </label>

                {/* Strength meter */}
                {password.length > 0 && (
                  <div className="mt-3">
                    <div className="flex gap-1.5">
                      {[0, 1, 2, 3].map((tier) => (
                        <span
                          key={tier}
                          className={`h-1 flex-1 rounded-full transition-colors duration-200 ${
                            tier < strength.score ? strength.barClass : "bg-slate-200"
                          }`}
                        />
                      ))}
                    </div>
                    <p className={`mt-1.5 text-[11px] font-black uppercase tracking-wide ${strength.textClass}`}>
                      {strength.label}
                    </p>
                  </div>
                )}
              </div>

              <label className="block">
                <span className="text-[10px] font-black uppercase tracking-[0.22em] text-slate-500">Confirm password</span>
                <div className="relative mt-2">
                  <input
                    autoComplete="new-password"
                    className={`h-12 w-full rounded-lg border bg-white pl-4 pr-11 text-sm font-bold outline-none transition focus:ring-4 ${
                      confirmPassword.length === 0
                        ? "border-slate-200 focus:border-orange-300 focus:ring-orange-100"
                        : passwordsMatch
                          ? "border-emerald-300 focus:border-emerald-400 focus:ring-emerald-100"
                          : "border-rose-300 focus:border-rose-400 focus:ring-rose-100"
                    }`}
                    onChange={(event) => setConfirmPassword(event.target.value)}
                    placeholder="Re-enter password"
                    type={showPassword ? "text" : "password"}
                    value={confirmPassword}
                  />
                  {confirmPassword.length > 0 && passwordsMatch && (
                    <CheckCircle2 className="pointer-events-none absolute inset-y-0 right-3 my-auto h-5 w-5 text-emerald-500" aria-hidden="true" />
                  )}
                </div>
                {confirmPassword.length > 0 && !passwordsMatch && (
                  <p className="mt-1.5 text-[11px] font-bold text-rose-600">Passwords do not match.</p>
                )}
              </label>

              <button
                type="submit"
                disabled={isSubmitting || !token}
                className="mt-2 inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#ff4f00] to-orange-500 px-6 text-sm font-black uppercase tracking-wide text-white shadow-lg shadow-orange-200 transition hover:shadow-orange-300 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSubmitting ? "Updating password…" : "Update password"}
              </button>
            </form>
          )}

          <Link
            className="mt-6 inline-flex items-center gap-2 text-sm font-black text-[#ff4f00] hover:text-orange-700"
            href="/"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Back to login
          </Link>
        </div>
      </section>
    </main>
  );
}

function scorePassword(password: string): { score: number; label: string; barClass: string; textClass: string } {
  if (password.length === 0) return { score: 0, label: "", barClass: "bg-slate-200", textClass: "text-slate-500" };

  let score = 0;
  if (password.length >= 6) score += 1;
  if (password.length >= 10) score += 1;
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score += 1;
  if (/\d/.test(password) && /[^A-Za-z0-9]/.test(password)) score += 1;

  if (password.length < 6) score = Math.min(score, 1);

  if (score <= 1) return { score: 1, label: "Weak password",     barClass: "bg-rose-400",    textClass: "text-rose-600"    };
  if (score === 2) return { score: 2, label: "Okay password",     barClass: "bg-amber-400",   textClass: "text-amber-600"   };
  if (score === 3) return { score: 3, label: "Strong password",   barClass: "bg-emerald-400", textClass: "text-emerald-600" };
  return            { score: 4, label: "Very strong password",  barClass: "bg-emerald-500", textClass: "text-emerald-700" };
}

function updateLocalPassword(email: string | undefined, passwordHash: string) {
  if (!email) return;

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
      // Some browser contexts disable Web Crypto. Fall back to a stable local hash.
    }
  }

  let hash = 5381;
  for (let index = 0; index < password.length; index += 1) {
    hash = (hash * 33) ^ password.charCodeAt(index);
  }

  return `local-${hash >>> 0}`;
}
