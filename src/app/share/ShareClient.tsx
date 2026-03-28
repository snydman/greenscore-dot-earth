"use client";

import Link from "next/link";
import { Button, Card } from "../../components/ui";

type Props = {
  score: number;
  bank: number;
  transport: number;
  heating: number;
  invest: number;
  airTravel: number;
};

export default function ShareClient({ score, bank, transport, heating, invest, airTravel }: Props) {
  const label = score >= 70 ? "Strong" : score >= 40 ? "Moderate — room to grow" : "Needs attention";

  return (
    <main className="gs-container py-10 sm:py-12">
      <div className="mx-auto max-w-lg">
        <Card className="flex flex-col items-center gap-6 text-center">
          <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">
            I scored {score}/100 on GreenScore
          </h1>
          <p className="text-sm text-[color:var(--gs-text-muted)]">
            What will you get?
          </p>

          <div className="relative flex h-44 w-44 items-center justify-center">
            <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-emerald-200 via-emerald-50 to-amber-100" />
            <div className="absolute inset-4 rounded-full border border-emerald-200/80 bg-white shadow-inner" />
            <div className="relative flex flex-col items-center justify-center gap-1">
              <span className="text-4xl font-semibold sm:text-5xl">{score}</span>
              <span className="text-xs font-medium uppercase tracking-wide text-[color:var(--gs-text-muted)]">out of 100</span>
              <span className="mt-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-emerald-800">
                {label}
              </span>
            </div>
          </div>

          <div className="grid w-full grid-cols-2 gap-3 text-sm sm:grid-cols-4">
            {[
              { label: "Banking", pts: bank, max: 18 },
              { label: "Transport", pts: transport, max: 18 },
              { label: "Heating", pts: heating, max: 18 },
              { label: "Air Travel", pts: airTravel, max: 10 },
              { label: "Investments", pts: invest, max: 36 },
            ].map((c) => (
              <div key={c.label} className="rounded-xl bg-slate-50 px-3 py-2 ring-1 ring-black/5">
                <div className="text-xs font-semibold text-slate-500">{c.label}</div>
                <div className="font-semibold">{c.pts} / {c.max}</div>
              </div>
            ))}
          </div>

          <Link href="/quiz">
            <Button variant="primary">Take the quiz and compare</Button>
          </Link>

          <p className="text-xs text-slate-400">
            GreenScore measures how green your financial life is. Free, private, 5 minutes.
          </p>
        </Card>
      </div>
    </main>
  );
}
