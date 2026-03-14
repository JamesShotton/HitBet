"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";

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

type ValueBet = {
  id: number;
  event: string;
  sport_key: string;
  market_group: string;
  commence_time: string;
  selection: string;
  soft_book: string;
  soft_odds: number;
  point: string | null;
  sharp_book: string;
  sharp_odds: number;
  ev_pct: number;
  true_prob: number;
  soft_implied_prob: number;
  kelly_stake: number;
  expected_profit: number;
  created_at: string;
};

function timeUntil(v: string) {
  const d = new Date(v);
  if (isNaN(d.getTime())) return "—";
  const diff = d.getTime() - Date.now();
  if (diff < 0) return "In play";
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `in ${mins}m`;
  return `in ${Math.floor(mins / 60)}h`;
}

function sportEmoji(sport: string) {
  const s = sport.toLowerCase();
  if (s.includes("soccer")) return "⚽";
  if (s.includes("basket") || s.includes("nba")) return "🏀";
  if (s.includes("tennis")) return "🎾";
  if (s.includes("hockey") || s.includes("nhl")) return "🏒";
  if (s.includes("nfl") || s.includes("american")) return "🏈";
  if (s.includes("baseball") || s.includes("mlb")) return "⚾";
  return "🎯";
}

function evColor(ev: number) {
  if (ev >= 15) return "#9be7bf";
  if (ev >= 10) return "#98b8ff";
  if (ev >= 5) return "rgba(255,255,255,0.85)";
  return "rgba(255,255,255,0.5)";
}

