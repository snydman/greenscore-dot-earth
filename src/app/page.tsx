"use client";

import Link from "next/link";
import { Card } from "../components/ui";

const CATEGORIES = [
  {
    name: "Banking",
    desc: "Where your deposits go matters",
    icon: "🏦",
    color: "from-emerald-400 to-emerald-600",
  },
  {
    name: "Investments",
    desc: "Fossil fuel exposure in your funds",
    icon: "📊",
    color: "from-blue-400 to-blue-600",
  },
  {
    name: "Transport",
    desc: "Your vehicle's real emissions",
    icon: "🚗",
    color: "from-sky-400 to-sky-600",
  },
  {
    name: "Home heating",
    desc: "Your fuel type and local grid",
    icon: "🏠",
    color: "from-orange-400 to-orange-600",
  },
  {
    name: "Air travel",
    desc: "Flight frequency awareness",
    icon: "✈️",
    color: "from-violet-400 to-violet-600",
  },
];

function HeroVisual() {
  return (
    <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-emerald-100/70 via-white/60 to-amber-100/60 ring-1 ring-black/5">
      {/* soft blobs */}
      <div className="absolute -top-24 -left-24 h-64 w-64 rounded-full bg-emerald-300/25 blur-3xl" />
      <div className="absolute top-24 -right-24 h-72 w-72 rounded-full bg-amber-300/25 blur-3xl" />
      <div className="absolute bottom-[-120px] left-1/3 h-72 w-72 rounded-full bg-emerald-200/25 blur-3xl" />

      <div className="relative grid gap-3 p-6 sm:p-8">
        <p className="text-sm font-semibold text-slate-700">Five areas, one score</p>

        <div className="space-y-2.5">
          {CATEGORIES.map((cat) => (
            <div
              key={cat.name}
              className="flex items-center gap-3 rounded-2xl bg-white/80 px-4 py-3 shadow-sm ring-1 ring-black/5 backdrop-blur"
            >
              <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${cat.color} text-lg shadow-sm`}>
                {cat.icon}
              </div>
              <div className="min-w-0">
                <div className="text-sm font-semibold text-slate-900">{cat.name}</div>
                <div className="text-xs text-slate-500">{cat.desc}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-1 rounded-2xl bg-white/80 px-4 py-3 shadow-sm ring-1 ring-black/5 backdrop-blur">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-700 text-sm font-bold text-white shadow-sm">
              G
            </div>
            <div>
              <div className="text-sm font-semibold text-slate-900">Your GreenScore</div>
              <div className="text-xs text-slate-500">Personalized insights and action plan</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function HomePage() {
  return (
    <main id="main-content" className="gs-container pb-16 pt-10 sm:pt-14">
      {/* Top nav */}
      <nav aria-label="Main navigation" className="flex items-center justify-between">
        <Link href="/" className="inline-flex items-center gap-2">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-2xl bg-[color:var(--gs-accent)] text-white shadow-sm">
            G
          </span>
          <span className="text-sm font-semibold tracking-tight">GreenScore</span>
        </Link>

        <div className="flex items-center gap-2">
          <Link href="/learn" className="hidden sm:inline-flex items-center justify-center gap-2 rounded-full font-semibold transition active:translate-y-px focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600/25 text-[color:var(--gs-text-muted)] hover:bg-black/5 px-3 py-1.5 text-xs">
            Learn
          </Link>
          <Link href="/methodology" className="hidden sm:inline-flex items-center justify-center gap-2 rounded-full font-semibold transition active:translate-y-px focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600/25 text-[color:var(--gs-text-muted)] hover:bg-black/5 px-3 py-1.5 text-xs">
            Methodology
          </Link>
          <Link href="/quiz" className="inline-flex items-center justify-center gap-2 rounded-full font-semibold transition active:translate-y-px focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600/40 bg-[color:var(--gs-accent)] text-white shadow-sm hover:bg-[color:var(--gs-accent-deep)] px-3 py-1.5 text-xs">
            Take the quiz
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <div className="mt-10 grid gap-10 lg:grid-cols-2 lg:items-center">
        <div className="space-y-6">
          <div className="gs-chip">Free, private, 5 minutes</div>

          <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
            How green is your{" "}
            <span className="text-[color:var(--gs-accent)]">financial life</span>?
          </h1>

          <p className="text-base leading-relaxed text-[color:var(--gs-text-muted)] sm:text-lg">
            Your bank, car, home heating, air travel, and investments drive a
            surprisingly large share of your carbon footprint. GreenScore measures
            all five and shows you where small changes make the biggest difference.
          </p>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <Link href="/quiz" className="inline-flex w-full items-center justify-center gap-2 rounded-full font-semibold transition active:translate-y-px focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600/40 bg-[color:var(--gs-accent)] text-white shadow-sm hover:bg-[color:var(--gs-accent-deep)] px-5 py-2.5 text-sm sm:w-auto">
              Start the quiz
            </Link>

            <Link href="/methodology" className="inline-flex w-full items-center justify-center gap-2 rounded-full font-semibold transition active:translate-y-px focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600/30 border border-[color:var(--gs-border-subtle)] bg-white/70 text-[color:var(--gs-text-main)] shadow-sm hover:bg-white px-5 py-2.5 text-sm sm:w-auto">
              How it works
            </Link>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <Card className="px-5 py-4">
              <div className="text-xs font-semibold text-slate-500">Real data</div>
              <div className="mt-1 text-sm font-semibold">SEC + EPA + NREL</div>
              <p className="mt-1 text-xs text-[color:var(--gs-text-muted)]">
                Fund holdings, vehicle emissions, grid intensity, and solar potential.
              </p>
            </Card>
            <Card className="px-5 py-4">
              <div className="text-xs font-semibold text-slate-500">Personalized</div>
              <div className="mt-1 text-sm font-semibold">AI action plan</div>
              <p className="mt-1 text-xs text-[color:var(--gs-text-muted)]">
                Tailored recommendations based on your specific answers.
              </p>
            </Card>
            <Card className="px-5 py-4">
              <div className="text-xs font-semibold text-slate-500">Private</div>
              <div className="mt-1 text-sm font-semibold">Nothing stored</div>
              <p className="mt-1 text-xs text-[color:var(--gs-text-muted)]">
                Your answers stay in your browser. No accounts, no tracking.
              </p>
            </Card>
          </div>
        </div>

        <HeroVisual />
      </div>

      {/* Coaching CTA */}
      <div className="mx-auto mt-20 max-w-2xl text-center">
        <Card className="px-8 py-10">
          <h2 className="text-2xl font-semibold tracking-tight">
            Ready to make a change?
          </h2>
          <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-[color:var(--gs-text-muted)]">
            Whether it&apos;s switching to a heat pump, navigating rebate programs,
            or building greener habits — we can help you take the next step toward
            a more sustainable lifestyle.
          </p>
          <div className="mt-6">
            <a href="mailto:hello@greenscore.earth" className="inline-flex items-center justify-center gap-2 rounded-full font-semibold transition active:translate-y-px focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600/30 border border-[color:var(--gs-border-subtle)] bg-white/70 text-[color:var(--gs-text-main)] shadow-sm hover:bg-white px-5 py-2.5 text-sm">
              Contact us
            </a>
          </div>
        </Card>
      </div>

      <p className="mt-8 text-center text-xs text-slate-500">
        Prototype — educational only. Not financial, tax, or legal advice.
      </p>
    </main>
  );
}
