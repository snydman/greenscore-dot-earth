import { NextRequest, NextResponse } from "next/server";

/**
 * Local insights API — takes a zip code and returns:
 * 1. EV charger count nearby (OpenChargeMap — free, no key)
 * 2. Solar potential (NREL PVWatts — free, requires NREL_API_KEY)
 * 3. Grid carbon intensity (from our static eGRID data via zip-to-state)
 */

// ── Zip → lat/lng via Census geocoder (free, no key) ──

type GeoResult = { lat: number; lng: number; state: string } | null;

async function geocodeZip(zip: string): Promise<GeoResult> {
  // Zippopotam.us — free, no key, reliable zip-to-coordinates
  const url = `https://api.zippopotam.us/us/${zip}`;
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(5000) });
    if (!res.ok) return null;
    const json = await res.json();
    const place = json?.places?.[0];
    if (!place) return null;
    return {
      lat: parseFloat(place.latitude),
      lng: parseFloat(place.longitude),
      state: place["state abbreviation"] ?? "",
    };
  } catch {
    return null;
  }
}

// ── EV Chargers via NREL Alternative Fuel Stations API (free with NREL key) ──

type EvChargerResult = {
  totalFound: number;
  radiusMiles: number;
  nearestDistance?: number;
  sampleLocations: Array<{ name: string; distance: number }>;
};

async function fetchEvChargers(lat: number, lng: number): Promise<EvChargerResult | null> {
  const apiKey = process.env.NREL_API_KEY;
  if (!apiKey) return null;

  const radiusMiles = 10;
  const url = `https://developer.nlr.gov/api/alt-fuel-stations/v1/nearest.json?api_key=${apiKey}&latitude=${lat}&longitude=${lng}&radius=${radiusMiles}&fuel_type=ELEC&status=E&limit=100`;
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
    if (!res.ok) return null;
    const json = await res.json();
    const stations = json?.fuel_stations ?? [];

    const sorted = stations
      .filter((s: { distance: number }) => s.distance != null)
      .sort((a: { distance: number }, b: { distance: number }) => a.distance - b.distance);

    return {
      totalFound: json.total_results ?? stations.length,
      radiusMiles,
      nearestDistance: sorted[0]?.distance,
      sampleLocations: sorted.slice(0, 3).map((s: { station_name: string; distance: number }) => ({
        name: s.station_name,
        distance: Math.round(s.distance * 10) / 10,
      })),
    };
  } catch {
    return null;
  }
}

// ── Solar potential via NREL PVWatts (free with API key) ──

type SolarResult = {
  annualKwh: number;
  capacityKw: number;
  solarResourceDaily: number; // peak sun hours
  message: string;
};

async function fetchSolarPotential(lat: number, lng: number): Promise<SolarResult | null> {
  const apiKey = process.env.NREL_API_KEY;
  if (!apiKey) return null;

  // 5kW system (typical residential), standard assumptions
  const url = `https://developer.nlr.gov/api/pvwatts/v8.json?api_key=${apiKey}&lat=${lat}&lon=${lng}&system_capacity=5&azimuth=180&tilt=20&array_type=1&module_type=0&losses=14`;
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(10000) });
    if (!res.ok) return null;
    const json = await res.json();
    const outputs = json?.outputs;
    if (!outputs) return null;

    const annualKwh = Math.round(outputs.ac_annual);
    const solarResourceDaily = Math.round(outputs.solrad_annual * 10) / 10;

    return {
      annualKwh,
      capacityKw: 5,
      solarResourceDaily,
      message: `A typical 5kW rooftop system in your area could generate ~${annualKwh.toLocaleString()} kWh/year (${solarResourceDaily} peak sun hours/day).`,
    };
  } catch {
    return null;
  }
}

// ── Main handler ──

export async function GET(request: NextRequest) {
  const zip = (request.nextUrl.searchParams.get("zip") ?? "").trim();

  if (!/^\d{5}$/.test(zip)) {
    return NextResponse.json({ error: "Invalid zip code" }, { status: 400 });
  }

  const geo = await geocodeZip(zip);
  if (!geo) {
    return NextResponse.json(
      { error: "Could not locate that zip code" },
      { status: 404 },
    );
  }

  // Fetch EV chargers and solar in parallel
  const [evChargers, solar] = await Promise.all([
    fetchEvChargers(geo.lat, geo.lng),
    fetchSolarPotential(geo.lat, geo.lng),
  ]);

  return NextResponse.json({
    zip,
    state: geo.state,
    lat: geo.lat,
    lng: geo.lng,
    evChargers,
    solar,
  }, {
    headers: { "Cache-Control": "private, max-age=3600" },
  });
}
