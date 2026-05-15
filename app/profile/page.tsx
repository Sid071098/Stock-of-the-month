"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  AlertTriangle,
  ArrowLeft,
  BadgeCheck,
  BarChart3,
  Calendar,
  CreditCard,
  Gift,
  Loader2,
  LogOut,
  Mail,
  PartyPopper,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  User,
  X
} from "lucide-react";

type RegisteredUser = {
  firstName: string;
  lastName: string;
  email: string;
  passwordHash: string;
  createdAt: string;
};

const authSessionStorageKey = "stockymonth.currentUser";

function getSubscriptionStorageKey(email: string): string {
  return `stockymonth.subscription.${email}`;
}

function readStoredValue<T>(key: string): T | null {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(key);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

function getUserInitials(user: RegisteredUser): string {
  const first = user.firstName?.charAt(0) ?? "";
  const last = user.lastName?.charAt(0) ?? "";
  return (first + last).toUpperCase() || user.email.charAt(0).toUpperCase();
}

function formatPeriodEnd(periodEndSeconds: number | null): string {
  if (!periodEndSeconds) return "the end of your billing period";
  return new Date(periodEndSeconds * 1000).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric"
  });
}

type SubscriptionStatus = {
  active: boolean;
  cancelAtPeriodEnd: boolean;
  currentPeriodEnd: number | null;
  retentionOfferUsed?: boolean;
  retainedUntil?: number | null;
};

type CancelStep = "closed" | "retention" | "confirm" | "retained";

