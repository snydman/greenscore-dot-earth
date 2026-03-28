import Link from "next/link";
import { notFound } from "next/navigation";
import { ARTICLES, getArticle, categoryLabel } from "../../../lib/data/articles";
import { Button } from "../../../components/ui";

const CATEGORY_COLORS: Record<string, string> = {
  banking: "bg-emerald-50 text-emerald-800 ring-emerald-200/60",
  transport: "bg-sky-50 text-sky-800 ring-sky-200/60",
  heating: "bg-orange-50 text-orange-800 ring-orange-200/60",
  investments: "bg-blue-50 text-blue-800 ring-blue-200/60",
  "air-travel": "bg-violet-50 text-violet-800 ring-violet-200/60",
  lifestyle: "bg-amber-50 text-amber-800 ring-amber-200/60",
};

export function generateStaticParams() {
  return ARTICLES.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = getArticle(slug);
  if (!article) return { title: "Not found" };
  return {
    title: `${article.title} — GreenScore Learn`,
    description: article.summary,
  };
}

/** Very lightweight markdown-to-HTML for article content */
function renderMarkdown(md: string): string {
  return md
    // Headers
    .replace(/^## (.+)$/gm, '<h2 class="mt-6 mb-2 text-lg font-semibold text-slate-900">$1</h2>')
    .replace(/^### (.+)$/gm, '<h3 class="mt-4 mb-1 text-base font-semibold text-slate-900">$1</h3>')
    // Bold
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    // Italic
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    // Unordered list items
    .replace(/^- (.+)$/gm, '<li class="ml-5 list-disc">$1</li>')
    // Paragraphs (double newline)
    .replace(/\n{2,}/g, "</p><p>")
    // Single newlines within content
    .replace(/\n/g, "<br />")
    // Wrap in paragraph
    .replace(/^/, "<p>")
    .replace(/$/, "</p>")
    // Clean up list items wrapped in paragraphs
    .replace(/<p>(<li)/g, "<ul>$1")
    .replace(/(<\/li>)<\/p>/g, "$1</ul>")
    .replace(/<br \/><ul>/g, "</p><ul>")
    .replace(/<\/ul><br \/>/g, "</ul><p>");
}

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = getArticle(slug);
  if (!article) notFound();

  const dateStr = new Date(article.publishedAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <main className="gs-container py-10 sm:py-14">
      {/* Nav */}
      <div className="flex items-center justify-between">
        <Link href="/" className="inline-flex items-center gap-2">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-2xl bg-[color:var(--gs-accent)] text-white shadow-sm">
            G
          </span>
          <span className="text-sm font-semibold tracking-tight">GreenScore</span>
        </Link>

        <div className="flex items-center gap-2">
          <Link href="/learn">
            <Button variant="ghost" size="sm">
              All articles
            </Button>
          </Link>
          <Link href="/quiz">
            <Button size="sm">Take the quiz</Button>
          </Link>
        </div>
      </div>

      {/* Article */}
      <article className="mx-auto mt-10 max-w-2xl">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <span
              className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-semibold ring-1 ${CATEGORY_COLORS[article.category] ?? ""}`}
            >
              {categoryLabel(article.category)}
            </span>
            <span className="text-xs text-slate-400">
              {dateStr} &middot; {article.readMinutes} min read
            </span>
          </div>

          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            {article.title}
          </h1>

          <p className="text-sm leading-relaxed text-[color:var(--gs-text-muted)] sm:text-base">
            {article.summary}
          </p>
        </div>

        <div
          className="mt-8 space-y-0 text-sm leading-relaxed text-[color:var(--gs-text-main)] [&_h2]:leading-tight [&_h3]:leading-tight [&_li]:mb-1 [&_p]:mb-4 [&_strong]:text-slate-900 [&_ul]:mb-4 [&_ul]:space-y-1"
          dangerouslySetInnerHTML={{ __html: renderMarkdown(article.content) }}
        />

        {/* CTA */}
        <div className="mt-10 rounded-2xl border border-[color:var(--gs-border-subtle)] bg-white/60 p-6 text-center">
          <p className="text-sm font-semibold text-slate-900">
            Ready to see where you stand?
          </p>
          <p className="mt-1 text-xs text-[color:var(--gs-text-muted)]">
            Take the GreenScore quiz — it&apos;s free, private, and takes 5 minutes.
          </p>
          <div className="mt-4">
            <Link href="/quiz">
              <Button>Start the quiz</Button>
            </Link>
          </div>
        </div>

        {/* Back */}
        <div className="mt-6 text-center">
          <Link
            href="/learn"
            className="text-xs font-semibold text-emerald-800 underline-offset-4 hover:underline"
          >
            &larr; All articles
          </Link>
        </div>
      </article>
    </main>
  );
}
