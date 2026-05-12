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

export type ArchivePick = {
  bullets: string[];
  change: string;
  month: string;
  name: string;
  price: string;
  summary: string;
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

export const allPicks: ArchivePick[] = [
  {
    month: "April 2026",
    ticker: "DASH",
    name: "DoorDash",
    price: "$204.38",
    change: "+1.84%",
    summary: "DoorDash remains a category leader in local commerce with expanding merchant tools and international delivery opportunities.",
    bullets: [
      "Marketplace scale helps improve delivery density and unit economics.",
      "Advertising and merchant software create higher-margin revenue layers.",
      "International expansion gives the business a longer runway beyond U.S. restaurants."
    ]
  },
  {
    month: "March 2026",
    ticker: "BMI",
    name: "Badger Meter",
    price: "$196.72",
    change: "+0.74%",
    summary: "Badger Meter is a high-quality water technology operator benefiting from infrastructure upgrades and utility modernization.",
    bullets: [
      "Smart water metering creates recurring replacement demand.",
      "Municipal infrastructure spending supports multi-year visibility.",
      "Strong margins and niche leadership make the business durable."
    ]
  },
  {
    month: "February 2026",
    ticker: "MSI",
    name: "Motorola Solutions",
    price: "$421.09",
    change: "-0.38%",
    summary: "Motorola Solutions combines mission-critical communications, video security, and software workflows for public safety customers.",
    bullets: [
      "Public safety customers value reliability over low-cost alternatives.",
      "Software and services increase recurring revenue quality.",
      "Video security adds a second durable growth engine."
    ]
  },
  {
    month: "January 2026",
    ticker: "AJG",
    name: "Arthur J. Gallagher",
    price: "$318.44",
    change: "+0.91%",
    summary: "Arthur J. Gallagher is a resilient insurance brokerage compounder with acquisition discipline and recurring commission revenue.",
    bullets: [
      "Insurance brokerage has resilient demand across cycles.",
      "Fragmented industry gives Gallagher room for accretive acquisitions.",
      "Pricing and retention support steady organic growth."
    ]
  },
  {
    month: "December 2025",
    ticker: "CSW",
    name: "CSW Industrials",
    price: "$363.80",
    change: "+1.18%",
    summary: "CSW Industrials owns specialized industrial brands with strong pricing power and exposure to repair-driven demand.",
    bullets: [
      "Niche products support attractive margins.",
      "Repair and maintenance demand is less cyclical than new construction.",
      "Acquisitions can expand the platform without diluting quality."
    ]
  },
  {
    month: "November 2025",
    ticker: "LPLA",
    name: "LPL Financial",
    price: "$286.15",
    change: "-0.62%",
    summary: "LPL Financial benefits from advisor migration, platform scale, and the long-term shift toward independent wealth management.",
    bullets: [
      "Independent advisors continue taking share from legacy channels.",
      "Platform scale creates operating leverage as assets grow.",
      "Cash sweep and advisory assets provide multiple revenue drivers."
    ]
  },
  {
    month: "October 2025",
    ticker: "FSS",
    name: "Federal Signal",
    price: "$96.24",
    change: "+0.52%",
    summary: "Federal Signal supplies essential municipal and industrial equipment with steady replacement cycles and operational momentum.",
    bullets: [
      "Municipal fleets require ongoing replacement.",
      "Aftermarket parts and service add stability.",
      "Infrastructure spending can support backlog conversion."
    ]
  },
  {
    month: "September 2025",
    ticker: "BLBD",
    name: "Blue Bird",
    price: "$51.33",
    change: "+2.07%",
    summary: "Blue Bird is positioned around school bus replacement demand, electrification incentives, and improved manufacturing execution.",
    bullets: [
      "Aging school bus fleets need replacement.",
      "Electric bus incentives can accelerate demand.",
      "Margin improvement creates operating leverage from revenue growth."
    ]
  },
  {
    month: "August 2025",
    ticker: "NFLX",
    name: "Netflix",
    price: "$1,128.41",
    change: "+0.66%",
    summary: "Netflix has strengthened its streaming leadership through scale, pricing power, advertising, and disciplined content investment.",
    bullets: [
      "Global scale spreads content costs across a large subscriber base.",
      "Advertising creates a newer monetization layer.",
      "Password sharing actions and pricing support revenue growth."
    ]
  },
  {
    month: "July 2025",
    ticker: "EME",
    name: "EMCOR",
    price: "$382.76",
    change: "-0.21%",
    summary: "EMCOR benefits from complex electrical and mechanical project demand tied to data centers, manufacturing, and infrastructure.",
    bullets: [
      "Data centers drive demand for specialized electrical work.",
      "Backlog quality supports revenue visibility.",
      "Technical labor depth creates a competitive advantage."
    ]
  },
  {
    month: "June 2025",
    ticker: "MSFT",
    name: "Microsoft",
    price: "$449.87",
    change: "+0.35%",
    summary: "Microsoft blends cloud, enterprise software, security, and AI infrastructure into one of the market's strongest platforms.",
    bullets: [
      "Azure remains a major AI and cloud beneficiary.",
      "Microsoft 365 offers durable enterprise pricing power.",
      "Security and developer tools expand wallet share."
    ]
  },
  {
    month: "May 2025",
    ticker: "LLY",
    name: "Eli Lilly",
    price: "$789.20",
    change: "+1.02%",
    summary: "Eli Lilly combines diabetes, obesity, and pipeline strength with rare large-cap pharmaceutical growth visibility.",
    bullets: [
      "Obesity medicines can support multi-year demand.",
      "Manufacturing capacity expansion unlocks supply-constrained growth.",
      "Pipeline breadth reduces dependence on one product cycle."
    ]
  },
  {
    month: "April 2025",
    ticker: "META",
    name: "Meta Platforms",
    price: "$602.15",
    change: "-0.44%",
    summary: "Meta pairs massive social platforms with improving ad tools, AI engagement, and disciplined expense control.",
    bullets: [
      "AI improves ad targeting and content recommendations.",
      "Family of Apps continues producing significant cash flow.",
      "Operating discipline increases earnings leverage."
    ]
  },
  {
    month: "March 2025",
    ticker: "COIN",
    name: "Coinbase",
    price: "$274.60",
    change: "+3.18%",
    summary: "Coinbase is a regulated crypto infrastructure leader with upside from trading activity, custody, and institutional adoption.",
    bullets: [
      "Institutional crypto adoption can expand custody revenue.",
      "Trading volumes offer upside in stronger crypto cycles.",
      "Regulatory positioning differentiates Coinbase from offshore venues."
    ]
  },
  {
    month: "February 2025",
    ticker: "INSP",
    name: "Inspire Medical",
    price: "$183.72",
    change: "+0.27%",
    summary: "Inspire Medical targets obstructive sleep apnea with a differentiated implantable therapy and expanding physician adoption.",
    bullets: [
      "Large sleep apnea market remains underpenetrated.",
      "Physician training expands procedure capacity.",
      "Clinical differentiation supports premium positioning."
    ]
  },
  {
    month: "January 2025",
    ticker: "TTD",
    name: "The Trade Desk",
    price: "$92.41",
    change: "-1.12%",
    summary: "The Trade Desk is a leading independent ad-buying platform benefiting from connected TV and open internet advertising.",
    bullets: [
      "Connected TV keeps shifting ad budgets programmatically.",
      "Independence helps The Trade Desk win with agencies.",
      "Data products can deepen platform lock-in."
    ]
  },
  {
    month: "December 2024",
    ticker: "HWM",
    name: "Howmet",
    price: "$119.85",
    change: "+1.66%",
    summary: "Howmet supplies critical aerospace components with pricing power, backlog visibility, and commercial aircraft production exposure.",
    bullets: [
      "Aerospace build rates support sustained demand.",
      "Engineered components carry high switching costs.",
      "Margin improvement can compound with volume recovery."
    ]
  },
  {
    month: "November 2024",
    ticker: "SHOP",
    name: "Shopify",
    price: "$102.52",
    change: "-7.20%",
    summary: "Shopify provides commerce infrastructure for merchants and continues to expand payments, fulfillment partnerships, and enterprise tools.",
    bullets: [
      "Merchant growth expands the commerce ecosystem.",
      "Payments and services improve monetization per merchant.",
      "Enterprise adoption can broaden Shopify beyond SMB roots."
    ]
  },
  {
    month: "October 2024",
    ticker: "TT",
    name: "Trane Technologies",
    price: "$412.34",
    change: "+0.58%",
    summary: "Trane Technologies benefits from energy-efficient HVAC demand, climate regulation, and mission-critical building systems.",
    bullets: [
      "Efficiency regulations support replacement demand.",
      "Commercial HVAC has durable service revenue.",
      "Data centers need advanced cooling infrastructure."
    ]
  },
  {
    month: "September 2024",
    ticker: "TDG",
    name: "TransDigm",
    price: "$1,332.18",
    change: "+0.73%",
    summary: "TransDigm owns proprietary aerospace components with aftermarket exposure and exceptional long-term pricing power.",
    bullets: [
      "Aftermarket parts create resilient high-margin revenue.",
      "Proprietary components carry meaningful switching costs.",
      "Disciplined capital allocation has compounded shareholder value."
    ]
  },
  {
    month: "August 2024",
    ticker: "NET",
    name: "Cloudflare",
    price: "$160.44",
    change: "+1.41%",
    summary: "Cloudflare operates a global edge network with security, performance, developer, and AI infrastructure growth opportunities.",
    bullets: [
      "Global edge network is difficult to replicate.",
      "Security and developer products expand customer wallet share.",
      "AI traffic can create new demand for network services."
    ]
  }
];
