import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";

export const runtime = "edge";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const score = searchParams.get("s") ?? "?";
  const bank = searchParams.get("b") ?? "–";
  const transport = searchParams.get("t") ?? "–";
  const heating = searchParams.get("h") ?? "–";
  const invest = searchParams.get("i") ?? "–";

  const pct = Number(score);
  const label = pct >= 70 ? "Strong" : pct >= 40 ? "Moderate" : "Needs attention";
  const ringColor = pct >= 70 ? "#059669" : pct >= 40 ? "#d97706" : "#dc2626";

  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          width: "1200px",
          height: "630px",
          background: "linear-gradient(135deg, #ecfdf5 0%, #fffbeb 50%, #ecfdf5 100%)",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            marginBottom: "24px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: "48px",
              height: "48px",
              borderRadius: "16px",
              background: "#059669",
              color: "white",
              fontSize: "24px",
              fontWeight: 700,
            }}
          >
            G
          </div>
          <span style={{ fontSize: "28px", fontWeight: 700, color: "#1e293b" }}>
            GreenScore
          </span>
        </div>

        {/* Score circle */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "200px",
            height: "200px",
            borderRadius: "100px",
            border: `8px solid ${ringColor}`,
            background: "white",
            marginBottom: "16px",
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <span style={{ fontSize: "72px", fontWeight: 700, color: "#1e293b", lineHeight: 1 }}>
              {score}
            </span>
            <span style={{ fontSize: "16px", fontWeight: 600, color: "#64748b", letterSpacing: "0.1em" }}>
              OUT OF 100
            </span>
          </div>
        </div>

        {/* Label */}
        <div
          style={{
            display: "flex",
            padding: "6px 20px",
            borderRadius: "20px",
            background: pct >= 70 ? "#ecfdf5" : pct >= 40 ? "#fffbeb" : "#fef2f2",
            color: ringColor,
            fontSize: "18px",
            fontWeight: 700,
            letterSpacing: "0.05em",
            marginBottom: "32px",
          }}
        >
          {label}
        </div>

        {/* Category scores */}
        <div style={{ display: "flex", gap: "24px", marginBottom: "32px" }}>
          {[
            { label: "Banking", value: bank, max: "20" },
            { label: "Transport", value: transport, max: "20" },
            { label: "Heating", value: heating, max: "20" },
            { label: "Investments", value: invest, max: "40" },
          ].map((cat) => (
            <div
              key={cat.label}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                padding: "12px 24px",
                borderRadius: "16px",
                background: "white",
                border: "1px solid #e2e8f0",
              }}
            >
              <span style={{ fontSize: "14px", fontWeight: 600, color: "#64748b" }}>
                {cat.label}
              </span>
              <span style={{ fontSize: "24px", fontWeight: 700, color: "#1e293b" }}>
                {cat.value}/{cat.max}
              </span>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div
          style={{
            display: "flex",
            padding: "12px 32px",
            borderRadius: "24px",
            background: "#059669",
            color: "white",
            fontSize: "20px",
            fontWeight: 700,
          }}
        >
          What&apos;s your GreenScore? Take the quiz →
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    },
  );
}
