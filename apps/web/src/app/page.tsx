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
    profit: "£1.71",
    book1: "Bet365",
    book2: "Unibet",
  },
  {
    event: "Lakers vs Celtics",
    sport: "NBA",
    margin: "2.88%",
    profit: "£1.44",
    book1: "William Hill",
    book2: "Betway",
  },
  {
    event: "Djokovic vs Alcaraz",
    sport: "ATP",
    margin: "2.11%",
    profit: "£1.06",
    book1: "Paddy Power",
    book2: "Betfair",
  },
  {
    event: "Man City vs Liverpool",
    sport: "EPL",
    margin: "1.74%",
    profit: "£0.87",
    book1: "888sport",
    book2: "Coral",
  },
  {
    event: "Sinner vs Zverev",
    sport: "ATP",
    margin: "1.31%",
    profit: "£0.66",
    book1: "Ladbrokes",
    book2: "Betfair",
  },
  {
    event: "Real Madrid vs Barca",
    sport: "La Liga",
    margin: "2.55%",
    profit: "£1.28",
    book1: "Bet365",
    book2: "Betfair",
  },
];

const STATS = [
  { value: "2–5%", label: "Typical arb margin" },
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

const GRAD =
  "linear-gradient(90deg, rgba(120,110,255,0.95), rgba(0,190,255,0.85))";

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

          {/* Live arb card — hidden on mobile, shown below */}
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
                  EPL · h2h · in 45m
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
                    pick: "Arsenal win",
                    odds: "@ 2.05",
                    stake: "£24.63",
                  },
                  {
                    book: "Unibet",
                    pick: "Chelsea win",
                    odds: "@ 2.10",
                    stake: "£25.37",
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
                  Total stake: £50.00
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
                  +£1.71 guaranteed
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
                EPL · h2h · tomorrow 17:30
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
                    pick: "Man City win",
                    odds: "@ 2.15",
                    stake: "£23.81",
                  },
                  {
                    book: "Coral",
                    pick: "Liverpool win",
                    odds: "@ 2.05",
                    stake: "£26.19",
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
                  Total: £50.00
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
                  Ready to place
                </span>
              </div>
            </div>
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
              7-day free trial on both plans. Card required — cancels
              automatically.
            </p>
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: mob ? "1fr" : "repeat(2, minmax(0,1fr))",
              gap: 14,
            }}
          >
            {[
              {
                name: "Pro",
                price: "£39.99",
                plan: "pro",
                features: [
                  "Full 2-outcome arb feed",
                  "Stake splits included",
                  "30s refresh",
                  "Suspicious edge flags",
                ],
                elite: false,
              },
              {
                name: "Elite",
                price: "£59.99",
                plan: "elite",
                features: [
                  "3-way markets (football 1X2)",
                  "Value watchlist",
                  "Telegram alerts",
                  "Priority support",
                ],
                elite: true,
              },
            ].map((p) => (
              <div
                key={p.name}
                style={{
                  position: "relative",
                  border: p.elite
                    ? "1px solid rgba(120,110,255,0.35)"
                    : "1px solid rgba(255,255,255,0.10)",
                  background: "rgba(10,14,20,0.55)",
                  borderRadius: 20,
                  padding: 28,
                  boxShadow: p.elite
                    ? "0 18px 60px rgba(80,60,255,0.15)"
                    : undefined,
                }}
              >
                {p.elite && (
                  <div
                    style={{
                      position: "absolute",
                      top: 18,
                      right: 18,
                      fontSize: 11,
                      fontWeight: 700,
                      padding: "5px 10px",
                      borderRadius: 999,
                      background: "rgba(255,90,180,0.14)",
                      border: "1px solid rgba(255,90,180,0.22)",
                      color: "rgba(255,255,255,0.9)",
                    }}
                  >
                    Most popular
                  </div>
                )}
                <div
                  style={{
                    fontSize: 16,
                    fontWeight: 800,
                    color: "rgba(255,255,255,0.7)",
                    marginBottom: 8,
                  }}
                >
                  {p.name}
                </div>
                <div
                  style={{
                    fontSize: 44,
                    fontWeight: 900,
                    letterSpacing: "-1px",
                    color: "white",
                    lineHeight: 1,
                  }}
                >
                  {p.price}
                  <span
                    style={{
                      fontSize: 14,
                      fontWeight: 400,
                      color: "rgba(255,255,255,0.5)",
                    }}
                  >
                    /mo
                  </span>
                </div>
                <div
                  style={{
                    height: 1,
                    background: "rgba(255,255,255,0.08)",
                    margin: "16px 0",
                  }}
                />
                {p.elite && (
                  <div
                    style={{
                      fontSize: 12,
                      color: "rgba(255,255,255,0.45)",
                      marginBottom: 10,
                    }}
                  >
                    Everything in Pro, plus:
                  </div>
                )}
                <ul
                  style={{
                    listStyle: "none",
                    margin: "0 0 22px",
                    padding: 0,
                    display: "grid",
                    gap: 10,
                  }}
                >
                  {p.features.map((f) => (
                    <li
                      key={f}
                      style={{
                        display: "flex",
                        gap: 10,
                        fontSize: 14,
                        color: "rgba(255,255,255,0.85)",
                        alignItems: "center",
                      }}
                    >
                      <span
                        style={{
                          color: "#9be7bf",
                          fontWeight: 900,
                          fontSize: 13,
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
                    marginTop: 10,
                    fontSize: 12,
                    color: "rgba(255,255,255,0.35)",
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