function ValueCard({ bet }: { bet: ValueBet }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div
      style={{
        border: "1px solid rgba(255,255,255,0.08)",
        background: "rgba(10,14,20,0.45)",
        borderRadius: 16,
        overflow: "hidden",
        marginBottom: 10,
      }}
    >
      {/* Main row */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr auto",
          gap: 12,
          padding: "14px 18px",
          cursor: "pointer",
          alignItems: "center",
        }}
        onClick={() => setExpanded((p) => !p)}
      >
        <div>
          <div
            style={{
              fontSize: 15,
              fontWeight: 700,
              color: "white",
              marginBottom: 4,
            }}
          >
            {bet.event}
          </div>
          <div
            style={{
              display: "flex",
              gap: 8,
              alignItems: "center",
              flexWrap: "wrap",
            }}
          >
            <span style={{ fontSize: 11, color: "rgba(255,255,255,0.4)" }}>
              {sportEmoji(bet.sport_key)}
            </span>
            <span style={{ fontSize: 13, fontWeight: 700, color: "white" }}>
              {bet.selection}
              {bet.point ? ` (${bet.point})` : ""}
            </span>
            <span style={{ fontSize: 12, color: "rgba(255,255,255,0.5)" }}>
              @ {Number(bet.soft_odds).toFixed(2)} on {bet.soft_book}
            </span>
          </div>
          <div
            style={{
              marginTop: 6,
              fontSize: 12,
              color: "rgba(255,255,255,0.4)",
            }}
          >
            {timeUntil(bet.commence_time)}
          </div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div
            style={{
              fontSize: 22,
              fontWeight: 900,
              color: evColor(bet.ev_pct),
              letterSpacing: "-0.5px",
            }}
          >
            +{bet.ev_pct}%
          </div>
          <div
            style={{
              fontSize: 11,
              color: "rgba(255,255,255,0.4)",
              marginTop: 2,
            }}
          >
            edge vs {bet.sharp_book}
          </div>
          <div
            style={{
              fontSize: 14,
              fontWeight: 700,
              color: "rgba(255,255,255,0.7)",
              marginTop: 4,
            }}
          >
            £{Number(bet.expected_profit).toFixed(2)} EV
          </div>
        </div>
      </div>

      {/* Expanded detail */}
      {expanded && (
        <div
          style={{
            borderTop: "1px solid rgba(255,255,255,0.06)",
            padding: "16px 18px",
            background: "rgba(120,110,255,0.03)",
          }}
        >
          {/* Stats grid */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: 8,
              marginBottom: 16,
            }}
          >
            {[
              {
                l: "Sharp price",
                v: `${Number(bet.sharp_odds).toFixed(2)} (${bet.sharp_book})`,
                sub: `True prob: ${bet.true_prob}%`,
              },
              {
                l: "Soft price",
                v: `${Number(bet.soft_odds).toFixed(2)} (${bet.soft_book})`,
                sub: `Implied: ${bet.soft_implied_prob}%`,
              },
              {
                l: "Kelly stake",
                v: `£${Number(bet.kelly_stake).toFixed(2)}`,
                sub: `EV: £${Number(bet.expected_profit).toFixed(2)}`,
              },
            ].map(({ l, v, sub }) => (
              <div
                key={l}
                style={{
                  background: "rgba(255,255,255,0.03)",
                  borderRadius: 12,
                  padding: "12px 14px",
                  border: "1px solid rgba(255,255,255,0.06)",
                }}
              >
                <div
                  style={{
                    fontSize: 11,
                    color: "rgba(255,255,255,0.4)",
                    marginBottom: 6,
                  }}
                >
                  {l}
                </div>
                <div
                  style={{
                    fontSize: 13,
                    fontWeight: 700,
                    color: "white",
                    marginBottom: 2,
                  }}
                >
                  {v}
                </div>
                <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)" }}>
                  {sub}
                </div>
              </div>
            ))}
          </div>

          {/* How to place */}
          <div
            style={{
              background: "rgba(255,255,255,0.02)",
              borderRadius: 12,
              padding: "14px 16px",
              border: "1px solid rgba(255,255,255,0.06)",
            }}
          >
            <div
              style={{
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: "0.1em",
                color: "rgba(255,255,255,0.3)",
                textTransform: "uppercase",
                marginBottom: 10,
              }}
            >
              How to place
            </div>
            <div
              style={{
                fontSize: 14,
                color: "rgba(255,255,255,0.8)",
                lineHeight: 1.7,
              }}
            >
              Go to <strong>{bet.soft_book}</strong> and back{" "}
              <strong>
                "{bet.selection}
                {bet.point ? ` (${bet.point})` : ""}"
              </strong>{" "}
              at odds{" "}
              <strong style={{ color: "#98b8ff" }}>
                {Number(bet.soft_odds).toFixed(2)}
              </strong>{" "}
              or better.
            </div>
            <div
              style={{
                marginTop: 10,
                fontSize: 13,
                color: "rgba(255,255,255,0.5)",
                lineHeight: 1.6,
              }}
            >
              Kelly suggests{" "}
              <strong style={{ color: "white" }}>
                £{Number(bet.kelly_stake).toFixed(2)}
              </strong>{" "}
              — this is based on a 20× stake bankroll. Adjust to your own
              bankroll size. Only place if the odds are still{" "}
              {Number(bet.soft_odds).toFixed(2)} or above.
            </div>
          </div>

          {/* Risk warning */}
          <div
            style={{
              marginTop: 10,
              padding: "10px 14px",
              borderRadius: 10,
              background: "rgba(245,158,11,0.06)",
              border: "1px solid rgba(245,158,11,0.18)",
              fontSize: 12,
              color: "rgba(245,158,11,0.8)",
              lineHeight: 1.6,
            }}
          >
            ⚠️ This is not a guaranteed profit. Value bets win over volume —
            expect variance on individual bets. Never bet more than you can
            afford to lose on a single outcome.
          </div>
        </div>
      )}
    </div>
  );
}

