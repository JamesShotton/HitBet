import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "HitBet — Live Arbitrage Betting Feed";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          background: "#05060a",
          position: "relative",
          overflow: "hidden",
          fontFamily: "sans-serif",
        }}
      >
        {/* Background gradient */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(800px 600px at 80% 20%, rgba(120,110,255,0.35), transparent 60%), radial-gradient(600px 400px at 20% 80%, rgba(0,190,255,0.2), transparent 60%)",
            display: "flex",
          }}
        />

        {/* Content */}
        <div
          style={{
            position: "relative",
            display: "flex",
            flexDirection: "column",
            padding: "60px 72px",
            height: "100%",
            justifyContent: "space-between",
          }}
        >
          {/* Logo area */}
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div
              style={{
                width: 16,
                height: 16,
                borderRadius: 999,
                background: "linear-gradient(135deg, #7c6aff, #00beff)",
                boxShadow: "0 0 20px rgba(120,110,255,0.8)",
              }}
            />
            <span
              style={{
                fontSize: 28,
                fontWeight: 800,
                color: "white",
                letterSpacing: "-0.5px",
              }}
            >
              HitBet
            </span>
          </div>

          {/* Main headline */}
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <div
              style={{
                fontSize: 72,
                fontWeight: 900,
                color: "white",
                lineHeight: 1.05,
                letterSpacing: "-2px",
                maxWidth: 800,
              }}
            >
              The books made a{" "}
              <span
                style={{
                  background: "linear-gradient(90deg, #7c6aff, #00beff)",
                  backgroundClip: "text",
                  color: "transparent",
                }}
              >
                pricing mistake.
              </span>
            </div>
            <div
              style={{
                fontSize: 28,
                color: "rgba(255,255,255,0.65)",
                maxWidth: 700,
                lineHeight: 1.5,
              }}
            >
              Scan 40+ sportsbooks in real time. Lock in guaranteed profit with
              exact stake splits.
            </div>
          </div>

          {/* Bottom row */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div style={{ display: "flex", gap: 32 }}>
              {[
                { v: "2–13%", l: "Live margins" },
                { v: "40+", l: "Books scanned" },
                { v: "30s", l: "Feed refresh" },
              ].map(({ v, l }) => (
                <div
                  key={l}
                  style={{ display: "flex", flexDirection: "column", gap: 4 }}
                >
                  <span
                    style={{
                      fontSize: 36,
                      fontWeight: 900,
                      color: "white",
                      letterSpacing: "-1px",
                    }}
                  >
                    {v}
                  </span>
                  <span
                    style={{ fontSize: 16, color: "rgba(255,255,255,0.5)" }}
                  >
                    {l}
                  </span>
                </div>
              ))}
            </div>

            {/* CTA */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                padding: "16px 28px",
                borderRadius: 16,
                background:
                  "linear-gradient(90deg, rgba(120,110,255,0.95), rgba(0,190,255,0.75))",
                border: "1px solid rgba(120,110,255,0.4)",
                fontSize: 20,
                fontWeight: 800,
                color: "white",
              }}
            >
              Try free — 24 hours
            </div>
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
