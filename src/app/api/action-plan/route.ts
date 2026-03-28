import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit, getRateLimitKey } from "../../../lib/rate-limit";

const ANTHROPIC_API_URL = "https://api.anthropic.com/v1/messages";

const SYSTEM_PROMPT = `You are a friendly, practical personal climate advisor for GreenScore.earth. The user just completed a quiz about their banking, transportation, home heating, air travel, and investments. You'll receive their answers, scores, and local data (if available).

Write a personalized action plan with 3-5 concrete, encouraging steps ranked by impact. Guidelines:
- Be specific to THEIR situation (reference their actual bank, car, heating type, flight frequency, etc.)
- Focus on the biggest score gaps first — where they lose the most points is where they can improve most
- Keep tone warm and motivating, never preachy or guilt-inducing — especially about air travel
- Each step should be something they can actually do in the next 1-3 months
- Include a rough sense of impact (e.g., "This alone could raise your score by ~10 points")
- If they're already doing well in a category, acknowledge it briefly
- If local data is provided (EV chargers nearby, solar potential), weave it naturally into your advice
- For air travel, frame it as awareness — mention carbon offsets or fewer connecting flights, not "stop flying"
- Keep it concise — no more than 250 words total
- Use plain language, no jargon
- Format as a numbered list with bold action titles`;

type ActionPlanRequest = {
  overallScore: number;
  maxScore: number;
  bankScore: number;
  bankMax: number;
  transportScore: number;
  transportMax: number;
  heatingScore: number;
  heatingMax: number;
  airTravelScore: number;
  airTravelMax: number;
  airTravelTier: string;
  investScore: number;
  investMax: number;
  bankNames: string[];
  vehicleDescriptions: string[];
  heatingType: string | null;
  heatingState: string | null;
  tickers: string;
  zipCode: string | null;
  evChargersNearby: number | null;
  solarPotentialKwh: number | null;
};

function buildUserMessage(data: ActionPlanRequest): string {
  const lines: string[] = [
    `Overall GreenScore: ${data.overallScore} / ${data.maxScore}`,
    "",
    `Banking: ${data.bankScore} / ${data.bankMax}`,
    `  Banks: ${data.bankNames.length > 0 ? data.bankNames.join(", ") : "none entered"}`,
    "",
    `Transport: ${data.transportScore} / ${data.transportMax}`,
    `  Vehicles: ${data.vehicleDescriptions.length > 0 ? data.vehicleDescriptions.join("; ") : "none entered"}`,
    "",
    `Heating: ${data.heatingScore} / ${data.heatingMax}`,
    `  Type: ${data.heatingType ?? "not specified"}`,
    data.heatingState ? `  State: ${data.heatingState}` : "",
    "",
    `Air Travel: ${data.airTravelScore} / ${data.airTravelMax}`,
    `  Frequency: ${data.airTravelTier}`,
    "",
    `Investments: ${data.investScore} / ${data.investMax}`,
    `  Tickers: ${data.tickers || "none entered"}`,
  ];

  if (data.zipCode || data.evChargersNearby != null || data.solarPotentialKwh != null) {
    lines.push("", "Local data:");
    if (data.zipCode) lines.push(`  Zip code: ${data.zipCode}`);
    if (data.evChargersNearby != null) lines.push(`  EV chargers within 10 miles: ${data.evChargersNearby}`);
    if (data.solarPotentialKwh != null) lines.push(`  Solar potential (5kW system): ~${data.solarPotentialKwh.toLocaleString()} kWh/year`);
  }

  lines.push("", "Please give me my personalized action plan.");
  return lines.filter((l) => l !== undefined).join("\n");
}

export async function POST(request: NextRequest) {
  // Rate limit: 5 requests per minute per IP (protects Anthropic API key costs)
  const rlKey = getRateLimitKey(request, "action-plan");
  const rl = checkRateLimit(rlKey, { maxRequests: 5, windowMs: 60_000 });
  if (!rl.allowed) {
    return NextResponse.json(
      { error: "Too many requests. Please try again shortly." },
      { status: 429, headers: { "Retry-After": String(Math.ceil(rl.resetMs / 1000)) } },
    );
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "Anthropic API key not configured" },
      { status: 503 },
    );
  }

  let data: ActionPlanRequest;
  try {
    data = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  try {
    const res = await fetch(ANTHROPIC_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: process.env.ACTION_PLAN_MODEL || "claude-haiku-4-5-20251001",
        max_tokens: 512,
        system: SYSTEM_PROMPT,
        messages: [{ role: "user", content: buildUserMessage(data) }],
      }),
    });

    if (!res.ok) {
      const text = await res.text();
      console.error("Anthropic API error:", res.status, text);
      return NextResponse.json(
        { error: `AI service error (${res.status})` },
        { status: 502 },
      );
    }

    const json = await res.json();
    const plan = json?.content?.[0]?.text ?? "";

    return NextResponse.json({ plan });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json(
      { error: `Action plan failed: ${message}` },
      { status: 500 },
    );
  }
}
