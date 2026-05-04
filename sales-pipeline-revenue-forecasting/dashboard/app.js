const data = window.PIPELINE_DATA;
const money = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0
});
const number = new Intl.NumberFormat("en-US");

document.getElementById("generated-on").textContent = data.generated_on;

const metrics = [
  ["Total opportunities", number.format(data.summary.total_opportunities)],
  ["Total pipeline", money.format(data.summary.total_pipeline_value)],
  ["Open weighted pipeline", money.format(data.summary.open_weighted_pipeline)],
  ["Won revenue", money.format(data.summary.won_revenue)],
  ["Win rate", `${data.summary.win_rate_pct}%`],
  ["Avg sales cycle", `${data.summary.avg_sales_cycle_days} days`]
];

document.getElementById("metrics").innerHTML = metrics
  .map(([label, value]) => `
    <article class="metric">
      <div class="metric-label">${label}</div>
      <div class="metric-value">${value}</div>
    </article>
  `)
  .join("");

function setupCanvas(canvas) {
  const dpr = window.devicePixelRatio || 1;
  const rect = canvas.getBoundingClientRect();
  canvas.width = rect.width * dpr;
  canvas.height = rect.height * dpr;
  const ctx = canvas.getContext("2d");
  ctx.scale(dpr, dpr);
  return { ctx, width: rect.width, height: rect.height };
}

function drawAxes(ctx, width, height, maxValue) {
  ctx.strokeStyle = "#dde2dc";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(54, 18);
  ctx.lineTo(54, height - 42);
  ctx.lineTo(width - 18, height - 42);
  ctx.stroke();

  ctx.fillStyle = "#68736f";
  ctx.font = "12px system-ui";
  for (let i = 0; i <= 4; i += 1) {
    const y = 18 + ((height - 60) * i) / 4;
    const value = maxValue - (maxValue * i) / 4;
    ctx.fillText(formatCompact(value), 8, y + 4);
    ctx.strokeStyle = "#eef1ed";
    ctx.beginPath();
    ctx.moveTo(54, y);
    ctx.lineTo(width - 18, y);
    ctx.stroke();
  }
}

function formatCompact(value) {
  if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
  if (value >= 1000) return `$${Math.round(value / 1000)}K`;
  return `$${Math.round(value)}`;
}

function drawLineChart(canvas, rows) {
  const { ctx, width, height } = setupCanvas(canvas);
  ctx.clearRect(0, 0, width, height);
  const maxValue = Math.max(...rows.flatMap((row) => [row.trend_forecast, row.pipeline_adjusted_forecast])) * 1.15;
  drawAxes(ctx, width, height, maxValue);
  const plotWidth = width - 88;
  const plotHeight = height - 60;

  function point(row, index, key) {
    const x = 54 + (plotWidth * index) / Math.max(rows.length - 1, 1);
    const y = 18 + plotHeight - (plotHeight * row[key]) / maxValue;
    return [x, y];
  }

  function line(key, color) {
    ctx.strokeStyle = color;
    ctx.lineWidth = 3;
    ctx.beginPath();
    rows.forEach((row, index) => {
      const [x, y] = point(row, index, key);
      if (index === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();
  }

  line("trend_forecast", "#3e6f9f");
  line("pipeline_adjusted_forecast", "#26735b");

  ctx.fillStyle = "#68736f";
  ctx.font = "12px system-ui";
  rows.forEach((row, index) => {
    const [x] = point(row, index, "trend_forecast");
    ctx.fillText(row.month, x - 20, height - 18);
  });

  ctx.fillStyle = "#3e6f9f";
  ctx.fillRect(width - 250, 18, 10, 10);
  ctx.fillStyle = "#1f2623";
  ctx.fillText("Trend", width - 234, 28);
  ctx.fillStyle = "#26735b";
  ctx.fillRect(width - 160, 18, 10, 10);
  ctx.fillStyle = "#1f2623";
  ctx.fillText("Pipeline adjusted", width - 144, 28);
}

function drawBarChart(canvas, rows, labelKey, valueKey, color) {
  const { ctx, width, height } = setupCanvas(canvas);
  ctx.clearRect(0, 0, width, height);
  const maxValue = Math.max(...rows.map((row) => row[valueKey])) * 1.15;
  drawAxes(ctx, width, height, maxValue);
  const plotWidth = width - 90;
  const barGap = 10;
  const barWidth = Math.max(22, (plotWidth - barGap * (rows.length - 1)) / rows.length);
  const plotHeight = height - 60;

  rows.forEach((row, index) => {
    const barHeight = (plotHeight * row[valueKey]) / maxValue;
    const x = 58 + index * (barWidth + barGap);
    const y = 18 + plotHeight - barHeight;
    ctx.fillStyle = color;
    ctx.fillRect(x, y, barWidth, barHeight);
    ctx.fillStyle = "#68736f";
    ctx.font = "11px system-ui";
    const label = String(row[labelKey]).replace("Closed ", "");
    ctx.save();
    ctx.translate(x + barWidth / 2 - 2, height - 18);
    ctx.rotate(-Math.PI / 5);
    ctx.fillText(label, 0, 0);
    ctx.restore();
  });
}

drawLineChart(document.getElementById("forecast-chart"), data.tables.revenue_forecast);
drawBarChart(document.getElementById("funnel-chart"), data.tables.funnel_by_stage, "stage", "pipeline_value", "#3e6f9f");
drawBarChart(document.getElementById("source-chart"), data.tables.source_performance, "lead_source", "win_rate_pct", "#b9832f");

document.getElementById("rep-table").innerHTML = data.tables.rep_performance
  .map((rep) => `
    <tr>
      <td>${rep.sales_rep}</td>
      <td>${money.format(rep.won_revenue)}</td>
      <td>${rep.win_rate_pct}%</td>
      <td>${rep.avg_days_to_close}</td>
      <td>${money.format(rep.open_weighted_pipeline)}</td>
    </tr>
  `)
  .join("");

document.getElementById("recommendations").innerHTML = data.recommendations
  .map((item) => `<li>${item}</li>`)
  .join("");

window.addEventListener("resize", () => {
  drawLineChart(document.getElementById("forecast-chart"), data.tables.revenue_forecast);
  drawBarChart(document.getElementById("funnel-chart"), data.tables.funnel_by_stage, "stage", "pipeline_value", "#3e6f9f");
  drawBarChart(document.getElementById("source-chart"), data.tables.source_performance, "lead_source", "win_rate_pct", "#b9832f");
});
