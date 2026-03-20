import { NextRequest, NextResponse } from "next/server";
import { scoreTickerEdgar } from "../../../lib/scoring/edgar";

export async function GET(request: NextRequest) {
  const ticker = request.nextUrl.searchParams.get("ticker");

  if (!ticker || !/^[A-Za-z]{1,10}$/.test(ticker)) {
    return NextResponse.json(
      { error: "Missing or invalid ticker parameter" },
      { status: 400 },
    );
  }

  try {
    const result = await scoreTickerEdgar(ticker);

    return NextResponse.json(result, {
      headers: {
        // Holdings are quarterly; cache for 7 days
        "Cache-Control": "public, max-age=604800, s-maxage=604800",
      },
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown error";

    if (message.includes("not found")) {
      return NextResponse.json({ error: message }, { status: 404 });
    }

    return NextResponse.json(
      { error: `SEC EDGAR lookup failed: ${message}` },
      { status: 502 },
    );
  }
}
