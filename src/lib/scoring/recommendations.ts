import type { MultiBankScoreResult } from "./banking";
import type { MultiTransportScoreResult, TransportQuizData } from "./transport";
import type { HeatingScoreResult, HeatingType } from "./heating";
import type { InvestmentFactor } from "./investments";
import type { BankCategory } from "../data/banks";

export type Recommendation = {
  category: "banking" | "transport" | "heating" | "investments";
  title: string;
  body: string;
  priority: number;
  link?: { label: string; url: string };
};

type RecommendationInput = {
  bankResult: MultiBankScoreResult;
  transportResult: MultiTransportScoreResult;
  heatingResult: HeatingScoreResult;
  investmentScore: { points: number; maxPoints: number };
  factors: InvestmentFactor[];
  answers: {
    tickers: string;
    banks?: Array<{
      bankSlug: string | null;
      bankDisplayName: string;
      bankCategory: BankCategory | null;
    }>;
    vehicles?: TransportQuizData[];
    heating?: HeatingType | null;
    heatingState?: string | null;
  };
};

const BANK_GREEN_LINK = { label: "Find a greener bank", url: "https://bank.green" };
const BANK_GREEN_BROWSE = { label: "Browse certified banks", url: "https://bank.green/sustainable-banks" };
const EV_COMPARE_LINK = { label: "Compare EVs", url: "https://fueleconomy.gov/feg/Find.do?action=bt1" };
const IRA_CALCULATOR_LINK = { label: "Check your IRA savings", url: "https://www.rewiringamerica.org/app/ira-calculator" };
const COMMUNITY_SOLAR_LINK = { label: "Find community solar", url: "https://communitysolar.energysage.com/" };
const FOSSIL_FREE_FUNDS_LINK = { label: "Compare fossil-free funds", url: "https://fossilfreefunds.org" };

function bankingRecommendations(input: RecommendationInput): Recommendation[] {
  const { bankResult } = input;
  const recs: Recommendation[] = [];
  const lostPoints = bankResult.maxPoints - bankResult.points;

  if (lostPoints <= 2) return recs; // score 18+ is great, no recs

  // Check for worst-rated banks
  const worstBank = bankResult.individual.find((b) => b.rating === "worst");
  if (worstBank) {
    recs.push({
      category: "banking",
      title: `Switch from ${worstBank.bankName} to a greener bank`,
      body: `${worstBank.bankName} is among the world's largest fossil fuel financiers. Moving even one account to a credit union or community bank makes a measurable difference.`,
      priority: lostPoints * 10 + 5,
      link: BANK_GREEN_LINK,
    });
    return recs; // one strong rec is enough for banking
  }

  // Check for bad-rated banks
  const badBank = bankResult.individual.find((b) => b.rating === "bad");
  if (badBank) {
    recs.push({
      category: "banking",
      title: `Consider a greener alternative to ${badBank.bankName}`,
      body: `${badBank.bankName} has significant fossil fuel lending exposure. Online banks, credit unions, and CDFIs typically have much lower exposure.`,
      priority: lostPoints * 10 + 3,
      link: BANK_GREEN_LINK,
    });
    return recs;
  }

  // All banks are "ok" or below with none "good"+
  const hasGoodOrBetter = bankResult.individual.some(
    (b) => b.rating === "good" || b.rating === "great",
  );
  if (!hasGoodOrBetter && bankResult.individual.length > 0) {
    recs.push({
      category: "banking",
      title: "Look into fossil-free certified banks",
      body: "Banks certified by Bank.Green have committed to zero fossil fuel lending. Aspiration, Amalgamated, and Beneficial State Bank are examples.",
      priority: lostPoints * 10 + 1,
      link: BANK_GREEN_BROWSE,
    });
  }

  return recs;
}

function transportRecommendations(input: RecommendationInput): Recommendation[] {
  const { transportResult, answers } = input;
  const recs: Recommendation[] = [];
  const lostPoints = transportResult.maxPoints - transportResult.points;
  const vehicles = answers.vehicles ?? [];

  if (lostPoints === 0) return recs; // perfect score

  // Too many vehicles
  if (vehicles.length >= 3) {
    recs.push({
      category: "transport",
      title: `Consider whether you need ${vehicles.length} vehicles`,
      body: `Reducing from ${vehicles.length} cars to ${vehicles.length - 1} and using transit, biking, or carpooling for some trips would significantly cut your transport footprint.`,
      priority: lostPoints * 10 + 2,
    });
  }

  // Find the worst-emitting vehicle
  const vehicleData = vehicles.filter(
    (v): v is Extract<TransportQuizData, { type: "vehicle" }> => v.type === "vehicle",
  );

  const worstVehicle = vehicleData
    .slice()
    .sort((a, b) => b.co2Gpm - a.co2Gpm)[0];

  if (worstVehicle) {
    if (worstVehicle.co2Gpm > 400) {
      recs.push({
        category: "transport",
        title: `Your ${worstVehicle.year} ${worstVehicle.make} ${worstVehicle.model} is a heavy emitter`,
        body: `At ${worstVehicle.co2Gpm} g CO\u2082/mile, this is among the highest-emitting vehicles on the road. When it's time to replace it, an EV or hybrid could cut emissions by 80%+.`,
        priority: lostPoints * 10 + 5,
        link: EV_COMPARE_LINK,
      });
    } else if (worstVehicle.co2Gpm > 300) {
      recs.push({
        category: "transport",
        title: "Plan your next vehicle as electric or hybrid",
        body: `Your ${worstVehicle.year} ${worstVehicle.make} ${worstVehicle.model} produces ${worstVehicle.co2Gpm} g CO\u2082/mile. EVs and plug-in hybrids now cost less to own over their lifetime than comparable gas vehicles.`,
        priority: lostPoints * 10 + 3,
        link: EV_COMPARE_LINK,
      });
    } else if (worstVehicle.co2Gpm > 0) {
      // Good but not great
      recs.push({
        category: "transport",
        title: "Your next vehicle could be fully electric",
        body: "You're already driving efficiently. Going fully electric on your next purchase would bring your transport emissions to zero.",
        priority: lostPoints * 10 + 1,
        link: EV_COMPARE_LINK,
      });
    }
  }

  return recs;
}

