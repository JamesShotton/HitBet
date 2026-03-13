"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

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
  leg2_name: string;
  leg2_book: string;
  leg2_odds: number;
  leg2_stake: number;
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
  if (isNaN(d.getTime())) return "Unknown";
  const diff = d.getTime() - Date.now();
  if (diff < 0) return "In play";
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `in ${mins}m`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `in ${hrs}h`;
  return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short" });
}

function emoji(sport: string) {
  const s = sport.toLowerCase();
  if (
    s.includes("soccer") ||
    s.includes("epl") ||
    s.includes("liga") ||
    s.includes("ligue") ||
    s.includes("bundesliga")
  )
    return "⚽";
  if (s.includes("basket") || s.includes("nba")) return "🏀";
  if (s.includes("tennis")) return "🎾";
  if (s.includes("hockey") || s.includes("nhl") || s.includes("ahl"))
    return "🏒";
  if (s.includes("nfl") || s.includes("american")) return "🏈";
  if (s.includes("baseball") || s.includes("mlb")) return "⚾";
  return "🎯";
}

// ── Hot card ───────────────────────────────────────────────────
function HotCard({
  arb,
  stake,
  onExpand,
}: {
  arb: Arb;
  stake: number;
  onExpand: () => void;
}) {
  const scale = stake / (Number(arb.total_stake ?? 50) || 50);
  const profit = Number(arb.est_profit) * scale;
  const is3 = arb.legs === 3;
  return (
    <div style={s.hotCard} onClick={onExpand}>
      <div style={s.hotTop}>
        <div style={s.hotTopLeft}>
          <span style={s.hotEmoji}>{emoji(arb.sport_key)}</span>
          {is3 && <span style={s.badge3way}>3-way</span>}
        </div>
        <span style={s.hotMargin}>{pct(arb.margin)}</span>
      </div>
      <div style={s.hotEvent}>{arb.event}</div>
      <div style={s.hotRow}>
        <span style={s.hotBooks}>
          {arb.leg1_book} · {arb.leg2_book}
          {is3 ? ` · ${arb.leg3_book}` : ""}
        </span>
        <span style={s.hotProfit}>+{fmt(profit)}</span>
      </div>
      <div style={s.hotTime}>{timeUntil(arb.commence_time)}</div>
    </div>
  );
}

