import Link from "next/link";

export default function QuizPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50">
      <div className="mx-auto w-full max-w-xl rounded-2xl bg-white px-6 py-10 text-center shadow-sm ring-1 ring-slate-200">
        <h1 className="text-3xl font-semibold tracking-tight text-slate-900">
          Quiz
        </h1>
        <p className="mt-3 text-sm text-slate-600">
          Questionnaire wizard placeholder.
        </p>
        <div className="mt-8">
          <Link
            href="/"
            className="text-sm font-semibold text-emerald-700 hover:text-emerald-800"
          >
            ← Back to Home
          </Link>
        </div>
      </div>
    </main>
  );
}

