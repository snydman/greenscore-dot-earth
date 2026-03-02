"use client";

import { scoreInvestments } from "../../lib/scoring/investments";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import funds from "../../data/funds.json";
import { Button, Card } from "../../components/ui";

type SavedPayload = {
  version: number;
  savedAt: string;
  answers: {
    tickers: string;
  };
};

function parseTickers(raw: string): string[] {
  return raw
    .split(",")
    .map((t) => t.trim().toUpperCase())
    .filter(Boolean);
}

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
    body: "Even if it’s a few years out, planning ahead makes incentives and charging much easier.",
  },
  {
    title: "Get a quote for a heat pump",
    body: "A high-efficiency heat pump can cut emissions and improve comfort, especially in drafty homes.",
  },
];

export default function ResultsPage() {
  const [saved, setSaved] = useState<SavedPayload | null>(null);

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

  const lookup = useMemo(() => {
    const found: Array<{ ticker: string; name?: string }> = [];
    const unknown: string[] = [];

    for (const t of tickers) {
      const entry = (funds as Record<string, any>)[t];
      if (entry) {
        found.push({ ticker: t, name: entry.name });
      } else {
        unknown.push(t);
      }
    }
    return { found, unknown };
  }, [tickers]);
  const investment = useMemo(() => {
    const raw = saved?.answers.tickers ?? "";
    return scoreInvestments(raw, funds as Record<string, any>);
  }, [saved]);
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
            <a href="#">
              <Button variant="secondary" size="sm">
                Methodology (coming soon)
              </Button>
            </a>
          </div>
        </Card>

        <div className="space-y-4">
          <Card className="space-y-3">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
              Investments (data-backed prototype)
            </p>
            <div className="flex flex-wrap items-center justify-between gap-3">
  <div className="text-sm font-semibold text-[color:var(--gs-text-main)]">
    Investments score: {investment.points} / {investment.maxPoints}
  </div>
  <span className="gs-chip">Confidence: {investment.confidence}</span>
</div>
            {tickers.length === 0 ? (
              <p className="text-sm text-[color:var(--gs-text-muted)]">
                No tickers found from the quiz yet. Try entering something like <span className="font-semibold">VTI, ICLN</span>.
              </p>
            ) : (
              <div className="space-y-3 text-sm">
                <div className="flex flex-wrap gap-2">
                  {lookup.found.map((f) => (
                    <span key={f.ticker} className="gs-chip">
                      {f.ticker}
                      <span className="text-[11px] font-semibold text-slate-600">
                        {f.name ? `· ${f.name}` : ""}
                      </span>
                    </span>
                  ))}
                </div>

                {lookup.unknown.length > 0 && (
                  <div className="rounded-2xl border border-[color:var(--gs-border-subtle)] bg-white/60 p-3">
                    <div className="text-xs font-semibold text-slate-600">Unknown tickers</div>
                    <div className="mt-1 flex flex-wrap gap-2">
                      {lookup.unknown.map((t) => (
                        <span
                          key={t}
                          className="inline-flex items-center rounded-full border border-black/10 bg-white px-3 py-1 text-xs font-semibold text-slate-700"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                    <div className="mt-2 text-xs text-slate-500">
                      We’ll treat unknown tickers neutrally until we expand coverage.
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="text-xs text-slate-500">
              Source: <span className="font-semibold">local funds.json</span> (generated by <code className="font-mono">npm run ingest:funds</code>)
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