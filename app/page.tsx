import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import { BarChart3, LockKeyhole, Search, ShieldCheck, Sparkles, Star } from "lucide-react";
import GoogleSignInButton from "./components/GoogleSignInButton";
import { authOptions } from "./lib/auth";

export default async function LoginPage() {
  const session = await getServerSession(authOptions);

  if (session) {
    redirect("/dashboard");
  }

  return (
    <main className="min-h-screen bg-[#f6f9fc] text-slate-950">
      <nav className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6">
          <a href="#" className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-md bg-[#0f766e] text-white">
              <BarChart3 className="h-6 w-6" aria-hidden="true" />
            </div>
            <span className="text-3xl font-bold text-[#0f172a]">StockMonth</span>
          </a>
          <div className="hidden h-12 w-80 items-center gap-3 rounded-full border border-slate-200 px-4 text-slate-400 md:flex">
            <Search className="h-5 w-5" aria-hidden="true" />
            <span className="text-base font-semibold">Search for stocks...</span>
          </div>
        </div>
      </nav>

      <section className="mx-auto grid min-h-[calc(100vh-80px)] max-w-7xl items-center gap-10 px-6 py-14 lg:grid-cols-[1fr_440px]">
        <div>
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-teal-200 bg-teal-50 px-4 py-2 text-sm font-bold text-teal-700">
            <Sparkles className="h-4 w-4" aria-hidden="true" />
            Google login required
          </div>
          <h1 className="max-w-3xl text-5xl font-extrabold leading-tight text-slate-950 md:text-7xl">
            Sign in to unlock this month&apos;s stock pick.
          </h1>
          <p className="mt-6 max-w-2xl text-xl leading-8 text-slate-600">
            Use your Google or Gmail account to access StockMonth&apos;s monthly
            stock suggestion, winning-picks history, research framework, and Stripe
            subscription page.
          </p>

          <div className="mt-8 grid max-w-2xl gap-4 md:grid-cols-3">
            <LoginStat icon={<Star className="h-5 w-5" />} label="Monthly pick" />
            <LoginStat icon={<ShieldCheck className="h-5 w-5" />} label="Secure access" />
            <LoginStat icon={<LockKeyhole className="h-5 w-5" />} label="Member page" />
          </div>
        </div>

        <section className="rounded-md border border-slate-200 bg-white p-8 shadow-xl shadow-slate-200/70">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-teal-700">Member Login</p>
          <h2 className="mt-3 text-3xl font-extrabold text-slate-950">Continue with Google</h2>
          <p className="mt-3 leading-7 text-slate-600">
            After signing in, you&apos;ll go directly to the StockMonth research
            dashboard and checkout section.
          </p>
          <div className="mt-7">
            <GoogleSignInButton />
          </div>
          <p className="mt-5 text-xs leading-5 text-slate-500">
            By continuing, you agree to use StockMonth for educational research.
            Investing involves risk, including possible loss of principal.
          </p>
        </section>
      </section>
    </main>
  );
}

function LoginStat({ icon, label }: { icon: ReactNode; label: string }) {
  return (
    <div className="rounded-md border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-md bg-teal-50 text-teal-700">
        {icon}
      </div>
      <p className="text-sm font-extrabold text-slate-800">{label}</p>
    </div>
  );
}
