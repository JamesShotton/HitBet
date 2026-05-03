"use client";

import Link from "next/link";

type Tip = { title: string; body: string };
type Section = {
  id: string;
  emoji: string;
  heading: string;
  sub: string;
  tips: Tip[];
};

const SECTIONS: Section[] = [
  {
    id: "stakes",
    emoji: "💷",
    heading: "Stake sizing",
    sub: "How you size your bets is the clearest signal books use to identify arbers.",
    tips: [
      {
        title: "Never place the exact mathematical split",
        body: "If the calculator says £47.23, place £47 or £48 — never the precise decimal. Books flag suspiciously precise stakes immediately.",
      },
      {
        title: "Use odd, natural-looking numbers",
        body: "Real punters bet £50, £75, or £100. Arbers bet £47.23. Round to the nearest £5 or add a random £1–3 offset to look human.",
      },
      {
        title: "Don't always use the same stake",
        body: "Vary your total stake between arbs. Sometimes £40, sometimes £60, sometimes £80. A fixed stake on every bet is a pattern.",
      },
      {
        title: "Stay well below maximum stake limits",
        body: "Always betting the maximum on a book is a major red flag. Stay under 70% of their limit, especially on books you want to preserve.",
      },
    ],
  },
  {
    id: "timing",
    emoji: "⏱️",
    heading: "Timing",
    sub: "When you place — and how fast — matters as much as how much.",
    tips: [
      {
        title: "Wait 20–30 seconds between legs",
        body: "Don't place both legs within seconds of each other. A short delay looks natural. Millisecond-perfect simultaneous placement screams automation.",
      },
      {
        title: "Don't log in and immediately bet",
        body: "Browse the site for 30–60 seconds first. Click on some markets. Act like you're deciding. Books track session behaviour, not just bet patterns.",
      },
      {
        title: "Avoid betting right when lines open",
        body: "Sharp money moves immediately when lines open. If you're always first to bet on a newly opened market, you'll get flagged as a sharp.",
      },
      {
        title: "Place the less liquid leg first",
        body: "Place your bet on the smaller or less liquid book first. If odds move before you place the second leg, you'll have locked in the better side already.",
      },
    ],
  },
  {
    id: "behaviour",
    emoji: "🎭",
    heading: "Behave like a punter",
    sub: "Books don't just look at your bets — they look at your whole account behaviour.",
    tips: [
      {
        title: "Place some recreational single bets",
        body: "Occasionally back your team, a favourite, or a popular market with a small stake. £5–10 on a Premier League match makes your account look real.",
      },
      {
        title: "Don't only bet on obscure markets",
        body: "Arbs often appear on niche markets with thin liquidity. If you only ever bet on AHL ice hockey or Kazakh football, books notice.",
      },
      {
        title: "Rotate sports and markets",
        body: "Mix football, tennis, basketball and more. A real punter has interests. An arber follows the algorithm wherever it points.",
      },
      {
        title: "Don't bet exclusively on the best odds",
        body: "Real punters are lazy — they don't always shop for the best price. Occasionally take a slightly worse price on a book you want to preserve.",
      },
    ],
  },
  {
    id: "accounts",
    emoji: "🏦",
    heading: "Account management",
    sub: "How you handle money in and out is watched just as closely as your bets.",
    tips: [
      {
        title: "Don't withdraw immediately after winning",
        body: "Leave winnings in your account for a few days. Instant withdrawals after a profitable run is a classic arber pattern.",
      },
      {
        title: "Avoid round-number withdrawals",
        body: "Withdrawing exactly £500.00 or £1,000.00 looks automated. Withdraw £487 or £523 instead.",
      },
      {
        title: "Use different payment methods where possible",
        body: "Using the same card on multiple accounts (via shared IPs or devices) can trigger cross-account linking. Use separate cards and devices where you can.",
      },
      {
        title: "Never bonus abuse on arbing accounts",
        body: "Using welcome bonuses and free bets while arbing on the same account dramatically accelerates your gub or ban. Keep bonus accounts separate.",
      },
    ],
  },
  {
    id: "longterm",
    emoji: "♟️",
    heading: "Long-term strategy",
    sub: "Think in months, not bets. Protect your most valuable accounts.",
    tips: [
      {
        title: "Categorise your books",
        body: "Divide books into 'long-term' (Betfair Exchange, Smarkets — exchange-based, arber-friendly) and 'short-term' (soft books you'll eventually lose). Protect the long-term ones.",
      },
      {
        title: "Accept smaller edges on valuable books",
        body: "On a book you want to keep for years, only take arbs with a smaller margin. Don't hammer a soft book with every 3%+ arb you find.",
      },
      {
        title: "Rotate books — don't hammer the same pair",
        body: "If Bet365 and Unibet appear together on every single arb you place, both books will notice the pattern. Spread your action across as many books as possible.",
      },
      {
        title: "Use exchanges as anchor legs",
        body: "Betfair Exchange, Smarkets, and Matchbook don't ban winners — they make money on commission regardless. Use them as one leg of your arbs to protect soft book accounts.",
      },
      {
        title: "Have sacrificial accounts",
        body: "Some soft books will gub or limit you no matter what. Accept it. Use them hard while they last, then move on. Don't waste caution on books that were never going to last.",
      },
    ],
  },
];

