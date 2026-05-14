"use client";

import { useEffect, useRef, useState } from "react";
import {
  ArrowDownUp,
  BarChart3,
  ChevronDown,
  LineChart as LineChartIcon,
  Loader2
} from "lucide-react";

type Timeframe = "1m" | "5m" | "1h" | "1D";
type ChartType = "candlestick" | "line";
type Candle = { o: number; h: number; l: number; c: number };

const timeframes: Timeframe[] = ["1m", "5m", "1h", "1D"];
const defaultPairs = [
  "EQT/USD",
  "AAPL/USD",
  "NVDA/USD",
  "MSFT/USD",
  "TSLA/USD",
  "FTAI/USD",
  "BTC/USDT",
  "ETH/USDT"
];

// Deterministic candle data (avoids SSR/CSR mismatch)
const candleData: Record<Timeframe, Candle[]> = {
  "1m": [
    { o: 184.2, h: 185.0, l: 183.8, c: 184.7 },
    { o: 184.7, h: 185.4, l: 184.2, c: 185.1 },
    { o: 185.1, h: 185.3, l: 184.0, c: 184.3 },
    { o: 184.3, h: 184.8, l: 183.6, c: 184.6 },
    { o: 184.6, h: 186.1, l: 184.5, c: 185.9 },
    { o: 185.9, h: 186.2, l: 185.1, c: 185.4 },
    { o: 185.4, h: 186.7, l: 185.2, c: 186.5 },
    { o: 186.5, h: 187.2, l: 186.1, c: 187.0 },
    { o: 187.0, h: 187.4, l: 186.3, c: 186.6 },
    { o: 186.6, h: 188.1, l: 186.4, c: 187.9 },
    { o: 187.9, h: 188.4, l: 187.2, c: 187.6 },
    { o: 187.6, h: 188.8, l: 187.5, c: 188.6 },
    { o: 188.6, h: 189.0, l: 187.8, c: 188.1 },
    { o: 188.1, h: 189.5, l: 188.0, c: 189.3 },
    { o: 189.3, h: 189.8, l: 188.6, c: 188.9 },
    { o: 188.9, h: 190.0, l: 188.7, c: 189.7 },
    { o: 189.7, h: 190.6, l: 189.4, c: 190.4 },
    { o: 190.4, h: 191.0, l: 189.9, c: 190.2 },
    { o: 190.2, h: 191.4, l: 190.1, c: 191.2 },
    { o: 191.2, h: 191.8, l: 190.8, c: 191.5 },
    { o: 191.5, h: 192.2, l: 191.0, c: 191.0 },
    { o: 191.0, h: 192.0, l: 190.6, c: 191.8 },
    { o: 191.8, h: 192.4, l: 191.5, c: 192.2 },
    { o: 192.2, h: 192.6, l: 191.6, c: 191.9 },
    { o: 191.9, h: 192.4, l: 191.2, c: 191.4 },
    { o: 191.4, h: 192.0, l: 190.9, c: 191.7 },
    { o: 191.7, h: 192.5, l: 191.3, c: 192.3 },
    { o: 192.3, h: 192.8, l: 191.9, c: 192.4 }
  ],
  "5m": [
    { o: 180.0, h: 181.8, l: 179.4, c: 181.2 },
    { o: 181.2, h: 182.5, l: 180.6, c: 182.0 },
    { o: 182.0, h: 182.4, l: 180.9, c: 181.3 },
    { o: 181.3, h: 183.1, l: 181.0, c: 182.8 },
    { o: 182.8, h: 184.0, l: 182.5, c: 183.6 },
    { o: 183.6, h: 184.2, l: 182.9, c: 183.0 },
    { o: 183.0, h: 184.6, l: 182.8, c: 184.5 },
    { o: 184.5, h: 185.4, l: 184.0, c: 185.2 },
    { o: 185.2, h: 185.8, l: 184.4, c: 184.7 },
    { o: 184.7, h: 186.0, l: 184.5, c: 185.6 },
    { o: 185.6, h: 187.1, l: 185.3, c: 186.9 },
    { o: 186.9, h: 187.4, l: 186.0, c: 186.3 },
    { o: 186.3, h: 187.7, l: 186.1, c: 187.5 },
    { o: 187.5, h: 188.2, l: 187.0, c: 187.8 },
    { o: 187.8, h: 188.6, l: 187.2, c: 188.4 },
    { o: 188.4, h: 189.0, l: 187.6, c: 188.0 },
    { o: 188.0, h: 189.4, l: 187.8, c: 189.2 },
    { o: 189.2, h: 190.0, l: 188.6, c: 189.8 },
    { o: 189.8, h: 191.0, l: 189.4, c: 190.6 },
    { o: 190.6, h: 191.4, l: 190.0, c: 190.2 },
    { o: 190.2, h: 191.8, l: 190.1, c: 191.7 },
    { o: 191.7, h: 192.0, l: 190.8, c: 191.1 },
    { o: 191.1, h: 192.2, l: 190.9, c: 192.0 },
    { o: 192.0, h: 192.6, l: 191.5, c: 192.4 },
    { o: 192.4, h: 192.8, l: 191.6, c: 191.9 },
    { o: 191.9, h: 192.6, l: 191.0, c: 192.1 },
    { o: 192.1, h: 192.7, l: 191.4, c: 191.8 },
    { o: 191.8, h: 192.5, l: 191.2, c: 192.3 }
  ],
  "1h": [
    { o: 172.0, h: 174.2, l: 171.0, c: 173.6 },
    { o: 173.6, h: 175.4, l: 173.0, c: 174.8 },
    { o: 174.8, h: 176.1, l: 174.0, c: 175.3 },
    { o: 175.3, h: 175.9, l: 174.0, c: 174.5 },
    { o: 174.5, h: 177.0, l: 174.2, c: 176.4 },
    { o: 176.4, h: 178.2, l: 176.0, c: 177.6 },
    { o: 177.6, h: 178.8, l: 176.8, c: 177.0 },
    { o: 177.0, h: 179.2, l: 176.5, c: 178.7 },
    { o: 178.7, h: 180.4, l: 178.3, c: 180.0 },
    { o: 180.0, h: 181.6, l: 179.4, c: 180.9 },
    { o: 180.9, h: 182.0, l: 180.2, c: 181.4 },
    { o: 181.4, h: 183.0, l: 180.8, c: 182.7 },
    { o: 182.7, h: 184.0, l: 182.0, c: 183.5 },
    { o: 183.5, h: 184.4, l: 182.8, c: 183.0 },
    { o: 183.0, h: 184.8, l: 182.6, c: 184.6 },
    { o: 184.6, h: 186.2, l: 184.0, c: 185.7 },
    { o: 185.7, h: 187.4, l: 185.2, c: 186.9 },
    { o: 186.9, h: 188.0, l: 186.0, c: 186.3 },
    { o: 186.3, h: 188.6, l: 186.0, c: 188.2 },
    { o: 188.2, h: 189.6, l: 187.8, c: 189.0 },
    { o: 189.0, h: 190.4, l: 188.6, c: 189.8 },
    { o: 189.8, h: 191.0, l: 189.0, c: 190.4 },
    { o: 190.4, h: 191.6, l: 189.8, c: 190.8 },
    { o: 190.8, h: 192.2, l: 190.6, c: 191.5 },
    { o: 191.5, h: 192.0, l: 190.0, c: 190.6 },
    { o: 190.6, h: 192.0, l: 190.2, c: 191.8 },
    { o: 191.8, h: 193.0, l: 191.4, c: 192.4 },
    { o: 192.4, h: 193.2, l: 191.8, c: 192.6 }
  ],
  "1D": [
    { o: 160.0, h: 162.4, l: 158.6, c: 161.8 },
    { o: 161.8, h: 164.0, l: 161.0, c: 163.2 },
    { o: 163.2, h: 165.4, l: 162.4, c: 164.6 },
    { o: 164.6, h: 165.8, l: 162.8, c: 163.0 },
    { o: 163.0, h: 166.2, l: 162.6, c: 165.8 },
    { o: 165.8, h: 168.4, l: 165.2, c: 167.6 },
    { o: 167.6, h: 169.0, l: 166.4, c: 166.8 },
    { o: 166.8, h: 170.0, l: 166.2, c: 169.4 },
    { o: 169.4, h: 172.0, l: 169.0, c: 171.6 },
    { o: 171.6, h: 174.0, l: 170.8, c: 173.4 },
    { o: 173.4, h: 175.2, l: 172.6, c: 173.0 },
    { o: 173.0, h: 175.6, l: 172.4, c: 175.1 },
    { o: 175.1, h: 177.4, l: 174.6, c: 176.8 },
    { o: 176.8, h: 178.4, l: 176.2, c: 177.0 },
    { o: 177.0, h: 179.6, l: 176.4, c: 179.2 },
    { o: 179.2, h: 181.0, l: 178.6, c: 180.6 },
    { o: 180.6, h: 182.4, l: 179.8, c: 181.8 },
    { o: 181.8, h: 183.4, l: 181.0, c: 182.0 },
    { o: 182.0, h: 184.6, l: 181.6, c: 184.2 },
    { o: 184.2, h: 186.0, l: 183.6, c: 185.4 },
    { o: 185.4, h: 187.2, l: 184.8, c: 186.8 },
    { o: 186.8, h: 188.4, l: 186.0, c: 187.4 },
    { o: 187.4, h: 189.0, l: 186.6, c: 188.6 },
    { o: 188.6, h: 190.4, l: 188.0, c: 189.8 },
    { o: 189.8, h: 191.2, l: 188.4, c: 188.8 },
    { o: 188.8, h: 191.0, l: 188.0, c: 190.4 },
    { o: 190.4, h: 192.0, l: 189.8, c: 191.6 },
    { o: 191.6, h: 192.8, l: 190.8, c: 192.4 }
  ]
};

