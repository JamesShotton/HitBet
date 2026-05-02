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

const GRAD =
  "linear-gradient(90deg, rgba(120,110,255,0.95), rgba(0,190,255,0.75))";

function StatRow({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", gap: 12, fontSize: 12 }}>
      <span style={{ color: "rgba(255,255,255,0.4)" }}>{label}</span>
      <span style={{ color: "rgba(255,255,255,0.75)", fontWeight: 600, textAlign: "right" }}>{value}</span>
    </div>
  );
}

export default function PricingPage() {
  const router = useRouter();
  const mob = useIsMobile();

  // Capture referral code from URL and persist to localStorage
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const ref = params.get("ref");
    if (ref) {
      try { localStorage.setItem("hitbet_ref", ref); } catch {}
      fetch("/api/affiliate/click", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ref_code: ref }),
      }).catch(() => {});
    }
  }, []);

  function go(plan: "arbitrage" | "longrun" | "both", trial = false) {
    let ref = "";
    try { ref = localStorage.getItem("hitbet_ref") ?? ""; } catch {}
    router.push(`/checkout?plan=${plan}${trial ? "&trial=true" : ""}${ref ? `&ref=${encodeURIComponent(ref)}` : ""}`);
  }

  return (
    <div className="narrowPage">
      <main
        style={{
          minHeight: "calc(100vh - 120px)",
          padding: mob ? "32px 0 60px" : "60px 0",
        }}
      >
        {/* ── Header ── */}
        <div style={{ marginBottom: 36 }}>
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
          <p style={{ margin: "10px 0 0", opacity: 0.8, fontSize: mob ? 15 : 16 }}>
            Try free for 24 hours. Card required — cancels automatically if you
            don't continue.
          </p>
        </div>

        {/* ── Strategy comparison ── */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: mob ? "1fr" : "1fr 1fr",
            gap: 12,
            marginBottom: 36,
          }}
        >
          {/* Arbitrage */}
          <div
            style={{
              borderRadius: 16,
              padding: "20px 22px",
              border: "1px solid rgba(120,110,255,0.22)",
              background: "rgba(120,110,255,0.05)",
            }}
          >
            <div
              style={{
                fontSize: 10,
                fontWeight: 800,
                letterSpacing: "0.1em",
                color: "rgba(160,150,255,0.8)",
                marginBottom: 10,
              }}
            >
              ARBITRAGE
            </div>
            <div style={{ fontSize: 16, fontWeight: 800, marginBottom: 8 }}>
              Guaranteed profit — zero prediction needed
            </div>
            <p
              style={{
                fontSize: 13,
                lineHeight: 1.65,
                color: "rgba(255,255,255,0.6)",
                margin: "0 0 16px",
              }}
            >
              We scan 40+ bookmakers in real time and surface odds mismatches.
              Place both sides of the same event and you profit{" "}
              <strong style={{ color: "rgba(255,255,255,0.85)" }}>
                regardless of who wins
              </strong>{" "}
              — the maths guarantees it.
            </p>
            <div
              style={{
                borderTop: "1px solid rgba(255,255,255,0.07)",
                paddingTop: 12,
                display: "grid",
                gap: 8,
              }}
            >
              <StatRow label="Risk" value="None — profit is locked in before the event" />
              <StatRow label="Live opportunities" value="2 – 15 arbs at any time" />
              <StatRow label="Typical margin" value="0.5% – 4% guaranteed per arb" />
              <StatRow label="Bet frequency" value="Place as many or as few as you like" />
            </div>
          </div>

          {/* Long Run */}
          <div
            style={{
              borderRadius: 16,
              padding: "20px 22px",
              border: "1px solid rgba(0,190,255,0.18)",
              background: "rgba(0,190,255,0.04)",
            }}
          >
            <div
              style={{
                fontSize: 10,
                fontWeight: 800,
                letterSpacing: "0.1em",
                color: "rgba(80,210,255,0.8)",
                marginBottom: 10,
              }}
            >
              LONG RUN
            </div>
            <div style={{ fontSize: 16, fontWeight: 800, marginBottom: 8 }}>
              Mathematical edge — profitable across hundreds of bets
            </div>
            <p
              style={{
                fontSize: 13,
                lineHeight: 1.65,
                color: "rgba(255,255,255,0.6)",
                margin: "0 0 16px",
              }}
            >
              We compare soft bookmaker odds against sharp exchange prices. When
              a bookmaker overprices an outcome,{" "}
              <strong style={{ color: "rgba(255,255,255,0.85)" }}>
                you have the statistical edge
              </strong>
              . Individual bets vary — the edge compounds over time.
            </p>
            <div
              style={{
                borderTop: "1px solid rgba(255,255,255,0.07)",
                paddingTop: 12,
                display: "grid",
                gap: 8,
              }}
            >
              <StatRow label="Risk" value="Variance per bet — edge plays out over volume" />
              <StatRow label="Live opportunities" value="10 – 40 value bets per day" />
              <StatRow label="Typical edge" value="5% – 20% expected value per bet" />
              <StatRow label="Bet frequency" value="Higher volume = faster edge realisation" />
            </div>
          </div>
        </div>

        {/* ── Pricing cards ── */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: mob ? "1fr" : "repeat(3, minmax(0, 1fr))",
            gap: 14,
          }}
        >
          {/* ARBITRAGE */}
          <div
            style={{
              position: "relative",
              borderRadius: 20,
              padding: mob ? 20 : 22,
              border: "1px solid rgba(255,255,255,0.10)",
              background: "rgba(10,14,20,0.55)",
              backdropFilter: "blur(10px)",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <div style={{ fontSize: 18, fontWeight: 800, marginBottom: 2 }}>
              Arbitrage
            </div>
            <div style={{ fontSize: 13, opacity: 0.6, marginBottom: 16 }}>
              Guaranteed profit, every time
            </div>
            <div
              style={{
                fontSize: mob ? 38 : 42,
                fontWeight: 900,
                letterSpacing: -0.8,
                lineHeight: 1,
                marginBottom: 4,
              }}
            >
              £9.99
            </div>
            <div style={{ fontSize: 12, opacity: 0.55, marginBottom: 18 }}>
              /week
            </div>

            <div style={{ height: 1, background: "rgba(255,255,255,0.08)", marginBottom: 16 }} />

            <ul style={{ margin: "0 0 20px", paddingLeft: 18, display: "grid", gap: 9, flex: 1 }}>
              {[
                "Live 2-way arb feed",
                "Exact stake splits",
                "Step-by-step placement",
                "30s refresh, 40+ books",
              ].map((f) => (
                <li key={f} style={{ fontSize: 13, opacity: 0.85 }}>{f}</li>
              ))}
            </ul>

            <button
              style={{
                width: "100%", borderRadius: 12, padding: "11px 14px",
                fontWeight: 800, fontSize: 14, cursor: "pointer",
                border: "1px solid rgba(120,110,255,0.45)", background: GRAD,
                color: "white", marginBottom: 8,
              }}
              onClick={() => go("arbitrage", true)}
            >
              Try free — 24 hours
            </button>
            <button
              style={{
                width: "100%", borderRadius: 12, padding: "10px 14px",
                fontWeight: 600, fontSize: 13, cursor: "pointer",
                border: "1px solid rgba(255,255,255,0.12)",
                background: "rgba(255,255,255,0.04)", color: "rgba(255,255,255,0.75)",
              }}
              onClick={() => go("arbitrage")}
            >
              Subscribe now
            </button>
            <div style={{ marginTop: 8, fontSize: 11, opacity: 0.4 }}>
              Then £9.99/wk. Cancel anytime.
            </div>
          </div>

          {/* LONG RUN */}
          <div
            style={{
              position: "relative",
              borderRadius: 20,
              padding: mob ? 20 : 22,
              border: "1px solid rgba(255,255,255,0.10)",
              background: "rgba(10,14,20,0.55)",
              backdropFilter: "blur(10px)",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <div style={{ fontSize: 18, fontWeight: 800, marginBottom: 2 }}>
              Long Run
            </div>
            <div style={{ fontSize: 13, opacity: 0.6, marginBottom: 16 }}>
              Mathematical edge over time
            </div>
            <div
              style={{
                fontSize: mob ? 38 : 42,
                fontWeight: 900,
                letterSpacing: -0.8,
                lineHeight: 1,
                marginBottom: 4,
              }}
            >
              £14.99
            </div>
            <div style={{ fontSize: 12, opacity: 0.55, marginBottom: 18 }}>
              /week
            </div>

            <div style={{ height: 1, background: "rgba(255,255,255,0.08)", marginBottom: 16 }} />

            <ul style={{ margin: "0 0 20px", paddingLeft: 18, display: "grid", gap: 9, flex: 1 }}>
              {[
                "Value watchlist (positive EV bets)",
                "3-way football arbs (1X2)",
                "Telegram alerts",
                "Kelly criterion stakes",
              ].map((f) => (
                <li key={f} style={{ fontSize: 13, opacity: 0.85 }}>{f}</li>
              ))}
            </ul>

            <button
              style={{
                width: "100%", borderRadius: 12, padding: "11px 14px",
                fontWeight: 800, fontSize: 14, cursor: "pointer",
                border: "1px solid rgba(120,110,255,0.45)", background: GRAD,
                color: "white", marginBottom: 8,
              }}
              onClick={() => go("longrun", true)}
            >
              Try free — 24 hours
            </button>
            <button
              style={{
                width: "100%", borderRadius: 12, padding: "10px 14px",
                fontWeight: 600, fontSize: 13, cursor: "pointer",
                border: "1px solid rgba(255,255,255,0.12)",
                background: "rgba(255,255,255,0.04)", color: "rgba(255,255,255,0.75)",
              }}
              onClick={() => go("longrun")}
            >
              Subscribe now
            </button>
            <div style={{ marginTop: 8, fontSize: 11, opacity: 0.4 }}>
              Then £14.99/wk. Cancel anytime.
            </div>
          </div>

          {/* BOTH */}
          <div
            style={{
              position: "relative",
              borderRadius: 20,
              padding: mob ? 20 : 22,
              border: "1px solid rgba(118,111,255,0.4)",
              background: "rgba(10,14,20,0.55)",
              boxShadow: "0 20px 80px rgba(71,109,255,0.18)",
              backdropFilter: "blur(10px)",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <div
              style={{
                position: "absolute", top: 14, right: 14,
                padding: "4px 9px", borderRadius: 999,
                fontSize: 10, fontWeight: 800,
                background: "rgba(255,90,180,0.14)",
                border: "1px solid rgba(255,90,180,0.22)",
                color: "rgba(255,255,255,0.9)", letterSpacing: "0.05em",
              }}
            >
              BEST VALUE
            </div>

            <div style={{ fontSize: 18, fontWeight: 800, marginBottom: 2 }}>
              Both Plans
            </div>
            <div style={{ fontSize: 13, opacity: 0.6, marginBottom: 12 }}>
              Arbitrage + Long Run
            </div>

            <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 4 }}>
              <div style={{ fontSize: mob ? 38 : 42, fontWeight: 900, letterSpacing: -0.8, lineHeight: 1 }}>
                £19.99
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 18 }}>
              <div style={{ fontSize: 12, opacity: 0.55 }}>/week</div>
              <div
                style={{
                  fontSize: 11, fontWeight: 700, padding: "2px 7px",
                  borderRadius: 999, background: "rgba(0,255,140,0.1)",
                  border: "1px solid rgba(0,255,140,0.2)", color: "#9be7bf",
                }}
              >
                Save £5/wk
              </div>
            </div>

            <div style={{ height: 1, background: "rgba(255,255,255,0.08)", marginBottom: 16 }} />

            <div style={{ fontSize: 11, opacity: 0.55, marginBottom: 10 }}>
              Everything in both plans:
            </div>
            <ul style={{ margin: "0 0 20px", paddingLeft: 18, display: "grid", gap: 9, flex: 1 }}>
              {[
                "Full 2-way arb feed",
                "Value watchlist + EV bets",
                "3-way football arbs",
                "Telegram alerts",
                "Step-by-step placement",
                "Kelly criterion stakes",
              ].map((f) => (
                <li key={f} style={{ fontSize: 13, opacity: 0.85 }}>{f}</li>
              ))}
            </ul>

            <button
              style={{
                width: "100%", borderRadius: 12, padding: "11px 14px",
                fontWeight: 800, fontSize: 14, cursor: "pointer",
                border: "1px solid rgba(120,110,255,0.45)", background: GRAD,
                color: "white", marginBottom: 8,
              }}
              onClick={() => go("both", true)}
            >
              Try free — 24 hours
            </button>
            <button
              style={{
                width: "100%", borderRadius: 12, padding: "10px 14px",
                fontWeight: 600, fontSize: 13, cursor: "pointer",
                border: "1px solid rgba(255,255,255,0.12)",
                background: "rgba(255,255,255,0.04)", color: "rgba(255,255,255,0.75)",
              }}
              onClick={() => go("both")}
            >
              Subscribe now
            </button>
            <div style={{ marginTop: 8, fontSize: 11, opacity: 0.4 }}>
              Then £19.99/wk. Cancel anytime.
            </div>
          </div>
        </div>

        <p style={{ marginTop: 18, fontSize: 12, opacity: 0.5 }}>
          We provide information and tools for execution. Outcomes depend on
          timing, odds movement, rules, and settlement.
        </p>
      </main>
    </div>
  );
}
