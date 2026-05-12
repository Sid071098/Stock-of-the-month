"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowRight, BarChart3, LockKeyhole, Mail, Search, ShieldCheck, Sparkles, UserCircle } from "lucide-react";

export default function LoginLanding({
  subscribeRequired = false
}: {
  subscribeRequired?: boolean;
}) {
  const [email, setEmail] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    setIsLoggedIn(window.localStorage.getItem("stockymonth_login") === "true");
    setEmail(window.localStorage.getItem("stockymonth_email") ?? "");
  }, []);

  function handleLogin(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    window.localStorage.setItem("stockymonth_login", "true");
    window.localStorage.setItem("stockymonth_email", email || "member@stockymonth.com");
    setIsLoggedIn(true);
  }

  if (!isLoggedIn) {
    return (
      <main className="min-h-screen bg-white text-[#210947]">
        <Header />
        <section className="mx-auto grid min-h-[calc(100vh-96px)] max-w-7xl gap-12 px-6 py-14 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full bg-[#fff1ea] px-4 py-2 text-sm font-black text-[#ff6b4a]">
              <Sparkles className="h-4 w-4" aria-hidden="true" />
              AI-powered stock research
            </p>
            <h1 className="mt-7 max-w-3xl text-4xl font-black leading-tight text-[#210947] md:text-5xl">
              Get investing insights with StockyMonth
            </h1>
            <p className="mt-5 max-w-2xl text-xl leading-9 text-[#4d3f68]">
              Log in first, then subscribe to unlock the stock of the month, six high-quality stock ideas, and detailed Alpha Vantage-backed charts.
            </p>
            <div className="mt-8 flex items-center gap-3 text-base font-black text-emerald-700">
              <span>★★★★★</span>
              <span>Built for focused monthly research</span>
            </div>
          </div>

          <form onSubmit={handleLogin} className="rounded-md border border-slate-200 bg-white p-8 shadow-2xl">
            <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-full bg-[#210947] text-white">
              <UserCircle className="h-8 w-8" aria-hidden="true" />
            </div>
            <h2 className="text-3xl font-black text-[#210947]">Log in to continue</h2>
            <p className="mt-3 leading-7 text-[#6c5d7f]">
              Use your email to create a local session. Subscription unlock happens after Stripe Checkout.
            </p>
            <label className="mt-7 block">
              <span className="mb-2 block text-xs font-black uppercase tracking-[0.18em] text-[#8d7ca3]">Email</span>
              <span className="flex h-14 items-center gap-3 rounded-md border border-slate-200 px-4">
                <Mail className="h-5 w-5 text-[#ff6b4a]" aria-hidden="true" />
                <input
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  type="email"
                  placeholder="you@example.com"
                  className="min-w-0 flex-1 bg-transparent text-base font-bold text-[#210947] outline-none placeholder:text-slate-400"
                />
              </span>
            </label>
            <button className="mt-6 inline-flex h-14 w-full items-center justify-center rounded-full bg-[#210947] text-base font-black text-white transition hover:bg-[#32145f]">
              Log in
            </button>
          </form>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-white text-[#210947]">
      <Header />
      {subscribeRequired && (
        <div className="bg-[#ffe0d6] px-6 py-3 text-center text-sm font-black text-[#210947]">
          Subscribe to access Stock of the Month, Top Quality Stocks, History, and Analysis pages.
        </div>
      )}
      <section className="mx-auto grid max-w-7xl gap-10 px-6 py-14 lg:grid-cols-[1fr_420px] lg:items-center">
        <div>
          <p className="inline-flex items-center gap-2 rounded-full bg-[#fff1ea] px-4 py-2 text-sm font-black text-[#ff6b4a]">
            <ShieldCheck className="h-4 w-4" aria-hidden="true" />
            Login complete
          </p>
          <h1 className="mt-7 max-w-4xl text-4xl font-black leading-tight text-[#210947] md:text-5xl">
            Subscribe to unlock this month&apos;s research.
          </h1>
          <p className="mt-5 max-w-2xl text-xl leading-9 text-[#4d3f68]">
            After subscribing, you can access the dashboard, Stock of the Month, Top 6 High Quality Picks, History, and detailed ticker analysis pages.
          </p>
          <form action="/api/checkout" method="POST" className="mt-8">
            <button className="inline-flex h-14 items-center justify-center gap-2 rounded-full bg-[#ff6b4a] px-8 text-base font-black text-white transition hover:bg-[#f45d3c]">
              Get Monthly Picks for $1.99
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </button>
          </form>
        </div>

        <div className="rounded-md border border-slate-200 bg-[#f9f7ff] p-6 shadow-xl">
          <div className="mb-5 flex items-center gap-3">
            <LockKeyhole className="h-6 w-6 text-[#ff6b4a]" aria-hidden="true" />
            <p className="text-sm font-black uppercase tracking-[0.18em] text-[#8d7ca3]">Locked content</p>
          </div>
          {["Stock of the Month", "Top 6 High Quality Picks", "Detailed Alpha Vantage charts"].map((item) => (
            <div key={item} className="mb-3 rounded-md border border-white bg-white/80 p-4 text-lg font-black">
              {item}
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}

function Header() {
  return (
    <nav className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex h-24 max-w-7xl items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-md bg-[#ff6b4a] text-white">
            <BarChart3 className="h-7 w-7" aria-hidden="true" />
          </div>
          <span className="text-3xl font-black text-[#210947]">StockyMonth</span>
        </Link>
        <div className="hidden h-12 w-80 items-center gap-3 rounded-full border border-slate-200 px-4 text-slate-400 lg:flex">
          <Search className="h-5 w-5" aria-hidden="true" />
          <span className="font-bold">Search for stocks...</span>
        </div>
      </div>
    </nav>
  );
}
