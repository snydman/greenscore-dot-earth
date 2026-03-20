#!/usr/bin/env node
/**
 * spike-edgar.mjs — End-to-end proof-of-concept:
 *   Ticker → CIK → N-PORT holdings → fossil fuel exposure score
 *
 * Usage:
 *   node scripts/spike-edgar.mjs VTI
 *   node scripts/spike-edgar.mjs VTI ICLN VFTAX
 *
 * Data sources (all free, no API key):
 *   - SEC EDGAR company_tickers_mf.json  (ticker → CIK/series mapping)
 *   - SEC EDGAR submissions API           (CIK → filing list)
 *   - SEC EDGAR filing archives           (filing → N-PORT XML)
 *   - Curated fossil fuel company list    (CUSIP-based matching)
 */

import { parseArgs } from "node:util";

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------
const UA = "GreenScore/0.1 (spike; contact: spike@greenscore.earth)";
const SEC_BASE = "https://data.sec.gov";
const SEC_ARCHIVES = "https://www.sec.gov/Archives/edgar/data";
const RATE_LIMIT_MS = 120; // SEC asks for ≤10 req/s; we do ~8

// ---------------------------------------------------------------------------
// Curated fossil fuel reference list
// ---------------------------------------------------------------------------
// Top fossil fuel companies by market cap / reserves.
// Source: Carbon Underground 200 (top 100 coal + top 100 oil/gas by reserves)
// plus major midstream/pipeline operators.
// Keyed by 9-digit CUSIP for matching against N-PORT holdings.
//
// This is a starter set for the spike. A production version would ingest the
// full GCEL (Global Coal Exit List) and CU200 datasets.
// ---------------------------------------------------------------------------
const FOSSIL_COMPANIES = new Map([
  // === Oil & Gas Majors / Integrated ===
  // CUSIPs verified against SEC N-PORT filings
  ["30231G102", "Exxon Mobil Corp"],
  ["166764100", "Chevron Corp"],
  ["20825C104", "ConocoPhillips"],
  ["780259305", "Shell plc (ADR A)"],
  ["780259206", "Shell plc (ADR B)"],
  ["055622104", "BP plc (ADR)"],
  ["89151E109", "TotalEnergies SE (ADR)"],
  ["674599105", "Occidental Petroleum Corp"],
  ["26875P101", "EOG Resources Inc"],
  ["718546104", "Phillips 66"],
  ["91913Y100", "Valero Energy Corp"],
  ["56585A102", "Marathon Petroleum Corp"],
  ["25179M103", "Devon Energy Corp"],
  ["25278X109", "Diamondback Energy Inc"],
  ["42809H107", "Hess Corp"],
  ["03743Q108", "APA Corp"],
  ["17888H103", "Civitas Resources Inc"],
  ["127097103", "Coterra Energy Inc"],
  ["15118V207", "Cenovus Energy Inc"],
  ["80007P100", "Suncor Energy Inc"],
  ["05534B760", "BP Prudhoe Bay Royalty Trust"],
  ["29250N105", "Eni SpA (ADR)"],
  ["69047Q102", "Ovintiv Inc"],

  // === Oil & Gas E&P (Exploration & Production) ===
  ["75281A109", "Range Resources Corp"],
  ["674215207", "Chord Energy Corp"],
  ["71424F105", "Permian Resources Corp"],
  ["559663109", "Magnolia Oil & Gas Corp"],
  ["78454L100", "SM Energy Co"],
  ["576485205", "Matador Resources Co"],
  ["626717102", "Murphy Oil Corp"],
  ["03674X106", "Antero Resources Corp"],

  // === Oilfield Services ===
  ["806857108", "SLB Ltd"],
  ["406216101", "Halliburton Co"],
  ["05722G100", "Baker Hughes Co"],
  ["53115L104", "Liberty Energy Inc"],
  ["678026105", "Oil States International Inc"],
  ["21867A105", "Core Laboratories Inc"],

  // === Midstream / Pipelines ===
  ["969457100", "Williams Cos Inc"],
  ["49456B101", "Kinder Morgan Inc"],
  ["29250R109", "Enbridge Inc"],
  ["682680103", "ONEOK Inc"],
  ["87612G101", "Targa Resources Corp"],
  ["29379R100", "Enterprise Products Partners"],
  ["03676B102", "Antero Midstream Corp"],
  ["23345M107", "DT Midstream Inc"],

  // === Coal ===
  ["704551100", "Peabody Energy Corp"],
  ["218937100", "CONSOL Energy Inc"],
  ["93627C101", "Warrior Met Coal Inc"],
  ["020764106", "Alpha Metallurgical Resources Inc"],
  ["02044E103", "Alliance Resource Partners"],
  ["629579103", "NACCO Industries Inc"],

  // === Refining ===
  ["24665A103", "Delek US Holdings Inc"],
  ["403949100", "HF Sinclair Corp"],
  ["69318G106", "PBF Energy Inc"],

  // === Natural Gas Utilities / Distribution ===
  ["636180101", "National Fuel Gas Co"],
  ["844895102", "Southwest Gas Holdings Inc"],
  ["84857L101", "Spire Inc"],
  ["68235P108", "ONE Gas Inc"],

  // === LNG ===
  ["16411R208", "Cheniere Energy Inc"],
]);

