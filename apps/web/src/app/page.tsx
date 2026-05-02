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

const GRAD = "linear-gradient(90deg, rgba(120,110,255,0.95), rgba(0,190,255,0.85))";

const LIVE_ARBS = [
  { event: "Arsenal vs Chelsea", sport: "EPL", margin: "3.42%", profit: "£17.10", book1: "Bet365", book2: "Unibet" },
  { event: "Lakers vs Celtics", sport: "NBA", margin: "2.88%", profit: "£14.40", book1: "William Hill", book2: "Betway" },
  { event: "Djokovic vs Alcaraz", sport: "ATP", margin: "2.11%", profit: "£10.55", book1: "Paddy Power", book2: "Betfair" },
  { event: "Man City vs Liverpool", sport: "EPL", margin: "1.74%", profit: "£8.70", book1: "888sport", book2: "Coral" },
  { event: "Sinner vs Zverev", sport: "ATP", margin: "1.31%", profit: "£6.55", book1: "Ladbrokes", book2: "Betfair" },
  { event: "Real Madrid vs Barca", sport: "La Liga", margin: "2.55%", profit: "£12.75", book1: "Bet365", book2: "Betfair" },
];

const STATS = [
  { value: "40+", label: "UK bookmakers scanned" },
  { value: "30s", label: "Data refresh interval" },
  { value: "0.5–8%", label: "Typical arb margins" },
  { value: "2–15", label: "Live arbs at any time" },
];

const FAQS = [
  {
    q: "Is sports arbitrage legal in the UK?",
    a: "Yes. Arbitrage betting is completely legal. You're placing normal bets with fully licensed, UK-regulated bookmakers — the same bets any other customer places. The only difference is you place both sides of the same market to guarantee a profit regardless of outcome. There is no manipulation involved.",
  },
  {
    q: "Can bookmakers restrict my account?",
    a: "Soft bookmakers can and do restrict accounts they identify as consistently profitable. This is a genuine risk in arbitrage betting and something serious arbers manage actively — by keeping stakes reasonable, using a wide range of books, and not always taking the very best available odds. Exchanges like Betfair and Smarkets never restrict winning customers, which is why we always include them in our detection.",
  },
  {
    q: "How much can I realistically make?",
    a: "Arbitrage margins typically run 0.5%–4% per opportunity. On a £500 stake, that's £2.50–£20 profit per arb, locked in before the event. With 5–15 live opportunities at any time, the realistic monthly figure depends almost entirely on your bankroll size and how many book accounts you have active. We don't publish income projections — the maths is transparent and you can calculate your own.",
  },
  {
    q: "What is the difference between Arbitrage and Long Run?",
    a: "Arbitrage guarantees profit on every individual bet by covering all outcomes across different bookmakers. Long Run identifies value bets — situations where a soft bookmaker has overpriced an outcome relative to the sharp exchange market, giving you a statistical edge. Arbs lock in profit immediately. Value bets require volume to realise the edge — individual bets can still lose, but the positive expected value compounds over hundreds of bets.",
  },
  {
    q: "Do I need previous betting experience?",
    a: "No. Every opportunity surfaces as a step-by-step execution card: which bookmaker, which selection, exactly how much to stake, and the minimum odds to accept. If you can place a bet on a standard UK bookmaker site, you have everything you need.",
  },
  {
    q: "Where does the odds data come from?",
    a: "We pull live odds data from The Odds API, which aggregates prices directly from bookmaker feeds. Data is refreshed every 30 seconds. We calculate the implied probability overround across all available books for every market and flag only opportunities where the combined probabilities sum below 100% — the mathematical definition of a guaranteed arb.",
  },
];

const TESTIMONIALS = [
  {
    text: "I spent two weeks tracking arbs manually in a spreadsheet. Found maybe one or two a day. HitBet surfaces 10+ before I've had my morning coffee. The execution cards take out all the guesswork.",
    name: "Tom R.",
    location: "Manchester",
    plan: "Arbitrage",
  },
  {
    text: "The Long Run value feed is what I use alongside my own model. Seeing 10–40 EV-positive bets a day that I can cross-reference is genuinely useful. It's a data tool, not a tipster service — which is exactly what I wanted.",
    name: "James K.",
    location: "London",
    plan: "Both Plans",
  },
  {
    text: "Tried the 24-hour trial not expecting much. Watched live arbs land in real time — it clicked immediately. Kept it. The step-by-step placement card is what makes it — I'd have made errors without it.",
    name: "Sarah W.",
    location: "Bristol",
    plan: "Arbitrage",
  },
];

const WHO = [
  {
    tag: "New to arbitrage",
    headline: "Never placed an arb before?",
    body: "The execution card tells you everything — which book, which selection, exactly how much to stake. You don't need to understand the maths to place the bet correctly.",
    accent: "rgba(120,110,255,0.15)",
    border: "rgba(120,110,255,0.25)",
  },
  {
    tag: "Regular bettors",
    headline: "Already know the books?",
    body: "You'll recognise the opportunities immediately. The feed shows exactly which two books are mispriced and by how much. Filter by your books and you only see arbs you can actually place.",
    accent: "rgba(0,190,255,0.08)",
    border: "rgba(0,190,255,0.2)",
  },
  {
    tag: "Quantitative approach",
    headline: "Running your own model?",
    body: "The Long Run value feed surfaces every EV-positive opportunity against sharp exchange prices. Use it to cross-reference your own selections or as a standalone positive-EV signal.",
    accent: "rgba(0,255,140,0.06)",
    border: "rgba(0,255,140,0.18)",
  },
];

