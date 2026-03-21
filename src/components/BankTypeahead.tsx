"use client";

import { useEffect, useRef, useState } from "react";
import { BANKS, type BankEntry, type BankGreenRating } from "../lib/data/banks";

type BankTypeaheadProps = {
  value: string;
  onChange: (text: string) => void;
  onSelect: (bank: BankEntry) => void;
  onNotFound: () => void;
};

const RATING_COLORS: Record<BankGreenRating, string> = {
  great: "bg-emerald-50 text-emerald-800 ring-emerald-200/60",
  good: "bg-emerald-50 text-emerald-700 ring-emerald-200/60",
  ok: "bg-amber-50 text-amber-800 ring-amber-200/60",
  bad: "bg-orange-50 text-orange-800 ring-orange-200/60",
  worst: "bg-red-50 text-red-800 ring-red-200/60",
};

export default function BankTypeahead({
  value,
  onChange,
  onSelect,
  onNotFound,
}: BankTypeaheadProps) {
  const [open, setOpen] = useState(false);
  const [activeIdx, setActiveIdx] = useState(-1);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  const query = value.trim().toLowerCase();
  const matches =
    query.length > 0
      ? BANKS.filter((b) => b.name.toLowerCase().includes(query)).slice(0, 10)
      : [];

  // Close on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  // Reset active index when matches change
  useEffect(() => {
    setActiveIdx(-1);
  }, [query]);

  function handleKeyDown(e: React.KeyboardEvent) {
    if (!open) return;

    const total = matches.length + 1; // +1 for "not listed" option
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIdx((prev) => (prev + 1) % total);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIdx((prev) => (prev - 1 + total) % total);
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (activeIdx >= 0 && activeIdx < matches.length) {
        handleSelect(matches[activeIdx]);
      } else if (activeIdx === matches.length) {
        onNotFound();
      }
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  }

  function handleSelect(bank: BankEntry) {
    onSelect(bank);
    setOpen(false);
  }

  const showDropdown = open && query.length > 0;

  return (
    <div ref={wrapperRef} className="relative">
      <input
        type="text"
        className="w-full rounded-2xl border border-[color:var(--gs-border-subtle)] bg-white/70 px-4 py-3 text-sm shadow-sm outline-none"
        placeholder="Start typing your bank name…"
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
          setOpen(true);
        }}
        onFocus={() => query.length > 0 && setOpen(true)}
        onKeyDown={handleKeyDown}
        role="combobox"
        aria-expanded={showDropdown}
        aria-autocomplete="list"
        aria-controls="bank-listbox"
        aria-activedescendant={
          activeIdx >= 0 ? `bank-option-${activeIdx}` : undefined
        }
      />

      {showDropdown && (
        <ul
          ref={listRef}
          id="bank-listbox"
          role="listbox"
          className="absolute z-20 mt-1 w-full overflow-hidden rounded-2xl border border-[color:var(--gs-border-subtle)] bg-white shadow-lg"
        >
          {matches.map((bank, i) => (
            <li
              key={bank.slug}
              id={`bank-option-${i}`}
              role="option"
              aria-selected={i === activeIdx}
              className={`flex cursor-pointer items-center justify-between px-4 py-2.5 text-sm ${
                i === activeIdx ? "bg-emerald-50" : "hover:bg-slate-50"
              }`}
              onMouseDown={() => handleSelect(bank)}
              onMouseEnter={() => setActiveIdx(i)}
            >
              <span className="font-medium text-slate-900">{bank.name}</span>
              <span
                className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ring-1 ${RATING_COLORS[bank.rating]}`}
              >
                {bank.rating}
              </span>
            </li>
          ))}

          {matches.length === 0 && (
            <li className="px-4 py-2.5 text-sm text-slate-500">
              No matches found
            </li>
          )}

          <li
            id={`bank-option-${matches.length}`}
            role="option"
            aria-selected={activeIdx === matches.length}
            className={`cursor-pointer border-t border-[color:var(--gs-border-subtle)] px-4 py-2.5 text-xs font-semibold text-emerald-800 ${
              activeIdx === matches.length ? "bg-emerald-50" : "hover:bg-slate-50"
            }`}
            onMouseDown={onNotFound}
            onMouseEnter={() => setActiveIdx(matches.length)}
          >
            My bank isn&apos;t listed →
          </li>
        </ul>
      )}
    </div>
  );
}
