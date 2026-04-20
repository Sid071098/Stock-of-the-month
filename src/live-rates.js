const DATA_GOV_RESOURCE_ID = "9ef84268-d588-465a-a308-a864a43d0070";
const DATA_GOV_API_KEY = "579b464db66ec23bdd000001cdd3946e44ce4aad7209ff7b23ac571b";
const API_BASE_URL = `https://api.data.gov.in/resource/${DATA_GOV_RESOURCE_ID}`;
const PAGE_LIMIT = 10;
const MAX_PAGES = 25;

export async function fetchCottonRatesForState(state, options = {}) {
  const records = [];

  for (let page = 0; page < MAX_PAGES; page += 1) {
    const url = new URL(API_BASE_URL);
    url.searchParams.set("api-key", DATA_GOV_API_KEY);
    url.searchParams.set("format", "json");
    url.searchParams.set("offset", String(page * PAGE_LIMIT));
    url.searchParams.set("limit", String(PAGE_LIMIT));
    url.searchParams.set("filters[state]", state);
    url.searchParams.set("filters[commodity]", "Cotton");

    const response = await fetch(url, {
      signal: options.signal,
      headers: {
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Live rate request failed with status ${response.status}`);
    }

    const payload = await response.json();
    const pageRecords = Array.isArray(payload.records) ? payload.records : [];

    records.push(...pageRecords.map(normalizeLiveRecord).filter(Boolean));

    if (pageRecords.length < PAGE_LIMIT) {
      break;
    }
  }

  return dedupeLiveRecords(records);
}

function normalizeLiveRecord(record) {
  const state = readField(record, ["state", "State"]);
  const district = readField(record, ["district", "District"]);
  const market = readField(record, ["market", "Market"]);
  const commodity = readField(record, ["commodity", "Commodity"]);
  const arrivalDate = readField(record, ["arrival_date", "Arrival_Date", "arrival date"]);
  const modalPrice = readNumber(record, ["modal_price", "Modal_Price", "modal price"]);
  const minPrice = readNumber(record, ["min_price", "Min_Price", "min price"]);
  const maxPrice = readNumber(record, ["max_price", "Max_Price", "max price"]);

  if (!state || !district || !market || !commodity || !Number.isFinite(modalPrice)) {
    return null;
  }

  if (!commodity.toLowerCase().includes("cotton")) {
    return null;
  }

  return {
    state: sanitizeName(state),
    district: sanitizeName(district),
    market: sanitizeName(market),
    commodity: commodity.trim(),
    rate: Math.round(modalPrice),
    previousRate: Math.round(modalPrice),
    change: 0,
    currency: "INR",
    unit: "quintal",
    updatedAt: normalizeArrivalDate(arrivalDate),
    source: {
      name: "data.gov.in / AGMARKNET",
    },
    sourceId: "agmarknet-live",
    live: true,
    maxPrice: Number.isFinite(maxPrice) ? Math.round(maxPrice) : null,
  };
}

function dedupeLiveRecords(records) {
  const latestByMarket = new Map();

  records.forEach((record) => {
    const key = `${record.state}::${record.district}::${record.market}`;
    const current = latestByMarket.get(key);

    if (!current) {
      latestByMarket.set(key, record);
      return;
    }

    if (new Date(record.updatedAt).getTime() >= new Date(current.updatedAt).getTime()) {
      latestByMarket.set(key, record);
    }
  });

  return [...latestByMarket.values()];
}

function readField(record, keys) {
  for (const key of keys) {
    const value = record[key];
    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }
  }

  return "";
}

function readNumber(record, keys) {
  const value = readField(record, keys);
  if (!value) {
    return Number.NaN;
  }

  const normalized = value.replace(/,/g, "");
  return Number(normalized);
}

function normalizeArrivalDate(value) {
  if (!value) {
    return new Date().toISOString();
  }

  const parts = value.split("/");
  if (parts.length === 3) {
    const [day, month, year] = parts;
    return new Date(`${year}-${month}-${day}T12:00:00+05:30`).toISOString();
  }

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? new Date().toISOString() : date.toISOString();
}

function sanitizeName(value) {
  return value
    .replace(/\s+/g, " ")
    .replace(/\bDist\.\b/gi, "")
    .trim();
}
