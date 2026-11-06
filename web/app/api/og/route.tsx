import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";

export const runtime = "edge";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    const type = searchParams.get("type") || "course";
    const titleParam = searchParams.get("title");
    const slug = searchParams.get("slug") || "nextjs-app-router-in-depth";
    const userName = searchParams.get("user") || "Abhijeet Rawat";

    // Format fallback title from slug
    const displayTitle =
      titleParam ||
      slug
        .split("-")
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(" ");

    const isCertificate = type === "certificate";

    return new ImageResponse(
      (
        <div
          style={{
            height: "100%",
            width: "100%",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            backgroundColor: "#0B0F19",
            backgroundImage:
              "radial-gradient(circle at 80% 20%, rgba(224, 90, 54, 0.22) 0%, transparent 50%), radial-gradient(circle at 10% 80%, rgba(30, 41, 59, 0.8) 0%, transparent 50%)",
            padding: "60px 70px",
            fontFamily: "sans-serif",
            color: "#FFFFFF",
          }}
        >
          {/* Top Brand Header */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
              {/* Vertex Custom Geometric Logo SVG */}
              <svg width="44" height="44" viewBox="0 0 32 32" fill="none">
                <path
                  d="M4 6L16 26L28 6H21.5L16 18L10.5 6H4Z"
                  fill="#E05A36"
                />
              </svg>
              <span
                style={{
                  fontSize: 32,
                  fontWeight: 900,
                  letterSpacing: "-0.03em",
                  color: "#FFFFFF",
                }}
              >
                VERTEX
              </span>
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                padding: "8px 18px",
                borderRadius: "9999px",
                backgroundColor: "rgba(224, 90, 54, 0.12)",
                border: "1px solid rgba(224, 90, 54, 0.35)",
                color: "#E05A36",
                fontSize: 14,
                fontWeight: 700,
                letterSpacing: "0.15em",
                textTransform: "uppercase",
              }}
            >
              {isCertificate ? "VERIFIED CREDENTIAL" : "AI-POWERED LEARNING"}
            </div>
          </div>

          {/* Center Title Content */}
          <div style={{ display: "flex", flexDirection: "column", gap: "16px", maxWidth: "900px" }}>
            {isCertificate ? (
              <div style={{ fontSize: 22, color: "#94A3B8", fontWeight: 600 }}>
                Certificate of Mastery Awarded to{" "}
                <span style={{ color: "#E05A36" }}>{userName}</span>
              </div>
            ) : (
              <div style={{ fontSize: 18, color: "#E05A36", fontWeight: 700, letterSpacing: "0.1em" }}>
                INTERACTIVE ENGINEERING TRACK
              </div>
            )}

            <div
              style={{
                fontSize: 54,
                fontWeight: 800,
                lineHeight: 1.15,
                letterSpacing: "-0.03em",
                color: "#FFFFFF",
              }}
            >
              {displayTitle}
            </div>

            <div style={{ fontSize: 20, color: "#94A3B8", lineHeight: 1.4 }}>
              {isCertificate
                ? "Cryptographically signed and verified authentic on the Vertex Public Registry."
                : "Deep video intelligence, streaming AI copilot, interactive checkpoints, and verifiable certificates."}
            </div>
          </div>

          {/* Bottom Badges Row */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              borderTop: "1px solid rgba(255, 255, 255, 0.1)",
              paddingTop: "24px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "24px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: 16, color: "#CBD5E1" }}>
                <span style={{ color: "#F59E0B" }}>★</span>
                <span>4.9 / 5.0 Rating</span>
              </div>
              <div style={{ fontSize: 16, color: "#64748B" }}>•</div>
              <div style={{ fontSize: 16, color: "#CBD5E1" }}>Full HD Interactive Labs</div>
              <div style={{ fontSize: 16, color: "#64748B" }}>•</div>
              <div style={{ fontSize: 16, color: "#CBD5E1" }}>HMAC-SHA256 Certification</div>
            </div>

            <div style={{ fontSize: 16, color: "#94A3B8", fontWeight: 600 }}>
              vertex.dev
            </div>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
        headers: {
          "Cache-Control": "public, max-age=86400, s-maxage=604800, stale-while-revalidate=86400",
        },
      }
    );
  } catch (e: unknown) {
    console.error("Error generating OG image:", e);
    return new Response("Failed to generate OpenGraph image", { status: 500 });
  }
}
