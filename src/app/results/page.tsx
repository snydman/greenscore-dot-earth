"use client";

import { scoreSingleTickerLive, parseTickers } from "../../lib/scoring/investments";
import type { InvestmentFactor } from "../../lib/scoring/investments";
import { scoreBanks, type MultiBankScoreResult } from "../../lib/scoring/banking";
import type { BankCategory } from "../../lib/data/banks";
import { scoreVehicles, type MultiTransportScoreResult, type TransportQuizData } from "../../lib/scoring/transport";
import { scoreHeating, type HeatingScoreResult, type HeatingType } from "../../lib/scoring/heating";
import { scoreAirTravel, type AirTravelScoreResult, type AirTravelTier } from "../../lib/scoring/air-travel";
import { getCached, writeOne, getActivePrescore } from "../../lib/scoring/score-cache";
import { getRecommendations } from "../../lib/scoring/recommendations";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Button, Card } from "../../components/ui";
import SiteNav from "../../components/SiteNav";

type BankEntry = {
  bankSlug: string | null;
  bankDisplayName: string;
  bankCategory: BankCategory | null;
  bankRating?: string | null;
};

type SavedPayload = {
  version: number;
  savedAt: string;
  answers: {
    tickers: string;
    // v4+ arrays
    banks?: BankEntry[];
    vehicles?: TransportQuizData[];
    // v5 heating
    heating?: HeatingType | null;
    heatingState?: string | null;
    // v6 air travel + zip
    airTravel?: AirTravelTier | null;
    zipCode?: string | null;
    // v3 singular (for backward compat)
    bankSlug?: string | null;
    bankDisplayName?: string;
    bankCategory?: string | null;
    transport?: TransportQuizData | null;
  };
};

const CATEGORY_CHIP_COLORS: Record<string, string> = {
  banking: "bg-emerald-50 text-emerald-700",
  transport: "bg-blue-50 text-blue-700",
  heating: "bg-orange-50 text-orange-700",
  investments: "bg-violet-50 text-violet-700",
};

const RATING_BADGE_COLORS: Record<string, string> = {
  great: "bg-emerald-50 text-emerald-800 ring-emerald-200/60",
  good: "bg-emerald-50 text-emerald-700 ring-emerald-200/60",
  ok: "bg-amber-50 text-amber-800 ring-amber-200/60",
  bad: "bg-orange-50 text-orange-800 ring-orange-200/60",
  worst: "bg-red-50 text-red-800 ring-red-200/60",
};

/** Poll localStorage cache for a prescore result, with timeout. */
function pollForCachedResult(ticker: string, timeoutMs: number): Promise<InvestmentFactor | null> {
  return new Promise((resolve) => {
    const start = Date.now();
    const interval = setInterval(() => {
      const cached = getCached(ticker);
      if (cached) {
        clearInterval(interval);
        resolve(cached);
      } else if (Date.now() - start > timeoutMs) {
        clearInterval(interval);
        resolve(null);
      }
    }, 500);
  });
}