const RISK_LEVELS = [
  { label: "Stake precision", risk: "High", color: "#f87171" },
  { label: "Timing between legs", risk: "High", color: "#f87171" },
  { label: "Always best odds", risk: "Medium", color: "#fbbf24" },
  { label: "Instant withdrawals", risk: "Medium", color: "#fbbf24" },
  { label: "No recreational bets", risk: "Medium", color: "#fbbf24" },
  { label: "Same books repeatedly", risk: "Low", color: "#9be7bf" },
];

export default function GuidePage() {
  return (
    <div className="narrowPage">
      <main style={g.page}>
        <div style={g.wrap}>
          {/* ── Hero ─────────────────────────────── */}
          <div style={g.hero}>
            <div style={g.heroKicker}>STEALTH GUIDE</div>
            <h1 style={g.h1}>How not to get banned</h1>
            <p style={g.heroSub}>
              Arbitrage is not illegal. But books don't like consistent winners
              — they will limit or ban accounts that show clear arbing patterns.
              This guide shows you how to operate quietly and extend the life of
              your accounts.
            </p>
            <div style={g.disclaimer}>
              <span style={g.disclaimerIcon}>ℹ️</span>
              <span>
                This is general information based on common experience in the
                arbing community. It is not financial or legal advice. Always
                follow each bookmaker's terms of service.
              </span>
            </div>
          </div>

          {/* ── Risk radar ───────────────────────── */}
          <div style={g.radarCard}>
            <div style={g.radarTitle}>What books look for</div>
            <div style={g.radarGrid}>
              {RISK_LEVELS.map((r) => (
                <div key={r.label} style={g.radarItem}>
                  <div style={g.radarBar}>
                    <div
                      style={{
                        ...g.radarFill,
                        background: r.color,
                        opacity: 0.85,
                      }}
                    />
                  </div>
                  <div style={g.radarLabel}>{r.label}</div>
                  <div style={{ ...g.radarRisk, color: r.color }}>
                    {r.risk} risk
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── Sections ─────────────────────────── */}
          {SECTIONS.map((sec, si) => (
            <div key={sec.id} style={g.section}>
              <div style={g.secHeader}>
                <span style={g.secEmoji}>{sec.emoji}</span>
                <div>
                  <h2 style={g.secHeading}>{sec.heading}</h2>
                  <p style={g.secSub}>{sec.sub}</p>
                </div>
              </div>

              <div style={g.tipsGrid}>
                {sec.tips.map((tip, ti) => (
                  <div key={ti} style={g.tipCard}>
                    <div style={g.tipNum}>
                      {String(ti + 1).padStart(2, "0")}
                    </div>
                    <div style={g.tipTitle}>{tip.title}</div>
                    <div style={g.tipBody}>{tip.body}</div>
                  </div>
                ))}
              </div>
            </div>
          ))}

          {/* ── Summary table ────────────────────── */}
          <div style={g.summaryCard}>
            <div style={g.summaryTitle}>Quick reference</div>
            <div style={g.summaryGrid}>
              <div style={g.summaryCol}>
                <div style={g.summaryColHead}>✅ Do</div>
                {[
                  "Round your stakes to natural numbers",
                  "Wait 20–30s between legs",
                  "Browse before betting",
                  "Place recreational bets occasionally",
                  "Rotate sports and books",
                  "Use exchanges as anchor legs",
                  "Leave winnings in your account",
                ].map((d) => (
                  <div key={d} style={g.summaryItem}>
                    {d}
                  </div>
                ))}
              </div>
              <div style={g.summaryDivider} />
              <div style={g.summaryCol}>
                <div style={g.summaryColHead}>❌ Don't</div>
                {[
                  "Place exact decimal stakes",
                  "Place both legs simultaneously",
                  "Log in and immediately bet",
                  "Always take the best available odds",
                  "Hammer the same two books",
                  "Withdraw immediately after winning",
                  "Mix bonus abuse with arbing",
                ].map((d) => (
                  <div key={d} style={g.summaryItem}>
                    {d}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── CTA ──────────────────────────────── */}
          <div style={g.cta}>
            <div style={g.ctaText}>
              <div style={g.ctaTitle}>Ready to start placing?</div>
              <div style={g.ctaSub}>
                Head to the dashboard to see live arbs with pre-calculated stake
                splits.
              </div>
            </div>
            <div style={g.ctaBtns}>
              <Link href="/arbitrage" style={g.btnP}>
                Open arbitrage
              </Link>
              <Link href="/pricing" style={g.btnG}>
                View plans
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

const g: Record<string, React.CSSProperties> = {
  page: { minHeight: "100vh", padding: "40px 0 80px" },
  wrap: { maxWidth: 900, margin: "0 auto" },

  // Hero
  hero: { marginBottom: 40 },
  heroKicker: {
    fontSize: 11,
    letterSpacing: "0.16em",
    color: "rgba(255,255,255,0.38)",
    marginBottom: 12,
  },
  h1: {
    fontSize: 48,
    fontWeight: 900,
    letterSpacing: "-1.2px",
    color: "white",
    margin: "0 0 16px",
    lineHeight: 1.05,
  },
  heroSub: {
    fontSize: 17,
    color: "rgba(255,255,255,0.6)",
    lineHeight: 1.75,
    maxWidth: 720,
    margin: "0 0 20px",
  },
  disclaimer: {
    display: "flex",
    gap: 10,
    alignItems: "flex-start",
    padding: "14px 16px",
    borderRadius: 14,
    border: "1px solid rgba(255,255,255,0.08)",
    background: "rgba(255,255,255,0.03)",
    fontSize: 13,
    color: "rgba(255,255,255,0.5)",
    lineHeight: 1.6,
  },
  disclaimerIcon: { fontSize: 14, flexShrink: 0, marginTop: 1 },

  // Risk radar
  radarCard: {
    border: "1px solid rgba(255,255,255,0.08)",
    background: "rgba(10,14,20,0.45)",
    borderRadius: 18,
    padding: "22px 24px",
    marginBottom: 40,
    backdropFilter: "blur(12px)",
  },
  radarTitle: {
    fontSize: 13,
    fontWeight: 700,
    color: "rgba(255,255,255,0.55)",
    marginBottom: 16,
    letterSpacing: "0.05em",
  },
  radarGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, minmax(0,1fr))",
    gap: 14,
  },
  radarItem: { display: "flex", flexDirection: "column", gap: 6 },
  radarBar: {
    height: 4,
    borderRadius: 999,
    background: "rgba(255,255,255,0.06)",
    overflow: "hidden",
  },
  radarFill: { height: "100%", width: "100%", borderRadius: 999 },
  radarLabel: {
    fontSize: 13,
    color: "rgba(255,255,255,0.75)",
    fontWeight: 600,
  },
  radarRisk: { fontSize: 11, fontWeight: 700 },

  // Sections
  section: { marginBottom: 44 },
  secHeader: {
    display: "flex",
    gap: 16,
    alignItems: "flex-start",
    marginBottom: 20,
  },
  secEmoji: { fontSize: 28, flexShrink: 0, marginTop: 2 },
  secHeading: {
    fontSize: 26,
    fontWeight: 900,
    color: "white",
    margin: "0 0 6px",
    letterSpacing: "-0.5px",
  },
  secSub: {
    fontSize: 14,
    color: "rgba(255,255,255,0.55)",
    margin: 0,
    lineHeight: 1.6,
  },

  tipsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(2, minmax(0,1fr))",
    gap: 12,
  },
  tipCard: {
    border: "1px solid rgba(255,255,255,0.08)",
    background: "rgba(10,14,20,0.4)",
    borderRadius: 16,
    padding: "18px 20px",
    backdropFilter: "blur(10px)",
  },
  tipNum: {
    fontSize: 11,
    fontWeight: 800,
    letterSpacing: "0.1em",
    color: "rgba(255,255,255,0.22)",
    marginBottom: 10,
    fontFamily: "monospace",
  },
  tipTitle: {
    fontSize: 15,
    fontWeight: 800,
    color: "white",
    marginBottom: 8,
    lineHeight: 1.3,
  },
  tipBody: { fontSize: 13, color: "rgba(255,255,255,0.58)", lineHeight: 1.7 },

  // Summary
  summaryCard: {
    border: "1px solid rgba(120,110,255,0.2)",
    background: "rgba(10,14,20,0.5)",
    borderRadius: 18,
    padding: "24px 26px",
    marginBottom: 36,
    backdropFilter: "blur(12px)",
    boxShadow: "0 18px 60px rgba(80,60,255,0.1)",
  },
  summaryTitle: {
    fontSize: 13,
    fontWeight: 700,
    color: "rgba(255,255,255,0.45)",
    marginBottom: 20,
    letterSpacing: "0.05em",
  },
  summaryGrid: { display: "flex", gap: 24 },
  summaryCol: { flex: 1 },
  summaryColHead: {
    fontSize: 14,
    fontWeight: 800,
    color: "white",
    marginBottom: 14,
  },
  summaryItem: {
    fontSize: 13,
    color: "rgba(255,255,255,0.62)",
    padding: "8px 0",
    borderBottom: "1px solid rgba(255,255,255,0.05)",
    lineHeight: 1.5,
  },
  summaryDivider: { width: 1, background: "rgba(255,255,255,0.06)" },

  // CTA
  cta: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 16,
    flexWrap: "wrap",
    padding: "22px 24px",
    border: "1px solid rgba(255,255,255,0.08)",
    background: "rgba(10,14,20,0.4)",
    borderRadius: 18,
  },
  ctaText: {},
  ctaTitle: { fontSize: 18, fontWeight: 800, color: "white", marginBottom: 4 },
  ctaSub: { fontSize: 13, color: "rgba(255,255,255,0.5)" },
  ctaBtns: { display: "flex", gap: 10, flexWrap: "wrap" as const },

  btnP: {
    display: "inline-flex",
    alignItems: "center",
    padding: "11px 18px",
    borderRadius: 12,
    fontWeight: 700,
    fontSize: 14,
    color: "white",
    background:
      "linear-gradient(90deg, rgba(120,110,255,0.95), rgba(0,190,255,0.75))",
    border: "1px solid rgba(120,110,255,0.4)",
    textDecoration: "none",
  },
  btnG: {
    display: "inline-flex",
    alignItems: "center",
    padding: "11px 18px",
    borderRadius: 12,
    fontWeight: 700,
    fontSize: 14,
    color: "rgba(255,255,255,0.8)",
    background: "rgba(255,255,255,0.05)",
    border: "1px solid rgba(255,255,255,0.10)",
    textDecoration: "none",
  },
};