function heatingRecommendations(input: RecommendationInput): Recommendation[] {
  const { heatingResult, answers } = input;
  const recs: Recommendation[] = [];
  const lostPoints = heatingResult.maxPoints - heatingResult.points;
  const heating = answers.heating;

  if (!heating || heating === "heat_pump") return recs; // already optimal

  if (heating === "oil") {
    recs.push({
      category: "heating",
      title: "Replace oil heating with a heat pump",
      body: "Oil is the most carbon-intensive common heating fuel. Heat pumps are 3\u20134\u00d7 more efficient and eligible for federal tax credits up to $2,000.",
      priority: lostPoints * 10 + 5,
      link: IRA_CALCULATOR_LINK,
    });
  } else if (heating === "propane") {
    recs.push({
      category: "heating",
      title: "Consider switching from propane to a heat pump",
      body: "Heat pumps work efficiently even in cold climates and can cut heating emissions by 50\u201375% compared to propane.",
      priority: lostPoints * 10 + 4,
      link: IRA_CALCULATOR_LINK,
    });
  } else if (heating === "gas") {
    recs.push({
      category: "heating",
      title: "Get a quote for a heat pump",
      body: "Modern heat pumps work well even below 0\u00b0F and can replace your gas furnace. The IRA provides up to $2,000 in tax credits for heat pump installation.",
      priority: lostPoints * 10 + 3,
      link: IRA_CALCULATOR_LINK,
    });
  } else if (heating === "electric_resistance") {
    recs.push({
      category: "heating",
      title: "Upgrade to a heat pump",
      body: "A heat pump uses 3\u20134\u00d7 less electricity than resistance heating for the same warmth, cutting your heating bill and grid emissions.",
      priority: lostPoints * 10 + 2,
      link: IRA_CALCULATOR_LINK,
    });
  }

  // Dirty grid modifier for electric heating
  if (heatingResult.stateModifier && heatingResult.stateModifier.adjustment < 0) {
    const { stateName } = heatingResult.stateModifier;
    recs.push({
      category: "heating",
      title: `Support clean energy in ${stateName}`,
      body: `Your state's grid is carbon-heavy. Signing up for a community solar program or green energy plan can offset this.`,
      priority: lostPoints * 10 + 1,
      link: COMMUNITY_SOLAR_LINK,
    });
  }

  return recs;
}

function investmentRecommendations(input: RecommendationInput): Recommendation[] {
  const { investmentScore, factors, answers } = input;
  const recs: Recommendation[] = [];
  const lostPoints = investmentScore.maxPoints - investmentScore.points;
  const tickers = (answers.tickers ?? "").trim();

  // No tickers entered
  if (!tickers) {
    recs.push({
      category: "investments",
      title: "Check your fund tickers for a more complete score",
      body: "Adding your 401(k) or brokerage fund tickers lets us score your actual fossil fuel exposure from SEC filings.",
      priority: 50, // medium priority since we don't know the actual score
    });
    return recs;
  }

  if (lostPoints <= 4) return recs; // score 36+, already great

  // Find worst fund
  const scored = factors.filter((f) => f.status === "scored");
  const worstFund = scored
    .slice()
    .sort((a, b) => a.points - b.points)[0];

  if (worstFund && worstFund.points < 26 && worstFund.fossilExposurePct != null) {
    recs.push({
      category: "investments",
      title: `Your fund ${worstFund.ticker} has ${worstFund.fossilExposurePct.toFixed(1)}% fossil fuel exposure`,
      body: "Consider lower-carbon alternatives. ESG-screened index funds like ESGU or SUSA track the market while excluding major fossil fuel companies.",
      priority: lostPoints * 10 + 5,
      link: FOSSIL_FREE_FUNDS_LINK,
    });
    return recs;
  }

  // General high exposure
  if (investmentScore.points < 30) {
    recs.push({
      category: "investments",
      title: "Review your investment mix for fossil fuel exposure",
      body: "Your funds have above-average exposure to oil, gas, and coal companies. Fossil-free index funds now cover most asset classes.",
      priority: lostPoints * 10 + 3,
      link: FOSSIL_FREE_FUNDS_LINK,
    });
  }

  return recs;
}

export function getRecommendations(input: RecommendationInput): Recommendation[] {
  const allRecs = [
    ...bankingRecommendations(input),
    ...transportRecommendations(input),
    ...heatingRecommendations(input),
    ...investmentRecommendations(input),
  ];

  // Sort by priority (highest number = most important, surfaces first)
  allRecs.sort((a, b) => b.priority - a.priority);

  return allRecs.slice(0, 5);
}