export default function ResultsPage() {
  const [saved, setSaved] = useState<SavedPayload | null>(null);
  const [showAllInvestmentDetails, setShowAllInvestmentDetails] = useState(false);
  const [factors, setFactors] = useState<InvestmentFactor[]>([]);
  const [scoringDone, setScoringDone] = useState(false);
  const [copied, setCopied] = useState(false);
  const [actionPlan, setActionPlan] = useState<string | null>(null);
  const [actionPlanLoading, setActionPlanLoading] = useState(false);
  const [actionPlanError, setActionPlanError] = useState<string | null>(null);
  const [userGoals, setUserGoals] = useState("");

  type LocalInsights = {
    zip: string;
    state: string;
    evChargers: { totalFound: number; radiusMiles: number; nearestDistance?: number; sampleLocations: Array<{ name: string; distance: number }> } | null;
    solar: { annualKwh: number; capacityKw: number; solarResourceDaily: number; message: string } | null;
  };
  const [localInsights, setLocalInsights] = useState<LocalInsights | null>(null);
  const [localLoading, setLocalLoading] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("greenscore.answers.v1");
      if (!raw) return;
      const parsed = JSON.parse(raw) as SavedPayload;

      // Migrate v3 singular fields to v4 arrays
      if (!parsed.answers.banks) {
        parsed.answers.banks = parsed.answers.bankSlug || parsed.answers.bankCategory
          ? [{
              bankSlug: (parsed.answers.bankSlug ?? null) as string | null,
              bankDisplayName: parsed.answers.bankDisplayName ?? "",
              bankCategory: (parsed.answers.bankCategory ?? null) as BankCategory | null,
            }]
          : [];
      }
      if (!parsed.answers.vehicles) {
        parsed.answers.vehicles = parsed.answers.transport
          ? [parsed.answers.transport]
          : [];
      }

      setSaved(parsed);
    } catch (err) {
      console.warn("[results] Failed to parse saved quiz data:", err);
    }
  }, []);

  const tickers = useMemo(() => {
    return parseTickers(saved?.answers.tickers ?? "");
  }, [saved]);

  // Score banking (synchronous — static data)
  const bankResult: MultiBankScoreResult = useMemo(() => {
    return scoreBanks(
      (saved?.answers.banks ?? []).map((b) => ({
        bankSlug: b.bankSlug,
        bankCategory: b.bankCategory,
        bankRating: b.bankRating ?? null,
        bankDisplayName: b.bankDisplayName,
      })),
    );
  }, [saved]);

  // Score transport (synchronous — data fetched during quiz)
  const transportResult: MultiTransportScoreResult = useMemo(() => {
    return scoreVehicles(saved?.answers.vehicles ?? []);
  }, [saved]);

  // Score heating (synchronous — static data)
  const heatingResult: HeatingScoreResult = useMemo(() => {
    return scoreHeating(saved?.answers.heating, saved?.answers.heatingState);
  }, [saved]);

  // Score air travel (synchronous — tier-based)
  const airTravelResult: AirTravelScoreResult = useMemo(() => {
    return scoreAirTravel(saved?.answers.airTravel);
  }, [saved]);

  // Fetch local insights when zip code is available
  useEffect(() => {
    const zip = saved?.answers.zipCode;
    if (!zip || zip.length !== 5) return;

    setLocalLoading(true);
    fetch(`/api/local-insights?zip=${encodeURIComponent(zip)}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => { if (data) setLocalInsights(data); })
      .catch((err) => console.warn("[results] Local insights failed:", err))
      .finally(() => setLocalLoading(false));
  }, [saved]);

  // Score tickers: check prescore cache first, then fetch uncached ones live
  const scoreAllTickers = useCallback(async (tickerList: string[]) => {
    if (tickerList.length === 0) {
      setScoringDone(true);
      return;
    }

    // Initialize from cache where available, otherwise loading
    const initial = tickerList.map((t) => {
      const cached = getCached(t);
      return cached ?? {
        ticker: t,
        points: 0,
        explanation: "Fetching SEC holdings data…",
        status: "loading" as const,
      };
    });
    setFactors(initial);

    // Identify which tickers still need fetching
    const uncached = tickerList.filter((t) => !getCached(t));

    if (uncached.length === 0) {
      setScoringDone(true);
      return;
    }

    // Check if pre-scoring is in flight
    const activePrescore = getActivePrescore();

    for (const ticker of uncached) {
      let result: InvestmentFactor;

      // If prescore is running for this ticker, poll cache briefly before fetching
      if (activePrescore?.includes(ticker)) {
        result = await pollForCachedResult(ticker, 15_000) ?? await scoreSingleTickerLive(ticker);
      } else {
        result = await scoreSingleTickerLive(ticker);
      }

      // Cache the result for future visits
      if (result.status === "scored") {
        writeOne(ticker, result);
      }

      setFactors((prev) =>
        prev.map((f) => (f.ticker === ticker ? result : f)),
      );
    }
    setScoringDone(true);
  }, []);

  useEffect(() => {
    if (tickers.length > 0) {
      scoreAllTickers(tickers);
    }
  }, [tickers, scoreAllTickers]);

  // Compute aggregated investment score from resolved factors
  const investmentScore = useMemo(() => {
    const scored = factors.filter((f) => f.status === "scored");
    if (scored.length === 0) return { points: 0, maxPoints: 36 as const, confidence: "low" as const };

    const avg = scored.reduce((sum, f) => sum + f.points, 0) / scored.length;
    const scoredRatio = scored.length / factors.length;
    const confidence = scoredRatio >= 0.8 ? "high" : scoredRatio >= 0.5 ? "medium" : "low";

    return { points: Math.round(avg), maxPoints: 36 as const, confidence: confidence as "low" | "medium" | "high" };
  }, [factors]);

  const isLoading = factors.some((f) => f.status === "loading");

  // Compute live overall GreenScore from available subscores
  const overallScore = useMemo(() => {
    const bankPts = bankResult.points;
    const investPts = scoringDone || tickers.length === 0 ? investmentScore.points : 0;
    const transportPts = transportResult.points;
    const heatingPts = heatingResult.points;
    const airTravelPts = airTravelResult.points;
    const totalPoints = bankPts + investPts + transportPts + heatingPts + airTravelPts;
    const maxPoints = bankResult.maxPoints + investmentScore.maxPoints + transportResult.maxPoints + heatingResult.maxPoints + airTravelResult.maxPoints; // 18 + 36 + 18 + 18 + 10 = 100
    return { totalPoints, maxPoints, pct: totalPoints };
  }, [bankResult, investmentScore, transportResult, heatingResult, airTravelResult, scoringDone, tickers.length]);

  const scoreLabel = overallScore.pct >= 70 ? "Strong" : overallScore.pct >= 40 ? "Moderate — room to grow" : "Needs attention";

  const shareUrl = useMemo(() => {
    if (typeof window === "undefined") return "";
    const params = new URLSearchParams({
      s: String(overallScore.pct),
      b: String(bankResult.points),
      t: String(transportResult.points),
      h: String(heatingResult.points),
      i: String(investmentScore.points),
      a: String(airTravelResult.points),
    });
    return `${window.location.origin}/share?${params.toString()}`;
  }, [overallScore.pct, bankResult.points, transportResult.points, heatingResult.points, investmentScore.points, airTravelResult.points]);

  function handleShare() {
    navigator.clipboard.writeText(shareUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  async function fetchActionPlan() {
    if (!saved) return;
    setActionPlanLoading(true);
    setActionPlanError(null);

    const vehicleDescriptions = (saved.answers.vehicles ?? []).map((v) => {
      if (v.type === "vehicle") return `${v.year} ${v.make} ${v.model} (${v.co2Gpm} g CO2/mile, ${v.fuelType})`;
      if (v.type === "none") return "No car";
      return "Not sure";
    });

    try {
      const res = await fetch("/api/action-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          overallScore: overallScore.pct,
          maxScore: 100,
          bankScore: bankResult.points,
          bankMax: bankResult.maxPoints,
          transportScore: transportResult.points,
          transportMax: transportResult.maxPoints,
          heatingScore: heatingResult.points,
          heatingMax: heatingResult.maxPoints,
          airTravelScore: airTravelResult.points,
          airTravelMax: airTravelResult.maxPoints,
          airTravelTier: airTravelResult.tierLabel,
          investScore: investmentScore.points,
          investMax: investmentScore.maxPoints,
          bankNames: (saved.answers.banks ?? []).map((b) => b.bankDisplayName),
          vehicleDescriptions,
          heatingType: saved.answers.heating ?? null,
          heatingState: saved.answers.heatingState ?? null,
          tickers: saved.answers.tickers ?? "",
          zipCode: saved.answers.zipCode ?? null,
          evChargersNearby: localInsights?.evChargers?.totalFound ?? null,
          solarPotentialKwh: localInsights?.solar?.annualKwh ?? null,
          userGoals: userGoals.trim().slice(0, 500) || null,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({ error: "Unknown error" }));
        throw new Error(data.error || `HTTP ${res.status}`);
      }

      const data = await res.json();
      setActionPlan(data.plan);
    } catch (e) {
      setActionPlanError(e instanceof Error ? e.message : "Failed to generate action plan");
    } finally {
      setActionPlanLoading(false);
    }
  }

  const recommendations = useMemo(() => {
    if (!saved) return [];
    return getRecommendations({
      bankResult,
      transportResult,
      heatingResult,
      investmentScore,
      factors,
      answers: saved.answers,
    });
  }, [saved, bankResult, transportResult, heatingResult, investmentScore, factors]);

  // Guard: no quiz data → prompt user to take the quiz
  if (!saved) {
    return (
      <main id="main-content" className="gs-container py-10 sm:py-12">
        <SiteNav />
        <div className="mx-auto mt-20 max-w-md text-center">
          <Card className="flex flex-col items-center gap-4 px-8 py-10">
            <h1 className="text-xl font-semibold tracking-tight">No results yet</h1>
            <p className="text-sm text-[color:var(--gs-text-muted)]">
              Take the GreenScore quiz first — it&apos;s free, private, and takes about 5 minutes.
            </p>
            <Link href="/quiz" className="inline-flex items-center justify-center gap-2 rounded-full font-semibold transition active:translate-y-px focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600/40 bg-[color:var(--gs-accent)] text-white shadow-sm hover:bg-[color:var(--gs-accent-deep)] px-5 py-2.5 text-sm">
              Start the quiz
            </Link>
          </Card>
        </div>
      </main>
    );
  }

  return (
    <main id="main-content" className="gs-container py-10 sm:py-12">

      <SiteNav />

      <div className="mt-8 grid gap-6 md:grid-cols-[minmax(0,1.6fr),minmax(0,1.4fr)] md:items-start">
        <Card className="flex flex-col items-center gap-6 text-center">
          <div className="space-y-2">
            <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">
              Your GreenScore
            </h1>
            <p className="text-xs text-[color:var(--gs-text-muted)]">
              Based on your banking, transport, heating, air travel, and investment choices.
            </p>
          </div>

          <div className="relative flex h-44 w-44 items-center justify-center">
            <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-emerald-200 via-emerald-50 to-amber-100" />
            <div className="absolute inset-4 rounded-full border border-emerald-200/80 bg-white shadow-inner" />
            <div className="relative flex flex-col items-center justify-center gap-1">
              <span className="text-4xl font-semibold sm:text-5xl">
                {isLoading ? "…" : overallScore.pct}
              </span>
              <span className="text-xs font-medium uppercase tracking-wide text-[color:var(--gs-text-muted)]">
                out of 100
              </span>
              {!isLoading && (
                <span className="mt-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-emerald-800">
                  {scoreLabel}
                </span>
              )}
            </div>
          </div>

          <div className="text-xs text-[color:var(--gs-text-muted)]">
            {overallScore.totalPoints} / {overallScore.maxPoints} points from banking ({bankResult.points}/{bankResult.maxPoints}) + transport ({transportResult.points}/{transportResult.maxPoints}) + heating ({heatingResult.points}/{heatingResult.maxPoints}) + air travel ({airTravelResult.points}/{airTravelResult.maxPoints}) + investments ({investmentScore.points}/{investmentScore.maxPoints})
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link href="/quiz" className="inline-flex items-center justify-center gap-2 rounded-full font-semibold transition active:translate-y-px focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600/40 bg-[color:var(--gs-accent)] text-white shadow-sm hover:bg-[color:var(--gs-accent-deep)] px-3 py-1.5 text-xs">
              Retake quiz
            </Link>
            <Link href="/methodology" className="inline-flex items-center justify-center gap-2 rounded-full font-semibold transition active:translate-y-px focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600/30 border border-[color:var(--gs-border-subtle)] bg-white/70 text-[color:var(--gs-text-main)] shadow-sm hover:bg-white px-3 py-1.5 text-xs">
              Methodology
            </Link>
            <Button variant="secondary" size="sm" onClick={handleShare}>
              {copied ? "Link copied!" : "Share results"}
            </Button>
          </div>
        </Card>

        <div className="space-y-4">
          {/* ── Banking Card ── */}
          <Card className="space-y-3">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
              Banking (Bank.Green data)
            </p>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="text-sm font-semibold text-[color:var(--gs-text-main)]">
                Banking score: {bankResult.points} / {bankResult.maxPoints}
              </div>
            </div>
            {bankResult.individual.length === 0 ? (
              <p className="text-sm text-[color:var(--gs-text-muted)]">
                No banks entered — scored neutrally.
              </p>
            ) : (
              <div className="space-y-2">
                {bankResult.individual.map((b, idx) => (
                  <div key={idx} className="rounded-2xl border border-[color:var(--gs-border-subtle)] bg-white/60 p-3">
                    <div className="flex items-center justify-between gap-2">
                      <div className="text-sm">
                        <span className="font-semibold text-slate-900">{b.bankName}</span>
                        {idx === 0 && bankResult.individual.length > 1 && (
                          <span className="ml-2 text-xs text-emerald-700">(primary)</span>
                        )}
                      </div>
                      <span className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-semibold ring-1 ${RATING_BADGE_COLORS[b.rating] ?? RATING_BADGE_COLORS.ok}`}>
                        {b.rating}
                      </span>
                    </div>
                    <div className="mt-1 text-xs text-slate-500">{b.explanation}</div>
                  </div>
                ))}
              </div>
            )}
            <div className="text-xs text-slate-500">
              Source: <span className="font-semibold">Bank.Green</span> — fossil fuel lending data
              {bankResult.individual.some((b) => b.source === "category-fallback") && " (some estimated from bank type)"}
            </div>
          </Card>

          {/* ── Transport Card ── */}
          <Card className="space-y-3">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
              Transport (EPA data)
            </p>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="text-sm font-semibold text-[color:var(--gs-text-main)]">
                Transport score: {transportResult.points} / {transportResult.maxPoints}
              </div>
            </div>
            {transportResult.individual.length === 0 ? (
              <p className="text-sm text-[color:var(--gs-text-muted)]">
                No vehicles entered — scored neutrally.
              </p>
            ) : (
              <div className="space-y-2">
                {transportResult.individual.map((t, idx) => (
                  <div key={idx} className="rounded-2xl border border-[color:var(--gs-border-subtle)] bg-white/60 p-3">
                    <div className="flex items-center justify-between gap-2">
                      <div className="text-sm">
                        <span className="font-semibold text-slate-900">{t.vehicleLabel}</span>
                        {idx === 0 && transportResult.individual.length > 1 && (
                          <span className="ml-2 text-xs text-emerald-700">(primary)</span>
                        )}
                      </div>
                      <span className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-semibold ring-1 ${RATING_BADGE_COLORS[t.rating] ?? RATING_BADGE_COLORS.ok}`}>
                        {t.rating}
                      </span>
                    </div>
                    <div className="mt-1 text-xs text-slate-500">{t.explanation}</div>
                  </div>
                ))}
              </div>
            )}
            <div className="text-xs text-slate-500">
              Source: <span className="font-semibold">
                {transportResult.individual.some((t) => t.source === "epa") ? "EPA fueleconomy.gov" : "User selection"}
              </span>
              {transportResult.individual.some((t) => t.source === "epa") && " — CO₂ tailpipe emissions data"}
            </div>
          </Card>

          {/* ── Heating Card ── */}
          <Card className="space-y-3">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
              Home Heating (EIA / EPA eGRID data)
            </p>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="text-sm font-semibold text-[color:var(--gs-text-main)]">
                Heating score: {heatingResult.points} / {heatingResult.maxPoints}
              </div>
              <span className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-semibold ring-1 ${RATING_BADGE_COLORS[heatingResult.rating] ?? RATING_BADGE_COLORS.ok}`}>
                {heatingResult.rating}
              </span>
            </div>
            <div className="rounded-2xl border border-[color:var(--gs-border-subtle)] bg-white/60 p-3">
              <div className="flex items-center justify-between gap-2">
                <div className="text-sm font-semibold text-slate-900">{heatingResult.heatingLabel}</div>
                {saved?.answers.heatingState && (
                  <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600">
                    {saved.answers.heatingState}
                  </span>
                )}
              </div>
              <div className="mt-1 text-xs text-slate-500">{heatingResult.explanation}</div>
              {heatingResult.stateModifier && (
                <div className="mt-2 flex items-center gap-1.5 text-xs">
                  <span className={heatingResult.stateModifier.adjustment > 0 ? "text-emerald-700" : "text-orange-700"}>
                    {heatingResult.stateModifier.adjustment > 0 ? "+" : ""}{heatingResult.stateModifier.adjustment} pts
                  </span>
                  <span className="text-slate-400">state grid modifier</span>
                </div>
              )}
            </div>
            <div className="text-xs text-slate-500">
              Source: <span className="font-semibold">EIA emissions coefficients</span>
              {heatingResult.stateModifier && " + EPA eGRID state grid data"}
            </div>
          </Card>

          {/* ── Air Travel Card ── */}
          <Card className="space-y-3">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
              Air Travel (awareness)
            </p>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="text-sm font-semibold text-[color:var(--gs-text-main)]">
                Air travel score: {airTravelResult.points} / {airTravelResult.maxPoints}
              </div>
              <span className="gs-chip">{airTravelResult.tierLabel}</span>
            </div>
            <div className="rounded-2xl border border-[color:var(--gs-border-subtle)] bg-white/60 p-3">
              <div className="text-sm text-slate-700">{airTravelResult.explanation}</div>
              <div className="mt-2 rounded-xl bg-blue-50/60 px-3 py-2 text-xs text-blue-800">
                <span className="font-semibold">Did you know?</span> {airTravelResult.didYouKnow}
              </div>
            </div>
            <div className="text-xs text-slate-500">
              Source: <span className="font-semibold">ICAO emissions factors</span> — scored gently for awareness
            </div>
          </Card>

          {/* ── Local Insights Card ── */}
          {(localLoading || (localInsights && (localInsights.evChargers || localInsights.solar))) && (
            <Card className="space-y-3">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                Local insights for {localInsights?.zip ?? "your area"}
              </p>

              {localLoading ? (
                <p role="status" aria-live="polite" className="text-sm text-slate-400 animate-pulse">Loading local data...</p>
              ) : localInsights && (
                <div className="space-y-3">
                  {/* EV Chargers */}
                  {localInsights.evChargers && (
                    <div className="rounded-2xl border border-[color:var(--gs-border-subtle)] bg-white/60 p-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold text-slate-900">EV Charging Near You</span>
                        <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[11px] font-semibold text-blue-700">
                          {localInsights.evChargers.totalFound} stations
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-slate-600">
                        {localInsights.evChargers.totalFound > 0
                          ? `There are ${localInsights.evChargers.totalFound} public charging stations within ${localInsights.evChargers.radiusMiles} miles of you.${
                              localInsights.evChargers.nearestDistance != null
                                ? ` The nearest is ${localInsights.evChargers.nearestDistance.toFixed(1)} miles away.`
                                : ""
                            }`
                          : `We didn't find public chargers within ${localInsights.evChargers.radiusMiles} miles, but the EV charging network is growing fast.`}
                      </p>
                      {localInsights.evChargers.sampleLocations.length > 0 && (
                        <div className="mt-2 space-y-1">
                          {localInsights.evChargers.sampleLocations.map((loc, i) => (
                            <div key={i} className="flex justify-between text-xs text-slate-500">
                              <span>{loc.name}</span>
                              <span>{loc.distance} mi</span>
                            </div>
                          ))}
                        </div>
                      )}
                      <p className="mt-2 text-xs text-slate-400">Source: OpenChargeMap</p>
                    </div>
                  )}

                  {/* Solar Potential */}
                  {localInsights.solar && (
                    <div className="rounded-2xl border border-[color:var(--gs-border-subtle)] bg-white/60 p-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold text-slate-900">Solar Potential</span>
                        <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-semibold text-amber-700">
                          {localInsights.solar.solarResourceDaily} sun hrs/day
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-slate-600">
                        {localInsights.solar.message}
                      </p>
                      <p className="mt-2 text-xs text-slate-400">Source: NREL PVWatts</p>
                    </div>
                  )}
                </div>
              )}
            </Card>
          )}

          {/* ── Investments Card ── */}
          <Card className="space-y-3">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
              Investments {isLoading ? "(scoring…)" : "(live SEC data)"}
            </p>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="text-sm font-semibold text-[color:var(--gs-text-main)]">
                {isLoading ? (
                  <span className="text-slate-400">Scoring…</span>
                ) : (
                  <>Investments score: {investmentScore.points} / {investmentScore.maxPoints}</>
                )}
              </div>
              {scoringDone && (
                <span className="gs-chip">Confidence: {investmentScore.confidence}</span>
              )}
            </div>
            {tickers.length === 0 ? (
              <p className="text-sm text-[color:var(--gs-text-muted)]">
                No tickers found from the quiz yet. Try entering something like <span className="font-semibold">VTI, ICLN</span>.
              </p>
            ) : (
              <div className="space-y-3 text-sm">
                <div className="rounded-2xl border border-[color:var(--gs-border-subtle)] bg-white/60 p-3">
                  <div className="flex items-center justify-between gap-3">
                    <div className="text-xs font-semibold text-slate-600">
                      How we scored your tickers
                    </div>

                    {factors.length > 3 && scoringDone && (
                      <button
                        type="button"
                        className="text-xs font-semibold text-emerald-800 underline-offset-2 hover:text-emerald-900 hover:underline"
                        onClick={() => setShowAllInvestmentDetails((v) => !v)}
                        aria-expanded={showAllInvestmentDetails}
                      >
                        {showAllInvestmentDetails
                          ? "Hide details"
                          : `Show all (${factors.length})`}
                      </button>
                    )}
                  </div>

                  <div className={showAllInvestmentDetails ? "mt-2 max-h-80 overflow-auto pr-1" : "mt-2"}>
                    <ul className="space-y-2 text-sm">
                      {(showAllInvestmentDetails
                        ? factors
                        : factors.slice(0, 3)
                      ).map((f) => (
                        <li
                          key={f.ticker}
                          className="flex flex-col gap-0.5 sm:flex-row sm:items-start sm:justify-between"
                        >
                          <div>
                            <span className="font-semibold text-slate-900">{f.ticker}</span>
                            {f.name ? <span className="text-slate-500"> · {f.name}</span> : null}
                            <div className="text-xs text-slate-500">{f.explanation}</div>
                            {f.filingDate && (
                              <div className="text-xs text-slate-400">
                                SEC filing: {f.filingDate}
                              </div>
                            )}
                            {f.fossilHoldings && f.fossilHoldings.length > 0 && (
                              <div className="mt-1 text-xs text-slate-400">
                                Top fossil holdings:{" "}
                                {f.fossilHoldings.map((h) =>
                                  `${h.name} (${h.pctOfPortfolio.toFixed(1)}%)`
                                ).join(", ")}
                              </div>
                            )}
                          </div>

                          <div className="mt-1 inline-flex w-fit items-center gap-2 rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-700 ring-1 ring-black/5 sm:mt-0">
                            {f.status === "loading" ? (
                              <span className="text-slate-400 animate-pulse">Scoring…</span>
                            ) : f.status === "error" ? (
                              <span className="text-red-500">Error</span>
                            ) : (
                              <>
                                <span>{f.points}</span>
                                <span className="text-slate-400">/ 36</span>
                              </>
                            )}
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}

            <div className="text-xs text-slate-500">
              Source: <span className="font-semibold">SEC EDGAR N-PORT filings</span> — fossil exposure scored from actual fund holdings
            </div>
          </Card>

          {/* ── Recommendations ── */}
          <Card className="space-y-3">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
              {recommendations.length > 0 ? "Your top improvements" : "Great job"}
            </p>
            {recommendations.length === 0 ? (
              <p className="text-sm text-[color:var(--gs-text-muted)]">
                Your scores are strong across the board. Keep it up!
              </p>
            ) : (
              <ul className="space-y-3 text-sm">
                {recommendations.map((rec) => (
                  <li key={rec.title} className="flex gap-3">
                    <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-[11px] font-semibold text-emerald-700">
                      {"\u2713"}
                    </div>
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-medium">{rec.title}</p>
                        <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${CATEGORY_CHIP_COLORS[rec.category]}`}>
                          {rec.category}
                        </span>
                      </div>
                      <p className="text-xs text-[color:var(--gs-text-muted)]">{rec.body}</p>
                      {rec.link && (
                        <a
                          href={rec.link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-800 underline-offset-2 hover:text-emerald-900 hover:underline"
                        >
                          {rec.link.label} &rarr;
                        </a>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </Card>

          {/* ── AI Action Plan ── */}
          <Card className="space-y-3">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
              Your personalized action plan
            </p>
            {actionPlan ? (
              <div className="prose prose-sm prose-slate max-w-none text-sm leading-relaxed [&_strong]:text-slate-900" dangerouslySetInnerHTML={{
                __html: actionPlan
                  .replace(/<[^>]*>/g, "")                 // strip any HTML tags from LLM output first
                  .replace(/^#{1,3}\s+.*$/gm, "")         // strip markdown headers
                  .replace(/^---+$/gm, "")                 // strip horizontal rules
                  .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
                  .replace(/\*(.*?)\*/g, "<em>$1</em>")
                  .replace(/\n{2,}/g, "<br /><br />")
                  .replace(/\n/g, "<br />")
                  .trim(),
              }} />
            ) : actionPlanLoading ? (
              <div role="status" aria-live="polite" className="flex items-center gap-2 text-sm text-slate-400 animate-pulse">
                <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Generating your personalized plan...
              </div>
            ) : actionPlanError ? (
              <div className="space-y-2">
                <p className="text-sm text-red-600">{actionPlanError}</p>
                <Button variant="secondary" size="sm" onClick={fetchActionPlan}>
                  Try again
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-sm text-[color:var(--gs-text-muted)]">
                  Get a personalized action plan tailored to your specific scores and answers, powered by AI.
                </p>
                <div className="space-y-1.5">
                  <label htmlFor="user-goals" className="block text-xs font-medium text-slate-600">
                    What are your green goals? <span className="font-normal text-slate-400">(optional)</span>
                  </label>
                  <textarea
                    id="user-goals"
                    value={userGoals}
                    onChange={(e) => setUserGoals(e.target.value.slice(0, 500))}
                    placeholder="e.g., I want to switch to an EV but I'm not sure where to start, or I'd like to reduce my carbon footprint on a budget..."
                    rows={3}
                    maxLength={500}
                    className="w-full rounded-xl border border-[color:var(--gs-border-subtle)] bg-white/70 px-3 py-2 text-sm text-slate-700 placeholder:text-slate-400 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-600/20"
                  />
                  <p className="text-right text-[10px] text-slate-400">{userGoals.length}/500</p>
                </div>
                <Button variant="primary" size="sm" onClick={fetchActionPlan}>
                  Generate my action plan
                </Button>
              </div>
            )}
            <p className="text-xs text-slate-400">
              Powered by Claude — no personal data is stored.
            </p>
          </Card>

          {/* Coaching CTA */}
          <Card className="space-y-3 text-center">
            <p className="text-sm font-semibold text-slate-900">
              Want hands-on help making these changes?
            </p>
            <p className="text-xs leading-relaxed text-[color:var(--gs-text-muted)]">
              From choosing a heat pump to navigating rebate programs to building
              greener habits — our sustainability coaches can help you take the next step.
            </p>
            <a href="mailto:hello@greenscore.earth" className="inline-flex items-center justify-center gap-2 rounded-full font-semibold transition active:translate-y-px focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600/30 border border-[color:var(--gs-border-subtle)] bg-white/70 text-[color:var(--gs-text-main)] shadow-sm hover:bg-white px-3 py-1.5 text-xs">
              Contact us
            </a>
          </Card>
        </div>
      </div>
    </main>
  );
}
