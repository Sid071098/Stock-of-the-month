"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import type React from "react";
import { useEffect, useRef, useState } from "react";
import {
  BadgeCheck,
  BarChart3,
  BriefcaseBusiness,
  ChevronDown,
  CircleDollarSign,
  CircleGauge,
  Database,
  Edit3,
  KeyRound,
  LineChart,
  LogOut,
  LogIn,
  Mail,
  RefreshCcw,
  Save,
  Sparkles,
  Star,
  TrendingUp,
  X,
  UserPlus,
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
  { name: "FTAI Aviation", return: "187%", ticker: "FTAI", picked: "July 2024" },
  { name: "Cloudflare", return: "160%", ticker: "NET", picked: "September 2024" },
  { name: "Howmet", return: "120%", ticker: "HWM", picked: "January 2025" },
  { name: "CrowdStrike", return: "96%", ticker: "CRWD", picked: "August 2024" },
  { name: "Wabtec", return: "52%", ticker: "WAB", picked: "June 2024" }
];

const googleAccountOptions = [
  { email: "demo.investor@gmail.com", firstName: "Demo", lastName: "Investor" },
  { email: "research.viewer@gmail.com", firstName: "Research", lastName: "Viewer" }
];

type StockExperienceProps = {
  archivePicks: ArchivePick[];
  defaultMonthlyPick: MonthlyPick;
  defaultQualityPicks: QualityPick[];
  pricingTableId: string;
  publishableKey: string;
  showAdmin?: boolean;
  showPricing?: boolean;
  view?: StockExperienceView;
};

type StockExperienceView = "monthly" | "quality" | "all-picks" | "subscription";