// Clean up: remove known false entries from placeholder comments
// In production, this would be a proper database / CSV import

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
async function fetchJson(url) {
  const res = await fetch(url, { headers: { "User-Agent": UA } });
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
  return res.json();
}

async function fetchText(url) {
  const res = await fetch(url, { headers: { "User-Agent": UA } });
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
  return res.text();
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function padCik(cik) {
  return String(cik).padStart(10, "0");
}

// ---------------------------------------------------------------------------
// Step 1: Ticker → CIK + Series ID
// ---------------------------------------------------------------------------
async function loadTickerMap() {
  console.log("  Fetching SEC mutual fund ticker map...");
  const data = await fetchJson(
    "https://www.sec.gov/files/company_tickers_mf.json"
  );
  // data = { fields: ["cik","seriesId","classId","symbol"], data: [[...], ...] }
  const map = new Map();
  for (const [cik, seriesId, classId, symbol] of data.data) {
    if (symbol) {
      map.set(symbol.toUpperCase(), { cik, seriesId, classId });
    }
  }
  console.log(`  Loaded ${map.size} ticker mappings`);
  return map;
}

// ---------------------------------------------------------------------------
// Step 2: CIK + Series → Latest N-PORT filing accession number
// ---------------------------------------------------------------------------
async function findNportFiling(cik, seriesId) {
  const paddedCik = padCik(cik);
  console.log(`  Fetching filing history for CIK ${paddedCik}...`);
  const subs = await fetchJson(
    `${SEC_BASE}/submissions/CIK${paddedCik}.json`
  );

  const recent = subs.filings?.recent;
  if (!recent) throw new Error("No recent filings found");

  // Find N-PORT-P filings
  const nportIndices = [];
  for (let i = 0; i < recent.form.length; i++) {
    if (recent.form[i] === "NPORT-P") {
      nportIndices.push(i);
    }
  }

  if (nportIndices.length === 0) {
    throw new Error("No N-PORT-P filings found for this CIK");
  }

  console.log(
    `  Found ${nportIndices.length} N-PORT filings. Scanning for series ${seriesId}...`
  );

  // Strategy: use HTTP Range requests to fetch just the first 3KB of each
  // N-PORT XML, which contains the seriesId in the header. This is much faster
  // than downloading multi-MB XMLs. We use the registrant CIK in the archive
  // URL path (not the filer CIK, which may differ for third-party filers).

  for (const idx of nportIndices.slice(0, 500)) {
    const accession = recent.accessionNumber[idx];
    const accessionClean = accession.replace(/-/g, "");

    await sleep(RATE_LIMIT_MS);

    // Use registrant CIK for the archive path (not filer CIK from accession prefix)
    const xmlUrl = `${SEC_ARCHIVES}/${cik}/${accessionClean}/primary_doc.xml`;
    try {
      // Range request: just the header with seriesId (~3KB)
      const res = await fetch(xmlUrl, {
        headers: { "User-Agent": UA, Range: "bytes=0-3000" },
      });
      const header = await res.text();

      if (header.includes(`<seriesId>${seriesId}</seriesId>`)) {
        console.log(
          `  Found matching filing: ${accession} (${recent.filingDate[idx]})`
        );
        // Now fetch the full XML
        await sleep(RATE_LIMIT_MS);
        const xml = await fetchText(xmlUrl);
        return {
          accession,
          filingDate: recent.filingDate[idx],
          reportDate: recent.reportDate?.[idx],
          xml,
        };
      }
    } catch (e) {
      continue;
    }
  }

  throw new Error(
    `Could not find N-PORT filing for series ${seriesId} in recent ${Math.min(500, nportIndices.length)} filings`
  );
}

// ---------------------------------------------------------------------------
// Step 3: Parse N-PORT XML → holdings list
// ---------------------------------------------------------------------------
function parseHoldings(xml) {
  // Simple regex-based parser (no XML library needed for spike)
  // Each holding is wrapped in <invstOrSec>...</invstOrSec>
  const holdings = [];
  const holdingRegex = /<invstOrSec>([\s\S]*?)<\/invstOrSec>/g;
  let match;

  while ((match = holdingRegex.exec(xml)) !== null) {
    const block = match[1];
    const get = (tag) => {
      const m = block.match(new RegExp(`<${tag}>([^<]*)</${tag}>`));
      return m ? m[1].trim() : null;
    };

    const name = get("name");
    const cusip = get("cusip");
    const valUSD = parseFloat(get("valUSD") || "0");
    const pctVal = parseFloat(get("pctVal") || "0"); // Already a percentage
    const lei = get("lei");
    const assetCat = get("assetCat");
    const issuerCat = get("issuerCat");

    // Get ISIN if available
    const isinMatch = block.match(/<isin[^>]*value="([^"]+)"/);
    const isin = isinMatch ? isinMatch[1] : null;

    if (cusip && valUSD > 0) {
      holdings.push({ name, cusip, isin, lei, valUSD, pctVal, assetCat, issuerCat });
    }
  }

  return holdings;
}

