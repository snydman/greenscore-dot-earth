"use client";

import { scoreSingleTickerLive, parseTickers } from "../../lib/scoring/investments";
import type { InvestmentFactor } from "../../lib/scoring/investments";
import { getCached, writeOne, getActivePrescore } from "../../lib/scoring/score-cache";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Button, Card } from "../../components/ui";

type SavedPayload = {
  version: number;
  savedAt: string;
  answers: {
    tickers: string;
  };
};

const MOCK_SCORE = 62;
const MOCK_MAX = 100;

const CATEGORIES = [
  { name: "Money & investments", score: 58 },
  { name: "Transport", score: 65 },
  { name: "Home energy", score: 54 },
  { name: "Everyday choices", score: 72 },
];

const IMPROVEMENTS = [
  {
    title: "Move one account to a greener bank",
    body: "Shift a checking or savings account toward a bank with lower exposure to fossil fuel lending.",
  },
  {
    title: "Plan your next car as electric or hybrid",
    body: "Even if it's a few years out, planning ahead makes incentives and charging much easier.",
  },
  {
    title: "Get a quote for a heat pump",
    body: "A high-efficiency heat pump can cut emissions and improve comfort, especially in drafty homes.",
  },
];

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

  useEffect(() => {
    try {
      const raw = localStorage.getItem("greenscore.answers.v1");
      if (!raw) return;
      const parsed = JSON.parse(raw) as SavedPayload;
      setSaved(parsed);
    } catch {
      // ignore
    }
  }, []);

  const tickers = useMemo(() => {
    return parseTickers(saved?.answers.tickers ?? "");
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
    if (scored.length === 0) return { points: 0, maxPoints: 40 as const, confidence: "low" as const };

    const avg = scored.reduce((sum, f) => sum + f.points, 0) / scored.length;
    const scoredRatio = scored.length / factors.length;
    const confidence = scoredRatio >= 0.8 ? "high" : scoredRatio >= 0.5 ? "medium" : "low";

    return { points: Math.round(avg), maxPoints: 40 as const, confidence: confidence as "low" | "medium" | "high" };
  }, [factors]);

  const isLoading = factors.some((f) => f.status === "loading");

  return (
    <main className="gs-container py-10 sm:py-12">

      <header className="flex items-center justify-between text-xs sm:text-sm text-[color:var(--gs-text-muted)]">
        <Link
          href="/quiz"
          className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-800 underline-offset-4 hover:text-emerald-900 hover:underline"
        >
          ← Back to quiz
        </Link>
        <span className="text-[0.7rem]">Placeholder results based on example inputs.</span>
      </header>

      <div className="mt-8 grid gap-6 md:grid-cols-[minmax(0,1.6fr),minmax(0,1.4fr)] md:items-start">
        <Card className="flex flex-col items-center gap-6 text-center">
          <div className="space-y-2">
            <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">
              Your GreenScore (example)
            </h1>
            <p className="text-xs text-[color:var(--gs-text-muted)]">
              This is a placeholder score to illustrate the experience — it&apos;s not based on live data yet.
            </p>
          </div>

          <div className="relative flex h-44 w-44 items-center justify-center">
            <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-emerald-200 via-emerald-50 to-amber-100" />
            <div className="absolute inset-4 rounded-full border border-emerald-200/80 bg-white shadow-inner" />
            <div className="relative flex flex-col items-center justify-center gap-1">
              <span className="text-4xl font-semibold sm:text-5xl">{MOCK_SCORE}</span>
              <span className="text-xs font-medium uppercase tracking-wide text-[color:var(--gs-text-muted)]">
                out of {MOCK_MAX}
              </span>
              <span className="mt-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-emerald-800">
                Moderate — room to grow
              </span>
            </div>
          </div>

          <div className="text-xs text-[color:var(--gs-text-muted)]">
            Confidence: <span className="font-semibold text-[color:var(--gs-text-main)]">Low (prototype)</span>{" "}
            — this is example output to validate the experience, not a calibrated benchmark.
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link href="/quiz">
              <Button variant="primary" size="sm">
                Retake quiz
              </Button>
            </Link>
            <Link href="/methodology">
              <Button variant="secondary" size="sm">
                Methodology
              </Button>
            </Link>
          </div>
        </Card>

        <div className="space-y-4">
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
                                <span className="text-slate-400">/ 40</span>
                                {f.grade ? (
                                  <span className="ml-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-800 ring-1 ring-emerald-200/60">
                                    {f.grade}
                                  </span>
                                ) : (
                                  <span className="ml-1 rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-semibold text-amber-800 ring-1 ring-amber-200/60">
                                    Unknown
                                  </span>
                                )}
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

          <Card className="space-y-3">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
              Category breakdown (example)
            </p>
            <ul className="space-y-3">
              {CATEGORIES.map((cat) => (
                <li key={cat.name} className="flex items-center justify-between gap-4 text-sm">
                  <div className="flex flex-col">
                    <span className="font-medium">{cat.name}</span>
                    <span className="text-xs text-[color:var(--gs-text-muted)]">
                      Placeholder sub-score, not yet calibrated.
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold">{cat.score}</span>
                    <span className="text-[11px] text-slate-400">/ 100</span>
                  </div>
                </li>
              ))}
            </ul>
          </Card>

          <Card className="space-y-3">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
              Top 3 improvements (example)
            </p>
            <ul className="space-y-3 text-sm">
              {IMPROVEMENTS.map((item) => (
                <li key={item.title} className="flex gap-3">
                  <div className="mt-0.5 flex h-6 w-6 items-center justify-center rounded-full bg-emerald-50 text-[11px] font-semibold text-emerald-700">
                    ✓
                  </div>
                  <div className="space-y-1">
                    <p className="font-medium">{item.title}</p>
                    <p className="text-xs text-[color:var(--gs-text-muted)]">{item.body}</p>
                  </div>
                </li>
              ))}
            </ul>
          </Card>
        </div>
      </div>
    </main>
  );
}
