"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import type React from "react";
import { useEffect, useRef, useState } from "react";
import {
  BadgeCheck,
  BarChart3,
  BriefcaseBusiness,
  Calendar,
  ChevronDown,
  CircleDollarSign,
  CircleGauge,
  CreditCard,
  Database,
  Edit3,
  KeyRound,
  LineChart,
  LogOut,
  Mail,
  RefreshCcw,
  Save,
  Sparkles,
  TrendingUp,
  User,
  X,
  UserCircle,
  LockKeyhole,
  ShieldCheck
} from "lucide-react";
import StripePricingTable from "./StripePricingTable";
import type { ArchivePick, MonthlyPick, QualityPick } from "../lib/picks";

const monthlyStorageKey = "stockymonth.monthlyPick";
const qualityStorageKey = "stockymonth.qualityPicks";
const authUsersStorageKey = "stockymonth.registeredUsers";
const authSessionStorageKey = "stockymonth.currentUser";
const subscriptionGateDisabled = false;

function getSubscriptionStorageKey(email: string): string {
  return `stockymonth.subscription.${email}`;
}

type RegisteredUser = {
  firstName: string;
  lastName: string;
  email: string;
  passwordHash: string;
  createdAt: string;
};

type AuthNotice = {
  message: string;
  type: "error" | "success" | "info";
};

const authWinningPicks = [
  { name: "FTAI Aviation", return: "187%", ticker: "FTAI", picked: "July 2024",     domain: "ftai.com" },
  { name: "Cloudflare",    return: "160%", ticker: "NET",  picked: "September 2024", domain: "cloudflare.com" },
  { name: "Howmet",        return: "120%", ticker: "HWM",  picked: "January 2025",   domain: "howmet.com" },
  { name: "CrowdStrike",   return: "96%",  ticker: "CRWD", picked: "August 2024",    domain: "crowdstrike.com" },
  { name: "Wabtec",        return: "52%",  ticker: "WAB",  picked: "June 2024",      domain: "wabteccorp.com" }
];

const googleAccountOptions = [
  { email: "demo.investor@gmail.com", firstName: "Demo", lastName: "Investor" },
  { email: "research.viewer@gmail.com", firstName: "Research", lastName: "Viewer" }
];

type StockExperienceProps = {
  archivePicks: ArchivePick[];
  defaultMonthlyPick: MonthlyPick;
  defaultQualityPicks: QualityPick[];
  subscriptionContext?: LockedFeatureKey;
  pricingTableId: string;
  publishableKey: string;
  showAdmin?: boolean;
  showPricing?: boolean;
  view?: StockExperienceView;
};

type StockExperienceView = "monthly" | "quality" | "all-picks" | "subscription";
type LockedFeatureKey = "monthly" | "quality" | "all-picks";

const featureUnlockCopy: Record<
  LockedFeatureKey,
  {
    eyebrow: string;
    headline: string;
    navLabel: string;
    title: string;
    description: string;
    panelAccent: string;
  }
> = {
  monthly: {
    eyebrow: "Stock of the Month",
    headline: "Unlock this month's highest-conviction pick",
    navLabel: "Stock of the Month",
    title: "The Featured Pick",
    description: "Get the May 2026 StockyMonth thesis, detailed EQT analysis, and subscriber-only research notes.",
    panelAccent: "Featured monthly research"
  },
  quality: {
    eyebrow: "Top High Quality Stocks",
    headline: "Unlock the current Top High Quality Stocks list",
    navLabel: "Top High Quality Stocks",
    title: "The Elite List",
    description: "See the ranked high-quality stock list with company data, active-buy tags, and detailed analysis links.",
    panelAccent: "Quality screen access"
  },
  "all-picks": {
    eyebrow: "All Picks Archive",
    headline: "Unlock the complete StockyMonth pick vault",
    navLabel: "All Picks",
    title: "The Vault",
    description: "Browse every monthly pick, historical thesis, three-point rationale, pricing, and company logo archive.",
    panelAccent: "Historical archive access"
  }
};

function featureKeyForView(view: StockExperienceView): LockedFeatureKey {
  if (view === "quality") {
    return "quality";
  }

  if (view === "all-picks") {
    return "all-picks";
  }

  return "monthly";
}

export default function StockExperience({
  archivePicks,
  defaultMonthlyPick,
  defaultQualityPicks,
  subscriptionContext,
  pricingTableId,
  publishableKey,
  showAdmin = false,
  showPricing = true,
  view = "monthly"
}: StockExperienceProps) {
  const [monthlyPick, setMonthlyPick] = useState(defaultMonthlyPick);
  const [qualityPicks, setQualityPicks] = useState(defaultQualityPicks);
  const [authReady, setAuthReady] = useState(false);
  const [currentUser, setCurrentUser] = useState<RegisteredUser | null>(null);
  const [hasPremiumAccess, setHasPremiumAccess] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const savedMonthly = readStoredValue<MonthlyPick>(monthlyStorageKey);
    const savedQuality = readStoredValue<QualityPick[]>(qualityStorageKey);
    const savedUser = readStoredValue<RegisteredUser>(authSessionStorageKey);

    if (savedMonthly) {
      setMonthlyPick({ ...defaultMonthlyPick, ...savedMonthly });
    }

    if (Array.isArray(savedQuality) && savedQuality.length === 6) {
      setQualityPicks(savedQuality.map((pick, index) => ({ ...defaultQualityPicks[index], ...pick })));
    }

    if (savedUser) {
      setCurrentUser(savedUser);
      const userSubscriptionKey = getSubscriptionStorageKey(savedUser.email);
      const subscriptionWasCancelled = new URLSearchParams(window.location.search).get("cancelled") === "1";

      if (subscriptionWasCancelled) {
        window.localStorage.removeItem(userSubscriptionKey);
      }

      const savedSubscription = subscriptionWasCancelled ? null : window.localStorage.getItem(userSubscriptionKey);
      setHasPremiumAccess(savedSubscription === "true");

      void fetch(`/api/subscription/status?email=${encodeURIComponent(savedUser.email)}`, { cache: "no-store" })
        .then((response) => response.json())
        .then((payload: { active?: boolean }) => {
          if (payload.active) {
            setHasPremiumAccess(true);
            window.localStorage.setItem(userSubscriptionKey, "true");
            return;
          }

          setHasPremiumAccess(false);
          window.localStorage.removeItem(userSubscriptionKey);
        })
        .catch(() => undefined);
    } else {
      // No user logged in
      setHasPremiumAccess(false);
    }

    setAuthReady(true);
  }, []);

  function saveMonthlyPick(nextPick: MonthlyPick) {
    setMonthlyPick(nextPick);
    window.localStorage.setItem(monthlyStorageKey, JSON.stringify(nextPick));
  }

  function saveQualityPicks(nextPicks: QualityPick[]) {
    setQualityPicks(nextPicks);
    window.localStorage.setItem(qualityStorageKey, JSON.stringify(nextPicks));
  }

  function resetMonthlyPick() {
    setMonthlyPick(defaultMonthlyPick);
    window.localStorage.removeItem(monthlyStorageKey);
  }

  function resetQualityPicks() {
    setQualityPicks(defaultQualityPicks);
    window.localStorage.removeItem(qualityStorageKey);
  }

  function completeAuthentication(user: RegisteredUser) {
    setCurrentUser(user);
    window.localStorage.setItem(authSessionStorageKey, JSON.stringify(user));

    if (subscriptionGateDisabled) {
      setHasPremiumAccess(true);
      return;
    }

    const userSubscriptionKey = getSubscriptionStorageKey(user.email);
    const userSubscription = window.localStorage.getItem(userSubscriptionKey);

    if (userSubscription === "true") {
      setHasPremiumAccess(true);
    }

    void fetch(`/api/subscription/status?email=${encodeURIComponent(user.email)}`, { cache: "no-store" })
      .then((response) => response.json())
      .then((payload: { active?: boolean }) => {
        if (payload.active) {
          setHasPremiumAccess(true);
          window.localStorage.setItem(userSubscriptionKey, "true");
          return;
        }

        setHasPremiumAccess(false);
        window.localStorage.removeItem(userSubscriptionKey);
        router.push("/subscription");
      })
      .catch(() => {
        if (userSubscription === "true") {
          return;
        }

        setHasPremiumAccess(false);
        router.push("/subscription");
      });
  }

  function signOut() {
    setCurrentUser(null);
    setHasPremiumAccess(false);
    window.localStorage.removeItem(authSessionStorageKey);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  if (!authReady) {
    return <AuthLoadingScreen />;
  }

  if (!currentUser) {
    return <AuthLanding onAuthenticated={completeAuthentication} />;
  }

  const canAccessPremiumFeatures = hasPremiumAccess;
  const shouldShowSubscriptionFirst = !canAccessPremiumFeatures && view !== "subscription";
  const lockedFeature = subscriptionContext ?? featureKeyForView(view);

  const activeBackdropView: StockExperienceView = shouldShowSubscriptionFirst ? "subscription" : view;
  const viewBaseClass: Record<StockExperienceView, string> = {
    monthly:      "from-slate-200 via-slate-50 to-cyan-100/70",
    quality:      "from-slate-200 via-slate-50 to-emerald-100/70",
    "all-picks":  "from-slate-200 via-slate-50 to-amber-100/70",
    subscription: "from-slate-200 via-slate-50 to-violet-100/70"
  };

  return (
    <main className={`relative min-h-screen overflow-hidden bg-gradient-to-b ${viewBaseClass[activeBackdropView]} text-[#0f172a]`}>
      <PageBackdrop view={activeBackdropView} />
      <TopNav currentUser={currentUser} currentView={view} hasPremiumAccess={canAccessPremiumFeatures} onSignOut={signOut} />
      {shouldShowSubscriptionFirst && (
        <SubscriptionSection currentUser={currentUser} hasPremiumAccess={canAccessPremiumFeatures} lockedFeature={lockedFeature} />
      )}
      {!shouldShowSubscriptionFirst && view === "monthly" && (
        canAccessPremiumFeatures ? (
          <MonthlyPickSection hasPremiumAccess={canAccessPremiumFeatures} monthlyPick={monthlyPick} />
        ) : (
          <PremiumGate lockedFeature="monthly" />
        )
      )}
      {!shouldShowSubscriptionFirst && view === "quality" && (
        canAccessPremiumFeatures ? <QualityPicksSection picks={qualityPicks} /> : <PremiumGate lockedFeature="quality" />
      )}
      {!shouldShowSubscriptionFirst && view === "all-picks" && (
        canAccessPremiumFeatures ? <AllPicksSection picks={archivePicks} /> : <PremiumGate lockedFeature="all-picks" />
      )}
      {!shouldShowSubscriptionFirst && view === "subscription" && (
        <SubscriptionSection currentUser={currentUser} hasPremiumAccess={canAccessPremiumFeatures} lockedFeature={lockedFeature} />
      )}
      {showPricing && (
        <PricingSection monthlyPick={monthlyPick} pricingTableId={pricingTableId} publishableKey={publishableKey} />
      )}
      {showAdmin && (
        <AdminPanel
          monthlyPick={monthlyPick}
          qualityPicks={qualityPicks}
          onResetMonthlyPick={resetMonthlyPick}
          onResetQualityPicks={resetQualityPicks}
          onSaveMonthlyPick={saveMonthlyPick}
          onSaveQualityPicks={saveQualityPicks}
        />
      )}
      <Footer />
    </main>
  );
}

function AuthLoadingScreen() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f8fafc] px-6">
      <div className="rounded-md border border-slate-200 bg-white p-8 text-center shadow-xl">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-md bg-[#ff4f00] text-white">
          <BarChart3 className="h-7 w-7" aria-hidden="true" />
        </div>
        <p className="mt-4 text-sm font-black uppercase tracking-[0.18em] text-slate-500">Preparing StockyMonth</p>
      </div>
    </main>
  );
}

