"use client";

import Link from "next/link";
import type React from "react";
import { useEffect, useRef, useState } from "react";
import {
  BadgeCheck,
  BarChart3,
  BriefcaseBusiness,
  ChevronDown,
  CircleDollarSign,
  CircleGauge,
  Crown,
  Database,
  Edit3,
  KeyRound,
  LineChart,
  LogOut,
  LogIn,
  Mail,
  RefreshCcw,
  Save,
  Settings,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  UserPlus,
  UserCircle
} from "lucide-react";
import StripePricingTable from "./StripePricingTable";
import type { ArchivePick, MonthlyPick, QualityPick } from "../lib/picks";

const monthlyStorageKey = "stockymonth.monthlyPick";
const qualityStorageKey = "stockymonth.qualityPicks";
const authUsersStorageKey = "stockymonth.registeredUsers";
const authSessionStorageKey = "stockymonth.currentUser";

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

type StockExperienceProps = {
  archivePicks: ArchivePick[];
  defaultMonthlyPick: MonthlyPick;
  defaultQualityPicks: QualityPick[];
  pricingTableId: string;
  publishableKey: string;
  showAdmin?: boolean;
  showPricing?: boolean;
};

export default function StockExperience({
  archivePicks,
  defaultMonthlyPick,
  defaultQualityPicks,
  pricingTableId,
  publishableKey,
  showAdmin = false,
  showPricing = true
}: StockExperienceProps) {
  const [monthlyPick, setMonthlyPick] = useState(defaultMonthlyPick);
  const [qualityPicks, setQualityPicks] = useState(defaultQualityPicks);
  const [showQualityPicks, setShowQualityPicks] = useState(false);
  const [authReady, setAuthReady] = useState(false);
  const [currentUser, setCurrentUser] = useState<RegisteredUser | null>(null);

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

  function revealQualityPicks() {
    setShowQualityPicks(true);
    window.setTimeout(() => {
      document.getElementById("quality-picks")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 50);
  }

  function completeAuthentication(user: RegisteredUser) {
    setCurrentUser(user);
    window.localStorage.setItem(authSessionStorageKey, JSON.stringify(user));
  }

  function signOut() {
    setCurrentUser(null);
    window.localStorage.removeItem(authSessionStorageKey);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  if (!authReady) {
    return <AuthLoadingScreen />;
  }

  if (!currentUser) {
    return <AuthLanding onAuthenticated={completeAuthentication} />;
  }

  return (
    <main className="min-h-screen bg-[#f8fafc] text-slate-950">
      <TopNav currentUser={currentUser} onShowTopPicks={revealQualityPicks} onSignOut={signOut} />
      <Hero monthlyPick={monthlyPick} />
      <MonthlyPickSection monthlyPick={monthlyPick} />
      <AllPicksSection picks={archivePicks} />
      {showQualityPicks && <QualityPicksSection picks={qualityPicks} />}
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
  const [notice, setNotice] = useState<AuthNotice | null>(null);
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [forgotEmail, setForgotEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  function showNotice(nextNotice: AuthNotice) {
    setNotice(nextNotice);
    window.setTimeout(() => setNotice((current) => (current?.message === nextNotice.message ? null : current)), 4000);
  }

  async function handleLogin(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);

    const email = normalizeEmail(loginEmail);
    const users = getRegisteredUsers();
    const user = users.find((candidate) => candidate.email === email);
    const passwordHash = await hashPassword(loginPassword);

    if (!user) {
      showNotice({ message: "No registered user found. Please sign up first.", type: "error" });
      setIsSubmitting(false);
      return;
    }

    if (user.passwordHash !== passwordHash) {
      showNotice({ message: "Incorrect password. Use Forgot password if you need a reset.", type: "error" });
      setIsSubmitting(false);
      return;
    }

    showNotice({ message: "Login successful. Welcome back.", type: "success" });
    onAuthenticated(user);
    setIsSubmitting(false);
  }

  async function handleSignup(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);

    const email = normalizeEmail(signupEmail);
    const users = getRegisteredUsers();

    if (!firstName.trim() || !lastName.trim() || !email || !signupPassword) {
      showNotice({ message: "Please complete first name, last name, email, and password.", type: "error" });
      setIsSubmitting(false);
      return;
    }

    if (signupPassword.length < 6) {
      showNotice({ message: "Password must be at least 6 characters.", type: "error" });
      setIsSubmitting(false);
      return;
    }

    if (users.some((user) => user.email === email)) {
      showNotice({ message: "User is already registered. Please log in instead.", type: "error" });
      setMode("login");
      setLoginEmail(email);
      setIsSubmitting(false);
      return;
    }

    const user: RegisteredUser = {
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email,
      passwordHash: await hashPassword(signupPassword),
      createdAt: new Date().toISOString()
    };

    window.localStorage.setItem(authUsersStorageKey, JSON.stringify([...users, user]));
    showNotice({ message: "Account created. You are now signed in.", type: "success" });
    onAuthenticated(user);
    setIsSubmitting(false);
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
    <main className="min-h-screen bg-[#f8fafc] px-6 py-8 text-slate-950">
      {notice && (
        <div
          className={`fixed right-5 top-5 z-50 max-w-sm rounded-md border p-4 text-sm font-bold shadow-2xl ${
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

      <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-6xl items-center">
        <div className="grid w-full overflow-hidden rounded-md border border-slate-200 bg-white shadow-2xl lg:grid-cols-[0.95fr_1.05fr]">
          <section className="relative overflow-hidden bg-[#0f172a] p-8 text-white md:p-10">
            <div className="absolute -left-24 -top-24 h-64 w-64 rounded-full bg-[#ff4f00]/20" />
            <div className="absolute bottom-0 right-0 h-0 w-0 border-b-[180px] border-l-[180px] border-b-[#ff4f00]/25 border-l-transparent" />
            <div className="relative z-10 flex h-full flex-col justify-between gap-12">
              <div>
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-md bg-[#ff4f00] text-white">
                    <BarChart3 className="h-7 w-7" aria-hidden="true" />
                  </div>
                  <span className="text-2xl font-black tracking-tight">StockyMonth</span>
                </div>
                <h1 className="mt-10 max-w-xl text-3xl font-black leading-tight md:text-4xl">
                  Sign in to unlock your monthly stock research dashboard.
                </h1>
                <p className="mt-5 max-w-lg text-base font-medium leading-relaxed text-slate-300">
                  Create an account, review the latest Stock of the Month, and explore the public archive from one clean trading workspace.
                </p>
              </div>

              <div className="grid gap-3">
                {["Protected dashboard access", "Registered-user detection", "Forgot-password recovery flow"].map((item) => (
                  <div key={item} className="flex items-center gap-3 rounded-md border border-white/10 bg-white/5 p-3">
                    <ShieldCheck className="h-5 w-5 text-[#22c55e]" aria-hidden="true" />
                    <span className="text-sm font-black text-slate-100">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="p-6 md:p-10">
            <div className="mb-6 inline-flex rounded-full border border-slate-200 bg-slate-50 p-1">
              <button
                type="button"
                onClick={() => setMode("login")}
                className={`inline-flex items-center gap-2 rounded-full px-5 py-2 text-sm font-black transition ${
                  mode === "login" ? "bg-[#ff4f00] text-white shadow-sm" : "text-slate-600 hover:text-slate-950"
                }`}
              >
                <LogIn className="h-4 w-4" aria-hidden="true" />
                Login
              </button>
              <button
                type="button"
                onClick={() => setMode("signup")}
                className={`inline-flex items-center gap-2 rounded-full px-5 py-2 text-sm font-black transition ${
                  mode === "signup" ? "bg-[#ff4f00] text-white shadow-sm" : "text-slate-600 hover:text-slate-950"
                }`}
              >
                <UserPlus className="h-4 w-4" aria-hidden="true" />
                Sign up
              </button>
            </div>

            {mode === "login" && (
              <form onSubmit={handleLogin}>
                <p className="text-sm font-black uppercase tracking-[0.18em] text-[#ff4f00]">Member Login</p>
                <h2 className="mt-3 text-3xl font-black text-slate-950">Welcome back</h2>
                <p className="mt-3 text-sm leading-relaxed text-slate-600">
                  Enter the email and password you used when creating your StockyMonth account.
                </p>

                <div className="mt-7 grid gap-4">
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
                  className="mt-6 inline-flex h-12 w-full items-center justify-center rounded-full bg-[#ff4f00] px-6 text-sm font-black text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isSubmitting ? "Checking account..." : "Login"}
                </button>
              </form>
            )}

            {mode === "signup" && (
              <form onSubmit={handleSignup}>
                <p className="text-sm font-black uppercase tracking-[0.18em] text-[#ff4f00]">Create Account</p>
                <h2 className="mt-3 text-3xl font-black text-slate-950">Start with StockyMonth</h2>
                <p className="mt-3 text-sm leading-relaxed text-slate-600">
                  Sign up with your first name, last name, and email address. Existing users will be prompted to log in.
                </p>

                <div className="mt-7 grid gap-4 sm:grid-cols-2">
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
                  className="mt-6 inline-flex h-12 w-full items-center justify-center rounded-full bg-[#ff4f00] px-6 text-sm font-black text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isSubmitting ? "Creating account..." : "Sign up"}
                </button>
              </form>
            )}

            {mode === "forgot" && (
              <form onSubmit={handleForgotPassword}>
                <p className="text-sm font-black uppercase tracking-[0.18em] text-[#ff4f00]">Password Recovery</p>
                <h2 className="mt-3 text-3xl font-black text-slate-950">Forgot password?</h2>
                <p className="mt-3 text-sm leading-relaxed text-slate-600">
                  Enter your registered email address and StockyMonth will prepare the reset flow.
                </p>

                <div className="mt-7">
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
                    className="inline-flex h-12 flex-1 items-center justify-center rounded-full bg-[#ff4f00] px-6 text-sm font-black text-white transition hover:bg-orange-600"
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
      </div>
    </main>
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
          className="h-full min-w-0 flex-1 bg-transparent text-sm font-semibold text-slate-950 outline-none placeholder:text-slate-400"
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
  currentUser,
  onShowTopPicks,
  onSignOut
}: {
  currentUser: RegisteredUser;
  onShowTopPicks: () => void;
  onSignOut: () => void;
}) {
  return (
    <nav className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 shadow-sm backdrop-blur">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6">
        <Link href="/dashboard" className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-md bg-[#ff4f00] text-white">
            <BarChart3 className="h-6 w-6" aria-hidden="true" />
          </div>
          <span className="text-xl font-black tracking-tight text-slate-950 md:text-2xl">StockyMonth</span>
        </Link>

        <div className="hidden items-center gap-3 md:flex">
          <a
            href="#stock-of-month"
            className="rounded-full bg-orange-50 px-5 py-2.5 text-sm font-black text-[#ff4f00] transition hover:bg-orange-100"
          >
            Stock of the Month
          </a>
          <button
            type="button"
            onClick={onShowTopPicks}
            className="rounded-full px-5 py-2.5 text-sm font-black text-slate-700 transition hover:bg-slate-100"
          >
            Top 6
          </button>
          <a
            href="#all-picks"
            className="rounded-full px-5 py-2.5 text-sm font-black text-slate-700 transition hover:bg-slate-100"
          >
            All Picks
          </a>
        </div>

        <ProfileMenu currentUser={currentUser} onSignOut={onSignOut} />
      </div>
    </nav>
  );
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
        <div className="absolute right-0 mt-3 w-80 rounded-md border border-[#efe7f7] bg-white p-4 text-[#210947] shadow-2xl">
          <div className="flex items-start gap-3 border-b border-[#efe7f7] pb-4">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#210947] text-sm font-black text-white">
              {getUserInitials(currentUser)}
            </div>
            <div>
              <p className="text-sm font-black">{fullName}</p>
              <p className="text-xs font-semibold text-[#6c5d7f]">{currentUser.email}</p>
            </div>
          </div>

          <div className="mt-4 rounded-md bg-[#fff1ea] p-4">
            <div className="flex items-center justify-between">
              <p className="text-sm font-black">Archive Access</p>
              <span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-black text-[#ff4f00]">Public</span>
            </div>
            <p className="mt-2 text-xs font-semibold leading-5 text-[#6c5d7f]">
              The complete historical archive is visible for recruiters, clients, and visitors.
            </p>
          </div>

          <div className="mt-4 grid gap-2">
            <Link href="/history" className="inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-bold hover:bg-[#fff1ea]">
              <Crown className="h-4 w-4 text-[#ff6b4a]" aria-hidden="true" />
              Pick history
            </Link>
            <Link href="/admin" className="inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-bold hover:bg-[#fff1ea]">
              <Settings className="h-4 w-4 text-[#ff6b4a]" aria-hidden="true" />
              Admin editor
            </Link>
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
          <h1 className="mt-7 max-w-4xl text-3xl font-black leading-tight text-slate-950 md:text-4xl">
            Monthly stock picks with focused data, thesis, and quality shortlist.
          </h1>
          <p className="mt-5 max-w-3xl text-base leading-relaxed text-slate-600 md:text-lg">
            {monthlyPick.name} ({monthlyPick.ticker}) is the current featured idea. Review the thesis,
            open detailed Alpha Vantage charts, and compare six high-quality stocks.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <a
              href="#stock-of-month"
              className="inline-flex h-14 items-center justify-center rounded-full bg-[#ff4f00] px-8 text-base font-black text-white transition hover:bg-orange-600"
            >
              View stock of the month
            </a>
            <a
              href="#quality-picks"
              className="inline-flex h-14 items-center justify-center rounded-full border border-slate-200 bg-white px-8 text-base font-black text-slate-800 transition hover:bg-slate-50"
            >
              See top quality picks
            </a>
          </div>
        </Reveal>

        <Reveal className="rounded-md border border-slate-200 bg-white p-5 shadow-xl">
          <div className="rounded-md border border-slate-200 bg-[#f8fafc] p-5 shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-200 pb-4">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-500">Latest stock pick</p>
                <h2 className="mt-2 text-2xl font-black text-slate-950">{monthlyPick.ticker}</h2>
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

function MonthlyPickSection({ monthlyPick }: { monthlyPick: MonthlyPick }) {
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
    <section id="stock-of-month" className="bg-[#f8fafc] px-4 py-3 md:px-6 lg:min-h-[calc(100vh-5rem)] lg:py-4">
      <div className="mx-auto max-w-[1460px]">
        <Reveal className="sr-only mb-7 flex items-center gap-3 text-slate-950">
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
      </div>
    </section>
  );
}

function AllPicksSection({ picks }: { picks: ArchivePick[] }) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  return (
    <section id="all-picks" className="bg-[#f8fafc] px-6 py-14">
      <div className="mx-auto max-w-7xl">
        <Reveal className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.18em] text-[#ff4f00]">Historical Archive</p>
            <h2 className="mt-3 text-3xl font-black text-slate-950">All Picks</h2>
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
                        <h3 className="mt-1 text-lg font-black leading-snug text-slate-950">
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
                    <p className="text-2xl font-black text-slate-950">{pick.price}</p>
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
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white/75 text-[#210947] shadow-sm">
            <BadgeCheck className="h-6 w-6" aria-hidden="true" />
          </span>
          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-[#207d72]">Dynamic LLM Brief</p>
            <h3 className="mt-1 text-2xl font-black text-[#210947]">{monthlyPick.month} Pick</h3>
          </div>
        </div>

        <div className="relative mt-5 rounded-md bg-white/95 p-4 shadow-sm md:p-5">
          <div className="mb-3 flex items-center justify-between gap-3">
            <p className="text-sm font-black text-[#210947]">Exclusive Analysis for Subscribers</p>
            <span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-black text-[#ff4f00]">AI refreshed</span>
          </div>
          <ul className="grid gap-2.5">
            {(monthlyPick.summaryBullets?.length ? monthlyPick.summaryBullets : [monthlyPick.thesis]).slice(0, 4).map((item) => (
              <li key={item} className="flex gap-3 text-sm font-bold leading-snug text-[#210947]">
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
    <section id="quality-picks" className="border-y border-slate-200 bg-white px-6 py-16">
      <div className="mx-auto max-w-7xl">
        <Reveal className="mb-8">
          <p className="text-sm font-black uppercase tracking-[0.18em] text-[#ff4f00]">Top 6 High Quality Picks</p>
          <h2 className="mt-3 text-2xl font-black text-slate-950 md:text-3xl">Static shortlist you can update from admin</h2>
        </Reveal>

        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {picks.map((pick, index) => (
            <Reveal key={pick.ticker} delay={index * 70}>
              <Link
                href={`/analysis/${pick.ticker}`}
                className="group block rounded-md border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-orange-200 hover:shadow-xl"
              >
                <div className="flex items-start justify-between gap-4">
                  <CompanyLogo pick={pick} />
                  <span className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[11px] font-black uppercase tracking-wide text-emerald-700">
                    <LiveDot />
                    {pick.tag}
                  </span>
                </div>
                <h3 className="mt-5 text-lg font-black text-slate-950 group-hover:text-[#ff4f00]">
                  {pick.name} ({pick.ticker})
                </h3>
                <p className="mt-1 text-sm font-bold text-slate-500">{pick.sector}</p>
                <div className="mt-5 flex items-end justify-between">
                  <p className="text-lg font-black text-slate-950">{pick.price}</p>
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
            Unlock {monthlyPick.ticker}, top quality ideas, detailed analysis, and pick history. Student promo codes are supported at checkout.
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
        <div className="rounded-md bg-white p-6 text-[#210947] shadow-2xl md:p-10">
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
          <h2 className="mt-3 text-3xl font-black text-[#210947]">Manage monthly and quality picks</h2>
        </div>

        <div className="grid gap-6 lg:grid-cols-[0.85fr_1.15fr]">
          <div className="rounded-md border border-[#efe7f7] bg-white p-6 shadow-sm">
            <div className="mb-5 flex items-center gap-3">
              <Edit3 className="h-5 w-5 text-[#ff6b4a]" aria-hidden="true" />
              <h3 className="text-2xl font-black text-[#210947]">Add one stock per month</h3>
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
                className="inline-flex h-11 items-center gap-2 rounded-full border border-[#efe7f7] px-5 text-sm font-black text-[#210947]"
              >
                <RefreshCcw className="h-4 w-4" aria-hidden="true" />
                Reset
              </button>
            </div>
          </div>

          <div className="rounded-md border border-[#efe7f7] bg-white p-6 shadow-sm">
            <div className="mb-5 flex items-center gap-3">
              <BadgeCheck className="h-5 w-5 text-[#ff6b4a]" aria-hidden="true" />
              <h3 className="text-2xl font-black text-[#210947]">Add or modify top 6 stocks</h3>
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
                className="inline-flex h-11 items-center gap-2 rounded-full border border-[#efe7f7] px-5 text-sm font-black text-[#210947]"
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
        className={`${compact ? "h-10" : "h-12"} w-full rounded-md border border-[#efe7f7] bg-white px-3 text-sm font-bold text-[#210947] outline-none transition focus:border-[#ff6b4a]`}
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
        className="w-full rounded-md border border-[#efe7f7] bg-white px-3 py-3 text-sm font-bold leading-6 text-[#210947] outline-none transition focus:border-[#ff6b4a]"
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
      <p className={`mt-1 text-xl font-black ${positive === undefined ? "text-[#210947]" : positive ? "text-emerald-700" : "text-rose-600"}`}>
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
        <span className="text-xs font-black text-slate-950">{pick.ticker.slice(0, 2)}</span>
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

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

async function hashPassword(password: string) {
  const bytes = new TextEncoder().encode(password);
  const digest = await window.crypto.subtle.digest("SHA-256", bytes);

  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

function getUserInitials(user: RegisteredUser) {
  const firstInitial = user.firstName.trim().charAt(0);
  const lastInitial = user.lastName.trim().charAt(0);
  return `${firstInitial}${lastInitial}`.toUpperCase() || "SM";
}
