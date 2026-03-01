import fs from "node:fs";
import path from "node:path";

const RAW_FILE = path.join(process.cwd(), "data", "raw", "fossilfund_dataset.csv");
const OUT_DIR = path.join(process.cwd(), "src", "data");
const OUT_FILE = path.join(OUT_DIR, "funds.json");
const META_FILE = path.join(OUT_DIR, "funds.meta.json");

/**
 * Minimal CSV parser (handles quoted fields and commas inside quotes).
 * Returns an array of rows (arrays of strings).
 */
function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = "";
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    const next = text[i + 1];

    if (inQuotes) {
      if (c === '"' && next === '"') {
        field += '"';
        i++;
      } else if (c === '"') {
        inQuotes = false;
      } else {
        field += c;
      }
      continue;
    }

    if (c === '"') {
      inQuotes = true;
      continue;
    }

    if (c === ",") {
      row.push(field);
      field = "";
      continue;
    }

    if (c === "\n") {
      row.push(field);
      field = "";
      // avoid pushing empty trailing row
      if (row.length > 1 || (row.length === 1 && row[0].trim() !== "")) rows.push(row);
      row = [];
      continue;
    }

    if (c === "\r") continue; // ignore CR

    field += c;
  }

  // last field
  row.push(field);
  if (row.length > 1 || (row.length === 1 && row[0].trim() !== "")) rows.push(row);

  return rows;
}

function normalizeHeader(h) {
  return (h ?? "").trim().toLowerCase().replace(/\s+/g, " ");
}

function toNumberMaybe(v) {
  const s = String(v ?? "").trim();
  if (!s) return null;
  const n = Number(s.replace(/[%,$]/g, ""));
  return Number.isFinite(n) ? n : null;
}

function pickColumnIndex(headers, candidates) {
  const norm = headers.map(normalizeHeader);
  for (const cand of candidates) {
    const idx = norm.indexOf(cand);
    if (idx >= 0) return idx;
  }
  // try contains match
  for (const cand of candidates) {
    const idx = norm.findIndex((h) => h.includes(cand));
    if (idx >= 0) return idx;
  }
  return -1;
}

function deriveFossilFlag(rowObj) {
  // Heuristics: look for anything fossil-related and try to interpret.
  const keys = Object.keys(rowObj);
  const fossilKeys = keys.filter((k) => k.includes("fossil") || k.includes("coal") || k.includes("oil") || k.includes("gas"));

  // If there is a "fossil free" style grade/flag column
  for (const k of fossilKeys) {
    const v = String(rowObj[k] ?? "").trim().toLowerCase();
    if (!v) continue;

    // common cases
    if (v === "yes" || v === "true" || v === "y") return { fossilFlag: false, reason: `${k}=yes` };
    if (v === "no" || v === "false" || v === "n") return { fossilFlag: true, reason: `${k}=no` };

    // grade-like
    if (["a", "a-", "b", "b-", "c", "c-", "d", "f"].includes(v)) {
      // treat A/B as lower fossil exposure, D/F as higher (placeholder)
      const high = v.startsWith("d") || v === "f";
      return { fossilFlag: high, reason: `${k}=${v}` };
    }

    // numeric-like
    const n = toNumberMaybe(v);
    if (n !== null) {
      // If column name sounds like "fossil" holdings, any positive number implies exposure.
      const impliesHoldings = k.includes("holding") || k.includes("exposure") || k.includes("reserve") || k.includes("revenue");
      if (impliesHoldings) return { fossilFlag: n > 0, reason: `${k}=${n}` };
      // If it's a score, assume higher is better only if column includes "score" and "fossil free"
      if (k.includes("fossil free") && k.includes("score")) return { fossilFlag: n < 50, reason: `${k}=${n}` };
    }
  }

  return { fossilFlag: "unknown", reason: "no fossil columns interpreted" };
}

function main() {
  if (!fs.existsSync(RAW_FILE)) {
    console.error(`Raw file not found: ${RAW_FILE}`);
    console.error(`Put your CSV at: data/raw/fossilfund_dataset.csv`);
    process.exit(1);
  }

  const csvText = fs.readFileSync(RAW_FILE, "utf8");
  const rows = parseCsv(csvText);
  if (rows.length < 2) {
    console.error("CSV appears empty or unreadable.");
    process.exit(1);
  }

  const headers = rows[0].map((h) => String(h ?? "").trim());
  const headerNorm = headers.map(normalizeHeader);

  const tickerIdx = pickColumnIndex(headers, ["ticker", "symbol"]);
  const nameIdx = pickColumnIndex(headers, ["fund name", "name", "fund"]);

  // pick a couple of “interesting” fossil-related columns to carry through if present
  const fossilScoreIdx = headerNorm.findIndex((h) => h.includes("fossil") && h.includes("score"));
  const fossilGradeIdx = headerNorm.findIndex((h) => h.includes("fossil") && h.includes("grade"));

  if (tickerIdx < 0) {
    console.error("Could not find a Ticker/Symbol column in CSV headers.");
    console.error("Headers found:", headers);
    process.exit(1);
  }

  const out = {};
  let kept = 0;

  for (let r = 1; r < rows.length; r++) {
    const row = rows[r];
    const tickerRaw = row[tickerIdx] ?? "";
    const ticker = String(tickerRaw).trim().toUpperCase();
    if (!ticker) continue;

    // Build a normalized object of all columns for heuristic fossil flagging
    const rowObj = {};
    for (let c = 0; c < headers.length; c++) {
      const key = normalizeHeader(headers[c]);
      rowObj[key] = row[c];
    }

    const name = nameIdx >= 0 ? String(row[nameIdx] ?? "").trim() : "";
    const fossilScore = fossilScoreIdx >= 0 ? toNumberMaybe(row[fossilScoreIdx]) : null;
    const fossilGrade = fossilGradeIdx >= 0 ? String(row[fossilGradeIdx] ?? "").trim() : null;

    const derived = deriveFossilFlag(rowObj);

    out[ticker] = {
      name: name || undefined,
      fossilFlag: derived.fossilFlag,
      fossilScore: fossilScore ?? undefined,
      fossilGrade: fossilGrade ?? undefined,
      source: "Fossil Free Funds dataset (CSV)",
      asOf: new Date().toISOString().slice(0, 10),
      notes: derived.reason,
    };

    kept++;
  }

  fs.mkdirSync(OUT_DIR, { recursive: true });
  fs.writeFileSync(OUT_FILE, JSON.stringify(out, null, 2), "utf8");

  const meta = {
    source: "Fossil Free Funds dataset (CSV)",
    rawFile: path.relative(process.cwd(), RAW_FILE),
    generatedAt: new Date().toISOString(),
    rowsIn: rows.length - 1,
    fundsOut: kept,
    detectedColumns: {
      ticker: headers[tickerIdx],
      name: nameIdx >= 0 ? headers[nameIdx] : null,
      fossilScore: fossilScoreIdx >= 0 ? headers[fossilScoreIdx] : null,
      fossilGrade: fossilGradeIdx >= 0 ? headers[fossilGradeIdx] : null,
    },
  };
  fs.writeFileSync(META_FILE, JSON.stringify(meta, null, 2), "utf8");

  console.log(`Wrote ${OUT_FILE}`);
  console.log(`Wrote ${META_FILE}`);
  console.log(`Funds exported: ${kept}`);
}

main();