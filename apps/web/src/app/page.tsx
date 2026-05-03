"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";

// ─── Design Tokens ─────────────────────────────────────────────────────────────
const G   = "linear-gradient(135deg, #7c3aed 0%, #22d3ee 100%)";
const GT  = "linear-gradient(95deg, #7c3aed 0%, #22d3ee 100%)";
const GB  = "linear-gradient(135deg, rgba(124,58,237,0.95) 0%, rgba(34,211,238,0.85) 100%)";
const CARD_BG      = "rgba(8,12,22,0.72)";
const BORDER       = "rgba(255,255,255,0.08)";
const BORDER_P     = "rgba(124,58,237,0.28)";
const TEXT_MUTED   = "rgba(255,255,255,0.55)";
const TEXT_DIM     = "rgba(255,255,255,0.32)";
const EM           = "#10b981";
const EM_DIM       = "rgba(16,185,129,0.09)";
const EM_BORDER    = "rgba(16,185,129,0.2)";
const EASE         = [0.16, 1, 0.3, 1] as const;

// ─── Data ──────────────────────────────────────────────────────────────────────

const LIVE_ARBS = [
  { event: "Arsenal vs Chelsea",     sport: "EPL",     margin: "3.42%", profit: "£17.10", book1: "Bet365",       book2: "Unibet"   },
  { event: "Lakers vs Celtics",      sport: "NBA",     margin: "2.88%", profit: "£14.40", book1: "William Hill", book2: "Betway"   },
  { event: "Djokovic vs Alcaraz",    sport: "ATP",     margin: "2.11%", profit: "£10.55", book1: "Paddy Power",  book2: "Betfair"  },
  { event: "Man City vs Liverpool",  sport: "EPL",     margin: "1.74%", profit: "£8.70",  book1: "888sport",     book2: "Coral"    },
  { event: "Sinner vs Zverev",       sport: "ATP",     margin: "1.31%", profit: "£6.55",  book1: "Ladbrokes",    book2: "Betfair"  },
  { event: "Real Madrid vs Barca",   sport: "La Liga", margin: "2.55%", profit: "£12.75", book1: "Bet365",       book2: "Betfair"  },
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
    bg: "rgba(124,58,237,0.07)",
    border: "rgba(124,58,237,0.2)",
    glow: "rgba(124,58,237,0.15)",
  },
  {
    tag: "Regular bettors",
    headline: "Already know the books?",
    body: "You'll recognise the opportunities immediately. The feed shows exactly which two books are mispriced and by how much. Filter by your books and you only see arbs you can actually place.",
    bg: "rgba(34,211,238,0.05)",
    border: "rgba(34,211,238,0.18)",
    glow: "rgba(34,211,238,0.12)",
  },
  {
    tag: "Quantitative approach",
    headline: "Running your own model?",
    body: "The Long Run value feed surfaces every EV-positive opportunity against sharp exchange prices. Use it to cross-reference your own selections or as a standalone positive-EV signal.",
    bg: "rgba(16,185,129,0.05)",
    border: "rgba(16,185,129,0.18)",
    glow: "rgba(16,185,129,0.12)",
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
    features: ["Long Run watchlist (positive EV)", "3-way football arbs (1X2)", "Telegram alerts", "Kelly criterion stakes", "Exchange price comparison"],
    popular: false,
  },
  {
    name: "Both Plans",
    price: "£19.99",
    plan: "both",
    sub: "Complete edge toolkit",
    features: ["Full 2-way arb feed", "Long Run watchlist + EV bets", "3-way football arbs", "Telegram alerts", "Step-by-step placement", "Kelly criterion stakes"],
    popular: true,
    saving: "Save £5/wk",
  },
];

const FEATURES = [
  {
    icon: "⚡",
    title: "30-second refresh",
    body: "Live odds pulled from 40+ bookmaker feeds every 30 seconds. Opportunities appear and close fast — we catch them the moment they open.",
    accent: "rgba(124,58,237,0.12)",
    accentBorder: "rgba(124,58,237,0.22)",
    accentText: "rgba(190,170,255,0.9)",
  },
  {
    icon: "▣",
    title: "Execution cards",
    body: "Every arb surfaces as a clear card: bookmaker, selection, exact stake, minimum odds. No calculation required — just follow the steps.",
    accent: "rgba(34,211,238,0.08)",
    accentBorder: "rgba(34,211,238,0.18)",
    accentText: "rgba(100,220,255,0.9)",
  },
  {
    icon: "∑",
    title: "Mathematical edge",
    body: "Opportunities are flagged only when implied probabilities sum below 100% — the only mathematically verifiable definition of a guaranteed arb.",
    accent: "rgba(16,185,129,0.08)",
    accentBorder: "rgba(16,185,129,0.18)",
    accentText: "rgba(100,220,160,0.9)",
  },
  {
    icon: "🎯",
    title: "Telegram alerts",
    body: "High-margin arbs (2%+) push directly to your phone the instant they're detected. Full execution card included — act before the market closes.",
    accent: "rgba(34,211,238,0.08)",
    accentBorder: "rgba(34,211,238,0.18)",
    accentText: "rgba(100,200,255,0.9)",
  },
  {
    icon: "◉",
    title: "Exchange benchmark",
    body: "Long Run value bets are benchmarked against sharp exchange prices (Betfair, Smarkets) — the most accurate measure of true probability available.",
    accent: "rgba(124,58,237,0.08)",
    accentBorder: "rgba(124,58,237,0.18)",
    accentText: "rgba(180,160,255,0.9)",
  },
  {
    icon: "◈",
    title: "Books filter",
    body: "Only see arbs across books you actually have accounts with. No phantom opportunities — every arb you see is one you can realistically place.",
    accent: "rgba(16,185,129,0.06)",
    accentBorder: "rgba(16,185,129,0.16)",
    accentText: "rgba(100,210,160,0.9)",
  },
];

// ─── Animation helpers ──────────────────────────────────────────────────────────

function FadeUp({
  children,
  delay = 0,
  style,
}: {
  children: React.ReactNode;
  delay?: number;
  style?: React.CSSProperties;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.7, delay, ease: EASE }}
      style={style}
    >
      {children}
    </motion.div>
  );
}

function Stagger({
  children,
  gap = 0.09,
  style,
}: {
  children: React.ReactNode;
  gap?: number;
  style?: React.CSSProperties;
}) {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-80px" }}
      variants={{ hidden: {}, visible: { transition: { staggerChildren: gap } } }}
      style={style}
    >
      {children}
    </motion.div>
  );
}

const cardItem = {
  hidden:  { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE } },
};

// ─── CountUp ───────────────────────────────────────────────────────────────────

