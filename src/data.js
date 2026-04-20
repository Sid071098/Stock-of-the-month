export const sourceCatalog = [
  {
    id: "agmarknet",
    name: "AGMARKNET mandi feed",
    state: "Pan India",
    status: "connected",
    note: "Primary mandi arrivals and commodity pricing feed for daily spot rates.",
  },
  {
    id: "mcx-kapas",
    name: "MCX Kapas contracts",
    state: "Pan India",
    status: "connected",
    note: "Useful benchmark for futures sentiment and next-session direction.",
  },
  {
    id: "gujarat-ginners",
    name: "Gujarat ginner circulars",
    state: "Gujarat",
    status: "watching",
    note: "Captures Rajkot, Gondal, and Surendranagar trade indications.",
  },
  {
    id: "maharashtra-mills",
    name: "Maharashtra mill desk",
    state: "Maharashtra",
    status: "watching",
    note: "Tracks mill-side buying interest across Vidarbha and Marathwada.",
  },
  {
    id: "telangana-traders",
    name: "Telangana trader network",
    state: "Telangana",
    status: "connected",
    note: "Daily price checks from Warangal and Adilabad belt traders.",
  },
  {
    id: "punjab-auctions",
    name: "Punjab auction boards",
    state: "Punjab",
    status: "planned",
    note: "Reserved for daily auction and private procurement updates.",
  },
];

export const baseRates = [
  {
    market: "Rajkot",
    district: "Rajkot",
    state: "Gujarat",
    sourceId: "gujarat-ginners",
    currency: "INR",
    unit: "quintal",
    rate: 7350,
    previousRate: 7280,
    updatedAt: "2026-04-20T17:40:00+05:30",
  },
  {
    market: "Gondal",
    district: "Rajkot",
    state: "Gujarat",
    sourceId: "agmarknet",
    currency: "INR",
    unit: "quintal",
    rate: 7285,
    previousRate: 7310,
    updatedAt: "2026-04-20T17:25:00+05:30",
  },
  {
    market: "Surendranagar",
    district: "Surendranagar",
    state: "Gujarat",
    sourceId: "agmarknet",
    currency: "INR",
    unit: "quintal",
    rate: 7240,
    previousRate: 7205,
    updatedAt: "2026-04-20T17:15:00+05:30",
  },
  {
    market: "Akola",
    district: "Akola",
    state: "Maharashtra",
    sourceId: "maharashtra-mills",
    currency: "INR",
    unit: "quintal",
    rate: 7120,
    previousRate: 7050,
    updatedAt: "2026-04-20T17:55:00+05:30",
  },
  {
    market: "Yavatmal",
    district: "Yavatmal",
    state: "Maharashtra",
    sourceId: "agmarknet",
    currency: "INR",
    unit: "quintal",
    rate: 7065,
    previousRate: 7090,
    updatedAt: "2026-04-20T17:10:00+05:30",
  },
  {
    market: "Warangal",
    district: "Hanamkonda",
    state: "Telangana",
    sourceId: "telangana-traders",
    currency: "INR",
    unit: "quintal",
    rate: 7440,
    previousRate: 7395,
    updatedAt: "2026-04-20T18:05:00+05:30",
  },
  {
    market: "Adilabad",
    district: "Adilabad",
    state: "Telangana",
    sourceId: "agmarknet",
    currency: "INR",
    unit: "quintal",
    rate: 7215,
    previousRate: 7180,
    updatedAt: "2026-04-20T17:20:00+05:30",
  },
  {
    market: "Sirsa",
    district: "Sirsa",
    state: "Haryana",
    sourceId: "mcx-kapas",
    currency: "INR",
    unit: "quintal",
    rate: 7525,
    previousRate: 7490,
    updatedAt: "2026-04-20T16:50:00+05:30",
  },
  {
    market: "Bathinda",
    district: "Bathinda",
    state: "Punjab",
    sourceId: "punjab-auctions",
    currency: "INR",
    unit: "quintal",
    rate: 7480,
    previousRate: 7515,
    updatedAt: "2026-04-20T16:40:00+05:30",
  },
  {
    market: "Hanumangarh",
    district: "Hanumangarh",
    state: "Rajasthan",
    sourceId: "agmarknet",
    currency: "INR",
    unit: "quintal",
    rate: 7390,
    previousRate: 7360,
    updatedAt: "2026-04-20T17:00:00+05:30",
  },
];

export function getSourceById(sourceId) {
  return sourceCatalog.find((source) => source.id === sourceId) ?? null;
}

export function buildDailySnapshot() {
  return baseRates.map((entry, index) => {
    const offset = ((index % 4) - 1.5) * 12;
    const rate = Math.round(entry.rate + offset);
    const previousRate = entry.rate;

    return {
      ...entry,
      rate,
      previousRate,
      change: rate - previousRate,
      source: getSourceById(entry.sourceId),
    };
  });
}