function AuthLanding({ onAuthenticated }: { onAuthenticated: (user: RegisteredUser) => void }) {
  const [mode, setMode] = useState<"login" | "signup" | "forgot">("login");
  const [emailFormOpen, setEmailFormOpen] = useState(false);
  const [notice, setNotice] = useState<AuthNotice | null>(null);
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [forgotEmail, setForgotEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [googleChooserOpen, setGoogleChooserOpen] = useState(false);

  function showNotice(nextNotice: AuthNotice) {
    setNotice(nextNotice);
    window.setTimeout(() => setNotice((current) => (current?.message === nextNotice.message ? null : current)), 4000);
  }

  function switchAuthMode(nextMode: "login" | "signup" | "forgot") {
    setMode(nextMode);
    setEmailFormOpen(false);
  }

  async function handleGoogleAccount(account: { email: string; firstName: string; lastName: string }) {
    const email = normalizeEmail(account.email);
    const passwordHash = await hashPassword(`google:${email}`);
    const googleUser: RegisteredUser = {
      firstName: account.firstName,
      lastName: account.lastName,
      email,
      passwordHash,
      createdAt: new Date().toISOString()
    };
    const persistedUser = await syncGooglePersistentUser(googleUser);
    const users = getRegisteredUsers();
    let user = persistedUser ?? users.find((candidate) => candidate.email === email);

    if (!user) {
      user = googleUser;
    }

    upsertRegisteredUser({ ...user, passwordHash });

    setGoogleChooserOpen(false);
    showNotice({ message: "Google login successful. Welcome to StockyMonth.", type: "success" });
    onAuthenticated(user);
  }

  async function handleLogin(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);

    try {
      const email = normalizeEmail(loginEmail);
      const users = getRegisteredUsers();
      const user = users.find((candidate) => candidate.email === email);
      const passwordHash = await hashPassword(loginPassword);
      const persistentLogin = await loginPersistentUser(email, passwordHash);

      if (persistentLogin.status === "ok" && persistentLogin.user) {
        const authenticatedUser = { ...persistentLogin.user, passwordHash };
        upsertRegisteredUser(authenticatedUser);
        showNotice({ message: "Login successful. Welcome back.", type: "success" });
        onAuthenticated(authenticatedUser);
        return;
      }

      if (persistentLogin.status === "invalid") {
        showNotice({ message: "Incorrect password. Use Forgot password if you need a reset.", type: "error" });
        return;
      }

      if (persistentLogin.status === "not_found" && user?.passwordHash === passwordHash) {
        await registerPersistentUser(user);
        showNotice({ message: "Login successful. Welcome back.", type: "success" });
        onAuthenticated(user);
        return;
      }

      if (!user) {
        showNotice({ message: "No registered user found. Please sign up first.", type: "error" });
        return;
      }

      if (user.passwordHash !== passwordHash) {
        showNotice({ message: "Incorrect password. Use Forgot password if you need a reset.", type: "error" });
        return;
      }

      showNotice({ message: "Login successful. Welcome back.", type: "success" });
      onAuthenticated(user);
    } catch (error) {
      console.error("Local login failed", error);
      showNotice({ message: "Login failed locally. Please refresh and try again.", type: "error" });
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleSignup(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);

    try {
      const email = normalizeEmail(signupEmail);
      const users = getRegisteredUsers();

      if (!firstName.trim() || !lastName.trim() || !email || !signupPassword) {
        showNotice({ message: "Please complete first name, last name, email, and password.", type: "error" });
        return;
      }

      if (signupPassword.length < 6) {
        showNotice({ message: "Password must be at least 6 characters.", type: "error" });
        return;
      }

      if (users.some((user) => user.email === email)) {
        showNotice({ message: "User is already registered. Please log in instead.", type: "error" });
        setMode("login");
        setLoginEmail(email);
        return;
      }

      const user: RegisteredUser = {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email,
        passwordHash: await hashPassword(signupPassword),
        createdAt: new Date().toISOString()
      };
      const persistentSignup = await registerPersistentUser(user);

      if (persistentSignup.status === "already_registered") {
        showNotice({ message: "User is already registered. Please log in instead.", type: "error" });
        setMode("login");
        setLoginEmail(email);
        return;
      }

      if (persistentSignup.status === "error") {
        showNotice({ message: "Account could not be saved. Check the persistent storage environment variables.", type: "error" });
        return;
      }

      upsertRegisteredUser(user);
      showNotice({ message: "Account created. You are now signed in.", type: "success" });
      onAuthenticated(user);
    } catch (error) {
      console.error("Local signup failed", error);
      showNotice({ message: "Signup failed locally. Please refresh and try again.", type: "error" });
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleForgotPassword(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);

    try {
      const email = normalizeEmail(forgotEmail);

      if (!email) {
        showNotice({ message: "Enter your registered email address.", type: "error" });
        return;
      }

      const response = await fetch("/api/auth/password-reset/request", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ email })
      });
      const payload = (await response.json().catch(() => ({}))) as { emailSent?: boolean; resetUrl?: string };

      if (response.status === 503) {
        showNotice({ message: "Password reset needs Redis environment variables before it can send links.", type: "error" });
        return;
      }

      if (!response.ok) {
        showNotice({ message: "Password reset could not start. Please try again.", type: "error" });
        return;
      }

      if (payload.emailSent) {
        showNotice({ message: "Password reset instructions were sent to your email.", type: "success" });
      } else {
        showNotice({
          message: payload.resetUrl
            ? `Reset link created for local testing: ${payload.resetUrl}`
            : "Reset link created, but email sending needs RESEND_API_KEY and PASSWORD_RESET_FROM_EMAIL.",
          type: "info"
        });
      }

      setMode("login");
      setLoginEmail(email);
    } catch {
      showNotice({ message: "Password reset could not start. Please refresh and try again.", type: "error" });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="animate-gradient-pan relative min-h-screen overflow-hidden bg-[linear-gradient(125deg,#04081a_0%,#081024_28%,#0f1a40_55%,#0f1729_78%,#0a2540_100%)] text-white">
      <LoginBackdrop />

      {notice && (
        <div
          className={`fixed right-5 top-5 z-[70] max-w-sm rounded-xl border p-4 text-sm font-bold shadow-2xl backdrop-blur-md ${
            notice.type === "error"
              ? "border-rose-300/60 bg-rose-50/90 text-rose-700"
              : notice.type === "success"
                ? "border-emerald-300/60 bg-emerald-50/90 text-emerald-700"
                : "border-orange-300/60 bg-orange-50/90 text-[#ff4f00]"
          }`}
          role="status"
        >
          {notice.message}
        </div>
      )}

      <header className="relative z-10 px-6 py-6">
        <div className="mx-auto grid max-w-6xl grid-cols-[1fr_auto_1fr] items-center">
          <div />
          <div className="glass inline-flex items-center gap-2 rounded-full px-3 py-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-[#ff4f00] animate-pulse-glow" />
            <span className="text-[10px] font-black uppercase tracking-[0.28em] text-white/90">
              Live Market Research
            </span>
          </div>
          <div className="flex justify-end">
            {mode !== "forgot" && (
              <button
                type="button"
                onClick={() => switchAuthMode(mode === "signup" ? "login" : "signup")}
                className="rounded-full border border-white/15 bg-white/5 px-4 py-1.5 text-xs font-black text-white/90 backdrop-blur-md transition hover:border-white/30 hover:bg-white/10"
              >
                {mode === "signup" ? "Log in" : "Create account"}
              </button>
            )}
          </div>
        </div>
      </header>

      <section className="relative z-10 flex min-h-[calc(100vh-72px)] flex-col items-center justify-center px-6 pb-12 pt-4">
        {/* MEGA hero title */}
        <div className="text-center">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[#ff8a3d] via-[#ff4f00] to-[#06b6d4] shadow-[0_18px_60px_-12px_rgba(255,79,0,0.55)]">
            <BarChart3 className="h-9 w-9 text-white" aria-hidden="true" />
          </div>

          <h1
            className="animate-title-glow mt-5 bg-gradient-to-r from-white via-[#ffd4c2] to-[#ff8a3d] bg-clip-text text-4xl font-black leading-none tracking-tight text-transparent md:text-5xl lg:text-6xl"
            style={{ letterSpacing: "-0.02em" }}
          >
            StockyMonth
          </h1>

          <p className="mx-auto mt-4 max-w-xl text-sm font-bold text-white/65 md:text-base">
            High-conviction monthly picks. Live market data. A vault of every thesis we&apos;ve ever published.
          </p>
        </div>

        {/* Glassmorphism login card */}
        <div className="mt-10 w-full max-w-[460px]">
          <div className="glass relative overflow-hidden rounded-2xl p-6 shadow-2xl md:p-8">
            <div aria-hidden="true" className="pointer-events-none absolute -top-24 -right-24 h-48 w-48 rounded-full bg-[#ff4f00]/35 blur-3xl" />
            <div aria-hidden="true" className="pointer-events-none absolute -bottom-24 -left-24 h-48 w-48 rounded-full bg-[#06b6d4]/35 blur-3xl" />

            <div className="relative">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.22em] text-white/90 backdrop-blur-md">
                <span className="h-1.5 w-1.5 rounded-full bg-[#22c55e]" />
                {mode === "login" ? "Sign in" : mode === "signup" ? "Create account" : "Account recovery"}
              </span>

              <h2 className="mt-4 text-2xl font-black tracking-tight text-white md:text-3xl">
                {mode === "login" ? "Welcome back." : mode === "signup" ? "Create your account." : "Reset your password."}
              </h2>
              <p className="mt-2 text-sm font-semibold leading-6 text-white/70">
                {mode === "login"
                  ? "Pick up where you left off. Your monthly stock research is one click away."
                  : mode === "signup"
                    ? "Start with Google or reveal the email form when you are ready."
                    : "Enter your email and we will send reset instructions for your StockyMonth account."}
              </p>
            </div>

          <div className="relative">

          {mode !== "forgot" && (
            <div className="mt-7 grid gap-3">
              <button
                type="button"
                onClick={() => setGoogleChooserOpen(true)}
                className="inline-flex h-12 w-full items-center justify-center gap-3 rounded-xl border border-white/20 bg-white/95 px-5 text-sm font-black text-[#0f1729] shadow-lg transition hover:bg-white"
              >
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white text-sm font-black text-[#4285f4] ring-1 ring-slate-200">
                  G
                </span>
                Continue with Google
              </button>
              <button
                type="button"
                onClick={() => setEmailFormOpen((open) => !open)}
                className={`inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl border px-5 text-sm font-black transition ${
                  emailFormOpen
                    ? "border-orange-300/60 bg-orange-50/90 text-[#ff4f00]"
                    : "border-white/20 bg-white/10 text-white backdrop-blur-md hover:bg-white/20"
                }`}
              >
                <Mail className="h-4 w-4" aria-hidden="true" />
                {emailFormOpen ? "Hide email form" : "Continue with email"}
              </button>
            </div>
          )}

          {mode === "login" && emailFormOpen && (
            <form className="mt-6 rounded-xl border border-white/30 bg-white/95 p-4 text-left shadow-2xl backdrop-blur-md" onSubmit={handleLogin}>
              <p className="text-sm font-bold leading-relaxed text-[#475569]">Enter your email and password.</p>
              <div className="mt-4 grid gap-4">
                <AuthInput
                  autoComplete="email"
                  icon={<Mail className="h-5 w-5" aria-hidden="true" />}
                  label="Email address"
                  onChange={setLoginEmail}
                  placeholder="you@example.com"
                  type="email"
                  value={loginEmail}
                />
                <AuthInput
                  autoComplete="current-password"
                  icon={<KeyRound className="h-5 w-5" aria-hidden="true" />}
                  label="Password"
                  onChange={setLoginPassword}
                  placeholder="Enter password"
                  type="password"
                  value={loginPassword}
                />
              </div>
              <div className="mt-4 flex justify-end">
                <button
                  type="button"
                  onClick={() => switchAuthMode("forgot")}
                  className="text-sm font-black text-[#ff4f00] hover:text-orange-700"
                >
                  Forgot password?
                </button>
              </div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="mt-5 inline-flex h-12 w-full items-center justify-center rounded-md bg-[#0f1729] px-6 text-sm font-black uppercase tracking-wide text-white transition hover:bg-[#1e293b] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSubmitting ? "Checking account..." : "Login"}
              </button>
            </form>
          )}

          {mode === "signup" && emailFormOpen && (
            <form className="mt-6 rounded-md border border-[#e2e8f0] bg-white/85 p-4 text-left shadow-sm" onSubmit={handleSignup}>
              <p className="text-sm font-bold leading-relaxed text-[#475569]">
                Sign up with your first name, last name, and email address.
              </p>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <AuthInput label="First name" onChange={setFirstName} placeholder="First name" type="text" value={firstName} />
                <AuthInput label="Last name" onChange={setLastName} placeholder="Last name" type="text" value={lastName} />
                <div className="sm:col-span-2">
                  <AuthInput
                    autoComplete="email"
                    icon={<Mail className="h-5 w-5" aria-hidden="true" />}
                    label="Email address"
                    onChange={setSignupEmail}
                    placeholder="you@example.com"
                    type="email"
                    value={signupEmail}
                  />
                </div>
                <div className="sm:col-span-2">
                  <AuthInput
                    autoComplete="new-password"
                    icon={<KeyRound className="h-5 w-5" aria-hidden="true" />}
                    label="Create password"
                    onChange={setSignupPassword}
                    placeholder="Minimum 6 characters"
                    type="password"
                    value={signupPassword}
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="mt-5 inline-flex h-12 w-full items-center justify-center rounded-md bg-[#0f1729] px-6 text-sm font-black uppercase tracking-wide text-white transition hover:bg-[#1e293b] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSubmitting ? "Creating account..." : "Get started"}
              </button>
            </form>
          )}

          {mode === "forgot" && (
            <form className="mt-6 rounded-xl border border-white/30 bg-white/95 p-4 text-left shadow-2xl backdrop-blur-md" onSubmit={handleForgotPassword}>
              <AuthInput
                autoComplete="email"
                icon={<Mail className="h-5 w-5" aria-hidden="true" />}
                label="Registered email"
                onChange={setForgotEmail}
                placeholder="you@example.com"
                type="email"
                value={forgotEmail}
              />
              <button
                type="submit"
                disabled={isSubmitting}
                className="mt-5 inline-flex h-12 w-full items-center justify-center rounded-xl bg-[#0f1729] px-6 text-sm font-black uppercase tracking-wide text-white transition hover:bg-[#1e293b] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSubmitting ? "Sending..." : "Send reset instructions"}
              </button>
            </form>
          )}

          </div>
          </div>

          <div className="mt-6 text-center text-sm font-semibold text-white/60">
            {mode === "login" && (
              <>
                New here?{" "}
                <button type="button" onClick={() => switchAuthMode("signup")} className="font-black text-white hover:text-[#ffb29d]">
                  Create an account
                </button>
              </>
            )}
            {mode === "signup" && (
              <>
                Already have an account?{" "}
                <button type="button" onClick={() => switchAuthMode("login")} className="font-black text-white hover:text-[#ffb29d]">
                  Log in
                </button>
              </>
            )}
            {mode === "forgot" && (
              <button type="button" onClick={() => switchAuthMode("login")} className="font-black text-white hover:text-[#ffb29d]">
                Back to login
              </button>
            )}
          </div>
        </div>

        {/* Stock trading animation below the login card */}
        <TradingAnimation />
      </section>

      {googleChooserOpen && (
        <GoogleAccountChooser
          accounts={getGoogleAccountOptions(mode, loginEmail, signupEmail, firstName, lastName)}
          onClose={() => setGoogleChooserOpen(false)}
          onSelect={handleGoogleAccount}
        />
      )}
    </main>
  );
}

function TradingAnimation() {
  const candles = [
    { h: 38, up: true,  body: 22, wick: "top" },
    { h: 52, up: true,  body: 30, wick: "both" },
    { h: 46, up: false, body: 24, wick: "bottom" },
    { h: 64, up: true,  body: 38, wick: "both" },
    { h: 58, up: true,  body: 32, wick: "top" },
    { h: 44, up: false, body: 22, wick: "bottom" },
    { h: 72, up: true,  body: 44, wick: "both" },
    { h: 80, up: true,  body: 52, wick: "top" },
    { h: 66, up: false, body: 34, wick: "both" },
    { h: 86, up: true,  body: 56, wick: "both" },
    { h: 94, up: true,  body: 62, wick: "top" }
  ];

  return (
    <div className="mt-14 w-full max-w-5xl">
      <div className="mb-5 flex items-center justify-between text-white/80">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse-glow" />
          <span className="text-[11px] font-black uppercase tracking-[0.28em]">Live Market Pulse</span>
        </div>
        <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.18em]">
          <span className="text-emerald-300">+24.6%</span>
          <span className="text-white/40">·</span>
          <span className="text-white/60">30D</span>
        </div>
      </div>

      <div className="glass relative overflow-hidden rounded-2xl p-5 shadow-2xl md:p-7">
        <div aria-hidden="true" className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-emerald-400/15 blur-3xl" />
        <div aria-hidden="true" className="pointer-events-none absolute -bottom-20 -left-20 h-56 w-56 rounded-full bg-[#ff4f00]/15 blur-3xl" />

        {/* Chart area */}
        <div className="relative h-[260px] w-full overflow-hidden rounded-xl bg-gradient-to-b from-white/[0.03] to-transparent">
          {/* horizontal grid lines */}
          <div aria-hidden="true" className="absolute inset-0 flex flex-col justify-between py-4">
            {[0, 1, 2, 3, 4].map((i) => (
              <div key={i} className="h-px w-full bg-white/[0.06]" />
            ))}
          </div>

          {/* Animated trend SVG */}
          <svg
            viewBox="0 0 600 240"
            preserveAspectRatio="none"
            className="absolute inset-0 h-full w-full"
            aria-hidden="true"
          >
            <defs>
              <linearGradient id="ta-line" x1="0" x2="1" y1="0" y2="0">
                <stop offset="0%"   stopColor="#34d399" />
                <stop offset="50%"  stopColor="#22d3ee" />
                <stop offset="100%" stopColor="#ff8a3d" />
              </linearGradient>
              <linearGradient id="ta-fill" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%"   stopColor="#22d3ee" stopOpacity="0.35" />
                <stop offset="100%" stopColor="#22d3ee" stopOpacity="0" />
              </linearGradient>
            </defs>
            <path
              d="M0,180 C60,170 100,140 160,150 C220,160 260,90 320,110 C380,130 420,60 480,72 C540,82 580,40 600,30 L600,240 L0,240 Z"
              fill="url(#ta-fill)"
            />
            <path
              d="M0,180 C60,170 100,140 160,150 C220,160 260,90 320,110 C380,130 420,60 480,72 C540,82 580,40 600,30"
              fill="none"
              stroke="url(#ta-line)"
              strokeWidth="2.5"
              strokeLinecap="round"
              className="animate-draw-line"
            />
            {/* moving dot at end */}
            <circle cx="600" cy="30" r="5" fill="#ff8a3d" className="animate-pulse-glow" />
            <circle cx="600" cy="30" r="10" fill="#ff8a3d" opacity="0.25" />
          </svg>

          {/* Candlesticks overlay */}
          <div className="absolute inset-x-0 bottom-0 flex h-full items-end justify-between gap-2 px-6 pb-3 pt-8">
            {candles.map((c, i) => {
              const color = c.up ? "bg-emerald-400" : "bg-rose-400";
              const wickColor = c.up ? "bg-emerald-400/60" : "bg-rose-400/60";
              return (
                <div
                  key={i}
                  className="relative flex h-full w-full flex-col items-center justify-end"
                  style={{ animation: `float-slow ${5 + i * 0.25}s ease-in-out infinite`, animationDelay: `${i * 0.18}s` }}
                >
                  {(c.wick === "top" || c.wick === "both") && (
                    <span className={`mb-[-1px] w-[1.5px] ${wickColor}`} style={{ height: `${Math.max(8, c.h * 0.18)}px` }} />
                  )}
                  <span className={`w-2.5 rounded-[2px] ${color} shadow-[0_0_12px_rgba(52,211,153,0.4)]`} style={{ height: `${c.body}%` }} />
                  {(c.wick === "bottom" || c.wick === "both") && (
                    <span className={`mt-[-1px] w-[1.5px] ${wickColor}`} style={{ height: `${Math.max(8, c.h * 0.18)}px` }} />
                  )}
                </div>
              );
            })}
          </div>

          {/* Floating Buy / Sell markers */}
          <div className="animate-float-medium absolute left-[18%] top-[55%]">
            <div className="rounded-full bg-emerald-500/95 px-2.5 py-1 text-[10px] font-black uppercase tracking-wide text-white shadow-lg shadow-emerald-500/40">
              Buy
            </div>
          </div>
          <div className="animate-float-slow absolute right-[28%] top-[28%]">
            <div className="rounded-full bg-rose-500/95 px-2.5 py-1 text-[10px] font-black uppercase tracking-wide text-white shadow-lg shadow-rose-500/40">
              Sell
            </div>
          </div>
          <div className="animate-float-fast absolute right-[8%] top-[14%]">
            <div className="rounded-full bg-[#ff4f00] px-2.5 py-1 text-[10px] font-black uppercase tracking-wide text-white shadow-lg shadow-orange-500/40">
              Target +18%
            </div>
          </div>
        </div>

        {/* Stat strip below chart */}
        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { label: "Open",   value: "$184.20", tone: "text-white" },
            { label: "High",   value: "$192.46", tone: "text-emerald-300" },
            { label: "Low",    value: "$181.10", tone: "text-rose-300" },
            { label: "Volume", value: "8.42M",   tone: "text-cyan-300" }
          ].map((s) => (
            <div key={s.label} className="rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2.5 backdrop-blur-md">
              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-white/50">{s.label}</p>
              <p className={`mt-1 text-sm font-black ${s.tone}`}>{s.value}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function LoginBackdrop() {
  const tickers = [
    { sym: "EQT",  pct: "+12.4%", left: "6%",  top: "18%",  anim: "animate-float-slow",   color: "text-emerald-300" },
    { sym: "NVDA", pct: "+8.1%",  left: "85%", top: "14%",  anim: "animate-float-medium", color: "text-emerald-300" },
    { sym: "CRWD", pct: "+18.6%", left: "10%", top: "72%",  anim: "animate-float-fast",   color: "text-emerald-300" },
    { sym: "FTAI", pct: "+187%",  left: "82%", top: "70%",  anim: "animate-float-slow",   color: "text-amber-300"   },
    { sym: "NET",  pct: "+160%",  left: "4%",  top: "44%",  anim: "animate-float-medium", color: "text-emerald-300" },
    { sym: "HWM",  pct: "+120%",  left: "88%", top: "44%",  anim: "animate-float-fast",   color: "text-amber-300"   }
  ];

  return (
    <>
      {/* Aurora gradient orbs */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="animate-drift absolute -top-32 left-1/4 h-[420px] w-[420px] rounded-full bg-[#ff8a3d]/25 blur-3xl" />
        <div className="animate-drift absolute top-1/3 right-1/4 h-[480px] w-[480px] rounded-full bg-[#22d3ee]/20 blur-3xl" style={{ animationDelay: "2s" }} />
        <div className="animate-drift absolute bottom-0 left-1/3 h-[360px] w-[360px] rounded-full bg-[#22d3ee]/22 blur-3xl" style={{ animationDelay: "4s" }} />
        <div className="animate-drift absolute top-1/2 left-0 h-[320px] w-[320px] rounded-full bg-[#10b981]/18 blur-3xl" style={{ animationDelay: "6s" }} />
      </div>

      {/* Dot grid */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-[0.18] [background-image:radial-gradient(rgba(255,255,255,0.4)_1px,transparent_1px)] [background-size:32px_32px]"
      />

      {/* Animated SVG stock chart */}
      <svg
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 h-[55vh] w-full opacity-25"
        viewBox="0 0 1440 400"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id="chartLine" x1="0" x2="1" y1="0" y2="0">
            <stop offset="0%"   stopColor="#ff4f00" stopOpacity="0" />
            <stop offset="50%"  stopColor="#ff8a3d" stopOpacity="1" />
            <stop offset="100%" stopColor="#06b6d4" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="chartFill" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%"   stopColor="#ff4f00" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#ff4f00" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path
          d="M0,300 C120,260 200,180 320,220 C440,260 540,140 680,160 C820,180 920,80 1080,120 C1200,150 1320,60 1440,90 L1440,400 L0,400 Z"
          fill="url(#chartFill)"
        />
        <path
          d="M0,300 C120,260 200,180 320,220 C440,260 540,140 680,160 C820,180 920,80 1080,120 C1200,150 1320,60 1440,90"
          fill="none"
          stroke="url(#chartLine)"
          strokeWidth="2.5"
          className="animate-draw-line"
        />
      </svg>

      {/* Floating candlestick mini-chart */}
      <div
        aria-hidden="true"
        className="animate-float-slow pointer-events-none absolute right-[6%] top-[26%] hidden lg:block"
      >
        <div className="glass flex h-[120px] items-end gap-1.5 rounded-xl p-3">
          {[
            { h: 60, c: "bg-emerald-400" },
            { h: 75, c: "bg-emerald-400" },
            { h: 50, c: "bg-rose-400"    },
            { h: 88, c: "bg-emerald-400" },
            { h: 68, c: "bg-emerald-400" },
            { h: 95, c: "bg-emerald-400" }
          ].map((bar, i) => (
            <span key={i} className={`w-2.5 rounded-sm ${bar.c}`} style={{ height: `${bar.h}%` }} />
          ))}
        </div>
      </div>

      {/* Floating ticker pills */}
      {tickers.map((t) => (
        <div
          key={t.sym}
          aria-hidden="true"
          className={`pointer-events-none absolute hidden md:block ${t.anim}`}
          style={{ left: t.left, top: t.top }}
        >
          <div className="glass inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-black shadow-lg">
            <span className="text-white">{t.sym}</span>
            <span className={t.color}>{t.pct}</span>
          </div>
        </div>
      ))}

      {/* Scrolling ticker tape at very bottom */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-0 overflow-hidden border-t border-white/10 bg-black/30 py-2 backdrop-blur-md">
        <div className="animate-ticker-tape inline-flex whitespace-nowrap">
          {Array.from({ length: 2 }).map((_, copy) => (
            <span key={copy} className="inline-flex items-center gap-6 px-6 text-[11px] font-black uppercase tracking-[0.18em] text-white/70">
              <span>AAPL <span className="text-emerald-400">+2.31%</span></span>
              <span>TSLA <span className="text-emerald-400">+5.12%</span></span>
              <span>NVDA <span className="text-emerald-400">+1.84%</span></span>
              <span>EQT  <span className="text-emerald-400">+12.40%</span></span>
              <span>FTAI <span className="text-emerald-400">+187%</span></span>
              <span>CRWD <span className="text-emerald-400">+18.60%</span></span>
              <span>HWM  <span className="text-emerald-400">+120%</span></span>
              <span>NET  <span className="text-emerald-400">+160%</span></span>
              <span>WAB  <span className="text-emerald-400">+52%</span></span>
              <span>MSFT <span className="text-emerald-400">+1.95%</span></span>
              <span>AMZN <span className="text-emerald-400">+2.78%</span></span>
              <span>GOOG <span className="text-emerald-400">+1.22%</span></span>
            </span>
          ))}
        </div>
      </div>
    </>
  );
}

function AuthInfoCard({ mode }: { mode: "login" | "signup" | "forgot" }) {
  const copy =
    mode === "signup"
      ? {
          label: "What StockyMonth unlocks",
          body: "Create one account for the featured monthly pick, top quality rankings, and the full research archive.",
          chips: ["Featured pick", "Top quality", "All picks"]
        }
      : mode === "forgot"
        ? {
            label: "Secure reset",
            body: "Reset instructions are sent through your registered email and expire after 30 minutes.",
            chips: ["Email link", "30 min expiry", "Redis token"]
          }
        : {
            label: "How StockyMonth ranks",
            body: "Each pick blends market data, analyst rationale, and risk checks into a monthly conviction workflow.",
            chips: ["Active buy", "Quality screen", "Research vault"]
          };

  return (
    <div className="mt-8 rounded-md border border-[#e2e8f0] bg-white/70 p-4 text-left shadow-sm">
      <p className="text-[11px] font-black uppercase tracking-[0.18em] text-[#0e7490]">{copy.label}</p>
      <p className="mt-3 text-sm font-semibold leading-6 text-[#475569]">{copy.body}</p>
      <div className="mt-4 flex flex-wrap gap-2">
        {copy.chips.map((chip, index) => (
          <span
            key={chip}
            className={`rounded-full border px-2.5 py-1 text-[11px] font-black ${
              index === 0
                ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                : index === 1
                  ? "border-orange-200 bg-orange-50 text-[#ff4f00]"
                  : "border-[#e2e8f0] bg-[#ecfeff] text-[#0f1729]"
            }`}
          >
            {chip}
          </span>
        ))}
      </div>
    </div>
  );
}

function GoogleAccountChooser({
  accounts,
  onClose,
  onSelect
}: {
  accounts: Array<{ email: string; firstName: string; lastName: string }>;
  onClose: () => void;
  onSelect: (account: { email: string; firstName: string; lastName: string }) => void;
}) {
  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-950/40 px-4 py-8 backdrop-blur-sm">
      <section className="w-full max-w-md rounded-md border border-slate-200 bg-white p-6 text-[#0f172a] shadow-2xl">
        <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.18em] text-[#ff4f00]">Google</p>
            <h2 className="mt-2 text-2xl font-black text-[#0f172a]">Choose an account</h2>
          </div>
          <button
            type="button"
            aria-label="Close Google account chooser"
            onClick={onClose}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 text-slate-500 transition hover:bg-slate-50 hover:text-[#0f172a]"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        <div className="mt-4 grid gap-2">
          {accounts.map((account) => {
            const initials = `${account.firstName.charAt(0)}${account.lastName.charAt(0)}`.toUpperCase();

            return (
              <button
                key={account.email}
                type="button"
                onClick={() => onSelect(account)}
                className="flex items-center gap-3 rounded-md border border-slate-100 p-3 text-left transition hover:border-orange-200 hover:bg-orange-50"
              >
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#0f172a] text-sm font-black text-white">
                  {initials}
                </span>
                <span className="min-w-0">
                  <span className="block truncate text-sm font-black text-[#0f172a]">
                    {account.firstName} {account.lastName}
                  </span>
                  <span className="block truncate text-xs font-semibold text-slate-500">{account.email}</span>
                </span>
              </button>
            );
          })}
        </div>

        <p className="mt-4 text-xs font-semibold leading-relaxed text-slate-500">
          Choose an account to continue securely to StockyMonth.
        </p>
      </section>
    </div>
  );
}

function InvestorHeroIllustration() {
  return (
    <div className="relative mx-auto hidden h-[430px] w-full max-w-xl md:block" aria-hidden="true">
      <div className="absolute right-10 top-8 h-72 w-72 rounded-full bg-[#fff1ea]" />
      <div className="absolute right-6 top-20 h-48 w-72">
        <div className="absolute bottom-0 left-8 h-24 w-5 rounded-t bg-[#ff9b64]" />
        <div className="absolute bottom-0 left-20 h-36 w-5 rounded-t bg-[#ff6b4a]" />
        <div className="absolute bottom-0 left-32 h-28 w-5 rounded-t bg-[#ff9b64]" />
        <div className="absolute bottom-0 left-44 h-44 w-5 rounded-t bg-[#ff3b6d]" />
        <div className="absolute bottom-0 left-56 h-[136px] w-5 rounded-t bg-[#ff6b4a]" />
        <div className="absolute left-8 top-12 h-24 w-64 border-t-2 border-dashed border-[#c9c2df]" />
      </div>

      <div className="absolute right-20 top-20 h-52 w-64 rounded-[40px] bg-[#07031d] shadow-2xl" />
      <div className="absolute right-24 top-2 h-48 w-52 rotate-[-14deg] rounded-[48px] bg-[#06b6d4]" />
      <div className="absolute right-28 top-24 h-44 w-44 rounded-[40px] bg-gradient-to-br from-[#ff8a3d] to-[#06b6d4]" />
      <div className="absolute right-40 top-36 text-[96px] font-black leading-none text-white">$</div>
      <div className="absolute right-44 top-14 h-20 w-24 rounded-b-[46px] rounded-t-[24px] bg-[#090421]" />
      <div className="absolute right-56 top-16 h-10 w-10 rounded-full bg-[#e0f2fe]" />
      <div className="absolute right-[100px] top-16 h-10 w-10 rounded-full bg-[#e0f2fe]" />

      <div className="absolute bottom-4 right-28 h-28 w-64 rotate-6 rounded-md bg-[#cffafe] shadow-xl">
        <div className="mx-auto mt-4 h-16 w-48 rounded bg-white p-3">
          <div className="flex h-full items-end gap-2">
            {[42, 64, 35, 72, 58, 88].map((height, index) => (
              <span key={`${height}-${index}`} className="flex-1 rounded-t bg-[#0f1729]" style={{ height: `${height}%` }} />
            ))}
          </div>
        </div>
      </div>

      <div className="absolute bottom-12 right-0 h-20 w-28 rotate-[-20deg] rounded-tl-[48px] bg-[#06b6d4]" />
      <div className="absolute right-14 top-0 h-20 w-10 rotate-[24deg] border-2 border-[#090421]" />
      <div className="absolute bottom-14 left-24 h-8 w-16 rotate-[-12deg] rounded-md bg-[#ff6b4a]" />
      <div className="absolute bottom-20 right-24 h-8 w-16 rotate-[15deg] rounded-md bg-[#ff6b4a]" />
      <TrendingUp className="absolute bottom-12 right-4 h-32 w-32 text-[#06b6d4]" strokeWidth={5} />
    </div>
  );
}

function AuthWinningPickCard({ pick }: { pick: (typeof authWinningPicks)[number] }) {
  return (
    <article className="rounded-md bg-white p-5 text-[#0f172a] shadow-xl">
      <div className="flex items-start gap-3">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[#fff1ea] text-sm font-black text-[#ff4f00] ring-1 ring-orange-100">
          {pick.ticker.slice(0, 2)}
        </div>
        <div>
          <h3 className="text-lg font-black leading-tight">
            {pick.name} ({pick.ticker})
          </h3>
          <p className="mt-1 text-sm font-bold leading-5 text-[#475569]">Picked: {pick.picked}</p>
          <p className="text-sm font-bold leading-5 text-[#475569]">Returns as of: December 2025</p>
        </div>
      </div>
      <div className="mt-7 rounded-md bg-emerald-100 px-4 py-4 text-center text-lg font-black text-emerald-700">
        Total Return {pick.return}
      </div>
    </article>
  );
}

function AuthInput({
  autoComplete,
  icon,
  label,
  onChange,
  placeholder,
  type,
  value
}: {
  autoComplete?: string;
  icon?: React.ReactNode;
  label: string;
  onChange: (value: string) => void;
  placeholder: string;
  type: string;
  value: string;
}) {
  return (
    <label className="block">
      <span className="text-sm font-black text-slate-700">{label}</span>
      <span className="mt-2 flex h-12 items-center gap-3 rounded-md border border-slate-200 bg-white px-4 shadow-sm transition focus-within:border-orange-300 focus-within:ring-4 focus-within:ring-orange-100">
        {icon && <span className="text-slate-400">{icon}</span>}
        <input
          autoComplete={autoComplete}
          className="h-full min-w-0 flex-1 bg-transparent text-sm font-semibold text-[#0f172a] outline-none placeholder:text-slate-400"
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          required
          type={type}
          value={value}
        />
      </span>
    </label>
  );
}

function PageBackdrop({ view }: { view: StockExperienceView }) {
  if (view === "monthly") {
    return (
      <>
        <div aria-hidden="true" className="animate-drift-wide pointer-events-none absolute -top-32 left-1/4 h-80 w-80 rounded-full bg-cyan-300/30 blur-3xl" />
        <div aria-hidden="true" className="animate-drift-wide pointer-events-none absolute top-1/3 -right-32 h-80 w-80 rounded-full bg-orange-300/30 blur-3xl" style={{ animationDelay: "3s" }} />
        <div aria-hidden="true" className="animate-drift-wide pointer-events-none absolute -bottom-32 left-1/3 h-72 w-72 rounded-full bg-emerald-200/30 blur-3xl" style={{ animationDelay: "6s" }} />
      </>
    );
  }

  if (view === "quality") {
    return (
      <>
        <div aria-hidden="true" className="animate-drift-wide pointer-events-none absolute -top-32 -left-32 h-96 w-96 rounded-full bg-emerald-300/30 blur-3xl" />
        <div aria-hidden="true" className="animate-drift-wide pointer-events-none absolute top-1/2 -right-32 h-80 w-80 rounded-full bg-teal-300/30 blur-3xl" style={{ animationDelay: "2.5s" }} />
        <div aria-hidden="true" className="animate-drift-wide pointer-events-none absolute -bottom-32 left-1/3 h-72 w-72 rounded-full bg-cyan-200/30 blur-3xl" style={{ animationDelay: "5s" }} />
        {/* Subtle teal grid that hints at a screen / matrix */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-[0.035] [background-image:linear-gradient(rgba(13,148,136,0.6)_1px,transparent_1px),linear-gradient(90deg,rgba(13,148,136,0.6)_1px,transparent_1px)] [background-size:64px_64px]"
        />
      </>
    );
  }

  if (view === "all-picks") {
    return (
      <>
        <div aria-hidden="true" className="animate-drift-wide pointer-events-none absolute -top-32 right-1/4 h-80 w-80 rounded-full bg-amber-300/35 blur-3xl" />
        <div aria-hidden="true" className="animate-drift-wide pointer-events-none absolute top-1/2 -left-32 h-80 w-80 rounded-full bg-rose-200/35 blur-3xl" style={{ animationDelay: "3s" }} />
        <div aria-hidden="true" className="animate-drift-wide pointer-events-none absolute -bottom-32 right-1/3 h-72 w-72 rounded-full bg-orange-200/30 blur-3xl" style={{ animationDelay: "5.5s" }} />
        {/* Faint amber dot pattern — archive feel */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-[0.05] [background-image:radial-gradient(rgba(217,119,6,0.55)_1px,transparent_1px)] [background-size:34px_34px]"
        />
        {/* Slow horizontal ticker tape at the very bottom */}
        <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-0 h-10 overflow-hidden opacity-[0.08]">
          <div className="animate-ticker-tape flex whitespace-nowrap text-[10px] font-black uppercase tracking-[0.28em] text-amber-700">
            {Array.from({ length: 2 }).map((_, copy) => (
              <span key={copy} className="inline-flex items-center gap-6 px-6">
                <span>2024 · 2025 · 2026</span>
                <span>archive · vault · history</span>
                <span>FTAI · NET · HWM · CRWD · WAB</span>
                <span>monthly picks · curated</span>
              </span>
            ))}
          </div>
        </div>
      </>
    );
  }

  if (view === "subscription") {
    return (
      <>
        <div aria-hidden="true" className="animate-drift-wide pointer-events-none absolute -top-32 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-violet-300/30 blur-3xl" />
        <div aria-hidden="true" className="animate-drift-wide pointer-events-none absolute top-1/3 -left-32 h-80 w-80 rounded-full bg-sky-300/30 blur-3xl" style={{ animationDelay: "2.5s" }} />
        <div aria-hidden="true" className="animate-drift-wide pointer-events-none absolute -bottom-32 -right-32 h-80 w-80 rounded-full bg-fuchsia-200/30 blur-3xl" style={{ animationDelay: "5s" }} />
        {/* Floating premium sparkles */}
        {[
          { left: "12%", top: "20%", delay: "0s",   color: "bg-violet-400" },
          { left: "82%", top: "30%", delay: "1.5s", color: "bg-sky-400"    },
          { left: "22%", top: "70%", delay: "3s",   color: "bg-fuchsia-400" },
          { left: "70%", top: "75%", delay: "4.5s", color: "bg-violet-400" }
        ].map((s, i) => (
          <span
            key={i}
            aria-hidden="true"
            className={`pointer-events-none absolute h-1.5 w-1.5 rounded-full ${s.color} opacity-60 animate-pulse-glow`}
            style={{ left: s.left, top: s.top, animationDelay: s.delay }}
          />
        ))}
      </>
    );
  }

  return null;
}

function TopNav({
  currentView,
  currentUser,
  hasPremiumAccess,
  onSignOut
}: {
  currentView: StockExperienceView;
  currentUser: RegisteredUser;
  hasPremiumAccess: boolean;
  onSignOut?: () => void;
}) {
  const monthlyHref = hasPremiumAccess ? "/stock-of-the-month" : "/subscription?feature=monthly";
  const qualityHref = hasPremiumAccess ? "/top-quality-stocks" : "/subscription?feature=quality";
  const allPicksHref = hasPremiumAccess ? "/all-picks" : "/subscription?feature=all-picks";

  return (
    <nav className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/96 shadow-sm backdrop-blur-md">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6">
        <Link href={monthlyHref} className="group flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-md bg-[#ff4f00] text-white shadow-sm transition-transform duration-200 group-hover:scale-105">
            <BarChart3 className="h-6 w-6" aria-hidden="true" />
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-black tracking-tight text-[#0f172a] md:text-2xl">StockyMonth</span>
            {hasPremiumAccess && (
              <span className="hidden text-[9px] font-black uppercase tracking-[0.2em] text-[#ff4f00] md:block">Premium</span>
            )}
          </div>
        </Link>

        <div className="hidden items-center gap-1 md:flex">
          <Link href={monthlyHref} className={navLinkClass(currentView === "monthly")}>
            Stock of the Month
          </Link>
          <Link href={qualityHref} className={navLinkClass(currentView === "quality")}>
            Top High Quality Stocks
          </Link>
          <Link href={allPicksHref} className={navLinkClass(currentView === "all-picks")}>
            All Picks
          </Link>
        </div>

        <ProfileMenu currentUser={currentUser} hasPremiumAccess={hasPremiumAccess} />
      </div>
    </nav>
  );
}

function navLinkClass(isActive: boolean) {
  return `relative rounded-full px-4 py-2.5 text-sm font-black transition-all duration-200 ${
    isActive
      ? "bg-gradient-to-r from-orange-50 to-orange-100/60 text-[#ff4f00] shadow-sm ring-1 ring-orange-200/60"
      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
  }`;
}

function ProfileMenu({
  currentUser,
  hasPremiumAccess
}: {
  currentUser: RegisteredUser;
  hasPremiumAccess: boolean;
  onSignOut?: () => void;
}) {
  return (
    <Link
      href="/profile"
      aria-label="Open profile"
      className="group inline-flex h-10 items-center gap-2 rounded-full border border-slate-200 bg-white px-2.5 pr-3 text-sm font-black text-slate-800 shadow-sm transition-all duration-200 hover:border-[#0f1729] hover:bg-[#ecfeff] hover:shadow"
    >
      <div className="relative flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#0f1729] to-[#1e293b] text-[10px] font-black text-white shadow-sm">
        {getUserInitials(currentUser)}
        {hasPremiumAccess && (
          <span
            aria-hidden="true"
            className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-white bg-emerald-500"
          />
        )}
      </div>
      <span className="hidden sm:inline">{currentUser.firstName}</span>
    </Link>
  );
}

function Hero({ monthlyPick }: { monthlyPick: MonthlyPick }) {
  return (
    <section className="border-b border-slate-200 bg-[#f8fafc] px-6 py-12">
      <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
        <Reveal>
          <p className="inline-flex items-center gap-2 rounded-full border border-orange-100 bg-orange-50 px-4 py-2 text-sm font-black text-[#ff4f00]">
            <Sparkles className="h-4 w-4" aria-hidden="true" />
            {monthlyPick.month} Stock of the Month
          </p>
          <h1 className="mt-7 max-w-4xl text-3xl font-black leading-tight text-[#0f172a] md:text-4xl">
            Monthly stock picks with focused data, thesis, and quality shortlist.
          </h1>
          <p className="mt-5 max-w-3xl text-base leading-relaxed text-slate-600 md:text-lg">
            {monthlyPick.name} ({monthlyPick.ticker}) is the current featured idea. Review the thesis,
            open detailed Alpha Vantage charts, and compare six high-quality stocks.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/stock-of-the-month"
              className="inline-flex h-14 items-center justify-center rounded-full bg-[#ff4f00] px-8 text-base font-black text-white transition hover:bg-orange-600"
            >
              View stock of the month
            </Link>
            <Link
              href="/top-quality-stocks"
              className="inline-flex h-14 items-center justify-center rounded-full border border-slate-200 bg-white px-8 text-base font-black text-slate-800 transition hover:bg-slate-50"
            >
              See top quality picks
            </Link>
          </div>
        </Reveal>

        <Reveal className="rounded-md border border-slate-200 bg-white p-5 shadow-xl">
          <div className="rounded-md border border-slate-200 bg-[#f8fafc] p-5 shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-200 pb-4">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-500">Latest stock pick</p>
                <h2 className="mt-2 text-2xl font-black text-[#0f172a]">{monthlyPick.ticker}</h2>
              </div>
              <span className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-sm font-black text-emerald-700">
                <LiveDot />
                {monthlyPick.rating}
              </span>
            </div>
            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              <MiniStat label="Price" value={monthlyPick.price} />
              <MiniStat label="Move" value={monthlyPick.change} positive={monthlyPick.change.startsWith("+")} />
              <MiniStat label="Sector" value={monthlyPick.sector} />
            </div>
            <div className="mt-6 h-44 rounded-md border border-slate-200 bg-white p-4">
              <div className="flex h-full items-end gap-2">
                {[42, 58, 49, 70, 63, 76, 68, 82, 78, 90, 84, 96].map((height, index) => (
                  <div
                    key={`${height}-${index}`}
                    className="flex-1 rounded-t bg-[#ff4f00]"
                    style={{ height: `${height}%`, opacity: 0.45 + index / 24 }}
                  />
                ))}
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function MonthlyPickSection({ hasPremiumAccess, monthlyPick }: { hasPremiumAccess: boolean; monthlyPick: MonthlyPick }) {
  const backingPoints = [
    {
      icon: <CircleDollarSign className="h-5 w-5" aria-hidden="true" />,
      text: "EQT is the lowest-cost major natural gas producer in the U.S. It can stay profitable in weak gas markets and generate outsized cash flow when prices rise."
    },
    {
      icon: <TrendingUp className="h-5 w-5" aria-hidden="true" />,
      text: "EQT stands to benefit from two major long-term tailwinds. LNG export growth is globalizing the gas market, while AI data center buildouts are driving new electricity demand."
    },
    {
      icon: <BriefcaseBusiness className="h-5 w-5" aria-hidden="true" />,
      text: "CEO Toby Rice helped drive EQT's transformation and 4x+ stock appreciation since taking the reins in 2019, owns over $100 million of stock, and receives just a $1 salary."
    }
  ];

  return (
    <section id="stock-of-month" className="scroll-mt-24 bg-[#f8fafc] px-4 py-6 md:px-6">
      <div className="mx-auto max-w-[1460px]">
        <Reveal className="sr-only mb-7 flex items-center gap-3 text-[#0f172a]">
          <CircleGauge className="h-6 w-6" aria-hidden="true" />
          <h2 className="text-xl font-black tracking-tight md:text-2xl">Our Latest Stock Pick</h2>
        </Reveal>

        <Reveal as="article" className="group relative overflow-hidden rounded-2xl border border-slate-800/80 bg-[#0a1024] p-3 shadow-2xl md:p-4">
          {/* Animated color-graded orbs */}
          <div aria-hidden="true" className="animate-drift-wide pointer-events-none absolute -left-32 -top-32 h-[420px] w-[420px] rounded-full bg-cyan-500/15 blur-3xl" />
          <div aria-hidden="true" className="animate-drift-wide pointer-events-none absolute -right-32 top-1/3 h-[420px] w-[420px] rounded-full bg-orange-500/15 blur-3xl" style={{ animationDelay: "3s" }} />
          <div aria-hidden="true" className="animate-drift-wide pointer-events-none absolute -bottom-32 left-1/3 h-[360px] w-[360px] rounded-full bg-emerald-500/10 blur-3xl" style={{ animationDelay: "6s" }} />
          {/* Top gradient hairline */}
          <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-400/60 to-transparent" />

          <div className="relative grid gap-5 lg:grid-cols-[0.56fr_1fr] lg:items-stretch">
            <MonthlyPickArtwork monthlyPick={monthlyPick} />

            <div className="flex min-w-0 flex-col justify-start py-1">
              <div className="flex flex-wrap items-center gap-3">
                <EQTLogo />
                <span className="animate-pulse-soft inline-flex items-center gap-2 rounded-full bg-[#22c55e] px-3 py-1.5 text-sm font-black text-[#0f172a]">
                  <LiveDot dark />
                  {monthlyPick.rating}
                </span>
              </div>

              {/* Animated gradient title with sheen sweep */}
              <h3 className="relative mt-4 inline-block w-fit overflow-hidden bg-gradient-to-r from-white via-cyan-100 to-[#ffd4c2] bg-clip-text text-3xl font-black leading-tight text-transparent">
                {monthlyPick.name} ({monthlyPick.ticker})
                <span aria-hidden="true" className="animate-sheen-sweep pointer-events-none absolute inset-0 bg-[linear-gradient(110deg,transparent_30%,rgba(255,255,255,0.55)_50%,transparent_70%)] bg-clip-text text-transparent" />
              </h3>

              <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm font-black text-slate-400">
                <span className="inline-flex items-center gap-2">
                  <BriefcaseBusiness className="h-4 w-4 text-slate-500" aria-hidden="true" />
                  {monthlyPick.sector}
                </span>
                <span className="inline-flex items-center gap-2">
                  <Database className="h-4 w-4 text-slate-500" aria-hidden="true" />
                  <span className="font-mono text-slate-200">{monthlyPick.price}</span>{" "}
                  <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs ${
                    monthlyPick.change.startsWith("+")
                      ? "bg-emerald-400/15 text-emerald-300"
                      : "bg-rose-400/15 text-rose-300"
                  }`}>
                    {monthlyPick.change.startsWith("+") ? "▲" : "▼"} {monthlyPick.change.replace(/^[+-]/, "")}
                  </span>
                </span>
              </div>

              <p className="mt-4 max-w-5xl text-sm font-medium leading-relaxed text-slate-300 md:text-base">{monthlyPick.summary}</p>

              <div className="mt-6">
                <div className="mb-4 flex items-center gap-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-800 text-[#22c55e] ring-1 ring-emerald-400/20">
                    <CircleDollarSign className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <h4 className="text-sm font-black uppercase tracking-tight text-white md:text-base">
                    Why this is the best pick of the month
                  </h4>
                </div>

                <div className="grid gap-3">
                  {backingPoints.map((point, index) => (
                    <BackingPoint key={point.text} accent={index} icon={point.icon} text={point.text} />
                  ))}
                </div>
              </div>

              <Link
                href={`/analysis/${monthlyPick.ticker}`}
                className="group/cta mt-6 inline-flex h-11 w-fit items-center justify-center gap-2 overflow-hidden rounded-full bg-gradient-to-r from-[#ff4f00] to-orange-500 px-5 text-sm font-black text-white shadow-lg shadow-orange-500/30 transition hover:shadow-orange-400/50"
              >
                <span className="relative">Detailed analysis</span>
                <LineChart className="h-4 w-4 transition-transform duration-200 group-hover/cta:translate-x-0.5" aria-hidden="true" />
              </Link>
            </div>
          </div>
        </Reveal>
        {!hasPremiumAccess && <PremiumUnlockPanel />}
        {hasPremiumAccess && (
          <Reveal className="mt-8 rounded-md border border-emerald-200 bg-emerald-50 p-5 text-emerald-800 shadow-sm">
            <div className="flex flex-col justify-between gap-3 md:flex-row md:items-center">
              <div>
                <p className="text-sm font-black uppercase tracking-[0.16em]">Premium unlocked</p>
                <h2 className="mt-1 text-2xl font-black text-[#0f172a]">All three StockyMonth sections are available.</h2>
              </div>
              <div className="flex flex-wrap gap-2 text-sm font-black">
                <Link href="/stock-of-the-month" className="rounded-full bg-white px-4 py-2 text-emerald-700">
                  Stock of the Month
                </Link>
                <Link href="/top-quality-stocks" className="rounded-full bg-white px-4 py-2 text-emerald-700">
                  Top High Quality Stocks
                </Link>
                <Link href="/all-picks" className="rounded-full bg-white px-4 py-2 text-emerald-700">
                  All Picks
                </Link>
              </div>
            </div>
          </Reveal>
        )}
      </div>
    </section>
  );
}

function DetailedAnalysisSection({ monthlyPick }: { monthlyPick: MonthlyPick }) {
  const analysisCards = [
    {
      title: "The thesis",
      text: "EQT pairs a low-cost Appalachian gas base with two demand tailwinds: LNG export growth and power demand from AI data center buildouts."
    },
    {
      title: "Vertical integration",
      text: "The Equitrans acquisition gives EQT more control over gathering and transport, which can reduce friction and improve realized cash flow across cycles."
    },
    {
      title: "Competitive landscape",
      text: "Against Expand Energy, Range Resources, and Antero, EQT's scale, inventory depth, and operating cost profile give it a strong seat in natural gas."
    },
    {
      title: "Management alignment",
      text: "CEO Toby Rice owns meaningful stock and receives a symbolic $1 salary, keeping investor attention on performance-linked long-term value creation."
    }
  ];

  return (
    <Reveal className="relative mt-8 overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[#ff4f00] via-orange-400 to-cyan-400" />
      <div aria-hidden="true" className="pointer-events-none absolute -right-32 -top-24 h-72 w-72 rounded-full bg-orange-100/60 blur-3xl" />
      <div aria-hidden="true" className="pointer-events-none absolute -bottom-32 -left-24 h-72 w-72 rounded-full bg-cyan-100/50 blur-3xl" />

      <div className="relative grid gap-6 lg:grid-cols-[0.85fr_1.15fr] lg:items-start">
        <div>
          <p className="inline-flex items-center gap-2 rounded-full border border-orange-200 bg-orange-50 px-3 py-1 text-xs font-black uppercase tracking-[0.22em] text-[#ff4f00]">
            <Sparkles className="h-3 w-3" aria-hidden="true" />
            Detailed analysis
          </p>
          <h2 className="mt-3 bg-gradient-to-r from-[#0f172a] via-[#0f1729] to-[#ff4f00] bg-clip-text text-3xl font-black text-transparent">
            Why {monthlyPick.name} is the May 2026 pick
          </h2>
          <p className="mt-4 text-base leading-relaxed text-slate-600">
            A deeper look at the setup behind the monthly call: catalysts, cost structure, market positioning, and management alignment.
          </p>
          <Link
            href={`/analysis/${monthlyPick.ticker}`}
            className="group/cta mt-6 inline-flex h-11 items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#ff4f00] to-orange-500 px-5 text-sm font-black text-white shadow-lg shadow-orange-200 transition hover:shadow-orange-300"
          >
            Open full analysis
            <LineChart className="h-4 w-4 transition-transform duration-200 group-hover/cta:translate-x-0.5" aria-hidden="true" />
          </Link>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {analysisCards.map((card, index) => {
            const accents = [
              "from-orange-400 to-rose-400",
              "from-cyan-400 to-sky-500",
              "from-emerald-400 to-teal-500",
              "from-violet-400 to-fuchsia-500"
            ];
            return (
              <article
                key={card.title}
                className="group relative overflow-hidden rounded-xl border border-slate-200 bg-gradient-to-b from-white to-slate-50/70 p-5 transition-all duration-200 hover:-translate-y-1 hover:border-transparent hover:shadow-xl"
              >
                <div aria-hidden="true" className={`absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r ${accents[index]} opacity-0 transition-opacity duration-200 group-hover:opacity-100`} />
                <h3 className="text-lg font-black text-[#0f172a]">{card.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-slate-600">{card.text}</p>
              </article>
            );
          })}
        </div>
      </div>
    </Reveal>
  );
}

function AllPicksSection({ picks }: { picks: ArchivePick[] }) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  return (
    <section id="all-picks" className="scroll-mt-24 bg-gradient-to-b from-[#f8fafc] to-slate-100/50 px-6 py-14">
      <div className="mx-auto max-w-7xl">
        <Reveal className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.18em] text-[#ff4f00]">Historical Archive</p>
            <h2 className="mt-3 text-3xl font-black text-[#0f172a]">All Picks</h2>
            <p className="mt-3 max-w-2xl text-base leading-relaxed text-slate-600">
              A complete archive of StockyMonth monthly selections with price movement, short summaries, and the three core reasons behind each pick.
            </p>
          </div>
        </Reveal>

        <div className="grid gap-6 md:grid-cols-2 md:gap-7 xl:grid-cols-3">
          {picks.map((pick, index) => {
            return (
              <Reveal key={`${pick.month}-${pick.ticker}`} delay={(index % 6) * 55}>
                <article
                  role="button"
                  tabIndex={0}
                  onClick={() => setActiveIndex(index)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      setActiveIndex(index);
                    }
                  }}
                  className={`group relative flex min-h-full cursor-pointer flex-col overflow-hidden rounded-2xl border bg-white p-6 shadow-sm transition-all duration-200 hover:-translate-y-1.5 hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-orange-100 md:p-7 ${
                    activeIndex === index
                      ? "border-[#ff4f00] bg-gradient-to-br from-orange-50 to-white shadow-xl ring-2 ring-orange-100"
                      : "border-slate-200 hover:border-orange-200 hover:bg-orange-50/30"
                  }`}
                >
                  {activeIndex === index && (
                    <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[#ff4f00] to-orange-400" />
                  )}
                  <div className="mb-6 flex items-start justify-between gap-4">
                    <div className="flex min-w-0 gap-3">
                      <ArchiveLogo pick={pick} />
                      <div className="min-w-0">
                        <p className="text-sm font-black text-[#ff4f00]">{pick.month}</p>
                        <h3 className="mt-1 text-lg font-black leading-snug text-[#0f172a]">
                          {pick.name} ({pick.ticker})
                        </h3>
                      </div>
                    </div>
                    <span className="inline-flex shrink-0 items-center gap-2 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-black uppercase tracking-wide text-emerald-700">
                      <LiveDot />
                      {activeIndex === index ? "Selected" : "Active Buy"}
                    </span>
                  </div>

                  <div className="mb-6 flex items-end justify-between border-y border-slate-200 py-5">
                    <p className="text-2xl font-black text-[#0f172a]">{pick.price}</p>
                    <p className={`text-sm font-black ${pick.change.startsWith("+") ? "text-emerald-700" : "text-rose-600"}`}>
                      {pick.change}
                    </p>
                  </div>

                  <p className="text-sm leading-relaxed text-slate-600">{pick.summary}</p>
                  <ul className="mt-5 grid gap-3">
                    {pick.bullets.map((bullet) => (
                      <li key={bullet} className="flex gap-3 text-sm leading-relaxed text-slate-700">
                        <span aria-hidden="true" className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#ff4f00]" />
                        <span>{bullet}</span>
                      </li>
                    ))}
                  </ul>
                </article>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function MonthlyPickArtwork({ monthlyPick }: { monthlyPick: MonthlyPick }) {
  const bullets = (monthlyPick.summaryBullets?.length ? monthlyPick.summaryBullets : [monthlyPick.thesis]).slice(0, 4);

  return (
    <div className="relative h-full min-h-[430px] overflow-hidden rounded-md bg-gradient-to-br from-[#cfe9e5] via-[#d6e9e7] to-[#b9dad4] p-4 sm:p-5 lg:min-h-[0]">
      {/* Animated drifting blobs */}
      <div aria-hidden="true" className="animate-drift-wide absolute -left-24 -top-24 h-48 w-48 rounded-full bg-[#207d72] opacity-90" />
      <div aria-hidden="true" className="animate-drift-wide absolute left-16 -top-28 h-56 w-56 rounded-full bg-[#88beb8]/85" style={{ animationDelay: "2.5s" }} />
      <div aria-hidden="true" className="animate-drift-wide absolute -left-16 top-24 h-32 w-32 rotate-[8deg] rounded-[42px] bg-[#bce3df]/90" style={{ animationDelay: "4s" }} />
      <div aria-hidden="true" className="absolute right-24 top-0 h-20 w-60 bg-[#bde2df]/80" />
      <div aria-hidden="true" className="absolute right-12 top-0 h-20 w-24 skew-x-[-24deg] bg-[#7db4ae]" />
      <div aria-hidden="true" className="animate-float-medium absolute -right-10 top-8 h-24 w-24 rotate-45 rounded-[42px] bg-[#207d72]" />
      <div aria-hidden="true" className="animate-drift-wide absolute -bottom-24 -left-10 h-48 w-48 rounded-full bg-[#207d72]" style={{ animationDelay: "5s" }} />
      <div aria-hidden="true" className="absolute bottom-0 right-0 h-0 w-0 border-b-[120px] border-l-[120px] border-b-[#207d72] border-l-transparent" />
      <div aria-hidden="true" className="absolute bottom-0 right-20 h-0 w-0 border-b-[96px] border-l-[96px] border-b-[#88beb8] border-l-transparent" />

      {/* Animated sparkline running across the top */}
      <svg
        aria-hidden="true"
        viewBox="0 0 480 80"
        preserveAspectRatio="none"
        className="pointer-events-none absolute inset-x-0 top-1/2 z-[1] h-24 w-full -translate-y-1/2 opacity-25 mix-blend-multiply"
      >
        <defs>
          <linearGradient id="mpa-line" x1="0" x2="1" y1="0" y2="0">
            <stop offset="0%"   stopColor="#0f6e63" stopOpacity="0" />
            <stop offset="50%"  stopColor="#0f6e63" stopOpacity="1" />
            <stop offset="100%" stopColor="#0f6e63" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path
          d="M0,55 C40,48 80,30 130,38 C180,46 220,18 270,24 C320,30 360,12 400,16 C440,20 470,8 480,6"
          fill="none"
          stroke="url(#mpa-line)"
          strokeWidth="1.5"
          strokeLinecap="round"
          className="animate-draw-line"
        />
      </svg>

      <div className="relative z-10 flex flex-col">
        {/* Header — fixed clipping by stacking eyebrow above the row with the badge */}
        <div className="flex items-center gap-2">
          <span aria-hidden="true" className="flex h-1.5 w-1.5 rounded-full bg-[#ff4f00] animate-pulse-soft" />
          <p className="text-[10px] font-black uppercase tracking-[0.28em] text-[#0f6e63]">
            Dynamic LLM Brief · <span className="text-[#207d72]/70">Live</span>
          </p>
        </div>

        <div className="mt-3 flex items-center gap-3">
          <span className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white text-[#0f172a] shadow-md ring-2 ring-white/70">
            <BadgeCheck className="h-6 w-6 text-[#0f6e63]" aria-hidden="true" />
            <span aria-hidden="true" className="absolute inset-0 rounded-full ring-2 ring-[#207d72]/0 ring-offset-2 ring-offset-transparent animate-pulse-soft" />
          </span>
          <div className="min-w-0 flex-1">
            <h3 className="text-2xl font-black leading-tight text-[#0f172a] md:text-[26px]">
              {monthlyPick.month} <span className="bg-gradient-to-r from-[#0f6e63] to-[#207d72] bg-clip-text text-transparent">Pick</span>
            </h3>
            <p className="mt-0.5 inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-[0.18em] text-[#0f6e63]/80">
              <span className="font-mono text-[#0f172a]">{monthlyPick.ticker}</span>
              <span className="text-[#207d72]/50">·</span>
              <span className="font-mono">{monthlyPick.price}</span>
            </p>
          </div>
        </div>

        {/* Mini live-feed strip */}
        <div className="mt-4 flex items-center gap-2 rounded-full bg-white/70 px-3 py-1.5 backdrop-blur-sm ring-1 ring-white/60 shadow-sm">
          <span aria-hidden="true" className="flex h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.7)]" />
          <span className="text-[10px] font-black uppercase tracking-[0.18em] text-[#0f6e63]">Signal feed</span>
          <span className="text-[10px] font-mono font-bold text-slate-500">conviction · high</span>
          <span className="ml-auto text-[10px] font-mono text-slate-400">↻ 03:24</span>
        </div>

        {/* Bullet card */}
        <div className="relative mt-4 overflow-hidden rounded-xl bg-white/95 p-4 shadow-lg ring-1 ring-white/70 md:p-5">
          <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-[#0f6e63] via-emerald-400 to-[#ff4f00]" />
          <div aria-hidden="true" className="animate-sheen-sweep pointer-events-none absolute inset-y-0 -left-1/2 w-1/2 bg-[linear-gradient(110deg,transparent,rgba(15,110,99,0.06),transparent)]" />

          <div className="mb-3 flex items-center justify-between gap-3">
            <p className="text-sm font-black text-[#0f172a]">Exclusive Analysis for Subscribers</p>
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[9px] font-black uppercase tracking-wide text-emerald-700">
              <span aria-hidden="true" className="h-1 w-1 rounded-full bg-emerald-500" />
              4 / 4
            </span>
          </div>

          <ul className="grid gap-2.5">
            {bullets.map((item, index) => (
              <li
                key={item}
                className="group/bullet flex items-start gap-3 text-sm font-bold leading-snug text-[#0f172a] transition-all duration-200"
                style={{ animation: `fadeIn 0.4s ease-out ${index * 0.08}s both` }}
              >
                <span aria-hidden="true" className="mt-1.5 flex h-2.5 w-2.5 shrink-0 items-center justify-center rounded-full bg-[#ff4f00] ring-2 ring-orange-100 transition-transform duration-200 group-hover/bullet:scale-125" />
                <span className="flex-1">{item}</span>
              </li>
            ))}
          </ul>

          <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3">
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#0f6e63]">StockyMonth Research</p>
            <p className="text-[10px] font-mono font-bold text-slate-400">v2.6 · {monthlyPick.month.split(" ")[0]}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function EQTLogo() {
  return (
    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#04083d] text-white shadow-sm ring-4 ring-white">
      <span className="relative text-lg font-black tracking-[-0.12em]">
        E<span className="text-[#ff5377]">Q</span>T
      </span>
    </div>
  );
}

function BackingPoint({
  accent,
  icon,
  text
}: {
  accent: number;
  icon: React.ReactNode;
  text: string;
}) {
  const iconBg = ["bg-[#fff1ea] text-[#ff6b4a]", "bg-cyan-400/15 text-cyan-300", "bg-emerald-400/15 text-emerald-300"];
  const sideBar = ["from-orange-400/80 to-rose-400/60", "from-cyan-400/80 to-sky-400/60", "from-emerald-400/80 to-teal-400/60"];

  return (
    <div className="group relative grid grid-cols-[36px_1fr] gap-3 rounded-lg border border-white/5 bg-white/[0.02] py-3 pl-3 pr-4 transition-all duration-200 hover:-translate-y-0.5 hover:border-white/15 hover:bg-white/[0.04] hover:shadow-lg hover:shadow-cyan-500/5">
      <span aria-hidden="true" className={`pointer-events-none absolute inset-y-2 left-0 w-[2px] rounded-r bg-gradient-to-b ${sideBar[accent]} opacity-0 transition-opacity duration-200 group-hover:opacity-100`} />
      <span className={`flex h-8 w-8 items-center justify-center rounded-md ${iconBg[accent]} transition-transform duration-200 group-hover:scale-110`}>
        {icon}
      </span>
      <p className="text-sm font-medium leading-relaxed text-slate-200 md:text-base">{text}</p>
    </div>
  );
}

const cardAccents = [
  "from-orange-400 to-rose-400",
  "from-cyan-400 to-sky-500",
  "from-emerald-400 to-teal-500",
  "from-sky-400 to-blue-500",
  "from-amber-400 to-orange-400",
  "from-pink-400 to-rose-500"
];

function QualityPicksSection({ picks }: { picks: QualityPick[] }) {
  return (
    <section id="quality-picks" className="scroll-mt-24 border-y border-slate-200 bg-gradient-to-b from-white to-slate-50/60 px-6 py-16">
      <div className="mx-auto max-w-7xl">
        <Reveal className="mb-8">
          <p className="text-sm font-black uppercase tracking-[0.18em] text-[#ff4f00]">Top High Quality Stocks</p>
          <h2 className="mt-3 text-2xl font-black text-[#0f172a] md:text-3xl">Six focused companies for the current watchlist</h2>
        </Reveal>

        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {picks.map((pick, index) => (
            <Reveal key={pick.ticker} delay={index * 70}>
              <Link
                href={`/analysis/${pick.ticker}`}
                className="group relative block overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition-all duration-200 hover:-translate-y-1.5 hover:border-transparent hover:shadow-xl"
              >
                <div className={`h-1 w-full bg-gradient-to-r ${cardAccents[index % cardAccents.length]}`} />
                <div className="p-6">
                  <div className="flex items-start justify-end">
                    <span className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[11px] font-black uppercase tracking-wide text-emerald-700">
                      <LiveDot />
                      {pick.tag}
                    </span>
                  </div>
                  <div className="mt-5 flex items-center gap-3">
                    <CompanyLogo pick={pick} />
                    <div className="min-w-0">
                      <h3 className="text-lg font-black text-[#0f172a] transition-colors group-hover:text-[#ff4f00]">
                        {pick.name} ({pick.ticker})
                      </h3>
                      <p className="mt-1 text-sm font-bold text-slate-500">{pick.sector}</p>
                    </div>
                  </div>
                  <div className="mt-5 flex items-end justify-between">
                    <p className="text-lg font-black text-[#0f172a]">{pick.price}</p>
                    <p className={`text-sm font-black ${pick.change.startsWith("+") ? "text-emerald-700" : "text-rose-600"}`}>
                      {pick.change}
                    </p>
                  </div>
                  <p className="mt-5 line-clamp-3 text-sm leading-relaxed text-slate-600">{pick.thesis}</p>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function PremiumGate({ lockedFeature }: { lockedFeature: LockedFeatureKey }) {
  const copy = featureUnlockCopy[lockedFeature];

  return (
    <section className="bg-gradient-to-b from-[#f8fafc] via-orange-50/40 to-[#f8fafc] px-6 py-14">
      <div className="mx-auto max-w-6xl">
        <Reveal className="mb-8 overflow-hidden rounded-xl border border-orange-200 bg-white shadow-lg">
          <div className="h-1 w-full bg-gradient-to-r from-[#ff4f00] via-orange-400 to-rose-400" />
          <div className="flex flex-col gap-4 p-6 md:flex-row md:items-center md:justify-between md:p-8">
            <div>
              <p className="inline-flex items-center gap-2 rounded-full border border-orange-200 bg-orange-50 px-3 py-1 text-xs font-black uppercase tracking-[0.18em] text-[#ff4f00]">
                <LockKeyhole className="h-3.5 w-3.5" aria-hidden="true" />
                Premium locked
              </p>
              <h1 className="mt-3 bg-gradient-to-r from-[#0f172a] via-[#0f1729] to-[#ff4f00] bg-clip-text text-3xl font-black text-transparent">{copy.headline}</h1>
              <p className="mt-3 max-w-2xl text-base leading-relaxed text-slate-600">
                {copy.description} One $1.99 monthly plan unlocks all three premium sections.
              </p>
            </div>
            <Link
              href={`/subscription?feature=${lockedFeature}`}
              className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#ff4f00] to-orange-500 px-6 text-sm font-black text-white shadow-lg shadow-orange-200 transition hover:shadow-xl hover:shadow-orange-300"
            >
              <Sparkles className="h-4 w-4" aria-hidden="true" />
              Unlock premium
            </Link>
          </div>
        </Reveal>
        <PremiumUnlockPanel compact lockedFeature={lockedFeature} />
      </div>
    </section>
  );
}

function PremiumUnlockPanel({
  compact = false,
  currentUser = null,
  lockedFeature = "monthly"
}: {
  compact?: boolean;
  currentUser?: RegisteredUser | null;
  lockedFeature?: LockedFeatureKey;
}) {
  const copy = featureUnlockCopy[lockedFeature];
  const planFeatures = [
    {
      title: "The Featured Pick",
      description: "This month's high-potential stock."
    },
    {
      title: "The Elite List",
      description: "Our Top High Quality Stocks rankings."
    },
    {
      title: "The Vault",
      description: "Full access to the All-Picks archive."
    }
  ];

  return (
    <Reveal
      className={`relative mt-8 overflow-hidden rounded-2xl bg-gradient-to-br from-[#0f1729] via-[#1e293b] to-[#1e293b] text-white shadow-2xl ${
        compact ? "p-6 md:p-8" : "p-6 md:p-10"
      }`}
    >
      <div aria-hidden="true" className="pointer-events-none absolute -right-32 -top-32 h-72 w-72 rounded-full bg-[#ff4f00]/25 blur-3xl" />
      <div aria-hidden="true" className="pointer-events-none absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-[#06b6d4]/25 blur-3xl" />

      <div id="unlock" className="relative grid gap-8 lg:grid-cols-[1fr_420px] lg:items-center">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-black uppercase tracking-[0.18em] text-[#ffb29d] backdrop-blur-md">
            <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
            {copy.panelAccent}
          </span>
          <h2 className="mt-4 max-w-2xl bg-gradient-to-r from-white via-[#ffd4c2] to-[#ffb29d] bg-clip-text text-3xl font-black leading-tight text-transparent md:text-4xl">
            {copy.headline}
          </h2>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-[#e0f2fe]">
            {copy.description} Subscribe once for $1.99/month and unlock the complete StockyMonth suite.
          </p>

          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {planFeatures.map((item, index) => {
              const accents = ["from-orange-400 to-rose-400", "from-cyan-400 to-sky-500", "from-emerald-400 to-teal-500"];
              return (
                <div key={item.title} className="group relative overflow-hidden rounded-xl border border-white/15 bg-white/10 p-4 backdrop-blur-md transition hover:border-white/30 hover:bg-white/15">
                  <div className={`absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r ${accents[index]}`} />
                  <ShieldCheck className="mb-3 h-5 w-5 text-[#22c55e]" aria-hidden="true" />
                  <p className="text-sm font-black">{item.title}</p>
                  <p className="mt-2 text-xs font-semibold leading-relaxed text-[#e0f2fe]">{item.description}</p>
                </div>
              );
            })}
          </div>

          <WinningPicksShowcase />
        </div>

        <form action="/api/checkout" method="POST" className="relative overflow-hidden rounded-2xl bg-white p-6 text-[#0f172a] shadow-2xl">
          <div aria-hidden="true" className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[#ff4f00] via-orange-400 to-rose-400" />
          {currentUser?.email && <input name="userEmail" type="hidden" value={currentUser.email} />}
          <input name="lockedFeature" type="hidden" value={lockedFeature} />
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-500">{copy.eyebrow}</p>
              <div className="mt-3 flex items-end gap-2">
                <span className="bg-gradient-to-r from-[#0f172a] to-[#ff4f00] bg-clip-text text-5xl font-black text-transparent">$1.99</span>
                <span className="pb-2 text-base font-bold text-slate-500">/month</span>
              </div>
            </div>
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1 text-xs font-black text-emerald-700">
              <LiveDot />
              Active Buy
            </span>
          </div>

          <button
            type="submit"
            className="mt-6 inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#ff4f00] to-orange-500 px-6 text-sm font-black text-white shadow-lg shadow-orange-200 transition hover:shadow-xl"
          >
            <Sparkles className="h-4 w-4" aria-hidden="true" />
            Continue to payment
          </button>
        </form>
      </div>
    </Reveal>
  );
}

function WinningPicksShowcase() {
  return (
    <div className="mt-12">
      <h3 className="mb-6 text-lg font-black text-white">Recent Winning Picks</h3>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {authWinningPicks.map((pick) => (
          <div
            key={pick.ticker}
            className="group relative overflow-hidden rounded-xl border border-white/10 bg-white/[0.04] p-4 backdrop-blur-md transition hover:border-white/25 hover:bg-white/10"
          >
            <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-emerald-400 to-teal-400" />
            <div className="mb-3 flex items-center justify-between gap-3">
              <div className="flex min-w-0 items-center gap-2.5">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-white p-1.5 ring-1 ring-white/20">
                  <LogoImg
                    ticker={pick.ticker}
                    domain={pick.domain}
                    name={pick.name}
                    className="h-full w-full object-contain"
                    initialsClassName="text-[10px] font-black text-[#0f172a]"
                  />
                </span>
                <span className="truncate text-sm font-black text-white">{pick.name}</span>
              </div>
              <span className="shrink-0 rounded-full bg-white/10 px-2 py-0.5 text-[10px] font-black uppercase tracking-wide text-[#ffb29d]">
                {pick.ticker}
              </span>
            </div>
            <div className="mb-3 flex items-end gap-2">
              <span className="bg-gradient-to-r from-emerald-300 to-emerald-400 bg-clip-text text-2xl font-black text-transparent">
                {pick.return}
              </span>
              <span className="pb-1 text-xs font-bold text-emerald-300">return</span>
            </div>
            <div className="text-xs font-semibold text-[#cbd5e1]">Picked {pick.picked}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function SubscriptionSection({
  currentUser,
  hasPremiumAccess,
  lockedFeature
}: {
  currentUser: RegisteredUser | null;
  hasPremiumAccess: boolean;
  lockedFeature: LockedFeatureKey;
}) {
  const fullName = currentUser ? `${currentUser.firstName} ${currentUser.lastName}`.trim() : "";
  const copy = featureUnlockCopy[lockedFeature];

  return (
    <section className="bg-[#f8fafc] px-6 py-14">
      <div className="mx-auto max-w-5xl">
        <Reveal className="mb-8">
          <p className="text-sm font-black uppercase tracking-[0.18em] text-[#ff4f00]">
            {hasPremiumAccess ? "Subscription" : copy.eyebrow}
          </p>
          <h1 className="mt-3 text-3xl font-black text-[#0f172a] md:text-4xl">
            {hasPremiumAccess ? "Manage your StockyMonth plan" : copy.headline}
          </h1>
          <p className="mt-3 max-w-2xl text-base leading-relaxed text-slate-600">
            {hasPremiumAccess
              ? "View your current monthly access and use Stripe billing tools to update or cancel your subscription."
              : `${copy.description} Your $1.99/month plan also unlocks Stock of the Month, Top High Quality Stocks, and All Picks.`
            }
          </p>
        </Reveal>

        {!hasPremiumAccess && <PremiumUnlockPanel compact currentUser={currentUser} lockedFeature={lockedFeature} />}

        {hasPremiumAccess && currentUser && <Reveal className="grid gap-6 lg:grid-cols-[1fr_0.8fr]">
          <article className="rounded-md border border-slate-200 bg-white p-6 shadow-sm md:p-8">
            <div className="flex flex-col justify-between gap-6 border-b border-slate-200 pb-6 md:flex-row md:items-start">
              <div>
                <p className="text-sm font-black text-slate-500">Current plan</p>
                <h2 className="mt-2 text-3xl font-black text-[#0f172a]">StockyMonth Monthly</h2>
                <p className="mt-2 text-sm font-semibold text-slate-500">Signed in as {fullName || currentUser.email}</p>
              </div>
              <span className="inline-flex w-fit items-center gap-2 rounded-full bg-emerald-50 px-3 py-1.5 text-sm font-black text-emerald-700">
                <LiveDot />
                Active
              </span>
            </div>

            <div className="mt-7 flex items-end gap-2">
              <span className="text-5xl font-black text-[#0f172a]">$1.99</span>
              <span className="pb-2 text-base font-bold text-slate-500">/month</span>
            </div>

            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              <form action="/api/customer-portal" method="POST">
                <input name="userEmail" type="hidden" value={currentUser.email} />
                <button
                  type="submit"
                  className="inline-flex h-12 w-full items-center justify-center rounded-full bg-[#ff4f00] px-6 text-sm font-black text-white transition hover:bg-orange-600"
                >
                  Manage billing
                </button>
              </form>
              <form action="/api/subscription/cancel" method="POST">
                <input name="userEmail" type="hidden" value={currentUser.email} />
                <button
                  type="submit"
                  className="inline-flex h-12 w-full items-center justify-center rounded-full border border-rose-200 bg-white px-6 text-sm font-black text-rose-600 transition hover:bg-rose-50"
                >
                  Cancel subscription
                </button>
              </form>
            </div>
          </article>

          <aside className="rounded-md border border-slate-200 bg-white p-6 shadow-sm md:p-8">
            <h3 className="text-xl font-black text-[#0f172a]">Plan includes</h3>
            <div className="mt-5 grid gap-4">
              {["Stock of the Month", "Top High Quality Stocks", "All Picks archive"].map((item) => (
                <div key={item} className="flex items-center gap-3 text-sm font-bold text-slate-700">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-orange-50 text-[#ff4f00]">
                    <BadgeCheck className="h-4 w-4" aria-hidden="true" />
                  </span>
                  {item}
                </div>
              ))}
            </div>
            <p className="mt-6 text-sm leading-relaxed text-slate-500">
              The cancel button cancels the Stripe subscription and updates your StockyMonth access status in Redis.
            </p>
          </aside>
        </Reveal>}
      </div>
    </section>
  );
}

function PricingSection({
  monthlyPick,
  pricingTableId,
  publishableKey
}: {
  monthlyPick: MonthlyPick;
  pricingTableId: string;
  publishableKey: string;
}) {
  return (
    <section id="pricing" className="bg-[#0f1729] px-6 py-16 text-white">
      <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
        <div>
          <p className="text-lg font-black text-[#ffb29d]">Subscribe to StockyMonth</p>
          <h2 className="mt-3 text-3xl font-black">Get monthly picks for $1.99</h2>
          <p className="mt-4 max-w-2xl text-lg leading-8 text-[#e0f2fe]">
            Unlock {monthlyPick.ticker}, top quality ideas, detailed analysis, and pick history in one simple monthly plan.
          </p>
          <div className="mt-8 grid gap-4">
            {["Stock of the month", "Top High Quality Stocks", "Alpha Vantage chart analysis"].map((item) => (
              <div key={item} className="flex items-center gap-3 text-lg font-black">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#ff6b4a]">
                  <BadgeCheck className="h-5 w-5" aria-hidden="true" />
                </span>
                {item}
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-md bg-white p-6 text-[#0f172a] shadow-2xl md:p-10">
          {pricingTableId && publishableKey ? (
            <StripePricingTable pricingTableId={pricingTableId} publishableKey={publishableKey} />
          ) : (
            <form action="/api/checkout" method="POST" className="rounded-md border border-[#e2e8f0] bg-[#f8fafc] p-6">
              <p className="text-sm font-black uppercase tracking-[0.18em] text-[#64748b]">Monthly</p>
              <div className="mt-4 flex items-end gap-2">
                <span className="text-4xl font-black">$1.99</span>
                <span className="pb-2 text-lg font-bold text-[#475569]">/month</span>
              </div>
              <button className="mt-6 inline-flex h-14 w-full items-center justify-center rounded-full bg-[#ff6b4a] text-base font-black text-white transition hover:bg-[#f45d3c]">
                Subscribe now
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}

function AdminPanel({
  monthlyPick,
  qualityPicks,
  onResetMonthlyPick,
  onResetQualityPicks,
  onSaveMonthlyPick,
  onSaveQualityPicks
}: {
  monthlyPick: MonthlyPick;
  qualityPicks: QualityPick[];
  onResetMonthlyPick: () => void;
  onResetQualityPicks: () => void;
  onSaveMonthlyPick: (pick: MonthlyPick) => void;
  onSaveQualityPicks: (picks: QualityPick[]) => void;
}) {
  const [monthlyDraft, setMonthlyDraft] = useState(monthlyPick);
  const [qualityDrafts, setQualityDrafts] = useState(qualityPicks);

  useEffect(() => {
    setMonthlyDraft(monthlyPick);
  }, [monthlyPick]);

  useEffect(() => {
    setQualityDrafts(qualityPicks);
  }, [qualityPicks]);

  function updateMonthlyField(field: keyof MonthlyPick, value: string) {
    setMonthlyDraft((current) => ({ ...current, [field]: value }));
  }

  function updateQualityField(index: number, field: keyof QualityPick, value: string) {
    setQualityDrafts((current) => current.map((pick, pickIndex) => (pickIndex === index ? { ...pick, [field]: value } : pick)));
  }

  return (
    <section id="admin" className="bg-[#f8fafc] px-6 py-16">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8">
          <p className="text-sm font-black uppercase tracking-[0.18em] text-[#ff6b4a]">Admin</p>
          <h2 className="mt-3 text-3xl font-black text-[#0f172a]">Manage monthly and quality picks</h2>
        </div>

        <div className="grid gap-6 lg:grid-cols-[0.85fr_1.15fr]">
          <div className="rounded-md border border-[#e2e8f0] bg-white p-6 shadow-sm">
            <div className="mb-5 flex items-center gap-3">
              <Edit3 className="h-5 w-5 text-[#ff6b4a]" aria-hidden="true" />
              <h3 className="text-2xl font-black text-[#0f172a]">Add one stock per month</h3>
            </div>
            <div className="grid gap-4">
              <TextInput label="Ticker" value={monthlyDraft.ticker} onChange={(value) => updateMonthlyField("ticker", value.toUpperCase())} />
              <TextInput label="Company" value={monthlyDraft.name} onChange={(value) => updateMonthlyField("name", value)} />
              <TextInput label="Month" value={monthlyDraft.month} onChange={(value) => updateMonthlyField("month", value)} />
              <TextInput label="Price" value={monthlyDraft.price} onChange={(value) => updateMonthlyField("price", value)} />
              <TextInput label="Change" value={monthlyDraft.change} onChange={(value) => updateMonthlyField("change", value)} />
              <TextArea label="Investment thesis" value={monthlyDraft.thesis} onChange={(value) => updateMonthlyField("thesis", value)} />
            </div>
            <div className="mt-6 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => onSaveMonthlyPick(monthlyDraft)}
                className="inline-flex h-11 items-center gap-2 rounded-full bg-[#ff6b4a] px-5 text-sm font-black text-white"
              >
                <Save className="h-4 w-4" aria-hidden="true" />
                Save monthly pick
              </button>
              <button
                type="button"
                onClick={onResetMonthlyPick}
                className="inline-flex h-11 items-center gap-2 rounded-full border border-[#e2e8f0] px-5 text-sm font-black text-[#0f172a]"
              >
                <RefreshCcw className="h-4 w-4" aria-hidden="true" />
                Reset
              </button>
            </div>
          </div>

          <div className="rounded-md border border-[#e2e8f0] bg-white p-6 shadow-sm">
            <div className="mb-5 flex items-center gap-3">
              <BadgeCheck className="h-5 w-5 text-[#ff6b4a]" aria-hidden="true" />
              <h3 className="text-2xl font-black text-[#0f172a]">Add or modify top 6 stocks</h3>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              {qualityDrafts.map((pick, index) => (
                <div key={`${pick.ticker}-${index}`} className="rounded-md border border-[#e2e8f0] bg-[#f8fafc] p-4">
                  <p className="mb-3 text-xs font-black uppercase tracking-wide text-[#ff6b4a]">Quality pick {index + 1}</p>
                  <div className="grid gap-3">
                    <TextInput compact label="Ticker" value={pick.ticker} onChange={(value) => updateQualityField(index, "ticker", value.toUpperCase())} />
                    <TextInput compact label="Name" value={pick.name} onChange={(value) => updateQualityField(index, "name", value)} />
                    <TextInput compact label="Price" value={pick.price} onChange={(value) => updateQualityField(index, "price", value)} />
                    <TextInput compact label="Change" value={pick.change} onChange={(value) => updateQualityField(index, "change", value)} />
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => onSaveQualityPicks(qualityDrafts)}
                className="inline-flex h-11 items-center gap-2 rounded-full bg-[#ff6b4a] px-5 text-sm font-black text-white"
              >
                <Save className="h-4 w-4" aria-hidden="true" />
                Save top 6
              </button>
              <button
                type="button"
                onClick={onResetQualityPicks}
                className="inline-flex h-11 items-center gap-2 rounded-full border border-[#e2e8f0] px-5 text-sm font-black text-[#0f172a]"
              >
                <RefreshCcw className="h-4 w-4" aria-hidden="true" />
                Reset
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function TextInput({
  compact = false,
  label,
  onChange,
  value
}: {
  compact?: boolean;
  label: string;
  onChange: (value: string) => void;
  value: string;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-black uppercase tracking-wide text-[#64748b]">{label}</span>
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className={`${compact ? "h-10" : "h-12"} w-full rounded-md border border-[#e2e8f0] bg-white px-3 text-sm font-bold text-[#0f172a] outline-none transition focus:border-[#ff6b4a]`}
      />
    </label>
  );
}

function TextArea({
  label,
  onChange,
  value
}: {
  label: string;
  onChange: (value: string) => void;
  value: string;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-black uppercase tracking-wide text-[#64748b]">{label}</span>
      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        rows={4}
        className="w-full rounded-md border border-[#e2e8f0] bg-white px-3 py-3 text-sm font-bold leading-6 text-[#0f172a] outline-none transition focus:border-[#ff6b4a]"
      />
    </label>
  );
}

function MiniStat({
  label,
  positive,
  value
}: {
  label: string;
  positive?: boolean;
  value: string;
}) {
  return (
    <div className="rounded-md border border-[#e2e8f0] bg-white p-4">
      <p className="text-xs font-black uppercase tracking-wide text-[#64748b]">{label}</p>
      <p className={`mt-1 text-xl font-black ${positive === undefined ? "text-[#0f172a]" : positive ? "text-emerald-700" : "text-rose-600"}`}>
        {value}
      </p>
    </div>
  );
}

type LogoStage = "local-png" | "local-svg" | "local-ico" | "clearbit" | "initials";

const nextStage: Record<LogoStage, LogoStage> = {
  "local-png": "local-svg",
  "local-svg": "local-ico",
  "local-ico": "clearbit",
  clearbit:    "initials",
  initials:    "initials"
};

function LogoImg({
  ticker,
  domain,
  name,
  className,
  initialsClassName
}: {
  ticker: string;
  domain: string;
  name: string;
  className: string;
  initialsClassName: string;
}) {
  // `/logos/<ticker>.png` → .svg → .ico → clearbit → text initials.
  const [stage, setStage] = useState<LogoStage>("local-png");
  const tickerLower = ticker.toLowerCase();

  if (stage === "initials") {
    return <span className={initialsClassName}>{ticker.slice(0, 2)}</span>;
  }

  const src =
    stage === "local-png"
      ? `/logos/${tickerLower}.png`
      : stage === "local-svg"
        ? `/logos/${tickerLower}.svg`
        : stage === "local-ico"
          ? `/logos/${tickerLower}.ico`
          : `https://logo.clearbit.com/${domain}`;

  return (
    <img
      key={stage}
      src={src}
      alt={`${name} logo`}
      className={className}
      loading="lazy"
      onError={() => setStage((s) => nextStage[s])}
    />
  );
}

function CompanyLogo({ pick }: { pick: QualityPick }) {
  return (
    <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-full border border-slate-700 bg-white p-2">
      <LogoImg
        ticker={pick.ticker}
        domain={pick.domain}
        name={pick.name}
        className="h-full w-full object-contain"
        initialsClassName="text-sm font-black text-[#0f172a]"
      />
    </div>
  );
}

function ArchiveLogo({ pick }: { pick: ArchivePick }) {
  return (
    <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full border border-slate-200 bg-white p-2 shadow-sm">
      <LogoImg
        ticker={pick.ticker}
        domain={pick.domain}
        name={pick.name}
        className="h-full w-full object-contain"
        initialsClassName="text-xs font-black text-[#0f172a]"
      />
    </div>
  );
}

function LiveDot({ dark = false }: { dark?: boolean }) {
  return (
    <span className={`relative flex h-2.5 w-2.5 ${dark ? "text-[#0f172a]" : "text-[#22c55e]"}`}>
      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-current opacity-60" />
      <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-current" />
    </span>
  );
}

function Footer() {
  return (
    <footer className="relative overflow-hidden border-t border-slate-200 bg-gradient-to-b from-white to-slate-50 px-6 py-10">
      <div aria-hidden="true" className="pointer-events-none absolute -top-16 left-1/2 h-32 w-[60%] -translate-x-1/2 rounded-full bg-orange-200/25 blur-3xl" />
      <div className="relative mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 text-center md:flex-row md:text-left">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-md bg-gradient-to-br from-[#ff8a3d] to-[#ff4f00] text-white shadow-md">
            <BarChart3 className="h-5 w-5" aria-hidden="true" />
          </div>
          <div>
            <p className="text-sm font-black tracking-tight text-[#0f172a]">StockyMonth</p>
            <p className="text-[11px] font-bold text-slate-500">High-conviction monthly research</p>
          </div>
        </div>
        <p className="max-w-xl text-xs font-semibold leading-relaxed text-slate-500">
          © 2026 Easecase, Inc. All rights reserved. AI-assisted and human-reviewed financial research.
        </p>
      </div>
    </footer>
  );
}

function Reveal({
  as = "div",
  children,
  className = "",
  delay = 0
}: {
  as?: "article" | "div";
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  const ref = useRef<HTMLElement | null>(null);
  const [visible, setVisible] = useState(false);
  const Component = as;

  useEffect(() => {
    const node = ref.current;
    if (!node) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.14 }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <Component
      ref={ref as never}
      className={`${className} transform transition-all duration-700 ease-out ${visible ? "translate-y-0 opacity-100" : "translate-y-5 opacity-0"}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </Component>
  );
}

function readStoredValue<T>(key: string): T | null {
  try {
    const rawValue = window.localStorage.getItem(key);
    return rawValue ? (JSON.parse(rawValue) as T) : null;
  } catch {
    return null;
  }
}

function getRegisteredUsers() {
  return readStoredValue<RegisteredUser[]>(authUsersStorageKey) ?? [];
}

function upsertRegisteredUser(user: RegisteredUser) {
  const users = getRegisteredUsers();
  const nextUsers = users.some((candidate) => candidate.email === user.email)
    ? users.map((candidate) => (candidate.email === user.email ? { ...candidate, ...user } : candidate))
    : [...users, user];

  window.localStorage.setItem(authUsersStorageKey, JSON.stringify(nextUsers));
}

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

async function loginPersistentUser(email: string, passwordHash: string) {
  try {
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ email, passwordHash })
    });

    if (response.status === 503) {
      return { status: "fallback" as const };
    }

    if (response.status === 401) {
      return { status: "invalid" as const };
    }

    if (response.status === 404) {
      return { status: "not_found" as const };
    }

    if (!response.ok) {
      return { status: "error" as const };
    }

    const payload = (await response.json()) as { user?: RegisteredUser };
    return payload.user ? { status: "ok" as const, user: payload.user } : { status: "error" as const };
  } catch {
    return { status: "fallback" as const };
  }
}

async function registerPersistentUser(user: RegisteredUser) {
  try {
    const response = await fetch("/api/auth/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(user)
    });

    if (response.status === 503) {
      return { status: "fallback" as const };
    }

    if (response.status === 409) {
      return { status: "already_registered" as const };
    }

    if (!response.ok) {
      return { status: "error" as const };
    }

    return { status: "saved" as const };
  } catch {
    return { status: "fallback" as const };
  }
}

async function syncGooglePersistentUser(user: RegisteredUser) {
  try {
    const response = await fetch("/api/auth/google", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(user)
    });

    if (response.status === 503 || !response.ok) {
      return null;
    }

    const payload = (await response.json()) as { user?: RegisteredUser };
    return payload.user ? { ...payload.user, passwordHash: user.passwordHash } : null;
  } catch {
    return null;
  }
}

function getGoogleAccountOptions(
  mode: "login" | "signup" | "forgot",
  loginEmail: string,
  signupEmail: string,
  firstName: string,
  lastName: string
) {
  const email = normalizeEmail(mode === "signup" ? signupEmail : loginEmail);
  const typedAccount =
    email && email.includes("@")
      ? [
          {
            email,
            firstName: firstName.trim() || email.split("@")[0],
            lastName: lastName.trim() || "Google"
          }
        ]
      : [];
  const merged = [...typedAccount, ...googleAccountOptions];
  const seen = new Set<string>();

  return merged.filter((account) => {
    if (seen.has(account.email)) {
      return false;
    }
    seen.add(account.email);
    return true;
  });
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

function getUserInitials(user: RegisteredUser) {
  const firstInitial = user.firstName.trim().charAt(0);
  const lastInitial = user.lastName.trim().charAt(0);
  return `${firstInitial}${lastInitial}`.toUpperCase() || "SM";
}