export default function ValuePage() {
  const mob = useIsMobile();
  const [bets, setBets] = useState<ValueBet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [signedIn, setSignedIn] = useState(false);
  const [isElite, setIsElite] = useState(false);
  const [active, setActive] = useState(false);
  const [updatedAt, setUpdatedAt] = useState<Date | null>(null);
  const [minEv, setMinEv] = useState(5);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      setError("");
      const res = await fetch("/api/value", { cache: "no-store" });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Failed to load");
      setBets(Array.isArray(data.bets) ? data.bets : []);
      setSignedIn(Boolean(data.signedIn));
      setIsElite(Boolean(data.isElite));
      setActive(Boolean(data.active));
      setUpdatedAt(new Date());
    } catch (e: any) {
      setError(e?.message || "Failed to load");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
    const t = setInterval(load, 60000);
    return () => clearInterval(t);
  }, [load]);

  async function manualRefresh() {
    setIsRefreshing(true);
    await load();
    setTimeout(() => setIsRefreshing(false), 500);
  }

  const filtered = useMemo(
    () => bets.filter((b) => Number(b.ev_pct) >= minEv),
    [bets, minEv]
  );

  const stats = useMemo(
    () => ({
      count: filtered.length,
      bestEv: filtered.length
        ? Math.max(...filtered.map((b) => Number(b.ev_pct)))
        : 0,
      avgEv: filtered.length
        ? filtered.reduce((s, b) => s + Number(b.ev_pct), 0) / filtered.length
        : 0,
      totalExpectedProfit: filtered.reduce(
        (s, b) => s + Number(b.expected_profit),
        0
      ),
    }),
    [filtered]
  );

  // Demo bets for non-Elite users
  const demoBets: ValueBet[] = [
    {
      id: 1,
      event: "Arsenal vs Chelsea",
      sport_key: "soccer_epl",
      market_group: "h2h",
      commence_time: new Date(Date.now() + 3600000).toISOString(),
      selection: "Arsenal win",
      soft_book: "Bet365",
      soft_odds: 2.4,
      point: null,
      sharp_book: "Betfair Exchange",
      sharp_odds: 2.1,
      ev_pct: 14.3,
      true_prob: 47.6,
      soft_implied_prob: 41.7,
      kelly_stake: 18.5,
      expected_profit: 2.65,
      created_at: new Date().toISOString(),
    },
    {
      id: 2,
      event: "Lakers vs Celtics",
      sport_key: "basketball_nba",
      market_group: "totals",
      commence_time: new Date(Date.now() + 7200000).toISOString(),
      selection: "Over 224.5",
      soft_book: "William Hill",
      soft_odds: 2.2,
      point: "224.5",
      sharp_book: "Betfair Exchange",
      sharp_odds: 1.95,
      ev_pct: 12.8,
      true_prob: 51.3,
      soft_implied_prob: 45.5,
      kelly_stake: 14.2,
      expected_profit: 1.82,
      created_at: new Date().toISOString(),
    },
    {
      id: 3,
      event: "Djokovic vs Alcaraz",
      sport_key: "tennis_atp",
      market_group: "h2h",
      commence_time: new Date(Date.now() + 10800000).toISOString(),
      selection: "Alcaraz win",
      soft_book: "Coral",
      soft_odds: 1.85,
      point: null,
      sharp_book: "Betfair Exchange",
      sharp_odds: 1.68,
      ev_pct: 10.1,
      true_prob: 59.5,
      soft_implied_prob: 54.1,
      kelly_stake: 11.8,
      expected_profit: 1.19,
      created_at: new Date().toISOString(),
    },
  ];

  return (
    <div className="narrowPage">
      <div style={{ padding: mob ? "24px 0 60px" : "40px 0 80px" }}>
        {/* Header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
            gap: 16,
            marginBottom: 8,
            flexWrap: "wrap",
          }}
        >
          <div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                marginBottom: 8,
              }}
            >
              <h1
                style={{
                  fontSize: mob ? 26 : 34,
                  fontWeight: 900,
                  letterSpacing: "-0.03em",
                  margin: 0,
                  color: "white",
                }}
              >
                Value Watchlist
              </h1>
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 800,
                  padding: "3px 8px",
                  borderRadius: 999,
                  background: "rgba(0,190,255,0.12)",
                  border: "1px solid rgba(0,190,255,0.25)",
                  color: "rgba(100,210,255,0.9)",
                  letterSpacing: "0.05em",
                }}
              >
                ELITE
              </span>
            </div>
            <p
              style={{
                margin: 0,
                fontSize: 13,
                color: "rgba(255,255,255,0.5)",
                maxWidth: 560,
                lineHeight: 1.6,
              }}
            >
              Bets where soft bookmakers are offering significantly better odds
              than the true market price — mathematically profitable over
              volume, not guaranteed on any single bet.
            </p>
          </div>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <button
              onClick={manualRefresh}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 5,
                padding: "8px 12px",
                borderRadius: 10,
                border: "1px solid rgba(255,255,255,0.1)",
                background: "rgba(10,14,20,0.5)",
                color: "rgba(255,255,255,0.6)",
                fontSize: 13,
                cursor: "pointer",
                fontWeight: 600,
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
              Refresh
            </button>
            {updatedAt && (
              <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)" }}>
                {updatedAt.toLocaleTimeString("en-GB")}
              </div>
            )}
          </div>
        </div>

        {/* What is this explainer */}
        <div
          style={{
            padding: "14px 16px",
            borderRadius: 14,
            border: "1px solid rgba(120,110,255,0.15)",
            background: "rgba(120,110,255,0.05)",
            marginBottom: 20,
          }}
        >
          <div
            style={{
              fontSize: 13,
              color: "rgba(255,255,255,0.6)",
              lineHeight: 1.7,
            }}
          >
            <strong style={{ color: "white" }}>How this works:</strong> We
            compare soft bookmaker prices against Betfair Exchange (the sharp
            market). When a soft book is significantly above the true price,
            that's a value bet. Place enough of them and the edge compounds into
            profit — even though individual bets can lose.
          </div>
        </div>

        {/* Not Elite gate */}
        {!loading && signedIn && !isElite && (
          <div
            style={{
              border: "1px solid rgba(0,190,255,0.2)",
              background: "rgba(0,190,255,0.05)",
              borderRadius: 16,
              padding: "20px 22px",
              marginBottom: 20,
            }}
          >
            <div
              style={{
                fontSize: 17,
                fontWeight: 800,
                color: "white",
                marginBottom: 6,
              }}
            >
              Elite plan required
            </div>
            <div
              style={{
                fontSize: 13,
                color: "rgba(255,255,255,0.55)",
                marginBottom: 16,
                lineHeight: 1.6,
              }}
            >
              The value watchlist is an Elite feature. Upgrade to access
              positive EV bets alongside your arb feed.
            </div>
            <Link
              href="/pricing"
              style={{
                display: "inline-flex",
                alignItems: "center",
                padding: "10px 18px",
                borderRadius: 12,
                fontWeight: 700,
                fontSize: 14,
                color: "white",
                background:
                  "linear-gradient(90deg, rgba(120,110,255,0.95), rgba(0,190,255,0.75))",
                border: "1px solid rgba(120,110,255,0.4)",
                textDecoration: "none",
              }}
            >
              {active ? "Upgrade to Elite" : "Try Elite free — 7 days"}
            </Link>
          </div>
        )}

        {!loading && !signedIn && (
          <div
            style={{
              border: "1px solid rgba(255,255,255,0.07)",
              background: "rgba(10,14,20,0.5)",
              borderRadius: 14,
              padding: "16px 18px",
              marginBottom: 20,
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
                Sign in to access value bets
              </div>
              <div style={{ color: "rgba(255,255,255,0.5)", fontSize: 13 }}>
                Elite feature — sign in and subscribe to unlock.
              </div>
            </div>
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
          </div>
        )}

        {/* Stats */}
        {(isElite || !signedIn) && (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: mob ? "repeat(2,1fr)" : "repeat(4,1fr)",
              gap: 8,
              marginBottom: 20,
            }}
          >
            {[
              { l: "Value bets", v: isElite ? stats.count : "?" },
              {
                l: "Best edge",
                v: isElite ? `+${stats.bestEv.toFixed(1)}%` : "?",
              },
              {
                l: "Avg edge",
                v: isElite ? `+${stats.avgEv.toFixed(1)}%` : "?",
              },
              {
                l: "Total EV",
                v: isElite ? `+£${stats.totalExpectedProfit.toFixed(2)}` : "?",
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
                    fontSize: 18,
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
        )}

        {/* EV filter */}
        {isElite && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              marginBottom: 16,
              flexWrap: "wrap",
            }}
          >
            <span style={{ fontSize: 12, color: "rgba(255,255,255,0.45)" }}>
              Min edge:
            </span>
            {[5, 8, 10, 15].map((v) => (
              <button
                key={v}
                style={{
                  fontSize: 12,
                  fontWeight: 600,
                  padding: "5px 10px",
                  borderRadius: 8,
                  border:
                    minEv === v
                      ? "1px solid rgba(120,110,255,0.5)"
                      : "1px solid rgba(255,255,255,0.09)",
                  background:
                    minEv === v ? "rgba(120,110,255,0.15)" : "transparent",
                  color: minEv === v ? "white" : "rgba(255,255,255,0.5)",
                  cursor: "pointer",
                }}
                onClick={() => setMinEv(v)}
              >
                {v}%+
              </button>
            ))}
            <span
              style={{
                fontSize: 12,
                color: "rgba(255,255,255,0.35)",
                marginLeft: 4,
              }}
            >
              {filtered.length} bets
            </span>
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
            Loading value bets…
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

        {/* Live bets for Elite */}
        {isElite &&
          !loading &&
          !error &&
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
              No value bets above {minEv}% edge right now. Try lowering the
              threshold or check back later.
            </div>
          ) : (
            <div>
              {filtered.map((bet) => (
                <ValueCard key={bet.id} bet={bet} />
              ))}
            </div>
          ))}

        {/* Demo for non-Elite */}
        {!isElite && !loading && (
          <div style={{ position: "relative" }}>
            <div
              style={{
                filter: "blur(4px)",
                pointerEvents: "none",
                opacity: 0.5,
              }}
            >
              {demoBets.map((bet) => (
                <ValueCard key={bet.id} bet={bet} />
              ))}
            </div>
            <div
              style={{
                position: "absolute",
                inset: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <div
                style={{
                  textAlign: "center",
                  padding: "24px 32px",
                  borderRadius: 18,
                  background: "rgba(8,11,18,0.92)",
                  border: "1px solid rgba(120,110,255,0.3)",
                  boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
                }}
              >
                <div style={{ fontSize: 32, marginBottom: 10 }}>🔒</div>
                <div
                  style={{
                    fontSize: 17,
                    fontWeight: 800,
                    color: "white",
                    marginBottom: 6,
                  }}
                >
                  Elite only
                </div>
                <div
                  style={{
                    fontSize: 13,
                    color: "rgba(255,255,255,0.55)",
                    marginBottom: 18,
                    maxWidth: 280,
                  }}
                >
                  Upgrade to Elite to access the full value watchlist
                </div>
                <Link
                  href="/pricing"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    padding: "10px 20px",
                    borderRadius: 12,
                    fontWeight: 700,
                    fontSize: 14,
                    color: "white",
                    background:
                      "linear-gradient(90deg, rgba(120,110,255,0.95), rgba(0,190,255,0.75))",
                    border: "1px solid rgba(120,110,255,0.4)",
                    textDecoration: "none",
                  }}
                >
                  Upgrade to Elite
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
