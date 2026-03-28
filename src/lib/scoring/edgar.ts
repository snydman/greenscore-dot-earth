/**
 * SEC EDGAR holdings-based fossil fuel scoring.
 *
 * Pipeline: ticker → CIK → N-PORT filing → holdings → fossil exposure score
 *
 * Data sources (all free, no API key):
 *   - SEC EDGAR company_tickers_mf.json  (ticker → CIK/series mapping)
 *   - SEC EDGAR submissions API           (CIK → filing list)
 *   - SEC EDGAR filing archives           (filing → N-PORT XML)
 *   - Curated fossil fuel company list    (CUSIP-based matching)
 */

import { FOSSIL_COMPANIES } from "../data/fossil-companies";

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------
const UA = "GreenScore/0.1 (greenscore.earth; contact: hello@greenscore.earth)";
const SEC_BASE = "https://data.sec.gov";
const SEC_ARCHIVES = "https://www.sec.gov/Archives/edgar/data";
const RATE_LIMIT_MS = 120; // SEC asks for ≤10 req/s

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
type TickerMapping = { cik: number; seriesId: string; classId: string };

export type Holding = {
  name: string;
  cusip: string;
  isin: string | null;
  valUSD: number;
  pctVal: number; // already a percentage (e.g. 6.57 means 6.57%)
  assetCat: string | null;
  issuerCat: string | null;
};

export type FossilHolding = {
  name: string;
  matchedAs: string;
  cusip: string;
  pctOfPortfolio: number;
  valUSD: number;
};

export type EdgarScoreResult = {
  ticker: string;
  score: number; // 0..40
  maxScore: 40;
  grade: string;
  fossilExposurePct: number;
  totalHoldings: number;
  fossilHoldingsCount: number;
  fossilHoldings: FossilHolding[];
  filingDate: string;
  reportDate: string | null;
  source: "sec-edgar";
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
async function fetchJson(url: string): Promise<any> {
  const res = await fetch(url, { headers: { "User-Agent": UA } });
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
  return res.json();
}

async function fetchText(url: string): Promise<string> {
  const res = await fetch(url, { headers: { "User-Agent": UA } });
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
  return res.text();
}

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

function padCik(cik: number): string {
  return String(cik).padStart(10, "0");
}

// ---------------------------------------------------------------------------
// Step 1: Ticker → CIK + Series ID (cached in module scope)
// ---------------------------------------------------------------------------
let tickerMapCache: Map<string, TickerMapping> | null = null;
let tickerMapTimestamp = 0;
const TICKER_MAP_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

async function getTickerMap(): Promise<Map<string, TickerMapping>> {
  if (tickerMapCache && Date.now() - tickerMapTimestamp < TICKER_MAP_TTL_MS) {
    return tickerMapCache;
  }

  const data = await fetchJson(
    "https://www.sec.gov/files/company_tickers_mf.json"
  );
  const map = new Map<string, TickerMapping>();
  for (const [cik, seriesId, classId, symbol] of data.data as [number, string, string, string][]) {
    if (symbol) {
      map.set(symbol.toUpperCase(), { cik, seriesId, classId });
    }
  }
  tickerMapCache = map;
  tickerMapTimestamp = Date.now();
  return map;
}

// ---------------------------------------------------------------------------
// Step 2: CIK + Series → Latest N-PORT filing
// ---------------------------------------------------------------------------
async function findNportFiling(
  cik: number,
  seriesId: string,
): Promise<{ xml: string; filingDate: string; reportDate: string | null }> {
  const paddedCik = padCik(cik);
  const subs = await fetchJson(
    `${SEC_BASE}/submissions/CIK${paddedCik}.json`
  );

  const recent = subs.filings?.recent;
  if (!recent) throw new Error("No recent filings found");

  const nportIndices: number[] = [];
  for (let i = 0; i < recent.form.length; i++) {
    if (recent.form[i] === "NPORT-P") {
      nportIndices.push(i);
    }
  }

  if (nportIndices.length === 0) {
    throw new Error("No N-PORT-P filings found for this CIK");
  }

  // Use range requests to check seriesId in the XML header (3KB) without
  // downloading multi-MB files. Scan up to 500 filings for large fund families.
  for (const idx of nportIndices.slice(0, 500)) {
    const accession: string = recent.accessionNumber[idx];
    const accessionClean = accession.replace(/-/g, "");

    await sleep(RATE_LIMIT_MS);

    const xmlUrl = `${SEC_ARCHIVES}/${cik}/${accessionClean}/primary_doc.xml`;
    try {
      const res = await fetch(xmlUrl, {
        headers: { "User-Agent": UA, Range: "bytes=0-3000" },
      });
      const header = await res.text();

      if (header.includes(`<seriesId>${seriesId}</seriesId>`)) {
        await sleep(RATE_LIMIT_MS);
        const xml = await fetchText(xmlUrl);
        return {
          xml,
          filingDate: recent.filingDate[idx],
          reportDate: recent.reportDate?.[idx] ?? null,
        };
      }
    } catch {
      continue;
    }
  }

  throw new Error(
    `Could not find N-PORT filing for series ${seriesId}`
  );
}

// ---------------------------------------------------------------------------
// Step 3: Parse N-PORT XML → holdings list
// ---------------------------------------------------------------------------
function parseHoldings(xml: string): Holding[] {
  const holdings: Holding[] = [];
  const holdingRegex = /<invstOrSec>([\s\S]*?)<\/invstOrSec>/g;
  let match;

  while ((match = holdingRegex.exec(xml)) !== null) {
    const block = match[1];
    const get = (tag: string): string | null => {
      const m = block.match(new RegExp(`<${tag}>([^<]*)</${tag}>`));
      return m ? m[1].trim() : null;
    };

    const name = get("name") ?? "";
    const cusip = get("cusip");
    const valUSD = parseFloat(get("valUSD") ?? "0");
    const pctVal = parseFloat(get("pctVal") ?? "0");
    const assetCat = get("assetCat");
    const issuerCat = get("issuerCat");

    const isinMatch = block.match(/<isin[^>]*value="([^"]+)"/);
    const isin = isinMatch ? isinMatch[1] : null;

    if (cusip && valUSD > 0) {
      holdings.push({ name, cusip, isin, valUSD, pctVal, assetCat, issuerCat });
    }
  }

  return holdings;
}

