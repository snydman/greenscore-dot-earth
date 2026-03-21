import type { InvestmentFactor } from "./investments";

const CACHE_KEY = "greenscore.scoreCache.v1";
const PRESCORE_KEY = "greenscore.prescore.active";
const MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

type CachedScore = {
  factor: InvestmentFactor;
  cachedAt: number;
};

type ScoreCache = Record<string, CachedScore>;

function readCache(): ScoreCache {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    return raw ? (JSON.parse(raw) as ScoreCache) : {};
  } catch {
    return {};
  }
}

function saveCache(cache: ScoreCache): void {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
  } catch {
    // localStorage full or unavailable
  }
}

export function writeOne(ticker: string, factor: InvestmentFactor): void {
  const cache = readCache();
  cache[ticker.toUpperCase()] = { factor, cachedAt: Date.now() };
  saveCache(cache);
}

export function getCached(ticker: string): InvestmentFactor | null {
  const cache = readCache();
  const entry = cache[ticker.toUpperCase()];
  if (!entry) return null;
  if (Date.now() - entry.cachedAt > MAX_AGE_MS) return null;
  return entry.factor;
}

export function getActivePrescore(): string[] | null {
  try {
    const raw = localStorage.getItem(PRESCORE_KEY);
    return raw ? (JSON.parse(raw) as string[]) : null;
  } catch {
    return null;
  }
}

export function setActivePrescore(tickers: string[]): void {
  try {
    localStorage.setItem(PRESCORE_KEY, JSON.stringify(tickers));
  } catch {
    // ignore
  }
}

export function clearActivePrescore(): void {
  try {
    localStorage.removeItem(PRESCORE_KEY);
  } catch {
    // ignore
  }
}