// ── 2-way row ─────────────────────────────────────────────────
function Row2({
  arb,
  stake,
  demo,
  expanded,
  onToggle,
}: {
  arb: Arb;
  stake: number;
  demo: boolean;
  expanded: boolean;
  onToggle: () => void;
}) {
  const scale = stake / (Number(arb.total_stake ?? 50) || 50);
  const s1 = Number(arb.leg1_stake) * scale;
  const s2 = Number(arb.leg2_stake) * scale;
  const profit = Number(arb.est_profit) * scale;
  const mPct = Number(arb.margin) * 100;
  const mColor =
    mPct >= 3 ? "#9be7bf" : mPct >= 1.5 ? "#98b8ff" : "rgba(255,255,255,0.75)";

  return (
    <>
      <tr
        style={{ ...s.row, ...(expanded ? s.rowActive : {}) }}
        onClick={onToggle}
      >
        <td style={s.td}>
          <div style={s.cellEvent}>{arb.event}</div>
          <div style={s.cellMeta}>
            <span>
              {emoji(arb.sport_key)} {arb.sport_key}
            </span>
            <span style={s.chip}>{arb.market_group}</span>
          </div>
        </td>
        <td style={s.td}>
          <div style={s.cellBook}>
            {arb.leg1_book}{" "}
            <span style={s.cellOdds}>@ {Number(arb.leg1_odds).toFixed(2)}</span>
          </div>
          <div style={s.cellPick}>{arb.leg1_name}</div>
        </td>
        <td style={s.td}>
          <div style={s.cellBook}>
            {arb.leg2_book}{" "}
            <span style={s.cellOdds}>@ {Number(arb.leg2_odds).toFixed(2)}</span>
          </div>
          <div style={s.cellPick}>{arb.leg2_name}</div>
        </td>
        <td style={s.tdR}>
          <span style={{ ...s.marginBadge, color: mColor }}>
            {pct(arb.margin)}
          </span>
        </td>
        <td style={s.tdR}>
          <span style={s.profitBadge}>+{fmt(profit)}</span>
        </td>
        <td style={s.tdR}>
          <span style={s.timeBadge}>{timeUntil(arb.commence_time)}</span>
        </td>
        <td style={s.tdR}>
          <span style={{ ...s.chevron, ...(expanded ? s.chevronOpen : {}) }}>
            ▾
          </span>
        </td>
      </tr>
      {expanded && (
        <tr style={s.expandRow}>
          <td colSpan={7} style={s.expandCell}>
            <div style={s.expandBox}>
              <div style={s.expandLegs}>
                {[
                  {
                    book: arb.leg1_book,
                    pick: arb.leg1_name,
                    odds: arb.leg1_odds,
                    stake: s1,
                  },
                  {
                    book: arb.leg2_book,
                    pick: arb.leg2_name,
                    odds: arb.leg2_odds,
                    stake: s2,
                  },
                ].map((leg, i) => (
                  <div key={i} style={s.expandLeg}>
                    <div style={s.expandBook}>{leg.book}</div>
                    <div style={s.expandPick}>{leg.pick}</div>
                    <div style={s.expandStat}>
                      <span style={s.expandL}>Odds</span>
                      <span style={s.expandOdds}>
                        @ {Number(leg.odds).toFixed(2)}
                      </span>
                    </div>
                    <div style={s.expandStat}>
                      <span style={s.expandL}>Stake</span>
                      <span style={s.expandV}>{fmt(leg.stake)}</span>
                    </div>
                  </div>
                ))}
                <div style={s.expandVr} />
                <div style={s.expandSummary}>
                  <div style={s.expandStat}>
                    <span style={s.expandL}>Total stake</span>
                    <span style={s.expandV}>{fmt(stake)}</span>
                  </div>
                  <div style={s.expandStat}>
                    <span style={s.expandL}>Profit</span>
                    <span style={{ ...s.expandV, color: "#9be7bf" }}>
                      +{fmt(profit)}
                    </span>
                  </div>
                  <div style={s.expandStat}>
                    <span style={s.expandL}>Margin</span>
                    <span style={s.expandV}>{pct(arb.margin)}</span>
                  </div>
                </div>
              </div>
              {!demo && (
                <div style={s.expandTip}>
                  💡 Place <b>{arb.leg1_book}</b> first, wait 20–30s, then{" "}
                  <b>{arb.leg2_book}</b>. Round stakes slightly.
                </div>
              )}
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

// ── 3-way row ─────────────────────────────────────────────────
function Row3({
  arb,
  stake,
  demo,
  expanded,
  onToggle,
}: {
  arb: Arb;
  stake: number;
  demo: boolean;
  expanded: boolean;
  onToggle: () => void;
}) {
  const scale = stake / (Number(arb.total_stake ?? 50) || 50);
  const s1 = Number(arb.leg1_stake) * scale;
  const s2 = Number(arb.leg2_stake) * scale;
  const s3 = Number(arb.leg3_stake ?? 0) * scale;
  const profit = Number(arb.est_profit) * scale;
  const mPct = Number(arb.margin) * 100;
  const mColor =
    mPct >= 3 ? "#9be7bf" : mPct >= 1.5 ? "#98b8ff" : "rgba(255,255,255,0.75)";

  return (
    <>
      <tr
        style={{ ...s.row, ...(expanded ? s.rowActive : {}) }}
        onClick={onToggle}
      >
        <td style={s.td}>
          <div style={s.cellEvent}>{arb.event}</div>
          <div style={s.cellMeta}>
            <span>
              {emoji(arb.sport_key)} {arb.sport_key}
            </span>
            <span style={s.chip3}>3-way</span>
          </div>
        </td>
        <td style={s.td}>
          <div style={s.cellBook}>
            {arb.leg1_book}{" "}
            <span style={s.cellOdds}>@ {Number(arb.leg1_odds).toFixed(2)}</span>
          </div>
          <div style={s.cellPick}>{arb.leg1_name}</div>
        </td>
        <td style={s.td}>
          <div style={s.cellBook}>
            {arb.leg2_book}{" "}
            <span style={s.cellOdds}>@ {Number(arb.leg2_odds).toFixed(2)}</span>
          </div>
          <div style={s.cellPick}>{arb.leg2_name}</div>
          <div style={{ ...s.cellBook, marginTop: 4 }}>
            {arb.leg3_book}{" "}
            <span style={s.cellOdds}>
              @ {Number(arb.leg3_odds ?? 0).toFixed(2)}
            </span>
          </div>
          <div style={s.cellPick}>{arb.leg3_name}</div>
        </td>
        <td style={s.tdR}>
          <span style={{ ...s.marginBadge, color: mColor }}>
            {pct(arb.margin)}
          </span>
        </td>
        <td style={s.tdR}>
          <span style={s.profitBadge}>+{fmt(profit)}</span>
        </td>
        <td style={s.tdR}>
          <span style={s.timeBadge}>{timeUntil(arb.commence_time)}</span>
        </td>
        <td style={s.tdR}>
          <span style={{ ...s.chevron, ...(expanded ? s.chevronOpen : {}) }}>
            ▾
          </span>
        </td>
      </tr>
      {expanded && (
        <tr style={s.expandRow}>
          <td colSpan={7} style={s.expandCell}>
            <div style={s.expandBox}>
              <div style={s.expandLegs}>
                {[
                  {
                    book: arb.leg1_book,
                    pick: arb.leg1_name,
                    odds: arb.leg1_odds,
                    stake: s1,
                  },
                  {
                    book: arb.leg2_book,
                    pick: arb.leg2_name,
                    odds: arb.leg2_odds,
                    stake: s2,
                  },
                  {
                    book: arb.leg3_book,
                    pick: arb.leg3_name,
                    odds: arb.leg3_odds ?? 0,
                    stake: s3,
                  },
                ].map((leg, i) => (
                  <div key={i} style={s.expandLeg}>
                    <div style={s.expandBook}>{leg.book}</div>
                    <div style={s.expandPick}>{leg.pick}</div>
                    <div style={s.expandStat}>
                      <span style={s.expandL}>Odds</span>
                      <span style={s.expandOdds}>
                        @ {Number(leg.odds).toFixed(2)}
                      </span>
                    </div>
                    <div style={s.expandStat}>
                      <span style={s.expandL}>Stake</span>
                      <span style={s.expandV}>{fmt(leg.stake)}</span>
                    </div>
                  </div>
                ))}
                <div style={s.expandVr} />
                <div style={s.expandSummary}>
                  <div style={s.expandStat}>
                    <span style={s.expandL}>Total stake</span>
                    <span style={s.expandV}>{fmt(stake)}</span>
                  </div>
                  <div style={s.expandStat}>
                    <span style={s.expandL}>Profit</span>
                    <span style={{ ...s.expandV, color: "#9be7bf" }}>
                      +{fmt(profit)}
                    </span>
                  </div>
                  <div style={s.expandStat}>
                    <span style={s.expandL}>Margin</span>
                    <span style={s.expandV}>{pct(arb.margin)}</span>
                  </div>
                </div>
              </div>
              {!demo && (
                <div style={s.expandTip}>
                  💡 Place <b>{arb.leg1_book}</b> → <b>{arb.leg2_book}</b> →{" "}
                  <b>{arb.leg3_book}</b> with 20–30s gaps each. Round stakes.
                </div>
              )}
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

// ── Table wrapper ─────────────────────────────────────────────
function ArbTable({
  arbs,
  stake,
  demo,
  is3way,
  expandedId,
  onToggle,
  minMargin,
  setMinMargin,
}: {
  arbs: Arb[];
  stake: number;
  demo: boolean;
  is3way: boolean;
  expandedId: string | number | null;
  onToggle: (id: string | number | undefined, i: number) => void;
  minMargin: number;
  setMinMargin: (v: number) => void;
}) {
  const filtered = useMemo(
    () => arbs.filter((a) => Number(a.margin) * 100 >= minMargin),
    [arbs, minMargin]
  );

  if (arbs.length === 0) {
    return (
      <div style={s.info}>
        {demo
          ? "Subscribe to see live arbs."
          : "No arbs found — worker may still be scanning."}
      </div>
    );
  }

  return (
    <>
      <div style={s.filtersBar}>
        <div style={s.filtersRight}>
          <span style={s.filterL}>Min margin</span>
          <select
            style={s.sel}
            value={minMargin}
            onChange={(e) => setMinMargin(Number(e.target.value))}
          >
            <option value={0}>Any</option>
            <option value={1}>1%+</option>
            <option value={2}>2%+</option>
            <option value={3}>3%+</option>
          </select>
          <span style={s.countPill}>
            {filtered.length} arb{filtered.length !== 1 ? "s" : ""}
          </span>
        </div>
      </div>

      <div style={s.tableWrap}>
        <table style={s.table}>
          <thead>
            <tr>
              <th style={s.th}>Event</th>
              <th style={s.th}>Leg 1</th>
              <th style={s.th}>{is3way ? "Leg 2 · 3" : "Leg 2"}</th>
              <th style={{ ...s.th, textAlign: "right" }}>Margin</th>
              <th style={{ ...s.th, textAlign: "right" }}>Profit</th>
              <th style={{ ...s.th, textAlign: "right" }}>Starts</th>
              <th style={{ ...s.th, textAlign: "right" }}></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((a, i) =>
              is3way ? (
                <Row3
                  key={a.id ?? i}
                  arb={a}
                  stake={stake}
                  demo={demo}
                  expanded={expandedId === (a.id ?? i)}
                  onToggle={() => onToggle(a.id, i)}
                />
              ) : (
                <Row2
                  key={a.id ?? i}
                  arb={a}
                  stake={stake}
                  demo={demo}
                  expanded={expandedId === (a.id ?? i)}
                  onToggle={() => onToggle(a.id, i)}
                />
              )
            )}
          </tbody>
        </table>
      </div>
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
  const [expandedId, setExpandedId] = useState<string | number | null>(null);
  const [minMargin2, setMinMargin2] = useState(0);
  const [minMargin3, setMinMargin3] = useState(0);

  async function load() {
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
      setError(e?.message || "Failed to load arbs");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    const t = setInterval(load, 30000);
    return () => clearInterval(t);
  }, []);

  const stake = Math.max(1, Number(stakeInput) || 50);
  const isElite = plan === "elite" && active;

  function toggle(id: string | number | undefined, i: number) {
    const key = id ?? i;
    setExpandedId((p) => (p === key ? null : key));
  }

  const activeArbs = tab === "2way" ? arbs2 : arbs3;
  const hotArbs = activeArbs.slice(0, 3);

  const stats = useMemo(() => {
    const base = Number(activeArbs[0]?.total_stake ?? 50) || 50;
    const scale = stake / base;
    return {
      count: activeArbs.length,
      bestMargin: activeArbs.length
        ? Math.max(...activeArbs.map((a) => Number(a.margin) || 0))
        : 0,
      bestProfit: activeArbs.length
        ? Math.max(
            ...activeArbs.map((a) => (Number(a.est_profit) || 0) * scale)
          )
        : 0,
    };
  }, [activeArbs, stake]);

  return (
    <main style={s.page}>
      <div style={s.wrap}>
        {/* Trial banner */}
        {trial && !loading && (
          <div style={s.trialBanner}>
            <div style={s.trialLeft}>
              <div style={s.trialBadge}>FREE TRIAL</div>
              <div>
                <div style={s.trialTitle}>
                  {trialDaysLeft > 0
                    ? `${trialDaysLeft} day${
                        trialDaysLeft !== 1 ? "s" : ""
                      } left`
                    : "Trial ends today"}
                </div>
                <div style={s.trialSub}>
                  Full live feed access · card charged automatically when trial
                  ends
                </div>
              </div>
            </div>
            <Link href="/pricing" style={s.trialAction}>
              Manage plan
            </Link>
          </div>
        )}

        {/* Header */}
        <div style={s.header}>
          <div>
            <h1 style={s.title}>Arbitrage feed</h1>
            <p style={s.sub}>
              {demo
                ? "Demo mode — subscribe to unlock live arbs"
                : "Live markets · auto-refreshes every 30s"}
            </p>
          </div>
          <div style={s.headerRight}>
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
            <div style={s.pulse}>
              <div style={s.pulseDot} />
              {updatedAt ? updatedAt.toLocaleTimeString("en-GB") : "Waiting…"}
            </div>
          </div>
        </div>

        {/* Lock banners */}
        {!signedIn && !loading && (
          <div style={s.lock}>
            <div>
              <div style={s.lockT}>Sign in to access the live feed</div>
              <div style={s.lockS}>
                Guest mode — sign in and subscribe to unlock live arbs.
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
                Start a free 7-day trial — card required, cancels automatically.
              </div>
            </div>
            <div style={s.lockBtns}>
              <Link href="/pricing" style={s.btnP}>
                Try free — 7 days
              </Link>
            </div>
          </div>
        )}

        {/* Stats */}
        <div style={s.stats}>
          {[
            {
              label: demo
                ? "Demo arbs"
                : tab === "2way"
                ? "2-way arbs"
                : "3-way arbs",
              val: stats.count,
            },
            { label: "Best margin", val: pct(stats.bestMargin) },
            {
              label: `Best profit @ £${stake}`,
              val: active ? `+${fmt(stats.bestProfit)}` : "—",
            },
            {
              label: "Plan",
              val: plan
                ? plan[0].toUpperCase() + plan.slice(1)
                : signedIn
                ? "None"
                : "Guest",
            },
          ].map(({ label, val }) => (
            <div key={label} style={s.statCard}>
              <div style={s.statL}>{label}</div>
              <div style={s.statV}>{val}</div>
            </div>
          ))}
        </div>

        {loading && <div style={s.info}>Loading arbs…</div>}
        {!loading && error && (
          <div style={{ ...s.info, ...s.infoErr }}>{error}</div>
        )}

        {!loading && !error && (
          <>
            {/* Tabs */}
            <div style={s.tabs}>
              <button
                style={{ ...s.tab, ...(tab === "2way" ? s.tabActive : {}) }}
                onClick={() => {
                  setTab("2way");
                  setExpandedId(null);
                }}
              >
                2-Way arbs
                <span style={s.tabCount}>{arbs2.length}</span>
              </button>
              <button
                style={{
                  ...s.tab,
                  ...(tab === "3way" ? s.tabActive : {}),
                  ...(!isElite ? s.tabLocked : {}),
                }}
                onClick={() => {
                  if (isElite) {
                    setTab("3way");
                    setExpandedId(null);
                  }
                }}
                title={!isElite ? "Elite plan required" : undefined}
              >
                3-Way arbs
                <span style={s.tabCount}>{isElite ? arbs3.length : "🔒"}</span>
                {!isElite && <span style={s.elitePill}>Elite</span>}
              </button>
            </div>

            {/* Elite upsell */}
            {tab === "3way" && !isElite && (
              <div style={s.upsell}>
                <div style={s.upsellLeft}>
                  <div style={s.upsellTitle}>3-Way arbs are Elite only</div>
                  <div style={s.upsellSub}>
                    Football 1X2 arbs across home/draw/away markets — harder to
                    spot, higher margins. Unlock with Elite.
                  </div>
                </div>
                <Link href="/pricing" style={s.btnP}>
                  Upgrade to Elite
                </Link>
              </div>
            )}

            {/* Hot arbs */}
            {(tab === "2way" || isElite) && hotArbs.length > 0 && (
              <>
                <div style={s.secLabel}>Hot arbs</div>
                <div style={s.hotGrid}>
                  {hotArbs.map((a, i) => (
                    <HotCard
                      key={a.id ?? i}
                      arb={a}
                      stake={stake}
                      onExpand={() => toggle(a.id, i)}
                    />
                  ))}
                </div>
              </>
            )}

            {/* All arbs */}
            {(tab === "2way" || isElite) && (
              <>
                <div style={s.secLabel}>All arbs</div>
                <ArbTable
                  arbs={activeArbs}
                  stake={stake}
                  demo={demo}
                  is3way={tab === "3way"}
                  expandedId={expandedId}
                  onToggle={toggle}
                  minMargin={tab === "2way" ? minMargin2 : minMargin3}
                  setMinMargin={tab === "2way" ? setMinMargin2 : setMinMargin3}
                />
              </>
            )}
          </>
        )}
      </div>
    </main>
  );
}

// ── Styles ────────────────────────────────────────────────────
const s: Record<string, React.CSSProperties> = {
  page: { minHeight: "100vh", padding: "32px 0 80px" },
  wrap: { width: "100%" },

  trialBanner: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 16,
    flexWrap: "wrap",
    marginBottom: 20,
    padding: "14px 20px",
    borderRadius: 16,
    border: "1px solid rgba(245,158,11,0.28)",
    background: "rgba(245,158,11,0.07)",
  },
  trialLeft: {
    display: "flex",
    alignItems: "center",
    gap: 14,
    flexWrap: "wrap",
  },
  trialBadge: {
    fontSize: 10,
    fontWeight: 800,
    letterSpacing: "0.1em",
    padding: "4px 9px",
    borderRadius: 999,
    border: "1px solid rgba(245,158,11,0.38)",
    background: "rgba(245,158,11,0.12)",
    color: "rgba(245,158,11,0.95)",
  },
  trialTitle: {
    fontSize: 14,
    fontWeight: 700,
    color: "white",
    marginBottom: 2,
  },
  trialSub: { fontSize: 12, color: "rgba(255,255,255,0.5)" },
  trialAction: {
    textDecoration: "none",
    fontSize: 13,
    fontWeight: 700,
    padding: "9px 14px",
    borderRadius: 12,
    border: "1px solid rgba(245,158,11,0.35)",
    background: "rgba(245,158,11,0.12)",
    color: "rgba(245,158,11,0.95)",
    whiteSpace: "nowrap" as const,
  },

  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-end",
    gap: 16,
    marginBottom: 20,
    flexWrap: "wrap",
  },
  title: {
    fontSize: 34,
    fontWeight: 900,
    letterSpacing: "-0.03em",
    margin: 0,
    color: "white",
  },
  sub: { margin: "6px 0 0", color: "rgba(255,255,255,0.5)", fontSize: 13 },
  headerRight: {
    display: "flex",
    gap: 10,
    alignItems: "center",
    flexWrap: "wrap" as const,
  },
  stakeBox: {
    display: "flex",
    alignItems: "center",
    gap: 6,
    border: "1px solid rgba(255,255,255,0.10)",
    background: "rgba(10,14,20,0.5)",
    borderRadius: 12,
    padding: "8px 12px",
  },
  stakePre: { color: "rgba(255,255,255,0.55)", fontWeight: 700, fontSize: 13 },
  stakeIn: {
    background: "transparent",
    border: "none",
    outline: "none",
    color: "white",
    fontSize: 14,
    fontWeight: 700,
    width: 55,
  },
  pulse: {
    display: "flex",
    alignItems: "center",
    gap: 7,
    border: "1px solid rgba(255,255,255,0.10)",
    background: "rgba(10,14,20,0.5)",
    borderRadius: 12,
    padding: "8px 12px",
    fontSize: 13,
    color: "rgba(255,255,255,0.65)",
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
    border: "1px solid rgba(255,255,255,0.08)",
    background: "rgba(10,14,20,0.5)",
    borderRadius: 16,
    padding: "18px 20px",
    marginBottom: 20,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 16,
    flexWrap: "wrap",
  },
  lockT: { color: "white", fontSize: 17, fontWeight: 800, marginBottom: 4 },
  lockS: { color: "rgba(255,255,255,0.55)", fontSize: 13, lineHeight: 1.5 },
  lockBtns: { display: "flex", gap: 10, flexWrap: "wrap" as const },

  stats: {
    display: "grid",
    gridTemplateColumns: "repeat(4, minmax(0,1fr))",
    gap: 10,
    marginBottom: 24,
  },
  statCard: {
    border: "1px solid rgba(255,255,255,0.07)",
    background: "rgba(10,14,20,0.4)",
    borderRadius: 14,
    padding: "14px 16px",
  },
  statL: { color: "rgba(255,255,255,0.45)", fontSize: 11, marginBottom: 6 },
  statV: {
    color: "white",
    fontSize: 20,
    fontWeight: 800,
    letterSpacing: "-0.02em",
  },

  info: {
    border: "1px solid rgba(255,255,255,0.07)",
    background: "rgba(10,14,20,0.4)",
    borderRadius: 14,
    padding: 18,
    color: "rgba(255,255,255,0.6)",
    fontSize: 14,
  },
  infoErr: { border: "1px solid rgba(255,90,90,0.25)", color: "#ffb4b4" },

  // Tabs
  tabs: { display: "flex", gap: 6, marginBottom: 24 },
  tab: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    padding: "10px 18px",
    borderRadius: 12,
    fontSize: 14,
    fontWeight: 700,
    cursor: "pointer",
    border: "1px solid rgba(255,255,255,0.08)",
    background: "rgba(10,14,20,0.4)",
    color: "rgba(255,255,255,0.55)",
    transition: "all 0.15s",
  },
  tabActive: {
    border: "1px solid rgba(120,110,255,0.4)",
    background: "rgba(120,110,255,0.12)",
    color: "white",
  },
  tabLocked: { opacity: 0.5, cursor: "not-allowed" },
  tabCount: {
    fontSize: 11,
    padding: "2px 7px",
    borderRadius: 999,
    background: "rgba(255,255,255,0.06)",
    color: "rgba(255,255,255,0.5)",
  },
  elitePill: {
    fontSize: 10,
    fontWeight: 800,
    padding: "2px 7px",
    borderRadius: 999,
    background: "rgba(120,110,255,0.15)",
    border: "1px solid rgba(120,110,255,0.3)",
    color: "rgba(180,170,255,0.9)",
    letterSpacing: "0.05em",
  },

  // Upsell
  upsell: {
    border: "1px solid rgba(120,110,255,0.2)",
    background: "rgba(120,110,255,0.06)",
    borderRadius: 16,
    padding: "18px 20px",
    marginBottom: 24,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 16,
    flexWrap: "wrap",
  },
  upsellLeft: {},
  upsellTitle: {
    color: "white",
    fontSize: 17,
    fontWeight: 800,
    marginBottom: 4,
  },
  upsellSub: {
    color: "rgba(255,255,255,0.55)",
    fontSize: 13,
    lineHeight: 1.5,
    maxWidth: 560,
  },

  secLabel: {
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: "0.12em",
    color: "rgba(255,255,255,0.35)",
    textTransform: "uppercase" as const,
    marginBottom: 10,
  },

  // Hot
  hotGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, minmax(0,1fr))",
    gap: 10,
    marginBottom: 28,
  },
  hotCard: {
    border: "1px solid rgba(255,255,255,0.08)",
    background: "rgba(10,14,20,0.45)",
    borderRadius: 16,
    padding: "14px 16px",
    cursor: "pointer",
  },
  hotTop: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  hotTopLeft: { display: "flex", alignItems: "center", gap: 6 },
  hotEmoji: { fontSize: 18 },
  badge3way: {
    fontSize: 10,
    fontWeight: 800,
    padding: "2px 7px",
    borderRadius: 999,
    background: "rgba(120,110,255,0.15)",
    border: "1px solid rgba(120,110,255,0.3)",
    color: "rgba(180,170,255,0.9)",
  },
  hotMargin: {
    fontSize: 13,
    fontWeight: 800,
    color: "#9be7bf",
    padding: "3px 9px",
    borderRadius: 999,
    background: "rgba(0,255,140,0.08)",
    border: "1px solid rgba(0,255,140,0.14)",
  },
  hotEvent: {
    fontSize: 14,
    fontWeight: 700,
    color: "white",
    marginBottom: 8,
    lineHeight: 1.3,
  },
  hotRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  hotBooks: { fontSize: 11, color: "rgba(255,255,255,0.38)" },
  hotProfit: { fontSize: 13, fontWeight: 700, color: "rgba(255,255,255,0.75)" },
  hotTime: { fontSize: 11, color: "rgba(255,255,255,0.28)", marginTop: 6 },

  // Filters
  filtersBar: { display: "flex", justifyContent: "flex-end", marginBottom: 10 },
  filtersRight: { display: "flex", alignItems: "center", gap: 10 },
  filterL: { fontSize: 12, color: "rgba(255,255,255,0.4)" },
  sel: {
    background: "rgba(10,14,20,0.6)",
    border: "1px solid rgba(255,255,255,0.10)",
    borderRadius: 10,
    color: "white",
    padding: "6px 10px",
    fontSize: 13,
    outline: "none",
    cursor: "pointer",
  },
  countPill: {
    fontSize: 12,
    color: "rgba(255,255,255,0.4)",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: 999,
    padding: "4px 10px",
  },

  // Table
  tableWrap: {
    border: "1px solid rgba(255,255,255,0.07)",
    borderRadius: 18,
    overflow: "hidden",
    background: "rgba(10,14,20,0.3)",
  },
  table: { width: "100%", borderCollapse: "collapse" as const },
  th: {
    fontSize: 11,
    fontWeight: 600,
    color: "rgba(255,255,255,0.35)",
    textAlign: "left" as const,
    padding: "10px 14px",
    borderBottom: "1px solid rgba(255,255,255,0.06)",
    letterSpacing: "0.04em",
    background: "rgba(0,0,0,0.12)",
  },
  row: { borderBottom: "1px solid rgba(255,255,255,0.05)", cursor: "pointer" },
  rowActive: { background: "rgba(120,110,255,0.07)" },
  td: { padding: "12px 14px", verticalAlign: "middle" as const },
  tdR: {
    padding: "12px 14px",
    verticalAlign: "middle" as const,
    textAlign: "right" as const,
  },
  cellEvent: { fontSize: 14, fontWeight: 700, color: "white", marginBottom: 3 },
  cellMeta: {
    display: "flex",
    gap: 6,
    alignItems: "center",
    fontSize: 11,
    color: "rgba(255,255,255,0.38)",
  },
  chip: {
    fontSize: 10,
    padding: "2px 7px",
    borderRadius: 999,
    border: "1px solid rgba(255,255,255,0.09)",
    background: "rgba(255,255,255,0.03)",
    color: "rgba(255,255,255,0.45)",
  },
  chip3: {
    fontSize: 10,
    padding: "2px 7px",
    borderRadius: 999,
    border: "1px solid rgba(120,110,255,0.3)",
    background: "rgba(120,110,255,0.1)",
    color: "rgba(180,170,255,0.9)",
  },
  cellBook: { fontSize: 13, fontWeight: 600, color: "white", marginBottom: 2 },
  cellOdds: { color: "#98b8ff", fontWeight: 600 },
  cellPick: { fontSize: 12, color: "rgba(255,255,255,0.45)" },
  marginBadge: { fontSize: 14, fontWeight: 800 },
  profitBadge: {
    fontSize: 14,
    fontWeight: 700,
    color: "rgba(255,255,255,0.85)",
  },
  timeBadge: { fontSize: 12, color: "rgba(255,255,255,0.4)" },
  chevron: {
    fontSize: 15,
    color: "rgba(255,255,255,0.28)",
    display: "inline-block",
    transition: "transform 0.2s",
  },
  chevronOpen: { transform: "rotate(180deg)", color: "rgba(255,255,255,0.65)" },

  // Expand
  expandRow: { background: "rgba(120,110,255,0.035)" },
  expandCell: { padding: "0 14px 14px" },
  expandBox: {
    border: "1px solid rgba(120,110,255,0.16)",
    borderRadius: 14,
    padding: 16,
    background: "rgba(10,14,20,0.55)",
  },
  expandLegs: {
    display: "flex",
    gap: 16,
    alignItems: "flex-start",
    flexWrap: "wrap" as const,
  },
  expandLeg: { flex: 1, minWidth: 120 },
  expandBook: {
    fontSize: 15,
    fontWeight: 800,
    color: "white",
    marginBottom: 3,
  },
  expandPick: {
    fontSize: 12,
    color: "rgba(255,255,255,0.55)",
    marginBottom: 10,
  },
  expandStat: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  expandL: { fontSize: 12, color: "rgba(255,255,255,0.38)" },
  expandV: { fontSize: 13, fontWeight: 800, color: "white" },
  expandOdds: { fontSize: 13, fontWeight: 700, color: "#98b8ff" },
  expandVr: {
    width: 1,
    background: "rgba(255,255,255,0.06)",
    alignSelf: "stretch",
  },
  expandSummary: { flex: 1, minWidth: 120 },
  expandTip: {
    marginTop: 12,
    fontSize: 12,
    color: "rgba(255,255,255,0.45)",
    borderTop: "1px solid rgba(255,255,255,0.06)",
    paddingTop: 10,
    lineHeight: 1.6,
  },

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
