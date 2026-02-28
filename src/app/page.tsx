import Link from "next/link";

export default function HomePage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50">
      <div className="mx-auto flex w-full max-w-xl flex-col items-center gap-6 rounded-2xl bg-white px-6 py-10 text-center shadow-sm ring-1 ring-slate-200">
        <h1 className="text-3xl font-semibold tracking-tight text-slate-900">
          GreenScore (Prototype)
        </h1>
        <p className="text-sm text-slate-600">
          A simple starting point for the GreenScore sustainability experience.
        </p>
        <div className="mt-4 flex w-full flex-col gap-3 sm:flex-row">
          <Link
            href="/quiz"
            className="inline-flex flex-1 items-center justify-center rounded-full bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2"
          >
            Start Quiz
          </Link>
          <Link
            href="/results"
            className="inline-flex flex-1 items-center justify-center rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-900 transition hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2"
          >
            View Sample Results
          </Link>
        </div>
      </div>
    </main>
  );
}

