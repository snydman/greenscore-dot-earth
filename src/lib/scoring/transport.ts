export type TransportRating = "great" | "good" | "ok" | "bad" | "worst";

export type TransportQuizData =
  | {
      type: "vehicle";
      vehicleId: number;
      year: string;
      make: string;
      model: string;
      co2Gpm: number;
      fuelType: string;
      combinedMpg: number;
    }
  | { type: "none" }
  | { type: "not_sure" };

export type TransportScoreResult = {
  points: number; // 0..20
  maxPoints: 20;
  rating: TransportRating;
  vehicleLabel: string;
  explanation: string;
  source: "epa" | "fallback";
  co2Gpm?: number;
  combinedMpg?: number;
};

const RATING_LABELS: Record<TransportRating, string> = {
  great: "Zero tailpipe emissions",
  good: "Very low emissions",
  ok: "Moderate emissions",
  bad: "High emissions",
  worst: "Among the highest emitting vehicles",
};

function co2GpmToPoints(gpm: number): number {
  return Math.round(Math.max(0, Math.min(20, 20 * (1 - gpm / 500))));
}

function co2GpmToRating(gpm: number): TransportRating {
  if (gpm === 0) return "great";
  if (gpm <= 150) return "good";
  if (gpm <= 300) return "ok";
  if (gpm <= 450) return "bad";
  return "worst";
}

export type MultiTransportScoreResult = {
  points: number;
  maxPoints: 20;
  individual: TransportScoreResult[];
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

export function scoreVehicles(
  vehicles: TransportQuizData[],
): MultiTransportScoreResult {
  if (vehicles.length === 0) {
    return { points: 10, maxPoints: 20, individual: [] };
  }
  const individual = vehicles.map((v) => scoreTransport(v));
  const points = weightedAverage(individual.map((r) => r.points));
  return { points, maxPoints: 20, individual };
}

export function scoreTransport(
  data: TransportQuizData | null | undefined,
): TransportScoreResult {
  if (!data || data.type === "not_sure") {
    return {
      points: 10,
      maxPoints: 20,
      rating: "ok",
      vehicleLabel: "Not sure",
      explanation: "No vehicle selected — scored neutrally",
      source: "fallback",
    };
  }

  if (data.type === "none") {
    return {
      points: 20,
      maxPoints: 20,
      rating: "great",
      vehicleLabel: "No car",
      explanation: "Car-free — zero transport emissions",
      source: "fallback",
    };
  }

  const rating = co2GpmToRating(data.co2Gpm);

  return {
    points: co2GpmToPoints(data.co2Gpm),
    maxPoints: 20,
    rating,
    vehicleLabel: `${data.year} ${data.make} ${data.model}`,
    explanation: `${data.co2Gpm} g CO₂/mile · ${data.combinedMpg} MPG combined · ${data.fuelType}`,
    source: "epa",
    co2Gpm: data.co2Gpm,
    combinedMpg: data.combinedMpg,
  };
}