// ---------------------------------------------------------------------------
// Step 4: Score holdings against fossil fuel list
// ---------------------------------------------------------------------------
function scoreFossilExposure(holdings: Holding[]): {
  fossilExposurePct: number;
  fossilHoldingsCount: number;
  fossilHoldings: FossilHolding[];
} {
  let fossilPct = 0;
  const fossilHoldings: FossilHolding[] = [];

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
    }
  }

  fossilHoldings.sort((a, b) => b.pctOfPortfolio - a.pctOfPortfolio);

  return {
    fossilExposurePct: fossilPct,
    fossilHoldingsCount: fossilHoldings.length,
    fossilHoldings,
  };
}

function exposureToScore(exposurePct: number): { score: number; grade: string } {
  // 0% fossil → 40/40, ≥20% fossil → 0/40, linear in between
  const score = Math.max(0, Math.min(40, Math.round(40 * (1 - exposurePct / 20))));

  // Grade based on score so the letter matches the number intuitively
  let grade: string;
  if (score >= 36) grade = "A";
  else if (score >= 30) grade = "B";
  else if (score >= 22) grade = "C";
  else if (score >= 14) grade = "D";
  else grade = "F";

  return { score, grade };
}

// ---------------------------------------------------------------------------
// Public API: score a single ticker
// ---------------------------------------------------------------------------
export async function scoreTickerEdgar(ticker: string): Promise<EdgarScoreResult> {
  const normalized = ticker.trim().toUpperCase();

  // Step 1: resolve ticker
  const tickerMap = await getTickerMap();
  const mapping = tickerMap.get(normalized);
  if (!mapping) {
    throw new Error(`Ticker "${normalized}" not found in SEC mutual fund registry`);
  }

  await sleep(RATE_LIMIT_MS);

  // Step 2: find N-PORT filing
  const filing = await findNportFiling(mapping.cik, mapping.seriesId);

  // Step 3: parse holdings
  const holdings = parseHoldings(filing.xml);

  // Step 4: score
  const exposure = scoreFossilExposure(holdings);
  const { score, grade } = exposureToScore(exposure.fossilExposurePct);

  return {
    ticker: normalized,
    score,
    maxScore: 40,
    grade,
    fossilExposurePct: exposure.fossilExposurePct,
    totalHoldings: holdings.length,
    fossilHoldingsCount: exposure.fossilHoldingsCount,
    fossilHoldings: exposure.fossilHoldings,
    filingDate: filing.filingDate,
    reportDate: filing.reportDate,
    source: "sec-edgar",
  };
}
