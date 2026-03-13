"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

const LIVE_ARBS = [
  {
    event: "Arsenal vs Chelsea",
    sport: "EPL",
    margin: "3.42%",
    profit: "£1.71",
    book1: "Bet365",
    book2: "Unibet",
    time: "in 45m",
  },
  {
    event: "Lakers vs Celtics",
    sport: "NBA",
    margin: "2.88%",
    profit: "£1.44",
    book1: "William Hill",
    book2: "Betway",
    time: "in 2h",
  },
  {
    event: "Djokovic vs Alcaraz",
    sport: "ATP",
    margin: "2.11%",
    profit: "£1.06",
    book1: "Paddy Power",
    book2: "Betfair",
    time: "in 3h",
  },
  {
    event: "Man City vs Liverpool",
    sport: "EPL",
    margin: "1.74%",
    profit: "£0.87",
    book1: "888sport",
    book2: "Coral",
    time: "tomorrow",
  },
  {
    event: "Sinner vs Zverev",
    sport: "ATP",
    margin: "1.31%",
    profit: "£0.66",
    book1: "Ladbrokes",
    book2: "Betfair",
    time: "tomorrow",
  },
  {
    event: "Real Madrid vs Barca",
    sport: "La Liga",
    margin: "2.55%",
    profit: "£1.28",
    book1: "Bet365",
    book2: "Betfair",
    time: "in 6h",
  },
];

const STATS = [
  { value: "2–5%", label: "Typical arb margin" },
  { value: "<60s", label: "Average execution time" },
  { value: "30s", label: "Feed refresh rate" },
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
    body: "Our engine flags when the combined implied probability of both sides drops below 100% — a guaranteed edge.",
  },
  {
    n: "03",
    title: "You execute",
    body: "You get a clean execution card: exact stakes, which books, which outcomes. Place both legs and lock in the profit.",
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
  const itemW = 280;
  const totalW = LIVE_ARBS.length * itemW;
  const x = -(offset % totalW);
  return (
    <div style={t.tickerWrap}>
      <div style={{ ...t.tickerTrack, transform: `translateX(${x}px)` }}>
        {items.map((a, i) => (
          <div key={i} style={t.tickerCard}>
            <div style={t.tickerEvent}>{a.event}</div>
            <div style={t.tickerMeta}>
              <span style={t.tickerSport}>{a.sport}</span>
              <span style={t.tickerMargin}>{a.margin}</span>
              <span style={t.tickerProfit}>{a.profit}</span>
            </div>
            <div style={t.tickerBooks}>
              {a.book1} · {a.book2}
            </div>
          </div>
        ))}
      </div>
      <div style={t.tickerFadeL} />
      <div style={t.tickerFadeR} />
    </div>
  );
}

