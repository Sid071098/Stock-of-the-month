import {
  ArrowUpRight,
  BarChart3,
  CheckCircle2,
  LineChart,
  LockKeyhole,
  ShieldCheck,
  Sparkles,
  TrendingUp
} from "lucide-react";

const chartPoints = [
  "M 0 116",
  "C 42 88, 58 100, 92 72",
  "S 145 34, 186 48",
  "S 248 78, 292 42",
  "S 352 4, 414 30",
  "S 486 70, 560 24"
].join(" ");

const thesis = [
  "Scaled streaming platform with durable global engagement and pricing power.",
  "Advertising tier creates a second growth engine beyond membership fees.",
  "Disciplined content spend and buybacks support free cash flow per share."
];

export default function Home() {
  return (
    <main className="min-h-screen overflow-hidden bg-ink text-slate-50">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_20%_0%,rgba(34,197,94,0.14),transparent_34%),linear-gradient(135deg,#05070d_0%,#0b1020_48%,#111827_100%)]" />

      <nav className="mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-5">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-md border border-line bg-panel">
            <BarChart3 className="h-5 w-5 text-bull" aria-hidden="true" />
          </div>
          <div>
            <p className="text-sm font-semibold tracking-wide text-white">Signal Desk</p>
            <p className="text-xs text-muted">Monthly equity research</p>
          </div>
        </div>
        <div className="hidden items-center gap-6 text-sm text-slate-300 md:flex">
          <a href="#thesis" className="transition hover:text-white">
            Thesis
          </a>
          <a href="#pricing" className="transition hover:text-white">
            Pricing
          </a>
          <a href="#risk" className="transition hover:text-white">
            Risk
          </a>
        </div>
      </nav>

      <section className="mx-auto grid min-h-[calc(100vh-82px)] w-full max-w-7xl items-center gap-10 px-6 pb-14 pt-6 lg:grid-cols-[1fr_0.92fr]">
        <div className="max-w-3xl">
          <div className="mb-6 inline-flex items-center gap-2 rounded-md border border-bull/30 bg-bull/10 px-3 py-2 text-sm font-medium text-emerald-200">
            <Sparkles className="h-4 w-4" aria-hidden="true" />
            Stock of the Month
          </div>

          <h1 className="max-w-3xl text-5xl font-semibold leading-[1.03] tracking-normal text-white md:text-7xl">
            Netflix, Inc. <span className="text-bull">NFLX</span>
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300">
            A premium research brief for investors watching subscription media,
            advertising growth, margin expansion, and shareholder returns.
          </p>

          <div className="mt-8 grid max-w-2xl grid-cols-2 gap-3 sm:grid-cols-4">
            <Metric label="Reference Price" value="$92.12" detail="Apr 29 close" />
            <Metric label="Market Cap" value="$387.9B" detail="Intraday" />
            <Metric label="Forward P/E" value="28.65x" detail="Est." />
            <Metric label="Target Est." value="$114.66" detail="1Y analyst" />
          </div>

          <form action="/api/checkout" method="POST" className="mt-9 flex flex-col gap-3 sm:flex-row">
            <button
              type="submit"
              className="inline-flex h-12 items-center justify-center gap-2 rounded-md bg-bull px-6 text-sm font-bold text-slate-950 shadow-glow transition hover:bg-emerald-300 focus:outline-none focus:ring-2 focus:ring-bull focus:ring-offset-2 focus:ring-offset-ink"
            >
              Subscribe Now
              <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
            </button>
            <a
              href="#thesis"
              className="inline-flex h-12 items-center justify-center rounded-md border border-line bg-white/5 px-6 text-sm font-semibold text-white transition hover:border-slate-500 hover:bg-white/10"
            >
              View Thesis
            </a>
          </form>

          <div className="mt-6 flex items-center gap-2 text-xs text-muted">
            <LockKeyhole className="h-4 w-4" aria-hidden="true" />
            Secure checkout powered by Stripe. Cancel anytime.
          </div>
        </div>

        <div className="rounded-md border border-line bg-panel/80 p-5 shadow-2xl backdrop-blur">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-white">NFLX Research Dashboard</p>
              <p className="text-xs text-muted">Price action placeholder</p>
            </div>
            <div className="rounded-md border border-bull/30 bg-bull/10 px-3 py-1 text-xs font-semibold text-bull">
              +18.16% 1Y
            </div>
          </div>

          <div className="relative h-80 rounded-md border border-line bg-[#080c18] p-4">
            <div className="absolute inset-x-4 top-6 h-px bg-line" />
            <div className="absolute inset-x-4 top-1/3 h-px bg-line" />
            <div className="absolute inset-x-4 top-2/3 h-px bg-line" />
            <div className="absolute inset-y-4 left-1/4 w-px bg-line" />
            <div className="absolute inset-y-4 left-1/2 w-px bg-line" />
            <div className="absolute inset-y-4 left-3/4 w-px bg-line" />
            <svg
              viewBox="0 0 560 160"
              className="absolute inset-x-4 bottom-10 h-44 w-[calc(100%-2rem)]"
              role="img"
              aria-label="Stylized Netflix stock chart placeholder"
            >
              <defs>
                <linearGradient id="area" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="#22c55e" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="#22c55e" stopOpacity="0" />
                </linearGradient>
              </defs>
              <path d={`${chartPoints} L 560 160 L 0 160 Z`} fill="url(#area)" />
              <path d={chartPoints} fill="none" stroke="#22c55e" strokeLinecap="round" strokeWidth="4" />
            </svg>
            <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-xs text-muted">
              <span>Feb</span>
              <span>Mar</span>
              <span>Apr</span>
              <span>May</span>
            </div>
          </div>

          <div className="mt-5 grid grid-cols-3 gap-3">
            <Signal icon={<TrendingUp className="h-4 w-4" />} label="Momentum" value="Constructive" />
            <Signal icon={<LineChart className="h-4 w-4" />} label="Volatility" value="Elevated" />
            <Signal icon={<ShieldCheck className="h-4 w-4" />} label="Quality" value="High" />
          </div>
        </div>
      </section>

      <section id="thesis" className="border-y border-line bg-[#070b14]">
        <div className="mx-auto grid max-w-7xl gap-8 px-6 py-16 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-bull">Investment Thesis</p>
            <h2 className="mt-3 text-3xl font-semibold text-white">Why NFLX made the desk this month</h2>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {thesis.map((item) => (
              <div key={item} className="rounded-md border border-line bg-panel p-5">
                <CheckCircle2 className="mb-4 h-5 w-5 text-bull" aria-hidden="true" />
                <p className="text-sm leading-6 text-slate-300">{item}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="pricing" className="mx-auto grid max-w-7xl gap-8 px-6 py-16 lg:grid-cols-[1fr_420px]">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-bull">Subscription</p>
          <h2 className="mt-3 text-3xl font-semibold text-white">Institutional-style research, delivered monthly</h2>
          <p className="mt-4 max-w-2xl text-slate-300">
            Each issue includes the featured stock thesis, valuation notes, catalysts,
            risk markers, and a concise action framework for your own due diligence.
          </p>
        </div>
        <div className="rounded-md border border-line bg-panel p-6">
          <p className="text-sm text-muted">Monthly access</p>
          <div className="mt-2 flex items-end gap-2">
            <span className="text-5xl font-semibold text-white">$199</span>
            <span className="pb-2 text-sm text-muted">/ month</span>
          </div>
          <form action="/api/checkout" method="POST" className="mt-6">
            <button
              type="submit"
              className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-md bg-bull px-6 text-sm font-bold text-slate-950 transition hover:bg-emerald-300"
            >
              Subscribe Now
              <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
            </button>
          </form>
          <p id="risk" className="mt-4 text-xs leading-5 text-muted">
            Research is educational and not financial advice. Investing involves risk,
            including possible loss of principal.
          </p>
        </div>
      </section>
    </main>
  );
}

function Metric({ label, value, detail }: { label: string; value: string; detail: string }) {
  return (
    <div className="rounded-md border border-line bg-panel/70 p-4">
      <p className="text-xs text-muted">{label}</p>
      <p className="mt-2 text-xl font-semibold text-white">{value}</p>
      <p className="mt-1 text-xs text-slate-500">{detail}</p>
    </div>
  );
}

function Signal({
  icon,
  label,
  value
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-md border border-line bg-white/[0.03] p-4">
      <div className="mb-3 text-bull">{icon}</div>
      <p className="text-xs text-muted">{label}</p>
      <p className="mt-1 text-sm font-semibold text-white">{value}</p>
    </div>
  );
}