const PLANS = [
  {
    name: "Arbitrage",
    price: "£9.99",
    plan: "arbitrage",
    sub: "Guaranteed profit per bet",
    features: ["Live 2-way arb feed", "Exact stake splits", "Step-by-step execution cards", "30s refresh · 40+ books", "My books filter"],
    popular: false,
  },
  {
    name: "Long Run",
    price: "£14.99",
    plan: "longrun",
    sub: "Mathematical edge over time",
    features: ["Value watchlist (positive EV)", "3-way football arbs (1X2)", "Telegram alerts", "Kelly criterion stakes", "Exchange price comparison"],
    popular: false,
  },
  {
    name: "Both Plans",
    price: "£19.99",
    plan: "both",
    sub: "Complete edge toolkit",
    features: ["Full 2-way arb feed", "Value watchlist + EV bets", "3-way football arbs", "Telegram alerts", "Step-by-step placement", "Kelly criterion stakes"],
    popular: true,
    saving: "Save £5/wk",
  },
];

function TickerRow() {
  const [offset, setOffset] = useState(0);
  const ref = useRef<number>(0);
  useEffect(() => {
    let raf: number;
    const tick = () => {
      ref.current += 0.35;
      setOffset(ref.current);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);
  const items = [...LIVE_ARBS, ...LIVE_ARBS];
  const x = -(offset % (LIVE_ARBS.length * 260));
  return (
    <div style={{ position: "relative", overflow: "hidden" }}>
      <div style={{ display: "flex", gap: 10, willChange: "transform", transform: `translateX(${x}px)` }}>
        {items.map((a, i) => (
          <div
            key={i}
            style={{
              minWidth: 230,
              border: "1px solid rgba(255,255,255,0.07)",
              background: "rgba(255,255,255,0.025)",
              borderRadius: 12,
              padding: "11px 14px",
              flexShrink: 0,
            }}
          >
            <div style={{ fontSize: 12, fontWeight: 700, color: "white", marginBottom: 5, whiteSpace: "nowrap" }}>
              {a.event}
            </div>
            <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 3 }}>
              <span style={{ fontSize: 10, color: "rgba(255,255,255,0.4)" }}>{a.sport}</span>
              <span style={{ fontSize: 12, fontWeight: 800, color: "#9be7bf" }}>{a.margin}</span>
              <span style={{ fontSize: 11, color: "rgba(255,255,255,0.55)" }}>{a.profit}</span>
            </div>
            <div style={{ fontSize: 10, color: "rgba(255,255,255,0.3)" }}>
              {a.book1} · {a.book2}
            </div>
          </div>
        ))}
      </div>
      <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 80, background: "linear-gradient(90deg, #05060a, transparent)", pointerEvents: "none" }} />
      <div style={{ position: "absolute", right: 0, top: 0, bottom: 0, width: 80, background: "linear-gradient(270deg, #05060a, transparent)", pointerEvents: "none" }} />
    </div>
  );
}

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div
      style={{
        borderBottom: "1px solid rgba(255,255,255,0.07)",
        cursor: "pointer",
      }}
      onClick={() => setOpen((v) => !v)}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "18px 0",
          gap: 16,
        }}
      >
        <div style={{ fontSize: 15, fontWeight: 700, color: "white", lineHeight: 1.4 }}>{q}</div>
        <div
          style={{
            fontSize: 18,
            color: "rgba(255,255,255,0.4)",
            flexShrink: 0,
            transform: open ? "rotate(45deg)" : "none",
            transition: "transform 0.2s",
            lineHeight: 1,
          }}
        >
          +
        </div>
      </div>
      {open && (
        <div
          style={{
            fontSize: 14,
            lineHeight: 1.75,
            color: "rgba(255,255,255,0.6)",
            paddingBottom: 18,
            maxWidth: 680,
          }}
        >
          {a}
        </div>
      )}
    </div>
  );
}

