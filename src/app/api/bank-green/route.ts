import { NextRequest, NextResponse } from "next/server";

type BankGreenNode = {
  name: string;
  tag: string;
  rating: string;
};

// In-memory cache of rated US banks from Bank.Green
let bankCache: BankGreenNode[] | null = null;
let bankCacheTimestamp = 0;
const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

const GRAPHQL_URL = "https://bank.green/api/graphql";

const QUERY = `{
  brands(first: 500, country: "US", rating: ["great", "good", "ok", "bad", "worst"]) {
    edges {
      node {
        name
        tag
        commentary { rating }
      }
    }
  }
}`;

async function fetchBanks(): Promise<BankGreenNode[]> {
  if (bankCache && Date.now() - bankCacheTimestamp < CACHE_TTL_MS) {
    return bankCache;
  }

  const res = await fetch(GRAPHQL_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query: QUERY }),
  });

  if (!res.ok) {
    throw new Error(`Bank.Green API returned ${res.status}`);
  }

  const json = await res.json();
  const edges = json?.data?.brands?.edges ?? [];

  bankCache = edges.map(
    (e: { node: { name: string; tag: string; commentary: { rating: string } } }) => ({
      name: e.node.name,
      tag: e.node.tag,
      rating: e.node.commentary.rating,
    }),
  );
  bankCacheTimestamp = Date.now();

  return bankCache!;
}

export async function GET(request: NextRequest) {
  const q = (request.nextUrl.searchParams.get("q") ?? "").trim().toLowerCase();

  if (q.length < 2) {
    return NextResponse.json(
      { error: "Query must be at least 2 characters" },
      { status: 400 },
    );
  }

  try {
    const banks = await fetchBanks();

    const matches = banks
      .filter((b) => b.name.toLowerCase().includes(q))
      .slice(0, 15);

    return NextResponse.json({ banks: matches }, {
      headers: { "Cache-Control": "private, max-age=300" },
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json(
      { error: `Bank.Green lookup failed: ${message}` },
      { status: 502 },
    );
  }
}
