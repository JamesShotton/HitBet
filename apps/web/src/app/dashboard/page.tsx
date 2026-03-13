"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, useCallback } from "react";

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
  if (s.includes("mma") || s.includes("ufc")) return "🥊";
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
    h2h_1st_5_innings: "F5 Innings",
  };
  if (map[mg]) return map[mg];
  if (mg.startsWith("player_"))
    return mg.replace("player_", "").replace(/_/g, " ");
  return mg;
}

function marketCategory(mg: string): string {
  if (mg === "h2h" || mg === "h2h_3way") return "moneyline";
  if (mg.includes("spread")) return "spreads";
  if (mg.includes("total")) return "totals";
  if (
    mg.includes("h1") ||
    mg.includes("h2") ||
    mg.includes("q1") ||
    mg.includes("q2") ||
    mg.includes("q3") ||
    mg.includes("q4") ||
    mg.includes("p1") ||
    mg.includes("p2") ||
    mg.includes("p3") ||
    mg.includes("innings")
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

// ── Placement card ────────────────────────────────────────────

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
    <div style={s.expBox}>
      {/* Summary strip */}
      <div style={s.expStrip}>
        {[
          { l: "Total stake", v: fmt(stake) },
          { l: "Guaranteed profit", v: `+${fmt(profit)}`, green: true },
          { l: "Margin", v: pct(arb.margin) },
          { l: "Payout if any leg wins", v: fmt(stake + profit) },
        ].map(({ l, v, green }) => (
          <div key={l} style={s.expStripItem}>
            <div style={s.expStripL}>{l}</div>
            <div
              style={{ ...s.expStripV, ...(green ? { color: "#9be7bf" } : {}) }}
            >
              {v}
            </div>
          </div>
        ))}
      </div>

      {/* Steps */}
      <div style={s.expStepsLabel}>How to place this arb</div>
      <div style={s.expSteps}>
        {legs.map((leg, i) => (
          <div
            key={i}
            style={{ ...s.expStep, ...(checked[i] ? s.expStepDone : {}) }}
            onClick={() =>
              setChecked((prev) => prev.map((v, idx) => (idx === i ? !v : v)))
            }
          >
            <div style={{ ...s.expNum, ...(checked[i] ? s.expNumDone : {}) }}>
              {checked[i] ? "✓" : i + 1}
            </div>
            <div style={s.expBody}>
              {leg.wait && (
                <div style={s.expWait}>
                  ⏱ Wait 20–30 seconds before placing this leg
                </div>
              )}
              <div style={s.expAction}>
                Go to <span style={s.expBookName}>{leg.book}</span> and back:
              </div>
              <div style={s.expSelection}>
                "{leg.pick}
                {leg.point ? ` (${leg.point})` : ""}"
              </div>
              <div style={s.expChips}>
                <span style={s.expOddsChip}>
                  Odds: {Number(leg.odds).toFixed(2)}
                </span>
                <span style={s.expStakeChip}>
                  Stake: £{Math.round(leg.stake)}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {allDone && (
        <div style={s.expDone}>
          ✅ All legs placed — locked in for <strong>+{fmt(profit)}</strong>{" "}
          guaranteed profit regardless of result.
        </div>
      )}
    </div>
  );
}

// ── Arb row ───────────────────────────────────────────────────

function ArbRow({
  arb,
  stake,
  expanded,
  onToggle,
}: {
  arb: Arb;
  stake: number;
  expanded: boolean;
  onToggle: () => void;
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

  return (
    <>
      <tr style={{ ...s.row, ...(expanded ? s.rowOn : {}) }} onClick={onToggle}>
        <td style={s.td}>
          <div style={s.evtName}>{arb.event}</div>
          <div style={s.evtMeta}>
            <span>{sportEmoji(arb.sport_key)}</span>
            <span style={s.evtSport}>
              {arb.sport_key.replace(
                /^(soccer|basketball|icehockey|americanfootball|baseball|tennis|mma)_/,
                ""
              )}
            </span>
            <span style={is3 ? s.chip3 : s.chip}>
              {marketLabel(arb.market_group)}
            </span>
            {is3 && <span style={s.chip3way}>3-way</span>}
          </div>
        </td>
        <td style={s.td}>
          <div style={s.legBook}>
            {arb.leg1_book}{" "}
            <span style={s.legOdds}>@ {Number(arb.leg1_odds).toFixed(2)}</span>
          </div>
          <div style={s.legPick}>
            {arb.leg1_name}
            {arb.leg1_point ? ` (${arb.leg1_point})` : ""}
          </div>
        </td>
        <td style={s.td}>
          <div style={s.legBook}>
            {arb.leg2_book}{" "}
            <span style={s.legOdds}>@ {Number(arb.leg2_odds).toFixed(2)}</span>
          </div>
          <div style={s.legPick}>
            {arb.leg2_name}
            {arb.leg2_point ? ` (${arb.leg2_point})` : ""}
          </div>
          {is3 && arb.leg3_book && (
            <>
              <div style={{ ...s.legBook, marginTop: 4 }}>
                {arb.leg3_book}{" "}
                <span style={s.legOdds}>
                  @ {Number(arb.leg3_odds).toFixed(2)}
                </span>
              </div>
              <div style={s.legPick}>{arb.leg3_name}</div>
            </>
          )}
        </td>
        <td style={s.tdR}>
          <span style={{ ...s.mBadge, color: mColor }}>{pct(arb.margin)}</span>
        </td>
        <td style={s.tdR}>
          <span style={s.pBadge}>+{fmt(profit)}</span>
        </td>
        <td style={s.tdR}>
          <span style={s.tBadge}>{timeUntil(arb.commence_time)}</span>
        </td>
        <td style={s.tdR}>
          <span style={{ ...s.chev, ...(expanded ? s.chevOn : {}) }}>▾</span>
        </td>
      </tr>
      {expanded && (
        <tr style={s.expRow}>
          <td colSpan={7} style={s.expCell}>
            <ExpandedRow arb={arb} stake={stake} />
          </td>
        </tr>
      )}
    </>
  );
}

// ── Page ──────────────────────────────────────────────────────

export default function DashboardPage() {
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
  const [sidebarOpen, setSidebarOpen] = useState(true);

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
    load();
    const t = setInterval(load, 30000);
    return () => clearInterval(t);
  }, [load]);

  const stake = Math.max(1, Number(stakeInput) || 50);
  const isElite = plan === "elite" && active;
  const activeArbs = tab === "2way" ? arbs2 : arbs3;

  const sports = useMemo(() => {
    const set = new Set(activeArbs.map((a) => a.sport_key));
    return ["all", ...Array.from(set)];
  }, [activeArbs]);

  const filtered = useMemo(
    () =>
      activeArbs.filter((a) => {
        if (Number(a.margin) * 100 < minMarginPct) return false;
        if (sportFilter !== "all" && a.sport_key !== sportFilter) return false;
        if (marketCat !== "all" && marketCategory(a.market_group) !== marketCat)
          return false;
        return true;
      }),
    [activeArbs, minMarginPct, sportFilter, marketCat]
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
      avgMargin: filtered.length
        ? filtered.reduce((acc, a) => acc + Number(a.margin), 0) /
          filtered.length
        : 0,
    };
  }, [filtered, stake]);

  function toggle(id: string | number | undefined, i: number) {
    const key = id ?? i;
    setExpandedId((p) => (p === key ? null : key));
  }

  return (
    <div style={s.shell}>
      {/* ── Sidebar ─────────────────────────── */}
      <aside style={{ ...s.sidebar, ...(!sidebarOpen ? s.sidebarClosed : {}) }}>
        {!sidebarOpen ? (
          // Collapsed state — just show reopen button
          <button
            style={s.reopenBtn}
            onClick={() => setSidebarOpen(true)}
            title="Open filters"
          >
            ▶
          </button>
        ) : (
          <>
            <div style={s.sidebarHead}>
              <div style={s.sidebarTitle}>Filters</div>
              <button
                style={s.collapseBtn}
                onClick={() => setSidebarOpen(false)}
              >
                ◀
              </button>
            </div>

            <div style={s.filterGroup}>
              <div style={s.filterLabel}>Total stake</div>
              <div style={s.stakeBox}>
                <span style={s.stakePre}>£</span>
                <input
                  type="number"
                  min="1"
                  step="1"
                  value={stakeInput}
                  onChange={(e) => setStakeInput(e.target.value)}
                  style={s.stakeIn}
                />
              </div>
            </div>

            <div style={s.filterGroup}>
              <div style={s.filterLabel}>Min margin</div>
              <div style={s.marginBtns}>
                {[0, 0.5, 1, 2, 3].map((v) => (
                  <button
                    key={v}
                    style={{
                      ...s.marginBtn,
                      ...(minMarginPct === v ? s.marginBtnOn : {}),
                    }}
                    onClick={() => setMinMarginPct(v)}
                  >
                    {v === 0 ? "Any" : `${v}%+`}
                  </button>
                ))}
              </div>
            </div>

            <div style={s.filterGroup}>
              <div style={s.filterLabel}>Market</div>
              {MARKET_CATEGORIES.map((cat) => (
                <button
                  key={cat.key}
                  style={{
                    ...s.catBtn,
                    ...(marketCat === cat.key ? s.catBtnOn : {}),
                  }}
                  onClick={() => setMarketCat(cat.key)}
                >
                  <span>{cat.label}</span>
                  <span style={s.catCount}>{catCounts[cat.key] ?? 0}</span>
                </button>
              ))}
            </div>

            {sports.length > 2 && (
              <div style={s.filterGroup}>
                <div style={s.filterLabel}>Sport</div>
                <select
                  style={s.sportSel}
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

            <div style={s.planBadge}>
              <div style={s.planBadgeL}>Plan</div>
              <div style={s.planBadgeV}>
                {plan
                  ? plan[0].toUpperCase() + plan.slice(1)
                  : signedIn
                  ? "None"
                  : "Guest"}
              </div>
            </div>
          </>
        )}
      </aside>

      {/* ── Main ────────────────────────────── */}
      <main style={s.main}>
        {trial && !loading && (
          <div style={s.trialBanner}>
            <div style={s.trialLeft}>
              <span style={s.trialBadge}>FREE TRIAL</span>
              <span style={s.trialMsg}>
                {trialDaysLeft > 0
                  ? `${trialDaysLeft} day${trialDaysLeft !== 1 ? "s" : ""} left`
                  : "Trial ends today"}{" "}
                · card charged automatically
              </span>
            </div>
            <Link href="/pricing" style={s.trialBtn}>
              Manage
            </Link>
          </div>
        )}

        <div style={s.hdr}>
          <div>
            <h1 style={s.hdrTitle}>Arbitrage feed</h1>
            <p style={s.hdrSub}>
              {demo ? "Demo mode" : "Live · auto-refreshes every 30s"}
            </p>
          </div>
          <div style={s.hdrRight}>
            <div style={s.tabs}>
              <button
                style={{ ...s.tab, ...(tab === "2way" ? s.tabOn : {}) }}
                onClick={() => {
                  setTab("2way");
                  setExpandedId(null);
                }}
              >
                2-Way <span style={s.tabCount}>{arbs2.length}</span>
              </button>
              <button
                style={{
                  ...s.tab,
                  ...(tab === "3way" ? s.tabOn : {}),
                  ...(!isElite ? s.tabLocked : {}),
                }}
                onClick={() => isElite && (setTab("3way"), setExpandedId(null))}
                title={!isElite ? "Elite plan required" : undefined}
              >
                3-Way{" "}
                <span style={s.tabCount}>{isElite ? arbs3.length : "🔒"}</span>
              </button>
            </div>
            <div style={s.pulse}>
              <div style={s.pulseDot} />
              {updatedAt ? updatedAt.toLocaleTimeString("en-GB") : "—"}
            </div>
          </div>
        </div>

        {!signedIn && !loading && (
          <div style={s.lock}>
            <div>
              <div style={s.lockT}>Sign in to access live arbs</div>
              <div style={s.lockS}>
                Guest mode — sign in and subscribe to unlock.
              </div>
            </div>
            <div style={s.lockBtns}>
              <Link href="/login" style={s.btnP}>
                Log in
              </Link>
              <Link href="/pricing" style={s.btnG}>
                View plans
              </Link>
            </div>
          </div>
        )}
        {signedIn && !active && !loading && (
          <div style={s.lock}>
            <div>
              <div style={s.lockT}>No active subscription</div>
              <div style={s.lockS}>
                Start a 7-day free trial. Card required, cancels automatically.
              </div>
            </div>
            <div style={s.lockBtns}>
              <Link href="/pricing" style={s.btnP}>
                Try free — 7 days
              </Link>
            </div>
          </div>
        )}
        {tab === "3way" && !isElite && (
          <div style={s.upsell}>
            <div>
              <div style={s.lockT}>3-Way arbs are Elite only</div>
              <div style={s.lockS}>
                Football 1X2 across home/draw/away — harder to spot, higher
                margins.
              </div>
            </div>
            <Link href="/pricing" style={s.btnP}>
              Upgrade to Elite
            </Link>
          </div>
        )}

        <div style={s.statsBar}>
          {[
            { l: "Showing", v: `${stats.count} arbs` },
            { l: "Best margin", v: pct(stats.bestMargin) },
            { l: "Avg margin", v: pct(stats.avgMargin) },
            {
              l: `Best profit @ £${stake}`,
              v: active ? `+${fmt(stats.bestProfit)}` : "—",
            },
          ].map(({ l, v }) => (
            <div key={l} style={s.stat}>
              <div style={s.statL}>{l}</div>
              <div style={s.statV}>{v}</div>
            </div>
          ))}
        </div>

        {loading && <div style={s.info}>Loading arbs…</div>}
        {!loading && error && (
          <div style={{ ...s.info, ...s.infoErr }}>{error}</div>
        )}

        {!loading &&
          !error &&
          (tab === "2way" || isElite) &&
          (filtered.length === 0 ? (
            <div style={s.info}>
              {demo
                ? "Subscribe to see live arbs."
                : "No arbs match current filters."}
            </div>
          ) : (
            <div style={s.tableWrap}>
              <table style={s.table}>
                <thead>
                  <tr>
                    <th style={s.th}>Event</th>
                    <th style={s.th}>Leg 1</th>
                    <th style={s.th}>
                      {tab === "3way" ? "Leg 2 · 3" : "Leg 2"}
                    </th>
                    <th style={{ ...s.th, textAlign: "right" }}>Margin</th>
                    <th style={{ ...s.th, textAlign: "right" }}>Profit</th>
                    <th style={{ ...s.th, textAlign: "right" }}>Starts</th>
                    <th style={{ ...s.th, textAlign: "right" }}></th>
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

// ── Styles ────────────────────────────────────────────────────

const s: Record<string, React.CSSProperties> = {
  shell: { display: "flex", minHeight: "100vh" },

  // Sidebar
  sidebar: {
    width: 220,
    flexShrink: 0,
    borderRight: "1px solid rgba(255,255,255,0.06)",
    background: "rgba(8,11,18,0.7)",
    padding: "24px 0",
    display: "flex",
    flexDirection: "column",
    position: "sticky" as const,
    top: 0,
    height: "100vh",
    overflowY: "auto",
  },
  sidebarClosed: { width: 44, alignItems: "center", padding: "16px 0" },
  sidebarHead: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "0 16px 16px",
    borderBottom: "1px solid rgba(255,255,255,0.06)",
    marginBottom: 4,
  },
  sidebarTitle: {
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: "0.12em",
    color: "rgba(255,255,255,0.35)",
    textTransform: "uppercase" as const,
  },
  collapseBtn: {
    background: "none",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: 8,
    color: "rgba(255,255,255,0.4)",
    cursor: "pointer",
    fontSize: 11,
    padding: "4px 7px",
  },
  reopenBtn: {
    background: "none",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: 8,
    color: "rgba(255,255,255,0.4)",
    cursor: "pointer",
    fontSize: 11,
    padding: "6px 10px",
    margin: "0 auto",
  },

  filterGroup: { padding: "14px 16px 0" },
  filterLabel: {
    fontSize: 10,
    fontWeight: 700,
    letterSpacing: "0.1em",
    color: "rgba(255,255,255,0.3)",
    textTransform: "uppercase" as const,
    marginBottom: 8,
  },

  stakeBox: {
    display: "flex",
    alignItems: "center",
    gap: 6,
    border: "1px solid rgba(255,255,255,0.10)",
    background: "rgba(255,255,255,0.03)",
    borderRadius: 10,
    padding: "8px 10px",
  },
  stakePre: { color: "rgba(255,255,255,0.5)", fontWeight: 700, fontSize: 13 },
  stakeIn: {
    background: "transparent",
    border: "none",
    outline: "none",
    color: "white",
    fontSize: 14,
    fontWeight: 700,
    width: "100%",
  },

  marginBtns: { display: "flex", flexWrap: "wrap" as const, gap: 4 },
  marginBtn: {
    fontSize: 11,
    fontWeight: 600,
    padding: "5px 8px",
    borderRadius: 8,
    border: "1px solid rgba(255,255,255,0.09)",
    background: "transparent",
    color: "rgba(255,255,255,0.5)",
    cursor: "pointer",
  },
  marginBtnOn: {
    border: "1px solid rgba(120,110,255,0.5)",
    background: "rgba(120,110,255,0.15)",
    color: "white",
  },

  catBtn: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    padding: "8px 10px",
    marginBottom: 2,
    borderRadius: 10,
    border: "1px solid transparent",
    background: "transparent",
    color: "rgba(255,255,255,0.5)",
    fontSize: 13,
    cursor: "pointer",
    textAlign: "left" as const,
  },
  catBtnOn: {
    border: "1px solid rgba(120,110,255,0.3)",
    background: "rgba(120,110,255,0.1)",
    color: "white",
  },
  catCount: {
    fontSize: 11,
    padding: "1px 6px",
    borderRadius: 999,
    background: "rgba(255,255,255,0.07)",
    color: "rgba(255,255,255,0.4)",
  },

  sportSel: {
    width: "100%",
    background: "rgba(255,255,255,0.03)",
    border: "1px solid rgba(255,255,255,0.09)",
    borderRadius: 10,
    color: "white",
    padding: "8px 10px",
    fontSize: 13,
    outline: "none",
    cursor: "pointer",
  },

  planBadge: {
    margin: "20px 16px 0",
    padding: "12px",
    border: "1px solid rgba(255,255,255,0.07)",
    borderRadius: 12,
    background: "rgba(255,255,255,0.02)",
    display: "flex",
    justifyContent: "space-between",
  },
  planBadgeL: { fontSize: 11, color: "rgba(255,255,255,0.35)" },
  planBadgeV: { fontSize: 13, fontWeight: 700, color: "white" },

  // Main
  main: { flex: 1, padding: "28px 32px 80px", minWidth: 0 },

  // Trial
  trialBanner: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
    padding: "12px 16px",
    marginBottom: 20,
    borderRadius: 14,
    border: "1px solid rgba(245,158,11,0.25)",
    background: "rgba(245,158,11,0.06)",
  },
  trialLeft: { display: "flex", alignItems: "center", gap: 10 },
  trialBadge: {
    fontSize: 10,
    fontWeight: 800,
    letterSpacing: "0.1em",
    padding: "3px 8px",
    borderRadius: 999,
    border: "1px solid rgba(245,158,11,0.35)",
    background: "rgba(245,158,11,0.1)",
    color: "rgba(245,158,11,0.9)",
  },
  trialMsg: { fontSize: 13, color: "rgba(255,255,255,0.55)" },
  trialBtn: {
    fontSize: 12,
    fontWeight: 700,
    padding: "7px 12px",
    borderRadius: 10,
    border: "1px solid rgba(245,158,11,0.3)",
    background: "rgba(245,158,11,0.1)",
    color: "rgba(245,158,11,0.9)",
    textDecoration: "none",
  },

  // Header
  hdr: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-end",
    gap: 16,
    marginBottom: 20,
    flexWrap: "wrap",
  },
  hdrTitle: {
    fontSize: 30,
    fontWeight: 900,
    letterSpacing: "-0.03em",
    margin: 0,
    color: "white",
  },
  hdrSub: { margin: "4px 0 0", fontSize: 13, color: "rgba(255,255,255,0.45)" },
  hdrRight: { display: "flex", gap: 10, alignItems: "center" },

  tabs: {
    display: "flex",
    gap: 4,
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: 12,
    padding: 3,
    background: "rgba(10,14,20,0.5)",
  },
  tab: {
    display: "flex",
    alignItems: "center",
    gap: 6,
    padding: "7px 14px",
    borderRadius: 9,
    fontSize: 13,
    fontWeight: 700,
    cursor: "pointer",
    border: "none",
    background: "transparent",
    color: "rgba(255,255,255,0.5)",
  },
  tabOn: { background: "rgba(120,110,255,0.2)", color: "white" },
  tabLocked: { opacity: 0.4, cursor: "not-allowed" },
  tabCount: {
    fontSize: 11,
    padding: "1px 6px",
    borderRadius: 999,
    background: "rgba(255,255,255,0.08)",
  },

  pulse: {
    display: "flex",
    alignItems: "center",
    gap: 6,
    fontSize: 12,
    color: "rgba(255,255,255,0.5)",
    fontWeight: 600,
  },
  pulseDot: {
    width: 6,
    height: 6,
    borderRadius: 999,
    background: "#22c55e",
    boxShadow: "0 0 6px #22c55e",
  },

  lock: {
    border: "1px solid rgba(255,255,255,0.07)",
    background: "rgba(10,14,20,0.5)",
    borderRadius: 14,
    padding: "16px 18px",
    marginBottom: 18,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 14,
    flexWrap: "wrap",
  },
  upsell: {
    border: "1px solid rgba(120,110,255,0.18)",
    background: "rgba(120,110,255,0.05)",
    borderRadius: 14,
    padding: "16px 18px",
    marginBottom: 18,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 14,
    flexWrap: "wrap",
  },
  lockT: { color: "white", fontSize: 15, fontWeight: 800, marginBottom: 3 },
  lockS: { color: "rgba(255,255,255,0.5)", fontSize: 13 },
  lockBtns: { display: "flex", gap: 8 },

  statsBar: {
    display: "grid",
    gridTemplateColumns: "repeat(4, minmax(0,1fr))",
    gap: 8,
    marginBottom: 20,
  },
  stat: {
    border: "1px solid rgba(255,255,255,0.06)",
    background: "rgba(10,14,20,0.35)",
    borderRadius: 12,
    padding: "12px 14px",
  },
  statL: { fontSize: 11, color: "rgba(255,255,255,0.4)", marginBottom: 5 },
  statV: {
    fontSize: 18,
    fontWeight: 800,
    color: "white",
    letterSpacing: "-0.02em",
  },

  info: {
    border: "1px solid rgba(255,255,255,0.06)",
    background: "rgba(10,14,20,0.35)",
    borderRadius: 12,
    padding: 16,
    color: "rgba(255,255,255,0.55)",
    fontSize: 14,
  },
  infoErr: { border: "1px solid rgba(255,90,90,0.22)", color: "#ffb4b4" },

  // Table
  tableWrap: {
    border: "1px solid rgba(255,255,255,0.06)",
    borderRadius: 16,
    overflow: "hidden",
    background: "rgba(8,11,18,0.4)",
  },
  table: { width: "100%", borderCollapse: "collapse" as const },
  th: {
    fontSize: 11,
    fontWeight: 600,
    color: "rgba(255,255,255,0.3)",
    textAlign: "left" as const,
    padding: "10px 14px",
    borderBottom: "1px solid rgba(255,255,255,0.05)",
    letterSpacing: "0.04em",
    background: "rgba(0,0,0,0.15)",
  },
  row: { borderBottom: "1px solid rgba(255,255,255,0.04)", cursor: "pointer" },
  rowOn: { background: "rgba(120,110,255,0.07)" },
  td: { padding: "11px 14px", verticalAlign: "middle" as const },
  tdR: {
    padding: "11px 14px",
    verticalAlign: "middle" as const,
    textAlign: "right" as const,
  },

  evtName: { fontSize: 14, fontWeight: 700, color: "white", marginBottom: 3 },
  evtMeta: {
    display: "flex",
    gap: 5,
    alignItems: "center",
    fontSize: 11,
    color: "rgba(255,255,255,0.35)",
  },
  evtSport: { color: "rgba(255,255,255,0.35)" },
  chip: {
    fontSize: 10,
    padding: "2px 6px",
    borderRadius: 999,
    border: "1px solid rgba(255,255,255,0.08)",
    background: "rgba(255,255,255,0.03)",
    color: "rgba(255,255,255,0.45)",
  },
  chip3: {
    fontSize: 10,
    padding: "2px 6px",
    borderRadius: 999,
    border: "1px solid rgba(120,110,255,0.25)",
    background: "rgba(120,110,255,0.08)",
    color: "rgba(180,170,255,0.85)",
  },
  chip3way: {
    fontSize: 10,
    padding: "2px 6px",
    borderRadius: 999,
    border: "1px solid rgba(0,190,255,0.2)",
    background: "rgba(0,190,255,0.06)",
    color: "rgba(100,210,255,0.8)",
  },

  legBook: { fontSize: 13, fontWeight: 600, color: "white", marginBottom: 2 },
  legOdds: { color: "#98b8ff" },
  legPick: { fontSize: 12, color: "rgba(255,255,255,0.42)" },

  mBadge: { fontSize: 14, fontWeight: 800 },
  pBadge: { fontSize: 14, fontWeight: 700, color: "rgba(255,255,255,0.82)" },
  tBadge: { fontSize: 12, color: "rgba(255,255,255,0.38)" },
  chev: {
    fontSize: 14,
    color: "rgba(255,255,255,0.25)",
    display: "inline-block",
    transition: "transform 0.2s",
  },
  chevOn: { transform: "rotate(180deg)", color: "rgba(255,255,255,0.6)" },

  expRow: { background: "rgba(120,110,255,0.03)" },
  expCell: { padding: "0 14px 14px" },

  // Placement card
  expBox: {
    border: "1px solid rgba(120,110,255,0.14)",
    borderRadius: 14,
    padding: 18,
    background: "rgba(8,11,18,0.6)",
  },
  expStrip: {
    display: "grid",
    gridTemplateColumns: "repeat(4,1fr)",
    gap: 10,
    marginBottom: 18,
  },
  expStripItem: {
    background: "rgba(255,255,255,0.03)",
    borderRadius: 10,
    padding: "10px 12px",
    border: "1px solid rgba(255,255,255,0.06)",
  },
  expStripL: { fontSize: 11, color: "rgba(255,255,255,0.38)", marginBottom: 4 },
  expStripV: { fontSize: 15, fontWeight: 800, color: "white" },
  expStepsLabel: {
    fontSize: 10,
    fontWeight: 700,
    letterSpacing: "0.1em",
    color: "rgba(255,255,255,0.3)",
    textTransform: "uppercase" as const,
    marginBottom: 10,
  },
  expSteps: { display: "flex", flexDirection: "column" as const, gap: 8 },
  expStep: {
    display: "flex",
    gap: 14,
    padding: "14px 16px",
    borderRadius: 12,
    border: "1px solid rgba(255,255,255,0.07)",
    background: "rgba(255,255,255,0.02)",
    cursor: "pointer",
  },
  expStepDone: {
    border: "1px solid rgba(0,255,140,0.2)",
    background: "rgba(0,255,140,0.04)",
    opacity: 0.65,
  },
  expNum: {
    width: 28,
    height: 28,
    borderRadius: 999,
    background: "rgba(120,110,255,0.2)",
    border: "1px solid rgba(120,110,255,0.4)",
    color: "white",
    fontSize: 13,
    fontWeight: 800,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    marginTop: 2,
  },
  expNumDone: {
    background: "rgba(0,255,140,0.15)",
    border: "1px solid rgba(0,255,140,0.3)",
    color: "#9be7bf",
  },
  expBody: { flex: 1 },
  expWait: {
    fontSize: 11,
    color: "rgba(245,158,11,0.85)",
    marginBottom: 6,
    fontWeight: 600,
  },
  expAction: { fontSize: 13, color: "rgba(255,255,255,0.6)", marginBottom: 4 },
  expBookName: { color: "white", fontWeight: 700 },
  expSelection: {
    fontSize: 15,
    fontWeight: 800,
    color: "white",
    marginBottom: 8,
  },
  expChips: { display: "flex", gap: 8 },
  expOddsChip: {
    fontSize: 12,
    fontWeight: 700,
    padding: "4px 10px",
    borderRadius: 999,
    background: "rgba(120,110,255,0.15)",
    border: "1px solid rgba(120,110,255,0.25)",
    color: "#98b8ff",
  },
  expStakeChip: {
    fontSize: 12,
    fontWeight: 700,
    padding: "4px 10px",
    borderRadius: 999,
    background: "rgba(255,255,255,0.06)",
    border: "1px solid rgba(255,255,255,0.1)",
    color: "white",
  },
  expDone: {
    marginTop: 14,
    padding: "12px 16px",
    borderRadius: 12,
    background: "rgba(0,255,140,0.07)",
    border: "1px solid rgba(0,255,140,0.18)",
    fontSize: 14,
    color: "#9be7bf",
    fontWeight: 600,
  },

  btnP: {
    display: "inline-flex",
    alignItems: "center",
    padding: "9px 16px",
    borderRadius: 11,
    fontWeight: 700,
    fontSize: 13,
    color: "white",
    background:
      "linear-gradient(90deg, rgba(120,110,255,0.95), rgba(0,190,255,0.75))",
    border: "1px solid rgba(120,110,255,0.4)",
    textDecoration: "none",
  },
  btnG: {
    display: "inline-flex",
    alignItems: "center",
    padding: "9px 16px",
    borderRadius: 11,
    fontWeight: 700,
    fontSize: 13,
    color: "rgba(255,255,255,0.75)",
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.09)",
    textDecoration: "none",
  },
};
