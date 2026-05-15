"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowDownUp,
  BarChart3,
  ChevronDown,
  LineChart as LineChartIcon,
  Loader2
} from "lucide-react";
import type { Candle, CandleRange } from "../lib/marketData";

type ChartType = "candlestick" | "line";

const ranges: CandleRange[] = ["1D", "1W", "1M", "1Y"];
const defaultPairs = [
  "EQT/USD",
  "AAPL/USD",
  "NVDA/USD",
  "MSFT/USD",
  "TSLA/USD",
  "FTAI/USD"
];

function formatAxisLabel(t: string, range: CandleRange): string {
  if (range === "1D") {
    // Alpha Vantage intraday timestamps come as "YYYY-MM-DD HH:MM:SS" in US/Eastern.
    // Pull HH:MM straight from the string to avoid local-TZ shifting.
    const match = /(\d{2}):(\d{2})/.exec(t);
    if (match) return `${match[1]}:${match[2]}`;
  }
  const d = new Date(t);
  if (Number.isNaN(d.getTime())) return t;
  if (range === "1W") return d.toLocaleDateString("en-US", { weekday: "short" });
  if (range === "1M") return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  return d.toLocaleDateString("en-US", { month: "short", year: "2-digit" });
}

export default function TradingViewChart({
  defaultPair = "EQT/USD",
  pairs = defaultPairs,
  initialCandles,
  initialRange = "1M"
}: {
  defaultPair?: string;
  pairs?: string[];
  initialCandles?: Candle[];
  initialRange?: CandleRange;
}) {
  const [range, setRange] = useState<CandleRange>(initialRange);
  const [pair, setPair] = useState(defaultPair);
  const [chartType, setChartType] = useState<ChartType>("candlestick");
  const [pairOpen, setPairOpen] = useState(false);
  const [data, setData] = useState<Candle[]>(initialCandles ?? []);
  const [loading, setLoading] = useState(!initialCandles || initialCandles.length === 0);
  const menuRef = useRef<HTMLDivElement>(null);
  const skipFirstFetch = useRef((initialCandles?.length ?? 0) > 0);

  const symbol = useMemo(() => pair.split("/")[0], [pair]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setPairOpen(false);
      }
    }
    if (pairOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [pairOpen]);

  useEffect(() => {
    if (skipFirstFetch.current) {
      skipFirstFetch.current = false;
      return;
    }
    let cancelled = false;
    setLoading(true);
    fetch(`/api/candles/${encodeURIComponent(symbol)}?range=${range}`, {
      cache: "no-store"
    })
      .then((r) => r.json())
      .then((json: { candles?: Candle[] }) => {
        if (cancelled) return;
        setData(json.candles ?? []);
        setLoading(false);
      })
      .catch(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [symbol, range]);

  function changePair(next: string) {
    setPairOpen(false);
    if (next !== pair) setPair(next);
  }

  const hasData = data.length > 0;
  const first = hasData ? data[0] : null;
  const last = hasData ? data[data.length - 1] : null;
  const min = hasData ? Math.min(...data.map((d) => d.l)) : 0;
  const max = hasData ? Math.max(...data.map((d) => d.h)) : 1;
  const rangeSpan = max - min || 1;
  const chgPct = hasData && first && last ? ((last.c - first.o) / first.o) * 100 : 0;
  const positive = chgPct >= 0;

  const width = 800;
  const height = 360;
  const padX = 18;
  const padY = 24;
  const innerH = height - padY * 2;
  const innerW = width - padX * 2;
  const colW = hasData ? innerW / data.length : innerW;
  const bodyW = Math.max(2, colW * 0.6);

  function y(price: number): number {
    return padY + (1 - (price - min) / rangeSpan) * innerH;
  }

  const linePath = hasData
    ? data
        .map((d, i) => {
          const cx = padX + i * colW + colW / 2;
          return `${i === 0 ? "M" : "L"}${cx.toFixed(1)},${y(d.c).toFixed(1)}`;
        })
        .join(" ")
    : "";

  const areaPath =
    hasData && linePath
      ? linePath +
        ` L${(padX + (data.length - 1) * colW + colW / 2).toFixed(1)},${(padY + innerH).toFixed(1)}` +
        ` L${(padX + colW / 2).toFixed(1)},${(padY + innerH).toFixed(1)} Z`
      : "";

  const priceTicks = 5;
  const tickPrices = Array.from({ length: priceTicks }, (_, i) =>
    (max - (rangeSpan * i) / (priceTicks - 1)).toFixed(2)
  );

  const axisLabels = useMemo(() => {
    if (!hasData) return [];
    const count = 5;
    const labels: string[] = [];
    for (let i = 0; i < count; i++) {
      const idx = Math.round((i / (count - 1)) * (data.length - 1));
      labels.push(formatAxisLabel(data[idx].t, range));
    }
    return labels;
  }, [data, range, hasData]);

  const high = hasData ? Math.max(...data.map((d) => d.h)) : 0;
  const low = hasData ? Math.min(...data.map((d) => d.l)) : 0;

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-[#0a1023] shadow-2xl">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 bg-gradient-to-r from-[#0f1729] via-[#0a1023] to-[#0f1729] px-4 py-3 md:px-5">
        {/* Pair selector */}
        <div className="relative" ref={menuRef}>
          <button
            type="button"
            onClick={() => setPairOpen((o) => !o)}
            aria-expanded={pairOpen}
            aria-haspopup="listbox"
            className="inline-flex items-center gap-2 rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm font-black text-white transition hover:border-cyan-400/40 hover:bg-white/10"
          >
            <ArrowDownUp className="h-4 w-4 text-cyan-400" aria-hidden="true" />
            <span className="font-mono">{pair}</span>
            {hasData && (
              <span className={`ml-1 inline-flex items-center gap-1 text-[10px] font-black ${
                positive ? "text-emerald-400" : "text-rose-400"
              }`}>
                {positive ? "▲" : "▼"} {Math.abs(chgPct).toFixed(2)}%
              </span>
            )}
            <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${pairOpen ? "rotate-180" : ""}`} aria-hidden="true" />
          </button>
          {pairOpen && (
            <div
              role="listbox"
              className="absolute left-0 z-30 mt-2 w-52 overflow-hidden rounded-xl border border-white/10 bg-[#0a1023]/95 shadow-2xl backdrop-blur-md"
            >
              {pairs.map((p) => (
                <button
                  key={p}
                  type="button"
                  role="option"
                  aria-selected={p === pair}
                  onClick={() => changePair(p)}
                  className={`flex w-full items-center justify-between px-3 py-2 text-left text-sm font-bold font-mono transition ${
                    p === pair
                      ? "bg-cyan-500/10 text-cyan-300"
                      : "text-white/70 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  <span>{p}</span>
                  {p === pair && <span className="text-[10px] uppercase tracking-wider text-cyan-300">selected</span>}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Timeframe pills */}
        <div className="inline-flex items-center rounded-lg border border-white/10 bg-white/5 p-1">
          {ranges.map((tf) => (
            <button
              key={tf}
              type="button"
              onClick={() => setRange(tf)}
              aria-pressed={tf === range}
              className={`rounded-md px-3 py-1.5 text-xs font-black transition ${
                tf === range
                  ? "bg-gradient-to-br from-cyan-500 to-cyan-600 text-white shadow-md shadow-cyan-500/30"
                  : "text-white/55 hover:text-white"
              }`}
            >
              {tf}
            </button>
          ))}
        </div>

        {/* Chart type toggle */}
        <div className="inline-flex items-center rounded-lg border border-white/10 bg-white/5 p-1">
          <button
            type="button"
            onClick={() => setChartType("candlestick")}
            aria-pressed={chartType === "candlestick"}
            aria-label="Candlestick chart"
            className={`flex h-7 w-9 items-center justify-center rounded-md transition ${
              chartType === "candlestick"
                ? "bg-gradient-to-br from-cyan-500 to-cyan-600 text-white shadow-md shadow-cyan-500/30"
                : "text-white/50 hover:text-white"
            }`}
          >
            <BarChart3 className="h-4 w-4" aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={() => setChartType("line")}
            aria-pressed={chartType === "line"}
            aria-label="Line chart"
            className={`flex h-7 w-9 items-center justify-center rounded-md transition ${
              chartType === "line"
                ? "bg-gradient-to-br from-cyan-500 to-cyan-600 text-white shadow-md shadow-cyan-500/30"
                : "text-white/50 hover:text-white"
            }`}
          >
            <LineChartIcon className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      </div>

      {/* Chart container */}
      <div className="relative h-[420px] w-full overflow-hidden bg-[#0a1023]">
        {/* Grid pattern */}
        <div
          aria-hidden="true"
          className="absolute inset-0 opacity-40"
          style={{
            backgroundImage:
              "linear-gradient(to right, rgba(255,255,255,0.045) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.045) 1px, transparent 1px)",
            backgroundSize: "64px 44px"
          }}
        />

        {/* Glow accents */}
        <div aria-hidden="true" className="pointer-events-none absolute -left-20 top-1/3 h-56 w-56 rounded-full bg-cyan-500/10 blur-3xl" />
        <div aria-hidden="true" className="pointer-events-none absolute -right-20 bottom-0 h-56 w-56 rounded-full bg-emerald-500/10 blur-3xl" />

        {/* Right price axis */}
        <div className="absolute right-0 top-0 bottom-9 z-[1] flex w-14 flex-col justify-between border-l border-white/5 px-2 py-3">
          {tickPrices.map((p, i) => (
            <span key={`${p}-${i}`} className="font-mono text-[10px] font-bold text-white/40">{p}</span>
          ))}
        </div>

        {/* Bottom time axis */}
        <div className="absolute left-0 right-14 bottom-0 z-[1] flex h-9 items-center justify-between border-t border-white/5 px-3">
          {axisLabels.map((t, i) => (
            <span key={`${t}-${i}`} className="font-mono text-[10px] font-bold text-white/40">{t}</span>
          ))}
        </div>

        {/* Chart SVG */}
        {hasData && (
          <svg
            viewBox={`0 0 ${width} ${height}`}
            preserveAspectRatio="none"
            className="absolute inset-y-0 left-0 h-[calc(100%-2.25rem)] w-[calc(100%-3.5rem)]"
            aria-hidden="true"
          >
            <defs>
              <linearGradient id="tv-fill" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%"   stopColor="#22d3ee" stopOpacity="0.30" />
                <stop offset="100%" stopColor="#22d3ee" stopOpacity="0" />
              </linearGradient>
              <linearGradient id="tv-line" x1="0" x2="1" y1="0" y2="0">
                <stop offset="0%" stopColor="#06b6d4" />
                <stop offset="100%" stopColor="#22d3ee" />
              </linearGradient>
            </defs>

            {chartType === "line" ? (
              <g>
                <path d={areaPath} fill="url(#tv-fill)" />
                <path
                  d={linePath}
                  fill="none"
                  stroke="url(#tv-line)"
                  strokeWidth="2.4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="animate-draw-line"
                />
                {last && (
                  <>
                    <circle cx={padX + (data.length - 1) * colW + colW / 2} cy={y(last.c)} r="4.5" fill="#22d3ee" />
                    <circle cx={padX + (data.length - 1) * colW + colW / 2} cy={y(last.c)} r="10" fill="#22d3ee" opacity="0.25" className="animate-pulse-glow" />
                  </>
                )}
              </g>
            ) : (
              <g>
                {data.map((d, i) => {
                  const up = d.c >= d.o;
                  const color = up ? "#10b981" : "#f43f5e";
                  const cx = padX + i * colW + colW / 2;
                  const yOpen = y(d.o);
                  const yClose = y(d.c);
                  const yHigh = y(d.h);
                  const yLow = y(d.l);
                  const bodyTop = Math.min(yOpen, yClose);
                  const bodyH = Math.max(1.5, Math.abs(yOpen - yClose));
                  return (
                    <g key={i}>
                      <line x1={cx} x2={cx} y1={yHigh} y2={yLow} stroke={color} strokeOpacity="0.7" strokeWidth="1" />
                      <rect x={cx - bodyW / 2} y={bodyTop} width={bodyW} height={bodyH} fill={color} rx="1" />
                    </g>
                  );
                })}
              </g>
            )}
          </svg>
        )}

        {/* Last-price label on right edge */}
        {last && (
          <div className="absolute right-1 z-[2] flex items-center" style={{ top: `calc(${(y(last.c) / height) * 100}% - 11px)` }}>
            <div className={`rounded-md px-2 py-0.5 text-[10px] font-black font-mono shadow-md ${
              positive ? "bg-emerald-500 text-white" : "bg-rose-500 text-white"
            }`}>
              {last.c.toFixed(2)}
            </div>
          </div>
        )}

        {/* Crosshair */}
        <div aria-hidden="true" className="pointer-events-none absolute left-0 right-14 top-1/2 h-px bg-cyan-400/25" />
        <div aria-hidden="true" className="pointer-events-none absolute left-1/2 top-0 bottom-9 w-px bg-cyan-400/25" />

        {/* Loading overlay */}
        <div
          className={`absolute inset-0 z-10 flex flex-col items-center justify-center bg-[#0a1023]/75 backdrop-blur-sm transition-opacity duration-300 ${
            loading ? "opacity-100" : "pointer-events-none opacity-0"
          }`}
          aria-live="polite"
          aria-busy={loading}
        >
          <Loader2 className="h-9 w-9 animate-spin text-cyan-400" aria-hidden="true" />
          <p className="mt-3 font-mono text-[11px] font-black uppercase tracking-[0.28em] text-white/85">
            Loading {symbol} · {range}…
          </p>
          <div className="mt-4 h-[3px] w-44 overflow-hidden rounded-full bg-white/10">
            <div className="animate-ticker-tape h-full w-1/2 bg-gradient-to-r from-transparent via-cyan-400 to-transparent" />
          </div>
        </div>
      </div>

      {/* OHLC footer */}
      <div className="grid grid-cols-2 gap-3 border-t border-white/10 bg-[#0f1729] px-4 py-3 sm:grid-cols-4 md:px-5">
        {[
          { label: "Open",  val: first ? first.o.toFixed(2) : "—", tone: "text-white" },
          { label: "High",  val: hasData ? high.toFixed(2) : "—",  tone: "text-emerald-300" },
          { label: "Low",   val: hasData ? low.toFixed(2) : "—",   tone: "text-rose-300" },
          { label: "Close", val: last ? last.c.toFixed(2) : "—",   tone: positive ? "text-emerald-300" : "text-rose-300" }
        ].map((s) => (
          <div key={s.label} className="flex items-baseline gap-1.5">
            <span className="text-[10px] font-black uppercase tracking-wider text-white/40">{s.label}</span>
            <span className={`font-mono text-sm font-black ${s.tone}`}>{s.val}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