function CountUp({ end, suffix = "", decimals = 0 }: { end: number; suffix?: string; decimals?: number }) {
  const [val, setVal] = useState(0);
  const spanRef = useRef<HTMLSpanElement>(null);
  const seen = useInView(spanRef, { once: true, margin: "-80px" });

  useEffect(() => {
    if (!seen) return;
    let start: number | null = null;
    const dur = 1400;
    const tick = (ts: number) => {
      if (!start) start = ts;
      const p = Math.min((ts - start) / dur, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setVal(end * eased);
      if (p < 1) requestAnimationFrame(tick);
      else setVal(end);
    };
    requestAnimationFrame(tick);
  }, [seen, end]);

  return <span ref={spanRef}>{val.toFixed(decimals)}{suffix}</span>;
}

// ─── Shared atoms ──────────────────────────────────────────────────────────────

const gradStyle: React.CSSProperties = {
  background: GT,
  WebkitBackgroundClip: "text",
  WebkitTextFillColor: "transparent",
  backgroundClip: "text",
};

function GradText({ children }: { children: React.ReactNode }) {
  return <span style={gradStyle}>{children}</span>;
}

function Label({ children, color }: { children: React.ReactNode; color?: string }) {
  return (
    <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.16em", color: color ?? TEXT_DIM, margin: "0 0 18px" }}>
      {children}
    </p>
  );
}

function LiveDot() {
  return (
    <motion.span
      style={{ width: 7, height: 7, borderRadius: 999, background: "#22c55e", boxShadow: "0 0 10px #22c55e", display: "inline-block", flexShrink: 0 }}
      animate={{ opacity: [1, 0.3, 1], scale: [1, 1.2, 1] }}
      transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
    />
  );
}

// ─── Ticker ────────────────────────────────────────────────────────────────────

function TickerRow() {
  const [offset, setOffset] = useState(0);
  const pos = useRef(0);
  const raf = useRef<number>(0);
  const CARD_W = 276;
  const GAP = 12;

  useEffect(() => {
    const tick = () => {
      pos.current += 0.44;
      setOffset(pos.current);
      raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf.current);
  }, []);

  const items = [...LIVE_ARBS, ...LIVE_ARBS, ...LIVE_ARBS];
  const x = -(pos.current % (LIVE_ARBS.length * (CARD_W + GAP)));

  return (
    <div style={{ position: "relative", overflow: "hidden" }}>
      <div style={{ display: "flex", gap: GAP, willChange: "transform", transform: `translateX(${x}px)` }}>
        {items.map((a, i) => (
          <div
            key={i}
            style={{
              minWidth: CARD_W,
              border: `1px solid ${BORDER}`,
              background: CARD_BG,
              borderRadius: 14,
              padding: "14px 18px",
              flexShrink: 0,
              backdropFilter: "blur(12px)",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 7, gap: 10 }}>
              <div style={{ fontSize: 12.5, fontWeight: 700, color: "white", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                {a.event}
              </div>
              <div style={{
                fontSize: 12,
                fontWeight: 900,
                color: EM,
                background: EM_DIM,
                border: `1px solid ${EM_BORDER}`,
                padding: "2px 9px",
                borderRadius: 7,
                letterSpacing: "-0.3px",
                flexShrink: 0,
              }}>
                +{a.margin}
              </div>
            </div>
            <div style={{ fontSize: 11, color: TEXT_DIM }}>
              {a.sport} · {a.profit} · {a.book1} / {a.book2}
            </div>
          </div>
        ))}
      </div>
      <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 120, background: "linear-gradient(90deg, #05060a 30%, transparent)", pointerEvents: "none" }} />
      <div style={{ position: "absolute", right: 0, top: 0, bottom: 0, width: 120, background: "linear-gradient(270deg, #05060a 30%, transparent)", pointerEvents: "none" }} />
    </div>
  );
}

// ─── FAQ ───────────────────────────────────────────────────────────────────────

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div
      style={{ borderBottom: `1px solid ${BORDER}`, cursor: "pointer" }}
      onClick={() => setOpen((v) => !v)}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "22px 0", gap: 18 }}>
        <span style={{ fontSize: 15, fontWeight: 700, color: "white", lineHeight: 1.4 }}>{q}</span>
        <motion.span
          animate={{ rotate: open ? 45 : 0 }}
          transition={{ duration: 0.22 }}
          style={{ fontSize: 22, color: TEXT_DIM, flexShrink: 0, fontWeight: 300, lineHeight: 1 }}
        >
          +
        </motion.span>
      </div>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="body"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.34, ease: EASE }}
            style={{ overflow: "hidden" }}
          >
            <p style={{ fontSize: 14.5, lineHeight: 1.82, color: TEXT_MUTED, paddingBottom: 22, maxWidth: 680, margin: 0 }}>
              {a}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Mobile hook ───────────────────────────────────────────────────────────────

