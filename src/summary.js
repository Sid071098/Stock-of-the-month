function formatMoney(value) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(value);
}

function formatSigned(value) {
  const formatted = Math.abs(value).toFixed(2);
  if (value > 0) {
    return `+${formatted}`;
  }

  if (value < 0) {
    return `-${formatted}`;
  }

  return formatted;
}

export function summarizeRates(rates, region = "All regions") {
  if (!rates.length) {
    return {
      averageRate: "--",
      spread: "--",
      topMarket: "No data",
      bottomMarket: "No data",
      trendLabel: "Insufficient data",
      headline: "No cotton rates available for the current selection.",
      bullets: [
        "Connect a source feed or broaden the region filter to generate the daily summary.",
      ],
    };
  }

  const sortedByRate = [...rates].sort((left, right) => right.rate - left.rate);
  const sortedByMove = [...rates].sort((left, right) => right.change - left.change);
  const total = rates.reduce((sum, rate) => sum + rate.rate, 0);
  const average = total / rates.length;
  const highest = sortedByRate[0];
  const lowest = sortedByRate[sortedByRate.length - 1];
  const strongestMove = sortedByMove[0];
  const weakestMove = sortedByMove[sortedByMove.length - 1];
  const advancing = rates.filter((entry) => entry.change > 0).length;
  const declining = rates.filter((entry) => entry.change < 0).length;
  const spread = highest.rate - lowest.rate;

  let trendLabel = "Balanced";
  if (advancing > declining) {
    trendLabel = "Bullish";
  } else if (declining > advancing) {
    trendLabel = "Softening";
  }

  const regionLabel = region === "All regions" ? "global" : region.toLowerCase();
  const headline =
    `${region} cotton markets averaged ${formatMoney(average)} today, ` +
    `with ${highest.market} leading and ${lowest.market} offering the lowest quote.`;

  const bullets = [
    `${highest.market}, ${highest.country} is the priciest monitored market at ${formatMoney(highest.rate)}, ` +
      `creating a ${formatMoney(spread)} spread versus ${lowest.market}.`,
    `${strongestMove.market} posted the strongest daily move at ${formatSigned(strongestMove.change)}, ` +
      `while ${weakestMove.market} was the softest at ${formatSigned(weakestMove.change)}.`,
    `${advancing} of ${rates.length} tracked markets improved today, which gives the ${regionLabel} tape a ${trendLabel.toLowerCase()} bias.`,
  ];

  return {
    averageRate: formatMoney(average),
    spread: formatMoney(spread),
    topMarket: highest.market,
    bottomMarket: lowest.market,
    trendLabel,
    headline,
    bullets,
  };
}

export function formatRate(value, unit) {
  return `${formatMoney(value)} / ${unit}`;
}

export function formatChange(value) {
  return formatSigned(value);
}
