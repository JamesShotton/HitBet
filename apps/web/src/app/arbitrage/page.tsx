"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, useCallback } from "react";

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

type Arb = {
  id?: number | string;
  event: string;
  sport_key: string;
  market_group: string;
  commence_time: string;
  legs: number;
  margin: number;
  est_profit: number;
  total_stake?: number;
  leg1_name: string;
  leg1_book: string;
  leg1_odds: number;
  leg1_stake: number;
  leg1_point?: string | null;
  leg2_name: string;
  leg2_book: string;
  leg2_odds: number;
  leg2_stake: number;
  leg2_point?: string | null;
  leg3_name?: string | null;
  leg3_book?: string | null;
  leg3_odds?: number | null;
  leg3_stake?: number | null;
  created_at?: string | null;
};

type ApiResponse = {
  signedIn: boolean;
  active: boolean;
  demo: boolean;
  plan?: string | null;
  trial?: boolean;
  trialDaysLeft?: number;
  arbs2way: Arb[];
  arbs3way: Arb[];
  error?: string;
  noArbAccess?: boolean;
  hasLongRun?: boolean;
};

const fmt = (v: number) => `£${v.toFixed(2)}`;
const pct = (v: number) => `${(v * 100).toFixed(2)}%`;

function timeUntil(v: string) {
  const d = new Date(v);
  if (isNaN(d.getTime())) return "—";
  const diff = d.getTime() - Date.now();
  if (diff < 0) return "In play";
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h`;
  return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short" });
}

function arbAge(createdAt: string | null | undefined): {
  label: string;
  color: string;
  warn: boolean;
} {
  if (!createdAt) return { label: "", color: "transparent", warn: false };
  const mins = (Date.now() - new Date(createdAt).getTime()) / 60000;
  if (mins >= 10)
    return { label: `${Math.floor(mins)}m old`, color: "#f87171", warn: true };
  if (mins >= 5)
    return { label: `${Math.floor(mins)}m old`, color: "#f59e0b", warn: true };
  return { label: "", color: "transparent", warn: false };
}

function sportEmoji(sport: string) {
  const s = sport.toLowerCase();
  if (s.includes("soccer")) return "⚽";
  if (s.includes("basket") || s.includes("nba")) return "🏀";
  if (s.includes("tennis")) return "🎾";
  if (s.includes("hockey") || s.includes("nhl")) return "🏒";
  if (s.includes("nfl") || s.includes("american")) return "🏈";
  if (s.includes("baseball") || s.includes("mlb")) return "⚾";
  if (s.includes("mma")) return "🥊";
  return "🎯";
}

function marketLabel(mg: string) {
  const map: Record<string, string> = {
    h2h: "Moneyline",
    h2h_3way: "1X2",
    spreads: "Spread",
    alternate_spreads: "Alt Spread",
    totals: "Total",
    alternate_totals: "Alt Total",
    h2h_h1: "1st Half",
    h2h_h2: "2nd Half",
    h2h_q1: "Q1",
    h2h_q2: "Q2",
    h2h_q3: "Q3",
    h2h_q4: "Q4",
    h2h_p1: "P1",
    h2h_p2: "P2",
    h2h_p3: "P3",
    h2h_1st_5_innings: "F5",
  };
  if (map[mg]) return map[mg];
  if (mg.startsWith("player_"))
    return mg.replace("player_", "").replace(/_/g, " ");
  return mg;
}

function marketCategory(mg: string) {
  if (mg === "h2h" || mg === "h2h_3way") return "moneyline";
  if (mg.includes("spread")) return "spreads";
  if (mg.includes("total")) return "totals";
  if (
    ["h1", "h2", "q1", "q2", "q3", "q4", "p1", "p2", "p3", "innings"].some(
      (x) => mg.includes(x)
    )
  )
    return "periods";
  if (mg.startsWith("player_")) return "props";
  return "other";
}

// Curated list of UK-accessible books grouped by type
const UK_BOOKS: { group: string; books: string[] }[] = [
  {
    group: "Exchanges (never ban winners)",
    books: ["Betfair Exchange", "Smarkets", "Matchbook", "Betdaq"],
  },
  {
    group: "Major UK soft books",
    books: [
      "Bet365",
      "William Hill",
      "Coral",
      "Ladbrokes",
      "Paddy Power",
      "Sky Bet",
      "Betway",
      "Unibet (UK)",
      "888sport",
      "BetVictor",
      "BoyleSports",
      "Grosvenor",
      "Betfred",
      "SportNation",
      "BetUK",
    ],
  },
  {
    group: "Other accessible books",
    books: [
      "Casumo",
      "LeoVegas",
      "Mr Green",
      "Virgin Bet",
      "Spreadex",
      "QuinnBet",
      "Midnite",
      "Rhino.bet",
    ],
  },
];

const ALL_UK_BOOKS = UK_BOOKS.flatMap((g) => g.books);

type RiskLevel = "exchange" | "mainstream" | "standard" | "caution";

const BOOK_RISK: Record<string, RiskLevel> = {
  // Exchanges — never restrict winning customers
  "Betfair Exchange": "exchange",
  "Betfair":          "exchange",
  "Smarkets":         "exchange",
  "Matchbook":        "exchange",
  "Betdaq":           "exchange",
  // Major UK high-street books — slow to restrict, easy disputes
  "Bet365":           "mainstream",
  "William Hill":     "mainstream",
  "Coral":            "mainstream",
  "Ladbrokes":        "mainstream",
  "Paddy Power":      "mainstream",
  "Sky Bet":          "mainstream",
  "Betway":           "mainstream",
  "Unibet (UK)":      "mainstream",
  "888sport":         "mainstream",
  "BetVictor":        "mainstream",
  "BoyleSports":      "mainstream",
  "Betfred":          "mainstream",
  "Grosvenor":        "mainstream",
  "SportNation":      "mainstream",
  "BetUK":            "mainstream",
  // Smaller UK-licensed or EU books — accessible but may restrict faster
  "Casumo":           "standard",
  "LeoVegas":         "standard",
  "Mr Green":         "standard",
  "Virgin Bet":       "standard",
  "QuinnBet":         "standard",
  "Midnite":          "standard",
  "Rhino.bet":        "standard",
  "Spreadex":         "standard",
  "10Bet":            "standard",
  "NetBet":           "standard",
  "Pinnacle":         "standard",
  "Unibet":           "standard",
  // EU/international books — verify you can hold an account before placing
  "Bwin":             "caution",
  "Marathon Bet":     "caution",
  "Tipico":           "caution",
  "Betclic":          "caution",
  "NordicBet":        "caution",
};

const RISK_META: Record<RiskLevel, { label: string; color: string; bg: string; border: string; tip: string }> = {
  exchange:   { label: "Exchange",   color: "#6ee7b7", bg: "rgba(0,200,120,0.12)", border: "rgba(0,200,120,0.25)", tip: "Betting exchange — never restricts winning accounts" },
  mainstream: { label: "",           color: "",        bg: "",                     border: "",                     tip: "Major UK-licensed bookmaker" },
  standard:   { label: "Check odds", color: "#fbbf24", bg: "rgba(251,191,36,0.1)", border: "rgba(251,191,36,0.2)", tip: "Smaller or EU-licensed book — may restrict profitable accounts faster" },
  caution:    { label: "Verify",     color: "#f97316", bg: "rgba(249,115,22,0.1)", border: "rgba(249,115,22,0.2)", tip: "EU book — confirm you can hold a UK account before placing" },
};

function BookBadge({ name, size = "md" }: { name: string; size?: "sm" | "md" }) {
  const risk = BOOK_RISK[name] ?? "caution";
  const meta = RISK_META[risk];
  const fontSize = size === "sm" ? 12 : 13;
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
      <span style={{ fontSize, fontWeight: 700, color: "white" }}>{name}</span>
      {meta.label && (
        <span
          title={meta.tip}
          style={{
            fontSize: 9,
            fontWeight: 800,
            padding: "1px 5px",
            borderRadius: 999,
            color: meta.color,
            background: meta.bg,
            border: `1px solid ${meta.border}`,
            letterSpacing: "0.05em",
            cursor: "help",
          }}
        >
          {meta.label}
        </span>
      )}
    </span>
  );
}

const MARKET_CATEGORIES = [
  { key: "all", label: "All markets" },
  { key: "moneyline", label: "Moneyline" },
  { key: "spreads", label: "Spreads" },
  { key: "totals", label: "Totals" },
  { key: "periods", label: "Halves / Periods" },
  { key: "props", label: "Player Props" },
];

function BetLogModal({
  arb,
  profit,
  onClose,
  onSaved,
}: {
  arb: Arb;
  profit: number;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);

  async function save() {
    setSaving(true);
    try {
      await fetch("/api/bets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          event: arb.event,
          market_group: arb.market_group,
          leg1_book: arb.leg1_book,
          leg2_book: arb.leg2_book,
          leg3_book: arb.leg3_book ?? null,
          stake: arb.total_stake ?? null,
          profit,
          notes: notes.trim() || null,
        }),
      });
      setDone(true);
      setTimeout(onSaved, 1200);
    } catch {
      setSaving(false);
    }
  }

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 300,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "rgba(0,0,0,0.75)",
          backdropFilter: "blur(4px)",
        }}
        onClick={onClose}
      />
      <div
        style={{
          position: "relative",
          width: "100%",
          maxWidth: 420,
          background: "rgba(10,14,22,0.98)",
          border: "1px solid rgba(255,255,255,0.1)",
          borderRadius: 22,
          padding: "24px 22px",
          boxShadow: "0 30px 80px rgba(0,0,0,0.6)",
        }}
      >
        {done ? (
          <div
            style={{
              textAlign: "center",
              padding: "24px 0",
              fontSize: 18,
              fontWeight: 800,
              color: "#9be7bf",
            }}
          >
            ✅ Bet logged!
          </div>
        ) : (
          <>
            <div style={{ fontSize: 18, fontWeight: 800, marginBottom: 4 }}>
              Log this bet
            </div>
            <div
              style={{
                fontSize: 13,
                color: "rgba(255,255,255,0.5)",
                marginBottom: 18,
              }}
            >
              {arb.event}
            </div>
            <div
              style={{
                padding: "12px 14px",
                borderRadius: 12,
                background: "rgba(0,255,140,0.06)",
                border: "1px solid rgba(0,255,140,0.18)",
                marginBottom: 18,
              }}
            >
              <div
                style={{
                  fontSize: 12,
                  color: "rgba(255,255,255,0.4)",
                  marginBottom: 4,
                }}
              >
                Guaranteed profit
              </div>
              <div style={{ fontSize: 24, fontWeight: 900, color: "#9be7bf" }}>
                +{fmt(profit)}
              </div>
            </div>
            <div style={{ marginBottom: 18 }}>
              <div
                style={{
                  fontSize: 12,
                  color: "rgba(255,255,255,0.4)",
                  marginBottom: 6,
                }}
              >
                Notes (optional)
              </div>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. stakes placed, any issues..."
                rows={2}
                style={{
                  width: "100%",
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(255,255,255,0.09)",
                  borderRadius: 10,
                  color: "white",
                  padding: "10px 12px",
                  fontSize: 13,
                  resize: "none",
                  outline: "none",
                  boxSizing: "border-box",
                }}
              />
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button
                onClick={onClose}
                style={{
                  flex: 1,
                  padding: "11px 14px",
                  borderRadius: 12,
                  border: "1px solid rgba(255,255,255,0.1)",
                  background: "transparent",
                  color: "rgba(255,255,255,0.6)",
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>
              <button
                onClick={save}
                disabled={saving}
                style={{
                  flex: 2,
                  padding: "11px 14px",
                  borderRadius: 12,
                  border: "1px solid rgba(120,110,255,0.45)",
                  background:
                    "linear-gradient(90deg, rgba(120,110,255,0.95), rgba(0,190,255,0.75))",
                  color: "white",
                  fontSize: 14,
                  fontWeight: 800,
                  cursor: "pointer",
                  opacity: saving ? 0.6 : 1,
                }}
              >
                {saving ? "Saving…" : "Log bet"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function ExpandedRow({
  arb,
  stake,
  onLogBet,
}: {
  arb: Arb;
  stake: number;
  onLogBet: (profit: number) => void;
}) {
  const scale = stake / (Number(arb.total_stake ?? 50) || 50);
  const s1 = Number(arb.leg1_stake) * scale;
  const s2 = Number(arb.leg2_stake) * scale;
  const s3 = arb.leg3_stake ? Number(arb.leg3_stake) * scale : null;
  const profit = Number(arb.est_profit) * scale;
  const [checked, setChecked] = useState([false, false, false]);

  // Clean up selection name — remove duplicate point if already in the name
  function cleanName(name: string, point: string | null | undefined) {
    if (!point) return name;
    // If the name already contains the point value, don't append it
    if (name.includes(point) || name.includes(String(parseFloat(point))))
      return name;
    return name;
  }

  // Generate plain-English bet description
  function betDescription(
    market: string,
    name: string,
    point: string | null | undefined
  ) {
    const mg = market.toLowerCase();
    const pt = point ? parseFloat(point) : null;

    if (mg.includes("spread") || mg.includes("handicap")) {
      if (pt !== null) {
        const side =
          pt < 0
            ? `${name} to win by more than ${Math.abs(pt)}`
            : `${name} to lose by less than ${Math.abs(pt)} (or win)`;
        return {
          what: side,
          label: "Handicap",
          detail: `Line: ${pt > 0 ? "+" : ""}${pt}`,
        };
      }
    }
    if (mg === "totals" || mg === "alternate_totals") {
      const side = name.startsWith("Over")
        ? `Over ${pt} goals/points scored in the match`
        : `Under ${pt} goals/points scored in the match`;
      return { what: side, label: "Total", detail: `Line: ${pt}` };
    }
    if (mg === "h2h" || mg === "h2h_3way") {
      if (name.includes("win"))
        return {
          what: `${name.replace(" win", "")} to win the match`,
          label: "Match result",
          detail: null,
        };
      if (name === "Draw")
        return {
          what: "The match ends in a draw",
          label: "Match result",
          detail: null,
        };
    }
    if (mg.includes("h1") || mg.includes("h2")) {
      const half = mg.includes("h1") ? "1st half" : "2nd half";
      return { what: `${name} — ${half} result`, label: half, detail: null };
    }
    return {
      what: name,
      label: "Bet",
      detail: point ? `Line: ${point}` : null,
    };
  }

  const legs = [
    {
      book: arb.leg1_book,
      pick: arb.leg1_name,
      odds: arb.leg1_odds,
      stake: s1,
      point: arb.leg1_point,
      wait: false,
    },
    {
      book: arb.leg2_book,
      pick: arb.leg2_name,
      odds: arb.leg2_odds,
      stake: s2,
      point: arb.leg2_point,
      wait: true,
    },
    ...(arb.legs === 3 && arb.leg3_book
      ? [
          {
            book: arb.leg3_book!,
            pick: arb.leg3_name!,
            odds: arb.leg3_odds!,
            stake: s3!,
            point: null,
            wait: true,
          },
        ]
      : []),
  ];

  const allDone = legs.every((_, i) => checked[i]);

  return (
    <div
      style={{
        border: "1px solid rgba(120,110,255,0.14)",
        borderRadius: 14,
        padding: 18,
        background: "rgba(8,11,18,0.6)",
      }}
    >
      {/* Summary strip */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: 8,
          marginBottom: 20,
        }}
      >
        {[
          { l: "Stake each book", v: "See below" },
          { l: "Guaranteed profit", v: `+${fmt(profit)}`, green: true },
          { l: "Margin", v: pct(arb.margin) },
          { l: "Total payout", v: fmt(stake + profit) },
        ].map(({ l, v, green }) => (
          <div
            key={l}
            style={{
              background: "rgba(255,255,255,0.03)",
              borderRadius: 10,
              padding: "10px 12px",
              border: "1px solid rgba(255,255,255,0.06)",
            }}
          >
            <div
              style={{
                fontSize: 11,
                color: "rgba(255,255,255,0.38)",
                marginBottom: 4,
              }}
            >
              {l}
            </div>
            <div
              style={{
                fontSize: 13,
                fontWeight: 800,
                color: green ? "#9be7bf" : "white",
              }}
            >
              {v}
            </div>
          </div>
        ))}
      </div>

      {/* Step by step */}
      <div
        style={{
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: "0.1em",
          color: "rgba(255,255,255,0.35)",
          textTransform: "uppercase" as const,
          marginBottom: 12,
        }}
      >
        Step-by-step placement
      </div>

      <div
        style={{ display: "flex", flexDirection: "column" as const, gap: 10 }}
      >
        {legs.map((leg, i) => {
          const desc = betDescription(arb.market_group, leg.pick, leg.point);
          return (
            <div
              key={i}
              style={{
                borderRadius: 14,
                border: checked[i]
                  ? "1px solid rgba(0,255,140,0.25)"
                  : "1px solid rgba(255,255,255,0.09)",
                background: checked[i]
                  ? "rgba(0,255,140,0.05)"
                  : "rgba(255,255,255,0.025)",
                cursor: "pointer",
                overflow: "hidden",
                transition: "all 0.15s",
              }}
              onClick={() =>
                setChecked((prev) => prev.map((v, idx) => (idx === i ? !v : v)))
              }
            >
              {/* Step header */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: "14px 16px",
                  borderBottom: checked[i]
                    ? "none"
                    : "1px solid rgba(255,255,255,0.05)",
                }}
              >
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 999,
                    background: checked[i]
                      ? "#9be7bf"
                      : "rgba(120,110,255,0.25)",
                    border: checked[i]
                      ? "none"
                      : "1px solid rgba(120,110,255,0.5)",
                    color: checked[i] ? "#05060a" : "white",
                    fontSize: 14,
                    fontWeight: 900,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  {checked[i] ? "✓" : i + 1}
                </div>
                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      flexWrap: "wrap" as const,
                    }}
                  >
                    <BookBadge name={leg.book} />
                    <span
                      style={{
                        fontSize: 11,
                        padding: "2px 8px",
                        borderRadius: 999,
                        background: "rgba(255,255,255,0.06)",
                        border: "1px solid rgba(255,255,255,0.1)",
                        color: "rgba(255,255,255,0.55)",
                      }}
                    >
                      {desc.label}
                    </span>
                    {leg.wait && (
                      <span
                        style={{
                          fontSize: 11,
                          fontWeight: 700,
                          color: "rgba(245,158,11,0.9)",
                          padding: "2px 8px",
                          borderRadius: 999,
                          background: "rgba(245,158,11,0.1)",
                          border: "1px solid rgba(245,158,11,0.2)",
                        }}
                      >
                        ⏱ Wait 20–30s first
                      </span>
                    )}
                  </div>
                </div>
                {/* Stake badge always visible */}
                <div style={{ textAlign: "right" as const, flexShrink: 0 }}>
                  <div
                    style={{
                      fontSize: 11,
                      color: "rgba(255,255,255,0.4)",
                      marginBottom: 2,
                    }}
                  >
                    Stake
                  </div>
                  <div
                    style={{ fontSize: 18, fontWeight: 900, color: "white" }}
                  >
                    £{Math.round(leg.stake)}
                  </div>
                </div>
              </div>

              {/* Bet details */}
              {!checked[i] && (
                <div
                  style={{
                    padding: "12px 16px 14px",
                    display: "grid",
                    gridTemplateColumns: "1fr auto",
                    gap: 12,
                    alignItems: "center",
                  }}
                >
                  <div>
                    <div
                      style={{
                        fontSize: 11,
                        color: "rgba(255,255,255,0.4)",
                        marginBottom: 6,
                      }}
                    >
                      What to bet on:
                    </div>
                    <div
                      style={{
                        fontSize: 15,
                        fontWeight: 800,
                        color: "white",
                        lineHeight: 1.4,
                        marginBottom: 8,
                      }}
                    >
                      {desc.what}
                    </div>
                    {desc.detail && (
                      <div
                        style={{
                          fontSize: 12,
                          color: "rgba(255,255,255,0.5)",
                          marginBottom: 8,
                        }}
                      >
                        {desc.detail}
                      </div>
                    )}
                    <div
                      style={{
                        display: "flex",
                        gap: 8,
                        flexWrap: "wrap" as const,
                        alignItems: "center",
                      }}
                    >
                      <div
                        style={{ fontSize: 12, color: "rgba(255,255,255,0.5)" }}
                      >
                        Find it under:
                      </div>
                      <span
                        style={{
                          fontSize: 13,
                          fontWeight: 700,
                          padding: "4px 12px",
                          borderRadius: 999,
                          background: "rgba(120,110,255,0.15)",
                          border: "1px solid rgba(120,110,255,0.3)",
                          color: "#b8b0ff",
                        }}
                      >
                        {arb.market_group.includes("spread")
                          ? "Asian Handicap / Spreads"
                          : arb.market_group.includes("total")
                          ? "Over/Under / Totals"
                          : arb.market_group === "h2h" ||
                            arb.market_group === "h2h_3way"
                          ? "Match Result / 1X2"
                          : arb.market_group.includes("h1")
                          ? "Half Time"
                          : arb.market_group.includes("h2")
                          ? "2nd Half"
                          : "Main markets"}
                      </span>
                    </div>
                  </div>
                  <div style={{ textAlign: "right" as const }}>
                    <div
                      style={{
                        fontSize: 11,
                        color: "rgba(255,255,255,0.4)",
                        marginBottom: 4,
                      }}
                    >
                      Accept odds of
                    </div>
                    <div
                      style={{
                        fontSize: 24,
                        fontWeight: 900,
                        color: "#98b8ff",
                        letterSpacing: "-0.5px",
                      }}
                    >
                      {Number(leg.odds).toFixed(2)}
                    </div>
                    <div
                      style={{
                        fontSize: 11,
                        color: "rgba(255,255,255,0.35)",
                        marginTop: 2,
                      }}
                    >
                      or better
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {allDone && (
        <div
          style={{
            marginTop: 14,
            padding: "14px 16px",
            borderRadius: 12,
            background: "rgba(0,255,140,0.08)",
            border: "1px solid rgba(0,255,140,0.2)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 12,
            flexWrap: "wrap",
          }}
        >
          <div style={{ fontSize: 14, color: "#9be7bf", fontWeight: 700 }}>
            ✅ All legs placed — you're locked in for{" "}
            <strong>+{fmt(profit)}</strong> guaranteed profit regardless of the
            result.
          </div>
          <button
            onClick={() => onLogBet(profit)}
            style={{
              padding: "8px 14px",
              borderRadius: 10,
              border: "1px solid rgba(0,255,140,0.35)",
              background: "rgba(0,255,140,0.1)",
              color: "#9be7bf",
              fontSize: 13,
              fontWeight: 700,
              cursor: "pointer",
              whiteSpace: "nowrap",
            }}
          >
            + Log this bet
          </button>
        </div>
      )}
    </div>
  );
}

function ArbRow({
  arb,
  stake,
  expanded,
  onToggle,
  mob,
  pinned,
  onPin,
  onLogBet,
}: {
  arb: Arb;
  stake: number;
  expanded: boolean;
  onToggle: () => void;
  mob: boolean;
  pinned: boolean;
  onPin: () => void;
  onLogBet: (arb: Arb, profit: number) => void;
}) {
  const mPct = Number(arb.margin) * 100;
  const scale = stake / (Number(arb.total_stake ?? 50) || 50);
  const profit = Number(arb.est_profit) * scale;
  const mColor =
    mPct >= 3
      ? "#9be7bf"
      : mPct >= 1.5
      ? "#98b8ff"
      : mPct >= 0.5
      ? "rgba(255,255,255,0.85)"
      : "rgba(255,255,255,0.45)";
  const is3 = arb.legs === 3;

  if (mob) {
    return (
      <>
        <tr
          style={{
            borderBottom: "1px solid rgba(255,255,255,0.05)",
            cursor: "pointer",
            background: expanded ? "rgba(120,110,255,0.07)" : undefined,
          }}
          onClick={onToggle}
        >
          <td style={{ padding: "12px 12px" }}>
            <div
              style={{
                fontSize: 13,
                fontWeight: 700,
                color: "white",
                marginBottom: 3,
              }}
            >
              {arb.event}
            </div>
            <div
              style={{
                display: "flex",
                gap: 6,
                alignItems: "center",
                marginBottom: 6,
                flexWrap: "wrap",
              }}
            >
              <span style={{ fontSize: 10, color: "rgba(255,255,255,0.4)" }}>
                {sportEmoji(arb.sport_key)}
              </span>
              <span
                style={{
                  fontSize: 10,
                  padding: "1px 6px",
                  borderRadius: 999,
                  border: "1px solid rgba(255,255,255,0.09)",
                  background: "rgba(255,255,255,0.03)",
                  color: "rgba(255,255,255,0.5)",
                }}
              >
                {marketLabel(arb.market_group)}
              </span>
            </div>
            <div
              style={{
                fontSize: 12,
                color: "rgba(255,255,255,0.6)",
                marginBottom: 2,
              }}
            >
              <BookBadge name={arb.leg1_book} size="sm" /> @ {Number(arb.leg1_odds).toFixed(2)} ·{" "}
              <BookBadge name={arb.leg2_book} size="sm" /> @ {Number(arb.leg2_odds).toFixed(2)}
            </div>
          </td>
          <td
            style={{
              padding: "12px 12px",
              textAlign: "right",
              verticalAlign: "middle",
              whiteSpace: "nowrap",
            }}
          >
            <div
              style={{
                fontSize: 14,
                fontWeight: 800,
                color: mColor,
                marginBottom: 4,
              }}
            >
              {pct(arb.margin)}
            </div>
            <div
              style={{
                fontSize: 13,
                fontWeight: 700,
                color: "rgba(255,255,255,0.8)",
              }}
            >
              +{fmt(profit)}
            </div>
            <div
              style={{
                fontSize: 11,
                color: "rgba(255,255,255,0.35)",
                marginTop: 4,
              }}
            >
              {timeUntil(arb.commence_time)}
            </div>
            {arbAge(arb.created_at).warn && (
              <div
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  marginTop: 3,
                  color: arbAge(arb.created_at).color,
                }}
              >
                {arbAge(arb.created_at).label}
              </div>
            )}
          </td>
          <td
            style={{
              padding: "0 4px",
              verticalAlign: "middle",
              textAlign: "right",
            }}
          >
            <button
              onClick={(e) => {
                e.stopPropagation();
                onPin();
              }}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                fontSize: 16,
                opacity: pinned ? 1 : 0.25,
                color: pinned ? "#f59e0b" : "white",
              }}
            >
              📌
            </button>
          </td>
        </tr>
        {expanded && (
          <tr style={{ background: "rgba(120,110,255,0.03)" }}>
            <td colSpan={2} style={{ padding: "0 12px 12px" }}>
              <ExpandedRow arb={arb} stake={stake} onLogBet={(p) => onLogBet(arb, p)} />
            </td>
          </tr>
        )}
      </>
    );
  }

  return (
    <>
      <tr
        style={{
          borderBottom: "1px solid rgba(255,255,255,0.04)",
          cursor: "pointer",
          background: expanded ? "rgba(120,110,255,0.07)" : undefined,
        }}
        onClick={onToggle}
      >
        <td style={{ padding: "11px 14px", verticalAlign: "middle" }}>
          <div
            style={{
              fontSize: 14,
              fontWeight: 700,
              color: "white",
              marginBottom: 3,
            }}
          >
            {arb.event}
          </div>
          <div
            style={{
              display: "flex",
              gap: 5,
              alignItems: "center",
              fontSize: 11,
              color: "rgba(255,255,255,0.35)",
            }}
          >
            <span>{sportEmoji(arb.sport_key)}</span>
            <span>
              {arb.sport_key.replace(
                /^(soccer|basketball|icehockey|americanfootball|baseball|tennis|mma)_/,
                ""
              )}
            </span>
            <span
              style={{
                fontSize: 10,
                padding: "2px 6px",
                borderRadius: 999,
                border: "1px solid rgba(255,255,255,0.08)",
                background: "rgba(255,255,255,0.03)",
                color: "rgba(255,255,255,0.45)",
              }}
            >
              {marketLabel(arb.market_group)}
            </span>
            {is3 && (
              <span
                style={{
                  fontSize: 10,
                  padding: "2px 6px",
                  borderRadius: 999,
                  border: "1px solid rgba(0,190,255,0.2)",
                  background: "rgba(0,190,255,0.06)",
                  color: "rgba(100,210,255,0.8)",
                }}
              >
                3-way
              </span>
            )}
          </div>
        </td>
        <td style={{ padding: "11px 14px", verticalAlign: "middle" }}>
          <div
            style={{
              fontSize: 13,
              fontWeight: 600,
              color: "white",
              marginBottom: 2,
            }}
          >
            <BookBadge name={arb.leg1_book} />{" "}
            <span style={{ color: "#98b8ff" }}>
              @ {Number(arb.leg1_odds).toFixed(2)}
            </span>
          </div>
          <div style={{ fontSize: 12, color: "rgba(255,255,255,0.42)" }}>
            {arb.leg1_name}
          </div>
        </td>
        <td style={{ padding: "11px 14px", verticalAlign: "middle" }}>
          <div
            style={{
              fontSize: 13,
              fontWeight: 600,
              color: "white",
              marginBottom: 2,
            }}
          >
            <BookBadge name={arb.leg2_book} />{" "}
            <span style={{ color: "#98b8ff" }}>
              @ {Number(arb.leg2_odds).toFixed(2)}
            </span>
          </div>
          <div style={{ fontSize: 12, color: "rgba(255,255,255,0.42)" }}>
            {arb.leg2_name}
          </div>
          {is3 && arb.leg3_book && (
            <>
              <div
                style={{
                  fontSize: 13,
                  fontWeight: 600,
                  color: "white",
                  marginTop: 4,
                }}
              >
                <BookBadge name={arb.leg3_book!} />{" "}
                <span style={{ color: "#98b8ff" }}>
                  @ {Number(arb.leg3_odds).toFixed(2)}
                </span>
              </div>
              <div style={{ fontSize: 12, color: "rgba(255,255,255,0.42)" }}>
                {arb.leg3_name}
              </div>
            </>
          )}
        </td>
        <td
          style={{
            padding: "11px 14px",
            verticalAlign: "middle",
            textAlign: "right",
          }}
        >
          <span style={{ fontSize: 14, fontWeight: 800, color: mColor }}>
            {pct(arb.margin)}
          </span>
        </td>
        <td
          style={{
            padding: "11px 14px",
            verticalAlign: "middle",
            textAlign: "right",
          }}
        >
          <span
            style={{
              fontSize: 14,
              fontWeight: 700,
              color: "rgba(255,255,255,0.82)",
            }}
          >
            +{fmt(profit)}
          </span>
        </td>
        <td
          style={{
            padding: "11px 14px",
            verticalAlign: "middle",
            textAlign: "right",
          }}
        >
          <span style={{ fontSize: 12, color: "rgba(255,255,255,0.38)" }}>
            {timeUntil(arb.commence_time)}
          </span>
        </td>
        <td
          style={{
            padding: "11px 14px",
            verticalAlign: "middle",
            textAlign: "right",
          }}
        >
          <span
            style={{
              fontSize: 14,
              color: expanded
                ? "rgba(255,255,255,0.6)"
                : "rgba(255,255,255,0.25)",
              display: "inline-block",
              transform: expanded ? "rotate(180deg)" : undefined,
              transition: "transform 0.2s",
            }}
          >
            ▾
          </span>
        </td>
      </tr>
      {expanded && (
        <tr style={{ background: "rgba(120,110,255,0.03)" }}>
          <td colSpan={7} style={{ padding: "0 14px 14px" }}>
            <ExpandedRow arb={arb} stake={stake} onLogBet={(p) => onLogBet(arb, p)} />
          </td>
        </tr>
      )}
    </>
  );
}

const TUTORIAL_STEPS = [
  {
    icon: "🎯",
    title: "What is arbitrage?",
    body: "An arb is when two bookmakers disagree on the odds of the same event. By placing a bet on both sides, the maths guarantees you profit — regardless of who wins.",
  },
  {
    icon: "📋",
    title: "Reading the execution card",
    body: "Tap any arb to expand it. You'll see exactly which book, which selection, how much to stake, and the minimum odds to accept. Follow each step in order — place both legs before the odds move.",
  },
  {
    icon: "🔒",
    title: "Bookmaker risk ratings",
    body: (
      <div style={{ display: "grid", gap: 8 }}>
        {[
          { badge: "Exchange", color: "#6ee7b7", bg: "rgba(0,200,120,0.12)", border: "rgba(0,200,120,0.25)", desc: "Betfair, Smarkets, Matchbook — betting exchanges never restrict winning customers. Always the safest leg." },
          { badge: null, label: "No badge", color: "rgba(255,255,255,0.5)", bg: "rgba(255,255,255,0.05)", border: "rgba(255,255,255,0.1)", desc: "Major UK high-street books (Bet365, William Hill, Ladbrokes etc.) — well regulated, familiar to dispute." },
          { badge: "Check odds", color: "#fbbf24", bg: "rgba(251,191,36,0.1)", border: "rgba(251,191,36,0.2)", desc: "Smaller or EU-licensed books — fully accessible but may restrict profitable accounts faster. Keep stakes sensible." },
          { badge: "Verify", color: "#f97316", bg: "rgba(249,115,22,0.1)", border: "rgba(249,115,22,0.2)", desc: "EU books — confirm you can hold an account from the UK before placing a leg here." },
        ].map((r) => (
          <div key={r.desc} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
            <span style={{ fontSize: 10, fontWeight: 800, padding: "2px 7px", borderRadius: 999, color: r.color, background: r.bg, border: `1px solid ${r.border}`, whiteSpace: "nowrap", marginTop: 2, flexShrink: 0 }}>
              {r.badge ?? r.label}
            </span>
            <span style={{ fontSize: 13, color: "rgba(255,255,255,0.65)", lineHeight: 1.5 }}>{r.desc}</span>
          </div>
        ))}
      </div>
    ),
  },
  {
    icon: "⚡",
    title: "Speed matters",
    body: "Arbs are live odds mismatches — they close fast. Once you spot one, place both legs within a few minutes. The execution card tells you the minimum odds to accept, so if a leg has moved too far, skip that arb and wait for the next.",
  },
];

function TutorialModal({ onClose }: { onClose: (dontShow: boolean) => void }) {
  const [step, setStep] = useState(0);
  const [dontShow, setDontShow] = useState(false);
  const current = TUTORIAL_STEPS[step];
  const isLast = step === TUTORIAL_STEPS.length - 1;

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 300, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
      <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.75)", backdropFilter: "blur(6px)" }} onClick={() => onClose(dontShow)} />
      <div style={{
        position: "relative", width: "100%", maxWidth: 480,
        background: "rgba(10,14,22,0.98)",
        border: "1px solid rgba(255,255,255,0.1)",
        borderRadius: 24,
        boxShadow: "0 40px 100px rgba(0,0,0,0.7), 0 0 0 1px rgba(120,110,255,0.15)",
        overflow: "hidden",
      }}>
        {/* Progress dots */}
        <div style={{ display: "flex", gap: 5, padding: "18px 22px 0", justifyContent: "center" }}>
          {TUTORIAL_STEPS.map((_, i) => (
            <div key={i} style={{ width: i === step ? 20 : 6, height: 6, borderRadius: 999, transition: "all 0.3s", background: i === step ? "linear-gradient(90deg,rgba(120,110,255,1),rgba(0,190,255,1))" : "rgba(255,255,255,0.15)" }} />
          ))}
        </div>

        {/* Content */}
        <div style={{ padding: "20px 26px 0" }}>
          <div style={{ fontSize: 36, marginBottom: 10 }}>{current.icon}</div>
          <div style={{ fontSize: 20, fontWeight: 800, color: "white", marginBottom: 10, letterSpacing: -0.3 }}>{current.title}</div>
          <div style={{ fontSize: 14, color: "rgba(255,255,255,0.65)", lineHeight: 1.65 }}>
            {typeof current.body === "string" ? current.body : current.body}
          </div>
        </div>

        {/* Footer */}
        <div style={{ padding: "20px 26px 22px", display: "flex", flexDirection: "column" as const, gap: 14, marginTop: 8 }}>
          <div style={{ display: "flex", gap: 8 }}>
            {step > 0 && (
              <button onClick={() => setStep(s => s - 1)} style={{ flex: 1, padding: "11px 0", borderRadius: 12, border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.04)", color: "rgba(255,255,255,0.7)", fontSize: 14, fontWeight: 700, cursor: "pointer" }}>
                Back
              </button>
            )}
            <button
              onClick={() => isLast ? onClose(dontShow) : setStep(s => s + 1)}
              style={{ flex: 1, padding: "11px 0", borderRadius: 12, border: "1px solid rgba(120,110,255,0.45)", background: "linear-gradient(90deg,rgba(120,110,255,0.95),rgba(0,190,255,0.75))", color: "white", fontSize: 14, fontWeight: 800, cursor: "pointer" }}
            >
              {isLast ? "Got it, let's go →" : "Next →"}
            </button>
          </div>
          <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", alignSelf: "center" as const }}>
            <span style={{ width: 16, height: 16, borderRadius: 4, border: dontShow ? "none" : "1px solid rgba(255,255,255,0.25)", background: dontShow ? "#9be7bf" : "transparent", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, color: "#05060a", fontWeight: 900, flexShrink: 0 }} onClick={() => setDontShow(v => !v)}>
              {dontShow ? "✓" : ""}
            </span>
            <span style={{ fontSize: 12, color: "rgba(255,255,255,0.4)" }} onClick={() => setDontShow(v => !v)}>Don't show this again</span>
          </label>
        </div>
      </div>
    </div>
  );
}

export default function ArbitragePage() {
  const mob = useIsMobile();
  const [arbs2, setArbs2] = useState<Arb[]>([]);
  const [arbs3, setArbs3] = useState<Arb[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatedAt, setUpdatedAt] = useState<Date | null>(null);
  const [signedIn, setSignedIn] = useState(false);
  const [active, setActive] = useState(false);
  const [demo, setDemo] = useState(false);
  const [plan, setPlan] = useState<string | null>(null);
  const [trial, setTrial] = useState(false);
  const [trialDaysLeft, setTrialDaysLeft] = useState(0);
  const [noArbAccess, setNoArbAccess] = useState(false);
  const [hasLongRun, setHasLongRun] = useState(false);
  const [stakeInput, setStakeInput] = useState("50");
  const [tab, setTab] = useState<"2way" | "3way">("2way");
  const [marketCat, setMarketCat] = useState("all");
  const [minMarginPct, setMinMarginPct] = useState(0);
  const [sportFilter, setSportFilter] = useState("all");
  const [expandedId, setExpandedId] = useState<string | number | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);
  const [booksModalOpen, setBooksModalOpen] = useState(false);
  const [pinnedIds, setPinnedIds] = useState<Set<string | number>>(new Set());
  const [isRefreshing, setIsRefreshing] = useState(false);
  // myBooks = set of books the user has accounts with
  // null = not yet configured (show all arbs until they set up)
  const [myBooks, setMyBooks] = useState<Set<string> | null>(null);
  const [booksConfigured, setBooksConfigured] = useState(false);
  const [betLogTarget, setBetLogTarget] = useState<{ arb: Arb; profit: number } | null>(null);
  const [monthPnl, setMonthPnl] = useState<number | null>(null);
  const [tutorialOpen, setTutorialOpen] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("hitbet_my_books");
      if (saved !== null) {
        setMyBooks(new Set(JSON.parse(saved)));
        setBooksConfigured(true);
      }
    } catch {}
  }, []);

  useEffect(() => {
    try {
      if (localStorage.getItem("hitbet_tutorial_done") !== "true") {
        setTutorialOpen(true);
      }
    } catch {}
  }, []);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("hitbet_stake");
      if (saved !== null) setStakeInput(saved);
    } catch {}
  }, []);

  const loadPnl = useCallback(async () => {
    try {
      const res = await fetch("/api/bets?summary=true");
      if (res.ok) {
        const d = await res.json();
        if (typeof d.monthPnl === "number") setMonthPnl(d.monthPnl);
      }
    } catch {}
  }, []);

  function saveMyBooks(books: Set<string>) {
    setMyBooks(books);
    setBooksConfigured(true);
    try {
      localStorage.setItem(
        "hitbet_my_books",
        JSON.stringify(Array.from(books))
      );
    } catch {}
  }

  function toggleMyBook(book: string) {
    const current = myBooks ?? new Set<string>();
    const next = new Set(current);
    if (next.has(book)) next.delete(book);
    else next.add(book);
    saveMyBooks(next);
  }

  function selectAllBooks(books: string[]) {
    saveMyBooks(new Set(books));
  }

  function clearMyBooks() {
    setMyBooks(null);
    setBooksConfigured(false);
    try {
      localStorage.removeItem("hitbet_my_books");
    } catch {}
  }

  const load = useCallback(async () => {
    try {
      setError("");
      const res = await fetch("/api/arbs", { cache: "no-store" });
      const data: ApiResponse = await res.json();
      if (!res.ok) throw new Error(data?.error || "Failed to load");
      setArbs2(Array.isArray(data.arbs2way) ? data.arbs2way : []);
      setArbs3(Array.isArray(data.arbs3way) ? data.arbs3way : []);
      setSignedIn(Boolean(data.signedIn));
      setActive(Boolean(data.active));
      setDemo(Boolean(data.demo));
      setPlan(data.plan ?? null);
      setTrial(Boolean(data.trial));
      setTrialDaysLeft(data.trialDaysLeft ?? 0);
      setNoArbAccess(Boolean(data.noArbAccess));
      setHasLongRun(Boolean(data.hasLongRun));
      setUpdatedAt(new Date());
    } catch (e: any) {
      setError(e?.message || "Failed to load");
    } finally {
      setLoading(false);
    }
  }, []);

  async function manualRefresh() {
    setIsRefreshing(true);
    await load();
    setTimeout(() => setIsRefreshing(false), 500);
  }

  function togglePin(id: string | number) {
    setPinnedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  useEffect(() => {
    // Default sidebar open on desktop
    if (!mob) setSidebarOpen(true);
    load();
    const t = setInterval(load, 30000);
    return () => clearInterval(t);
  }, [load, mob]);

  useEffect(() => {
    if (signedIn) loadPnl();
  }, [signedIn, loadPnl]);

  const stake = Math.max(1, Number(stakeInput) || 50);
  const isElite = (plan === "longrun" || plan === "both") && active;
  const hasArbAccess =
    ((plan === "arbitrage" || plan === "both") && active) || isElite;
  const activeArbs = tab === "2way" ? arbs2 : arbs3;

  const sports = useMemo(
    () => ["all", ...Array.from(new Set(activeArbs.map((a) => a.sport_key)))],
    [activeArbs]
  );

  const allBooks = useMemo(() => {
    // Start with curated UK books list
    const base = new Set<string>(ALL_UK_BOOKS);
    // Add any books appearing in the feed that aren't in our list
    for (const a of [...arbs2, ...arbs3]) {
      if (a.leg1_book) base.add(a.leg1_book);
      if (a.leg2_book) base.add(a.leg2_book);
      if (a.leg3_book) base.add(a.leg3_book);
    }
    return Array.from(base);
  }, [arbs2, arbs3]);

  const filtered = useMemo(() => {
    const base = activeArbs.filter((a) => {
      if (Number(a.margin) * 100 < minMarginPct) return false;
      if (sportFilter !== "all" && a.sport_key !== sportFilter) return false;
      if (marketCat !== "all" && marketCategory(a.market_group) !== marketCat)
        return false;
      // If user has configured their books, only show arbs where ALL legs are in their books
      if (myBooks !== null && myBooks.size > 0) {
        const books = [a.leg1_book, a.leg2_book, a.leg3_book].filter(
          Boolean
        ) as string[];
        if (!books.every((b) => myBooks.has(b))) return false;
      }
      return true;
    });
    // Pinned arbs always stay at top regardless of filters
    const pinned = activeArbs.filter((a) => pinnedIds.has(a.id ?? ""));
    const unpinned = base.filter((a) => !pinnedIds.has(a.id ?? ""));
    return [...pinned, ...unpinned];
  }, [activeArbs, minMarginPct, sportFilter, marketCat, myBooks, pinnedIds]);

  const catCounts = useMemo(() => {
    const counts: Record<string, number> = { all: activeArbs.length };
    for (const a of activeArbs) {
      const cat = marketCategory(a.market_group);
      counts[cat] = (counts[cat] || 0) + 1;
    }
    return counts;
  }, [activeArbs]);

  const stats = useMemo(() => {
    const scale = stake / (Number(filtered[0]?.total_stake ?? 50) || 50);
    return {
      count: filtered.length,
      bestMargin: filtered.length
        ? Math.max(...filtered.map((a) => Number(a.margin) || 0))
        : 0,
      bestProfit: filtered.length
        ? Math.max(...filtered.map((a) => (Number(a.est_profit) || 0) * scale))
        : 0,
    };
  }, [filtered, stake]);

  function toggle(id: string | number | undefined, i: number) {
    const key = id ?? i;
    setExpandedId((p) => (p === key ? null : key));
  }

  const SidebarContent = () => (
    <>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "0 16px 16px",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
          marginBottom: 4,
        }}
      >
        <div
          style={{
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: "0.12em",
            color: "rgba(255,255,255,0.35)",
            textTransform: "uppercase",
          }}
        >
          Filters
        </div>
        {mob ? (
          <button
            style={{
              background: "none",
              border: "none",
              color: "rgba(255,255,255,0.5)",
              cursor: "pointer",
              fontSize: 18,
              lineHeight: 1,
            }}
            onClick={() => setFilterDrawerOpen(false)}
          >
            ✕
          </button>
        ) : (
          <button
            style={{
              background: "none",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: 8,
              color: "rgba(255,255,255,0.4)",
              cursor: "pointer",
              fontSize: 11,
              padding: "4px 7px",
            }}
            onClick={() => setSidebarOpen(false)}
          >
            ◀
          </button>
        )}
      </div>

      <div style={{ padding: "14px 16px 0" }}>
        <div
          style={{
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: "0.1em",
            color: "rgba(255,255,255,0.3)",
            textTransform: "uppercase",
            marginBottom: 8,
          }}
        >
          Total stake
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            border: "1px solid rgba(255,255,255,0.10)",
            background: "rgba(255,255,255,0.03)",
            borderRadius: 10,
            padding: "8px 10px",
          }}
        >
          <span
            style={{
              color: "rgba(255,255,255,0.5)",
              fontWeight: 700,
              fontSize: 13,
            }}
          >
            £
          </span>
          <input
            type="number"
            min="1"
            step="1"
            value={stakeInput}
            onChange={(e) => {
              setStakeInput(e.target.value);
              try { localStorage.setItem("hitbet_stake", e.target.value); } catch {}
            }}
            style={{
              background: "transparent",
              border: "none",
              outline: "none",
              color: "white",
              fontSize: 14,
              fontWeight: 700,
              width: "100%",
            }}
          />
        </div>
      </div>

      <div style={{ padding: "14px 16px 0" }}>
        <div
          style={{
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: "0.1em",
            color: "rgba(255,255,255,0.3)",
            textTransform: "uppercase",
            marginBottom: 8,
          }}
        >
          Min margin
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
          {[0, 0.5, 1, 2, 3].map((v) => (
            <button
              key={v}
              style={{
                fontSize: 11,
                fontWeight: 600,
                padding: "5px 8px",
                borderRadius: 8,
                border:
                  minMarginPct === v
                    ? "1px solid rgba(120,110,255,0.5)"
                    : "1px solid rgba(255,255,255,0.09)",
                background:
                  minMarginPct === v ? "rgba(120,110,255,0.15)" : "transparent",
                color: minMarginPct === v ? "white" : "rgba(255,255,255,0.5)",
                cursor: "pointer",
              }}
              onClick={() => setMinMarginPct(v)}
            >
              {v === 0 ? "Any" : `${v}%+`}
            </button>
          ))}
        </div>
      </div>

      <div style={{ padding: "14px 16px 0" }}>
        <div
          style={{
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: "0.1em",
            color: "rgba(255,255,255,0.3)",
            textTransform: "uppercase",
            marginBottom: 8,
          }}
        >
          Market
        </div>
        {MARKET_CATEGORIES.map((cat) => (
          <button
            key={cat.key}
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              width: "100%",
              padding: "8px 10px",
              marginBottom: 2,
              borderRadius: 10,
              border:
                marketCat === cat.key
                  ? "1px solid rgba(120,110,255,0.3)"
                  : "1px solid transparent",
              background:
                marketCat === cat.key ? "rgba(120,110,255,0.1)" : "transparent",
              color: marketCat === cat.key ? "white" : "rgba(255,255,255,0.5)",
              fontSize: 13,
              cursor: "pointer",
              textAlign: "left",
            }}
            onClick={() => {
              setMarketCat(cat.key);
              if (mob) setFilterDrawerOpen(false);
            }}
          >
            <span>{cat.label}</span>
            <span
              style={{
                fontSize: 11,
                padding: "1px 6px",
                borderRadius: 999,
                background: "rgba(255,255,255,0.07)",
                color: "rgba(255,255,255,0.4)",
              }}
            >
              {catCounts[cat.key] ?? 0}
            </span>
          </button>
        ))}
      </div>

      {sports.length > 2 && (
        <div style={{ padding: "14px 16px 0" }}>
          <div
            style={{
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: "0.1em",
              color: "rgba(255,255,255,0.3)",
              textTransform: "uppercase",
              marginBottom: 8,
            }}
          >
            Sport
          </div>
          <select
            style={{
              width: "100%",
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.09)",
              borderRadius: 10,
              color: "white",
              padding: "8px 10px",
              fontSize: 13,
              outline: "none",
              cursor: "pointer",
            }}
            value={sportFilter}
            onChange={(e) => setSportFilter(e.target.value)}
          >
            {sports.map((sp) => (
              <option key={sp} value={sp}>
                {sp === "all"
                  ? "All sports"
                  : `${sportEmoji(sp)} ${sp.replace(
                      /^(soccer|basketball|icehockey|americanfootball|baseball|tennis|mma)_/,
                      ""
                    )}`}
              </option>
            ))}
          </select>
        </div>
      )}

      <div style={{ padding: "14px 16px 0" }}>
        <div
          style={{
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: "0.1em",
            color: "rgba(255,255,255,0.3)",
            textTransform: "uppercase" as const,
            marginBottom: 8,
          }}
        >
          My books
        </div>
        <button
          onClick={() => setBooksModalOpen(true)}
          style={{
            width: "100%",
            padding: "10px 12px",
            borderRadius: 11,
            border: booksConfigured
              ? "1px solid rgba(0,255,140,0.25)"
              : "1px solid rgba(255,255,255,0.1)",
            background: booksConfigured
              ? "rgba(0,255,140,0.06)"
              : "rgba(255,255,255,0.03)",
            color: booksConfigured ? "#9be7bf" : "rgba(255,255,255,0.6)",
            fontSize: 13,
            fontWeight: 600,
            cursor: "pointer",
            textAlign: "left" as const,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <span>
            {booksConfigured && myBooks !== null
              ? `${myBooks.size} books selected`
              : "Select your books"}
          </span>
          <span style={{ fontSize: 12, opacity: 0.6 }}>✎</span>
        </button>
        {!booksConfigured && (
          <div
            style={{
              marginTop: 6,
              fontSize: 11,
              color: "rgba(255,255,255,0.3)",
              lineHeight: 1.5,
            }}
          >
            Only see arbs you can place
          </div>
        )}
      </div>

      <div
        style={{
          margin: "20px 16px 0",
          padding: 12,
          border: "1px solid rgba(255,255,255,0.07)",
          borderRadius: 12,
          background: "rgba(255,255,255,0.02)",
          display: "flex",
          justifyContent: "space-between",
        }}
      >
        <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)" }}>
          Plan
        </div>
        <div style={{ fontSize: 13, fontWeight: 700, color: "white" }}>
          {plan
            ? plan[0].toUpperCase() + plan.slice(1)
            : signedIn
            ? "None"
            : "Guest"}
        </div>
      </div>
    </>
  );

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      {betLogTarget && (
        <BetLogModal
          arb={betLogTarget.arb}
          profit={betLogTarget.profit}
          onClose={() => setBetLogTarget(null)}
          onSaved={() => { setBetLogTarget(null); loadPnl(); }}
        />
      )}

      {/* ── Tutorial Modal ── */}
      {tutorialOpen && (
        <TutorialModal
          onClose={(dontShow) => {
            setTutorialOpen(false);
            if (dontShow) {
              try { localStorage.setItem("hitbet_tutorial_done", "true"); } catch {}
            }
          }}
        />
      )}

      {/* ── My Books Modal ── */}
      {booksModalOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 200,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 16,
          }}
        >
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: "rgba(0,0,0,0.7)",
              backdropFilter: "blur(4px)",
            }}
            onClick={() => setBooksModalOpen(false)}
          />
          <div
            style={{
              position: "relative",
              width: "100%",
              maxWidth: 520,
              maxHeight: "85vh",
              background: "rgba(10,14,22,0.98)",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: 22,
              display: "flex",
              flexDirection: "column" as const,
              overflow: "hidden",
              boxShadow: "0 30px 80px rgba(0,0,0,0.6)",
            }}
          >
            {/* Modal header */}
            <div
              style={{
                padding: "20px 22px 16px",
                borderBottom: "1px solid rgba(255,255,255,0.07)",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
              }}
            >
              <div>
                <div
                  style={{
                    fontSize: 18,
                    fontWeight: 800,
                    color: "white",
                    marginBottom: 4,
                  }}
                >
                  My bookmakers
                </div>
                <div style={{ fontSize: 13, color: "rgba(255,255,255,0.5)" }}>
                  Tick the books you have accounts with — only matching arbs
                  will show.
                </div>
              </div>
              <button
                onClick={() => setBooksModalOpen(false)}
                style={{
                  background: "none",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: 8,
                  color: "rgba(255,255,255,0.5)",
                  cursor: "pointer",
                  fontSize: 16,
                  padding: "4px 9px",
                  marginLeft: 12,
                  flexShrink: 0,
                }}
              >
                ✕
              </button>
            </div>

            {/* Book list */}
            <div
              style={{
                overflowY: "auto" as const,
                flex: 1,
                padding: "12px 22px",
              }}
            >
              {UK_BOOKS.map((group) => (
                <div key={group.group} style={{ marginBottom: 20 }}>
                  <div
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      letterSpacing: "0.1em",
                      color: "rgba(255,255,255,0.35)",
                      textTransform: "uppercase" as const,
                      marginBottom: 8,
                    }}
                  >
                    {group.group}
                  </div>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(2, 1fr)",
                      gap: 6,
                    }}
                  >
                    {group.books.map((book) => {
                      const has = myBooks?.has(book) ?? false;
                      const inFeed = [...arbs2, ...arbs3].some(
                        (a) =>
                          a.leg1_book === book ||
                          a.leg2_book === book ||
                          a.leg3_book === book
                      );
                      return (
                        <button
                          key={book}
                          onClick={() => toggleMyBook(book)}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 8,
                            padding: "10px 12px",
                            borderRadius: 11,
                            border: has
                              ? "1px solid rgba(0,255,140,0.3)"
                              : "1px solid rgba(255,255,255,0.08)",
                            background: has
                              ? "rgba(0,255,140,0.08)"
                              : "rgba(255,255,255,0.02)",
                            color: has ? "#9be7bf" : "rgba(255,255,255,0.7)",
                            fontSize: 13,
                            fontWeight: has ? 700 : 400,
                            cursor: "pointer",
                            textAlign: "left" as const,
                            transition: "all 0.1s",
                          }}
                        >
                          <span
                            style={{
                              width: 16,
                              height: 16,
                              borderRadius: 4,
                              border: has
                                ? "none"
                                : "1px solid rgba(255,255,255,0.2)",
                              background: has ? "#9be7bf" : "transparent",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              flexShrink: 0,
                              fontSize: 10,
                              color: "#05060a",
                              fontWeight: 900,
                            }}
                          >
                            {has ? "✓" : ""}
                          </span>
                          <span style={{ flex: 1 }}>{book}</span>
                          {inFeed && (
                            <span
                              style={{
                                fontSize: 9,
                                padding: "1px 5px",
                                borderRadius: 999,
                                background: "rgba(120,110,255,0.15)",
                                border: "1px solid rgba(120,110,255,0.2)",
                                color: "rgba(180,170,255,0.8)",
                                fontWeight: 700,
                              }}
                            >
                              LIVE
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            {/* Modal footer */}
            <div
              style={{
                padding: "14px 22px",
                borderTop: "1px solid rgba(255,255,255,0.07)",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: 12,
              }}
            >
              <div style={{ fontSize: 13, color: "rgba(255,255,255,0.45)" }}>
                {myBooks !== null
                  ? `${myBooks.size} selected`
                  : "None selected — showing all arbs"}
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                {booksConfigured && (
                  <button
                    onClick={() => {
                      clearMyBooks();
                      setBooksModalOpen(false);
                    }}
                    style={{
                      padding: "9px 14px",
                      borderRadius: 10,
                      border: "1px solid rgba(255,255,255,0.1)",
                      background: "transparent",
                      color: "rgba(255,255,255,0.5)",
                      fontSize: 13,
                      cursor: "pointer",
                      fontWeight: 600,
                    }}
                  >
                    Show all
                  </button>
                )}
                <button
                  onClick={() => {
                    selectAllBooks(allBooks);
                  }}
                  style={{
                    padding: "9px 14px",
                    borderRadius: 10,
                    border: "1px solid rgba(255,255,255,0.1)",
                    background: "rgba(255,255,255,0.05)",
                    color: "rgba(255,255,255,0.7)",
                    fontSize: 13,
                    cursor: "pointer",
                    fontWeight: 600,
                  }}
                >
                  Select all
                </button>
                <button
                  onClick={() => setBooksModalOpen(false)}
                  style={{
                    padding: "9px 18px",
                    borderRadius: 10,
                    border: "1px solid rgba(120,110,255,0.4)",
                    background:
                      "linear-gradient(90deg, rgba(120,110,255,0.95), rgba(0,190,255,0.75))",
                    color: "white",
                    fontSize: 13,
                    cursor: "pointer",
                    fontWeight: 700,
                  }}
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Mobile filter drawer overlay ── */}
      {mob && filterDrawerOpen && (
        <div
          style={{ position: "fixed", inset: 0, zIndex: 100, display: "flex" }}
        >
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: "rgba(0,0,0,0.6)",
            }}
            onClick={() => setFilterDrawerOpen(false)}
          />
          <div
            style={{
              position: "relative",
              width: 260,
              background: "rgba(8,11,18,0.98)",
              borderRight: "1px solid rgba(255,255,255,0.08)",
              padding: "20px 0",
              overflowY: "auto",
              zIndex: 1,
            }}
          >
            <SidebarContent />
          </div>
        </div>
      )}

      {/* ── Desktop sidebar ── */}
      {!mob &&
        (sidebarOpen ? (
          <aside
            style={{
              width: 220,
              flexShrink: 0,
              borderRight: "1px solid rgba(255,255,255,0.06)",
              background: "rgba(8,11,18,0.7)",
              padding: "24px 0",
              display: "flex",
              flexDirection: "column",
              position: "sticky",
              top: 0,
              height: "100vh",
              overflowY: "auto",
            }}
          >
            <SidebarContent />
          </aside>
        ) : (
          <aside
            style={{
              width: 44,
              flexShrink: 0,
              borderRight: "1px solid rgba(255,255,255,0.06)",
              background: "rgba(8,11,18,0.7)",
              padding: "16px 0",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              position: "sticky",
              top: 0,
              height: "100vh",
            }}
          >
            <button
              style={{
                background: "none",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: 8,
                color: "rgba(255,255,255,0.4)",
                cursor: "pointer",
                fontSize: 11,
                padding: "6px 10px",
              }}
              onClick={() => setSidebarOpen(true)}
            >
              ▶
            </button>
          </aside>
        ))}

      {/* ── Main ── */}
      <main
        style={{
          flex: 1,
          padding: mob ? "16px 12px 60px" : "28px 32px 80px",
          minWidth: 0,
        }}
      >
        {trial && !loading && (
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: 12,
              padding: "12px 16px",
              marginBottom: 16,
              borderRadius: 14,
              border: "1px solid rgba(245,158,11,0.25)",
              background: "rgba(245,158,11,0.06)",
              flexWrap: "wrap",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span
                style={{
                  fontSize: 10,
                  fontWeight: 800,
                  letterSpacing: "0.1em",
                  padding: "3px 8px",
                  borderRadius: 999,
                  border: "1px solid rgba(245,158,11,0.35)",
                  background: "rgba(245,158,11,0.1)",
                  color: "rgba(245,158,11,0.9)",
                }}
              >
                FREE TRIAL
              </span>
              <span style={{ fontSize: 13, color: "rgba(255,255,255,0.55)" }}>
                {trialDaysLeft > 0
                  ? `${trialDaysLeft} day${trialDaysLeft !== 1 ? "s" : ""} left`
                  : "Trial ends today"}{" "}
                · card charged automatically
              </span>
            </div>
            <Link
              href="/pricing"
              style={{
                fontSize: 12,
                fontWeight: 700,
                padding: "7px 12px",
                borderRadius: 10,
                border: "1px solid rgba(245,158,11,0.3)",
                background: "rgba(245,158,11,0.1)",
                color: "rgba(245,158,11,0.9)",
                textDecoration: "none",
              }}
            >
              Manage
            </Link>
          </div>
        )}

        {/* Header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: mob ? "flex-start" : "flex-end",
            gap: 12,
            marginBottom: 16,
            flexWrap: "wrap",
          }}
        >
          <div>
            <h1
              style={{
                fontSize: mob ? 24 : 30,
                fontWeight: 900,
                letterSpacing: "-0.03em",
                margin: 0,
                color: "white",
              }}
            >
              Arbitrage feed
            </h1>
            <p
              style={{
                margin: "4px 0 0",
                fontSize: 13,
                color: "rgba(255,255,255,0.45)",
              }}
            >
              {demo ? "Demo mode" : "Live · auto-refreshes every 30s"}
            </p>
          </div>
          <div
            style={{
              display: "flex",
              gap: 8,
              alignItems: "center",
              flexWrap: "wrap",
            }}
          >
            {mob && (
              <button
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "8px 12px",
                  borderRadius: 10,
                  border: "1px solid rgba(255,255,255,0.1)",
                  background: "rgba(10,14,20,0.5)",
                  color: "white",
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: "pointer",
                }}
                onClick={() => setFilterDrawerOpen(true)}
              >
                ⚙ Filters{" "}
                {minMarginPct > 0 ||
                marketCat !== "all" ||
                sportFilter !== "all" ||
                booksConfigured
                  ? `(${
                      [
                        minMarginPct > 0,
                        marketCat !== "all",
                        sportFilter !== "all",
                        booksConfigured,
                      ].filter(Boolean).length
                    })`
                  : ""}
              </button>
            )}
            <div
              style={{
                display: "flex",
                gap: 4,
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: 12,
                padding: 3,
                background: "rgba(10,14,20,0.5)",
              }}
            >
              <button
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "7px 12px",
                  borderRadius: 9,
                  fontSize: 13,
                  fontWeight: 700,
                  cursor: "pointer",
                  border: "none",
                  background:
                    tab === "2way" ? "rgba(120,110,255,0.2)" : "transparent",
                  color: tab === "2way" ? "white" : "rgba(255,255,255,0.5)",
                }}
                onClick={() => {
                  setTab("2way");
                  setExpandedId(null);
                }}
              >
                2-Way{" "}
                <span
                  style={{
                    fontSize: 11,
                    padding: "1px 5px",
                    borderRadius: 999,
                    background: "rgba(255,255,255,0.08)",
                  }}
                >
                  {arbs2.length}
                </span>
              </button>
              <button
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "7px 12px",
                  borderRadius: 9,
                  fontSize: 13,
                  fontWeight: 700,
                  cursor: "pointer",
                  border: "none",
                  background:
                    tab === "3way" ? "rgba(120,110,255,0.2)" : "transparent",
                  color: tab === "3way" ? "white" : "rgba(255,255,255,0.5)",
                  opacity: !isElite ? 0.4 : 1,
                }}
                onClick={() => isElite && (setTab("3way"), setExpandedId(null))}
                title={!isElite ? "Elite plan required" : undefined}
              >
                3-Way{" "}
                <span
                  style={{
                    fontSize: 11,
                    padding: "1px 5px",
                    borderRadius: 999,
                    background: "rgba(255,255,255,0.08)",
                  }}
                >
                  {isElite ? arbs3.length : "🔒"}
                </span>
              </button>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <button
                onClick={manualRefresh}
                title="Refresh now"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 5,
                  padding: "6px 10px",
                  borderRadius: 9,
                  border: "1px solid rgba(255,255,255,0.1)",
                  background: "rgba(10,14,20,0.5)",
                  color: "rgba(255,255,255,0.6)",
                  fontSize: 12,
                  cursor: "pointer",
                  fontWeight: 600,
                  transition: "all 0.2s",
                }}
              >
                <span
                  style={{
                    display: "inline-block",
                    animation: isRefreshing
                      ? "spin 0.6s linear infinite"
                      : "none",
                  }}
                >
                  ↻
                </span>
                {mob ? "" : "Refresh"}
              </button>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  fontSize: 12,
                  color: "rgba(255,255,255,0.5)",
                  fontWeight: 600,
                }}
              >
                <div
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: 999,
                    background: "#22c55e",
                    boxShadow: "0 0 6px #22c55e",
                  }}
                />
                {updatedAt ? updatedAt.toLocaleTimeString("en-GB") : "—"}
              </div>
            </div>
          </div>
        </div>

        {/* Lock banners */}
        {!signedIn && !loading && (
          <div
            style={{
              border: "1px solid rgba(255,255,255,0.07)",
              background: "rgba(10,14,20,0.5)",
              borderRadius: 14,
              padding: "16px 18px",
              marginBottom: 16,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: 12,
              flexWrap: "wrap",
            }}
          >
            <div>
              <div
                style={{
                  color: "white",
                  fontSize: 15,
                  fontWeight: 800,
                  marginBottom: 3,
                }}
              >
                Sign in to access live arbs
              </div>
              <div style={{ color: "rgba(255,255,255,0.5)", fontSize: 13 }}>
                Guest mode — sign in and subscribe to unlock.
              </div>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <Link
                href="/login"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  padding: "9px 14px",
                  borderRadius: 11,
                  fontWeight: 700,
                  fontSize: 13,
                  color: "white",
                  background:
                    "linear-gradient(90deg, rgba(120,110,255,0.95), rgba(0,190,255,0.75))",
                  border: "1px solid rgba(120,110,255,0.4)",
                  textDecoration: "none",
                }}
              >
                Log in
              </Link>
              <Link
                href="/pricing"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  padding: "9px 14px",
                  borderRadius: 11,
                  fontWeight: 700,
                  fontSize: 13,
                  color: "rgba(255,255,255,0.75)",
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.09)",
                  textDecoration: "none",
                }}
              >
                View plans
              </Link>
            </div>
          </div>
        )}
        {signedIn && !active && !loading && (
          <div
            style={{
              border: "1px solid rgba(255,255,255,0.07)",
              background: "rgba(10,14,20,0.5)",
              borderRadius: 14,
              padding: "16px 18px",
              marginBottom: 16,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: 12,
              flexWrap: "wrap",
            }}
          >
            <div>
              <div
                style={{
                  color: "white",
                  fontSize: 15,
                  fontWeight: 800,
                  marginBottom: 3,
                }}
              >
                No active subscription
              </div>
              <div style={{ color: "rgba(255,255,255,0.5)", fontSize: 13 }}>
                Start a 24-hour free trial. Card required.
              </div>
            </div>
            <Link
              href="/pricing"
              style={{
                display: "inline-flex",
                alignItems: "center",
                padding: "9px 14px",
                borderRadius: 11,
                fontWeight: 700,
                fontSize: 13,
                color: "white",
                background:
                  "linear-gradient(90deg, rgba(120,110,255,0.95), rgba(0,190,255,0.75))",
                border: "1px solid rgba(120,110,255,0.4)",
                textDecoration: "none",
              }}
            >
              Try free — 24 hours
            </Link>
          </div>
        )}
        {noArbAccess && !loading && (
          <div
            style={{
              border: "1px solid rgba(120,110,255,0.2)",
              background: "rgba(120,110,255,0.06)",
              borderRadius: 14,
              padding: "16px 18px",
              marginBottom: 16,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: 12,
              flexWrap: "wrap",
            }}
          >
            <div>
              <div
                style={{
                  color: "white",
                  fontSize: 15,
                  fontWeight: 800,
                  marginBottom: 3,
                }}
              >
                You have Long Run — add Arbitrage for the arb feed
              </div>
              <div style={{ color: "rgba(255,255,255,0.5)", fontSize: 13 }}>
                Your Long Run plan gives you the value watchlist. Add Arbitrage
                (£39.99/mo) to unlock the live arb feed too.
              </div>
            </div>
            <Link
              href="/checkout?plan=arbitrage"
              style={{
                display: "inline-flex",
                alignItems: "center",
                padding: "9px 14px",
                borderRadius: 11,
                fontWeight: 700,
                fontSize: 13,
                color: "white",
                background:
                  "linear-gradient(90deg, rgba(120,110,255,0.95), rgba(0,190,255,0.75))",
                border: "1px solid rgba(120,110,255,0.4)",
                textDecoration: "none",
              }}
            >
              Add Arbitrage — £39.99/mo
            </Link>
          </div>
        )}

        {/* Stats */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: mob
              ? "repeat(2, 1fr)"
              : "repeat(4, minmax(0,1fr))",
            gap: 8,
            marginBottom: 16,
          }}
        >
          {[
            { l: "Showing", v: `${stats.count} arbs` },
            { l: "Best margin", v: pct(stats.bestMargin) },
            {
              l: mob ? "Best profit" : `Best profit @ £${stake}`,
              v: active ? `+${fmt(stats.bestProfit)}` : "—",
            },
            {
              l: "Month P&L",
              v:
                monthPnl !== null
                  ? monthPnl >= 0
                    ? `+${fmt(monthPnl)}`
                    : `-${fmt(Math.abs(monthPnl))}`
                  : "—",
            },
          ].map(({ l, v }) => (
            <div
              key={l}
              style={{
                border: "1px solid rgba(255,255,255,0.06)",
                background: "rgba(10,14,20,0.35)",
                borderRadius: 12,
                padding: "12px 14px",
              }}
            >
              <div
                style={{
                  fontSize: 11,
                  color: "rgba(255,255,255,0.4)",
                  marginBottom: 5,
                }}
              >
                {l}
              </div>
              <div
                style={{
                  fontSize: mob ? 16 : 18,
                  fontWeight: 800,
                  color: "white",
                  letterSpacing: "-0.02em",
                }}
              >
                {v}
              </div>
            </div>
          ))}
        </div>

        {/* Stake input on mobile (below stats) */}
        {mob && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              border: "1px solid rgba(255,255,255,0.10)",
              background: "rgba(10,14,20,0.5)",
              borderRadius: 12,
              padding: "10px 14px",
              marginBottom: 16,
            }}
          >
            <span
              style={{
                color: "rgba(255,255,255,0.5)",
                fontWeight: 700,
                fontSize: 14,
              }}
            >
              Total stake: £
            </span>
            <input
              type="number"
              min="1"
              step="1"
              value={stakeInput}
              onChange={(e) => {
              setStakeInput(e.target.value);
              try { localStorage.setItem("hitbet_stake", e.target.value); } catch {}
            }}
              style={{
                background: "transparent",
                border: "none",
                outline: "none",
                color: "white",
                fontSize: 15,
                fontWeight: 800,
                flex: 1,
              }}
            />
          </div>
        )}

        {/* My books setup prompt */}
        {!loading && !booksConfigured && allBooks.length > 0 && (
          <div
            style={{
              border: "1px solid rgba(120,110,255,0.2)",
              background: "rgba(120,110,255,0.06)",
              borderRadius: 14,
              padding: "14px 18px",
              marginBottom: 14,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: 12,
              flexWrap: "wrap" as const,
            }}
          >
            <div>
              <div
                style={{
                  fontSize: 14,
                  fontWeight: 700,
                  color: "white",
                  marginBottom: 3,
                }}
              >
                Set up your books
              </div>
              <div style={{ fontSize: 13, color: "rgba(255,255,255,0.55)" }}>
                Tick which bookmakers you have accounts with to only see arbs
                you can actually place.
              </div>
            </div>
            <button
              onClick={() => setBooksModalOpen(true)}
              style={{
                display: "inline-flex",
                alignItems: "center",
                padding: "9px 14px",
                borderRadius: 11,
                fontWeight: 700,
                fontSize: 13,
                color: "white",
                background:
                  "linear-gradient(90deg, rgba(120,110,255,0.95), rgba(0,190,255,0.75))",
                border: "1px solid rgba(120,110,255,0.4)",
                cursor: "pointer",
                whiteSpace: "nowrap" as const,
              }}
            >
              Select my books
            </button>
          </div>
        )}

        {loading && (
          <div
            style={{
              border: "1px solid rgba(255,255,255,0.06)",
              background: "rgba(10,14,20,0.35)",
              borderRadius: 12,
              padding: 16,
              color: "rgba(255,255,255,0.55)",
              fontSize: 14,
            }}
          >
            Loading arbs…
          </div>
        )}
        {!loading && error && (
          <div
            style={{
              border: "1px solid rgba(255,90,90,0.22)",
              background: "rgba(10,14,20,0.35)",
              borderRadius: 12,
              padding: 16,
              color: "#ffb4b4",
              fontSize: 14,
            }}
          >
            {error}
          </div>
        )}

        {!loading &&
          !error &&
          (tab === "2way" || isElite) &&
          (filtered.length === 0 ? (
            <div
              style={{
                border: "1px solid rgba(255,255,255,0.06)",
                background: "rgba(10,14,20,0.35)",
                borderRadius: 12,
                padding: 16,
                color: "rgba(255,255,255,0.55)",
                fontSize: 14,
              }}
            >
              {demo
                ? "Subscribe to see live arbs."
                : "No arbs match current filters."}
            </div>
          ) : (
            <div
              style={{
                border: "1px solid rgba(255,255,255,0.06)",
                borderRadius: 16,
                overflow: "hidden",
                background: "rgba(8,11,18,0.4)",
              }}
            >
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr>
                    {mob ? (
                      <>
                        <th
                          style={{
                            fontSize: 11,
                            fontWeight: 600,
                            color: "rgba(255,255,255,0.3)",
                            textAlign: "left",
                            padding: "10px 12px",
                            borderBottom: "1px solid rgba(255,255,255,0.05)",
                            background: "rgba(0,0,0,0.15)",
                          }}
                        >
                          Event
                        </th>
                        <th
                          style={{
                            fontSize: 11,
                            fontWeight: 600,
                            color: "rgba(255,255,255,0.3)",
                            textAlign: "right",
                            padding: "10px 12px",
                            borderBottom: "1px solid rgba(255,255,255,0.05)",
                            background: "rgba(0,0,0,0.15)",
                          }}
                        >
                          Margin / Profit
                        </th>
                      </>
                    ) : (
                      [
                        "Event",
                        "Leg 1",
                        tab === "3way" ? "Leg 2 · 3" : "Leg 2",
                        "Margin",
                        "Profit",
                        "Starts",
                        "",
                      ].map((h, i) => (
                        <th
                          key={i}
                          style={{
                            fontSize: 11,
                            fontWeight: 600,
                            color: "rgba(255,255,255,0.3)",
                            textAlign: i >= 3 ? "right" : "left",
                            padding: "10px 14px",
                            borderBottom: "1px solid rgba(255,255,255,0.05)",
                            letterSpacing: "0.04em",
                            background: "rgba(0,0,0,0.15)",
                          }}
                        >
                          {h}
                        </th>
                      ))
                    )}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((a, i) => (
                    <ArbRow
                      key={a.id ?? i}
                      arb={a}
                      stake={stake}
                      expanded={expandedId === (a.id ?? i)}
                      onToggle={() => toggle(a.id, i)}
                      mob={mob}
                      pinned={pinnedIds.has(a.id ?? i)}
                      onPin={() => togglePin(a.id ?? i)}
                      onLogBet={(logArb, profit) => setBetLogTarget({ arb: logArb, profit })}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          ))}
      </main>
    </div>
  );
}
