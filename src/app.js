import { buildDailySnapshot, getDistrictsForState, sourceCatalog } from "./data.js";
import { formatChange, formatRate, summarizeRates } from "./summary.js";

const stateFilter = document.querySelector("#state-filter");
const districtFilter = document.querySelector("#district-filter");
const refreshButton = document.querySelector("#refresh-button");
const headlineDate = document.querySelector("#headline-date");
const spreadValue = document.querySelector("#spread-value");
const spreadText = document.querySelector("#spread-text");
const averageRate = document.querySelector("#average-rate");
const averageCaption = document.querySelector("#average-caption");
const topMarket = document.querySelector("#top-market");
const topCaption = document.querySelector("#top-caption");
const bottomMarket = document.querySelector("#bottom-market");
const bottomCaption = document.querySelector("#bottom-caption");
const trendBias = document.querySelector("#trend-bias");
const trendCaption = document.querySelector("#trend-caption");
const summaryOutput = document.querySelector("#summary-output");
const sourceCount = document.querySelector("#source-count");
const ratesTable = document.querySelector("#rates-table");
const sourceGrid = document.querySelector("#source-grid");

let rates = buildDailySnapshot();

renderStateOptions();
renderDistrictOptions();
renderSources();
renderDashboard();

stateFilter.addEventListener("change", () => {
  renderDistrictOptions();
  renderDashboard();
});
districtFilter.addEventListener("change", renderDashboard);
refreshButton.addEventListener("click", () => {
  rates = buildDailySnapshot();
  renderStateOptions();
  renderDistrictOptions();
  renderDashboard();
});

function renderStateOptions() {
  const uniqueStates = ["All states", ...new Set(rates.map((entry) => entry.state))];
  const currentValue = stateFilter.value;

  stateFilter.replaceChildren(
    ...uniqueStates.map((state) => {
      const option = document.createElement("option");
      option.value = state;
      option.textContent = state;
      return option;
    }),
  );

  stateFilter.value = uniqueStates.includes(currentValue) ? currentValue : "All states";
}

function renderDistrictOptions() {
  const selectedState = stateFilter.value || "All states";
  const uniqueDistricts =
    selectedState === "All states"
      ? ["All districts"]
      : ["All districts", ...getDistrictsForState(selectedState)];
  const currentValue = districtFilter.value;

  districtFilter.replaceChildren(
    ...uniqueDistricts.map((district) => {
      const option = document.createElement("option");
      option.value = district;
      option.textContent = district;
      return option;
    }),
  );

  districtFilter.value = uniqueDistricts.includes(currentValue) ? currentValue : "All districts";
}

function renderDashboard() {
  const selectedState = stateFilter.value || "All states";
  const selectedDistrict = districtFilter.value || "All districts";
  const districtRows = buildDistrictRows(selectedState, selectedDistrict);
  const ratedDistricts = districtRows.filter((entry) => entry.rate !== null);
  const summary = summarizeRates(ratedDistricts, buildScopeLabel(selectedState, selectedDistrict));

  headlineDate.textContent = `Indian cotton mandi overview for ${new Intl.DateTimeFormat("en-IN", {
    dateStyle: "full",
    timeZone: "Asia/Kolkata",
  }).format(new Date())}`;

  spreadValue.textContent = summary.spread;
  spreadText.textContent =
    ratedDistricts.length > 0
      ? `${summary.topMarket} to ${summary.bottomMarket} across ${ratedDistricts.length} rated districts`
      : "No spread available for this location selection";

  averageRate.textContent = summary.averageRate;
  averageCaption.textContent = `${buildCaptionLabel(selectedState, selectedDistrict)} daily average based on the latest mandi readings.`;

  topMarket.textContent = summary.topMarket;
  topCaption.textContent = ratedDistricts.length
    ? `${summary.topMarket} is trading at the top end of the monitored district view today.`
    : "No top district available.";

  bottomMarket.textContent = summary.bottomMarket;
  bottomCaption.textContent = ratedDistricts.length
    ? `${summary.bottomMarket} is quoting the lowest level in this district slice.`
    : "No lower district available.";

  trendBias.textContent = summary.trendLabel;
  trendCaption.textContent = summary.headline;
  sourceCount.textContent = `${ratedDistricts.length}/${districtRows.length} districts`;

  renderSummary(summary);
  renderTable(districtRows);
}

function renderSummary(summary) {
  const fragment = document.createDocumentFragment();
  const headline = document.createElement("p");
  headline.className = "summary-headline";
  headline.textContent = summary.headline;
  fragment.appendChild(headline);

  const list = document.createElement("ul");
  list.className = "summary-list";

  summary.bullets.forEach((item) => {
    const listItem = document.createElement("li");
    listItem.textContent = item;
    list.appendChild(listItem);
  });

  fragment.appendChild(list);
  summaryOutput.replaceChildren(fragment);
}

