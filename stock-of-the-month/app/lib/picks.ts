export type MonthlyPick = {
  change: string;
  competitors: Array<{
    edge: string;
    name: string;
    ticker: string;
  }>;
  detailedAnalysis: string;
  month: string;
  name: string;
  price: string;
  rating: string;
  sector: string;
  summary: string;
  summaryBullets: string[];
  thesis: string;
  ticker: string;
};

export type QualityPick = {
  change: string;
  domain: string;
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
  price: "$55.69",
  change: "-1.35%",
  rating: "Active Buy",
  month: "May 2026",
  thesis:
    "EQT is the lowest-cost major natural gas producer in the U.S. It can stay profitable in weak gas markets and generate outsized cash flow when prices rise.",
  summary:
    "Operating exclusively in the Appalachian Basin across Pennsylvania, West Virginia, and Ohio, EQT extracts natural gas trapped in underground shale formations using horizontal drilling and hydraulic fracturing techniques.",
  summaryBullets: [
    "Low-cost Appalachian producer with leverage to stronger natural gas prices.",
    "LNG exports and AI data centers create durable electricity-demand tailwinds.",
    "Equitrans integration gives EQT more control over gathering and transport costs.",
    "CEO Toby Rice is aligned with shareholders through ownership and performance-linked pay."
  ],
  detailedAnalysis:
    "EQT is the StockyMonth pick because it combines a low-cost natural gas asset base with two powerful demand tailwinds: LNG exports and AI data center buildouts. LNG export growth is globalizing U.S. natural gas demand, while AI infrastructure is increasing long-duration electricity needs that can support gas-fired generation. EQT's acquisition of Equitrans adds vertical integration by giving the company greater control over midstream pipes, gathering, and transportation, which can reduce bottlenecks and improve delivered economics. Against challengers such as Expand Energy, Range Resources, and Antero, EQT stands out for scale, basin depth, cost position, and infrastructure control. Management alignment is also notable: CEO Toby Rice owns substantial stock, receives a $1 salary, and is compensated primarily through performance-based incentives.",
  competitors: [
    {
      ticker: "EXE",
      name: "Expand Energy",
      edge: "Large gas platform, but EQT has deeper Appalachian scale and midstream control after Equitrans."
    },
    {
      ticker: "RRC",
      name: "Range Resources",
      edge: "Strong Marcellus operator, while EQT offers larger production scale and broader infrastructure leverage."
    },
    {
      ticker: "AR",
      name: "Antero Resources",
      edge: "NGL exposure can help returns, but EQT is the cleaner low-cost dry gas scale play."
    }
  ]
};

export const defaultQualityPicks: QualityPick[] = [
  {
    ticker: "SHOP",
    name: "Shopify",
    sector: "E-commerce Software",
    domain: "shopify.com",
    price: "$102.52",
    change: "-7.20%",
    tag: "High Quality",
    thesis: "A commerce infrastructure platform with broad merchant reach, multiple sales channels, and strong long-term revenue growth potential."
  },
  {
    ticker: "MNDY",
    name: "monday.com",
    sector: "Project Management Software",
    domain: "monday.com",
    price: "$76.92",
    change: "+6.58%",
    tag: "High Quality",
    thesis: "A work operating system with rapid revenue growth, strong adoption, and a product-led workflow platform used across teams."
  },
  {
    ticker: "SANM",
    name: "Sanmina",
    sector: "Electrical Systems",
    domain: "sanmina.com",
    price: "$245.44",
    change: "-1.23%",
    tag: "High Quality",
    thesis: "An electronics manufacturing services company with improving fundamentals and exposure to complex industrial supply chains."
  },
  {
    ticker: "STRL",
    name: "Sterling",
    sector: "Engineering and Design Services",
    domain: "strlco.com",
    price: "$868.17",
    change: "+2.91%",
    tag: "High Quality",
    thesis: "A civil infrastructure construction business with strong momentum, healthy profitability, and durable project demand."
  },
  {
    ticker: "KLAC",
    name: "KLA Corporation",
    sector: "Semiconductor Manufacturing",
    domain: "kla.com",
    price: "$1,845.00",
    change: "-1.29%",
    tag: "High Quality",
    thesis: "A semiconductor equipment leader focused on process control, inspection, and measurement tools for advanced chip production."
  },
  {
    ticker: "PM",
    name: "Philip Morris",
    sector: "Beverages, Alcohol, and Tobacco",
    domain: "pmi.com",
    price: "$182.12",
    change: "+6.52%",
    tag: "High Quality",
    thesis: "A global nicotine products company with strong free cash flow, pricing power, and meaningful smoke-free product expansion."
  }
];

export const pickHistory = [
  { month: "May 2026", ticker: "EQT", name: "EQT", status: "Active Buy" },
  { month: "April 2026", ticker: "DASH", name: "DoorDash", status: "Active Buy" },
  { month: "March 2026", ticker: "BMI", name: "Badger Meter", status: "Active Buy" },
  { month: "February 2026", ticker: "MSI", name: "Motorola Solutions", status: "Active Buy" },
  { month: "January 2026", ticker: "AJG", name: "Arthur J. Gallagher", status: "Active Buy" },
  { month: "December 2025", ticker: "CSW", name: "CSW Industrials", status: "Active Buy" },
  { month: "November 2025", ticker: "LPLA", name: "LPL Financial", status: "Active Buy" },
  { month: "October 2025", ticker: "FSS", name: "Federal Signal", status: "Active Buy" },
  { month: "September 2025", ticker: "BLBD", name: "Blue Bird", status: "Active Buy" },
  { month: "August 2025", ticker: "NFLX", name: "Netflix", status: "Active Buy" },
  { month: "July 2025", ticker: "EME", name: "EMCOR", status: "Active Buy" },
  { month: "June 2025", ticker: "MSFT", name: "Microsoft", status: "Active Buy" }
];
