import Link from "next/link";
import { ARTICLES, categoryLabel } from "../../lib/data/articles";
import { Card } from "../../components/ui";

const CATEGORY_COLORS: Record<string, string> = {
  banking: "bg-emerald-50 text-emerald-800 ring-emerald-200/60",
  transport: "bg-sky-50 text-sky-800 ring-sky-200/60",
  heating: "bg-orange-50 text-orange-800 ring-orange-200/60",
  investments: "bg-blue-50 text-blue-800 ring-blue-200/60",
  "air-travel": "bg-violet-50 text-violet-800 ring-violet-200/60",
  lifestyle: "bg-amber-50 text-amber-800 ring-amber-200/60",
};

export default function LearnPage() {
  return (
    <main id="main-content" className="gs-container py-10 sm:py-14">
      {/* Nav */}
      <nav aria-label="Main navigation" className="flex items-center justify-between">
        <Link href="/" className="inline-flex items-center gap-2">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-2xl bg-[color:var(--gs-accent)] text-white shadow-sm">
            G
          </span>
          <span className="text-sm font-semibold tracking-tight">GreenScore</span>
        </Link>

        <div className="flex items-center gap-2">
          <Link href="/methodology" className="hidden sm:inline-flex items-center justify-center gap-2 rounded-full font-semibold transition active:translate-y-px focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600/25 text-[color:var(--gs-text-muted)] hover:bg-black/5 px-3 py-1.5 text-xs">
            Methodology
          </Link>
          <Link href="/quiz" className="inline-flex items-center justify-center gap-2 rounded-full font-semibold transition active:translate-y-px focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600/40 bg-[color:var(--gs-accent)] text-white shadow-sm hover:bg-[color:var(--gs-accent-deep)] px-3 py-1.5 text-xs">
            Take the quiz
          </Link>
        </div>
      </nav>

      {/* Header */}
      <div className="mx-auto mt-10 max-w-2xl space-y-3 text-center">
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          Learn
        </h1>
        <p className="text-sm leading-relaxed text-[color:var(--gs-text-muted)] sm:text-base">
          Practical guides to greening your financial life — from switching
          banks to understanding your investment footprint.
        </p>
      </div>

      {/* Article grid */}
      <div className="mx-auto mt-10 grid max-w-3xl gap-6">
        {ARTICLES.map((article) => (
          <Link key={article.slug} href={`/learn/${article.slug}`}>
            <Card className="group px-6 py-5 transition-shadow hover:shadow-md">
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span
                      className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-semibold ring-1 ${CATEGORY_COLORS[article.category] ?? ""}`}
                    >
                      {categoryLabel(article.category)}
                    </span>
                    <span className="text-xs text-slate-400">
                      {article.readMinutes} min read
                    </span>
                  </div>

                  <h2 className="text-base font-semibold tracking-tight text-slate-900 group-hover:text-emerald-800 sm:text-lg">
                    {article.title}
                  </h2>

                  <p className="text-sm leading-relaxed text-[color:var(--gs-text-muted)]">
                    {article.summary}
                  </p>
                </div>

                <span className="mt-2 shrink-0 text-slate-300 transition-transform group-hover:translate-x-1 group-hover:text-emerald-600">
                  &rarr;
                </span>
              </div>
            </Card>
          </Link>
        ))}
      </div>

      {/* CTA */}
      <div className="mx-auto mt-12 max-w-md text-center">
        <p className="text-sm text-[color:var(--gs-text-muted)]">
          Want to see how you stack up?
        </p>
        <div className="mt-3">
          <Link href="/quiz" className="inline-flex items-center justify-center gap-2 rounded-full font-semibold transition active:translate-y-px focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600/40 bg-[color:var(--gs-accent)] text-white shadow-sm hover:bg-[color:var(--gs-accent-deep)] px-5 py-2.5 text-sm">
            Take the GreenScore quiz
          </Link>
        </div>
      </div>
    </main>
  );
}
