"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  ArrowLeft,
  BadgeCheck,
  BarChart3,
  Calendar,
  CreditCard,
  LogOut,
  Mail,
  ShieldCheck,
  Sparkles,
  User
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

export default function ProfilePage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [currentUser, setCurrentUser] = useState<RegisteredUser | null>(null);
  const [hasPremiumAccess, setHasPremiumAccess] = useState(false);

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
      .then((payload: { active?: boolean }) => {
        if (payload.active) {
          setHasPremiumAccess(true);
          window.localStorage.setItem(subKey, "true");
        } else {
          setHasPremiumAccess(false);
          window.localStorage.removeItem(subKey);
        }
      })
      .catch(() => undefined)
      .finally(() => setReady(true));
  }, [router]);

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
    <main className="min-h-screen bg-gradient-to-b from-[#f8fafc] via-cyan-50/30 to-[#f8fafc] text-[#0f172a]">
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
                <form action="/api/subscription/cancel" method="POST" className="mt-6">
                  <input name="userEmail" type="hidden" value={currentUser.email} />
                  <button
                    type="submit"
                    className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-full border border-rose-200 bg-white px-6 text-sm font-black text-rose-600 shadow-sm transition hover:bg-rose-50"
                  >
                    Cancel subscription
                  </button>
                  <p className="mt-3 text-xs font-semibold text-slate-500">
                    Cancellation takes effect immediately and ends premium access.
                  </p>
                </form>
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
    </main>
  );
}
