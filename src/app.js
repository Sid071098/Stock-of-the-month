import { buildDailySnapshot, sourceCatalog } from "./data.js";
import { formatChange, formatRate, summarizeRates } from "./summary.js";

const regionFilter = document.querySelector("#region-filter");
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
renderSources();
renderDashboard();

regionFilter.addEventListener("change", renderDashboard);
refreshButton.addEventListener("click", () => {
  rates = buildDailySnapshot();
  renderDashboard();
});

function renderStateOptions() {
  const uniqueStates = ["All states", ...new Set(rates.map((entry) => entry.region))];

  regionFilter.replaceChildren(
    ...uniqueStates.map((region) => {
      const option = document.createElement("option");
      option.value = region;
      option.textContent = region;
      return option;
    }),
  );
}

function renderDashboard() {
  const selectedRegion = regionFilter.value || "All states";
  const visibleRates =
    selectedRegion === "All states"
      ? rates
      : rates.filter((entry) => entry.region === selectedRegion);
  const summary = summarizeRates(visibleRates, selectedRegion);

  headlineDate.textContent = `Indian cotton mandi overview for ${new Intl.DateTimeFormat("en-IN", {
    dateStyle: "full",
    timeZone: "Asia/Kolkata",
  }).format(new Date())}`;

  spreadValue.textContent = summary.spread;
  spreadText.textContent =
    visibleRates.length > 0
      ? `${summary.topMarket} to ${summary.bottomMarket} across ${visibleRates.length} tracked mandis`
      : "No spread available for this state selection";

  averageRate.textContent = summary.averageRate;
  averageCaption.textContent = `${selectedRegion} daily average based on the latest mandi readings.`;

  topMarket.textContent = summary.topMarket;
  topCaption.textContent = visibleRates.length
    ? `${summary.topMarket} is trading at the top end of the monitored market today.`
    : "No top mandi available.";

  bottomMarket.textContent = summary.bottomMarket;
  bottomCaption.textContent = visibleRates.length
    ? `${summary.bottomMarket} is quoting the lowest level in this state slice.`
    : "No lower mandi available.";

  trendBias.textContent = summary.trendLabel;
  trendCaption.textContent = summary.headline;
  sourceCount.textContent = `${visibleRates.length} mandis`;

  renderSummary(summary);
  renderTable(visibleRates);
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

function renderTable(visibleRates) {
  ratesTable.replaceChildren(
    ...visibleRates.map((entry) => {
      const row = document.createElement("tr");
      const moveClass = entry.change > 0 ? "up" : entry.change < 0 ? "down" : "flat";
      const sourceName = entry.source?.name ?? "Pending source";

      row.innerHTML = `
        <td>
          <strong>${entry.market}</strong>
          <span class="subcell">${entry.district}</span>
        </td>
        <td>${entry.region}</td>
        <td>${formatRate(entry.rate, entry.unit)}</td>
        <td><span class="move ${moveClass}">${formatChange(entry.change)}</span></td>
        <td>${formatUpdatedAt(entry.updatedAt)}</td>
        <td>${sourceName}</td>
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
