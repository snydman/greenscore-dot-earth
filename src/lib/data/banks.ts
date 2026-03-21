export type BankGreenRating = "great" | "good" | "ok" | "bad" | "worst";

export type BankEntry = {
  slug: string;
  name: string;
  rating: BankGreenRating;
};

export type BankCategory =
  | "credit_union"
  | "cdfi"
  | "large_national"
  | "online_neobank"
  | "regional"
  | "not_sure";

/**
 * Curated list of ~30 US banks with Bank.Green ratings.
 * Source: https://bank.green — ratings as of early 2026.
 */
export const BANKS: BankEntry[] = [
  // ── Worst ──
  { slug: "jpmorgan-chase", name: "JPMorgan Chase", rating: "worst" },
  { slug: "goldman-sachs", name: "Goldman Sachs", rating: "worst" },
  { slug: "morgan-stanley", name: "Morgan Stanley", rating: "worst" },
  { slug: "rbc", name: "RBC (Royal Bank of Canada)", rating: "worst" },

  // ── Bad ──
  { slug: "bank-of-america", name: "Bank of America", rating: "bad" },
  { slug: "wells-fargo", name: "Wells Fargo", rating: "bad" },
  { slug: "citibank", name: "Citibank", rating: "bad" },
  { slug: "us-bancorp", name: "U.S. Bancorp", rating: "bad" },
  { slug: "pnc", name: "PNC Financial", rating: "bad" },
  { slug: "truist", name: "Truist Financial", rating: "bad" },
  { slug: "capital-one", name: "Capital One", rating: "bad" },
  { slug: "td-bank", name: "TD Bank", rating: "bad" },
  { slug: "barclays", name: "Barclays", rating: "bad" },
  { slug: "hsbc", name: "HSBC", rating: "bad" },

  // ── OK ──
  { slug: "usaa", name: "USAA", rating: "ok" },
  { slug: "charles-schwab", name: "Charles Schwab", rating: "ok" },
  { slug: "ally-bank", name: "Ally Bank", rating: "ok" },
  { slug: "discover", name: "Discover Financial", rating: "ok" },
  { slug: "sofi", name: "SoFi", rating: "ok" },
  { slug: "navy-federal", name: "Navy Federal Credit Union", rating: "ok" },
  { slug: "fifth-third", name: "Fifth Third Bank", rating: "ok" },
  { slug: "regions", name: "Regions Financial", rating: "ok" },

  // ── Good ──
  { slug: "atmos-financial", name: "Atmos Financial", rating: "good" },
  { slug: "ando", name: "Ando", rating: "good" },
  { slug: "sunrise-banks", name: "Sunrise Banks", rating: "good" },

  // ── Great ──
  { slug: "amalgamated-bank", name: "Amalgamated Bank", rating: "great" },
  { slug: "beneficial-state-bank", name: "Beneficial State Bank", rating: "great" },
  { slug: "climate-first-bank", name: "Climate First Bank", rating: "great" },
  { slug: "spring-bank", name: "Spring Bank", rating: "great" },
  { slug: "clean-energy-cu", name: "Clean Energy Credit Union", rating: "great" },
];

export const BANK_CATEGORIES: {
  value: BankCategory;
  label: string;
  rating: BankGreenRating;
}[] = [
  { value: "credit_union", label: "Credit union", rating: "ok" },
  { value: "cdfi", label: "CDFI / community bank", rating: "good" },
  { value: "large_national", label: "Large national bank", rating: "bad" },
  { value: "online_neobank", label: "Online / neobank", rating: "ok" },
  { value: "regional", label: "Regional bank", rating: "ok" },
  { value: "not_sure", label: "Not sure", rating: "ok" },
];