export default function Home() {
  return (
    <div className="narrowPage">
      <div style={t.root}>
        <section style={t.hero}>
          <div style={t.heroInner}>
            <div style={t.kicker}>
              <span style={t.kickerDot} />
              LIVE ARBITRAGE FEED
            </div>
            <h1 style={t.h1}>
              The books made
              <br />a <span style={t.grad}>pricing mistake.</span>
              <br />
              We found it.
            </h1>
            <p style={t.heroSub}>
              HitBet scans 40+ sportsbooks in real time, detects true arbitrage,
              and hands you a clean stake split to execute immediately. No
              prediction. No luck. Pure maths.
            </p>
            <div style={t.heroCtas}>
              <Link href="/pricing" style={t.btnPrimary}>
                Try free for 7 days
              </Link>
              <Link href="/dashboard" style={t.btnGhost}>
                See live feed →
              </Link>
            </div>
            <div style={t.heroNote}>
              Card required · £0 charged today · Cancel anytime
            </div>
          </div>
          <div style={t.heroCard}>
            <div style={t.heroCardLabel}>LIVE ARB · NOW</div>
            <div style={t.heroCardEvent}>Arsenal vs Chelsea</div>
            <div style={t.heroCardMeta}>
              <span style={t.heroCardSport}>EPL · h2h · in 45m</span>
              <span style={t.heroCardMargin}>3.42%</span>
            </div>
            <div style={t.heroCardHr} />
            <div style={t.heroCardLegs}>
              <div style={t.heroLeg}>
                <div style={t.legBook}>Bet365</div>
                <div style={t.legPick}>Arsenal win</div>
                <div style={t.legOdds}>@ 2.05</div>
                <div style={t.legStake}>£24.63</div>
              </div>
              <div style={t.heroLeg}>
                <div style={t.legBook}>Unibet</div>
                <div style={t.legPick}>Chelsea win</div>
                <div style={t.legOdds}>@ 2.10</div>
                <div style={t.legStake}>£25.37</div>
              </div>
            </div>
            <div style={t.heroCardBottom}>
              <span style={t.heroCardTotal}>Total stake: £50.00</span>
              <span style={t.heroCardProfit}>+£1.71 guaranteed</span>
            </div>
          </div>
        </section>

        <div style={t.tickerSection}>
          <div style={t.tickerLabel}>LIVE FEED PREVIEW</div>
          <TickerRow />
        </div>

        <section style={t.statsBar}>
          {STATS.map((s) => (
            <div key={s.label} style={t.statItem}>
              <div style={t.statVal}>{s.value}</div>
              <div style={t.statLabel}>{s.label}</div>
            </div>
          ))}
        </section>

        <section style={t.section}>
          <div style={t.sectionInner}>
            <div style={t.sectionHead}>
              <div style={t.sectionKicker}>HOW IT WORKS</div>
              <h2 style={t.h2}>Three steps from signal to profit</h2>
              <p style={t.sectionSub}>
                We handle the scanning and maths. You handle the execution.
                That's the whole system.
              </p>
            </div>
            <div style={t.howGrid}>
              {HOW.map((h) => (
                <div key={h.n} style={t.howCard}>
                  <div style={t.howN}>{h.n}</div>
                  <div style={t.howTitle}>{h.title}</div>
                  <div style={t.howBody}>{h.body}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section style={{ ...t.section, ...t.sectionAlt }}>
          <div style={t.sectionInner}>
            <div style={t.exampleGrid}>
              <div>
                <div style={t.sectionKicker}>EXECUTION CARD</div>
                <h2 style={t.h2}>
                  Everything you need.
                  <br />
                  Nothing you don't.
                </h2>
                <p style={t.sectionSub}>
                  Every arb surfaces as a single execution card. Who to back,
                  where, how much. Place both legs within a minute and move on.
                </p>
                <div style={t.checkList}>
                  {[
                    "Exact stake split calculated",
                    "Both books named",
                    "Market & settlement matched",
                    "Margin and guaranteed profit shown",
                  ].map((c) => (
                    <div key={c} style={t.checkItem}>
                      <span style={t.checkMark}>✓</span>
                      <span>{c}</span>
                    </div>
                  ))}
                </div>
                <Link
                  href="/pricing"
                  style={{
                    ...t.btnPrimary,
                    marginTop: 28,
                    display: "inline-flex",
                  }}
                >
                  Start 7-day trial
                </Link>
              </div>
              <div style={t.exampleCardWrap}>
                <div style={t.exCard}>
                  <div style={t.exCardTop}>
                    <div>
                      <div style={t.exEvent}>Man City vs Liverpool</div>
                      <div style={t.exMeta}>EPL · h2h · tomorrow 17:30</div>
                    </div>
                    <div style={t.exMetrics}>
                      <div style={t.exMetric}>
                        <div style={t.exMetricLabel}>Margin</div>
                        <div style={t.exMetricVal}>1.74%</div>
                      </div>
                      <div style={{ ...t.exMetric, ...t.exMetricProfit }}>
                        <div style={t.exMetricLabel}>Profit</div>
                        <div style={t.exMetricVal}>£0.87</div>
                      </div>
                    </div>
                  </div>
                  <div style={t.exLegs}>
                    <div style={t.exLeg}>
                      <div style={t.exLegBook}>888sport</div>
                      <div style={t.exLegPick}>Man City win</div>
                      <div style={t.exLegOdds}>@ 2.15</div>
                      <div style={t.exLegStake}>Stake: £23.81</div>
                    </div>
                    <div style={t.exLeg}>
                      <div style={t.exLegBook}>Coral</div>
                      <div style={t.exLegPick}>Liverpool win</div>
                      <div style={t.exLegOdds}>@ 2.05</div>
                      <div style={t.exLegStake}>Stake: £26.19</div>
                    </div>
                  </div>
                  <div style={t.exBottom}>
                    <span style={t.exTotal}>Total stake: £50.00</span>
                    <span style={t.exReady}>Ready to place</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section style={t.section}>
          <div style={t.sectionInner}>
            <div style={t.sectionHead}>
              <div style={t.sectionKicker}>PRICING</div>
              <h2 style={t.h2}>Start free. Pay when it's working.</h2>
              <p style={t.sectionSub}>
                7-day free trial on both plans. Card required — cancels
                automatically if you don't continue.
              </p>
            </div>
            <div style={t.plansGrid}>
              <div style={t.planCard}>
                <div style={t.planName}>Pro</div>
                <div style={t.planPrice}>
                  £39.99<span style={t.planPer}>/mo</span>
                </div>
                <div style={t.planHr} />
                <ul style={t.planList}>
                  {[
                    "Full 2-outcome arb feed",
                    "Stake splits included",
                    "30s refresh",
                    "Suspicious edge flags",
                  ].map((f) => (
                    <li key={f} style={t.planItem}>
                      <span style={t.planCheck}>✓</span>
                      {f}
                    </li>
                  ))}
                </ul>
                <Link href="/checkout?plan=pro&trial=true" style={t.btnPrimary}>
                  Try free — 7 days
                </Link>
                <div style={t.planNote}>Then £39.99/mo. Cancel anytime.</div>
              </div>
              <div style={{ ...t.planCard, ...t.planCardElite }}>
                <div style={t.eliteBadge}>Most popular</div>
                <div style={t.planName}>Elite</div>
                <div style={t.planPrice}>
                  £59.99<span style={t.planPer}>/mo</span>
                </div>
                <div style={t.planHr} />
                <div style={t.planEverything}>Everything in Pro, plus:</div>
                <ul style={t.planList}>
                  {[
                    "3-way markets (football 1X2)",
                    "Value watchlist",
                    "Telegram alerts",
                    "Priority support",
                  ].map((f) => (
                    <li key={f} style={t.planItem}>
                      <span style={t.planCheck}>✓</span>
                      {f}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/checkout?plan=elite&trial=true"
                  style={t.btnPrimary}
                >
                  Try free — 7 days
                </Link>
                <div style={t.planNote}>Then £59.99/mo. Cancel anytime.</div>
              </div>
            </div>
          </div>
        </section>

        <section style={t.footerCta}>
          <div style={t.footerCtaInner}>
            <h2 style={{ ...t.h2, textAlign: "center" }}>
              The maths doesn't lie.
            </h2>
            <p
              style={{
                ...t.sectionSub,
                textAlign: "center",
                maxWidth: 540,
                margin: "12px auto 28px",
              }}
            >
              Every arb on HitBet is a real pricing inefficiency. Place both
              legs correctly and the profit is guaranteed by maths alone.
            </p>
            <div
              style={{
                display: "flex",
                gap: 12,
                justifyContent: "center",
                flexWrap: "wrap",
              }}
            >
              <Link href="/pricing" style={t.btnPrimary}>
                Start 7-day free trial
              </Link>
              <Link href="/dashboard" style={t.btnGhost}>
                View the feed
              </Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

const PURPLE = "rgba(120,110,255,0.95)";
const CYAN = "rgba(0,190,255,0.85)";
const GRAD = `linear-gradient(90deg, ${PURPLE}, ${CYAN})`;

const t: Record<string, React.CSSProperties> = {
  root: { width: "100%" },
  hero: {
    display: "grid",
    gridTemplateColumns: "1fr 420px",
    gap: 48,
    alignItems: "center",
    padding: "80px 0 60px",
  },
  heroInner: {},
  kicker: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    fontSize: 12,
    letterSpacing: "0.18em",
    color: "rgba(255,255,255,0.55)",
    marginBottom: 20,
  },
  kickerDot: {
    width: 7,
    height: 7,
    borderRadius: 999,
    background: "#22c55e",
    boxShadow: "0 0 8px #22c55e",
  },
  h1: {
    fontSize: 58,
    fontWeight: 900,
    lineHeight: 1.08,
    letterSpacing: "-1.5px",
    margin: "0 0 20px",
    color: "white",
  },
  grad: {
    background: GRAD,
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    backgroundClip: "text",
  },
  heroSub: {
    fontSize: 17,
    lineHeight: 1.75,
    color: "rgba(255,255,255,0.65)",
    maxWidth: 540,
    margin: "0 0 28px",
  },
  heroCtas: {
    display: "flex",
    gap: 12,
    flexWrap: "wrap",
    alignItems: "center",
  },
  heroNote: { marginTop: 14, fontSize: 12, color: "rgba(255,255,255,0.38)" },
  heroCard: {
    border: "1px solid rgba(120,110,255,0.3)",
    background: "rgba(10,14,20,0.7)",
    borderRadius: 20,
    padding: 22,
    backdropFilter: "blur(16px)",
    boxShadow: "0 24px 80px rgba(80,60,255,0.2)",
  },
  heroCardLabel: {
    fontSize: 11,
    letterSpacing: "0.14em",
    color: "rgba(255,255,255,0.45)",
    marginBottom: 10,
  },
  heroCardEvent: {
    fontSize: 20,
    fontWeight: 800,
    color: "white",
    marginBottom: 6,
  },
  heroCardMeta: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },
  heroCardSport: { fontSize: 12, color: "rgba(255,255,255,0.5)" },
  heroCardMargin: {
    fontSize: 14,
    fontWeight: 800,
    padding: "4px 10px",
    borderRadius: 999,
    background: "rgba(0,255,140,0.1)",
    border: "1px solid rgba(0,255,140,0.2)",
    color: "#9be7bf",
  },
  heroCardHr: {
    height: 1,
    background: "rgba(255,255,255,0.08)",
    margin: "0 0 14px",
  },
  heroCardLegs: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 10,
    marginBottom: 14,
  },
  heroLeg: {
    border: "1px solid rgba(255,255,255,0.08)",
    background: "rgba(255,255,255,0.03)",
    borderRadius: 14,
    padding: "12px 12px",
  },
  legBook: { fontSize: 13, fontWeight: 700, color: "white", marginBottom: 4 },
  legPick: { fontSize: 12, color: "rgba(255,255,255,0.65)", marginBottom: 6 },
  legOdds: { fontSize: 13, fontWeight: 700, color: "#98b8ff" },
  legStake: { fontSize: 13, fontWeight: 800, color: "white", marginTop: 6 },
  heroCardBottom: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 12,
    borderTop: "1px solid rgba(255,255,255,0.08)",
  },
  heroCardTotal: { fontSize: 13, color: "rgba(255,255,255,0.55)" },
  heroCardProfit: {
    fontSize: 13,
    fontWeight: 800,
    color: "#9be7bf",
    padding: "5px 10px",
    borderRadius: 999,
    background: "rgba(0,255,140,0.08)",
    border: "1px solid rgba(0,255,140,0.15)",
  },
  tickerSection: { padding: "0 0 48px", overflow: "hidden" },
  tickerLabel: {
    fontSize: 11,
    letterSpacing: "0.16em",
    color: "rgba(255,255,255,0.35)",
    marginBottom: 12,
  },
  tickerWrap: { position: "relative", overflow: "hidden" },
  tickerTrack: { display: "flex", gap: 12, willChange: "transform" },
  tickerCard: {
    minWidth: 268,
    border: "1px solid rgba(255,255,255,0.08)",
    background: "rgba(255,255,255,0.03)",
    borderRadius: 14,
    padding: "12px 14px",
    flexShrink: 0,
  },
  tickerEvent: {
    fontSize: 13,
    fontWeight: 700,
    color: "white",
    marginBottom: 6,
    whiteSpace: "nowrap",
  },
  tickerMeta: {
    display: "flex",
    gap: 10,
    alignItems: "center",
    marginBottom: 4,
  },
  tickerSport: { fontSize: 11, color: "rgba(255,255,255,0.45)" },
  tickerMargin: { fontSize: 13, fontWeight: 800, color: "#9be7bf" },
  tickerProfit: { fontSize: 12, color: "rgba(255,255,255,0.55)" },
  tickerBooks: { fontSize: 11, color: "rgba(255,255,255,0.35)" },
  tickerFadeL: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    width: 60,
    background: "linear-gradient(90deg, #05060a, transparent)",
    pointerEvents: "none",
  },
  tickerFadeR: {
    position: "absolute",
    right: 0,
    top: 0,
    bottom: 0,
    width: 60,
    background: "linear-gradient(270deg, #05060a, transparent)",
    pointerEvents: "none",
  },
  statsBar: {
    display: "grid",
    gridTemplateColumns: "repeat(4, minmax(0,1fr))",
    gap: 1,
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: 18,
    overflow: "hidden",
    marginBottom: 80,
    background: "rgba(255,255,255,0.04)",
  },
  statItem: {
    padding: "22px 24px",
    borderRight: "1px solid rgba(255,255,255,0.07)",
    background: "rgba(10,14,20,0.5)",
  },
  statVal: {
    fontSize: 30,
    fontWeight: 900,
    letterSpacing: "-1px",
    color: "white",
    marginBottom: 4,
  },
  statLabel: { fontSize: 13, color: "rgba(255,255,255,0.5)" },
  section: { padding: "70px 0" },
  sectionAlt: {
    background: "rgba(255,255,255,0.02)",
    borderTop: "1px solid rgba(255,255,255,0.06)",
    borderBottom: "1px solid rgba(255,255,255,0.06)",
  },
  sectionInner: { width: "100%" },
  sectionHead: { maxWidth: 620, marginBottom: 48 },
  sectionKicker: {
    fontSize: 11,
    letterSpacing: "0.16em",
    color: "rgba(255,255,255,0.4)",
    marginBottom: 12,
  },
  h2: {
    fontSize: 40,
    fontWeight: 900,
    letterSpacing: "-1px",
    color: "white",
    margin: "0 0 14px",
    lineHeight: 1.1,
  },
  sectionSub: {
    fontSize: 16,
    color: "rgba(255,255,255,0.6)",
    lineHeight: 1.75,
    margin: 0,
  },
  howGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, minmax(0,1fr))",
    gap: 16,
  },
  howCard: {
    border: "1px solid rgba(255,255,255,0.08)",
    background: "rgba(255,255,255,0.03)",
    borderRadius: 20,
    padding: 24,
  },
  howN: {
    fontSize: 11,
    fontWeight: 900,
    letterSpacing: "0.1em",
    color: "rgba(255,255,255,0.25)",
    marginBottom: 14,
    fontFamily: "monospace",
  },
  howTitle: { fontSize: 20, fontWeight: 800, color: "white", marginBottom: 10 },
  howBody: { fontSize: 14, color: "rgba(255,255,255,0.6)", lineHeight: 1.7 },
  exampleGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 60,
    alignItems: "center",
  },
  checkList: { display: "grid", gap: 10, marginTop: 24 },
  checkItem: {
    display: "flex",
    gap: 10,
    fontSize: 15,
    color: "rgba(255,255,255,0.8)",
    alignItems: "center",
  },
  checkMark: { color: "#9be7bf", fontWeight: 900, fontSize: 14 },
  exampleCardWrap: {},
  exCard: {
    border: "1px solid rgba(120,110,255,0.25)",
    background: "rgba(10,14,20,0.65)",
    borderRadius: 22,
    padding: 22,
    backdropFilter: "blur(14px)",
    boxShadow: "0 20px 60px rgba(80,60,255,0.15)",
  },
  exCardTop: {
    display: "flex",
    justifyContent: "space-between",
    gap: 12,
    marginBottom: 16,
    flexWrap: "wrap",
  },
  exEvent: { fontSize: 20, fontWeight: 800, color: "white", marginBottom: 4 },
  exMeta: { fontSize: 12, color: "rgba(255,255,255,0.5)" },
  exMetrics: { display: "flex", gap: 10 },
  exMetric: {
    borderRadius: 14,
    padding: "10px 12px",
    background: "rgba(255,255,255,0.05)",
    border: "1px solid rgba(255,255,255,0.08)",
    minWidth: 90,
  },
  exMetricProfit: {
    background: "rgba(0,255,140,0.07)",
    border: "1px solid rgba(0,255,140,0.15)",
  },
  exMetricLabel: {
    fontSize: 11,
    color: "rgba(255,255,255,0.5)",
    marginBottom: 4,
  },
  exMetricVal: { fontSize: 18, fontWeight: 800, color: "white" },
  exLegs: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 12,
    marginBottom: 14,
  },
  exLeg: {
    border: "1px solid rgba(255,255,255,0.08)",
    background: "rgba(255,255,255,0.03)",
    borderRadius: 16,
    padding: 14,
  },
  exLegBook: { fontSize: 14, fontWeight: 700, color: "white", marginBottom: 4 },
  exLegPick: { fontSize: 12, color: "rgba(255,255,255,0.6)", marginBottom: 8 },
  exLegOdds: {
    fontSize: 13,
    fontWeight: 700,
    color: "#98b8ff",
    marginBottom: 6,
  },
  exLegStake: { fontSize: 13, fontWeight: 800, color: "white" },
  exBottom: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 12,
    borderTop: "1px solid rgba(255,255,255,0.07)",
  },
  exTotal: { fontSize: 13, color: "rgba(255,255,255,0.5)" },
  exReady: {
    fontSize: 12,
    fontWeight: 700,
    color: "#9be7bf",
    padding: "6px 12px",
    borderRadius: 999,
    background: "rgba(0,255,140,0.08)",
    border: "1px solid rgba(0,255,140,0.15)",
  },
  plansGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(2, minmax(0,1fr))",
    gap: 18,
  },
  planCard: {
    position: "relative",
    border: "1px solid rgba(255,255,255,0.10)",
    background: "rgba(10,14,20,0.55)",
    borderRadius: 20,
    padding: 28,
    backdropFilter: "blur(10px)",
    display: "flex",
    flexDirection: "column",
    gap: 0,
  },
  planCardElite: {
    border: "1px solid rgba(120,110,255,0.35)",
    boxShadow: "0 18px 60px rgba(80,60,255,0.15)",
  },
  eliteBadge: {
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
  },
  planName: {
    fontSize: 16,
    fontWeight: 800,
    color: "rgba(255,255,255,0.7)",
    marginBottom: 8,
  },
  planPrice: {
    fontSize: 46,
    fontWeight: 900,
    letterSpacing: "-1px",
    color: "white",
    lineHeight: 1,
  },
  planPer: { fontSize: 14, fontWeight: 400, color: "rgba(255,255,255,0.5)" },
  planHr: { height: 1, background: "rgba(255,255,255,0.08)", margin: "18px 0" },
  planEverything: {
    fontSize: 12,
    color: "rgba(255,255,255,0.45)",
    marginBottom: 10,
  },
  planList: {
    listStyle: "none",
    margin: "0 0 22px",
    padding: 0,
    display: "grid",
    gap: 10,
  },
  planItem: {
    display: "flex",
    gap: 10,
    fontSize: 14,
    color: "rgba(255,255,255,0.85)",
    alignItems: "center",
  },
  planCheck: { color: "#9be7bf", fontWeight: 900, fontSize: 13 },
  planNote: { marginTop: 10, fontSize: 12, color: "rgba(255,255,255,0.35)" },
  footerCta: {
    padding: "80px 0",
    borderTop: "1px solid rgba(255,255,255,0.06)",
  },
  footerCtaInner: {},
  btnPrimary: {
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
    boxShadow: "0 12px 35px rgba(80,120,255,0.25)",
    textDecoration: "none",
    cursor: "pointer",
  },
  btnGhost: {
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
    cursor: "pointer",
  },
};
