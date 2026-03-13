"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type Arb = {
  id?: number | string;
  event: string;
  sport_key: string;
  market_group: string;
  commence_time: string;
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
};

type ArbApiResponse = {
  signedIn: boolean;
  active: boolean;
  demo: boolean;
  plan?: string | null;
  trial?: boolean;
  trialDaysLeft?: number;
  arbs: Arb[];
  error?: string;
};

function formatMoney(value: number | string | null | undefined) {
  const n = Number(value ?? 0);
  return `£${n.toFixed(2)}`;
}

function formatPercent(value: number | string | null | undefined) {
  const n = Number(value ?? 0);
  return `${(n * 100).toFixed(2)}%`;
}

function formatDate(value: string | null | undefined) {
  if (!value) return "Unknown start";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "Unknown start";
  return d.toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function DashboardPage() {
  const [arbs, setArbs] = useState<Arb[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatedAt, setUpdatedAt] = useState<Date | null>(null);
  const [signedIn, setSignedIn] = useState(false);
  const [active, setActive] = useState(false);
  const [demo, setDemo] = useState(false);
  const [plan, setPlan] = useState<string | null>(null);
  const [trial, setTrial] = useState(false);
  const [trialDaysLeft, setTrialDaysLeft] = useState(0);
  const [totalStakeInput, setTotalStakeInput] = useState("50");

  async function loadArbs() {
    try {
      setError("");
      const res = await fetch("/api/arbs", { cache: "no-store" });
      const data: ArbApiResponse = await res.json();

      if (!res.ok) throw new Error(data?.error || "Failed to load arbs");

      setArbs(Array.isArray(data.arbs) ? data.arbs : []);
      setSignedIn(Boolean(data.signedIn));
      setActive(Boolean(data.active));
      setDemo(Boolean(data.demo));
      setPlan(data.plan ?? null);
      setTrial(Boolean(data.trial));
      setTrialDaysLeft(data.trialDaysLeft ?? 0);
      setUpdatedAt(new Date());
    } catch (err: any) {
      setError(err?.message || "Failed to load arbs");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadArbs();
    const interval = setInterval(loadArbs, 30000);
    return () => clearInterval(interval);
  }, []);

  const totalStake = Math.max(1, Number(totalStakeInput) || 0);

  const topStats = useMemo(() => {
    const count = arbs.length;
    const bestMargin = count
      ? Math.max(...arbs.map((a) => Number(a.margin) || 0))
      : 0;
    const bestProfit = count
      ? Math.max(
          ...arbs.map((a) => {
            const baseStake = Number(a.total_stake ?? 50) || 50;
            const scale = totalStake / baseStake;
            return (Number(a.est_profit) || 0) * scale;
          })
        )
      : 0;
    return { count, bestMargin, bestProfit };
  }, [arbs, totalStake]);

  return (
    <main style={styles.page}>
      <div style={styles.wrap}>
        {/* ── Trial banner ─────────────────────────────────────────── */}
        {trial && !loading && (
          <div style={styles.trialBanner}>
            <div style={styles.trialLeft}>
              <div style={styles.trialBadge}>FREE TRIAL</div>
              <div>
                <div style={styles.trialTitle}>
                  {trialDaysLeft > 0
                    ? `${trialDaysLeft} day${
                        trialDaysLeft !== 1 ? "s" : ""
                      } left in your trial`
                    : "Your trial ends today"}
                </div>
                <div style={styles.trialSub}>
                  You have full access to the live feed. Your card will be
                  charged automatically when the trial ends.
                </div>
              </div>
            </div>
            <Link
              href="/pricing"
              style={{ ...styles.ctaBtn, ...styles.trialBtn }}
            >
              Manage plan
            </Link>
          </div>
        )}

        <div style={styles.header}>
          <div>
            <h1 style={styles.title}>Arbitrage Opportunities</h1>
            <p style={styles.sub}>
              2-way markets only. Auto-refreshing every 30 seconds.
            </p>
          </div>
          <div style={styles.refreshBox}>
            <div style={styles.refreshLabel}>Last update</div>
            <div style={styles.refreshValue}>
              {updatedAt ? updatedAt.toLocaleTimeString("en-GB") : "Waiting..."}
            </div>
          </div>
        </div>

        {!signedIn && !loading && (
          <div style={styles.lockCard}>
            <div>
              <div style={styles.lockTitle}>Sign in to access the feed</div>
              <div style={styles.lockSub}>
                You're currently viewing guest mode. Sign in, then activate a
                plan to unlock live arbs.
              </div>
            </div>
            <div style={styles.lockActions}>
              <Link
                href="/login"
                style={{ ...styles.ctaBtn, ...styles.primaryBtn }}
              >
                Log in
              </Link>
              <Link href="/pricing" style={styles.ctaBtn}>
                View plans
              </Link>
            </div>
          </div>
        )}

        {signedIn && !active && !loading && (
          <div style={styles.lockCard}>
            <div>
              <div style={styles.lockTitle}>Demo mode active</div>
              <div style={styles.lockSub}>
                Your account is signed in but no active subscription was found.
                Start a free trial or upgrade to unlock the live feed.
              </div>
            </div>
            <div style={styles.lockActions}>
              <Link
                href="/pricing"
                style={{ ...styles.ctaBtn, ...styles.primaryBtn }}
              >
                Try free — 7 days
              </Link>
            </div>
          </div>
        )}

        {/* Stake input */}
        <div style={styles.controlCard}>
          <div style={styles.controlTitle}>Total stake</div>
          <div style={styles.stakeInputWrap}>
            <span style={styles.currency}>£</span>
            <input
              type="number"
              min="1"
              step="1"
              value={totalStakeInput}
              onChange={(e) => setTotalStakeInput(e.target.value)}
              style={styles.stakeInput}
            />
          </div>
        </div>

        <div style={styles.statsGrid}>
          <div style={styles.statCard}>
            <div style={styles.statLabel}>
              {demo ? "Demo arbs" : "Live arbs"}
            </div>
            <div style={styles.statValue}>{topStats.count}</div>
          </div>
          <div style={styles.statCard}>
            <div style={styles.statLabel}>Best margin</div>
            <div style={styles.statValue}>
              {formatPercent(topStats.bestMargin)}
            </div>
          </div>
          <div style={styles.statCard}>
            <div style={styles.statLabel}>
              {active ? "Best profit" : "Mode"}
            </div>
            <div style={styles.statValue}>
              {active
                ? formatMoney(topStats.bestProfit)
                : trial
                ? "Trial"
                : signedIn
                ? "Demo"
                : "Guest"}
            </div>
          </div>
        </div>

        {loading && <div style={styles.infoCard}>Loading arbs...</div>}
        {!loading && error && (
          <div style={{ ...styles.infoCard, ...styles.errorCard }}>{error}</div>
        )}
        {!loading && !error && arbs.length === 0 && (
          <div style={styles.infoCard}>
            No arbs found yet. Worker may still be scanning.
          </div>
        )}

        {!loading && !error && arbs.length > 0 && (
          <div style={styles.grid}>
            {arbs.map((arb, index) => {
              const baseStake = Number(arb.total_stake ?? 50) || 50;
              const scale = totalStake / baseStake;
              const leg1Stake = Number(arb.leg1_stake) * scale;
              const leg2Stake = Number(arb.leg2_stake) * scale;
              const estProfit = Number(arb.est_profit) * scale;

              return (
                <div
                  key={arb.id ?? index}
                  style={{ ...styles.card, ...(demo ? styles.demoCard : {}) }}
                >
                  <div style={styles.cardTop}>
                    <div>
                      <div style={styles.event}>{arb.event}</div>
                      <div style={styles.metaRow}>
                        <span style={styles.chip}>{arb.sport_key}</span>
                        <span style={styles.chip}>{arb.market_group}</span>
                        <span style={styles.chip}>
                          {formatDate(arb.commence_time)}
                        </span>
                        {plan && <span style={styles.chip}>{plan}</span>}
                      </div>
                    </div>
                    <div style={styles.metricWrap}>
                      <div style={styles.metricBox}>
                        <div style={styles.metricLabel}>Margin</div>
                        <div style={styles.metricValue}>
                          {formatPercent(arb.margin)}
                        </div>
                      </div>
                      <div
                        style={{
                          ...styles.metricBox,
                          ...styles.metricBoxProfit,
                        }}
                      >
                        <div style={styles.metricLabel}>Profit</div>
                        <div style={styles.metricValue}>
                          {formatMoney(estProfit)}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div style={styles.legsGrid}>
                    <div style={styles.legCard}>
                      <div style={styles.legTop}>
                        <div style={styles.book}>{arb.leg1_book}</div>
                        <div style={styles.odds}>
                          @ {Number(arb.leg1_odds).toFixed(2)}
                        </div>
                      </div>
                      <div style={styles.pick}>{arb.leg1_name}</div>
                      <div style={styles.stakeRow}>
                        <span style={styles.stakeLabel}>Stake</span>
                        <span style={styles.stakeValue}>
                          {formatMoney(leg1Stake)}
                        </span>
                      </div>
                    </div>

                    <div style={styles.legCard}>
                      <div style={styles.legTop}>
                        <div style={styles.book}>{arb.leg2_book}</div>
                        <div style={styles.odds}>
                          @ {Number(arb.leg2_odds).toFixed(2)}
                        </div>
                      </div>
                      <div style={styles.pick}>{arb.leg2_name}</div>
                      <div style={styles.stakeRow}>
                        <span style={styles.stakeLabel}>Stake</span>
                        <span style={styles.stakeValue}>
                          {formatMoney(leg2Stake)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div style={styles.cardBottom}>
                    <div style={styles.totalStake}>
                      Total stake: {formatMoney(totalStake)}
                    </div>
                    <div style={styles.readyTag}>
                      {demo
                        ? "Demo feed"
                        : trial
                        ? "Trial access"
                        : "Ready to place"}
                    </div>
                  </div>

                  {demo && <div style={styles.demoOverlay} />}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: { minHeight: "100vh", padding: "36px 24px 80px" },
  wrap: { maxWidth: 1280, margin: "0 auto" },

  trialBanner: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 16,
    flexWrap: "wrap",
    marginBottom: 20,
    padding: "16px 20px",
    borderRadius: 20,
    border: "1px solid rgba(245, 158, 11, 0.30)",
    background: "rgba(245, 158, 11, 0.08)",
    backdropFilter: "blur(12px)",
  },
  trialLeft: {
    display: "flex",
    alignItems: "center",
    gap: 14,
    flexWrap: "wrap",
  },
  trialBadge: {
    fontSize: 11,
    fontWeight: 800,
    letterSpacing: "0.08em",
    padding: "5px 10px",
    borderRadius: 999,
    border: "1px solid rgba(245,158,11,0.4)",
    background: "rgba(245,158,11,0.14)",
    color: "rgba(245,158,11,0.95)",
    whiteSpace: "nowrap",
  },
  trialTitle: {
    color: "white",
    fontWeight: 800,
    fontSize: 15,
    marginBottom: 2,
  },
  trialSub: { color: "rgba(255,255,255,0.65)", fontSize: 13 },
  trialBtn: {
    background: "rgba(245,158,11,0.18)",
    border: "1px solid rgba(245,158,11,0.35)",
    color: "rgba(245,158,11,0.95)",
    whiteSpace: "nowrap",
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
    fontSize: 48,
    fontWeight: 800,
    letterSpacing: "-0.03em",
    margin: 0,
    color: "white",
  },
  sub: { margin: "10px 0 0", color: "rgba(255,255,255,0.68)", fontSize: 16 },
  refreshBox: {
    border: "1px solid rgba(255,255,255,0.10)",
    background: "rgba(10,14,20,0.45)",
    borderRadius: 18,
    padding: "14px 16px",
    minWidth: 170,
    backdropFilter: "blur(12px)",
  },
  refreshLabel: {
    color: "rgba(255,255,255,0.58)",
    fontSize: 12,
    marginBottom: 6,
  },
  refreshValue: { color: "white", fontSize: 16, fontWeight: 700 },

  lockCard: {
    border: "1px solid rgba(255,255,255,0.10)",
    background: "rgba(10,14,20,0.50)",
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 16,
    flexWrap: "wrap",
    backdropFilter: "blur(12px)",
  },
  lockTitle: { color: "white", fontSize: 22, fontWeight: 800, marginBottom: 8 },
  lockSub: {
    color: "rgba(255,255,255,0.72)",
    fontSize: 15,
    maxWidth: 780,
    lineHeight: 1.5,
  },
  lockActions: { display: "flex", gap: 12, flexWrap: "wrap" },
  ctaBtn: {
    textDecoration: "none",
    color: "white",
    border: "1px solid rgba(255,255,255,0.12)",
    background: "rgba(255,255,255,0.06)",
    padding: "12px 16px",
    borderRadius: 14,
    fontWeight: 700,
    fontSize: 14,
  },
  primaryBtn: {
    background:
      "linear-gradient(90deg, rgba(120,110,255,0.95), rgba(0,190,255,0.75))",
    border: "1px solid rgba(120,110,255,0.45)",
  },

  controlCard: {
    border: "1px solid rgba(255,255,255,0.10)",
    background: "rgba(10,14,20,0.42)",
    borderRadius: 20,
    padding: 18,
    backdropFilter: "blur(12px)",
    marginBottom: 16,
    display: "flex",
    alignItems: "center",
    gap: 16,
    flexWrap: "wrap",
  },
  controlTitle: { color: "white", fontSize: 15, fontWeight: 700 },
  stakeInputWrap: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    border: "1px solid rgba(255,255,255,0.12)",
    background: "rgba(255,255,255,0.04)",
    borderRadius: 16,
    padding: "10px 14px",
  },
  currency: { color: "white", fontWeight: 800, fontSize: 18 },
  stakeInput: {
    background: "transparent",
    border: "none",
    outline: "none",
    color: "white",
    fontSize: 18,
    width: 80,
  },

  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
    gap: 16,
    marginBottom: 22,
  },
  statCard: {
    border: "1px solid rgba(255,255,255,0.10)",
    background: "rgba(10,14,20,0.42)",
    borderRadius: 20,
    padding: 18,
    backdropFilter: "blur(12px)",
  },
  statLabel: {
    color: "rgba(255,255,255,0.58)",
    fontSize: 13,
    marginBottom: 10,
  },
  statValue: {
    color: "white",
    fontSize: 28,
    fontWeight: 800,
    letterSpacing: "-0.02em",
  },

  infoCard: {
    border: "1px solid rgba(255,255,255,0.10)",
    background: "rgba(10,14,20,0.42)",
    borderRadius: 20,
    padding: 18,
    color: "white",
    backdropFilter: "blur(12px)",
  },
  errorCard: { border: "1px solid rgba(255,90,90,0.30)", color: "#ffb4b4" },

  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
    gap: 20,
  },
  card: {
    position: "relative",
    overflow: "hidden",
    border: "1px solid rgba(255,255,255,0.10)",
    background:
      "linear-gradient(180deg, rgba(14,18,28,0.82), rgba(8,10,16,0.82))",
    borderRadius: 24,
    padding: 20,
    boxShadow: "0 18px 50px rgba(0,0,0,0.28)",
    backdropFilter: "blur(14px)",
  },
  demoCard: { opacity: 0.78 },
  demoOverlay: {
    position: "absolute",
    inset: 0,
    background:
      "linear-gradient(180deg, rgba(8,10,16,0.12), rgba(8,10,16,0.28))",
    pointerEvents: "none",
  },
  cardTop: {
    display: "flex",
    justifyContent: "space-between",
    gap: 16,
    marginBottom: 18,
    flexWrap: "wrap",
  },
  event: {
    color: "white",
    fontSize: 24,
    fontWeight: 800,
    letterSpacing: "-0.02em",
    marginBottom: 12,
  },
  metaRow: { display: "flex", gap: 8, flexWrap: "wrap" },
  chip: {
    fontSize: 12,
    color: "rgba(255,255,255,0.84)",
    border: "1px solid rgba(255,255,255,0.10)",
    background: "rgba(255,255,255,0.05)",
    borderRadius: 999,
    padding: "7px 10px",
  },
  metricWrap: { display: "flex", gap: 10, flexWrap: "wrap" },
  metricBox: {
    minWidth: 120,
    borderRadius: 18,
    padding: "12px 14px",
    background: "rgba(255,255,255,0.05)",
    border: "1px solid rgba(255,255,255,0.10)",
  },
  metricBoxProfit: {
    background: "rgba(0,255,140,0.08)",
    border: "1px solid rgba(0,255,140,0.18)",
  },
  metricLabel: {
    color: "rgba(255,255,255,0.58)",
    fontSize: 12,
    marginBottom: 6,
  },
  metricValue: { color: "white", fontSize: 22, fontWeight: 800 },
  legsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
    gap: 14,
    marginBottom: 16,
  },
  legCard: {
    border: "1px solid rgba(255,255,255,0.10)",
    background: "rgba(255,255,255,0.04)",
    borderRadius: 20,
    padding: 16,
  },
  legTop: {
    display: "flex",
    justifyContent: "space-between",
    gap: 10,
    marginBottom: 12,
    alignItems: "center",
  },
  book: { color: "white", fontSize: 16, fontWeight: 700 },
  odds: { color: "#98b8ff", fontSize: 14, fontWeight: 700 },
  pick: {
    color: "rgba(255,255,255,0.92)",
    fontSize: 15,
    lineHeight: 1.45,
    marginBottom: 16,
    minHeight: 44,
  },
  stakeRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  stakeLabel: { color: "rgba(255,255,255,0.58)", fontSize: 13 },
  stakeValue: { color: "white", fontSize: 16, fontWeight: 800 },
  cardBottom: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
    flexWrap: "wrap",
    paddingTop: 14,
    borderTop: "1px solid rgba(255,255,255,0.08)",
  },
  totalStake: { color: "rgba(255,255,255,0.68)", fontSize: 14 },
  readyTag: {
    color: "#9be7bf",
    border: "1px solid rgba(0,255,140,0.18)",
    background: "rgba(0,255,140,0.08)",
    borderRadius: 999,
    padding: "8px 12px",
    fontSize: 12,
    fontWeight: 700,
  },
};
