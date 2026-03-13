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

const MARKET_CATEGORIES = [
  { key: "all", label: "All markets" },
  { key: "moneyline", label: "Moneyline" },
  { key: "spreads", label: "Spreads" },
  { key: "totals", label: "Totals" },
  { key: "periods", label: "Halves / Periods" },
  { key: "props", label: "Player Props" },
];

function ExpandedRow({ arb, stake }: { arb: Arb; stake: number }) {
  const scale = stake / (Number(arb.total_stake ?? 50) || 50);
  const s1 = Number(arb.leg1_stake) * scale;
  const s2 = Number(arb.leg2_stake) * scale;
  const s3 = arb.leg3_stake ? Number(arb.leg3_stake) * scale : null;
  const profit = Number(arb.est_profit) * scale;
  const [checked, setChecked] = useState([false, false, false]);

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
        padding: 16,
        background: "rgba(8,11,18,0.6)",
      }}
    >
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(2, 1fr)",
          gap: 8,
          marginBottom: 16,
        }}
      >
        {[
          { l: "Total stake", v: fmt(stake) },
          { l: "Profit", v: `+${fmt(profit)}`, green: true },
          { l: "Margin", v: pct(arb.margin) },
          { l: "Payout", v: fmt(stake + profit) },
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
                fontSize: 14,
                fontWeight: 800,
                color: green ? "#9be7bf" : "white",
              }}
            >
              {v}
            </div>
          </div>
        ))}
      </div>
      <div
        style={{
          fontSize: 10,
          fontWeight: 700,
          letterSpacing: "0.1em",
          color: "rgba(255,255,255,0.3)",
          textTransform: "uppercase",
          marginBottom: 10,
        }}
      >
        How to place this arb
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {legs.map((leg, i) => (
          <div
            key={i}
            style={{
              display: "flex",
              gap: 12,
              padding: "14px 14px",
              borderRadius: 12,
              border: checked[i]
                ? "1px solid rgba(0,255,140,0.2)"
                : "1px solid rgba(255,255,255,0.07)",
              background: checked[i]
                ? "rgba(0,255,140,0.04)"
                : "rgba(255,255,255,0.02)",
              cursor: "pointer",
              opacity: checked[i] ? 0.65 : 1,
            }}
            onClick={() =>
              setChecked((prev) => prev.map((v, idx) => (idx === i ? !v : v)))
            }
          >
            <div
              style={{
                width: 28,
                height: 28,
                borderRadius: 999,
                background: checked[i]
                  ? "rgba(0,255,140,0.15)"
                  : "rgba(120,110,255,0.2)",
                border: checked[i]
                  ? "1px solid rgba(0,255,140,0.3)"
                  : "1px solid rgba(120,110,255,0.4)",
                color: checked[i] ? "#9be7bf" : "white",
                fontSize: 13,
                fontWeight: 800,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
                marginTop: 2,
              }}
            >
              {checked[i] ? "✓" : i + 1}
            </div>
            <div style={{ flex: 1 }}>
              {leg.wait && (
                <div
                  style={{
                    fontSize: 11,
                    color: "rgba(245,158,11,0.85)",
                    marginBottom: 5,
                    fontWeight: 600,
                  }}
                >
                  ⏱ Wait 20–30 seconds first
                </div>
              )}
              <div
                style={{
                  fontSize: 13,
                  color: "rgba(255,255,255,0.6)",
                  marginBottom: 4,
                }}
              >
                Go to{" "}
                <span style={{ color: "white", fontWeight: 700 }}>
                  {leg.book}
                </span>{" "}
                and back:
              </div>
              <div
                style={{
                  fontSize: 14,
                  fontWeight: 800,
                  color: "white",
                  marginBottom: 8,
                }}
              >
                "{leg.pick}
                {leg.point ? ` (${leg.point})` : ""}"
              </div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                <span
                  style={{
                    fontSize: 12,
                    fontWeight: 700,
                    padding: "4px 10px",
                    borderRadius: 999,
                    background: "rgba(120,110,255,0.15)",
                    border: "1px solid rgba(120,110,255,0.25)",
                    color: "#98b8ff",
                  }}
                >
                  @ {Number(leg.odds).toFixed(2)}
                </span>
                <span
                  style={{
                    fontSize: 12,
                    fontWeight: 700,
                    padding: "4px 10px",
                    borderRadius: 999,
                    background: "rgba(255,255,255,0.06)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    color: "white",
                  }}
                >
                  £{Math.round(leg.stake)}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
      {allDone && (
        <div
          style={{
            marginTop: 12,
            padding: "12px 14px",
            borderRadius: 12,
            background: "rgba(0,255,140,0.07)",
            border: "1px solid rgba(0,255,140,0.18)",
            fontSize: 14,
            color: "#9be7bf",
            fontWeight: 600,
          }}
        >
          ✅ Locked in for <strong>+{fmt(profit)}</strong> guaranteed.
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
}: {
  arb: Arb;
  stake: number;
  expanded: boolean;
  onToggle: () => void;
  mob: boolean;
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
              {arb.leg1_book} @ {Number(arb.leg1_odds).toFixed(2)} ·{" "}
              {arb.leg2_book} @ {Number(arb.leg2_odds).toFixed(2)}
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
          </td>
        </tr>
        {expanded && (
          <tr style={{ background: "rgba(120,110,255,0.03)" }}>
            <td colSpan={2} style={{ padding: "0 12px 12px" }}>
              <ExpandedRow arb={arb} stake={stake} />
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
            {arb.leg1_book}{" "}
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
            {arb.leg2_book}{" "}
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
                {arb.leg3_book}{" "}
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
            <ExpandedRow arb={arb} stake={stake} />
          </td>
        </tr>
      )}
    </>
  );
}

export default function DashboardPage() {
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
  const [stakeInput, setStakeInput] = useState("50");
  const [tab, setTab] = useState<"2way" | "3way">("2way");
  const [marketCat, setMarketCat] = useState("all");
  const [minMarginPct, setMinMarginPct] = useState(0);
  const [sportFilter, setSportFilter] = useState("all");
  const [expandedId, setExpandedId] = useState<string | number | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false); // closed by default on mobile
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);
  // myBooks = set of books the user has accounts with
  // null = not yet configured (show all arbs until they set up)
  const [myBooks, setMyBooks] = useState<Set<string> | null>(null);
  const [booksConfigured, setBooksConfigured] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("hitbet_my_books");
      if (saved !== null) {
        setMyBooks(new Set(JSON.parse(saved)));
        setBooksConfigured(true);
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
      setUpdatedAt(new Date());
    } catch (e: any) {
      setError(e?.message || "Failed to load");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Default sidebar open on desktop
    if (!mob) setSidebarOpen(true);
    load();
    const t = setInterval(load, 30000);
    return () => clearInterval(t);
  }, [load, mob]);

  const stake = Math.max(1, Number(stakeInput) || 50);
  const isElite = plan === "elite" && active;
  const activeArbs = tab === "2way" ? arbs2 : arbs3;

  const sports = useMemo(
    () => ["all", ...Array.from(new Set(activeArbs.map((a) => a.sport_key)))],
    [activeArbs]
  );

  const allBooks = useMemo(() => {
    const set = new Set<string>();
    for (const a of [...arbs2, ...arbs3]) {
      if (a.leg1_book) set.add(a.leg1_book);
      if (a.leg2_book) set.add(a.leg2_book);
      if (a.leg3_book) set.add(a.leg3_book);
    }
    return Array.from(set).sort();
  }, [arbs2, arbs3]);

  const filtered = useMemo(
    () =>
      activeArbs.filter((a) => {
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
      }),
    [activeArbs, minMarginPct, sportFilter, marketCat, myBooks]
  );

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
            onChange={(e) => setStakeInput(e.target.value)}
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

      {allBooks.length > 0 && (
        <div style={{ padding: "14px 16px 0" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 6,
            }}
          >
            <div
              style={{
                fontSize: 10,
                fontWeight: 700,
                letterSpacing: "0.1em",
                color: "rgba(255,255,255,0.3)",
                textTransform: "uppercase" as const,
              }}
            >
              My books
            </div>
            <div style={{ display: "flex", gap: 6 }}>
              <button
                onClick={() => selectAllBooks(allBooks)}
                style={{
                  fontSize: 10,
                  color: "rgba(255,255,255,0.4)",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  textDecoration: "underline",
                }}
              >
                All
              </button>
              {booksConfigured && (
                <button
                  onClick={clearMyBooks}
                  style={{
                    fontSize: 10,
                    color: "rgba(255,255,255,0.4)",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    textDecoration: "underline",
                  }}
                >
                  Reset
                </button>
              )}
            </div>
          </div>
          {!booksConfigured && (
            <div
              style={{
                fontSize: 11,
                color: "rgba(255,255,255,0.35)",
                marginBottom: 8,
                lineHeight: 1.5,
                padding: "8px 10px",
                borderRadius: 8,
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.06)",
              }}
            >
              Tick the books you have accounts with — only those arbs will show.
            </div>
          )}
          <div
            style={{
              display: "flex",
              flexDirection: "column" as const,
              gap: 3,
              maxHeight: 220,
              overflowY: "auto" as const,
            }}
          >
            {allBooks.map((book) => {
              const has = myBooks === null ? false : myBooks.has(book);
              return (
                <button
                  key={book}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    width: "100%",
                    padding: "7px 10px",
                    borderRadius: 8,
                    border: has
                      ? "1px solid rgba(0,255,140,0.25)"
                      : "1px solid rgba(255,255,255,0.06)",
                    background: has
                      ? "rgba(0,255,140,0.07)"
                      : "rgba(255,255,255,0.02)",
                    color: has ? "#9be7bf" : "rgba(255,255,255,0.5)",
                    fontSize: 12,
                    cursor: "pointer",
                    textAlign: "left" as const,
                    transition: "all 0.1s",
                  }}
                  onClick={() => toggleMyBook(book)}
                >
                  <span>{book}</span>
                  <span style={{ fontSize: 13, fontWeight: 700 }}>
                    {has ? "✓" : ""}
                  </span>
                </button>
              );
            })}
          </div>
          {booksConfigured && myBooks !== null && (
            <div
              style={{
                marginTop: 8,
                fontSize: 11,
                color: "rgba(255,255,255,0.35)",
              }}
            >
              {myBooks.size} of {allBooks.length} books selected
            </div>
          )}
        </div>
      )}

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
                Start a 7-day free trial. Card required.
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
              Try free — 7 days
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
              l: "Plan",
              v: plan
                ? plan[0].toUpperCase() + plan.slice(1)
                : signedIn
                ? "None"
                : "Guest",
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
              onChange={(e) => setStakeInput(e.target.value)}
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
              onClick={() =>
                mob ? setFilterDrawerOpen(true) : setSidebarOpen(true)
              }
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