const timeAxisLabels: Record<Timeframe, string[]> = {
  "1m": ["09:30", "09:35", "09:40", "09:45", "09:50"],
  "5m": ["09:30", "10:30", "11:30", "12:30", "13:30"],
  "1h": ["Mon", "Tue", "Wed", "Thu", "Fri"],
  "1D": ["W-4", "W-3", "W-2", "W-1", "Now"]
};

export default function TradingViewChart({
  defaultPair = "EQT/USD",
  pairs = defaultPairs
}: {
  defaultPair?: string;
  pairs?: string[];
}) {
  const [timeframe, setTimeframe] = useState<Timeframe>("1D");
  const [pair, setPair] = useState(defaultPair);
  const [chartType, setChartType] = useState<ChartType>("candlestick");
  const [pairOpen, setPairOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setPairOpen(false);
      }
    }
    if (pairOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [pairOpen]);

  function changePair(next: string) {
    if (next === pair) {
      setPairOpen(false);
      return;
    }
    setPair(next);
    setPairOpen(false);
    setLoading(true);
    window.setTimeout(() => setLoading(false), 900);
  }

  const data = candleData[timeframe];
  const min = Math.min(...data.map((d) => d.l));
  const max = Math.max(...data.map((d) => d.h));
  const range = max - min || 1;
  const last = data[data.length - 1];
  const first = data[0];
  const chgPct = ((last.c - first.o) / first.o) * 100;
  const positive = chgPct >= 0;

  const width = 800;
  const height = 360;
  const padX = 18;
  const padY = 24;
  const innerH = height - padY * 2;
  const innerW = width - padX * 2;
  const colW = innerW / data.length;
  const bodyW = Math.max(2, colW * 0.6);

  function y(price: number): number {
    return padY + (1 - (price - min) / range) * innerH;
  }

  const linePath = data
    .map((d, i) => {
      const cx = padX + i * colW + colW / 2;
      return `${i === 0 ? "M" : "L"}${cx.toFixed(1)},${y(d.c).toFixed(1)}`;
    })
    .join(" ");

  const areaPath =
    linePath +
    ` L${(padX + (data.length - 1) * colW + colW / 2).toFixed(1)},${(padY + innerH).toFixed(1)}` +
    ` L${(padX + colW / 2).toFixed(1)},${(padY + innerH).toFixed(1)} Z`;

  const priceTicks = 5;
  const tickPrices = Array.from({ length: priceTicks }, (_, i) =>
    (max - (range * i) / (priceTicks - 1)).toFixed(2)
  );

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
            <span className={`ml-1 inline-flex items-center gap-1 text-[10px] font-black ${
              positive ? "text-emerald-400" : "text-rose-400"
            }`}>
              {positive ? "▲" : "▼"} {Math.abs(chgPct).toFixed(2)}%
            </span>
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
          {timeframes.map((tf) => (
            <button
              key={tf}
              type="button"
              onClick={() => setTimeframe(tf)}
              aria-pressed={tf === timeframe}
              className={`rounded-md px-3 py-1.5 text-xs font-black transition ${
                tf === timeframe
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
          {tickPrices.map((p) => (
            <span key={p} className="font-mono text-[10px] font-bold text-white/40">{p}</span>
          ))}
        </div>

        {/* Bottom time axis */}
        <div className="absolute left-0 right-14 bottom-0 z-[1] flex h-9 items-center justify-between border-t border-white/5 px-3">
          {timeAxisLabels[timeframe].map((t) => (
            <span key={t} className="font-mono text-[10px] font-bold text-white/40">{t}</span>
          ))}
        </div>

        {/* Chart SVG */}
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
              <circle cx={padX + (data.length - 1) * colW + colW / 2} cy={y(last.c)} r="4.5" fill="#22d3ee" />
              <circle cx={padX + (data.length - 1) * colW + colW / 2} cy={y(last.c)} r="10" fill="#22d3ee" opacity="0.25" className="animate-pulse-glow" />
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

        {/* Last-price label on right edge */}
        <div className="absolute right-1 z-[2] flex items-center" style={{ top: `calc(${(y(last.c) / height) * 100}% - 11px)` }}>
          <div className={`rounded-md px-2 py-0.5 text-[10px] font-black font-mono shadow-md ${
            positive ? "bg-emerald-500 text-white" : "bg-rose-500 text-white"
          }`}>
            {last.c.toFixed(2)}
          </div>
        </div>

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
            Loading {pair}…
          </p>
          <div className="mt-4 h-[3px] w-44 overflow-hidden rounded-full bg-white/10">
            <div className="animate-ticker-tape h-full w-1/2 bg-gradient-to-r from-transparent via-cyan-400 to-transparent" />
          </div>
        </div>
      </div>

      {/* OHLC footer */}
      <div className="grid grid-cols-2 gap-3 border-t border-white/10 bg-[#0f1729] px-4 py-3 sm:grid-cols-4 md:px-5">
        {[
          { label: "Open",  val: first.o.toFixed(2),                                                      tone: "text-white"          },
          { label: "High",  val: Math.max(...data.map((d) => d.h)).toFixed(2),                            tone: "text-emerald-300"    },
          { label: "Low",   val: Math.min(...data.map((d) => d.l)).toFixed(2),                            tone: "text-rose-300"       },
          { label: "Close", val: last.c.toFixed(2),                                                       tone: positive ? "text-emerald-300" : "text-rose-300" }
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
