"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

function useIsMobile() {
  const [mobile, setMobile] = useState(false);
  useEffect(() => {
    const check = () => setMobile(window.innerWidth < 640);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);
  return mobile;
}

export default function PricingPage() {
  const router = useRouter();
  const mob = useIsMobile();

  function go(plan: "pro" | "elite", trial = false) {
    router.push(`/checkout?plan=${plan}${trial ? "&trial=true" : ""}`);
  }

  return (
    <div className="narrowPage">
      <main
        style={{
          minHeight: "calc(100vh - 120px)",
          padding: mob ? "32px 0 60px" : "60px 0",
        }}
      >
        <div style={{ marginBottom: 28 }}>
          <h1
            style={{
              fontSize: mob ? 34 : 44,
              lineHeight: 1.05,
              margin: 0,
              fontWeight: 800,
              letterSpacing: -0.6,
            }}
          >
            Choose your plan
          </h1>
          <p
            style={{
              margin: "10px 0 0",
              opacity: 0.8,
              fontSize: mob ? 15 : 16,
            }}
          >
            Try free for 7 days. Card required — cancels automatically if you
            don't continue.
          </p>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: mob ? "1fr" : "repeat(2, minmax(0, 1fr))",
            gap: 16,
          }}
        >
          {/* PRO */}
          <div
            style={{
              position: "relative",
              borderRadius: 20,
              padding: mob ? 20 : 24,
              border: "1px solid rgba(255,255,255,0.10)",
              background: "rgba(10,14,20,0.55)",
              boxShadow: "0 18px 60px rgba(0,0,0,0.35)",
              backdropFilter: "blur(10px)",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "flex-start",
                justifyContent: "space-between",
                gap: 12,
                marginBottom: 4,
              }}
            >
              <div>
                <div style={{ fontSize: 18, fontWeight: 800, marginBottom: 4 }}>
                  Pro
                </div>
                <div style={{ fontSize: 13, opacity: 0.7 }}>
                  2-outcome arbs only
                </div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div
                  style={{
                    fontSize: mob ? 36 : 44,
                    fontWeight: 900,
                    letterSpacing: -0.8,
                    lineHeight: 1,
                  }}
                >
                  £39.99
                </div>
                <div style={{ fontSize: 12, opacity: 0.65, marginTop: 2 }}>
                  /month
                </div>
              </div>
            </div>

            <div
              style={{
                height: 1,
                background: "rgba(255,255,255,0.10)",
                margin: "16px 0",
              }}
            />

            <ul
              style={{
                margin: "0 0 20px",
                paddingLeft: 18,
                display: "grid",
                gap: 10,
                flex: 1,
              }}
            >
              {[
                "Full 2-outcome arb feed",
                "Stake splits included",
                "Faster refresh",
                "Suspicious edge flags",
              ].map((f) => (
                <li key={f} style={{ fontSize: 14, opacity: 0.9 }}>
                  {f}
                </li>
              ))}
            </ul>

            <button
              style={{
                width: "100%",
                borderRadius: 12,
                padding: "12px 14px",
                fontWeight: 800,
                fontSize: 15,
                cursor: "pointer",
                border: "1px solid rgba(120,110,255,0.45)",
                background:
                  "linear-gradient(90deg, rgba(120,110,255,0.95), rgba(0,190,255,0.75))",
                color: "white",
                marginBottom: 10,
              }}
              onClick={() => go("pro", true)}
            >
              Try free — 7 days
            </button>
            <button
              style={{
                width: "100%",
                borderRadius: 12,
                padding: "11px 14px",
                fontWeight: 700,
                fontSize: 14,
                cursor: "pointer",
                border: "1px solid rgba(255,255,255,0.14)",
                background: "rgba(255,255,255,0.06)",
                color: "rgba(255,255,255,0.85)",
              }}
              onClick={() => go("pro")}
            >
              Subscribe now
            </button>
            <div style={{ marginTop: 10, fontSize: 12, opacity: 0.5 }}>
              Then £39.99/month. Cancel anytime.
            </div>
          </div>

          {/* ELITE */}
          <div
            style={{
              position: "relative",
              borderRadius: 20,
              padding: mob ? 20 : 24,
              border: "1px solid rgba(118,111,255,0.35)",
              background: "rgba(10,14,20,0.55)",
              boxShadow: "0 18px 80px rgba(71,109,255,0.18)",
              backdropFilter: "blur(10px)",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <div
              style={{
                position: "absolute",
                top: 14,
                right: 14,
                padding: "5px 10px",
                borderRadius: 999,
                fontSize: 11,
                fontWeight: 700,
                background: "rgba(255,90,180,0.14)",
                border: "1px solid rgba(255,90,180,0.22)",
                color: "rgba(255,255,255,0.9)",
              }}
            >
              Most popular
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "flex-start",
                justifyContent: "space-between",
                gap: 12,
                marginBottom: 4,
              }}
            >
              <div>
                <div style={{ fontSize: 18, fontWeight: 800, marginBottom: 4 }}>
                  Elite
                </div>
                <div style={{ fontSize: 13, opacity: 0.7 }}>
                  Expanded markets + curated angles
                </div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div
                  style={{
                    fontSize: mob ? 36 : 44,
                    fontWeight: 900,
                    letterSpacing: -0.8,
                    lineHeight: 1,
                  }}
                >
                  £59.99
                </div>
                <div style={{ fontSize: 12, opacity: 0.65, marginTop: 2 }}>
                  /month
                </div>
              </div>
            </div>

            <div
              style={{
                height: 1,
                background: "rgba(255,255,255,0.10)",
                margin: "16px 0",
              }}
            />

            <div style={{ fontSize: 12, opacity: 0.7, marginBottom: 10 }}>
              Everything in Pro, plus:
            </div>
            <ul
              style={{
                margin: "0 0 20px",
                paddingLeft: 18,
                display: "grid",
                gap: 10,
                flex: 1,
              }}
            >
              {[
                "3-way markets (where available)",
                "Higher-variance value watchlist",
                "Priority alerts (Telegram/email)",
              ].map((f) => (
                <li key={f} style={{ fontSize: 14, opacity: 0.9 }}>
                  {f}
                </li>
              ))}
            </ul>

            <button
              style={{
                width: "100%",
                borderRadius: 12,
                padding: "12px 14px",
                fontWeight: 800,
                fontSize: 15,
                cursor: "pointer",
                border: "1px solid rgba(120,110,255,0.45)",
                background:
                  "linear-gradient(90deg, rgba(120,110,255,0.95), rgba(0,190,255,0.75))",
                color: "white",
                marginBottom: 10,
              }}
              onClick={() => go("elite", true)}
            >
              Try free — 7 days
            </button>
            <button
              style={{
                width: "100%",
                borderRadius: 12,
                padding: "11px 14px",
                fontWeight: 700,
                fontSize: 14,
                cursor: "pointer",
                border: "1px solid rgba(255,255,255,0.14)",
                background: "rgba(255,255,255,0.06)",
                color: "rgba(255,255,255,0.85)",
              }}
              onClick={() => go("elite")}
            >
              Subscribe now
            </button>
            <div style={{ marginTop: 10, fontSize: 12, opacity: 0.5 }}>
              Then £59.99/month. Cancel anytime.
            </div>
          </div>
        </div>

        <p style={{ marginTop: 16, fontSize: 12, opacity: 0.6 }}>
          We provide information and tools for execution. Outcomes depend on
          timing, odds movement, rules, and settlement.
        </p>
      </main>
    </div>
  );
}
