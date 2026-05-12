export type MonthlyPick = {
  change: string;
  month: string;
  name: string;
  price: string;
  rating: string;
  sector: string;
  summary: string;
  thesis: string;
  ticker: string;
};

export type QualityPick = {
  change: string;
  name: string;
  price: string;
  sector: string;
  tag: string;
  thesis: string;
  ticker: string;
};

export const defaultMonthlyPick: MonthlyPick = {
  ticker: "EQT",
  name: "EQT",
  sector: "Upstream Natural Gas E&P",
  price: "$56.45",
  change: "+0.88%",
  rating: "Active Buy",
  month: "May 2026",
  thesis:
    "EQT is this month's stock pick, focused on low-cost natural gas production and operating leverage if commodity prices improve.",
  summary:
    "EQT operates in the Appalachian Basin and gives subscribers a timely energy infrastructure idea to evaluate through cost position, cash flow sensitivity, balance sheet discipline, and natural gas demand catalysts."
};

export const defaultQualityPicks: QualityPick[] = [
  {
    ticker: "SHOP",
    name: "Shopify",
    sector: "E-commerce Software",
    price: "$102.52",
    change: "-7.20%",
    tag: "High Quality",
    thesis: "A commerce infrastructure platform with broad merchant reach, multiple sales channels, and strong long-term revenue growth potential."
  },
  {
    ticker: "MNDY",
    name: "monday.com",
    sector: "Project Management Software",
    price: "$76.92",
    change: "+6.58%",
    tag: "High Quality",
    thesis: "A work operating system with rapid revenue growth, strong adoption, and a product-led workflow platform used across teams."
  },
  {
    ticker: "SANM",
    name: "Sanmina",
    sector: "Electrical Systems",
    price: "$245.44",
    change: "-1.23%",
    tag: "High Quality",
    thesis: "An electronics manufacturing services company with improving fundamentals and exposure to complex industrial supply chains."
  },
  {
    ticker: "STRL",
    name: "Sterling",
    sector: "Engineering and Design Services",
    price: "$868.17",
    change: "+2.91%",
    tag: "High Quality",
    thesis: "A civil infrastructure construction business with strong momentum, healthy profitability, and durable project demand."
  },
  {
    ticker: "KLAC",
    name: "KLA Corporation",
    sector: "Semiconductor Manufacturing",
    price: "$1,845.00",
    change: "-1.29%",
    tag: "High Quality",
    thesis: "A semiconductor equipment leader focused on process control, inspection, and measurement tools for advanced chip production."
  },
  {
    ticker: "PM",
    name: "Philip Morris",
    sector: "Beverages, Alcohol, and Tobacco",
    price: "$182.12",
    change: "+6.52%",
    tag: "High Quality",
    thesis: "A global nicotine products company with strong free cash flow, pricing power, and meaningful smoke-free product expansion."
  }
];