function useIsMobile() {
  const [mob, setMob] = useState(false);
  useEffect(() => {
    const check = () => setMob(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);
  return mob;
}

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function Home() {
  const mob = useIsMobile();
  const cols3 = mob ? "1fr" : "repeat(3,minmax(0,1fr))";
  const cols2 = mob ? "1fr" : "1fr 1fr";
  const sec  = { padding: mob ? "64px 0" : "112px 0" };

  return (
    <div className="narrowPage">
      <div style={{ width: "100%" }}>

        {/* ═══════════════════════ HERO ═══════════════════════════════════════ */}
        <section style={{
          display: "grid",
          gridTemplateColumns: mob ? "1fr" : "1fr 440px",
          gap: mob ? 48 : 72,
          alignItems: "center",
          padding: mob ? "52px 0 44px" : "100px 0 84px",
        }}>
          {/* LEFT */}
          <div>
            {/* Eyebrow */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.05, ease: EASE }}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 9,
                fontSize: 11,
                letterSpacing: "0.14em",
                color: TEXT_DIM,
                marginBottom: 28,
                padding: "7px 14px",
                border: `1px solid ${BORDER}`,
                borderRadius: 999,
                background: "rgba(255,255,255,0.03)",
              }}
            >
              <LiveDot />
              LIVE · 40+ BOOKS · REFRESHES EVERY 30S
            </motion.div>

            {/* H1 */}
            <motion.h1
              initial={{ opacity: 0, y: 28 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.75, delay: 0.15, ease: EASE }}
              style={{
                fontSize: mob ? 42 : 76,
                fontWeight: 900,
                lineHeight: 1.03,
                letterSpacing: mob ? "-1.2px" : "-3px",
                margin: "0 0 26px",
                color: "white",
              }}
            >
              The odds don&apos;t{" "}
              <GradText>add up.</GradText>
              <br />
              That&apos;s your profit.
            </motion.h1>

            {/* Sub */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.28, ease: EASE }}
              style={{
                fontSize: mob ? 15 : 17.5,
                lineHeight: 1.8,
                color: TEXT_MUTED,
                maxWidth: 520,
                margin: "0 0 38px",
              }}
            >
              HitBet scans 40+ UK sportsbooks every 30 seconds and surfaces
              real arbitrage opportunities — situations where the combined odds
              guarantee a profit regardless of the outcome. No prediction. No
              luck. Pure mathematics.
            </motion.p>

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.38, ease: EASE }}
              style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center", marginBottom: 20 }}
            >
              <motion.div whileHover={{ scale: 1.03, y: -2 }} whileTap={{ scale: 0.97 }} transition={{ type: "spring", stiffness: 400, damping: 17 }}>
                <Link
                  href="/pricing"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: "14px 28px",
                    borderRadius: 14,
                    fontWeight: 800,
                    fontSize: 15,
                    color: "white",
                    background: GB,
                    border: "1px solid rgba(124,58,237,0.4)",
                    textDecoration: "none",
                    boxShadow: "0 10px 40px rgba(80,50,255,0.32), 0 0 0 1px rgba(124,58,237,0.15)",
                    letterSpacing: "-0.2px",
                  }}
                >
                  Try free for 24 hours
                </Link>
              </motion.div>
              <motion.div whileHover={{ x: 4 }} transition={{ type: "spring", stiffness: 400, damping: 25 }}>
                <Link
                  href="/dashboard"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 7,
                    padding: "14px 22px",
                    borderRadius: 14,
                    fontWeight: 700,
                    fontSize: 15,
                    color: "rgba(255,255,255,0.7)",
                    background: "rgba(255,255,255,0.04)",
                    border: `1px solid ${BORDER}`,
                    textDecoration: "none",
                    letterSpacing: "-0.2px",
                  }}
                >
                  See live feed <span style={{ opacity: 0.55, fontSize: 17 }}>→</span>
                </Link>
              </motion.div>
            </motion.div>

            {/* Trust */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              style={{ fontSize: 12, color: TEXT_DIM, display: "flex", gap: 18, flexWrap: "wrap" }}
            >
              <span>✓ Card required, £0 charged today</span>
              <span>✓ Cancel before 24 hours, pay nothing</span>
            </motion.div>
          </div>

          {/* RIGHT: Hero arb card */}
          {!mob && (
            <motion.div
              initial={{ opacity: 0, x: 44, y: 20 }}
              animate={{ opacity: 1, x: 0, y: 0 }}
              transition={{ duration: 0.95, delay: 0.3, ease: EASE }}
            >
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 6.5, repeat: Infinity, ease: "easeInOut" }}
                style={{
                  border: `1px solid ${BORDER_P}`,
                  background: CARD_BG,
                  borderRadius: 26,
                  padding: 28,
                  backdropFilter: "blur(28px)",
                  boxShadow: "0 48px 120px rgba(50,30,200,0.26), 0 0 0 1px rgba(124,58,237,0.08)",
                }}
              >
                {/* Header */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
                  <div>
                    <div style={{ fontSize: 10, letterSpacing: "0.14em", color: TEXT_DIM, marginBottom: 5 }}>LIVE ARB DETECTED</div>
                    <div style={{ fontSize: 20, fontWeight: 800, color: "white", letterSpacing: "-0.6px" }}>Arsenal vs Chelsea</div>
                    <div style={{ fontSize: 12, color: TEXT_MUTED, marginTop: 3 }}>EPL · Spread · in 45m</div>
                  </div>
                  <div style={{
                    fontSize: 21,
                    fontWeight: 900,
                    padding: "8px 14px",
                    borderRadius: 12,
                    background: EM_DIM,
                    border: `1px solid ${EM_BORDER}`,
                    color: EM,
                    letterSpacing: "-0.6px",
                    boxShadow: "0 0 24px rgba(16,185,129,0.18)",
                  }}>
                    +3.42%
                  </div>
                </div>
                <div style={{ height: 1, background: BORDER, marginBottom: 18 }} />
                {/* Legs */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 18 }}>
                  {[
                    { book: "Bet365", pick: "Arsenal -0.5", odds: "2.05", stake: "£246", step: "1" },
                    { book: "Unibet",  pick: "Chelsea +0.5", odds: "2.10", stake: "£254", step: "2" },
                  ].map((leg) => (
                    <div
                      key={leg.book}
                      style={{ border: `1px solid ${BORDER}`, background: "rgba(255,255,255,0.025)", borderRadius: 16, padding: 16 }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                        <div style={{ fontSize: 13, fontWeight: 700, color: "white" }}>{leg.book}</div>
                        <div style={{ fontSize: 10, padding: "2px 7px", borderRadius: 6, background: "rgba(124,58,237,0.2)", color: "rgba(195,185,255,0.9)", fontWeight: 800 }}>
                          STEP {leg.step}
                        </div>
                      </div>
                      <div style={{ fontSize: 12, color: TEXT_MUTED, marginBottom: 6 }}>{leg.pick}</div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: "rgba(160,190,255,0.9)", marginBottom: 4 }}>@ {leg.odds}</div>
                      <div style={{ fontSize: 17, fontWeight: 900, color: "white" }}>{leg.stake}</div>
                    </div>
                  ))}
                </div>
                {/* Profit */}
                <div style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "14px 18px",
                  borderRadius: 14,
                  background: EM_DIM,
                  border: `1px solid ${EM_BORDER}`,
                }}>
                  <span style={{ fontSize: 13, color: TEXT_MUTED }}>Total staked: £500</span>
                  <span style={{ fontSize: 15, fontWeight: 900, color: EM, letterSpacing: "-0.4px" }}>+£17.10 guaranteed</span>
                </div>
                <div style={{ marginTop: 14, fontSize: 11, color: TEXT_DIM, textAlign: "center" }}>
                  Profit locked in before kick-off · regardless of result
                </div>
              </motion.div>
            </motion.div>
          )}
        </section>

        {/* ═══════════════════════ TICKER ══════════════════════════════════════ */}
        <div style={{ paddingBottom: 76, overflow: "hidden" }}>
          <div style={{ fontSize: 10, letterSpacing: "0.18em", color: TEXT_DIM, marginBottom: 12, fontWeight: 700 }}>
            SAMPLE FROM LIVE FEED
          </div>
          <TickerRow />
        </div>

        {/* ═══════════════════════ PERFORMANCE BAR ════════════════════════════ */}
        <FadeUp>
          <section style={{
            display: "grid",
            gridTemplateColumns: mob ? "repeat(2,1fr)" : "repeat(4,minmax(0,1fr))",
            marginBottom: mob ? 64 : 112,
            border: `1px solid ${BORDER}`,
            borderRadius: 22,
            overflow: "hidden",
            background: "rgba(255,255,255,0.018)",
            backdropFilter: "blur(10px)",
          }}>
            {[
              { label: "UK bookmakers scanned",  num: 40,  suffix: "+", noCount: false },
              { label: "Data refresh interval",  num: 30,  suffix: "s", noCount: false },
              { label: "Typical arb margins",    value: "0.5–8%",       noCount: true  },
              { label: "Live arbs at any time",  value: "2–15",         noCount: true  },
            ].map((s, i) => (
              <div
                key={s.label}
                style={{
                  padding: mob ? "24px 18px" : "30px 34px",
                  borderRight: i < 3 ? `1px solid ${BORDER}` : "none",
                  borderBottom: mob && i < 2 ? `1px solid ${BORDER}` : "none",
                }}
              >
                <div style={{ fontSize: mob ? 30 : 38, fontWeight: 900, letterSpacing: "-1.8px", color: "white", marginBottom: 7, lineHeight: 1 }}>
                  {s.noCount ? s.value : <CountUp end={s.num!} suffix={s.suffix} />}
                </div>
                <div style={{ fontSize: 12.5, color: TEXT_MUTED }}>{s.label}</div>
              </div>
            ))}
          </section>
        </FadeUp>

        {/* ═══════════════════════ HOW IT WORKS ═══════════════════════════════ */}
        <section style={sec}>
          <FadeUp>
            <div style={{ maxWidth: 620, marginBottom: 56 }}>
              <Label>HOW IT WORKS</Label>
              <h2 style={{
                fontSize: mob ? 34 : 50,
                fontWeight: 900,
                letterSpacing: "-1.8px",
                color: "white",
                margin: "0 0 20px",
                lineHeight: 1.06,
              }}>
                Signal to profit<br />in three steps
              </h2>
              <p style={{ fontSize: 16, color: TEXT_MUTED, lineHeight: 1.78, margin: 0 }}>
                We do the scanning and the maths. You do the placement.
              </p>
            </div>
          </FadeUp>

          <Stagger style={{ display: "grid", gridTemplateColumns: cols3, gap: 14 }}>
            {[
              { n: "01", title: "We scan",    body: "Live odds pulled from 40+ UK bookmakers every 30 seconds, across every available sport and market.", numColor: "rgba(180,160,255,0.18)", hoverBorder: "rgba(124,58,237,0.3)" },
              { n: "02", title: "We detect",  body: "Our engine calculates the combined implied probability across the best available odds. When it drops below 100%, that gap is guaranteed profit.", numColor: "rgba(80,220,255,0.14)", hoverBorder: "rgba(34,211,238,0.3)" },
              { n: "03", title: "You execute",body: "A clean card tells you which books, which outcomes, and exactly how much to stake. Place both legs. Profit locked in.", numColor: "rgba(80,210,160,0.14)", hoverBorder: "rgba(16,185,129,0.28)" },
            ].map((h) => (
              <motion.div
                key={h.n}
                variants={cardItem}
                whileHover={{ y: -6, boxShadow: "0 24px 64px rgba(0,0,0,0.35)", borderColor: h.hoverBorder }}
                transition={{ type: "spring", stiffness: 260, damping: 18 }}
                style={{
                  border: `1px solid ${BORDER}`,
                  background: "rgba(255,255,255,0.02)",
                  borderRadius: 24,
                  padding: 32,
                  position: "relative",
                  overflow: "hidden",
                  cursor: "default",
                }}
              >
                <div style={{
                  position: "absolute",
                  top: -20,
                  right: -10,
                  fontSize: 96,
                  fontWeight: 900,
                  color: h.numColor,
                  lineHeight: 1,
                  pointerEvents: "none",
                  fontFamily: "monospace",
                  userSelect: "none",
                }}>
                  {h.n}
                </div>
                <div style={{ fontSize: 22, fontWeight: 800, color: "white", marginBottom: 14, position: "relative", letterSpacing: "-0.4px" }}>
                  {h.title}
                </div>
                <div style={{ fontSize: 14.5, color: TEXT_MUTED, lineHeight: 1.78, position: "relative" }}>
                  {h.body}
                </div>
              </motion.div>
            ))}
          </Stagger>
        </section>

        {/* ═══════════════════════ EXECUTION CARD DEMO ════════════════════════ */}
        <section style={{ ...sec, borderTop: `1px solid ${BORDER}`, borderBottom: `1px solid ${BORDER}` }}>
          <div style={{ display: "grid", gridTemplateColumns: cols2, gap: mob ? 44 : 80, alignItems: "center" }}>
            {/* Left */}
            <FadeUp>
              <Label>EXECUTION CARD</Label>
              <h2 style={{ fontSize: mob ? 30 : 44, fontWeight: 900, letterSpacing: "-1.5px", color: "white", margin: "0 0 20px", lineHeight: 1.08 }}>
                Everything you need.<br />Nothing you don&apos;t.
              </h2>
              <p style={{ fontSize: 15.5, color: TEXT_MUTED, lineHeight: 1.82, marginBottom: 28 }}>
                Every arb surfaces as a single card. Which bookmaker. Which selection.
                Exactly how much to stake. What odds to accept as a minimum. Place
                both legs in sequence and profit is locked in before the event starts.
              </p>
              <div style={{ display: "grid", gap: 11, marginBottom: 34 }}>
                {[
                  "Exact stake split calculated from your bankroll",
                  "Step-by-step placement order to avoid odds moving",
                  "Market and settlement rules explained clearly",
                  "Guaranteed profit shown before you place",
                ].map((c) => (
                  <div key={c} style={{ display: "flex", gap: 11, fontSize: 14.5, color: "rgba(255,255,255,0.8)", alignItems: "flex-start" }}>
                    <span style={{ color: EM, fontWeight: 900, flexShrink: 0, marginTop: 2, fontSize: 14 }}>✓</span>
                    {c}
                  </div>
                ))}
              </div>
              <motion.div whileHover={{ scale: 1.02, y: -2 }} whileTap={{ scale: 0.98 }} transition={{ type: "spring", stiffness: 400, damping: 17 }}>
                <Link
                  href="/pricing"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    padding: "14px 26px",
                    borderRadius: 14,
                    fontWeight: 800,
                    fontSize: 15,
                    color: "white",
                    background: GB,
                    border: "1px solid rgba(124,58,237,0.4)",
                    textDecoration: "none",
                    boxShadow: "0 8px 32px rgba(80,50,255,0.26)",
                    letterSpacing: "-0.2px",
                  }}
                >
                  Start 24-hour trial
                </Link>
              </motion.div>
            </FadeUp>

            {/* Right: card demo */}
            <FadeUp delay={0.12}>
              <div style={{
                border: `1px solid ${BORDER_P}`,
                background: CARD_BG,
                borderRadius: 24,
                padding: 24,
                backdropFilter: "blur(16px)",
                boxShadow: "0 32px 80px rgba(40,20,180,0.2)",
              }}>
                <div style={{ fontSize: 18, fontWeight: 800, color: "white", marginBottom: 3, letterSpacing: "-0.5px" }}>Man City vs Liverpool</div>
                <div style={{ fontSize: 12, color: TEXT_MUTED, marginBottom: 18 }}>EPL · Spread · tomorrow 17:30</div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 16 }}>
                  {[
                    { book: "888sport", pick: "Man City -0.5", odds: "2.15", stake: "£238", step: "1", wait: false },
                    { book: "Coral",    pick: "Liverpool +0.5", odds: "2.05", stake: "£262", step: "2", wait: true  },
                  ].map((leg) => (
                    <div key={leg.book} style={{ border: `1px solid ${BORDER}`, background: "rgba(255,255,255,0.025)", borderRadius: 15, padding: 14 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 7 }}>
                        <div style={{ fontSize: 13, fontWeight: 700, color: "white" }}>{leg.book}</div>
                        <div style={{ fontSize: 10, padding: "2px 6px", borderRadius: 6, background: "rgba(124,58,237,0.2)", color: "rgba(195,185,255,0.9)", fontWeight: 800 }}>
                          {leg.step}
                        </div>
                      </div>
                      <div style={{ fontSize: 12, color: TEXT_MUTED, marginBottom: 6 }}>{leg.pick}</div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: "rgba(160,190,255,0.9)", marginBottom: 4 }}>@ {leg.odds}</div>
                      <div style={{ fontSize: 16, fontWeight: 900, color: "white" }}>{leg.stake}</div>
                      {leg.wait && (
                        <div style={{ fontSize: 10, marginTop: 7, color: "rgba(245,158,11,0.85)", fontWeight: 700 }}>⏱ Wait 20–30s first</div>
                      )}
                    </div>
                  ))}
                </div>
                <div style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "13px 16px",
                  borderRadius: 13,
                  background: EM_DIM,
                  border: `1px solid ${EM_BORDER}`,
                }}>
                  <span style={{ fontSize: 13, color: TEXT_MUTED }}>Total: £500</span>
                  <span style={{ fontSize: 15, fontWeight: 900, color: EM, letterSpacing: "-0.3px" }}>+£8.70 guaranteed</span>
                </div>
              </div>
            </FadeUp>
          </div>
        </section>

        {/* ═══════════════════════ LONG RUN EDGE ══════════════════════════════ */}
        <section style={sec}>
          <FadeUp>
            <div style={{ maxWidth: 640, marginBottom: 52 }}>
              <Label color="rgba(34,211,238,0.6)">LONG RUN PLAN</Label>
              <h2 style={{ fontSize: mob ? 32 : 48, fontWeight: 900, letterSpacing: "-1.8px", color: "white", margin: "0 0 20px", lineHeight: 1.06 }}>
                The house always wins<br />because of the edge.{" "}
                <GradText>Now you have one.</GradText>
              </h2>
              <p style={{ fontSize: 15.5, color: TEXT_MUTED, lineHeight: 1.82, margin: 0 }}>
                When sharp exchange markets move, soft bookmakers lag behind. That window of
                mispricing — where a soft book overprices an outcome relative to the true market
                — is a positive expected value bet. We find it automatically, every day.
              </p>
            </div>
          </FadeUp>

          <Stagger style={{ display: "grid", gridTemplateColumns: cols2, gap: 14, marginBottom: 20 }}>
            {/* Without edge */}
            <motion.div
              variants={cardItem}
              style={{ border: `1px solid ${BORDER}`, background: "rgba(10,14,20,0.5)", borderRadius: 22, padding: 26 }}
            >
              <div style={{ fontSize: 13, fontWeight: 700, color: "rgba(248,113,113,0.75)", marginBottom: 20 }}>
                Without edge — bookmaker wins long term
              </div>
              {[
                { label: "True probability", value: "50%", pct: 50, bar: "rgba(255,255,255,0.25)", text: "rgba(255,255,255,0.65)" },
                { label: "Implied by bookie odds (@ 1.90)", value: "52.6%", pct: 52.6, bar: "rgba(248,113,113,0.55)", text: "#f87171" },
              ].map((r) => (
                <AnimatedBar key={r.label} {...r} />
              ))}
              <div style={{ padding: "11px 15px", borderRadius: 11, background: "rgba(248,113,113,0.07)", border: "1px solid rgba(248,113,113,0.15)", fontSize: 13, color: "rgba(248,113,113,0.88)", marginTop: 10 }}>
                −2.6% edge — losing position over volume
              </div>
            </motion.div>

            {/* With edge */}
            <motion.div
              variants={cardItem}
              style={{ border: "1px solid rgba(34,211,238,0.18)", background: "rgba(34,211,238,0.03)", borderRadius: 22, padding: 26 }}
            >
              <div style={{ fontSize: 13, fontWeight: 700, color: "rgba(34,211,238,0.75)", marginBottom: 20 }}>
                With Long Run edge — you hold the advantage
              </div>
              {[
                { label: "True probability (exchange)", value: "50%", pct: 50, bar: "rgba(255,255,255,0.25)", text: "rgba(255,255,255,0.65)" },
                { label: "Soft book price (@ 2.20)", value: "45.5%", pct: 45.5, bar: "rgba(16,185,129,0.5)", text: EM },
              ].map((r) => (
                <AnimatedBar key={r.label} {...r} />
              ))}
              <div style={{ padding: "11px 15px", borderRadius: 11, background: EM_DIM, border: `1px solid ${EM_BORDER}`, fontSize: 13, color: EM, marginTop: 10 }}>
                +10% expected value — winning position over volume
              </div>
            </motion.div>
          </Stagger>

          <Stagger style={{ display: "grid", gridTemplateColumns: cols3, gap: 12, marginTop: 8 }}>
            {[
              { title: "Maths, not prediction", body: "A +10% edge on 100 bets at £50 each gives an expected profit of £500 — independent of which individual bets win or lose." },
              { title: "Sharp money leads soft books", body: "When exchange prices move on sharp action, soft bookmakers lag. That lag is the window of mispricing. We monitor both simultaneously." },
              { title: "Volume realises the edge", body: "A single value bet has variance. Fifty value bets at +10% edge do not. The Long Run plan is built for consistent, high-volume execution." },
            ].map(({ title, body }) => (
              <motion.div
                key={title}
                variants={cardItem}
                style={{ border: `1px solid ${BORDER}`, background: "rgba(255,255,255,0.02)", borderRadius: 18, padding: 24 }}
              >
                <div style={{ fontSize: 15, fontWeight: 800, color: "white", marginBottom: 11, letterSpacing: "-0.3px" }}>{title}</div>
                <div style={{ fontSize: 14, color: TEXT_MUTED, lineHeight: 1.78 }}>{body}</div>
              </motion.div>
            ))}
          </Stagger>
        </section>

        {/* ═══════════════════════ METHODOLOGY ════════════════════════════════ */}
        <section style={{ ...sec, borderTop: `1px solid ${BORDER}`, borderBottom: `1px solid ${BORDER}` }}>
          <div style={{ display: "grid", gridTemplateColumns: cols2, gap: mob ? 44 : 80, alignItems: "start" }}>
            <FadeUp>
              <Label>METHODOLOGY</Label>
              <h2 style={{ fontSize: mob ? 30 : 42, fontWeight: 900, letterSpacing: "-1.4px", color: "white", margin: "0 0 22px", lineHeight: 1.1 }}>
                Transparent<br />by design
              </h2>
              <p style={{ fontSize: 15.5, color: TEXT_MUTED, lineHeight: 1.84, marginBottom: 22 }}>
                Every arbitrage HitBet surfaces is based on one mathematically verifiable fact:
                the implied probabilities across the best available odds sum to less than 100%.
              </p>
              <p style={{ fontSize: 15.5, color: TEXT_MUTED, lineHeight: 1.84, marginBottom: 22 }}>
                In a fair market, implied probabilities always sum to exactly 100%. Bookmakers
                build their margin in by inflating this to 103–107%. When we find the sum dropping{" "}
                <em>below</em> 100% across different books, that gap is real, extractable profit.
              </p>
              <p style={{ fontSize: 15.5, color: TEXT_MUTED, lineHeight: 1.84 }}>
                Odds data is sourced live from{" "}
                <span style={{ color: "rgba(255,255,255,0.85)", fontWeight: 600 }}>The Odds API</span>,
                which aggregates prices directly from bookmaker feeds. We recalculate overrounds
                across all markets every 30 seconds.
              </p>
            </FadeUp>

            <Stagger style={{ display: "grid", gap: 10 }}>
              {[
                { label: "DATA SOURCE",     value: "The Odds API — live bookmaker feeds",          icon: "⚡", ic: "rgba(124,58,237,0.18)", ib: "rgba(124,58,237,0.25)", it: "rgba(195,185,255,0.9)" },
                { label: "DETECTION",       value: "Implied probability overround < 100%",          icon: "∑",  ic: "rgba(34,211,238,0.12)", ib: "rgba(34,211,238,0.22)", it: "rgba(100,220,255,0.9)" },
                { label: "REFRESH",         value: "Every 30 seconds, all markets",                 icon: "↻",  ic: "rgba(16,185,129,0.1)",  ib: "rgba(16,185,129,0.2)",  it: "rgba(100,210,160,0.9)" },
                { label: "BOOKS MONITORED", value: "40+ UK-licensed bookmakers and exchanges",      icon: "◉",  ic: "rgba(124,58,237,0.12)", ib: "rgba(124,58,237,0.2)",  it: "rgba(195,185,255,0.9)" },
                { label: "VALUE BENCHMARK", value: "Sharp exchange prices (Betfair, Smarkets)",     icon: "▲",  ic: "rgba(34,211,238,0.1)",  ib: "rgba(34,211,238,0.18)", it: "rgba(100,220,255,0.9)" },
              ].map(({ label, value, icon, ic, ib, it }) => (
                <motion.div
                  key={label}
                  variants={cardItem}
                  whileHover={{ x: 4, backgroundColor: "rgba(255,255,255,0.03)" }}
                  transition={{ type: "spring", stiffness: 300, damping: 25 }}
                  style={{
                    display: "flex",
                    gap: 14,
                    alignItems: "flex-start",
                    padding: "15px 18px",
                    border: `1px solid ${BORDER}`,
                    borderRadius: 15,
                    background: "rgba(255,255,255,0.018)",
                    cursor: "default",
                  }}
                >
                  <div style={{ width: 34, height: 34, borderRadius: 9, background: ic, border: `1px solid ${ib}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15, color: it, flexShrink: 0, fontWeight: 700 }}>
                    {icon}
                  </div>
                  <div>
                    <div style={{ fontSize: 10, color: TEXT_DIM, marginBottom: 3, letterSpacing: "0.08em", fontWeight: 700 }}>{label}</div>
                    <div style={{ fontSize: 13.5, color: "rgba(255,255,255,0.82)", fontWeight: 600 }}>{value}</div>
                  </div>
                </motion.div>
              ))}
            </Stagger>
          </div>
        </section>

        {/* ═══════════════════════ WHO IT'S FOR ═══════════════════════════════ */}
        <section style={sec}>
          <FadeUp>
            <div style={{ maxWidth: 580, marginBottom: 48 }}>
              <Label>WHO IT&apos;S FOR</Label>
              <h2 style={{ fontSize: mob ? 32 : 46, fontWeight: 900, letterSpacing: "-1.6px", color: "white", margin: 0, lineHeight: 1.08 }}>
                Built for every level of bettor
              </h2>
            </div>
          </FadeUp>
          <Stagger style={{ display: "grid", gridTemplateColumns: cols3, gap: 14 }}>
            {WHO.map((w) => (
              <motion.div
                key={w.tag}
                variants={cardItem}
                whileHover={{ y: -6, boxShadow: `0 24px 64px ${w.glow}`, borderColor: w.border.replace("0.2", "0.4") }}
                transition={{ type: "spring", stiffness: 260, damping: 18 }}
                style={{
                  border: `1px solid ${w.border}`,
                  background: w.bg,
                  borderRadius: 24,
                  padding: 28,
                  cursor: "default",
                }}
              >
                <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.12em", color: "rgba(255,255,255,0.45)", marginBottom: 16, textTransform: "uppercase" }}>
                  {w.tag}
                </div>
                <div style={{ fontSize: 19, fontWeight: 800, color: "white", marginBottom: 14, lineHeight: 1.3, letterSpacing: "-0.4px" }}>
                  {w.headline}
                </div>
                <div style={{ fontSize: 14.5, color: TEXT_MUTED, lineHeight: 1.78 }}>
                  {w.body}
                </div>
              </motion.div>
            ))}
          </Stagger>
        </section>

        {/* ═══════════════════════ FEATURES ════════════════════════════════════ */}
        <section style={{ ...sec, borderTop: `1px solid ${BORDER}`, borderBottom: `1px solid ${BORDER}` }}>
          <FadeUp>
            <div style={{ maxWidth: 580, marginBottom: 52 }}>
              <Label>PLATFORM FEATURES</Label>
              <h2 style={{ fontSize: mob ? 32 : 46, fontWeight: 900, letterSpacing: "-1.6px", color: "white", margin: "0 0 18px", lineHeight: 1.08 }}>
                Built for speed, clarity, and edge
              </h2>
              <p style={{ fontSize: 16, color: TEXT_MUTED, lineHeight: 1.78, margin: 0 }}>
                Every feature serves one purpose — getting you to profitable placements faster and with less friction.
              </p>
            </div>
          </FadeUp>
          <Stagger style={{ display: "grid", gridTemplateColumns: mob ? "1fr" : "repeat(3,minmax(0,1fr))", gap: 13 }}>
            {FEATURES.map((f) => (
              <motion.div
                key={f.title}
                variants={cardItem}
                whileHover={{ y: -5, boxShadow: "0 20px 56px rgba(0,0,0,0.32)" }}
                transition={{ type: "spring", stiffness: 260, damping: 18 }}
                style={{
                  border: `1px solid ${BORDER}`,
                  background: "rgba(255,255,255,0.02)",
                  borderRadius: 22,
                  padding: 26,
                  cursor: "default",
                }}
              >
                <div style={{
                  width: 42,
                  height: 42,
                  borderRadius: 12,
                  background: f.accent,
                  border: `1px solid ${f.accentBorder}`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 18,
                  color: f.accentText,
                  marginBottom: 18,
                  fontWeight: 700,
                }}>
                  {f.icon}
                </div>
                <div style={{ fontSize: 16.5, fontWeight: 800, color: "white", marginBottom: 12, letterSpacing: "-0.3px" }}>{f.title}</div>
                <div style={{ fontSize: 14, color: TEXT_MUTED, lineHeight: 1.78 }}>{f.body}</div>
              </motion.div>
            ))}
          </Stagger>
        </section>

        {/* ═══════════════════════ TELEGRAM ════════════════════════════════════ */}
        <section style={sec}>
          <FadeUp>
            <div style={{
              borderRadius: 28,
              border: "1px solid rgba(0,136,204,0.2)",
              background: "linear-gradient(135deg, rgba(0,100,180,0.06) 0%, rgba(124,58,237,0.05) 100%)",
              padding: mob ? "32px 24px" : "56px 64px",
              display: "grid",
              gridTemplateColumns: cols2,
              gap: mob ? 36 : 72,
              alignItems: "center",
            }}>
              {/* Left */}
              <div>
                <Label color="rgba(0,190,255,0.65)">LONG RUN · TELEGRAM ALERTS</Label>
                <h2 style={{ fontSize: mob ? 28 : 40, fontWeight: 900, letterSpacing: "-1.4px", color: "white", margin: "0 0 20px", lineHeight: 1.12 }}>
                  High-value arbs<br />straight to your phone.<br />Before they close.
                </h2>
                <p style={{ fontSize: 15.5, color: TEXT_MUTED, lineHeight: 1.82, marginBottom: 28 }}>
                  The best arbs close in minutes as other bettors move the market. Long Run
                  members get an instant Telegram alert the moment a high-margin opportunity
                  hits — with the full execution card included.
                </p>
                <div style={{ display: "grid", gap: 11, marginBottom: 32 }}>
                  {[
                    "Alerts only for arbs above 2% margin",
                    "Full execution card included in message",
                    "Read-only channel — no noise or discussion",
                    "Works on any device with Telegram installed",
                  ].map((feat) => (
                    <div key={feat} style={{ display: "flex", gap: 11, fontSize: 14.5, color: "rgba(255,255,255,0.78)", alignItems: "center" }}>
                      <span style={{ color: EM, fontWeight: 900, flexShrink: 0, fontSize: 14 }}>✓</span>
                      {feat}
                    </div>
                  ))}
                </div>
                <motion.div whileHover={{ scale: 1.02, y: -2 }} whileTap={{ scale: 0.98 }} transition={{ type: "spring", stiffness: 400, damping: 17 }}>
                  <Link
                    href="/pricing"
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      padding: "14px 26px",
                      borderRadius: 14,
                      fontWeight: 800,
                      fontSize: 15,
                      color: "white",
                      background: GB,
                      border: "1px solid rgba(124,58,237,0.4)",
                      textDecoration: "none",
                      boxShadow: "0 8px 32px rgba(80,50,255,0.24)",
                      letterSpacing: "-0.2px",
                    }}
                  >
                    Get Long Run access
                  </Link>
                </motion.div>
              </div>

              {/* Right: Telegram mockup */}
              <div style={{
                background: "rgba(8,12,22,0.88)",
                border: "1px solid rgba(0,136,204,0.2)",
                borderRadius: 22,
                padding: 22,
                backdropFilter: "blur(16px)",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 11, marginBottom: 18, paddingBottom: 16, borderBottom: `1px solid ${BORDER}` }}>
                  <div style={{ width: 38, height: 38, borderRadius: 999, background: "linear-gradient(135deg, rgba(0,136,204,0.9), rgba(124,58,237,0.9))", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>
                    🎯
                  </div>
                  <div>
                    <div style={{ fontSize: 13.5, fontWeight: 700, color: "white" }}>HitBet Alerts</div>
                    <div style={{ fontSize: 11, color: TEXT_DIM }}>just now</div>
                  </div>
                  <div style={{ marginLeft: "auto", fontSize: 10, padding: "3px 9px", borderRadius: 999, background: "rgba(0,136,204,0.12)", border: "1px solid rgba(0,136,204,0.25)", color: "rgba(0,200,255,0.9)", fontWeight: 800 }}>
                    LONG RUN
                  </div>
                </div>
                <div style={{ fontSize: 13.5, color: "rgba(255,255,255,0.9)", lineHeight: 1.72 }}>
                  <div style={{ marginBottom: 6 }}>⚽ <strong>Arsenal vs Chelsea</strong></div>
                  <div style={{ marginBottom: 6 }}>📈 <strong style={{ color: EM }}>3.42% margin</strong> — £17.10 profit @ £500</div>
                  <div style={{ marginBottom: 16, color: TEXT_DIM, fontSize: 12 }}>EPL · Spread · in 45m</div>
                  {[
                    { n: "Leg 1 — Bet365", d: "Arsenal -0.5 @ 2.05 · Stake £246" },
                    { n: "Leg 2 — Unibet", d: "Chelsea +0.5 @ 2.10 · Stake £254" },
                  ].map((leg) => (
                    <div key={leg.n} style={{ background: "rgba(255,255,255,0.04)", borderRadius: 11, padding: "10px 14px", marginBottom: 7 }}>
                      <div style={{ fontSize: 11, fontWeight: 700, color: "white", marginBottom: 2 }}>{leg.n}</div>
                      <div style={{ fontSize: 12, color: TEXT_MUTED }}>{leg.d}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </FadeUp>
        </section>

        {/* ═══════════════════════ TESTIMONIALS ═══════════════════════════════ */}
        <section style={{ ...sec, borderTop: `1px solid ${BORDER}` }}>
          <FadeUp>
            <div style={{ maxWidth: 540, marginBottom: 52 }}>
              <Label>EARLY USERS</Label>
              <h2 style={{ fontSize: mob ? 32 : 46, fontWeight: 900, letterSpacing: "-1.6px", color: "white", margin: 0, lineHeight: 1.08 }}>
                What people using it say
              </h2>
            </div>
          </FadeUp>
          <Stagger style={{ display: "grid", gridTemplateColumns: cols3, gap: 14 }}>
            {TESTIMONIALS.map((t) => (
              <motion.div
                key={t.name}
                variants={cardItem}
                whileHover={{ y: -5, boxShadow: "0 24px 64px rgba(0,0,0,0.32)" }}
                transition={{ type: "spring", stiffness: 260, damping: 18 }}
                style={{
                  border: `1px solid ${BORDER}`,
                  background: "rgba(255,255,255,0.02)",
                  borderRadius: 22,
                  padding: 26,
                  display: "flex",
                  flexDirection: "column",
                  gap: 20,
                  cursor: "default",
                }}
              >
                {/* Stars */}
                <div style={{ fontSize: 14, color: "rgba(245,200,60,0.85)", letterSpacing: 2 }}>★★★★★</div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: 14.5, color: "rgba(255,255,255,0.75)", lineHeight: 1.82, margin: 0 }}>
                    &ldquo;{t.text}&rdquo;
                  </p>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: 18, borderTop: `1px solid ${BORDER}` }}>
                  <div>
                    <div style={{ fontSize: 13.5, fontWeight: 700, color: "white" }}>{t.name}</div>
                    <div style={{ fontSize: 12, color: TEXT_DIM, marginTop: 2 }}>{t.location}</div>
                  </div>
                  <div style={{ fontSize: 11, padding: "4px 10px", borderRadius: 999, border: `1px solid ${BORDER_P}`, color: "rgba(195,185,255,0.8)", background: "rgba(124,58,237,0.1)", fontWeight: 700 }}>
                    {t.plan}
                  </div>
                </div>
              </motion.div>
            ))}
          </Stagger>
        </section>

        {/* ═══════════════════════ PRICING ═════════════════════════════════════ */}
        <section style={{ ...sec, borderTop: `1px solid ${BORDER}` }}>
          <FadeUp>
            <div style={{ maxWidth: 580, marginBottom: 52 }}>
              <Label>PRICING</Label>
              <h2 style={{ fontSize: mob ? 32 : 48, fontWeight: 900, letterSpacing: "-1.8px", color: "white", margin: "0 0 16px", lineHeight: 1.06 }}>
                Start free.<br />Pay when it&apos;s working.
              </h2>
              <p style={{ fontSize: 15.5, color: TEXT_MUTED, lineHeight: 1.78, margin: 0 }}>
                24-hour free trial on every plan. No charge today. Cancels automatically if you don&apos;t continue.
              </p>
            </div>
          </FadeUp>
          <Stagger style={{ display: "grid", gridTemplateColumns: cols3, gap: 14 }}>
            {PLANS.map((p) => (
              <motion.div
                key={p.name}
                variants={cardItem}
                whileHover={{ y: p.popular ? -8 : -5, boxShadow: p.popular ? "0 40px 90px rgba(80,50,255,0.28)" : "0 24px 60px rgba(0,0,0,0.3)" }}
                transition={{ type: "spring", stiffness: 260, damping: 18 }}
                style={{
                  position: "relative",
                  border: p.popular ? `1px solid ${BORDER_P}` : `1px solid ${BORDER}`,
                  background: p.popular ? "rgba(12,8,28,0.75)" : CARD_BG,
                  borderRadius: 24,
                  padding: 28,
                  boxShadow: p.popular ? "0 24px 64px rgba(80,50,255,0.2)" : undefined,
                  display: "flex",
                  flexDirection: "column",
                  cursor: "default",
                }}
              >
                {p.popular && (
                  <div style={{
                    position: "absolute",
                    top: -14,
                    left: "50%",
                    transform: "translateX(-50%)",
                    fontSize: 10,
                    fontWeight: 800,
                    padding: "4px 16px",
                    borderRadius: 999,
                    background: G,
                    color: "white",
                    letterSpacing: "0.08em",
                    whiteSpace: "nowrap",
                    boxShadow: "0 4px 16px rgba(80,50,255,0.4)",
                  }}>
                    BEST VALUE
                  </div>
                )}
                <div style={{ fontSize: 18, fontWeight: 800, color: "white", marginBottom: 3, letterSpacing: "-0.3px" }}>{p.name}</div>
                <div style={{ fontSize: 12.5, color: TEXT_MUTED, marginBottom: 20 }}>{p.sub}</div>
                <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginBottom: 5 }}>
                  <div style={{ fontSize: 42, fontWeight: 900, letterSpacing: "-2px", color: "white", lineHeight: 1 }}>{p.price}</div>
                  <span style={{ fontSize: 13, color: TEXT_DIM }}>/week</span>
                </div>
                {p.saving && (
                  <div style={{ fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 999, background: EM_DIM, border: `1px solid ${EM_BORDER}`, color: EM, display: "inline-block", marginBottom: 16 }}>
                    {p.saving}
                  </div>
                )}
                <div style={{ height: 1, background: BORDER, margin: p.saving ? "0 0 16px" : "16px 0" }} />
                <ul style={{ listStyle: "none", margin: "0 0 24px", padding: 0, display: "grid", gap: 10, flex: 1 }}>
                  {p.features.map((feat) => (
                    <li key={feat} style={{ display: "flex", gap: 10, fontSize: 13.5, color: "rgba(255,255,255,0.82)", alignItems: "flex-start" }}>
                      <span style={{ color: EM, fontWeight: 900, fontSize: 13, flexShrink: 0, marginTop: 1 }}>✓</span>
                      {feat}
                    </li>
                  ))}
                </ul>
                <Link
                  href={`/checkout?plan=${p.plan}&trial=true`}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: "14px 20px",
                    borderRadius: 14,
                    fontWeight: 800,
                    fontSize: 14.5,
                    color: "white",
                    background: GB,
                    border: "1px solid rgba(124,58,237,0.4)",
                    textDecoration: "none",
                    boxShadow: p.popular ? "0 8px 28px rgba(80,50,255,0.32)" : undefined,
                    letterSpacing: "-0.2px",
                  }}
                >
                  Try free — 24 hours
                </Link>
                <div style={{ marginTop: 12, fontSize: 11, color: TEXT_DIM, textAlign: "center" }}>
                  Then {p.price}/wk. Cancel anytime.
                </div>
              </motion.div>
            ))}
          </Stagger>
        </section>

        {/* ═══════════════════════ FAQ ══════════════════════════════════════════ */}
        <section style={{ ...sec, borderTop: `1px solid ${BORDER}` }}>
          <div style={{ display: "grid", gridTemplateColumns: mob ? "1fr" : "300px 1fr", gap: mob ? 36 : 88 }}>
            <FadeUp>
              <Label>FAQ</Label>
              <h2 style={{ fontSize: mob ? 30 : 38, fontWeight: 900, letterSpacing: "-1.2px", color: "white", margin: "0 0 16px", lineHeight: 1.12 }}>
                Common questions
              </h2>
              <p style={{ fontSize: 14.5, color: TEXT_DIM, lineHeight: 1.78, margin: 0 }}>
                Honest answers. No upsell.
              </p>
            </FadeUp>
            <FadeUp delay={0.1}>
              {FAQS.map((f) => (
                <FaqItem key={f.q} q={f.q} a={f.a} />
              ))}
            </FadeUp>
          </div>
        </section>

        {/* ═══════════════════════ FOOTER CTA ══════════════════════════════════ */}
        <section style={{ ...sec, borderTop: `1px solid ${BORDER}`, textAlign: "center" }}>
          <FadeUp>
            <Label>GET STARTED</Label>
            <h2 style={{
              fontSize: mob ? 34 : 58,
              fontWeight: 900,
              letterSpacing: mob ? "-1.2px" : "-2.5px",
              color: "white",
              margin: "0 0 20px",
              lineHeight: 1.05,
            }}>
              The maths is either there{" "}
              <br />
              <GradText>or it isn&apos;t.</GradText>
            </h2>
            <p style={{ fontSize: 16.5, color: TEXT_MUTED, lineHeight: 1.78, maxWidth: 480, margin: "0 auto 36px" }}>
              Every arbitrage on HitBet is a verified pricing inefficiency. If you place
              both legs at the shown odds, the profit is guaranteed by mathematics alone
              — not opinion, not prediction.
            </p>
            <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap" }}>
              <motion.div whileHover={{ scale: 1.03, y: -3 }} whileTap={{ scale: 0.97 }} transition={{ type: "spring", stiffness: 400, damping: 17 }}>
                <Link
                  href="/pricing"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    padding: "16px 32px",
                    borderRadius: 16,
                    fontWeight: 800,
                    fontSize: 16,
                    color: "white",
                    background: GB,
                    border: "1px solid rgba(124,58,237,0.4)",
                    textDecoration: "none",
                    boxShadow: "0 12px 48px rgba(80,50,255,0.38), 0 0 0 1px rgba(124,58,237,0.15)",
                    letterSpacing: "-0.3px",
                  }}
                >
                  Start 24-hour free trial
                </Link>
              </motion.div>
              <motion.div whileHover={{ x: 4 }} transition={{ type: "spring", stiffness: 400, damping: 25 }}>
                <Link
                  href="/dashboard"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 7,
                    padding: "16px 28px",
                    borderRadius: 16,
                    fontWeight: 700,
                    fontSize: 16,
                    color: "rgba(255,255,255,0.72)",
                    background: "rgba(255,255,255,0.04)",
                    border: `1px solid ${BORDER}`,
                    textDecoration: "none",
                    letterSpacing: "-0.2px",
                  }}
                >
                  View live feed <span style={{ opacity: 0.55, fontSize: 18 }}>→</span>
                </Link>
              </motion.div>
            </div>
            <div style={{ marginTop: 20, fontSize: 12, color: TEXT_DIM }}>
              24-hour trial · Card required · Cancels automatically if not continued
            </div>
          </FadeUp>
        </section>

      </div>
    </div>
  );
}

// ─── Animated progress bar ─────────────────────────────────────────────────────

function AnimatedBar({
  label,
  value,
  pct,
  bar,
  text,
}: {
  label: string;
  value: string;
  pct: number;
  bar: string;
  text: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <div ref={ref} style={{ marginBottom: 14 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
        <span style={{ fontSize: 12, color: TEXT_MUTED }}>{label}</span>
        <span style={{ fontSize: 12, color: text, fontWeight: 700 }}>{value}</span>
      </div>
      <div style={{ height: 8, borderRadius: 999, background: "rgba(255,255,255,0.05)", overflow: "hidden" }}>
        <motion.div
          style={{ height: "100%", background: bar, borderRadius: 999 }}
          initial={{ width: 0 }}
          animate={inView ? { width: `${pct}%` } : { width: 0 }}
          transition={{ duration: 1.2, delay: 0.3, ease: EASE }}
        />
      </div>
    </div>
  );
}
