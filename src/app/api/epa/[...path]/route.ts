import { NextRequest, NextResponse } from "next/server";

const EPA_BASE = "https://fueleconomy.gov/ws/rest";

const ALLOWED_PREFIXES = [
  "vehicle/menu/year",
  "vehicle/menu/make",
  "vehicle/menu/model",
  "vehicle/menu/options",
  "vehicle/",
];

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> },
) {
  const { path } = await params;
  const joined = path.join("/");

  // Validate the path is one we allow
  if (!ALLOWED_PREFIXES.some((p) => joined.startsWith(p))) {
    return NextResponse.json({ error: "Invalid path" }, { status: 400 });
  }

  // Forward query string
  const qs = request.nextUrl.search; // includes leading "?"
  const url = `${EPA_BASE}/${joined}${qs}`;

  try {
    const res = await fetch(url, {
      headers: { Accept: "application/json" },
      next: {
        // Cache menu data for 7 days, vehicle data for 30 days
        revalidate: joined.startsWith("vehicle/menu") ? 604800 : 2592000,
      },
    });

    if (!res.ok) {
      return NextResponse.json(
        { error: `EPA API returned ${res.status}` },
        { status: res.status },
      );
    }

    const data = await res.json();

    // Normalize: EPA returns { menuItem: object } for single results
    // and { menuItem: array } for multiple. Normalize to always return array.
    if (data?.menuItem && !Array.isArray(data.menuItem)) {
      data.menuItem = [data.menuItem];
    }

    return NextResponse.json(data, {
      headers: {
        "Cache-Control": "public, max-age=604800, s-maxage=604800",
      },
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json(
      { error: `EPA lookup failed: ${message}` },
      { status: 502 },
    );
  }
}
