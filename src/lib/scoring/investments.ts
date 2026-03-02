type FundEntry = {
    name?: string;
    fossilGrade?: string;
    fossilFlag?: boolean | "unknown";
    source?: string;
    asOf?: string;
    notes?: string;
  };
  
  export type InvestmentFactor = {
    ticker: string;
    name?: string;
    grade?: string;
    points: number; // 0..40 contribution (per-ticker mapped then averaged)
    explanation: string;
    status: "scored" | "unknown";
  };
  
  export type InvestmentScoreResult = {
    points: number; // 0..40
    maxPoints: 40;
    confidence: "low" | "medium" | "high";
    factors: InvestmentFactor[];
    unknownTickers: string[];
  };
  
  function normalizeTicker(raw: string) {
    return raw.trim().toUpperCase();
  }
  
  export function parseTickers(raw: string): string[] {
    return raw
      .split(",")
      .map(normalizeTicker)
      .filter(Boolean);
  }
  
  /**
   * Map a fossil fuel grade (string) to a 0..40 score.
   * We don't know the exact semantics of the dataset grade letters here,
   * so we keep this conservative and easily adjustable.
   */
  export function gradeToPoints40(gradeRaw?: string): { points: number; explanation: string } {
    const grade = (gradeRaw ?? "").trim().toUpperCase();
  
    // Common letter grade mapping
    const map: Record<string, number> = {
      A: 40,
      "A-": 38,
      B: 34,
      "B-": 32,
      C: 26,
      "C-": 24,
      D: 16,
      "D-": 14,
      F: 6,
    };
  
    if (grade in map) {
      const points = map[grade];
      return { points, explanation: `Fossil fuel grade ${grade} → ${points}/40` };
    }
  
    // If missing / unrecognized
    return { points: 24, explanation: "No recognized fossil fuel grade → neutral 24/40 (prototype)" };
  }
  
  export function scoreInvestments(
    rawTickers: string,
    funds: Record<string, FundEntry>,
  ): InvestmentScoreResult {
    const tickers = parseTickers(rawTickers);
    if (tickers.length === 0) {
      return {
        points: 0,
        maxPoints: 40,
        confidence: "low",
        factors: [],
        unknownTickers: [],
      };
    }
  
    const factors: InvestmentFactor[] = [];
    const unknown: string[] = [];
  
    for (const t of tickers) {
      const entry = funds[t];
      if (!entry) {
        unknown.push(t);
        factors.push({
          ticker: t,
          points: 24,
          explanation: "Ticker not found in dataset → neutral 24/40 (prototype)",
          status: "unknown",
        });
        continue;
      }
  
      const { points, explanation } = gradeToPoints40(entry.fossilGrade);
      factors.push({
        ticker: t,
        name: entry.name,
        grade: entry.fossilGrade,
        points,
        explanation,
        status: entry.fossilGrade ? "scored" : "unknown",
      });
    }
  
    // Average the per-ticker points to get a section score (0..40)
    const avg = factors.reduce((sum, f) => sum + f.points, 0) / factors.length;
    const points = Math.round(avg);
  
    // Confidence: based on how many tickers were found AND had recognizable grades
    const scoredCount = factors.filter((f) => f.status === "scored").length;
    const foundCount = tickers.length - unknown.length;
    const foundRatio = foundCount / tickers.length;
    const scoredRatio = scoredCount / tickers.length;
  
    const confidence: InvestmentScoreResult["confidence"] =
      scoredRatio >= 0.8 ? "high" : foundRatio >= 0.5 ? "medium" : "low";
  
    return {
      points,
      maxPoints: 40,
      confidence,
      factors,
      unknownTickers: unknown,
    };
  }