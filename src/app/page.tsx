"use client";

import Link from "next/link";
import { Button, Card } from "../components/ui";

function HeroVisual() {
  return (
    <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-emerald-100/70 via-white/60 to-amber-100/60 ring-1 ring-black/5">
      {/* soft blobs */}
      <div className="absolute -top-24 -left-24 h-64 w-64 rounded-full bg-emerald-300/25 blur-3xl" />
      <div className="absolute top-24 -right-24 h-72 w-72 rounded-full bg-amber-300/25 blur-3xl" />
      <div className="absolute bottom-[-120px] left-1/3 h-72 w-72 rounded-full bg-emerald-200/25 blur-3xl" />

      {/* “dashboard cards” */}
      <div className="relative grid gap-4 p-6 sm:p-8">
        <div className="gs-chip w-fit">Prototype</div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl bg-white/80 p-4 shadow-sm ring-1 ring-black/5 backdrop-blur">
            <div className="text-xs font-semibold text-slate-500">Banking</div>
            <div className="mt-1 flex items-end justify-between">
              <div className="text-lg font-semibold">Cash alignment</div>
              <div className="text-sm font-semibold text-emerald-700">+12</div>
            </div>
            <div className="mt-3 h-2 w-full rounded-full bg-black/5">
              <div className="h-2 w-[65%] rounded-full bg-emerald-400" />
            </div>
          </div>

          <div className="rounded-2xl bg-white/80 p-4 shadow-sm ring-1 ring-black/5 backdrop-blur">
            <div className="text-xs font-semibold text-slate-500">Investments</div>
            <div className="mt-1 flex items-end justify-between">
              <div className="text-lg font-semibold">Portfolio tilt</div>
              <div className="text-sm font-semibold text-amber-700">–8</div>
            </div>
            <div className="mt-3 h-2 w-full rounded-full bg-black/5">
              <div className="h-2 w-[42%] rounded-full bg-amber-300" />
            </div>
          </div>
        </div>

        <div className="rounded-2xl bg-white/80 p-4 shadow-sm ring-1 ring-black/5 backdrop-blur">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs font-semibold text-slate-500">Your GreenScore</div>
              <div className="text-2xl font-semibold">62 / 100</div>
            </div>
            <div className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-800 ring-1 ring-emerald-200/60">
              Moderate — room to grow
            </div>
          </div>

          <div className="mt-4 grid gap-2 sm:grid-cols-3">
            <div className="rounded-xl bg-white/70 p-3 ring-1 ring-black/5">
              <div className="text-xs font-semibold text-slate-500">Transport</div>
              <div className="text-sm font-semibold">65</div>
            </div>
            <div className="rounded-xl bg-white/70 p-3 ring-1 ring-black/5">
              <div className="text-xs font-semibold text-slate-500">Home</div>
              <div className="text-sm font-semibold">54</div>
            </div>
            <div className="rounded-xl bg-white/70 p-3 ring-1 ring-black/5">
              <div className="text-xs font-semibold text-slate-500">Habits</div>
              <div className="text-sm font-semibold">72</div>
            </div>
          </div>
        </div>

        <div className="text-xs text-slate-500">
          Example visuals only — no personal data is stored in this prototype.
        </div>
      </div>
    </div>
  );
}

export default function HomePage() {
  return (
    <main className="gs-container pb-16 pt-10 sm:pt-14">
      {/* Top nav */}
      <div className="flex items-center justify-between">
        <Link href="/" className="inline-flex items-center gap-2">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-2xl bg-[color:var(--gs-accent)] text-white shadow-sm">
            G
          </span>
          <span className="text-sm font-semibold tracking-tight">GreenScore</span>
        </Link>

        <div className="flex items-center gap-2">
          <Link href="/results" className="hidden sm:block">
            <Button variant="ghost" size="sm">
              Sample results
            </Button>
          </Link>
          <Link href="/quiz">
            <Button size="sm">Start</Button>
          </Link>
        </div>
      </div>

      {/* Hero */}
      <div className="mt-10 grid gap-10 lg:grid-cols-2 lg:items-center">
        <div className="space-y-6">
          <div className="gs-chip">A fast, explainable climate check</div>

          <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
            How green is your{" "}
            <span className="text-[color:var(--gs-accent)]">financial life</span>?
          </h1>

          <p className="text-base leading-relaxed text-[color:var(--gs-text-muted)] sm:text-lg">
            Answer a few simple questions about your bank, investments, car, and home energy.
            We’ll generate an easy-to-understand score and a shortlist of the most meaningful
            next steps.
          </p>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <Link href="/quiz" className="w-full sm:w-auto">
              <Button className="w-full sm:w-auto">Start the quiz</Button>
            </Link>

            <Link href="/results" className="w-full sm:w-auto">
              <Button variant="secondary" className="w-full sm:w-auto">
                View sample results
              </Button>
            </Link>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <Card className="px-5 py-4">
              <div className="text-xs font-semibold text-slate-500">Fast</div>
              <div className="mt-1 text-sm font-semibold">~5 minutes</div>
              <p className="mt-1 text-xs text-[color:var(--gs-text-muted)]">
                Lightweight inputs, no account linking.
              </p>
            </Card>
            <Card className="px-5 py-4">
              <div className="text-xs font-semibold text-slate-500">Explainable</div>
              <div className="mt-1 text-sm font-semibold">Transparent</div>
              <p className="mt-1 text-xs text-[color:var(--gs-text-muted)]">
                You’ll see what drove the score.
              </p>
            </Card>
            <Card className="px-5 py-4">
              <div className="text-xs font-semibold text-slate-500">Private</div>
              <div className="mt-1 text-sm font-semibold">Local-only</div>
              <p className="mt-1 text-xs text-[color:var(--gs-text-muted)]">
                Prototype: nothing is stored.
              </p>
            </Card>
          </div>

          <p className="text-xs text-slate-500">
            Prototype — educational only. Not financial, tax, or legal advice.
          </p>
        </div>

        <HeroVisual />
      </div>
    </main>
  );
}