export default function ProfilePage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [currentUser, setCurrentUser] = useState<RegisteredUser | null>(null);
  const [hasPremiumAccess, setHasPremiumAccess] = useState(false);
  const [cancelAtPeriodEnd, setCancelAtPeriodEnd] = useState(false);
  const [currentPeriodEnd, setCurrentPeriodEnd] = useState<number | null>(null);
  const [retentionOfferUsed, setRetentionOfferUsed] = useState(false);
  const [retainedUntil, setRetainedUntil] = useState<number | null>(null);
  const [cancelStep, setCancelStep] = useState<CancelStep>("closed");
  const [actionPending, setActionPending] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  function applyStatus(payload: Partial<SubscriptionStatus>, email: string) {
    const subKey = getSubscriptionStorageKey(email);
    if (payload.active) {
      setHasPremiumAccess(true);
      window.localStorage.setItem(subKey, "true");
    } else {
      setHasPremiumAccess(false);
      window.localStorage.removeItem(subKey);
    }
    setCancelAtPeriodEnd(Boolean(payload.cancelAtPeriodEnd));
    setCurrentPeriodEnd(payload.currentPeriodEnd ?? null);
    if (typeof payload.retentionOfferUsed === "boolean") {
      setRetentionOfferUsed(payload.retentionOfferUsed);
    }
    if (payload.retainedUntil !== undefined) {
      setRetainedUntil(payload.retainedUntil ?? null);
    }
  }

  useEffect(() => {
    const savedUser = readStoredValue<RegisteredUser>(authSessionStorageKey);

    if (!savedUser) {
      router.replace("/");
      return;
    }

    setCurrentUser(savedUser);
    const subKey = getSubscriptionStorageKey(savedUser.email);
    const cachedSub = window.localStorage.getItem(subKey);
    setHasPremiumAccess(cachedSub === "true");

    void fetch(`/api/subscription/status?email=${encodeURIComponent(savedUser.email)}`, { cache: "no-store" })
      .then((response) => response.json())
      .then((payload: Partial<SubscriptionStatus>) => applyStatus(payload, savedUser.email))
      .catch(() => undefined)
      .finally(() => setReady(true));
  }, [router]);

  async function submitSubscriptionAction(
    path: "/api/subscription/cancel" | "/api/subscription/resume" | "/api/subscription/retain",
    onSuccess?: () => void
  ) {
    if (!currentUser) return;
    setActionPending(true);
    setActionError(null);

    try {
      const response = await fetch(path, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userEmail: currentUser.email })
      });
      const payload = (await response.json().catch(() => null)) as
        | (Partial<SubscriptionStatus> & { error?: string; message?: string; ok?: boolean })
        | null;

      if (!response.ok || !payload?.ok) {
        throw new Error(payload?.message ?? payload?.error ?? "Request failed");
      }

      applyStatus(payload, currentUser.email);
      if (onSuccess) onSuccess();
      else setCancelStep("closed");
    } catch (error) {
      setActionError(error instanceof Error ? error.message : "Something went wrong");
    } finally {
      setActionPending(false);
    }
  }

  function startCancelFlow() {
    setActionError(null);
    setCancelStep(retentionOfferUsed ? "confirm" : "retention");
  }

  function closeCancelFlow() {
    if (actionPending) return;
    setCancelStep("closed");
    setActionError(null);
  }

  function handleClaimRetention() {
    void submitSubscriptionAction("/api/subscription/retain", () => setCancelStep("retained"));
  }

  function handleDeclineRetention() {
    setActionError(null);
    setCancelStep("confirm");
  }

  function handleCancelSubscription() {
    void submitSubscriptionAction("/api/subscription/cancel");
  }

  function handleResumeSubscription() {
    void submitSubscriptionAction("/api/subscription/resume");
  }

  function handleSignOut() {
    window.localStorage.removeItem(authSessionStorageKey);
    router.push("/");
  }

  function handleBack() {
    router.push("/dashboard");
  }

  if (!ready || !currentUser) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f8fafc] px-6">
        <div className="rounded-xl border border-slate-200 bg-white p-8 text-center shadow-xl">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-md bg-[#ff4f00] text-white">
            <BarChart3 className="h-7 w-7" aria-hidden="true" />
          </div>
          <p className="mt-4 text-sm font-black uppercase tracking-[0.18em] text-slate-500">Loading profile</p>
        </div>
      </main>
    );
  }

  const fullName = `${currentUser.firstName} ${currentUser.lastName}`.trim();
  const memberSince = currentUser.createdAt
    ? new Date(currentUser.createdAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })
    : "—";

  return (
    <main className="relative min-h-screen overflow-hidden bg-gradient-to-b from-slate-200 via-slate-50 to-indigo-100/70 text-[#0f172a]">
      {/* Profile-specific animated backdrop: indigo + cyan + soft pink (account/identity feel) */}
      <div aria-hidden="true" className="animate-drift-wide pointer-events-none absolute -top-32 -left-32 h-96 w-96 rounded-full bg-indigo-300/30 blur-3xl" />
      <div aria-hidden="true" className="animate-drift-wide pointer-events-none absolute top-1/3 -right-32 h-80 w-80 rounded-full bg-cyan-300/30 blur-3xl" style={{ animationDelay: "3s" }} />
      <div aria-hidden="true" className="animate-drift-wide pointer-events-none absolute -bottom-32 left-1/3 h-80 w-80 rounded-full bg-rose-200/30 blur-3xl" style={{ animationDelay: "6s" }} />
      {/* Faint diagonal stripes for "card / ID" vibe */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-[0.025] [background-image:repeating-linear-gradient(135deg,rgba(99,102,241,0.6)_0px,rgba(99,102,241,0.6)_1px,transparent_1px,transparent_22px)]"
      />
      {/* Top bar */}
      <nav className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/96 shadow-sm backdrop-blur-md">
        <div className="mx-auto flex h-20 max-w-5xl items-center justify-between px-6">
          <button
            type="button"
            onClick={handleBack}
            className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-black text-slate-700 shadow-sm transition hover:border-[#0f1729] hover:bg-[#ecfeff] hover:text-[#0f1729]"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Back to dashboard
          </button>
          <Link href="/dashboard" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-md bg-[#ff4f00] text-white shadow-sm">
              <BarChart3 className="h-6 w-6" aria-hidden="true" />
            </div>
            <span className="text-xl font-black tracking-tight text-[#0f172a]">StockyMonth</span>
          </Link>
          <button
            type="button"
            onClick={handleSignOut}
            className="inline-flex items-center gap-2 rounded-full border border-rose-200 bg-white px-4 py-2 text-sm font-black text-rose-600 shadow-sm transition hover:bg-rose-50"
          >
            <LogOut className="h-4 w-4" aria-hidden="true" />
            Sign out
          </button>
        </div>
      </nav>

      <section className="mx-auto max-w-5xl px-6 py-12">
        {/* Header card */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#0f1729] via-[#1e293b] to-[#0891b2] p-8 text-white shadow-xl">
          <div aria-hidden="true" className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-[#ff4f00]/30 blur-3xl" />
          <div aria-hidden="true" className="pointer-events-none absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-[#06b6d4]/25 blur-3xl" />
          <div className="relative flex items-center gap-5">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-white/15 text-2xl font-black ring-4 ring-white/25 backdrop-blur-md">
              {getUserInitials(currentUser)}
            </div>
            <div>
              <p className="text-xs font-black uppercase tracking-[0.22em] text-cyan-200">My account</p>
              <h1 className="mt-1 text-3xl font-black md:text-4xl">{fullName || currentUser.email}</h1>
              <div className="mt-3 flex flex-wrap gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-black backdrop-blur-md">
                  <Mail className="h-3 w-3" aria-hidden="true" />
                  {currentUser.email}
                </span>
                {hasPremiumAccess ? (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-400/25 px-3 py-1 text-xs font-black text-emerald-200 backdrop-blur-md">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                    Premium Active
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-black backdrop-blur-md">
                    Free account
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          {/* Account details */}
          <article className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="h-1 w-full bg-gradient-to-r from-cyan-400 to-sky-500" />
            <div className="p-6 md:p-8">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-50 text-[#0f1729]">
                  <User className="h-5 w-5" aria-hidden="true" />
                </span>
                <h2 className="text-lg font-black text-[#0f172a]">Account details</h2>
              </div>

              <dl className="mt-6 grid gap-4">
                <div className="flex items-center justify-between gap-3 border-b border-slate-100 pb-3">
                  <dt className="text-sm font-bold text-slate-500">Full name</dt>
                  <dd className="text-sm font-black text-[#0f172a]">{fullName || "—"}</dd>
                </div>
                <div className="flex items-center justify-between gap-3 border-b border-slate-100 pb-3">
                  <dt className="text-sm font-bold text-slate-500">Email</dt>
                  <dd className="max-w-[220px] truncate text-right text-sm font-black text-[#0f172a]">{currentUser.email}</dd>
                </div>
                <div className="flex items-center justify-between gap-3 border-b border-slate-100 pb-3">
                  <dt className="flex items-center gap-2 text-sm font-bold text-slate-500">
                    <Calendar className="h-3.5 w-3.5" aria-hidden="true" />
                    Member since
                  </dt>
                  <dd className="text-sm font-black text-[#0f172a]">{memberSince}</dd>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <dt className="text-sm font-bold text-slate-500">Account type</dt>
                  <dd className={`text-sm font-black ${hasPremiumAccess ? "text-emerald-600" : "text-slate-600"}`}>
                    {hasPremiumAccess ? "Premium" : "Free"}
                  </dd>
                </div>
              </dl>
            </div>
          </article>

          {/* Subscription & billing */}
          <article className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="h-1 w-full bg-gradient-to-r from-[#ff4f00] via-orange-400 to-rose-400" />
            <div className="p-6 md:p-8">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-50 text-[#ff4f00]">
                  <CreditCard className="h-5 w-5" aria-hidden="true" />
                </span>
                <h2 className="text-lg font-black text-[#0f172a]">Subscription &amp; billing</h2>
              </div>

              <dl className="mt-6 grid gap-4">
                <div className="flex items-center justify-between gap-3 border-b border-slate-100 pb-3">
                  <dt className="text-sm font-bold text-slate-500">Plan</dt>
                  <dd className="text-sm font-black text-[#0f172a]">StockyMonth Monthly</dd>
                </div>
                <div className="flex items-center justify-between gap-3 border-b border-slate-100 pb-3">
                  <dt className="text-sm font-bold text-slate-500">Price</dt>
                  <dd className="text-sm font-black text-[#0f172a]">$1.99 / month</dd>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <dt className="text-sm font-bold text-slate-500">Status</dt>
                  <dd>
                    {hasPremiumAccess ? (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-black text-emerald-700">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                        Active
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-xs font-black text-slate-600">
                        Inactive
                      </span>
                    )}
                  </dd>
                </div>
              </dl>

              {hasPremiumAccess ? (
                <div className="mt-6 space-y-3">
                  {cancelAtPeriodEnd ? (
                    <>
                      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
                        <p className="text-sm font-black text-amber-900">Cancellation scheduled</p>
                        <p className="mt-1 text-xs font-semibold text-amber-800">
                          Your premium access ends on {formatPeriodEnd(currentPeriodEnd)}. You will not be charged again.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={handleResumeSubscription}
                        disabled={actionPending}
                        className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 px-6 text-sm font-black text-white shadow-lg shadow-emerald-200 transition hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {actionPending ? (
                          <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                        ) : (
                          <RotateCcw className="h-4 w-4" aria-hidden="true" />
                        )}
                        Resume subscription
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        type="button"
                        onClick={startCancelFlow}
                        className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-full border border-rose-200 bg-white px-6 text-sm font-black text-rose-600 shadow-sm transition hover:bg-rose-50"
                      >
                        Cancel subscription
                      </button>
                      <p className="text-xs font-semibold text-slate-500">
                        You will keep premium access until the end of your current billing period.
                      </p>
                    </>
                  )}
                  {actionError ? (
                    <p className="text-xs font-semibold text-rose-600">{actionError}</p>
                  ) : null}
                </div>
              ) : (
                <Link
                  href="/subscription"
                  className="mt-6 inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#ff4f00] to-orange-500 px-6 text-sm font-black text-white shadow-lg shadow-orange-200 transition hover:shadow-xl"
                >
                  <Sparkles className="h-4 w-4" aria-hidden="true" />
                  Upgrade to premium
                </Link>
              )}
            </div>
          </article>
        </div>

        {/* Plan includes */}
        <article className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="h-1 w-full bg-gradient-to-r from-emerald-400 to-teal-500" />
          <div className="p-6 md:p-8">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                <ShieldCheck className="h-5 w-5" aria-hidden="true" />
              </span>
              <h2 className="text-lg font-black text-[#0f172a]">Your StockyMonth plan includes</h2>
            </div>
            <div className="mt-6 grid gap-4 md:grid-cols-3">
              {[
                { title: "Stock of the Month", desc: "This month's high-conviction featured pick." },
                { title: "Top High Quality Stocks", desc: "Curated ranked list of quality companies." },
                { title: "All Picks Archive", desc: "Full historical vault of every monthly pick." }
              ].map((item) => (
                <div key={item.title} className="rounded-xl border border-slate-200 bg-slate-50/60 p-4">
                  <BadgeCheck className="mb-3 h-5 w-5 text-emerald-600" aria-hidden="true" />
                  <p className="text-sm font-black text-[#0f172a]">{item.title}</p>
                  <p className="mt-1.5 text-xs font-semibold leading-relaxed text-slate-600">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </article>
      </section>

      {cancelStep !== "closed" ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="cancel-flow-title"
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 px-4 py-8 backdrop-blur-sm"
        >
          <div className="relative w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl">
            <button
              type="button"
              onClick={closeCancelFlow}
              className="absolute right-4 top-4 inline-flex h-9 w-9 items-center justify-center rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
              aria-label="Close"
              disabled={actionPending}
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>

            {cancelStep === "retention" ? (
              <>
                {/* Gradient celebratory header */}
                <div className="relative overflow-hidden bg-gradient-to-br from-[#ff4f00] via-orange-500 to-rose-500 px-6 pb-6 pt-8 text-white md:px-8">
                  <div aria-hidden="true" className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-white/20 blur-3xl" />
                  <div aria-hidden="true" className="pointer-events-none absolute -bottom-16 -left-16 h-40 w-40 rounded-full bg-rose-200/30 blur-3xl" />
                  <div className="relative flex items-center gap-3">
                    <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/20 ring-2 ring-white/30 backdrop-blur-md">
                      <Gift className="h-6 w-6 animate-pulse-glow" aria-hidden="true" />
                    </span>
                    <p className="text-[10px] font-black uppercase tracking-[0.28em] text-white/85">Wait — exclusive offer</p>
                  </div>
                  <h2 id="cancel-flow-title" className="relative mt-4 text-3xl font-black leading-tight">
                    2 months free,
                    <br />
                    <span className="bg-gradient-to-r from-white to-orange-100 bg-clip-text text-transparent">on us.</span>
                  </h2>
                  <p className="relative mt-3 text-sm font-semibold leading-relaxed text-white/85">
                    Before you go, stay with StockyMonth and we&apos;ll cover your next <span className="font-black">2 monthly bills</span> — a $3.98 credit applied automatically. No code needed.
                  </p>
                </div>

                <div className="px-6 py-5 md:px-8">
                  <div className="grid gap-2.5 text-sm font-semibold text-slate-700">
                    <p className="flex items-start gap-2">
                      <BadgeCheck className="mt-0.5 h-4 w-4 flex-shrink-0 text-emerald-600" aria-hidden="true" />
                      Keep your access — pick of the month, quality screen, full archive.
                    </p>
                    <p className="flex items-start gap-2">
                      <BadgeCheck className="mt-0.5 h-4 w-4 flex-shrink-0 text-emerald-600" aria-hidden="true" />
                      Cancel anytime after — no auto-renewal traps.
                    </p>
                    <p className="flex items-start gap-2">
                      <BadgeCheck className="mt-0.5 h-4 w-4 flex-shrink-0 text-emerald-600" aria-hidden="true" />
                      One-time offer per account.
                    </p>
                  </div>
                  {actionError ? (
                    <p className="mt-4 rounded-lg bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-700">{actionError}</p>
                  ) : null}
                </div>

                <div className="flex flex-col-reverse gap-3 border-t border-slate-100 bg-slate-50/60 px-6 py-4 md:px-8">
                  <button
                    type="button"
                    onClick={handleDeclineRetention}
                    disabled={actionPending}
                    className="text-sm font-semibold text-slate-500 transition hover:text-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    No thanks, continue cancelling
                  </button>
                  <button
                    type="button"
                    onClick={handleClaimRetention}
                    disabled={actionPending}
                    className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#ff4f00] to-orange-500 px-6 text-sm font-black text-white shadow-lg shadow-orange-200 transition hover:shadow-orange-300 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {actionPending ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <Gift className="h-4 w-4" aria-hidden="true" />}
                    Claim 2 free months
                  </button>
                </div>
              </>
            ) : null}

            {cancelStep === "confirm" ? (
              <>
                <div className="px-6 pb-2 pt-8 md:px-8">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-rose-50 text-rose-600">
                    <AlertTriangle className="h-6 w-6" aria-hidden="true" />
                  </div>
                  <h2 id="cancel-flow-title" className="mt-4 text-xl font-black text-[#0f172a]">
                    Cancel your subscription?
                  </h2>
                  <p className="mt-2 text-sm font-semibold text-slate-600">
                    You will keep premium access until{" "}
                    <span className="font-black text-[#0f172a]">{formatPeriodEnd(currentPeriodEnd)}</span>. After that date, you will lose access to:
                  </p>
                  <ul className="mt-4 space-y-2 text-sm font-semibold text-slate-600">
                    <li className="flex items-start gap-2">
                      <span className="mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-[#ff4f00]" />
                      Stock of the Month featured pick
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-[#ff4f00]" />
                      Top High Quality Stocks list
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-[#ff4f00]" />
                      Full archive of every monthly pick
                    </li>
                  </ul>
                  {actionError ? (
                    <p className="mt-4 rounded-lg bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-700">{actionError}</p>
                  ) : null}
                </div>
                <div className="flex flex-col-reverse gap-3 border-t border-slate-100 bg-slate-50/60 px-6 py-4 md:flex-row md:px-8">
                  <button
                    type="button"
                    onClick={closeCancelFlow}
                    disabled={actionPending}
                    className="inline-flex h-11 flex-1 items-center justify-center rounded-full border border-slate-200 bg-white px-4 text-sm font-black text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    Keep subscription
                  </button>
                  <button
                    type="button"
                    onClick={handleCancelSubscription}
                    disabled={actionPending}
                    className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-full bg-rose-600 px-4 text-sm font-black text-white shadow-lg shadow-rose-200 transition hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {actionPending ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : null}
                    Confirm cancellation
                  </button>
                </div>
              </>
            ) : null}

            {cancelStep === "retained" ? (
              <>
                <div className="px-6 pb-2 pt-8 text-center md:px-8">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 ring-1 ring-emerald-200">
                    <PartyPopper className="h-7 w-7" aria-hidden="true" />
                  </div>
                  <h2 id="cancel-flow-title" className="mt-4 text-xl font-black text-[#0f172a]">
                    Your 2 free months are locked in
                  </h2>
                  <p className="mt-2 text-sm font-semibold text-slate-600">
                    Your next two monthly invoices will be discounted 100%. Premium access continues without a billing interruption.
                  </p>
                  {retainedUntil ? (
                    <p className="mt-3 inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-black text-emerald-700">
                      <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
                      Free through {formatPeriodEnd(retainedUntil)}
                    </p>
                  ) : null}
                </div>
                <div className="border-t border-slate-100 bg-slate-50/60 px-6 py-4 md:px-8">
                  <button
                    type="button"
                    onClick={closeCancelFlow}
                    className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#ff4f00] to-orange-500 px-4 text-sm font-black text-white shadow-lg shadow-orange-200 transition hover:shadow-orange-300"
                  >
                    Done
                  </button>
                </div>
              </>
            ) : null}
          </div>
        </div>
      ) : null}
    </main>
  );
}
