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

type BankQuizEntry = {
  id: string;
  bankSlug: string | null;
  bankDisplayName: string;
  bankCategory: BankCategory | null;
};

type VehicleQuizEntry = {
  id: string;
  transport: TransportQuizData;
};

type QuizState = {
  banks: BankQuizEntry[];
  knowsTickers: boolean | null;
  tickers: string;
  vehicles: VehicleQuizEntry[];
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
  const [addingBank, setAddingBank] = useState(true);
  const [addingVehicle, setAddingVehicle] = useState(true);
  const [vehicleEditKey, setVehicleEditKey] = useState(0);
  const [data, setData] = useState<QuizState>({
    banks: [],
    knowsTickers: null,
    tickers: "",
    vehicles: [],
    heating: "",
    cooking: "",
  });

  const isFirst = step === 1;
  const isLast = step === TOTAL_STEPS;

  const canGoNext = useMemo(() => {
    switch (step) {
      case 1:
        return data.banks.length > 0;
      case 2:
        return data.knowsTickers !== null;
      case 3:
        if (data.knowsTickers) return data.tickers.trim().length > 0;
        return true;
      case 4:
        return data.vehicles.length > 0;
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
        version: 4,
        savedAt: new Date().toISOString(),
        answers: {
          tickers: data.knowsTickers ? data.tickers : "",
          banks: data.banks.map(({ bankSlug, bankDisplayName, bankCategory }) => ({
            bankSlug,
            bankDisplayName,
            bankCategory,
          })),
          vehicles: data.vehicles.map((v) => v.transport),
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

  function addBank(entry: Omit<BankQuizEntry, "id">) {
    setData((prev) => ({
      ...prev,
      banks: [...prev.banks, { ...entry, id: crypto.randomUUID() }],
    }));
    setBankSearch("");
    setShowCategoryPicker(false);
    setAddingBank(false);
  }

  function removeBank(id: string) {
    setData((prev) => ({
      ...prev,
      banks: prev.banks.filter((b) => b.id !== id),
    }));
  }

  function addVehicle(transport: TransportQuizData) {
    setData((prev) => ({
      ...prev,
      vehicles: [...prev.vehicles, { id: crypto.randomUUID(), transport }],
    }));
    setAddingVehicle(false);
    setVehicleEditKey((k) => k + 1);
  }

  function removeVehicle(id: string) {
    setData((prev) => ({
      ...prev,
      vehicles: prev.vehicles.filter((v) => v.id !== id),
    }));
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
              {step === 1 && "Your banking"}
              {step === 2 && "Do you know your fund tickers?"}
              {step === 3 && "List any tickers you know"}
              {step === 4 && "Your vehicles"}
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
                {/* List of added banks */}
                {data.banks.length > 0 && (
                  <div className="space-y-2">
                    {data.banks.map((bank, idx) => (
                      <div
                        key={bank.id}
                        className="flex items-center justify-between rounded-2xl border border-emerald-200/60 bg-emerald-50/50 px-4 py-2.5 text-sm"
                      >
                        <div>
                          <span className="font-semibold text-slate-900">{bank.bankDisplayName}</span>
                          {idx === 0 && data.banks.length > 1 && (
                            <span className="ml-2 text-xs text-emerald-700">(primary — 60% weight)</span>
                          )}
                        </div>
                        <button
                          type="button"
                          className="ml-3 text-slate-400 hover:text-red-500"
                          onClick={() => removeBank(bank.id)}
                          aria-label={`Remove ${bank.bankDisplayName}`}
                        >
                          &times;
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Bank input (typeahead or category picker) */}
                {addingBank ? (
                  <>
                    <label className="text-sm font-medium">
                      {data.banks.length === 0
                        ? "What\u2019s the main bank you use?"
                        : "Add another bank"}
                    </label>

                    {!showCategoryPicker ? (
                      <>
                        <BankTypeahead
                          value={bankSearch}
                          onChange={(text) => setBankSearch(text)}
                          onSelect={(bank) => {
                            addBank({
                              bankSlug: bank.slug,
                              bankDisplayName: bank.name,
                              bankCategory: null,
                            });
                          }}
                          onNotFound={() => setShowCategoryPicker(true)}
                        />
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
                              variant="secondary"
                              size="sm"
                              onClick={() => {
                                addBank({
                                  bankSlug: null,
                                  bankDisplayName: cat.label,
                                  bankCategory: cat.value,
                                });
                              }}
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
                          &larr; Back to search
                        </button>
                      </div>
                    )}

                    {data.banks.length > 0 && (
                      <button
                        type="button"
                        className="text-xs font-semibold text-slate-500 underline-offset-2 hover:text-slate-700 hover:underline"
                        onClick={() => {
                          setAddingBank(false);
                          setBankSearch("");
                          setShowCategoryPicker(false);
                        }}
                      >
                        Cancel
                      </button>
                    )}
                  </>
                ) : (
                  <button
                    type="button"
                    className="text-sm font-semibold text-emerald-800 underline-offset-2 hover:text-emerald-900 hover:underline"
                    onClick={() => setAddingBank(true)}
                  >
                    + Add another bank
                  </button>
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
              <div className="space-y-3 text-left">
                {/* List of added vehicles */}
                {data.vehicles.length > 0 && (
                  <div className="space-y-2">
                    {data.vehicles.map((v, idx) => {
                      const t = v.transport;
                      const label =
                        t.type === "vehicle"
                          ? `${t.year} ${t.make} ${t.model}`
                          : t.type === "none"
                            ? "No car"
                            : "Not sure";
                      const detail =
                        t.type === "vehicle"
                          ? `${t.co2Gpm} g CO\u2082/mile \u00b7 ${t.combinedMpg} MPG \u00b7 ${t.fuelType}`
                          : null;
                      return (
                        <div
                          key={v.id}
                          className="flex items-center justify-between rounded-2xl border border-emerald-200/60 bg-emerald-50/50 px-4 py-2.5 text-sm"
                        >
                          <div>
                            <span className="font-semibold text-slate-900">{label}</span>
                            {idx === 0 && data.vehicles.length > 1 && (
                              <span className="ml-2 text-xs text-emerald-700">(primary — 60% weight)</span>
                            )}
                            {detail && (
                              <span className="ml-2 text-xs text-slate-500">{detail}</span>
                            )}
                          </div>
                          <button
                            type="button"
                            className="ml-3 text-slate-400 hover:text-red-500"
                            onClick={() => removeVehicle(v.id)}
                            aria-label={`Remove ${label}`}
                          >
                            &times;
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Vehicle input */}
                {addingVehicle ? (
                  <>
                    <VehicleSelector
                      key={vehicleEditKey}
                      value={null}
                      onChange={(t) => {
                        if (t) addVehicle(t);
                      }}
                    />
                    {data.vehicles.length > 0 && (
                      <button
                        type="button"
                        className="text-xs font-semibold text-slate-500 underline-offset-2 hover:text-slate-700 hover:underline"
                        onClick={() => setAddingVehicle(false)}
                      >
                        Cancel
                      </button>
                    )}
                  </>
                ) : (
                  <button
                    type="button"
                    className="text-sm font-semibold text-emerald-800 underline-offset-2 hover:text-emerald-900 hover:underline"
                    onClick={() => setAddingVehicle(true)}
                  >
                    + Add another vehicle
                  </button>
                )}

                {!addingVehicle && data.vehicles.length > 0 && (
                  <p className="text-xs text-slate-500">
                    EPA fuel economy data helps us estimate your transport emissions.
                  </p>
                )}
              </div>
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