export default function Home() {
  const mob = useIsMobile();

  return (
    <div className="narrowPage">
      <div style={{ width: "100%" }}>

        {/* ── HERO ──────────────────────────────────────────────────────────── */}
        <section
          style={{
            display: "grid",
            gridTemplateColumns: mob ? "1fr" : "1fr 420px",
            gap: mob ? 36 : 60,
            alignItems: "center",
            padding: mob ? "48px 0 40px" : "88px 0 72px",
          }}
        >
          <div>
            {/* Eyebrow */}
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                fontSize: 11,
                letterSpacing: "0.14em",
                color: "rgba(255,255,255,0.5)",
                marginBottom: 22,
                padding: "6px 12px",
                border: "1px solid rgba(255,255,255,0.09)",
                borderRadius: 999,
                background: "rgba(255,255,255,0.03)",
              }}
            >
              <span
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: 999,
                  background: "#22c55e",
                  boxShadow: "0 0 8px #22c55e",
                  flexShrink: 0,
                }}
              />
              LIVE · 40+ BOOKS · REFRESHES EVERY 30S
            </div>

            <h1
              style={{
                fontSize: mob ? 38 : 56,
                fontWeight: 900,
                lineHeight: 1.07,
                letterSpacing: "-1.5px",
                margin: "0 0 22px",
                color: "white",
              }}
            >
              The odds don't{" "}
              <span
                style={{
                  background: GRAD,
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                add up.
              </span>
              <br />
              That's your profit.
            </h1>

            <p
              style={{
                fontSize: mob ? 15 : 17,
                lineHeight: 1.75,
                color: "rgba(255,255,255,0.62)",
                maxWidth: 520,
                margin: "0 0 32px",
              }}
            >
              HitBet scans 40+ UK sportsbooks every 30 seconds and surfaces
              real arbitrage opportunities — situations where the combined odds
              guarantee a profit regardless of the outcome. No prediction. No
              luck. Pure mathematics.
            </p>

            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center", marginBottom: 16 }}>
              <Link
                href="/pricing"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: "13px 24px",
                  borderRadius: 14,
                  fontWeight: 800,
                  fontSize: 15,
                  color: "white",
                  background: GRAD,
                  border: "1px solid rgba(120,110,255,0.4)",
                  textDecoration: "none",
                  boxShadow: "0 8px 32px rgba(80,60,255,0.25)",
                }}
              >
                Try free for 24 hours
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
                  color: "rgba(255,255,255,0.75)",
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.11)",
                  textDecoration: "none",
                }}
              >
                See live feed →
              </Link>
            </div>

            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.3)", display: "flex", gap: 16, flexWrap: "wrap" }}>
              <span>✓ Card required, £0 charged today</span>
              <span>✓ Cancel before 24 hours, pay nothing</span>
            </div>
          </div>

          {/* Hero card */}
          {!mob && (
            <div
              style={{
                border: "1px solid rgba(120,110,255,0.28)",
                background: "rgba(10,14,20,0.75)",
                borderRadius: 22,
                padding: 24,
                backdropFilter: "blur(20px)",
                boxShadow: "0 32px 80px rgba(60,40,200,0.22)",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                <div>
                  <div style={{ fontSize: 10, letterSpacing: "0.14em", color: "rgba(255,255,255,0.35)", marginBottom: 4 }}>
                    LIVE ARB DETECTED
                  </div>
                  <div style={{ fontSize: 18, fontWeight: 800, color: "white" }}>Arsenal vs Chelsea</div>
                  <div style={{ fontSize: 12, color: "rgba(255,255,255,0.45)", marginTop: 2 }}>EPL · Spread · in 45m</div>
                </div>
                <div
                  style={{
                    fontSize: 18,
                    fontWeight: 900,
                    padding: "6px 12px",
                    borderRadius: 10,
                    background: "rgba(0,255,140,0.1)",
                    border: "1px solid rgba(0,255,140,0.22)",
                    color: "#9be7bf",
                    letterSpacing: "-0.5px",
                  }}
                >
                  +3.42%
                </div>
              </div>

              <div style={{ height: 1, background: "rgba(255,255,255,0.07)", marginBottom: 14 }} />

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 14 }}>
                {[
                  { book: "Bet365", pick: "Arsenal -0.5", odds: "2.05", stake: "£246", step: "1" },
                  { book: "Unibet", pick: "Chelsea +0.5", odds: "2.10", stake: "£254", step: "2" },
                ].map((leg) => (
                  <div
                    key={leg.book}
                    style={{
                      border: "1px solid rgba(255,255,255,0.08)",
                      background: "rgba(255,255,255,0.03)",
                      borderRadius: 14,
                      padding: 14,
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: "white" }}>{leg.book}</div>
                      <div style={{ fontSize: 10, padding: "2px 6px", borderRadius: 6, background: "rgba(120,110,255,0.2)", color: "rgba(180,170,255,0.8)", fontWeight: 700 }}>
                        STEP {leg.step}
                      </div>
                    </div>
                    <div style={{ fontSize: 12, color: "rgba(255,255,255,0.55)", marginBottom: 6 }}>{leg.pick}</div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: "#98b8ff", marginBottom: 4 }}>@ {leg.odds}</div>
                    <div style={{ fontSize: 15, fontWeight: 900, color: "white" }}>{leg.stake}</div>
                  </div>
                ))}
              </div>

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "12px 14px",
                  borderRadius: 12,
                  background: "rgba(0,255,140,0.06)",
                  border: "1px solid rgba(0,255,140,0.15)",
                }}
              >
                <span style={{ fontSize: 13, color: "rgba(255,255,255,0.5)" }}>Total staked: £500</span>
                <span style={{ fontSize: 14, fontWeight: 800, color: "#9be7bf" }}>+£17.10 guaranteed</span>
              </div>

              <div style={{ marginTop: 12, fontSize: 11, color: "rgba(255,255,255,0.28)", textAlign: "center" }}>
                Profit is locked in before kick-off, regardless of result
              </div>
            </div>
          )}
        </section>

        {/* ── LIVE TICKER ────────────────────────────────────────────────────── */}
        <div style={{ paddingBottom: 64, overflow: "hidden" }}>
          <div style={{ fontSize: 10, letterSpacing: "0.18em", color: "rgba(255,255,255,0.28)", marginBottom: 10 }}>
            SAMPLE FROM LIVE FEED
          </div>
          <TickerRow />
        </div>

        {/* ── STATS BAR ──────────────────────────────────────────────────────── */}
        <section
          style={{
            display: "grid",
            gridTemplateColumns: mob ? "repeat(2, 1fr)" : "repeat(4, minmax(0,1fr))",
            marginBottom: mob ? 48 : 88,
            border: "1px solid rgba(255,255,255,0.07)",
            borderRadius: 18,
            overflow: "hidden",
            background: "rgba(255,255,255,0.02)",
          }}
        >
          {STATS.map((s, i) => (
            <div
              key={s.label}
              style={{
                padding: mob ? "18px 16px" : "26px 28px",
                borderRight: i < 3 ? "1px solid rgba(255,255,255,0.06)" : "none",
                borderBottom: mob && i < 2 ? "1px solid rgba(255,255,255,0.06)" : "none",
              }}
            >
              <div style={{ fontSize: mob ? 26 : 32, fontWeight: 900, letterSpacing: "-1px", color: "white", marginBottom: 5 }}>
                {s.value}
              </div>
              <div style={{ fontSize: 12, color: "rgba(255,255,255,0.45)" }}>{s.label}</div>
            </div>
          ))}
        </section>

        {/* ── HOW IT WORKS ───────────────────────────────────────────────────── */}
        <section style={{ padding: mob ? "48px 0" : "80px 0" }}>
          <div style={{ maxWidth: 600, marginBottom: 44 }}>
            <div style={{ fontSize: 11, letterSpacing: "0.16em", color: "rgba(255,255,255,0.35)", marginBottom: 14 }}>
              HOW IT WORKS
            </div>
            <h2 style={{ fontSize: mob ? 30 : 42, fontWeight: 900, letterSpacing: "-1px", color: "white", margin: "0 0 16px", lineHeight: 1.1 }}>
              Signal to profit in three steps
            </h2>
            <p style={{ fontSize: 15, color: "rgba(255,255,255,0.55)", lineHeight: 1.75, margin: 0 }}>
              We do the scanning and maths. You do the placement.
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: mob ? "1fr" : "repeat(3, minmax(0,1fr))", gap: 14 }}>
            {[
              {
                n: "01",
                title: "We scan",
                body: "Live odds pulled from 40+ UK bookmakers every 30 seconds, across every available sport and market.",
                color: "rgba(120,110,255,0.2)",
              },
              {
                n: "02",
                title: "We detect",
                body: "Our engine calculates the combined implied probability across the best available odds. When it drops below 100%, that gap is guaranteed profit.",
                color: "rgba(0,190,255,0.15)",
              },
              {
                n: "03",
                title: "You execute",
                body: "A clean card tells you which books, which outcomes, and exactly how much to stake. Place both legs. Profit locked in.",
                color: "rgba(0,255,140,0.12)",
              },
            ].map((h) => (
              <div
                key={h.n}
                style={{
                  border: "1px solid rgba(255,255,255,0.08)",
                  background: "rgba(255,255,255,0.02)",
                  borderRadius: 20,
                  padding: 28,
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    top: -20,
                    right: -10,
                    fontSize: 80,
                    fontWeight: 900,
                    color: h.color,
                    lineHeight: 1,
                    pointerEvents: "none",
                    fontFamily: "monospace",
                  }}
                >
                  {h.n}
                </div>
                <div style={{ fontSize: 20, fontWeight: 800, color: "white", marginBottom: 12, position: "relative" }}>
                  {h.title}
                </div>
                <div style={{ fontSize: 14, color: "rgba(255,255,255,0.58)", lineHeight: 1.75, position: "relative" }}>
                  {h.body}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── METHODOLOGY / TRANSPARENCY ─────────────────────────────────────── */}
        <section
          style={{
            padding: mob ? "48px 0" : "80px 0",
            borderTop: "1px solid rgba(255,255,255,0.06)",
            borderBottom: "1px solid rgba(255,255,255,0.06)",
          }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: mob ? "1fr" : "1fr 1fr",
              gap: mob ? 36 : 72,
              alignItems: "start",
            }}
          >
            <div>
              <div style={{ fontSize: 11, letterSpacing: "0.16em", color: "rgba(255,255,255,0.35)", marginBottom: 14 }}>
                METHODOLOGY
              </div>
              <h2 style={{ fontSize: mob ? 28 : 38, fontWeight: 900, letterSpacing: "-1px", color: "white", margin: "0 0 18px", lineHeight: 1.1 }}>
                Transparent by design
              </h2>
              <p style={{ fontSize: 15, color: "rgba(255,255,255,0.58)", lineHeight: 1.8, marginBottom: 20 }}>
                Every arbitrage HitBet surfaces is based on one mathematically
                verifiable fact: the implied probabilities across the best
                available odds sum to less than 100%.
              </p>
              <p style={{ fontSize: 15, color: "rgba(255,255,255,0.58)", lineHeight: 1.8, marginBottom: 20 }}>
                In a fair market, implied probabilities always sum to exactly
                100%. Bookmakers build their margin in by inflating this to
                103–107%. When we find the sum dropping <em>below</em> 100%
                across different books, that gap is real, extractable profit.
              </p>
              <p style={{ fontSize: 15, color: "rgba(255,255,255,0.58)", lineHeight: 1.8 }}>
                Odds data is sourced live from{" "}
                <span style={{ color: "rgba(255,255,255,0.8)", fontWeight: 600 }}>The Odds API</span>,
                which aggregates prices directly from bookmaker feeds. We
                recalculate overrounds across all markets every 30 seconds.
              </p>
            </div>

            <div style={{ display: "grid", gap: 12 }}>
              {[
                {
                  label: "Data source",
                  value: "The Odds API — live bookmaker feeds",
                  icon: "⚡",
                },
                {
                  label: "Detection method",
                  value: "Implied probability overround < 100%",
                  icon: "∑",
                },
                {
                  label: "Refresh frequency",
                  value: "Every 30 seconds, all markets",
                  icon: "↻",
                },
                {
                  label: "Books monitored",
                  value: "40+ UK-licensed bookmakers and exchanges",
                  icon: "◉",
                },
                {
                  label: "Value bet benchmark",
                  value: "Sharp exchange prices (Betfair, Smarkets)",
                  icon: "▲",
                },
              ].map(({ label, value, icon }) => (
                <div
                  key={label}
                  style={{
                    display: "flex",
                    gap: 14,
                    alignItems: "flex-start",
                    padding: "14px 16px",
                    border: "1px solid rgba(255,255,255,0.07)",
                    borderRadius: 14,
                    background: "rgba(255,255,255,0.02)",
                  }}
                >
                  <div
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: 8,
                      background: "rgba(120,110,255,0.15)",
                      border: "1px solid rgba(120,110,255,0.2)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 14,
                      color: "rgba(180,170,255,0.9)",
                      flexShrink: 0,
                      fontWeight: 700,
                    }}
                  >
                    {icon}
                  </div>
                  <div>
                    <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", marginBottom: 3, letterSpacing: "0.06em" }}>
                      {label.toUpperCase()}
                    </div>
                    <div style={{ fontSize: 13, color: "rgba(255,255,255,0.8)", fontWeight: 600 }}>{value}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── WHO IS IT FOR ───────────────────────────────────────────────────── */}
        <section style={{ padding: mob ? "48px 0" : "80px 0" }}>
          <div style={{ maxWidth: 560, marginBottom: 40 }}>
            <div style={{ fontSize: 11, letterSpacing: "0.16em", color: "rgba(255,255,255,0.35)", marginBottom: 14 }}>
              WHO IT'S FOR
            </div>
            <h2 style={{ fontSize: mob ? 30 : 40, fontWeight: 900, letterSpacing: "-1px", color: "white", margin: 0, lineHeight: 1.1 }}>
              Built for every level of bettor
            </h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: mob ? "1fr" : "repeat(3, minmax(0,1fr))", gap: 14 }}>
            {WHO.map((w) => (
              <div
                key={w.tag}
                style={{
                  border: `1px solid ${w.border}`,
                  background: w.accent,
                  borderRadius: 20,
                  padding: 26,
                }}
              >
                <div
                  style={{
                    fontSize: 10,
                    fontWeight: 800,
                    letterSpacing: "0.1em",
                    color: "rgba(255,255,255,0.5)",
                    marginBottom: 14,
                    textTransform: "uppercase",
                  }}
                >
                  {w.tag}
                </div>
                <div style={{ fontSize: 18, fontWeight: 800, color: "white", marginBottom: 12, lineHeight: 1.3 }}>
                  {w.headline}
                </div>
                <div style={{ fontSize: 14, color: "rgba(255,255,255,0.6)", lineHeight: 1.75 }}>
                  {w.body}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── EXECUTION CARD DEMO ─────────────────────────────────────────────── */}
        <section
          style={{
            padding: mob ? "48px 0" : "80px 0",
            borderTop: "1px solid rgba(255,255,255,0.06)",
            borderBottom: "1px solid rgba(255,255,255,0.06)",
          }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: mob ? "1fr" : "1fr 1fr",
              gap: mob ? 36 : 72,
              alignItems: "center",
            }}
          >
            <div>
              <div style={{ fontSize: 11, letterSpacing: "0.16em", color: "rgba(255,255,255,0.35)", marginBottom: 14 }}>
                EXECUTION CARD
              </div>
              <h2 style={{ fontSize: mob ? 28 : 40, fontWeight: 900, letterSpacing: "-1px", color: "white", margin: "0 0 16px", lineHeight: 1.1 }}>
                Everything you need. Nothing you don't.
              </h2>
              <p style={{ fontSize: 15, color: "rgba(255,255,255,0.58)", lineHeight: 1.8, marginBottom: 24 }}>
                Every arb surfaces as a single card. Which bookmaker. Which
                selection. Exactly how much to stake. What odds to accept as a
                minimum. Place both legs in sequence and profit is locked in
                before the event starts.
              </p>
              <div style={{ display: "grid", gap: 10, marginBottom: 28 }}>
                {[
                  "Exact stake split calculated from your bankroll",
                  "Step-by-step placement order to avoid odds moving",
                  "Market and settlement rules explained clearly",
                  "Guaranteed profit shown before you place",
                ].map((c) => (
                  <div key={c} style={{ display: "flex", gap: 10, fontSize: 14, color: "rgba(255,255,255,0.78)", alignItems: "flex-start" }}>
                    <span style={{ color: "#9be7bf", fontWeight: 900, flexShrink: 0, marginTop: 1 }}>✓</span>
                    {c}
                  </div>
                ))}
              </div>
              <Link
                href="/pricing"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  padding: "13px 24px",
                  borderRadius: 14,
                  fontWeight: 800,
                  fontSize: 15,
                  color: "white",
                  background: GRAD,
                  border: "1px solid rgba(120,110,255,0.4)",
                  textDecoration: "none",
                  boxShadow: "0 8px 32px rgba(80,60,255,0.2)",
                }}
              >
                Start 24-hour trial
              </Link>
            </div>

            <div
              style={{
                border: "1px solid rgba(120,110,255,0.22)",
                background: "rgba(10,14,20,0.7)",
                borderRadius: 22,
                padding: 22,
                backdropFilter: "blur(14px)",
              }}
            >
              <div style={{ fontSize: 17, fontWeight: 800, color: "white", marginBottom: 3 }}>Man City vs Liverpool</div>
              <div style={{ fontSize: 12, color: "rgba(255,255,255,0.45)", marginBottom: 16 }}>EPL · Spread · tomorrow 17:30</div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 14 }}>
                {[
                  { book: "888sport", pick: "Man City -0.5", odds: "2.15", stake: "£238", step: "1", wait: false },
                  { book: "Coral", pick: "Liverpool +0.5", odds: "2.05", stake: "£262", step: "2", wait: true },
                ].map((leg) => (
                  <div
                    key={leg.book}
                    style={{
                      border: "1px solid rgba(255,255,255,0.08)",
                      background: "rgba(255,255,255,0.03)",
                      borderRadius: 14,
                      padding: 14,
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: "white" }}>{leg.book}</div>
                      <div style={{ fontSize: 10, padding: "2px 6px", borderRadius: 6, background: "rgba(120,110,255,0.2)", color: "rgba(180,170,255,0.8)", fontWeight: 700 }}>
                        {leg.step}
                      </div>
                    </div>
                    <div style={{ fontSize: 12, color: "rgba(255,255,255,0.55)", marginBottom: 6 }}>{leg.pick}</div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: "#98b8ff", marginBottom: 4 }}>@ {leg.odds}</div>
                    <div style={{ fontSize: 15, fontWeight: 900, color: "white" }}>{leg.stake}</div>
                    {leg.wait && (
                      <div style={{ fontSize: 10, marginTop: 6, color: "rgba(245,158,11,0.8)", fontWeight: 600 }}>
                        ⏱ Wait 20–30s first
                      </div>
                    )}
                  </div>
                ))}
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "12px 14px",
                  borderRadius: 12,
                  background: "rgba(0,255,140,0.06)",
                  border: "1px solid rgba(0,255,140,0.14)",
                }}
              >
                <span style={{ fontSize: 13, color: "rgba(255,255,255,0.45)" }}>Total: £500</span>
                <span style={{ fontSize: 14, fontWeight: 800, color: "#9be7bf" }}>+£8.70 guaranteed</span>
              </div>
            </div>
          </div>
        </section>

        {/* ── LONG RUN EDGE ───────────────────────────────────────────────────── */}
        <section style={{ padding: mob ? "48px 0" : "80px 0" }}>
          <div style={{ maxWidth: 600, marginBottom: 44 }}>
            <div style={{ fontSize: 11, letterSpacing: "0.16em", color: "rgba(0,190,255,0.65)", marginBottom: 14 }}>
              LONG RUN PLAN
            </div>
            <h2 style={{ fontSize: mob ? 30 : 42, fontWeight: 900, letterSpacing: "-1px", color: "white", margin: "0 0 16px", lineHeight: 1.1 }}>
              The house always wins because of the edge.{" "}
              <span style={{ background: GRAD, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
                Now you have one.
              </span>
            </h2>
            <p style={{ fontSize: 15, color: "rgba(255,255,255,0.55)", lineHeight: 1.8, margin: 0 }}>
              When sharp exchange markets move, soft bookmakers lag behind.
              That window of mispricing — where a soft book overprices an
              outcome relative to the true market — is a positive expected
              value bet. We find it automatically, every day.
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: mob ? "1fr" : "1fr 1fr", gap: 14, marginBottom: 20 }}>
            <div
              style={{
                border: "1px solid rgba(255,255,255,0.08)",
                background: "rgba(10,14,20,0.5)",
                borderRadius: 20,
                padding: 24,
              }}
            >
              <div style={{ fontSize: 13, fontWeight: 700, color: "rgba(255,80,80,0.7)", marginBottom: 18 }}>
                Without edge — bookmaker wins long term
              </div>
              {[
                { label: "True probability", value: "50%", width: "50%", bar: "rgba(255,255,255,0.2)", text: "rgba(255,255,255,0.6)" },
                { label: "Implied by bookie odds (@ 1.90)", value: "52.6%", width: "52.6%", bar: "rgba(248,113,113,0.5)", text: "#f87171" },
              ].map((r) => (
                <div key={r.label} style={{ marginBottom: 12 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                    <span style={{ fontSize: 12, color: "rgba(255,255,255,0.45)" }}>{r.label}</span>
                    <span style={{ fontSize: 12, color: r.text, fontWeight: 600 }}>{r.value}</span>
                  </div>
                  <div style={{ height: 7, borderRadius: 999, background: "rgba(255,255,255,0.05)", overflow: "hidden" }}>
                    <div style={{ width: r.width, height: "100%", background: r.bar, borderRadius: 999 }} />
                  </div>
                </div>
              ))}
              <div style={{ padding: "10px 14px", borderRadius: 10, background: "rgba(248,113,113,0.07)", border: "1px solid rgba(248,113,113,0.14)", fontSize: 13, color: "rgba(248,113,113,0.85)", marginTop: 8 }}>
                −2.6% edge — losing position over volume
              </div>
            </div>

            <div
              style={{
                border: "1px solid rgba(0,190,255,0.18)",
                background: "rgba(0,190,255,0.04)",
                borderRadius: 20,
                padding: 24,
              }}
            >
              <div style={{ fontSize: 13, fontWeight: 700, color: "rgba(0,190,255,0.75)", marginBottom: 18 }}>
                With Long Run edge — you hold the advantage
              </div>
              {[
                { label: "True probability (exchange)", value: "50%", width: "50%", bar: "rgba(255,255,255,0.2)", text: "rgba(255,255,255,0.6)" },
                { label: "Soft book price (@ 2.20)", value: "45.5%", width: "45.5%", bar: "rgba(0,255,140,0.4)", text: "#9be7bf" },
              ].map((r) => (
                <div key={r.label} style={{ marginBottom: 12 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                    <span style={{ fontSize: 12, color: "rgba(255,255,255,0.45)" }}>{r.label}</span>
                    <span style={{ fontSize: 12, color: r.text, fontWeight: 600 }}>{r.value}</span>
                  </div>
                  <div style={{ height: 7, borderRadius: 999, background: "rgba(255,255,255,0.05)", overflow: "hidden" }}>
                    <div style={{ width: r.width, height: "100%", background: r.bar, borderRadius: 999 }} />
                  </div>
                </div>
              ))}
              <div style={{ padding: "10px 14px", borderRadius: 10, background: "rgba(0,255,140,0.06)", border: "1px solid rgba(0,255,140,0.14)", fontSize: 13, color: "#9be7bf", marginTop: 8 }}>
                +10% expected value — winning position over volume
              </div>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: mob ? "1fr" : "repeat(3, 1fr)", gap: 12 }}>
            {[
              { title: "Maths, not prediction", body: "A +10% edge on 100 bets at £50 each gives an expected profit of £500 — independent of which individual bets win or lose." },
              { title: "Sharp money leads soft books", body: "When exchange prices move on sharp action, soft bookmakers lag. That lag is the window of mispricing. We monitor both simultaneously." },
              { title: "Volume realises the edge", body: "A single value bet has variance. Fifty value bets at +10% edge do not. The Long Run plan is built for consistent, high-volume execution." },
            ].map(({ title, body }) => (
              <div
                key={title}
                style={{
                  border: "1px solid rgba(255,255,255,0.07)",
                  background: "rgba(255,255,255,0.02)",
                  borderRadius: 16,
                  padding: 22,
                }}
              >
                <div style={{ fontSize: 15, fontWeight: 800, color: "white", marginBottom: 10 }}>{title}</div>
                <div style={{ fontSize: 13, color: "rgba(255,255,255,0.55)", lineHeight: 1.75 }}>{body}</div>
              </div>
            ))}
          </div>
        </section>

        {/* ── TELEGRAM ────────────────────────────────────────────────────────── */}
        <section
          style={{
            padding: mob ? "48px 0" : "80px 0",
            borderTop: "1px solid rgba(255,255,255,0.06)",
            borderBottom: "1px solid rgba(255,255,255,0.06)",
          }}
        >
          <div
            style={{
              borderRadius: 24,
              border: "1px solid rgba(0,136,204,0.2)",
              background: "linear-gradient(135deg, rgba(0,136,204,0.06), rgba(120,110,255,0.06))",
              padding: mob ? "28px 22px" : "52px 60px",
              display: "grid",
              gridTemplateColumns: mob ? "1fr" : "1fr 1fr",
              gap: mob ? 32 : 64,
              alignItems: "center",
            }}
          >
            <div>
              <div style={{ fontSize: 11, letterSpacing: "0.16em", color: "rgba(0,180,255,0.65)", marginBottom: 14 }}>
                LONG RUN · TELEGRAM ALERTS
              </div>
              <h2 style={{ fontSize: mob ? 26 : 36, fontWeight: 900, letterSpacing: "-1px", color: "white", margin: "0 0 16px", lineHeight: 1.15 }}>
                High-value arbs straight to your phone. Before they close.
              </h2>
              <p style={{ fontSize: 15, color: "rgba(255,255,255,0.58)", lineHeight: 1.8, marginBottom: 24 }}>
                The best arbs close in minutes as other bettors move the
                market. Long Run members get an instant Telegram alert the
                moment a high-margin opportunity hits — with the full execution
                card included.
              </p>
              <div style={{ display: "grid", gap: 10, marginBottom: 28 }}>
                {[
                  "Alerts only for arbs above 2% margin",
                  "Full execution card included in message",
                  "Read-only channel — no noise or discussion",
                  "Works on any device with Telegram installed",
                ].map((f) => (
                  <div key={f} style={{ display: "flex", gap: 10, fontSize: 14, color: "rgba(255,255,255,0.75)", alignItems: "center" }}>
                    <span style={{ color: "#9be7bf", fontWeight: 900, flexShrink: 0 }}>✓</span>
                    {f}
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
                }}
              >
                Get Long Run access
              </Link>
            </div>

            {/* Telegram mock */}
            <div
              style={{
                background: "rgba(10,14,20,0.85)",
                border: "1px solid rgba(0,136,204,0.18)",
                borderRadius: 20,
                padding: 20,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16, paddingBottom: 14, borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
                <div style={{ width: 36, height: 36, borderRadius: 999, background: "linear-gradient(135deg, rgba(0,136,204,0.8), rgba(120,110,255,0.8))", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>
                  🎯
                </div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "white" }}>HitBet Alerts</div>
                  <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)" }}>just now</div>
                </div>
                <div style={{ marginLeft: "auto", fontSize: 10, padding: "3px 8px", borderRadius: 999, background: "rgba(0,136,204,0.12)", border: "1px solid rgba(0,136,204,0.22)", color: "rgba(0,200,255,0.85)", fontWeight: 700 }}>
                  LONG RUN
                </div>
              </div>
              <div style={{ fontSize: 13, color: "rgba(255,255,255,0.88)", lineHeight: 1.7 }}>
                <div style={{ marginBottom: 6 }}>⚽ <strong>Arsenal vs Chelsea</strong></div>
                <div style={{ marginBottom: 6 }}>📈 <strong style={{ color: "#9be7bf" }}>3.42% margin</strong> — £17.10 profit @ £500</div>
                <div style={{ marginBottom: 14, color: "rgba(255,255,255,0.45)", fontSize: 12 }}>EPL · Spread · in 45m</div>
                {[
                  { n: "Leg 1 — Bet365", d: "Arsenal -0.5 @ 2.05 · Stake £246" },
                  { n: "Leg 2 — Unibet", d: "Chelsea +0.5 @ 2.10 · Stake £254" },
                ].map((leg) => (
                  <div key={leg.n} style={{ background: "rgba(255,255,255,0.04)", borderRadius: 10, padding: "9px 12px", marginBottom: 6 }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: "white", marginBottom: 2 }}>{leg.n}</div>
                    <div style={{ fontSize: 12, color: "rgba(255,255,255,0.55)" }}>{leg.d}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── TESTIMONIALS ────────────────────────────────────────────────────── */}
        <section style={{ padding: mob ? "48px 0" : "88px 0" }}>
          <div style={{ maxWidth: 520, marginBottom: 44 }}>
            <div style={{ fontSize: 11, letterSpacing: "0.16em", color: "rgba(255,255,255,0.35)", marginBottom: 14 }}>
              EARLY USERS
            </div>
            <h2 style={{ fontSize: mob ? 30 : 40, fontWeight: 900, letterSpacing: "-1px", color: "white", margin: 0, lineHeight: 1.1 }}>
              What people using it say
            </h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: mob ? "1fr" : "repeat(3, minmax(0,1fr))", gap: 14 }}>
            {TESTIMONIALS.map((t) => (
              <div
                key={t.name}
                style={{
                  border: "1px solid rgba(255,255,255,0.08)",
                  background: "rgba(255,255,255,0.02)",
                  borderRadius: 20,
                  padding: 24,
                  display: "flex",
                  flexDirection: "column",
                  gap: 18,
                }}
              >
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 24, color: "rgba(120,110,255,0.5)", lineHeight: 1, marginBottom: 12, fontFamily: "Georgia, serif" }}>"</div>
                  <p style={{ fontSize: 14, color: "rgba(255,255,255,0.72)", lineHeight: 1.8, margin: 0 }}>
                    {t.text}
                  </p>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: 16, borderTop: "1px solid rgba(255,255,255,0.07)" }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: "white" }}>{t.name}</div>
                    <div style={{ fontSize: 12, color: "rgba(255,255,255,0.38)", marginTop: 2 }}>{t.location}</div>
                  </div>
                  <div style={{ fontSize: 11, padding: "4px 9px", borderRadius: 999, border: "1px solid rgba(120,110,255,0.25)", color: "rgba(180,170,255,0.75)", background: "rgba(120,110,255,0.1)", fontWeight: 600 }}>
                    {t.plan}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── PRICING ─────────────────────────────────────────────────────────── */}
        <section
          style={{
            padding: mob ? "48px 0" : "88px 0",
            borderTop: "1px solid rgba(255,255,255,0.06)",
          }}
        >
          <div style={{ maxWidth: 560, marginBottom: 44 }}>
            <div style={{ fontSize: 11, letterSpacing: "0.16em", color: "rgba(255,255,255,0.35)", marginBottom: 14 }}>
              PRICING
            </div>
            <h2 style={{ fontSize: mob ? 30 : 42, fontWeight: 900, letterSpacing: "-1px", color: "white", margin: "0 0 14px", lineHeight: 1.1 }}>
              Start free. Pay when it's working.
            </h2>
            <p style={{ fontSize: 15, color: "rgba(255,255,255,0.55)", lineHeight: 1.75, margin: 0 }}>
              24-hour free trial on every plan. No charge today. Cancels
              automatically if you don't continue.
            </p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: mob ? "1fr" : "repeat(3, minmax(0,1fr))", gap: 14 }}>
            {PLANS.map((p) => (
              <div
                key={p.name}
                style={{
                  position: "relative",
                  border: p.popular ? "1px solid rgba(120,110,255,0.35)" : "1px solid rgba(255,255,255,0.09)",
                  background: "rgba(10,14,20,0.55)",
                  borderRadius: 22,
                  padding: 26,
                  boxShadow: p.popular ? "0 20px 60px rgba(80,60,255,0.18)" : undefined,
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                {p.popular && (
                  <div
                    style={{
                      position: "absolute",
                      top: -13,
                      left: "50%",
                      transform: "translateX(-50%)",
                      fontSize: 10,
                      fontWeight: 800,
                      padding: "4px 14px",
                      borderRadius: 999,
                      background: GRAD,
                      color: "white",
                      letterSpacing: "0.07em",
                      whiteSpace: "nowrap",
                    }}
                  >
                    BEST VALUE
                  </div>
                )}
                <div style={{ fontSize: 17, fontWeight: 800, color: "white", marginBottom: 3 }}>{p.name}</div>
                <div style={{ fontSize: 12, color: "rgba(255,255,255,0.45)", marginBottom: 18 }}>{p.sub}</div>
                <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginBottom: 4 }}>
                  <div style={{ fontSize: 40, fontWeight: 900, letterSpacing: "-1.5px", color: "white", lineHeight: 1 }}>{p.price}</div>
                  <span style={{ fontSize: 13, color: "rgba(255,255,255,0.4)" }}>/week</span>
                </div>
                {p.saving && (
                  <div style={{ fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 999, background: "rgba(0,255,140,0.1)", border: "1px solid rgba(0,255,140,0.2)", color: "#9be7bf", display: "inline-block", marginBottom: 14 }}>
                    {p.saving}
                  </div>
                )}
                <div style={{ height: 1, background: "rgba(255,255,255,0.08)", margin: p.saving ? "0 0 14px" : "14px 0" }} />
                <ul style={{ listStyle: "none", margin: "0 0 22px", padding: 0, display: "grid", gap: 9, flex: 1 }}>
                  {p.features.map((f) => (
                    <li key={f} style={{ display: "flex", gap: 9, fontSize: 13, color: "rgba(255,255,255,0.82)", alignItems: "flex-start" }}>
                      <span style={{ color: "#9be7bf", fontWeight: 900, fontSize: 12, flexShrink: 0, marginTop: 1 }}>✓</span>
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
                    padding: "13px 18px",
                    borderRadius: 13,
                    fontWeight: 800,
                    fontSize: 14,
                    color: "white",
                    background: GRAD,
                    border: "1px solid rgba(120,110,255,0.4)",
                    textDecoration: "none",
                  }}
                >
                  Try free — 24 hours
                </Link>
                <div style={{ marginTop: 10, fontSize: 11, color: "rgba(255,255,255,0.28)", textAlign: "center" }}>
                  Then {p.price}/wk. Cancel anytime.
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── FAQ ─────────────────────────────────────────────────────────────── */}
        <section style={{ padding: mob ? "48px 0" : "88px 0", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: mob ? "1fr" : "300px 1fr",
              gap: mob ? 32 : 80,
            }}
          >
            <div>
              <div style={{ fontSize: 11, letterSpacing: "0.16em", color: "rgba(255,255,255,0.35)", marginBottom: 14 }}>
                FAQ
              </div>
              <h2 style={{ fontSize: mob ? 28 : 36, fontWeight: 900, letterSpacing: "-1px", color: "white", margin: "0 0 14px", lineHeight: 1.15 }}>
                Common questions
              </h2>
              <p style={{ fontSize: 14, color: "rgba(255,255,255,0.45)", lineHeight: 1.75 }}>
                Honest answers. No upsell.
              </p>
            </div>
            <div>
              {FAQS.map((f) => (
                <FaqItem key={f.q} q={f.q} a={f.a} />
              ))}
            </div>
          </div>
        </section>

        {/* ── FOOTER CTA ──────────────────────────────────────────────────────── */}
        <section
          style={{
            padding: mob ? "48px 0 60px" : "88px 0 100px",
            borderTop: "1px solid rgba(255,255,255,0.06)",
            textAlign: "center",
          }}
        >
          <div style={{ fontSize: 11, letterSpacing: "0.16em", color: "rgba(255,255,255,0.3)", marginBottom: 18 }}>
            GET STARTED
          </div>
          <h2
            style={{
              fontSize: mob ? 30 : 48,
              fontWeight: 900,
              letterSpacing: "-1.5px",
              color: "white",
              margin: "0 0 16px",
              lineHeight: 1.08,
            }}
          >
            The maths is either there{" "}
            <br />
            <span style={{ background: GRAD, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
              or it isn't.
            </span>
          </h2>
          <p
            style={{
              fontSize: 16,
              color: "rgba(255,255,255,0.55)",
              lineHeight: 1.75,
              maxWidth: 460,
              margin: "0 auto 32px",
            }}
          >
            Every arbitrage on HitBet is a verified pricing inefficiency. If
            you place both legs at the shown odds, the profit is guaranteed by
            mathematics alone — not opinion, not prediction.
          </p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <Link
              href="/pricing"
              style={{
                display: "inline-flex",
                alignItems: "center",
                padding: "14px 28px",
                borderRadius: 14,
                fontWeight: 800,
                fontSize: 16,
                color: "white",
                background: GRAD,
                border: "1px solid rgba(120,110,255,0.4)",
                textDecoration: "none",
                boxShadow: "0 8px 40px rgba(80,60,255,0.3)",
              }}
            >
              Start 24-hour free trial
            </Link>
            <Link
              href="/dashboard"
              style={{
                display: "inline-flex",
                alignItems: "center",
                padding: "14px 24px",
                borderRadius: 14,
                fontWeight: 700,
                fontSize: 16,
                color: "rgba(255,255,255,0.75)",
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.1)",
                textDecoration: "none",
              }}
            >
              View live feed
            </Link>
          </div>
          <div style={{ marginTop: 18, fontSize: 12, color: "rgba(255,255,255,0.28)" }}>
            24-hour trial · Card required · Cancels automatically if not continued
          </div>
        </section>

      </div>
    </div>
  );
}
