/**
 * Air travel scoring — educational / awareness tier.
 *
 * Scoring is intentionally gentle (max 10 points) because the goal is
 * awareness, not shaming.  A single cross-country round-trip emits roughly
 * 1 tonne of CO₂ — about the same as 3 months of average driving.
 *
 * Tier-based on self-reported round-trip flights per year.
 */

export type AirTravelTier =
  | "none"       // 0 flights
  | "rare"       // 1–2 flights
  | "moderate"   // 3–5 flights
  | "frequent"   // 6–10 flights
  | "very_frequent" // 11+ flights
  | "not_sure";

export type AirTravelScoreResult = {
  points: number;
  maxPoints: 10;
  tier: AirTravelTier;
  tierLabel: string;
  explanation: string;
  didYouKnow: string;
};

const TIER_DATA: Record<AirTravelTier, { points: number; label: string; explanation: string }> = {
  none: {
    points: 10,
    label: "No flights",
    explanation: "Not flying is the single biggest reduction in personal transport emissions.",
  },
  rare: {
    points: 8,
    label: "1–2 flights / year",
    explanation: "A couple of flights a year is well below average. Each round-trip still matters, but you're on the low end.",
  },
  moderate: {
    points: 6,
    label: "3–5 flights / year",
    explanation: "This is roughly average for Americans who fly. Each flight adds about 0.5–1.5 tonnes of CO₂.",
  },
  frequent: {
    points: 3,
    label: "6–10 flights / year",
    explanation: "Frequent flying can become the largest single item in your carbon footprint — often exceeding driving and heating combined.",
  },
  very_frequent: {
    points: 1,
    label: "11+ flights / year",
    explanation: "At this level, flying likely dominates your carbon footprint. Even one fewer flight per year makes a meaningful difference.",
  },
  not_sure: {
    points: 5,
    label: "Not sure",
    explanation: "We've given you a middle-of-the-road estimate. If you can recall your flights, retaking the quiz will sharpen your score.",
  },
};

// Educational facts matched to tier — framed as awareness, not judgment
const DID_YOU_KNOW: Record<AirTravelTier, string> = {
  none: "The average American who flies takes about 3 round trips a year. By not flying, you avoid roughly 3 tonnes of CO₂ annually.",
  rare: "A single round-trip from New York to Los Angeles produces about 1 tonne of CO₂ — roughly the same as 3 months of average driving.",
  moderate: "Aviation accounts for about 2.5% of global CO₂ emissions, but its warming effect is roughly double that due to contrails and other high-altitude effects.",
  frequent: "If flying were a country, it would rank in the top 10 emitters worldwide. Direct flights emit about 50% less CO₂ per mile than connecting flights.",
  very_frequent: "One transatlantic round-trip emits more CO₂ than the average person in many developing countries produces in an entire year.",
  not_sure: "The average American's flights produce about 2 tonnes of CO₂ per year — more than home heating for many households.",
};

export function scoreAirTravel(tier: AirTravelTier | null | undefined): AirTravelScoreResult {
  const t = tier && tier in TIER_DATA ? tier : "not_sure";
  const data = TIER_DATA[t];

  return {
    points: data.points,
    maxPoints: 10,
    tier: t,
    tierLabel: data.label,
    explanation: data.explanation,
    didYouKnow: DID_YOU_KNOW[t],
  };
}
