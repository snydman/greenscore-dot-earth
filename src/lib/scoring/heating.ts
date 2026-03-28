import { STATE_GRID_EMISSIONS, NATIONAL_AVG_CO2 } from "../data/grid-emissions";

export type HeatingType =
  | "heat_pump"
  | "gas"
  | "oil"
  | "propane"
  | "electric_resistance"
  | "wood"
  | "not_sure";

export type HeatingRating = "great" | "good" | "ok" | "bad" | "worst";

export type HeatingScoreResult = {
  points: number; // 0..18
  maxPoints: 18;
  rating: HeatingRating;
  heatingLabel: string;
  explanation: string;
  stateModifier?: {
    stateCode: string;
    stateName: string;
    adjustment: number; // positive = bonus, negative = penalty
    reason: string;
  };
};

/**
 * Base scores by heating type (before state modifier).
 *
 * Heat pumps are the gold standard — 3-4x more efficient than resistance
 * heating and zero on-site emissions. Gas is moderate (lower CO2 than oil
 * per BTU but still fossil). Oil and propane are worst among common options.
 */
const BASE_SCORES: Record<HeatingType, { points: number; rating: HeatingRating; label: string }> = {
  heat_pump:           { points: 18, rating: "great", label: "Heat pump" },
  electric_resistance: { points: 13, rating: "good",  label: "Electric resistance" },
  gas:                 { points: 9,  rating: "ok",    label: "Natural gas" },
  propane:             { points: 5,  rating: "bad",   label: "Propane" },
  oil:                 { points: 4,  rating: "bad",   label: "Heating oil" },
  wood:                { points: 7,  rating: "ok",    label: "Wood / pellet" },
  not_sure:            { points: 9,  rating: "ok",    label: "Not sure" },
};

const RATING_THRESHOLDS: Array<[number, HeatingRating]> = [
  [16, "great"],
  [13, "good"],
  [7, "ok"],
  [4, "bad"],
  [0, "worst"],
];

function pointsToRating(points: number): HeatingRating {
  for (const [threshold, rating] of RATING_THRESHOLDS) {
    if (points >= threshold) return rating;
  }
  return "worst";
}

/**
 * Compute a state-based modifier for electric heating types.
 *
 * Electric heating (heat pump or resistance) is only as clean as the grid
 * powering it. In states with very clean grids (hydro, nuclear, renewables),
 * electric heating is even better. In coal-heavy states, it may be worse
 * than the base score suggests.
 *
 * Modifier range: -3 to +3 points (small nudge, not a complete override).
 */
function computeStateModifier(
  heatingType: HeatingType,
  stateCode: string,
): HeatingScoreResult["stateModifier"] | undefined {
  // Only applies to electric heating types
  if (heatingType !== "heat_pump" && heatingType !== "electric_resistance") {
    return undefined;
  }

  const stateData = STATE_GRID_EMISSIONS[stateCode];
  if (!stateData) return undefined;

  const { co2LbsPerMWh, name } = stateData;

  // Compare state grid intensity to national average
  // Below average = cleaner = bonus, above average = dirtier = penalty
  const ratio = co2LbsPerMWh / NATIONAL_AVG_CO2;

  let adjustment: number;
  let reason: string;

  if (ratio <= 0.4) {
    // Very clean grid (VT, WA, OR, ID, NH, ME, SD)
    adjustment = 3;
    reason = `${name} has a very clean grid (${co2LbsPerMWh} lbs CO\u2082/MWh vs ${NATIONAL_AVG_CO2} national avg)`;
  } else if (ratio <= 0.7) {
    // Clean grid (NY, CA, CT, NJ, SC, etc.)
    adjustment = 2;
    reason = `${name} has a cleaner-than-average grid (${co2LbsPerMWh} lbs CO\u2082/MWh)`;
  } else if (ratio <= 1.0) {
    // Near average — no adjustment
    adjustment = 0;
    reason = `${name}'s grid is near the national average`;
  } else if (ratio <= 1.5) {
    // Dirtier than average (CO, OH, MI, etc.)
    adjustment = -2;
    reason = `${name} has a carbon-heavy grid (${co2LbsPerMWh} lbs CO\u2082/MWh)`;
  } else {
    // Very dirty grid (WV, WY, KY, ND, IN, MO)
    adjustment = -3;
    reason = `${name} has one of the most carbon-intensive grids (${co2LbsPerMWh} lbs CO\u2082/MWh)`;
  }

  if (adjustment === 0) return undefined;

  return { stateCode, stateName: name, adjustment, reason };
}

export function scoreHeating(
  heatingType: HeatingType | null | undefined,
  stateCode?: string | null,
): HeatingScoreResult {
  if (!heatingType || heatingType === "not_sure") {
    return {
      points: 9,
      maxPoints: 18,
      rating: "ok",
      heatingLabel: "Not sure",
      explanation: "No heating type selected \u2014 scored neutrally",
    };
  }

  const base = BASE_SCORES[heatingType];
  const modifier = stateCode ? computeStateModifier(heatingType, stateCode) : undefined;

  const rawPoints = base.points + (modifier?.adjustment ?? 0);
  const points = Math.max(0, Math.min(18, rawPoints));
  const rating = pointsToRating(points);

  let explanation = "";
  switch (heatingType) {
    case "heat_pump":
      explanation = "Heat pumps are 3\u20134\u00d7 more efficient than resistance heating with zero on-site emissions";
      break;
    case "electric_resistance":
      explanation = "Electric resistance heating has zero on-site emissions but lower efficiency than heat pumps";
      break;
    case "gas":
      explanation = "Natural gas produces ~117 lbs CO\u2082 per million BTU";
      break;
    case "propane":
      explanation = "Propane produces ~139 lbs CO\u2082 per million BTU";
      break;
    case "oil":
      explanation = "Heating oil produces ~163 lbs CO\u2082 per million BTU \u2014 the most carbon-intensive common heating fuel";
      break;
    case "wood":
      explanation = "Wood/pellet heating is roughly carbon-neutral if sustainably sourced, but has air quality concerns";
      break;
  }

  if (modifier) {
    explanation += ` \u00b7 ${modifier.reason}`;
  }

  return {
    points,
    maxPoints: 18,
    rating,
    heatingLabel: base.label,
    explanation,
    stateModifier: modifier,
  };
}
