function formatMoney(value) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}

function formatSigned(value) {
  const formatted = Math.abs(value).toLocaleString("en-IN");
  if (value > 0) {
    return `+${formatted}`;
  }

  if (value < 0) {
    return `-${formatted}`;
  }

  return formatted;
}

export function summarizeRates(rates, region = "All states") {
  if (!rates.length) {
    return {
      averageRate: "--",
      spread: "--",
      topMarket: "No data",
      bottomMarket: "No data",
      trendLabel: "Insufficient data",
      headline: "No Indian cotton mandi rates are available for the current selection.",
      bullets: [
        "Connect a mandi source feed or broaden the state filter to generate the daily market note.",
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

  let trendLabel = "Stable";
  if (advancing > declining) {
    trendLabel = "Firm";
  } else if (declining > advancing) {
    trendLabel = "Weak";
  }

  const scopeLabel = region === "All states" ? "Indian" : `${region}`;
  const headline =
    `${scopeLabel} cotton markets averaged ${formatMoney(average)} per quintal today, ` +
    `with ${highest.market} trading strongest and ${lowest.market} quoting the lowest level.`;

  const bullets = [
    `${highest.market} in ${highest.region} is the highest tracked mandi at ${formatMoney(highest.rate)} per quintal, ` +
      `leaving a spread of ${formatMoney(spread)} against ${lowest.market}.`,
    `${strongestMove.market} showed the best day-on-day move at ${formatSigned(strongestMove.change)}, ` +
      `while ${weakestMove.market} saw the softest move at ${formatSigned(weakestMove.change)}.`,
    `${advancing} of ${rates.length} tracked mandis moved up today, which keeps the ${scopeLabel.toLowerCase()} cotton tone ${trendLabel.toLowerCase()}.`,
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