function renderTable(districtRows) {
  ratesTable.replaceChildren(
    ...districtRows.map((entry) => {
      const row = document.createElement("tr");
      const moveClass = entry.change > 0 ? "up" : entry.change < 0 ? "down" : "flat";
      row.className = "table-row";

      const rateCell =
        entry.rate === null ? '<span class="empty-copy">No mandi rate yet</span>' : formatRate(entry.rate, entry.unit);
      const changeCell =
        entry.change === null
          ? '<span class="move flat">--</span>'
          : `<span class="move ${moveClass}">${formatChange(entry.change)}</span>`;
      const updatedCell = entry.updatedAt ? formatUpdatedAt(entry.updatedAt) : "--";
      const coverage = entry.marketCount > 0 ? `${entry.marketCount} mandi${entry.marketCount > 1 ? "s" : ""}` : "Awaiting feed";

      row.innerHTML = `
        <td>
          <strong class="market-name">${entry.market}</strong>
          <span class="subcell">${entry.marketCount > 0 ? "District rate available" : "No reported cotton mandi today"}</span>
        </td>
        <td><span class="state-chip">${entry.state}</span></td>
        <td><span class="district-chip">${entry.district}</span></td>
        <td>${rateCell}</td>
        <td>${changeCell}</td>
        <td>${coverage}</td>
        <td>${updatedCell}</td>
        <td>${entry.coverageLabel}</td>
      `;

      return row;
    }),
  );
}

function renderSources() {
  sourceGrid.replaceChildren(
    ...sourceCatalog.map((source) => {
      const article = document.createElement("article");
      article.className = "source-card";
      article.innerHTML = `
        <div class="source-head">
          <p class="source-name">${source.name}</p>
          <span class="status ${source.status}">${source.status}</span>
        </div>
        <p class="source-region">${source.state}</p>
        <p class="source-note">${source.note}</p>
      `;
      return article;
    }),
  );
}

function formatUpdatedAt(value) {
  return new Intl.DateTimeFormat("en-IN", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZone: "Asia/Kolkata",
  }).format(new Date(value));
}

function buildScopeLabel(selectedState, selectedDistrict) {
  if (selectedState === "All states" && selectedDistrict === "All districts") {
    return "Indian";
  }

  if (selectedState !== "All states" && selectedDistrict === "All districts") {
    return selectedState;
  }

  if (selectedState !== "All states" && selectedDistrict !== "All districts") {
    return `${selectedDistrict}, ${selectedState}`;
  }

  return selectedDistrict;
}

function buildCaptionLabel(selectedState, selectedDistrict) {
  if (selectedState === "All states" && selectedDistrict === "All districts") {
    return "All India";
  }

  if (selectedState !== "All states" && selectedDistrict === "All districts") {
    return selectedState;
  }

  if (selectedState !== "All states" && selectedDistrict !== "All districts") {
    return `${selectedDistrict} in ${selectedState}`;
  }

  return selectedDistrict;
}

function buildDistrictRows(selectedState, selectedDistrict) {
  if (selectedState === "All states") {
    return buildAggregatedDistrictRows(
      rates.filter((entry) => selectedDistrict === "All districts" || entry.district === selectedDistrict),
    );
  }

  const districts = getDistrictsForState(selectedState);
  const scopedDistricts =
    selectedDistrict === "All districts"
      ? districts
      : districts.filter((district) => district === selectedDistrict);

  return scopedDistricts.map((district) => {
    const matches = rates.filter((entry) => entry.state === selectedState && entry.district === district);
    return buildDistrictRow(selectedState, district, matches);
  });
}

function buildAggregatedDistrictRows(entries) {
  const groups = new Map();

  entries.forEach((entry) => {
    const key = `${entry.state}::${entry.district}`;
    const bucket = groups.get(key) ?? [];
    bucket.push(entry);
    groups.set(key, bucket);
  });

  return [...groups.entries()]
    .map(([key, group]) => {
      const [state, district] = key.split("::");
      return buildDistrictRow(state, district, group);
    })
    .sort((left, right) => left.state.localeCompare(right.state) || left.district.localeCompare(right.district));
}

function buildDistrictRow(state, district, matches) {
  if (matches.length === 0) {
    return {
      market: district,
      district,
      state,
      rate: null,
      change: null,
      updatedAt: null,
      unit: "quintal",
      marketCount: 0,
      coverageLabel: "No live cotton rate",
    };
  }

  const totalRate = matches.reduce((sum, entry) => sum + entry.rate, 0);
  const totalChange = matches.reduce((sum, entry) => sum + entry.change, 0);
  const latestEntry = [...matches].sort(
    (left, right) => new Date(right.updatedAt).getTime() - new Date(left.updatedAt).getTime(),
  )[0];

  return {
    market: district,
    district,
    state,
    rate: Math.round(totalRate / matches.length),
    change: Math.round(totalChange / matches.length),
    updatedAt: latestEntry.updatedAt,
    unit: latestEntry.unit,
    marketCount: matches.length,
    coverageLabel: latestEntry.source?.name ?? "Mandi feed",
  };
}