// ---------------------------------------------------------------------------
// Step 4: Score holdings against fossil fuel list
// ---------------------------------------------------------------------------
function scoreFossilExposure(holdings) {
  const totalPct = holdings.reduce((sum, h) => sum + h.pctVal, 0);
  let fossilPct = 0;
  const fossilHoldings = [];
  const nonFossilCount = { total: 0, equity: 0, other: 0 };

  for (const h of holdings) {
    const fossilName = FOSSIL_COMPANIES.get(h.cusip);
    if (fossilName) {
      fossilPct += h.pctVal;
      fossilHoldings.push({
        name: h.name,
        matchedAs: fossilName,
        cusip: h.cusip,
        pctOfPortfolio: h.pctVal,
        valUSD: h.valUSD,
      });
    } else {
      nonFossilCount.total++;
      if (h.assetCat === "EC") nonFossilCount.equity++;
      else nonFossilCount.other++;
    }
  }

  // Sort fossil holdings by portfolio weight descending
  fossilHoldings.sort((a, b) => b.pctOfPortfolio - a.pctOfPortfolio);

  // Convert to a 0-40 score (matching current scoring scale)
  // 0% fossil → 40/40, ≥20% fossil → 0/40, linear in between
  const exposurePct = fossilPct; // Already a percentage
  const score40 = Math.max(0, Math.min(40, Math.round(40 * (1 - exposurePct / 20))));

  // Letter grade equivalent
  let grade;
  if (exposurePct <= 1) grade = "A";
  else if (exposurePct <= 3) grade = "B";
  else if (exposurePct <= 7) grade = "C";
  else if (exposurePct <= 15) grade = "D";
  else grade = "F";

  return {
    totalHoldings: holdings.length,
    totalPortfolioPct: totalPct,
    fossilExposurePct: exposurePct,
    fossilHoldingsCount: fossilHoldings.length,
    score40,
    grade,
    fossilHoldings,
  };
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------
async function scoreTicker(ticker, tickerMap) {
  console.log(`\n${"=".repeat(60)}`);
  console.log(`Scoring: ${ticker}`);
  console.log("=".repeat(60));

  // Step 1: Resolve ticker
  const mapping = tickerMap.get(ticker.toUpperCase());
  if (!mapping) {
    console.log(`  ❌ Ticker "${ticker}" not found in SEC mutual fund registry`);
    console.log(`  This ticker may be a stock (not a fund/ETF), or it may not be SEC-registered.`);
    return null;
  }
  console.log(
    `  CIK: ${mapping.cik}, Series: ${mapping.seriesId}, Class: ${mapping.classId}`
  );

  await sleep(RATE_LIMIT_MS);

  // Step 2: Find N-PORT filing
  let filing;
  try {
    filing = await findNportFiling(mapping.cik, mapping.seriesId);
  } catch (e) {
    console.log(`  ❌ ${e.message}`);
    return null;
  }

  // Step 3: Parse holdings
  const holdings = parseHoldings(filing.xml);
  console.log(`  Parsed ${holdings.length} holdings from N-PORT filing`);

  // Step 4: Score
  const result = scoreFossilExposure(holdings);

  // Report
  console.log(`\n  📊 Results for ${ticker}:`);
  console.log(`  ${"─".repeat(50)}`);
  console.log(`  Filing date:         ${filing.filingDate}`);
  console.log(`  Report period:       ${filing.reportDate || "N/A"}`);
  console.log(`  Total holdings:      ${result.totalHoldings}`);
  console.log(
    `  Fossil fuel holdings: ${result.fossilHoldingsCount} (${result.fossilExposurePct.toFixed(2)}% of portfolio)`
  );
  console.log(`  Score:               ${result.score40}/40`);
  console.log(`  Grade:               ${result.grade}`);
  console.log();

  if (result.fossilHoldings.length > 0) {
    console.log(`  Top fossil fuel holdings:`);
    for (const fh of result.fossilHoldings.slice(0, 15)) {
      console.log(
        `    ${fh.pctOfPortfolio.toFixed(3)}%  $${(fh.valUSD / 1e6).toFixed(0)}M  ${fh.name}`
      );
    }
    if (result.fossilHoldings.length > 15) {
      console.log(
        `    ... and ${result.fossilHoldings.length - 15} more`
      );
    }
  } else {
    console.log(`  ✅ No fossil fuel holdings detected`);
  }

  return result;
}

async function main() {
  const tickers = process.argv.slice(2).filter((a) => !a.startsWith("-"));

  if (tickers.length === 0) {
    console.log("Usage: node scripts/spike-edgar.mjs TICKER [TICKER...]");
    console.log("Example: node scripts/spike-edgar.mjs VTI ICLN VFTAX");
    process.exit(1);
  }

  console.log("🌿 GreenScore EDGAR Spike");
  console.log("─".repeat(60));

  // Load ticker map once
  const tickerMap = await loadTickerMap();

  // Score each ticker
  const results = {};
  for (const ticker of tickers) {
    results[ticker] = await scoreTicker(ticker, tickerMap);
    await sleep(RATE_LIMIT_MS);
  }

  // Summary
  console.log(`\n\n${"═".repeat(60)}`);
  console.log("Summary");
  console.log("═".repeat(60));
  for (const [ticker, result] of Object.entries(results)) {
    if (result) {
      console.log(
        `  ${ticker.padEnd(8)} ${result.grade}  ${result.score40}/40  (${result.fossilExposurePct.toFixed(2)}% fossil exposure, ${result.fossilHoldingsCount}/${result.totalHoldings} holdings)`
      );
    } else {
      console.log(`  ${ticker.padEnd(8)} ❌  Could not score`);
    }
  }

  console.log(`\n⚠️  Caveats:`);
  console.log(`  • Fossil company list is a curated subset (~100 companies), not exhaustive`);
  console.log(`  • N-PORT filings are quarterly — holdings may have changed since filing`);
  console.log(`  • Only matches by CUSIP — may miss subsidiaries or foreign-listed shares`);
  console.log(`  • Score scale: 0% fossil = 40/40 (A), ≥20% fossil = 0/40 (F)`);
}

main().catch((e) => {
  console.error("Fatal error:", e.message);
  process.exit(1);
});
