"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

function useIsMobile() {
  const [mobile, setMobile] = useState(false);
  useEffect(() => {
    const check = () => setMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);
  return mobile;
}

const LIVE_ARBS = [
  {
    event: "Arsenal vs Chelsea",
    sport: "EPL",
    margin: "3.42%",
    profit: "£17.10",
    book1: "Bet365",
    book2: "Unibet",
  },
  {
    event: "Lakers vs Celtics",
    sport: "NBA",
    margin: "2.88%",
    profit: "£14.40",
    book1: "William Hill",
    book2: "Betway",
  },
  {
    event: "Djokovic vs Alcaraz",
    sport: "ATP",
    margin: "2.11%",
    profit: "£10.55",
    book1: "Paddy Power",
    book2: "Betfair",
  },
  {
    event: "Man City vs Liverpool",
    sport: "EPL",
    margin: "1.74%",
    profit: "£8.70",
    book1: "888sport",
    book2: "Coral",
  },
  {
    event: "Sinner vs Zverev",
    sport: "ATP",
    margin: "1.31%",
    profit: "£6.55",
    book1: "Ladbrokes",
    book2: "Betfair",
  },
  {
    event: "Real Madrid vs Barca",
    sport: "La Liga",
    margin: "2.55%",
    profit: "£12.75",
    book1: "Bet365",
    book2: "Betfair",
  },
];

const STATS = [
  { value: "2–13%", label: "Live arb margins today" },
  { value: "<60s", label: "Execution time" },
  { value: "30s", label: "Feed refresh" },
  { value: "40+", label: "Books scanned" },
];

const HOW = [
  {
    n: "01",
    title: "We scan",
    body: "HitBet pulls live odds from 40+ UK books every 30 seconds, comparing prices across every market.",
  },
  {
    n: "02",
    title: "We detect",
    body: "Our engine flags when the combined implied probability drops below 100% — a guaranteed edge.",
  },
  {
    n: "03",
    title: "You execute",
    body: "You get a clean execution card: exact stakes, which books, which outcomes. Lock in profit.",
  },
];

const PLANS = [
  {
    name: "Arbitrage",
    price: "£39.99",
    plan: "arbitrage",
    sub: "Guaranteed profit, every time",
    features: [
      "Live 2-way arb feed",
      "Exact stake splits",
      "Step-by-step placement cards",
      "30s refresh, 40+ books",
    ],
    popular: false,
    plus: null,
  },
  {
    name: "Long Run",
    price: "£59.99",
    plan: "longrun",
    sub: "Mathematical edge over time",
    features: [
      "Value watchlist (positive EV bets)",
      "3-way football arbs (1X2)",
      "Telegram alerts",
      "Kelly criterion stakes",
    ],
    popular: false,
    plus: null,
  },
  {
    name: "Both Plans",
    price: "£89.99",
    plan: "both",
    sub: "Arbitrage + Long Run",
    features: [
      "Full 2-way arb feed",
      "Value watchlist + EV bets",
      "3-way football arbs",
      "Telegram alerts",
      "Step-by-step placement",
      "Kelly criterion stakes",
    ],
    popular: true,
    plus: "Save £10/mo",
  },
];

const GRAD =
  "linear-gradient(90deg, rgba(120,110,255,0.95), rgba(0,190,255,0.85))";

function TickerRow() {
  const [offset, setOffset] = useState(0);
  const ref = useRef<number>(0);
  useEffect(() => {
    let raf: number;
    const tick = () => {
      ref.current += 0.4;
      setOffset(ref.current);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);
  const items = [...LIVE_ARBS, ...LIVE_ARBS];
  const x = -(offset % (LIVE_ARBS.length * 280));
  return (
    <div style={{ position: "relative", overflow: "hidden" }}>
      <div
        style={{
          display: "flex",
          gap: 12,
          willChange: "transform",
          transform: `translateX(${x}px)`,
        }}
      >
        {items.map((a, i) => (
          <div
            key={i}
            style={{
              minWidth: 240,
              border: "1px solid rgba(255,255,255,0.08)",
              background: "rgba(255,255,255,0.03)",
              borderRadius: 14,
              padding: "12px 14px",
              flexShrink: 0,
            }}
          >
            <div
              style={{
                fontSize: 13,
                fontWeight: 700,
                color: "white",
                marginBottom: 5,
                whiteSpace: "nowrap",
              }}
            >
              {a.event}
            </div>
            <div
              style={{
                display: "flex",
                gap: 8,
                alignItems: "center",
                marginBottom: 4,
              }}
            >
              <span style={{ fontSize: 11, color: "rgba(255,255,255,0.45)" }}>
                {a.sport}
              </span>
              <span style={{ fontSize: 13, fontWeight: 800, color: "#9be7bf" }}>
                {a.margin}
              </span>
              <span style={{ fontSize: 12, color: "rgba(255,255,255,0.55)" }}>
                {a.profit}
              </span>
            </div>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)" }}>
              {a.book1} · {a.book2}
            </div>
          </div>
        ))}
      </div>
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          bottom: 0,
          width: 60,
          background: "linear-gradient(90deg, #05060a, transparent)",
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "absolute",
          right: 0,
          top: 0,
          bottom: 0,
          width: 60,
          background: "linear-gradient(270deg, #05060a, transparent)",
          pointerEvents: "none",
        }}
      />
    </div>
  );
}

