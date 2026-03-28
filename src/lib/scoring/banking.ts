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

export type MultiBankScoreResult = {
  points: number;
  maxPoints: 20;
  individual: BankScoreResult[];
};

function weightedAverage(scores: number[]): number {
  if (scores.length === 0) return 10;
  if (scores.length === 1) return scores[0];
  const PRIMARY_WEIGHT = 0.6;
  const secondaryWeight = 0.4 / (scores.length - 1);
  let total = scores[0] * PRIMARY_WEIGHT;
  for (let i = 1; i < scores.length; i++) {
    total += scores[i] * secondaryWeight;
  }
  return Math.round(total);
}

export function scoreBanks(
  banks: Array<{
    bankSlug: string | null;
    bankCategory: BankCategory | null;
    bankRating?: string | null;
    bankDisplayName?: string;
  }>,
): MultiBankScoreResult {
  if (banks.length === 0) {
    return { points: 10, maxPoints: 20, individual: [] };
  }
  const individual = banks.map((b) =>
    scoreBanking(b.bankSlug, b.bankCategory, b.bankRating, b.bankDisplayName),
  );
  const points = weightedAverage(individual.map((r) => r.points));
  return { points, maxPoints: 20, individual };
}

export function scoreBanking(
  bankSlug: string | null,
  category: BankCategory | null,
  bankGreenRating?: string | null,
  displayName?: string,
): BankScoreResult {
  // If we have a Bank.Green rating directly (from the API), use it
  if (bankGreenRating && bankGreenRating in RATING_POINTS) {
    const rating = bankGreenRating as BankGreenRating;
    return {
      points: RATING_POINTS[rating],
      maxPoints: 20,
      bankName: displayName ?? bankSlug ?? "Unknown",
      rating,
      source: "curated",
      explanation: RATING_LABELS[rating],
    };
  }

  // Try curated bank list as fallback
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
