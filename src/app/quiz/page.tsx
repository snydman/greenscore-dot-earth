/* eslint-disable jsx-a11y/label-has-associated-control */
"use client";

import Link from "next/link";
import { useRef, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Card, StepProgress } from "../../components/ui";
import BankTypeahead from "../../components/BankTypeahead";
import { BANK_CATEGORIES, type BankCategory } from "../../lib/data/banks";
import { parseTickers } from "../../lib/scoring/investments";
import { startPrescore } from "../../lib/scoring/prescore";
import VehicleSelector from "../../components/VehicleSelector";
import type { TransportQuizData } from "../../lib/scoring/transport";

type QuizState = {
  bankSlug: string | null;
  bankDisplayName: string;
  bankCategory: BankCategory | null;
  knowsTickers: boolean | null;
  tickers: string;
  transport: TransportQuizData | null;
  heating: string;
  cooking: string;
};

const TOTAL_STEPS = 6;

export default function QuizPage() {
  const router = useRouter();
  const prescoreRef = useRef<AbortController | null>(null);
  const [step, setStep] = useState(1);
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);
  const [bankSearch, setBankSearch] = useState("");
  const [data, setData] = useState<QuizState>({
    bankSlug: null,
    bankDisplayName: "",
    bankCategory: null,
    knowsTickers: null,
    tickers: "",
    transport: null,
    heating: "",
    cooking: "",
  });

  const isFirst = step === 1;
  const isLast = step === TOTAL_STEPS;

  const canGoNext = useMemo(() => {
    switch (step) {
      case 1:
        return data.bankSlug !== null || data.bankCategory !== null;
      case 2:
        return data.knowsTickers !== null;
      case 3:
        if (data.knowsTickers) return data.tickers.trim().length > 0;
        return true;
      case 4:
        return data.transport !== null;
      case 5:
        return !!data.heating;
      case 6:
        return !!data.cooking;
      default:
        return false;
    }
  }, [data, step]);

  function handleBack() {
    if (!isFirst) setStep((prev) => Math.max(prev - 1, 1));
  }

  function handleNext() {
    if (isLast) {
      const payload = {
        version: 3,
        savedAt: new Date().toISOString(),
        answers: {
          tickers: data.knowsTickers ? data.tickers : "",
          bankSlug: data.bankSlug,
          bankDisplayName: data.bankDisplayName,
          bankCategory: data.bankCategory,
          transport: data.transport,
        },
      };
      localStorage.setItem("greenscore.answers.v1", JSON.stringify(payload));
      router.push("/results");
      return;
    }
    setStep((prev) => Math.min(prev + 1, TOTAL_STEPS));

    // Pre-score tickers in the background when leaving step 3
    if (step === 3 && data.knowsTickers && data.tickers.trim()) {
      prescoreRef.current?.abort();
      prescoreRef.current = startPrescore(parseTickers(data.tickers));
    }
  }

  return (
    <main className="gs-container py-10 sm:py-14">
      <header className="flex items-center justify-between">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm font-semibold text-[color:var(--gs-text-main)] hover:opacity-90"
        >
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-2xl bg-[color:var(--gs-accent)] text-white shadow-sm">
            G
          </span>
          GreenScore
        </Link>
        <span className="text-xs text-slate-500">Prototype — answers are not stored.</span>
      </header>

      <div className="mx-auto mt-8 w-full max-w-3xl">
        <Card className="space-y-6">
          <StepProgress current={step} total={TOTAL_STEPS} />

          <div className="space-y-1">
            <h1 className="text-2xl font-semibold tracking-tight">
              {step === 1 && "Your day-to-day banking"}
              {step === 2 && "Do you know your fund tickers?"}
              {step === 3 && "List any tickers you know"}
              {step === 4 && "Your primary vehicle"}
              {step === 5 && "How is your home heated?"}
              {step === 6 && "How do you mostly cook at home?"}
            </h1>
            <p className="text-sm text-slate-600">
              Directional answers are fine — this is a snapshot, not a full diagnostic.
            </p>
          </div>

          <div className="space-y-4">
            {step === 1 && (
              <div className="space-y-3 text-left">
                <label className="text-sm font-medium">What&apos;s the main bank you use?</label>

                {!showCategoryPicker ? (
                  <>
                    <BankTypeahead
                      value={bankSearch}
                      onChange={(text) => {
                        setBankSearch(text);
                        // Clear selection if user edits text after selecting
                        if (data.bankSlug) {
                          setData((prev) => ({ ...prev, bankSlug: null, bankDisplayName: "" }));
                        }
                      }}
                      onSelect={(bank) => {
                        setBankSearch(bank.name);
                        setData((prev) => ({
                          ...prev,
                          bankSlug: bank.slug,
                          bankDisplayName: bank.name,
                          bankCategory: null,
                        }));
                      }}
                      onNotFound={() => setShowCategoryPicker(true)}
                    />
                    {data.bankSlug && (
                      <p className="text-xs text-emerald-700">
                        Selected: <span className="font-semibold">{data.bankDisplayName}</span>
                      </p>
                    )}
                  </>
                ) : (
                  <div className="space-y-3">
                    <p className="text-sm text-slate-600">
                      What type of bank do you use?
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {BANK_CATEGORIES.map((cat) => (
                        <Button
                          key={cat.value}
                          type="button"
                          variant={data.bankCategory === cat.value ? "primary" : "secondary"}
                          size="sm"
                          onClick={() =>
                            setData((prev) => ({
                              ...prev,
                              bankSlug: null,
                              bankDisplayName: cat.label,
                              bankCategory: cat.value,
                            }))
                          }
                        >
                          {cat.label}
                        </Button>
                      ))}
                    </div>
                    <button
                      type="button"
                      className="text-xs font-semibold text-emerald-800 underline-offset-2 hover:text-emerald-900 hover:underline"
                      onClick={() => setShowCategoryPicker(false)}
                    >
                      ← Back to search
                    </button>
                  </div>
                )}

                <p className="text-xs text-slate-500">
                  This helps us reason about how your cash is working behind the scenes.
                </p>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-3 text-left">
                <p className="text-sm font-medium">
                  Do you know the ticker symbols for any funds or stocks you hold?
                </p>
                <div className="flex flex-col gap-2 sm:flex-row">
                  <Button
                    type="button"
                    variant={data.knowsTickers === true ? "primary" : "secondary"}
                    className="w-full sm:w-auto"
                    onClick={() => setData((prev) => ({ ...prev, knowsTickers: true }))}
                  >
                    Yes, I know some
                  </Button>
                  <Button
                    type="button"
                    variant={data.knowsTickers === false ? "primary" : "secondary"}
                    className="w-full sm:w-auto"
                    onClick={() => setData((prev) => ({ ...prev, knowsTickers: false, tickers: "" }))}
                  >
                    Not really
                  </Button>
                </div>
                <button
                  type="button"
                  className="text-xs font-semibold text-slate-500 underline-offset-2 hover:text-slate-700 hover:underline"
                  onClick={() => setData((prev) => ({ ...prev, knowsTickers: false, tickers: "" }))}
                >
                  Skip / I don&apos;t know
                </button>
              </div>
            )}

            {step === 3 && data.knowsTickers && (
              <div className="space-y-2 text-left">
                <label className="text-sm font-medium">Enter any fund or stock tickers you know</label>
                <textarea
                  rows={3}
                  className="w-full rounded-2xl border border-[color:var(--gs-border-subtle)] bg-white/70 px-4 py-3 text-sm shadow-sm outline-none"
                  placeholder="e.g. VTI, ICLN, AAPL"
                  value={data.tickers}
                  onChange={(e) => setData((prev) => ({ ...prev, tickers: e.target.value }))}
                />
                <button
                  type="button"
                  className="text-xs font-semibold text-slate-500 underline-offset-2 hover:text-slate-700 hover:underline"
                  onClick={() => setData((prev) => ({ ...prev, tickers: "" }))}
                >
                  Skip / I&apos;ll add these later
                </button>
              </div>
            )}

            {step === 3 && !data.knowsTickers && (
              <p className="text-sm text-slate-700">
                No problem — we&apos;ll treat your investments as a diversified mix for now.
              </p>
            )}

            {step === 4 && (
              <VehicleSelector
                value={data.transport}
                onChange={(t) => setData((prev) => ({ ...prev, transport: t }))}
              />
            )}

            {step === 5 && (
              <div className="space-y-2 text-left">
                <label className="text-sm font-medium">How is your home mostly heated?</label>
                <select
                  className="w-full rounded-2xl border border-[color:var(--gs-border-subtle)] bg-white/70 px-4 py-3 text-sm shadow-sm outline-none"
                  value={data.heating}
                  onChange={(e) => setData((prev) => ({ ...prev, heating: e.target.value }))}
                >
                  <option value="">Select one</option>
                  <option value="heat_pump">Heat pump</option>
                  <option value="gas">Gas furnace / boiler</option>
                  <option value="oil">Oil</option>
                  <option value="propane">Propane</option>
                  <option value="electric_resistance">Electric resistance</option>
                  <option value="not_sure">Not sure</option>
                </select>
              </div>
            )}

            {step === 6 && (
              <div className="space-y-2 text-left">
                <label className="text-sm font-medium">And how do you mostly cook at home?</label>
                <select
                  className="w-full rounded-2xl border border-[color:var(--gs-border-subtle)] bg-white/70 px-4 py-3 text-sm shadow-sm outline-none"
                  value={data.cooking}
                  onChange={(e) => setData((prev) => ({ ...prev, cooking: e.target.value }))}
                >
                  <option value="">Select one</option>
                  <option value="induction">Induction</option>
                  <option value="electric">Electric</option>
                  <option value="gas">Gas</option>
                  <option value="not_sure">Not sure / mixed</option>
                </select>
              </div>
            )}
          </div>

          <div className="mt-2 flex items-center justify-between border-t border-black/5 pt-4">
            <Button variant="ghost" size="sm" disabled={isFirst} onClick={handleBack}>
              Back
            </Button>

            <div className="flex items-center gap-3">
              {!isLast && (
                <button
                  type="button"
                  className="text-xs font-semibold text-slate-500 underline-offset-2 hover:text-slate-700 hover:underline"
                  onClick={handleNext}
                >
                  Skip this step
                </button>
              )}
              <Button size="sm" disabled={!canGoNext} onClick={handleNext}>
                {isLast ? "See results" : "Next"}
              </Button>
            </div>
          </div>
        </Card>

        <div className="mt-4 text-center text-xs text-slate-500">
          Prototype — educational only. Not financial, tax, or legal advice.
        </div>
      </div>
    </main>
  );
}