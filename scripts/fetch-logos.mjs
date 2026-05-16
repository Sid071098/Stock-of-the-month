// Run from project root:  node scripts/fetch-logos.mjs
// Downloads logos for every (ticker, domain) used in the app and saves them
// to public/logos/{ticker}.{png|svg}.

import { writeFile, mkdir, readFile } from "node:fs/promises";

const dir = "public/logos";
await mkdir(dir, { recursive: true });

const authPicks = [
  { ticker: "FTAI", domain: "ftai.com" },
  { ticker: "NET",  domain: "cloudflare.com" },
  { ticker: "HWM",  domain: "howmet.com" },
  { ticker: "CRWD", domain: "crowdstrike.com" },
  { ticker: "WAB",  domain: "wabteccorp.com" }
];

const quality = [
  { ticker: "SHOP", domain: "shopify.com" },
  { ticker: "MNDY", domain: "monday.com" },
  { ticker: "SANM", domain: "sanmina.com" },
  { ticker: "STRL", domain: "strlco.com" },
  { ticker: "KLAC", domain: "kla.com" },
  { ticker: "PM",   domain: "pmi.com" }
];

const archive = JSON.parse(await readFile("data/picksHistory.json", "utf-8"));

const all = new Map();
for (const p of [...authPicks, ...quality, ...archive]) {
  if (!p.domain) continue;
  all.set(p.ticker.toLowerCase(), { ticker: p.ticker, domain: p.domain });
}

// Try multiple sources in order; the first success wins.
function sources(domain) {
  return [
    { name: "clearbit",  url: `https://logo.clearbit.com/${domain}` },
    { name: "duckduckgo", url: `https://icons.duckduckgo.com/ip3/${domain}.ico` },
    { name: "google",    url: `https://www.google.com/s2/favicons?domain=${domain}&sz=128` }
  ];
}

function extFromContentType(ct) {
  if (!ct) return "png";
  if (ct.includes("svg")) return "svg";
  if (ct.includes("icon") || ct.includes("ico")) return "ico";
  if (ct.includes("jpeg") || ct.includes("jpg")) return "jpg";
  return "png";
}

console.log(`Fetching ${all.size} unique logos...`);

let ok = 0, fail = 0;
for (const { ticker, domain } of all.values()) {
  let saved = null;
  for (const src of sources(domain)) {
    try {
      const res = await fetch(src.url, { redirect: "follow" });
      if (!res.ok) continue;
      const buf = Buffer.from(await res.arrayBuffer());
      if (buf.length < 256) continue;
      const ext = extFromContentType(res.headers.get("content-type"));
      await writeFile(`${dir}/${ticker.toLowerCase()}.${ext}`, buf);
      saved = { ext, bytes: buf.length, via: src.name };
      break;
    } catch {
      // try next source
    }
  }
  if (saved) {
    console.log(`  OK ${ticker.padEnd(6)} ${domain.padEnd(30)} ${saved.bytes} bytes (${saved.ext}) via ${saved.via}`);
    ok++;
  } else {
    console.log(`  X  ${ticker.padEnd(6)} ${domain.padEnd(30)} no source returned a usable image`);
    fail++;
  }
}

console.log(`\nDone: ${ok} ok, ${fail} failed`);
