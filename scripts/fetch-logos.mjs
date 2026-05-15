// Run from project root:  node scripts/fetch-logos.mjs
// Downloads logos for every (ticker, domain) used in the app and saves them
// to public/logos/{ticker}.{png|svg}.

import { writeFile, mkdir, readFile } from "node:fs/promises";

const dir = "public/logos";
await mkdir(dir, { recursive: true });

const authPicks = [
  { ticker: "FTAI", domain: "ftaiaviation.com" },
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

console.log(`Fetching ${all.size} unique logos from logo.clearbit.com...`);

let ok = 0, fail = 0;
for (const { ticker, domain } of all.values()) {
  const url = `https://logo.clearbit.com/${domain}`;
  try {
    const res = await fetch(url);
    if (!res.ok) {
      console.log(`  X  ${ticker.padEnd(6)} ${domain.padEnd(30)} ${res.status}`);
      fail++;
      continue;
    }
    const buf = Buffer.from(await res.arrayBuffer());
    const ext = (res.headers.get("content-type") || "").includes("svg") ? "svg" : "png";
    await writeFile(`${dir}/${ticker.toLowerCase()}.${ext}`, buf);
    console.log(`  OK ${ticker.padEnd(6)} ${domain.padEnd(30)} ${buf.length} bytes (${ext})`);
    ok++;
  } catch (err) {
    console.log(`  X  ${ticker.padEnd(6)} ${domain.padEnd(30)} ${err.message}`);
    fail++;
  }
}

console.log(`\nDone: ${ok} ok, ${fail} failed`);
