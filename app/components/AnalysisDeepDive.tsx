"use client";

import { useState } from "react";

type Competitor = {
  edge: string;
  name: string;
  ticker: string;
};

const deepDiveCards = [
  {
    title: "The Thesis",
    body: "EQT sits at the center of two demand tailwinds: LNG exports and AI data center electricity growth. LNG exports globalize U.S. gas demand, while AI infrastructure can support long-duration gas-fired generation needs."
  },
  {
    title: "Vertical Integration",
    body: "The Equitrans acquisition gives EQT more control over gathering, pipes, and transportation. Owning more of the route from wellhead to customer can reduce bottlenecks and lower delivered costs."
  },
  {
    title: "Management Alignment",
    body: "CEO Toby Rice owns substantial stock, receives a $1 salary, and is compensated primarily through performance-based incentives. That creates a cleaner alignment between management execution and shareholder outcomes."
  },
  {
    title: "Risk Frame",
    body: "Natural gas prices can remain volatile, and pipeline or commodity cycles can pressure results. The thesis depends on EQT maintaining cost leadership while LNG and power-demand catalysts develop."
  }
];

export default function AnalysisDeepDive({ competitors }: { competitors: Competitor[] }) {
  const [selectedCard, setSelectedCard] = useState(0);
  const [selectedCompetitor, setSelectedCompetitor] = useState(0);

  return (
    <section className="mt-6 rounded-md border border-slate-200 bg-white p-6 shadow-xl">
      <p className="text-sm font-black uppercase tracking-[0.18em] text-[#ff4f00]">Analysis Deep-Dive</p>
      <h2 className="mt-3 text-2xl font-black text-slate-950">Why this is the best pick of the month</h2>

      <div className="mt-6 grid gap-5 lg:grid-cols-2">
        {deepDiveCards.map((card, index) => (
          <button
            key={card.title}
            className={`rounded-md border p-5 text-left transition hover:-translate-y-0.5 hover:border-orange-200 hover:bg-orange-50/70 focus:outline-none focus:ring-4 focus:ring-orange-100 ${
              selectedCard === index
                ? "border-[#ff4f00] bg-orange-50 shadow-md ring-2 ring-orange-100"
                : "border-slate-200 bg-[#f8fafc]"
            }`}
            onClick={() => setSelectedCard(index)}
            type="button"
          >
            <h3 className="text-lg font-black text-slate-950">{card.title}</h3>
            <p className="mt-3 text-base leading-relaxed text-slate-600">{card.body}</p>
          </button>
        ))}
      </div>

      <div className="mt-6 rounded-md border border-slate-200 bg-[#f8fafc] p-5">
        <h3 className="text-lg font-black text-slate-950">Competitive Landscape</h3>
        <p className="mt-2 text-sm leading-relaxed text-slate-600">
          Select a company to highlight how EQT compares against its closest natural gas peers.
        </p>
        <div className="mt-4 grid gap-3 lg:grid-cols-3">
          {competitors.map((competitor, index) => (
            <button
              key={competitor.ticker}
              className={`rounded-md border p-4 text-left transition hover:-translate-y-0.5 hover:border-emerald-200 hover:bg-emerald-50/70 focus:outline-none focus:ring-4 focus:ring-emerald-100 ${
                selectedCompetitor === index
                  ? "border-emerald-400 bg-emerald-50 shadow-md ring-2 ring-emerald-100"
                  : "border-slate-200 bg-white"
              }`}
              onClick={() => setSelectedCompetitor(index)}
              type="button"
            >
              <p className="text-sm font-black text-[#ff4f00]">
                {competitor.name} ({competitor.ticker})
              </p>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">{competitor.edge}</p>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