export default function StockExperience({
  archivePicks,
  defaultMonthlyPick,
  defaultQualityPicks,
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
      // Check subscription status for this specific user
      const userSubscriptionKey = getSubscriptionStorageKey(savedUser.email);
      const savedSubscription = window.localStorage.getItem(userSubscriptionKey);
      setHasPremiumAccess(savedSubscription === "true");
      
      // Also check with API if local storage doesn't have subscription
      if (savedSubscription !== "true") {
        void fetch(`/api/subscription/status?email=${encodeURIComponent(savedUser.email)}`, { cache: "no-store" })
          .then((response) => response.json())
          .then((payload: { active?: boolean }) => {
            if (payload.active) {
              setHasPremiumAccess(true);
              window.localStorage.setItem(userSubscriptionKey, "true");
            }
          })
          .catch(() => undefined);
      }
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
      return;
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
        router.push("/subscription");
      })
      .catch(() => {
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

  return (
    <main className="min-h-screen bg-[#f8fafc] text-[#0f172a]">
      <TopNav currentUser={currentUser} currentView={view} hasPremiumAccess={canAccessPremiumFeatures} onSignOut={signOut} />
      {shouldShowSubscriptionFirst && (
        <SubscriptionSection currentUser={currentUser} hasPremiumAccess={canAccessPremiumFeatures} />
      )}
      {!shouldShowSubscriptionFirst && view === "monthly" && (
        canAccessPremiumFeatures ? (
          <MonthlyPickSection hasPremiumAccess={canAccessPremiumFeatures} monthlyPick={monthlyPick} />
        ) : (
          <PremiumGate title="Stock of the Month" />
        )
      )}
      {!shouldShowSubscriptionFirst && view === "quality" && (
        canAccessPremiumFeatures ? <QualityPicksSection picks={qualityPicks} /> : <PremiumGate title="Top 6 High Quality Stocks" />
      )}
      {!shouldShowSubscriptionFirst && view === "all-picks" && (
        canAccessPremiumFeatures ? <AllPicksSection picks={archivePicks} /> : <PremiumGate title="All Picks" />
      )}
      {!shouldShowSubscriptionFirst && view === "subscription" && (
        <SubscriptionSection currentUser={currentUser} hasPremiumAccess={canAccessPremiumFeatures} />
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
  const [authPanelOpen, setAuthPanelOpen] = useState(false);
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

  function openAuthPanel(nextMode: "login" | "signup" | "forgot") {
    setMode(nextMode);
    setAuthPanelOpen(true);
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
    setAuthPanelOpen(false);
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

  function handleForgotPassword(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const email = normalizeEmail(forgotEmail);
    const user = getRegisteredUsers().find((candidate) => candidate.email === email);

    if (!user) {
      showNotice({ message: "No account exists for that email address.", type: "error" });
      return;
    }

    showNotice({
      message: "Password reset instructions are ready. Connect an email provider to send the reset link.",
      type: "success"
    });
    setMode("login");
    setLoginEmail(email);
  }

  return (
    <main className="min-h-screen bg-white text-[#0f172a]">
      {notice && (
        <div
          className={`fixed right-5 top-5 z-[70] max-w-sm rounded-md border p-4 text-sm font-bold shadow-2xl ${
            notice.type === "error"
              ? "border-rose-200 bg-rose-50 text-rose-700"
              : notice.type === "success"
                ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                : "border-orange-200 bg-orange-50 text-[#ff4f00]"
          }`}
          role="status"
        >
          {notice.message}
        </div>
      )}

      <header className="border-b border-slate-100 bg-white px-6 py-5">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-5">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-md bg-[#ff4f00] text-white">
              <BarChart3 className="h-7 w-7" aria-hidden="true" />
            </div>
            <span className="text-2xl font-black tracking-tight text-[#0f172a]">StockyMonth</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => openAuthPanel("login")}
              className="h-12 rounded-full border border-[#0f172a] bg-white px-6 text-sm font-black uppercase tracking-wide text-[#0f172a] transition hover:bg-[#fff1ea]"
            >
              Log in
            </button>
            <button
              type="button"
              onClick={() => openAuthPanel("signup")}
              className="h-12 rounded-full bg-[#210947] px-7 text-sm font-black uppercase tracking-wide text-white shadow-sm transition hover:bg-[#310a68]"
            >
              Get started
            </button>
          </div>
        </div>
      </header>

      <section className="px-6 py-12 md:py-16">
        <div className="mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-[0.88fr_1.12fr]">
          <div>
            <h1 className="max-w-xl text-4xl font-black leading-[1.08] tracking-tight text-[#0f172a] md:text-5xl">
              Get Investing Superpowers With StockyMonth
            </h1>
            <p className="mt-7 max-w-2xl text-lg font-semibold leading-8 text-[#3f2d64]">
              StockyMonth helps you find buy-and-hold stocks with the potential to multiply your net worth. AI-powered,
              research-backed, and built for monthly conviction.
            </p>
            <button
              type="button"
              onClick={() => openAuthPanel("signup")}
              className="mt-8 inline-flex h-14 w-full max-w-sm items-center justify-center rounded-full bg-[#210947] px-8 text-sm font-black uppercase tracking-wide text-white transition hover:bg-[#310a68]"
            >
              Get started, it&apos;s free
            </button>

            <div className="mt-7 flex flex-wrap items-center gap-3 text-emerald-700">
              <div className="flex items-center gap-1">
                {Array.from({ length: 5 }).map((_, index) => (
                  <Star key={index} className="h-5 w-5 fill-current" aria-hidden="true" />
                ))}
              </div>
              <p className="text-base font-black">Trusted by 700,000+ investors</p>
            </div>
          </div>

          <InvestorHeroIllustration />
        </div>
      </section>

      <section className="bg-[#f8fafc] px-6 py-14 text-[#0f172a]">
        <div className="mx-auto max-w-7xl">
          <h2 className="text-center text-3xl font-black tracking-tight md:text-4xl">Recent Winning Picks</h2>
          <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-5">
            {authWinningPicks.map((pick) => (
              <AuthWinningPickCard key={pick.ticker} pick={pick} />
            ))}
          </div>
        </div>
      </section>

      {authPanelOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#210947]/40 px-4 py-8 backdrop-blur-sm">
          <section className="max-h-[92vh] w-full max-w-xl overflow-y-auto rounded-md border border-slate-200 bg-white p-6 text-[#0f172a] shadow-2xl md:p-8">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-black uppercase tracking-[0.18em] text-[#ff4f00]">StockyMonth Access</p>
                <h2 className="mt-2 text-2xl font-black text-[#0f172a]">
                  {mode === "login" ? "Welcome back" : mode === "signup" ? "Create your account" : "Recover your password"}
                </h2>
              </div>
              <button
                type="button"
                aria-label="Close authentication panel"
                onClick={() => setAuthPanelOpen(false)}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 text-slate-500 transition hover:bg-slate-50 hover:text-[#0f172a]"
              >
                <X className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>

            <div className="mt-6 inline-flex rounded-full border border-slate-200 bg-slate-50 p-1">
              <button
                type="button"
                onClick={() => setMode("login")}
                className={`inline-flex items-center gap-2 rounded-full px-5 py-2 text-sm font-black transition ${
                  mode === "login" ? "bg-[#ff4f00] text-white shadow-sm" : "text-slate-600 hover:text-[#0f172a]"
                }`}
              >
                <LogIn className="h-4 w-4" aria-hidden="true" />
                Login
              </button>
              <button
                type="button"
                onClick={() => setMode("signup")}
                className={`inline-flex items-center gap-2 rounded-full px-5 py-2 text-sm font-black transition ${
                  mode === "signup" ? "bg-[#ff4f00] text-white shadow-sm" : "text-slate-600 hover:text-[#0f172a]"
                }`}
              >
                <UserPlus className="h-4 w-4" aria-hidden="true" />
                Sign up
              </button>
            </div>

            {mode === "login" && (
              <form className="mt-6" onSubmit={handleLogin}>
                <AuthMethodOptions onGoogle={() => setGoogleChooserOpen(true)} />
                <p className="text-sm leading-relaxed text-slate-600">
                  Enter your email and password.
                </p>

                <div className="mt-6 grid gap-4">
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
                    onClick={() => setMode("forgot")}
                    className="text-sm font-black text-[#ff4f00] hover:text-orange-700"
                  >
                    Forgot password?
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="mt-6 inline-flex h-12 w-full items-center justify-center rounded-full bg-[#210947] px-6 text-sm font-black uppercase tracking-wide text-white transition hover:bg-[#310a68] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isSubmitting ? "Checking account..." : "Login"}
                </button>
              </form>
            )}

            {mode === "signup" && (
              <form className="mt-6" onSubmit={handleSignup}>
                <AuthMethodOptions onGoogle={() => setGoogleChooserOpen(true)} />
                <p className="text-sm leading-relaxed text-slate-600">
                  Sign up with your first name, last name, and email address.
                </p>

                <div className="mt-6 grid gap-4 sm:grid-cols-2">
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
                  className="mt-6 inline-flex h-12 w-full items-center justify-center rounded-full bg-[#210947] px-6 text-sm font-black uppercase tracking-wide text-white transition hover:bg-[#310a68] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isSubmitting ? "Creating account..." : "Get started"}
                </button>
              </form>
            )}

            {mode === "forgot" && (
              <form className="mt-6" onSubmit={handleForgotPassword}>
                <p className="text-sm leading-relaxed text-slate-600">
                  Enter your registered email address and StockyMonth will prepare the reset flow.
                </p>

                <div className="mt-6">
                  <AuthInput
                    autoComplete="email"
                    icon={<Mail className="h-5 w-5" aria-hidden="true" />}
                    label="Registered email"
                    onChange={setForgotEmail}
                    placeholder="you@example.com"
                    type="email"
                    value={forgotEmail}
                  />
                </div>

                <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                  <button
                    type="submit"
                    className="inline-flex h-12 flex-1 items-center justify-center rounded-full bg-[#210947] px-6 text-sm font-black uppercase tracking-wide text-white transition hover:bg-[#310a68]"
                  >
                    Send reset instructions
                  </button>
                  <button
                    type="button"
                    onClick={() => setMode("login")}
                    className="inline-flex h-12 flex-1 items-center justify-center rounded-full border border-slate-200 bg-white px-6 text-sm font-black text-slate-700 transition hover:bg-slate-50"
                  >
                    Back to login
                  </button>
                </div>
              </form>
            )}
          </section>
        </div>
      )}

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

function AuthMethodOptions({ onGoogle }: { onGoogle: () => void }) {
  return (
    <div className="mb-6 grid gap-3 sm:grid-cols-2">
      <div className="flex h-12 items-center justify-center gap-2 rounded-full border border-orange-200 bg-orange-50 px-4 text-sm font-black text-[#ff4f00]">
        <Mail className="h-4 w-4" aria-hidden="true" />
        Continue with email
      </div>
      <button
        type="button"
        onClick={onGoogle}
        className="flex h-12 items-center justify-center gap-3 rounded-full border border-slate-200 bg-white px-4 text-sm font-black text-[#0f172a] shadow-sm transition hover:border-orange-200 hover:bg-[#fff7ed]"
      >
        <span className="flex h-6 w-6 items-center justify-center rounded-full border border-slate-200 bg-white text-sm font-black text-[#4285f4]">
          G
        </span>
        Continue with Google
      </button>
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
      <div className="absolute right-24 top-2 h-48 w-52 rotate-[-14deg] rounded-[48px] bg-[#ef0068]" />
      <div className="absolute right-28 top-24 h-44 w-44 rounded-[40px] bg-gradient-to-br from-[#ff8a3d] to-[#ef0068]" />
      <div className="absolute right-40 top-36 text-[96px] font-black leading-none text-white">$</div>
      <div className="absolute right-44 top-14 h-20 w-24 rounded-b-[46px] rounded-t-[24px] bg-[#090421]" />
      <div className="absolute right-56 top-16 h-10 w-10 rounded-full bg-[#d8dcf5]" />
      <div className="absolute right-[100px] top-16 h-10 w-10 rounded-full bg-[#d8dcf5]" />

      <div className="absolute bottom-4 right-28 h-28 w-64 rotate-6 rounded-md bg-[#cbd3ee] shadow-xl">
        <div className="mx-auto mt-4 h-16 w-48 rounded bg-white p-3">
          <div className="flex h-full items-end gap-2">
            {[42, 64, 35, 72, 58, 88].map((height, index) => (
              <span key={`${height}-${index}`} className="flex-1 rounded-t bg-[#210947]" style={{ height: `${height}%` }} />
            ))}
          </div>
        </div>
      </div>

      <div className="absolute bottom-12 right-0 h-20 w-28 rotate-[-20deg] rounded-tl-[48px] bg-[#ef0068]" />
      <div className="absolute right-14 top-0 h-20 w-10 rotate-[24deg] border-2 border-[#090421]" />
      <div className="absolute bottom-14 left-24 h-8 w-16 rotate-[-12deg] rounded-md bg-[#ff6b4a]" />
      <div className="absolute bottom-20 right-24 h-8 w-16 rotate-[15deg] rounded-md bg-[#ff6b4a]" />
      <TrendingUp className="absolute bottom-12 right-4 h-32 w-32 text-[#ef0068]" strokeWidth={5} />
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
          <p className="mt-1 text-sm font-bold leading-5 text-[#6c5d7f]">Picked: {pick.picked}</p>
          <p className="text-sm font-bold leading-5 text-[#6c5d7f]">Returns as of: December 2025</p>
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

function TopNav({
  currentView,
  currentUser,
  hasPremiumAccess,
  onSignOut
}: {
  currentView: StockExperienceView;
  currentUser: RegisteredUser;
  hasPremiumAccess: boolean;
  onSignOut: () => void;
}) {
  const monthlyHref = hasPremiumAccess ? "/stock-of-the-month" : "/subscription";
  const qualityHref = hasPremiumAccess ? "/top-quality-stocks" : "/subscription";
  const allPicksHref = hasPremiumAccess ? "/all-picks" : "/subscription";

  return (
    <nav className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 shadow-sm backdrop-blur">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6">
        <Link href={monthlyHref} className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-md bg-[#ff4f00] text-white">
            <BarChart3 className="h-6 w-6" aria-hidden="true" />
          </div>
          <span className="text-xl font-black tracking-tight text-[#0f172a] md:text-2xl">StockyMonth</span>
        </Link>

        <div className="hidden items-center gap-2 md:flex">
          <Link
            href={monthlyHref}
            className={navLinkClass(currentView === "monthly")}
          >
            Stock of the Month
          </Link>
          <Link
            href={qualityHref}
            className={navLinkClass(currentView === "quality")}
          >
            Top 6 High Quality Stocks
          </Link>
          <Link
            href={allPicksHref}
            className={navLinkClass(currentView === "all-picks")}
          >
            All Picks
          </Link>
        </div>

        <ProfileMenu currentUser={currentUser} onSignOut={onSignOut} />
      </div>
    </nav>
  );
}

function navLinkClass(isActive: boolean) {
  return `rounded-full px-4 py-2.5 text-sm font-black transition ${
    isActive ? "bg-orange-50 text-[#ff4f00]" : "text-slate-700 hover:bg-slate-100"
  }`;
}

function ProfileMenu({ currentUser, onSignOut }: { currentUser: RegisteredUser; onSignOut: () => void }) {
  const [isOpen, setIsOpen] = useState(false);
  const fullName = `${currentUser.firstName} ${currentUser.lastName}`.trim();

  return (
    <div className="relative">
      <button
        type="button"
        aria-label="Profile"
        onClick={() => setIsOpen((current) => !current)}
        className="inline-flex h-10 items-center gap-2 rounded-full border border-slate-200 bg-white px-3 text-sm font-black text-slate-800 shadow-sm transition hover:bg-slate-50"
      >
        <UserCircle className="h-6 w-6" aria-hidden="true" />
        <span className="hidden sm:inline">Profile</span>
        <ChevronDown className="h-4 w-4" aria-hidden="true" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-3 w-80 rounded-md border border-[#efe7f7] bg-white p-4 text-[#0f172a] shadow-2xl">
          <div className="flex items-start gap-3 border-b border-[#efe7f7] pb-4">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#210947] text-sm font-black text-white">
              {getUserInitials(currentUser)}
            </div>
            <div>
              <p className="text-sm font-black">{fullName}</p>
              <p className="text-xs font-semibold text-[#6c5d7f]">{currentUser.email}</p>
            </div>
          </div>

          <div className="mt-4 grid gap-2">
            <button
              type="button"
              onClick={onSignOut}
              className="inline-flex items-center gap-2 rounded-md px-3 py-2 text-left text-sm font-bold text-[#6c5d7f] hover:bg-[#fff1ea]"
            >
              <LogOut className="h-4 w-4" aria-hidden="true" />
              Sign out
            </button>
          </div>
        </div>
      )}
    </div>
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

        <Reveal as="article" className="overflow-hidden rounded-md border border-slate-800 bg-[#0f172a] p-3 shadow-2xl md:p-4">
          <div className="grid gap-5 lg:grid-cols-[0.56fr_1fr] lg:items-stretch">
            <MonthlyPickArtwork monthlyPick={monthlyPick} />

            <div className="flex min-w-0 flex-col justify-start py-1">
              <div className="flex flex-wrap items-center gap-3">
                <EQTLogo />
                <span className="inline-flex items-center gap-2 rounded-full bg-[#22c55e] px-3 py-1.5 text-sm font-black text-[#0f172a]">
                  <LiveDot dark />
                  {monthlyPick.rating}
                </span>
              </div>

              <h3 className="mt-4 text-3xl font-black leading-tight text-white">
                {monthlyPick.name} ({monthlyPick.ticker})
              </h3>

              <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm font-black text-slate-400">
                <span className="inline-flex items-center gap-2">
                  <BriefcaseBusiness className="h-4 w-4 text-slate-500" aria-hidden="true" />
                  {monthlyPick.sector}
                </span>
                <span className="inline-flex items-center gap-2">
                  <Database className="h-4 w-4 text-slate-500" aria-hidden="true" />
                  {monthlyPick.price}{" "}
                  <span className={monthlyPick.change.startsWith("+") ? "text-emerald-700" : "text-[#df2d74]"}>
                    ({monthlyPick.change})
                  </span>
                </span>
              </div>

              <p className="mt-4 max-w-5xl text-sm font-medium leading-relaxed text-slate-300 md:text-base">{monthlyPick.summary}</p>

              <div className="mt-6">
                <div className="mb-4 flex items-center gap-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-800 text-[#22c55e]">
                    <CircleDollarSign className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <h4 className="text-sm font-black uppercase tracking-tight text-white md:text-base">
                    Why this is the best pick of the month
                  </h4>
                </div>

                <div className="grid gap-4">
                  {backingPoints.map((point, index) => (
                    <BackingPoint key={point.text} accent={index} icon={point.icon} text={point.text} />
                  ))}
                </div>
              </div>

              <Link
                href={`/analysis/${monthlyPick.ticker}`}
                className="mt-5 inline-flex h-10 w-fit items-center justify-center gap-2 rounded-full bg-[#ff4f00] px-5 text-sm font-black text-white transition hover:bg-orange-600"
              >
                Detailed analysis
                <LineChart className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>
          </div>
        </Reveal>
        <DetailedAnalysisSection monthlyPick={monthlyPick} />
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
                  Top 6
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
    <Reveal className="mt-8 rounded-md border border-slate-200 bg-white p-6 shadow-sm md:p-8">
      <div className="grid gap-6 lg:grid-cols-[0.85fr_1.15fr] lg:items-start">
        <div>
          <p className="text-sm font-black uppercase tracking-[0.18em] text-[#ff4f00]">Detailed analysis</p>
          <h2 className="mt-3 text-3xl font-black text-[#0f172a]">
            Why {monthlyPick.name} is the May 2026 pick
          </h2>
          <p className="mt-4 text-base leading-relaxed text-slate-600">
            A deeper look at the setup behind the monthly call: catalysts, cost structure, market positioning, and management alignment.
          </p>
          <Link
            href={`/analysis/${monthlyPick.ticker}`}
            className="mt-6 inline-flex h-11 items-center justify-center gap-2 rounded-full bg-[#ff4f00] px-5 text-sm font-black text-white transition hover:bg-orange-600"
          >
            Open full analysis
            <LineChart className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {analysisCards.map((card) => (
            <article key={card.title} className="rounded-md border border-slate-200 bg-[#f8fafc] p-5">
              <h3 className="text-lg font-black text-[#0f172a]">{card.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-slate-600">{card.text}</p>
            </article>
          ))}
        </div>
      </div>
    </Reveal>
  );
}

function AllPicksSection({ picks }: { picks: ArchivePick[] }) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  return (
    <section id="all-picks" className="scroll-mt-24 bg-[#f8fafc] px-6 py-14">
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

        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
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
                  className={`relative min-h-full cursor-pointer overflow-hidden rounded-md border bg-white p-6 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-orange-200 hover:bg-orange-50/40 hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-orange-100 ${
                    activeIndex === index ? "border-[#ff4f00] bg-orange-50 shadow-xl ring-2 ring-orange-100" : "border-slate-200"
                  }`}
                >
                  <div className="mb-5 flex items-start justify-between gap-4">
                    <div className="flex gap-3">
                      <ArchiveLogo pick={pick} />
                      <div>
                        <p className="text-sm font-black text-[#ff4f00]">{pick.month}</p>
                        <h3 className="mt-1 text-lg font-black leading-snug text-[#0f172a]">
                          {pick.name} ({pick.ticker})
                        </h3>
                      </div>
                    </div>
                    <span className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-black uppercase tracking-wide text-emerald-700">
                      <LiveDot />
                      {activeIndex === index ? "Selected" : "Active Buy"}
                    </span>
                  </div>

                  <div className="mb-5 flex items-end justify-between border-y border-slate-200 py-4">
                    <p className="text-2xl font-black text-[#0f172a]">{pick.price}</p>
                    <p className={`text-sm font-black ${pick.change.startsWith("+") ? "text-emerald-700" : "text-rose-600"}`}>
                      {pick.change}
                    </p>
                  </div>

                  <p className="text-sm leading-relaxed text-slate-600">{pick.summary}</p>
                  <div className="mt-5 grid gap-3">
                    {pick.bullets.map((bullet) => (
                      <p key={bullet} className="flex gap-3 text-sm leading-relaxed text-slate-700">
                        <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#ff4f00]" />
                        {bullet}
                      </p>
                    ))}
                  </div>
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
  return (
    <div className="relative h-full min-h-[430px] overflow-hidden rounded-md bg-[#d6e9e7] p-4 sm:p-5 lg:min-h-[0]">
      <div className="absolute -left-20 -top-20 h-44 w-44 rounded-full bg-[#207d72]" />
      <div className="absolute left-20 -top-24 h-52 w-52 rounded-full bg-[#88beb8]" />
      <div className="absolute -left-16 top-24 h-32 w-32 rounded-[42px] bg-[#bce3df]" />
      <div className="absolute right-24 top-0 h-20 w-60 bg-[#bde2df]" />
      <div className="absolute right-12 top-0 h-20 w-24 skew-x-[-24deg] bg-[#7db4ae]" />
      <div className="absolute -right-10 top-8 h-24 w-24 rotate-45 rounded-[42px] bg-[#207d72]" />
      <div className="absolute -bottom-20 -left-10 h-44 w-44 rounded-full bg-[#207d72]" />
      <div className="absolute bottom-0 right-0 h-0 w-0 border-b-[120px] border-l-[120px] border-b-[#207d72] border-l-transparent" />
      <div className="absolute bottom-0 right-20 h-0 w-0 border-b-[96px] border-l-[96px] border-b-[#88beb8] border-l-transparent" />

      <div className="relative z-10 flex flex-col">
        <div className="flex items-center justify-start gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white/75 text-[#0f172a] shadow-sm">
            <BadgeCheck className="h-6 w-6" aria-hidden="true" />
          </span>
          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-[#207d72]">Dynamic LLM Brief</p>
            <h3 className="mt-1 text-2xl font-black text-[#0f172a]">{monthlyPick.month} Pick</h3>
          </div>
        </div>

        <div className="relative mt-5 rounded-md bg-white/95 p-4 shadow-sm md:p-5">
          <div className="mb-3 flex items-center justify-between gap-3">
            <p className="text-sm font-black text-[#0f172a]">Exclusive Analysis for Subscribers</p>
          </div>
          <ul className="grid gap-2.5">
            {(monthlyPick.summaryBullets?.length ? monthlyPick.summaryBullets : [monthlyPick.thesis]).slice(0, 4).map((item) => (
              <li key={item} className="flex gap-3 text-sm font-bold leading-snug text-[#0f172a]">
                <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-[#ff4f00]" />
                {item}
              </li>
            ))}
          </ul>
          <p className="mt-4 text-xs font-black uppercase tracking-[0.16em] text-[#207d72]">StockyMonth Research Committee</p>
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
  const colors = ["bg-[#fff1ea] text-[#ff6b4a]", "bg-[#ffe5dc] text-[#ff6b4a]", "bg-[#ffd8cc] text-[#ff6b4a]"];

  return (
    <div className="grid grid-cols-[36px_1fr] gap-3">
      <span className={`flex h-8 w-8 items-center justify-center rounded-md ${colors[accent]}`}>
        {icon}
      </span>
      <p className="text-sm font-medium leading-relaxed text-slate-200 md:text-base">{text}</p>
    </div>
  );
}

function QualityPicksSection({ picks }: { picks: QualityPick[] }) {
  return (
    <section id="quality-picks" className="scroll-mt-24 border-y border-slate-200 bg-white px-6 py-16">
      <div className="mx-auto max-w-7xl">
        <Reveal className="mb-8">
          <p className="text-sm font-black uppercase tracking-[0.18em] text-[#ff4f00]">Top 6 High Quality Stocks</p>
          <h2 className="mt-3 text-2xl font-black text-[#0f172a] md:text-3xl">Six focused companies for the current watchlist</h2>
        </Reveal>

        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {picks.map((pick, index) => (
            <Reveal key={pick.ticker} delay={index * 70}>
              <Link
                href={`/analysis/${pick.ticker}`}
                className="group block rounded-md border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-orange-200 hover:shadow-xl"
              >
                <div className="flex items-start justify-end">
                  <span className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[11px] font-black uppercase tracking-wide text-emerald-700">
                    <LiveDot />
                    {pick.tag}
                  </span>
                </div>
                <div className="mt-5 flex items-center gap-3">
                  <CompanyLogo pick={pick} />
                  <div className="min-w-0">
                    <h3 className="text-lg font-black text-[#0f172a] group-hover:text-[#ff4f00]">
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
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function PremiumGate({ title }: { title: string }) {
  return (
    <section className="bg-[#f8fafc] px-6 py-14">
      <div className="mx-auto max-w-6xl">
        <Reveal className="mb-8 rounded-md border border-orange-200 bg-white p-6 shadow-sm md:p-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="inline-flex items-center gap-2 text-sm font-black uppercase tracking-[0.18em] text-[#ff4f00]">
                <LockKeyhole className="h-4 w-4" aria-hidden="true" />
                Premium locked
              </p>
              <h1 className="mt-3 text-3xl font-black text-[#0f172a]">{title}</h1>
              <p className="mt-3 max-w-2xl text-base leading-relaxed text-slate-600">
                Subscribe once to unlock Stock of the Month, Top 6 High Quality Stocks, and the full All Picks archive.
              </p>
            </div>
            <Link
              href="/subscription"
              className="inline-flex h-12 items-center justify-center rounded-full bg-[#ff4f00] px-6 text-sm font-black text-white transition hover:bg-orange-600"
            >
              Unlock premium
            </Link>
          </div>
        </Reveal>
        <PremiumUnlockPanel compact />
      </div>
    </section>
  );
}

function PremiumUnlockPanel({
  compact = false,
  currentUser = null
}: {
  compact?: boolean;
  currentUser?: RegisteredUser | null;
}) {
  const planFeatures = [
    {
      title: "The Featured Pick",
      description: "This month's high-potential stock."
    },
    {
      title: "The Elite List",
      description: "Our Top 6 high-quality rankings."
    },
    {
      title: "The Vault",
      description: "Full access to the All-Picks archive."
    }
  ];

  return (
    <Reveal
      className={`mt-8 overflow-hidden rounded-md bg-[#22006c] text-white shadow-2xl ${
        compact ? "p-6 md:p-8" : "p-6 md:p-10"
      }`}
    >
      <div id="unlock" className="grid gap-8 lg:grid-cols-[1fr_420px] lg:items-center">
        <div>
          <p className="text-sm font-black uppercase tracking-[0.18em] text-[#ffb29d]">Unlock premium research</p>
          <h2 className="mt-4 max-w-2xl text-3xl font-black leading-tight text-white md:text-4xl">
            Unlock the Full StockyMonth Suite for Just $1.99
          </h2>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-[#e5d8f4]">
            Get instant access to our highest-conviction research and historical data in one simple monthly plan.
          </p>

          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {planFeatures.map((item) => (
              <div key={item.title} className="rounded-md bg-white/10 p-4 ring-1 ring-white/15">
                <ShieldCheck className="mb-3 h-5 w-5 text-[#22c55e]" aria-hidden="true" />
                <p className="text-sm font-black">{item.title}</p>
                <p className="mt-2 text-xs font-semibold leading-relaxed text-[#e5d8f4]">{item.description}</p>
              </div>
            ))}
          </div>

          <WinningPicksShowcase />
        </div>

        <form action="/api/checkout" method="POST" className="rounded-md bg-white p-6 text-[#0f172a] shadow-2xl">
          {currentUser?.email && <input name="userEmail" type="hidden" value={currentUser.email} />}
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-500">Monthly</p>
              <div className="mt-3 flex items-end gap-2">
                <span className="text-5xl font-black">$1.99</span>
                <span className="pb-2 text-base font-bold text-slate-500">/month</span>
              </div>
            </div>
            <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-black text-emerald-700">
              Active Buy
            </span>
          </div>

          <button
            type="submit"
            className="mt-6 inline-flex h-12 w-full items-center justify-center rounded-full bg-[#ff4f00] px-6 text-sm font-black text-white transition hover:bg-orange-600"
          >
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
      <h3 className="text-lg font-black text-white mb-6">Recent Winning Picks with Live Data</h3>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {authWinningPicks.map((pick) => (
          <div key={pick.ticker} className="rounded-md bg-white/5 p-4 ring-1 ring-white/10">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-black text-white">{pick.name}</span>
              <span className="text-xs font-bold text-[#ffb29d]">{pick.ticker}</span>
            </div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-lg font-black text-white">Fetch from API</span>
              <span className="text-sm font-bold text-slate-400">Live</span>
            </div>
            <div className="text-xs text-[#e5d8f4]">
              Picked: {pick.picked} • Return: {pick.return}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function SubscriptionSection({ currentUser, hasPremiumAccess }: { currentUser: RegisteredUser | null; hasPremiumAccess: boolean }) {
  const fullName = currentUser ? `${currentUser.firstName} ${currentUser.lastName}`.trim() : "";

  return (
    <section className="bg-[#f8fafc] px-6 py-14">
      <div className="mx-auto max-w-5xl">
        <Reveal className="mb-8">
          <p className="text-sm font-black uppercase tracking-[0.18em] text-[#ff4f00]">Subscription</p>
          <h1 className="mt-3 text-3xl font-black text-[#0f172a] md:text-4xl">
            {hasPremiumAccess ? "Manage your StockyMonth plan" : "Unlock Premium Features"}
          </h1>
          <p className="mt-3 max-w-2xl text-base leading-relaxed text-slate-600">
            {hasPremiumAccess
              ? "View your current monthly access and use Stripe billing tools to update or cancel your subscription."
              : "Subscribe to access all premium stock research, historical picks, and advanced analytics."
            }
          </p>
        </Reveal>

        {!hasPremiumAccess && <PremiumUnlockPanel compact currentUser={currentUser} />}

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
                <button
                  type="submit"
                  className="inline-flex h-12 w-full items-center justify-center rounded-full bg-[#ff4f00] px-6 text-sm font-black text-white transition hover:bg-orange-600"
                >
                  Manage billing
                </button>
              </form>
              <form action="/api/customer-portal" method="POST">
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
              {["Stock of the Month", "Top 6 High Quality Stocks", "All Picks archive"].map((item) => (
                <div key={item} className="flex items-center gap-3 text-sm font-bold text-slate-700">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-orange-50 text-[#ff4f00]">
                    <BadgeCheck className="h-4 w-4" aria-hidden="true" />
                  </span>
                  {item}
                </div>
              ))}
            </div>
            <p className="mt-6 text-sm leading-relaxed text-slate-500">
              The cancel button opens Stripe Billing Portal, where cancellation is handled securely by Stripe.
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
    <section id="pricing" className="bg-[#210947] px-6 py-16 text-white">
      <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
        <div>
          <p className="text-lg font-black text-[#ffb29d]">Subscribe to StockyMonth</p>
          <h2 className="mt-3 text-3xl font-black">Get monthly picks for $1.99</h2>
          <p className="mt-4 max-w-2xl text-lg leading-8 text-[#e5d8f4]">
            Unlock {monthlyPick.ticker}, top quality ideas, detailed analysis, and pick history in one simple monthly plan.
          </p>
          <div className="mt-8 grid gap-4">
            {["Stock of the month", "Top 6 quality stocks", "Alpha Vantage chart analysis"].map((item) => (
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
            <form action="/api/checkout" method="POST" className="rounded-md border border-[#efe7f7] bg-[#fffaf7] p-6">
              <p className="text-sm font-black uppercase tracking-[0.18em] text-[#8d7ca3]">Monthly</p>
              <div className="mt-4 flex items-end gap-2">
                <span className="text-4xl font-black">$1.99</span>
                <span className="pb-2 text-lg font-bold text-[#6c5d7f]">/month</span>
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
    <section id="admin" className="bg-[#fffaf7] px-6 py-16">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8">
          <p className="text-sm font-black uppercase tracking-[0.18em] text-[#ff6b4a]">Admin</p>
          <h2 className="mt-3 text-3xl font-black text-[#0f172a]">Manage monthly and quality picks</h2>
        </div>

        <div className="grid gap-6 lg:grid-cols-[0.85fr_1.15fr]">
          <div className="rounded-md border border-[#efe7f7] bg-white p-6 shadow-sm">
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
                className="inline-flex h-11 items-center gap-2 rounded-full border border-[#efe7f7] px-5 text-sm font-black text-[#0f172a]"
              >
                <RefreshCcw className="h-4 w-4" aria-hidden="true" />
                Reset
              </button>
            </div>
          </div>

          <div className="rounded-md border border-[#efe7f7] bg-white p-6 shadow-sm">
            <div className="mb-5 flex items-center gap-3">
              <BadgeCheck className="h-5 w-5 text-[#ff6b4a]" aria-hidden="true" />
              <h3 className="text-2xl font-black text-[#0f172a]">Add or modify top 6 stocks</h3>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              {qualityDrafts.map((pick, index) => (
                <div key={`${pick.ticker}-${index}`} className="rounded-md border border-[#efe7f7] bg-[#fffaf7] p-4">
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
                className="inline-flex h-11 items-center gap-2 rounded-full border border-[#efe7f7] px-5 text-sm font-black text-[#0f172a]"
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
      <span className="mb-2 block text-xs font-black uppercase tracking-wide text-[#8d7ca3]">{label}</span>
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className={`${compact ? "h-10" : "h-12"} w-full rounded-md border border-[#efe7f7] bg-white px-3 text-sm font-bold text-[#0f172a] outline-none transition focus:border-[#ff6b4a]`}
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
      <span className="mb-2 block text-xs font-black uppercase tracking-wide text-[#8d7ca3]">{label}</span>
      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        rows={4}
        className="w-full rounded-md border border-[#efe7f7] bg-white px-3 py-3 text-sm font-bold leading-6 text-[#0f172a] outline-none transition focus:border-[#ff6b4a]"
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
    <div className="rounded-md border border-[#efe7f7] bg-white p-4">
      <p className="text-xs font-black uppercase tracking-wide text-[#8d7ca3]">{label}</p>
      <p className={`mt-1 text-xl font-black ${positive === undefined ? "text-[#0f172a]" : positive ? "text-emerald-700" : "text-rose-600"}`}>
        {value}
      </p>
    </div>
  );
}

function CompanyLogo({ pick }: { pick: QualityPick }) {
  const [failed, setFailed] = useState(false);

  return (
    <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-full border border-slate-700 bg-white p-2">
      {failed ? (
        <span className="text-sm font-black text-[#0f172a]">{pick.ticker.slice(0, 2)}</span>
      ) : (
        <img
          src={`https://logo.clearbit.com/${pick.domain}`}
          alt={`${pick.name} logo`}
          className="h-full w-full object-contain"
          loading="lazy"
          onError={() => setFailed(true)}
        />
      )}
    </div>
  );
}

function ArchiveLogo({ pick }: { pick: ArchivePick }) {
  const [failed, setFailed] = useState(false);

  return (
    <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full border border-slate-200 bg-white p-2 shadow-sm">
      {failed ? (
        <span className="text-xs font-black text-[#0f172a]">{pick.ticker.slice(0, 2)}</span>
      ) : (
        <img
          src={`https://logo.clearbit.com/${pick.domain}`}
          alt={`${pick.name} logo`}
          className="h-full w-full object-contain"
          loading="lazy"
          onError={() => setFailed(true)}
        />
      )}
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
    <footer className="border-t border-slate-200 bg-white px-6 py-8">
      <div className="mx-auto max-w-7xl text-sm font-semibold leading-relaxed text-slate-500">
        © 2026 Easecase, Inc. All rights reserved. StockyMonth is a high-quality financial research platform powered by AI and human expertise.
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
