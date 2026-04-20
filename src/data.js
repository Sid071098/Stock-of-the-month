export const sourceCatalog = [
  {
    id: "ice-us",
    name: "ICE Futures U.S.",
    region: "North America",
    status: "connected",
    note: "Benchmark futures snapshot for U.S. cotton trading.",
  },
  {
    id: "mcx-india",
    name: "MCX / India spot desks",
    region: "Asia",
    status: "connected",
    note: "Useful for domestic India cotton and yarn-linked pricing.",
  },
  {
    id: "zhengzhou",
    name: "Zhengzhou Commodity Exchange",
    region: "Asia",
    status: "watching",
    note: "China market direction and regional demand signal.",
  },
  {
    id: "brazil-export",
    name: "Brazil export offers",
    region: "South America",
    status: "connected",
    note: "Exporter pricing for Latin American shipments.",
  },
  {
    id: "pakistan-spot",
    name: "Pakistan spot market",
    region: "Asia",
    status: "watching",
    note: "Captures mill buying and ginner selling activity.",
  },
  {
    id: "africa-merchant",
    name: "West Africa merchant board",
    region: "Africa",
    status: "planned",
    note: "Reserved for merchant and export tender rate ingestion.",
  },
];

export const baseRates = [
  {
    market: "Memphis",
    country: "United States",
    region: "North America",
    sourceId: "ice-us",
    currency: "USD",
    unit: "bale",
    rate: 91.4,
    previousRate: 89.8,
    updatedAt: "2026-04-20T08:10:00-04:00",
  },
  {
    market: "Gujarat",
    country: "India",
    region: "Asia",
    sourceId: "mcx-india",
    currency: "USD",
    unit: "candy",
    rate: 86.2,
    previousRate: 87.1,
    updatedAt: "2026-04-20T17:35:00+05:30",
  },
  {
    market: "Shandong",
    country: "China",
    region: "Asia",
    sourceId: "zhengzhou",
    currency: "USD",
    unit: "bale",
    rate: 94.1,
    previousRate: 93.4,
    updatedAt: "2026-04-20T20:15:00+08:00",
  },
  {
    market: "Mato Grosso",
    country: "Brazil",
    region: "South America",
    sourceId: "brazil-export",
    currency: "USD",
    unit: "bale",
    rate: 88.7,
    previousRate: 87.3,
    updatedAt: "2026-04-20T10:25:00-03:00",
  },
  {
    market: "Punjab",
    country: "Pakistan",
    region: "Asia",
    sourceId: "pakistan-spot",
    currency: "USD",
    unit: "bale",
    rate: 84.9,
    previousRate: 85.2,
    updatedAt: "2026-04-20T18:20:00+05:00",
  },
  {
    market: "Alexandria",
    country: "Egypt",
    region: "Africa",
    sourceId: "africa-merchant",
    currency: "USD",
    unit: "bale",
    rate: 92.6,
    previousRate: 90.5,
    updatedAt: "2026-04-20T15:00:00+02:00",
  },
];

export function getSourceById(sourceId) {
  return sourceCatalog.find((source) => source.id === sourceId) ?? null;
}

export function buildDailySnapshot() {
  return baseRates.map((entry, index) => {
    const offset = ((index % 3) - 1) * 0.4;
    const rate = Number((entry.rate + offset).toFixed(2));
    const previousRate = entry.rate;

    return {
      ...entry,
      rate,
      previousRate,
      change: Number((rate - previousRate).toFixed(2)),
      source: getSourceById(entry.sourceId),
    };
  });
}
