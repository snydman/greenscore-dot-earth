"use client";

import { useEffect, useState } from "react";
import { Button } from "./ui";
import type { TransportQuizData } from "../lib/scoring/transport";

type MenuItem = { text: string; value: string };

type VehicleSelectorProps = {
  value: TransportQuizData | null;
  onChange: (data: TransportQuizData | null) => void;
};

const SELECT_CLS =
  "w-full rounded-2xl border border-[color:var(--gs-border-subtle)] bg-white/70 px-4 py-3 text-sm shadow-sm outline-none";

async function fetchMenu(path: string): Promise<MenuItem[]> {
  const res = await fetch(`/api/epa/${path}`, {
    headers: { Accept: "application/json" },
  });
  if (!res.ok) return [];
  const data = await res.json();
  if (!data?.menuItem) return [];
  return Array.isArray(data.menuItem) ? data.menuItem : [data.menuItem];
}

async function fetchVehicle(id: string) {
  const res = await fetch(`/api/epa/vehicle/${id}`, {
    headers: { Accept: "application/json" },
  });
  if (!res.ok) return null;
  return res.json();
}

export default function VehicleSelector({
  value,
  onChange,
}: VehicleSelectorProps) {
  const [years, setYears] = useState<MenuItem[]>([]);
  const [makes, setMakes] = useState<MenuItem[]>([]);
  const [models, setModels] = useState<MenuItem[]>([]);
  const [year, setYear] = useState("");
  const [make, setMake] = useState("");
  const [model, setModel] = useState("");
  const [loading, setLoading] = useState<string | null>(null);

  // Show vehicle selector vs fallback buttons
  const showSelector = !value || value.type === "vehicle";

  // Load years on mount
  useEffect(() => {
    setLoading("years");
    fetchMenu("vehicle/menu/year").then((items) => {
      // Show last 30 years only
      setYears(items.slice(0, 30));
      setLoading(null);
    });
  }, []);

  // Load makes when year changes
  useEffect(() => {
    if (!year) {
      setMakes([]);
      return;
    }
    setMake("");
    setModel("");
    setModels([]);
    onChange(null);
    setLoading("makes");
    fetchMenu(`vehicle/menu/make?year=${encodeURIComponent(year)}`).then(
      (items) => {
        setMakes(items);
        setLoading(null);
      },
    );
  }, [year]); // eslint-disable-line react-hooks/exhaustive-deps

  // Load models when make changes
  useEffect(() => {
    if (!year || !make) {
      setModels([]);
      return;
    }
    setModel("");
    onChange(null);
    setLoading("models");
    fetchMenu(
      `vehicle/menu/model?year=${encodeURIComponent(year)}&make=${encodeURIComponent(make)}`,
    ).then((items) => {
      setModels(items);
      setLoading(null);
    });
  }, [year, make]); // eslint-disable-line react-hooks/exhaustive-deps

  // Fetch vehicle data when model is selected
  useEffect(() => {
    if (!year || !make || !model) return;

    setLoading("vehicle");
    fetchMenu(
      `vehicle/menu/options?year=${encodeURIComponent(year)}&make=${encodeURIComponent(make)}&model=${encodeURIComponent(model)}`,
    ).then(async (options) => {
      if (options.length === 0) {
        setLoading(null);
        return;
      }
      // Pick the first option (trim/engine variant)
      const vehicleId = options[0].value;
      const vehicle = await fetchVehicle(vehicleId);
      if (vehicle) {
        onChange({
          type: "vehicle",
          vehicleId: Number(vehicleId),
          year,
          make,
          model,
          co2Gpm: Number(vehicle.co2TailpipeGpm) || 0,
          fuelType: vehicle.fuelType || "Unknown",
          combinedMpg: Number(vehicle.comb08) || 0,
        });
      }
      setLoading(null);
    });
  }, [year, make, model]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!showSelector) {
    // User selected "no car" or "not sure" — show reset option
    const label = value?.type === "none" ? "No car" : "Not sure";
    return (
      <div className="space-y-2 text-left">
        <p className="text-sm text-slate-700">
          Selected: <span className="font-semibold">{label}</span>
        </p>
        <button
          type="button"
          className="text-xs font-semibold text-emerald-800 underline-offset-2 hover:text-emerald-900 hover:underline"
          onClick={() => onChange(null)}
        >
          ← Change answer
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-3 text-left">
      <label className="text-sm font-medium">
        What year, make, and model is your primary vehicle?
      </label>

      {/* Year */}
      <select
        className={SELECT_CLS}
        value={year}
        onChange={(e) => setYear(e.target.value)}
        disabled={loading === "years"}
      >
        <option value="">
          {loading === "years" ? "Loading years…" : "Select year"}
        </option>
        {years.map((y) => (
          <option key={y.value} value={y.value}>
            {y.text}
          </option>
        ))}
      </select>

      {/* Make */}
      {year && (
        <select
          className={SELECT_CLS}
          value={make}
          onChange={(e) => setMake(e.target.value)}
          disabled={loading === "makes"}
        >
          <option value="">
            {loading === "makes" ? "Loading makes…" : "Select make"}
          </option>
          {makes.map((m) => (
            <option key={m.value} value={m.value}>
              {m.text}
            </option>
          ))}
        </select>
      )}

      {/* Model */}
      {year && make && (
        <select
          className={SELECT_CLS}
          value={model}
          onChange={(e) => setModel(e.target.value)}
          disabled={loading === "models"}
        >
          <option value="">
            {loading === "models" ? "Loading models…" : "Select model"}
          </option>
          {models.map((m) => (
            <option key={m.value} value={m.value}>
              {m.text}
            </option>
          ))}
        </select>
      )}

      {loading === "vehicle" && (
        <p className="text-xs text-slate-500 animate-pulse">
          Looking up EPA data…
        </p>
      )}

      {value?.type === "vehicle" && (
        <div className="rounded-2xl border border-emerald-200/60 bg-emerald-50/50 p-3 text-xs text-slate-600">
          <span className="font-semibold text-slate-900">
            {value.year} {value.make} {value.model}
          </span>
          <span className="ml-2">
            {value.co2Gpm} g CO₂/mile · {value.combinedMpg} MPG ·{" "}
            {value.fuelType}
          </span>
        </div>
      )}

      {/* Fallback options */}
      <div className="flex flex-wrap gap-2 pt-1">
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={() => onChange({ type: "none" })}
        >
          I don&apos;t have a car
        </Button>
        <button
          type="button"
          className="text-xs font-semibold text-slate-500 underline-offset-2 hover:text-slate-700 hover:underline"
          onClick={() => onChange({ type: "not_sure" })}
        >
          Not sure / skip
        </button>
      </div>

      <p className="text-xs text-slate-500">
        EPA fuel economy data helps us estimate your transport emissions.
      </p>
    </div>
  );
}