export default function Home() {
  const mob = useIsMobile();

  return (
    <div className="narrowPage">
      <div style={{ width: "100%" }}>
        {/* ── HERO ── */}
        <section
          style={{
            display: "grid",
            gridTemplateColumns: mob ? "1fr" : "1fr 400px",
            gap: mob ? 32 : 48,
            alignItems: "center",
            padding: mob ? "40px 0 32px" : "80px 0 60px",
          }}
        >
          <div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                fontSize: 12,
                letterSpacing: "0.18em",
                color: "rgba(255,255,255,0.5)",
                marginBottom: 18,
              }}
            >
              <span
                style={{
                  width: 7,
                  height: 7,
                  borderRadius: 999,
                  background: "#22c55e",
                  boxShadow: "0 0 8px #22c55e",
                  display: "inline-block",
                }}
              />
              LIVE ARBITRAGE FEED
            </div>
            <h1
              style={{
                fontSize: mob ? 40 : 58,
                fontWeight: 900,
                lineHeight: 1.08,
                letterSpacing: "-1.5px",
                margin: "0 0 20px",
                color: "white",
              }}
            >
              The books made a{" "}
              <span
                style={{
                  background: GRAD,
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                pricing mistake.
              </span>{" "}
              We found it.
            </h1>
            <p
              style={{
                fontSize: mob ? 15 : 17,
                lineHeight: 1.75,
                color: "rgba(255,255,255,0.65)",
                maxWidth: 540,
                margin: "0 0 28px",
              }}
            >
              HitBet scans 40+ sportsbooks in real time, detects true arbitrage,
              and hands you a clean stake split. No prediction. No luck. Pure
              maths.
            </p>
            <div
              style={{
                display: "flex",
                gap: 12,
                flexWrap: "wrap",
                alignItems: "center",
              }}
            >
              <Link
                href="/pricing"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: "13px 22px",
                  borderRadius: 14,
                  fontWeight: 800,
                  fontSize: 15,
                  color: "white",
                  background: GRAD,
                  border: "1px solid rgba(120,110,255,0.4)",
                  textDecoration: "none",
                }}
              >
                Try free for 7 days
              </Link>
              <Link
                href="/dashboard"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: "13px 22px",
                  borderRadius: 14,
                  fontWeight: 700,
                  fontSize: 15,
                  color: "rgba(255,255,255,0.8)",
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.12)",
                  textDecoration: "none",
                }}
              >
                See live feed →
              </Link>
            </div>
            <div
              style={{
                marginTop: 14,
                fontSize: 12,
                color: "rgba(255,255,255,0.35)",
              }}
            >
              Card required · £0 charged today · Cancel anytime
            </div>
          </div>

          {!mob && (
            <div
              style={{
                border: "1px solid rgba(120,110,255,0.3)",
                background: "rgba(10,14,20,0.7)",
                borderRadius: 20,
                padding: 22,
                backdropFilter: "blur(16px)",
                boxShadow: "0 24px 80px rgba(80,60,255,0.2)",
              }}
            >
              <div
                style={{
                  fontSize: 11,
                  letterSpacing: "0.14em",
                  color: "rgba(255,255,255,0.4)",
                  marginBottom: 10,
                }}
              >
                LIVE ARB · NOW
              </div>
              <div
                style={{
                  fontSize: 20,
                  fontWeight: 800,
                  color: "white",
                  marginBottom: 6,
                }}
              >
                Arsenal vs Chelsea
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 14,
                }}
              >
                <span style={{ fontSize: 12, color: "rgba(255,255,255,0.5)" }}>
                  EPL · Spread · in 45m
                </span>
                <span
                  style={{
                    fontSize: 14,
                    fontWeight: 800,
                    padding: "4px 10px",
                    borderRadius: 999,
                    background: "rgba(0,255,140,0.1)",
                    border: "1px solid rgba(0,255,140,0.2)",
                    color: "#9be7bf",
                  }}
                >
                  3.42%
                </span>
              </div>
              <div
                style={{
                  height: 1,
                  background: "rgba(255,255,255,0.08)",
                  margin: "0 0 14px",
                }}
              />
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 10,
                  marginBottom: 14,
                }}
              >
                {[
                  {
                    book: "Bet365",
                    pick: "Arsenal -0.5",
                    odds: "@ 2.05",
                    stake: "£246",
                  },
                  {
                    book: "Unibet",
                    pick: "Chelsea +0.5",
                    odds: "@ 2.10",
                    stake: "£254",
                  },
                ].map((leg, i) => (
                  <div
                    key={i}
                    style={{
                      border: "1px solid rgba(255,255,255,0.08)",
                      background: "rgba(255,255,255,0.03)",
                      borderRadius: 14,
                      padding: 12,
                    }}
                  >
                    <div
                      style={{
                        fontSize: 13,
                        fontWeight: 700,
                        color: "white",
                        marginBottom: 4,
                      }}
                    >
                      {leg.book}
                    </div>
                    <div
                      style={{
                        fontSize: 12,
                        color: "rgba(255,255,255,0.6)",
                        marginBottom: 6,
                      }}
                    >
                      {leg.pick}
                    </div>
                    <div
                      style={{
                        fontSize: 13,
                        fontWeight: 700,
                        color: "#98b8ff",
                      }}
                    >
                      {leg.odds}
                    </div>
                    <div
                      style={{
                        fontSize: 13,
                        fontWeight: 800,
                        color: "white",
                        marginTop: 6,
                      }}
                    >
                      {leg.stake}
                    </div>
                  </div>
                ))}
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  paddingTop: 12,
                  borderTop: "1px solid rgba(255,255,255,0.08)",
                }}
              >
                <span style={{ fontSize: 13, color: "rgba(255,255,255,0.5)" }}>
                  Total stake: £500
                </span>
                <span
                  style={{
                    fontSize: 13,
                    fontWeight: 800,
                    color: "#9be7bf",
                    padding: "5px 10px",
                    borderRadius: 999,
                    background: "rgba(0,255,140,0.08)",
                    border: "1px solid rgba(0,255,140,0.15)",
                  }}
                >
                  +£17.10 guaranteed
                </span>
              </div>
            </div>
          )}
        </section>

        {/* ── TICKER ── */}
        <div style={{ padding: "0 0 48px", overflow: "hidden" }}>
          <div
            style={{
              fontSize: 11,
              letterSpacing: "0.16em",
              color: "rgba(255,255,255,0.35)",
              marginBottom: 12,
            }}
          >
            LIVE FEED PREVIEW
          </div>
          <TickerRow />
        </div>

        {/* ── STATS BAR ── */}
        <section
          style={{
            display: "grid",
            gridTemplateColumns: mob
              ? "repeat(2, 1fr)"
              : "repeat(4, minmax(0,1fr))",
            gap: mob ? 8 : 1,
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: 18,
            overflow: "hidden",
            marginBottom: mob ? 40 : 80,
            background: "rgba(255,255,255,0.04)",
          }}
        >
          {STATS.map((s) => (
            <div
              key={s.label}
              style={{
                padding: mob ? "16px 14px" : "22px 24px",
                borderRight: "1px solid rgba(255,255,255,0.07)",
                background: "rgba(10,14,20,0.5)",
              }}
            >
              <div
                style={{
                  fontSize: mob ? 24 : 30,
                  fontWeight: 900,
                  letterSpacing: "-1px",
                  color: "white",
                  marginBottom: 4,
                }}
              >
                {s.value}
              </div>
              <div style={{ fontSize: 12, color: "rgba(255,255,255,0.5)" }}>
                {s.label}
              </div>
            </div>
          ))}
        </section>

        {/* ── HOW IT WORKS ── */}
        <section style={{ padding: mob ? "40px 0" : "70px 0" }}>
          <div style={{ maxWidth: 620, marginBottom: 36 }}>
            <div
              style={{
                fontSize: 11,
                letterSpacing: "0.16em",
                color: "rgba(255,255,255,0.4)",
                marginBottom: 12,
              }}
            >
              HOW IT WORKS
            </div>
            <h2
              style={{
                fontSize: mob ? 28 : 40,
                fontWeight: 900,
                letterSpacing: "-1px",
                color: "white",
                margin: "0 0 14px",
                lineHeight: 1.1,
              }}
            >
              Three steps from signal to profit
            </h2>
            <p
              style={{
                fontSize: 15,
                color: "rgba(255,255,255,0.6)",
                lineHeight: 1.75,
                margin: 0,
              }}
            >
              We handle the scanning and maths. You handle the execution.
            </p>
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: mob ? "1fr" : "repeat(3, minmax(0,1fr))",
              gap: 12,
            }}
          >
            {HOW.map((h) => (
              <div
                key={h.n}
                style={{
                  border: "1px solid rgba(255,255,255,0.08)",
                  background: "rgba(255,255,255,0.03)",
                  borderRadius: 20,
                  padding: 24,
                }}
              >
                <div
                  style={{
                    fontSize: 11,
                    fontWeight: 900,
                    letterSpacing: "0.1em",
                    color: "rgba(255,255,255,0.25)",
                    marginBottom: 14,
                    fontFamily: "monospace",
                  }}
                >
                  {h.n}
                </div>
                <div
                  style={{
                    fontSize: 20,
                    fontWeight: 800,
                    color: "white",
                    marginBottom: 10,
                  }}
                >
                  {h.title}
                </div>
                <div
                  style={{
                    fontSize: 14,
                    color: "rgba(255,255,255,0.6)",
                    lineHeight: 1.7,
                  }}
                >
                  {h.body}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── EXECUTION EXAMPLE ── */}
        <section
          style={{
            padding: mob ? "40px 0" : "70px 0",
            background: "rgba(255,255,255,0.02)",
            borderTop: "1px solid rgba(255,255,255,0.06)",
            borderBottom: "1px solid rgba(255,255,255,0.06)",
          }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: mob ? "1fr" : "1fr 1fr",
              gap: mob ? 32 : 60,
              alignItems: "center",
            }}
          >
            <div>
              <div
                style={{
                  fontSize: 11,
                  letterSpacing: "0.16em",
                  color: "rgba(255,255,255,0.4)",
                  marginBottom: 12,
                }}
              >
                EXECUTION CARD
              </div>
              <h2
                style={{
                  fontSize: mob ? 28 : 40,
                  fontWeight: 900,
                  letterSpacing: "-1px",
                  color: "white",
                  margin: "0 0 14px",
                  lineHeight: 1.1,
                }}
              >
                Everything you need. Nothing you don't.
              </h2>
              <p
                style={{
                  fontSize: 15,
                  color: "rgba(255,255,255,0.6)",
                  lineHeight: 1.75,
                }}
              >
                Every arb surfaces as a single execution card. Who to back,
                where, how much. Place both legs and lock in profit.
              </p>
              <div style={{ display: "grid", gap: 10, marginTop: 24 }}>
                {[
                  "Exact stake split calculated",
                  "Both books named",
                  "Market & settlement matched",
                  "Margin and guaranteed profit shown",
                ].map((c) => (
                  <div
                    key={c}
                    style={{
                      display: "flex",
                      gap: 10,
                      fontSize: 14,
                      color: "rgba(255,255,255,0.8)",
                      alignItems: "center",
                    }}
                  >
                    <span style={{ color: "#9be7bf", fontWeight: 900 }}>✓</span>
                    {c}
                  </div>
                ))}
              </div>
              <Link
                href="/pricing"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  padding: "13px 22px",
                  borderRadius: 14,
                  fontWeight: 800,
                  fontSize: 15,
                  color: "white",
                  background: GRAD,
                  border: "1px solid rgba(120,110,255,0.4)",
                  textDecoration: "none",
                  marginTop: 28,
                }}
              >
                Start 7-day trial
              </Link>
            </div>
            <div
              style={{
                border: "1px solid rgba(120,110,255,0.25)",
                background: "rgba(10,14,20,0.65)",
                borderRadius: 22,
                padding: 22,
                backdropFilter: "blur(14px)",
              }}
            >
              <div
                style={{
                  fontSize: 18,
                  fontWeight: 800,
                  color: "white",
                  marginBottom: 4,
                }}
              >
                Man City vs Liverpool
              </div>
              <div
                style={{
                  fontSize: 12,
                  color: "rgba(255,255,255,0.5)",
                  marginBottom: 14,
                }}
              >
                EPL · Spread · tomorrow 17:30
              </div>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 10,
                  marginBottom: 14,
                }}
              >
                {[
                  {
                    book: "888sport",
                    pick: "Man City -0.5",
                    odds: "@ 2.15",
                    stake: "£238",
                  },
                  {
                    book: "Coral",
                    pick: "Liverpool +0.5",
                    odds: "@ 2.05",
                    stake: "£262",
                  },
                ].map((leg, i) => (
                  <div
                    key={i}
                    style={{
                      border: "1px solid rgba(255,255,255,0.08)",
                      background: "rgba(255,255,255,0.03)",
                      borderRadius: 14,
                      padding: 12,
                    }}
                  >
                    <div
                      style={{
                        fontSize: 13,
                        fontWeight: 700,
                        color: "white",
                        marginBottom: 4,
                      }}
                    >
                      {leg.book}
                    </div>
                    <div
                      style={{
                        fontSize: 12,
                        color: "rgba(255,255,255,0.6)",
                        marginBottom: 6,
                      }}
                    >
                      {leg.pick}
                    </div>
                    <div
                      style={{
                        fontSize: 13,
                        fontWeight: 700,
                        color: "#98b8ff",
                        marginBottom: 4,
                      }}
                    >
                      {leg.odds}
                    </div>
                    <div
                      style={{ fontSize: 13, fontWeight: 800, color: "white" }}
                    >
                      {leg.stake}
                    </div>
                  </div>
                ))}
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  paddingTop: 12,
                  borderTop: "1px solid rgba(255,255,255,0.07)",
                }}
              >
                <span style={{ fontSize: 13, color: "rgba(255,255,255,0.5)" }}>
                  Total: £500
                </span>
                <span
                  style={{
                    fontSize: 12,
                    fontWeight: 700,
                    color: "#9be7bf",
                    padding: "6px 12px",
                    borderRadius: 999,
                    background: "rgba(0,255,140,0.08)",
                    border: "1px solid rgba(0,255,140,0.15)",
                  }}
                >
                  +£8.70 guaranteed
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* ── TELEGRAM ── */}
        <section style={{ padding: mob ? "40px 0" : "70px 0" }}>
          <div
            style={{
              borderRadius: 24,
              border: "1px solid rgba(0,136,204,0.25)",
              background:
                "linear-gradient(135deg, rgba(0,136,204,0.08), rgba(120,110,255,0.08))",
              padding: mob ? "28px 24px" : "48px 56px",
              display: "grid",
              gridTemplateColumns: mob ? "1fr" : "1fr 1fr",
              gap: mob ? 28 : 60,
              alignItems: "center",
            }}
          >
            <div>
              <div
                style={{
                  fontSize: 11,
                  letterSpacing: "0.16em",
                  color: "rgba(0,180,255,0.7)",
                  marginBottom: 12,
                }}
              >
                LONG RUN FEATURE
              </div>
              <h2
                style={{
                  fontSize: mob ? 28 : 38,
                  fontWeight: 900,
                  letterSpacing: "-1px",
                  color: "white",
                  margin: "0 0 16px",
                  lineHeight: 1.1,
                }}
              >
                Arbs straight to your phone. Before anyone else.
              </h2>
              <p
                style={{
                  fontSize: 15,
                  color: "rgba(255,255,255,0.6)",
                  lineHeight: 1.75,
                  margin: "0 0 24px",
                }}
              >
                Long Run members get instant Telegram alerts the moment a
                high-value arb hits the feed. No refreshing. No missing
                opportunities. Just tap, place, profit.
              </p>
              <div style={{ display: "grid", gap: 12 }}>
                {[
                  "Instant alert when arbs above 2% appear",
                  "Exact stakes and books included",
                  "Read-only channel — no noise, just signals",
                  "Works on any phone, no app needed",
                ].map((f) => (
                  <div
                    key={f}
                    style={{
                      display: "flex",
                      gap: 10,
                      fontSize: 14,
                      color: "rgba(255,255,255,0.8)",
                      alignItems: "center",
                    }}
                  >
                    <span
                      style={{
                        color: "#9be7bf",
                        fontWeight: 900,
                        flexShrink: 0,
                      }}
                    >
                      ✓
                    </span>
                    {f}
                  </div>
                ))}
              </div>
              <Link
                href="/pricing"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "13px 22px",
                  borderRadius: 14,
                  fontWeight: 800,
                  fontSize: 15,
                  color: "white",
                  background: GRAD,
                  border: "1px solid rgba(120,110,255,0.4)",
                  textDecoration: "none",
                  marginTop: 28,
                }}
              >
                Get Long Run access
              </Link>
            </div>
            <div
              style={{
                background: "rgba(10,14,20,0.8)",
                border: "1px solid rgba(0,136,204,0.2)",
                borderRadius: 20,
                padding: 20,
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  marginBottom: 16,
                  paddingBottom: 14,
                  borderBottom: "1px solid rgba(255,255,255,0.07)",
                }}
              >
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 999,
                    background:
                      "linear-gradient(135deg, rgba(0,136,204,0.8), rgba(120,110,255,0.8))",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 18,
                  }}
                >
                  🎯
                </div>
                <div>
                  <div
                    style={{ fontSize: 14, fontWeight: 700, color: "white" }}
                  >
                    HitBet Alerts
                  </div>
                  <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)" }}>
                    just now
                  </div>
                </div>
                <div
                  style={{
                    marginLeft: "auto",
                    fontSize: 11,
                    padding: "3px 8px",
                    borderRadius: 999,
                    background: "rgba(0,136,204,0.15)",
                    border: "1px solid rgba(0,136,204,0.25)",
                    color: "rgba(0,200,255,0.9)",
                    fontWeight: 700,
                  }}
                >
                  LONG RUN
                </div>
              </div>
              <div
                style={{
                  fontSize: 13,
                  color: "rgba(255,255,255,0.9)",
                  lineHeight: 1.7,
                }}
              >
                <div style={{ marginBottom: 6 }}>
                  ⚽ <strong>Arsenal vs Chelsea</strong>
                </div>
                <div style={{ marginBottom: 6 }}>
                  📈 <strong style={{ color: "#9be7bf" }}>3.42% margin</strong>{" "}
                  — £17.10 profit @ £500
                </div>
                <div
                  style={{
                    marginBottom: 12,
                    color: "rgba(255,255,255,0.55)",
                    fontSize: 12,
                  }}
                >
                  Spread · in 45m
                </div>
                <div
                  style={{
                    background: "rgba(255,255,255,0.04)",
                    borderRadius: 12,
                    padding: "10px 12px",
                    marginBottom: 8,
                  }}
                >
                  <div
                    style={{
                      fontSize: 12,
                      fontWeight: 700,
                      color: "white",
                      marginBottom: 2,
                    }}
                  >
                    Leg 1 — Bet365
                  </div>
                  <div style={{ fontSize: 12, color: "rgba(255,255,255,0.6)" }}>
                    Arsenal -0.5 @ 2.05 · Stake £246
                  </div>
                </div>
                <div
                  style={{
                    background: "rgba(255,255,255,0.04)",
                    borderRadius: 12,
                    padding: "10px 12px",
                  }}
                >
                  <div
                    style={{
                      fontSize: 12,
                      fontWeight: 700,
                      color: "white",
                      marginBottom: 2,
                    }}
                  >
                    Leg 2 — Unibet
                  </div>
                  <div style={{ fontSize: 12, color: "rgba(255,255,255,0.6)" }}>
                    Chelsea +0.5 @ 2.10 · Stake £254
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── LONG RUN EDGE ── */}
        <section style={{ padding: mob ? "40px 0" : "70px 0" }}>
          <div style={{ maxWidth: 620, marginBottom: 36 }}>
            <div
              style={{
                fontSize: 11,
                letterSpacing: "0.16em",
                color: "rgba(0,190,255,0.7)",
                marginBottom: 12,
              }}
            >
              LONG RUN EDGE
            </div>
            <h2
              style={{
                fontSize: mob ? 28 : 40,
                fontWeight: 900,
                letterSpacing: "-1px",
                color: "white",
                margin: "0 0 14px",
                lineHeight: 1.1,
              }}
            >
              The house wins because of the edge. Now you have one.
            </h2>
            <p
              style={{
                fontSize: 15,
                color: "rgba(255,255,255,0.6)",
                lineHeight: 1.75,
                margin: 0,
              }}
            >
              Every bookmaker profits long-term because they price odds slightly
              below true probability. The Long Run plan flips this — finding
              spots where soft books overprice outcomes, giving you the
              mathematical edge instead.
            </p>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: mob ? "1fr" : "1fr 1fr",
              gap: 16,
              marginBottom: 24,
            }}
          >
            <div
              style={{
                border: "1px solid rgba(255,255,255,0.08)",
                background: "rgba(10,14,20,0.5)",
                borderRadius: 20,
                padding: 24,
              }}
            >
              <div
                style={{
                  fontSize: 14,
                  fontWeight: 700,
                  color: "rgba(255,255,255,0.5)",
                  marginBottom: 16,
                }}
              >
                Without edge — bookmaker wins
              </div>
              {[
                {
                  label: "True probability",
                  value: "50%",
                  width: "50%",
                  color: "rgba(255,255,255,0.3)",
                },
                {
                  label: "Bookie implied prob (@ 1.90)",
                  value: "52.6%",
                  width: "52.6%",
                  color: "rgba(248,113,113,0.6)",
                },
              ].map((r) => (
                <div key={r.label} style={{ marginBottom: 10 }}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      marginBottom: 4,
                    }}
                  >
                    <span
                      style={{ fontSize: 12, color: "rgba(255,255,255,0.5)" }}
                    >
                      {r.label}
                    </span>
                    <span
                      style={{
                        fontSize: 12,
                        color:
                          r.color === "rgba(255,255,255,0.3)"
                            ? "white"
                            : "#f87171",
                      }}
                    >
                      {r.value}
                    </span>
                  </div>
                  <div
                    style={{
                      height: 8,
                      borderRadius: 999,
                      background: "rgba(255,255,255,0.06)",
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        width: r.width,
                        height: "100%",
                        background: r.color,
                        borderRadius: 999,
                      }}
                    />
                  </div>
                </div>
              ))}
              <div
                style={{
                  padding: "10px 12px",
                  borderRadius: 10,
                  background: "rgba(248,113,113,0.08)",
                  border: "1px solid rgba(248,113,113,0.15)",
                  fontSize: 13,
                  color: "rgba(248,113,113,0.9)",
                  marginTop: 6,
                }}
              >
                -2.6% edge — you lose long term
              </div>
            </div>

            <div
              style={{
                border: "1px solid rgba(0,190,255,0.2)",
                background: "rgba(0,190,255,0.04)",
                borderRadius: 20,
                padding: 24,
              }}
            >
              <div
                style={{
                  fontSize: 14,
                  fontWeight: 700,
                  color: "rgba(255,255,255,0.5)",
                  marginBottom: 16,
                }}
              >
                With Long Run edge — you win
              </div>
              {[
                {
                  label: "True probability (Exchange)",
                  value: "50%",
                  width: "50%",
                  color: "rgba(255,255,255,0.3)",
                },
                {
                  label: "Soft book price (@ 2.20)",
                  value: "45.5%",
                  width: "45.5%",
                  color: "rgba(0,255,140,0.4)",
                },
              ].map((r) => (
                <div key={r.label} style={{ marginBottom: 10 }}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      marginBottom: 4,
                    }}
                  >
                    <span
                      style={{ fontSize: 12, color: "rgba(255,255,255,0.5)" }}
                    >
                      {r.label}
                    </span>
                    <span
                      style={{
                        fontSize: 12,
                        color:
                          r.color === "rgba(255,255,255,0.3)"
                            ? "white"
                            : "#9be7bf",
                      }}
                    >
                      {r.value}
                    </span>
                  </div>
                  <div
                    style={{
                      height: 8,
                      borderRadius: 999,
                      background: "rgba(255,255,255,0.06)",
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        width: r.width,
                        height: "100%",
                        background: r.color,
                        borderRadius: 999,
                      }}
                    />
                  </div>
                </div>
              ))}
              <div
                style={{
                  padding: "10px 12px",
                  borderRadius: 10,
                  background: "rgba(0,255,140,0.07)",
                  border: "1px solid rgba(0,255,140,0.15)",
                  fontSize: 13,
                  color: "#9be7bf",
                  marginTop: 6,
                }}
              >
                +10% edge — you profit long term
              </div>
            </div>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: mob ? "1fr" : "repeat(3, 1fr)",
              gap: 12,
            }}
          >
            {[
              {
                icon: "📊",
                title: "Maths, not luck",
                body: "If your edge is +10%, placing 100 bets at £50 each gives an expected profit of £500 — regardless of which individual bets win or lose.",
              },
              {
                icon: "🎯",
                title: "Soft books lag sharp money",
                body: "When sharp bettors move the Betfair market, soft books are slow to adjust. That window of mispricing is your edge — and we find it automatically.",
              },
              {
                icon: "📈",
                title: "Volume is the strategy",
                body: "A single value bet can lose. 50 value bets at +10% edge cannot. The Long Run plan is built for volume — the more you place, the more reliable the profit.",
              },
            ].map(({ icon, title, body }) => (
              <div
                key={title}
                style={{
                  border: "1px solid rgba(255,255,255,0.07)",
                  background: "rgba(255,255,255,0.02)",
                  borderRadius: 16,
                  padding: 20,
                }}
              >
                <div style={{ fontSize: 24, marginBottom: 12 }}>{icon}</div>
                <div
                  style={{
                    fontSize: 15,
                    fontWeight: 800,
                    color: "white",
                    marginBottom: 8,
                  }}
                >
                  {title}
                </div>
                <div
                  style={{
                    fontSize: 13,
                    color: "rgba(255,255,255,0.6)",
                    lineHeight: 1.7,
                  }}
                >
                  {body}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── PLANS ── */}
        <section style={{ padding: mob ? "40px 0" : "70px 0" }}>
          <div style={{ maxWidth: 620, marginBottom: 36 }}>
            <div
              style={{
                fontSize: 11,
                letterSpacing: "0.16em",
                color: "rgba(255,255,255,0.4)",
                marginBottom: 12,
              }}
            >
              PRICING
            </div>
            <h2
              style={{
                fontSize: mob ? 28 : 40,
                fontWeight: 900,
                letterSpacing: "-1px",
                color: "white",
                margin: "0 0 14px",
                lineHeight: 1.1,
              }}
            >
              Start free. Pay when it's working.
            </h2>
            <p
              style={{
                fontSize: 15,
                color: "rgba(255,255,255,0.6)",
                lineHeight: 1.75,
                margin: 0,
              }}
            >
              7-day free trial on all plans. Card required — cancels
              automatically.
            </p>
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: mob ? "1fr" : "repeat(3, minmax(0,1fr))",
              gap: 14,
            }}
          >
            {PLANS.map((p) => (
              <div
                key={p.name}
                style={{
                  position: "relative",
                  border: p.popular
                    ? "1px solid rgba(120,110,255,0.35)"
                    : "1px solid rgba(255,255,255,0.10)",
                  background: "rgba(10,14,20,0.55)",
                  borderRadius: 20,
                  padding: 24,
                  boxShadow: p.popular
                    ? "0 18px 60px rgba(80,60,255,0.15)"
                    : undefined,
                }}
              >
                {p.popular && (
                  <div
                    style={{
                      position: "absolute",
                      top: 14,
                      right: 14,
                      fontSize: 10,
                      fontWeight: 800,
                      padding: "4px 9px",
                      borderRadius: 999,
                      background: "rgba(255,90,180,0.14)",
                      border: "1px solid rgba(255,90,180,0.22)",
                      color: "rgba(255,255,255,0.9)",
                      letterSpacing: "0.05em",
                    }}
                  >
                    BEST VALUE
                  </div>
                )}
                <div
                  style={{
                    fontSize: 16,
                    fontWeight: 800,
                    color: "white",
                    marginBottom: 2,
                  }}
                >
                  {p.name}
                </div>
                <div
                  style={{
                    fontSize: 12,
                    color: "rgba(255,255,255,0.5)",
                    marginBottom: 12,
                  }}
                >
                  {p.sub}
                </div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "baseline",
                    gap: 8,
                    marginBottom: p.plus ? 4 : 14,
                  }}
                >
                  <div
                    style={{
                      fontSize: 38,
                      fontWeight: 900,
                      letterSpacing: "-1px",
                      color: "white",
                      lineHeight: 1,
                    }}
                  >
                    {p.price}
                  </div>
                  <span
                    style={{ fontSize: 13, color: "rgba(255,255,255,0.45)" }}
                  >
                    /mo
                  </span>
                </div>
                {p.plus && (
                  <div
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      padding: "2px 8px",
                      borderRadius: 999,
                      background: "rgba(0,255,140,0.1)",
                      border: "1px solid rgba(0,255,140,0.2)",
                      color: "#9be7bf",
                      display: "inline-block",
                      marginBottom: 14,
                    }}
                  >
                    {p.plus}
                  </div>
                )}
                <div
                  style={{
                    height: 1,
                    background: "rgba(255,255,255,0.08)",
                    margin: "0 0 14px",
                  }}
                />
                <ul
                  style={{
                    listStyle: "none",
                    margin: "0 0 20px",
                    padding: 0,
                    display: "grid",
                    gap: 9,
                  }}
                >
                  {p.features.map((f) => (
                    <li
                      key={f}
                      style={{
                        display: "flex",
                        gap: 9,
                        fontSize: 13,
                        color: "rgba(255,255,255,0.85)",
                        alignItems: "center",
                      }}
                    >
                      <span
                        style={{
                          color: "#9be7bf",
                          fontWeight: 900,
                          fontSize: 12,
                        }}
                      >
                        ✓
                      </span>
                      {f}
                    </li>
                  ))}
                </ul>
                <Link
                  href={`/checkout?plan=${p.plan}&trial=true`}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: "12px 18px",
                    borderRadius: 12,
                    fontWeight: 800,
                    fontSize: 14,
                    color: "white",
                    background: GRAD,
                    border: "1px solid rgba(120,110,255,0.4)",
                    textDecoration: "none",
                  }}
                >
                  Try free — 7 days
                </Link>
                <div
                  style={{
                    marginTop: 8,
                    fontSize: 11,
                    color: "rgba(255,255,255,0.3)",
                    textAlign: "center" as const,
                  }}
                >
                  Then {p.price}/mo. Cancel anytime.
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── FOOTER CTA ── */}
        <section
          style={{
            padding: mob ? "40px 0" : "80px 0",
            borderTop: "1px solid rgba(255,255,255,0.06)",
            textAlign: "center",
          }}
        >
          <h2
            style={{
              fontSize: mob ? 28 : 40,
              fontWeight: 900,
              letterSpacing: "-1px",
              color: "white",
              margin: "0 0 14px",
              lineHeight: 1.1,
            }}
          >
            The maths doesn't lie.
          </h2>
          <p
            style={{
              fontSize: 15,
              color: "rgba(255,255,255,0.6)",
              lineHeight: 1.75,
              maxWidth: 480,
              margin: "0 auto 28px",
            }}
          >
            Every arb on HitBet is a real pricing inefficiency. Place both legs
            correctly and the profit is guaranteed by maths alone.
          </p>
          <div
            style={{
              display: "flex",
              gap: 12,
              justifyContent: "center",
              flexWrap: "wrap",
            }}
          >
            <Link
              href="/pricing"
              style={{
                display: "inline-flex",
                alignItems: "center",
                padding: "13px 22px",
                borderRadius: 14,
                fontWeight: 800,
                fontSize: 15,
                color: "white",
                background: GRAD,
                border: "1px solid rgba(120,110,255,0.4)",
                textDecoration: "none",
              }}
            >
              Start 7-day free trial
            </Link>
            <Link
              href="/dashboard"
              style={{
                display: "inline-flex",
                alignItems: "center",
                padding: "13px 22px",
                borderRadius: 14,
                fontWeight: 700,
                fontSize: 15,
                color: "rgba(255,255,255,0.8)",
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.12)",
                textDecoration: "none",
              }}
            >
              View the feed
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
