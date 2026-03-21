import {
  BANKS,
  BANK_CATEGORIES,
  type BankGreenRating,
  type BankCategory,
} from "../data/banks";

export type BankScoreResult = {
  points: number; // 0..20
  maxPoints: 20;
  bankName: string;
  rating: BankGreenRating;
  source: "curated" | "category-fallback";
  explanation: string;
};

const RATING_POINTS: Record<BankGreenRating, number> = {
  great: 20,
  good: 16,
  ok: 10,
  bad: 4,
  worst: 0,
};

const RATING_LABELS: Record<BankGreenRating, string> = {
  great: "Fossil Free certified — no fossil fuel lending",
  good: "Minimal fossil fuel exposure, strong climate policies",
  ok: "Some fossil fuel lending, limited transparency",
  bad: "Significant fossil fuel financing",
  worst: "Among the world's largest fossil fuel financiers",
};

export function scoreBanking(
  bankSlug: string | null,
  category: BankCategory | null,
): BankScoreResult {
  // Try curated bank first
  if (bankSlug) {
    const bank = BANKS.find((b) => b.slug === bankSlug);
    if (bank) {
      return {
        points: RATING_POINTS[bank.rating],
        maxPoints: 20,
        bankName: bank.name,
        rating: bank.rating,
        source: "curated",
        explanation: RATING_LABELS[bank.rating],
      };
    }
  }

  // Fall back to category
  if (category) {
    const cat = BANK_CATEGORIES.find((c) => c.value === category);
    if (cat) {
      return {
        points: RATING_POINTS[cat.rating],
        maxPoints: 20,
        bankName: cat.label,
        rating: cat.rating,
        source: "category-fallback",
        explanation: `${cat.label} — scored as typical "${cat.rating}" rating`,
      };
    }
  }

  // No bank info at all
  return {
    points: 10,
    maxPoints: 20,
    bankName: "Unknown",
    rating: "ok",
    source: "category-fallback",
    explanation: "No bank selected — scored neutrally",
  };
}
