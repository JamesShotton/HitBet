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

// ── Tutorial modal ────────────────────────────────────────────────────────────

const VALUE_TUTORIAL_STEPS = [
  {
    icon: "📊",
    title: "What is a value bet?",
    body: "A value bet is when a soft bookmaker is offering significantly better odds than the true probability of an outcome. Unlike arbs, you're not guaranteed profit on every individual bet — but if the edge is real, placing enough value bets compounds into consistent profit over time. Think of it like a casino: they don't win every hand, but the edge means they always win over volume.",
  },
  {
    icon: "🔪",
    title: "Sharp vs soft books",
    body: "Sharp bookmakers (Betfair Exchange, Pinnacle) set prices efficiently — their odds represent the true probability very closely. Soft books (Bet365, Coral, etc.) lag behind sharp money and sometimes overprice outcomes. We compare every soft book price against the sharpest available price. When a soft book is significantly above the true price, that's your edge.",
  },
  {
    icon: "📐",
    title: "Reading the numbers",
    body: (
      <div style={{ display: "grid", gap: 10 }}>
        {[
          { term: "Edge %", desc: "How much above true probability the soft book's odds are. 10% edge means you're getting paid 10% more than the real chance of winning." },
          { term: "EV (£)", desc: "Expected value in pounds at the suggested Kelly stake. This is your average profit per bet if the edge holds — not a guaranteed figure." },
          { term: "Kelly stake", desc: "The mathematically optimal bet size for your bankroll. We show quarter-Kelly for safety. Adjust it to your own bankroll — never bet more than you can afford to lose on a single outcome." },
        ].map(({ term, desc }) => (
          <div key={term} style={{ display: "flex", gap: 10 }}>
            <span style={{ fontSize: 11, fontWeight: 800, padding: "2px 8px", borderRadius: 6, background: "rgba(120,110,255,0.15)", border: "1px solid rgba(120,110,255,0.25)", color: "rgba(160,150,255,0.9)", whiteSpace: "nowrap", marginTop: 2, flexShrink: 0 }}>{term}</span>
            <span style={{ fontSize: 13, color: "rgba(255,255,255,0.65)", lineHeight: 1.55 }}>{desc}</span>
          </div>
        ))}
      </div>
    ),
  },
  {
    icon: "⚠️",
    title: "Volume is everything",
    body: "Individual value bets will lose — that's expected and normal. A 12% edge doesn't mean you win 12% more every bet, it means over hundreds of bets the expected return is +12%. Don't chase losses or increase stakes after a bad run. Flat staking or Kelly staking consistently over time is how the edge materialises. This is not a get-rich-quick tool.",
  },
];

function ValueTutorialModal({ onClose }: { onClose: (dontShow: boolean) => void }) {
  const [step, setStep] = useState(0);
  const [dontShow, setDontShow] = useState(false);
  const current = VALUE_TUTORIAL_STEPS[step];
  const isLast = step === VALUE_TUTORIAL_STEPS.length - 1;

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 300, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
      <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.75)", backdropFilter: "blur(6px)" }} onClick={() => onClose(dontShow)} />
      <div style={{
        position: "relative", width: "100%", maxWidth: 500,
        background: "rgba(10,14,22,0.98)",
        border: "1px solid rgba(255,255,255,0.1)",
        borderRadius: 24,
        boxShadow: "0 40px 100px rgba(0,0,0,0.7), 0 0 0 1px rgba(0,190,255,0.1)",
        overflow: "hidden",
      }}>
        {/* Progress dots */}
        <div style={{ display: "flex", gap: 5, padding: "18px 22px 0", justifyContent: "center" }}>
          {VALUE_TUTORIAL_STEPS.map((_, i) => (
            <div key={i} style={{ width: i === step ? 20 : 6, height: 6, borderRadius: 999, transition: "all 0.3s", background: i === step ? "linear-gradient(90deg,rgba(0,190,255,1),rgba(120,110,255,1))" : "rgba(255,255,255,0.15)" }} />
          ))}
        </div>

        <div style={{ padding: "20px 26px 0" }}>
          <div style={{ fontSize: 36, marginBottom: 10 }}>{current.icon}</div>
          <div style={{ fontSize: 20, fontWeight: 800, color: "white", marginBottom: 10, letterSpacing: -0.3 }}>{current.title}</div>
          <div style={{ fontSize: 14, color: "rgba(255,255,255,0.65)", lineHeight: 1.65 }}>
            {typeof current.body === "string" ? current.body : current.body}
          </div>
        </div>

        <div style={{ padding: "20px 26px 22px", display: "flex", flexDirection: "column" as const, gap: 14, marginTop: 8 }}>
          <div style={{ display: "flex", gap: 8 }}>
            {step > 0 && (
              <button onClick={() => setStep(s => s - 1)} style={{ flex: 1, padding: "11px 0", borderRadius: 12, border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.04)", color: "rgba(255,255,255,0.7)", fontSize: 14, fontWeight: 700, cursor: "pointer" }}>
                Back
              </button>
            )}
            <button
              onClick={() => isLast ? onClose(dontShow) : setStep(s => s + 1)}
              style={{ flex: 1, padding: "11px 0", borderRadius: 12, border: "1px solid rgba(0,190,255,0.4)", background: "linear-gradient(90deg,rgba(0,190,255,0.8),rgba(120,110,255,0.9))", color: "white", fontSize: 14, fontWeight: 800, cursor: "pointer" }}
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

// ── Value card ────────────────────────────────────────────────────────────────

function ValueCard({ bet }: { bet: ValueBet }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div style={{ border: "1px solid rgba(255,255,255,0.08)", background: "rgba(10,14,20,0.45)", borderRadius: 16, overflow: "hidden", marginBottom: 10 }}>
      <div
        style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 12, padding: "14px 18px", cursor: "pointer", alignItems: "center" }}
        onClick={() => setExpanded((p) => !p)}
      >
        <div>
          <div style={{ fontSize: 15, fontWeight: 700, color: "white", marginBottom: 4 }}>{bet.event}</div>
          <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
            <span style={{ fontSize: 11, color: "rgba(255,255,255,0.4)" }}>{sportEmoji(bet.sport_key)}</span>
            <span style={{ fontSize: 13, fontWeight: 700, color: "white" }}>{bet.selection}{bet.point ? ` (${bet.point})` : ""}</span>
            <span style={{ fontSize: 12, color: "rgba(255,255,255,0.5)" }}>@ {Number(bet.soft_odds).toFixed(2)} on {bet.soft_book}</span>
          </div>
          <div style={{ marginTop: 6, fontSize: 12, color: "rgba(255,255,255,0.4)" }}>{timeUntil(bet.commence_time)}</div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: 22, fontWeight: 900, color: evColor(bet.ev_pct), letterSpacing: "-0.5px" }}>+{bet.ev_pct}%</div>
          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", marginTop: 2 }}>edge vs {bet.sharp_book}</div>
          <div style={{ fontSize: 14, fontWeight: 700, color: "rgba(255,255,255,0.7)", marginTop: 4 }}>£{Number(bet.expected_profit).toFixed(2)} EV</div>
        </div>
      </div>

      {expanded && (
        <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", padding: "16px 18px", background: "rgba(120,110,255,0.03)" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8, marginBottom: 16 }}>
            {[
              { l: "Sharp price", v: `${Number(bet.sharp_odds).toFixed(2)} (${bet.sharp_book})`, sub: `True prob: ${bet.true_prob}%` },
              { l: "Soft price", v: `${Number(bet.soft_odds).toFixed(2)} (${bet.soft_book})`, sub: `Implied: ${bet.soft_implied_prob}%` },
              { l: "Kelly stake", v: `£${Number(bet.kelly_stake).toFixed(2)}`, sub: `EV: £${Number(bet.expected_profit).toFixed(2)}` },
            ].map(({ l, v, sub }) => (
              <div key={l} style={{ background: "rgba(255,255,255,0.03)", borderRadius: 12, padding: "12px 14px", border: "1px solid rgba(255,255,255,0.06)" }}>
                <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", marginBottom: 6 }}>{l}</div>
                <div style={{ fontSize: 13, fontWeight: 700, color: "white", marginBottom: 2 }}>{v}</div>
                <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)" }}>{sub}</div>
              </div>
            ))}
          </div>

          <div style={{ background: "rgba(255,255,255,0.02)", borderRadius: 12, padding: "14px 16px", border: "1px solid rgba(255,255,255,0.06)" }}>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", color: "rgba(255,255,255,0.3)", textTransform: "uppercase", marginBottom: 10 }}>How to place</div>
            <div style={{ fontSize: 14, color: "rgba(255,255,255,0.8)", lineHeight: 1.7 }}>
              Go to <strong>{bet.soft_book}</strong> and back <strong>"{bet.selection}{bet.point ? ` (${bet.point})` : ""}"</strong> at odds <strong style={{ color: "#98b8ff" }}>{Number(bet.soft_odds).toFixed(2)}</strong> or better.
            </div>
            <div style={{ marginTop: 10, fontSize: 13, color: "rgba(255,255,255,0.5)", lineHeight: 1.6 }}>
              Kelly suggests <strong style={{ color: "white" }}>£{Number(bet.kelly_stake).toFixed(2)}</strong> — based on a 20× stake bankroll. Adjust to your own bankroll. Only place if odds are still {Number(bet.soft_odds).toFixed(2)} or above.
            </div>
          </div>

          <div style={{ marginTop: 10, padding: "10px 14px", borderRadius: 10, background: "rgba(245,158,11,0.06)", border: "1px solid rgba(245,158,11,0.18)", fontSize: 12, color: "rgba(245,158,11,0.8)", lineHeight: 1.6 }}>
            ⚠️ This is not a guaranteed profit. Value bets win over volume — expect variance on individual bets. Never bet more than you can afford to lose on a single outcome.
          </div>
        </div>
      )}
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

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
  const [tutorialOpen, setTutorialOpen] = useState(false);

  useEffect(() => {
    try {
      if (localStorage.getItem("hitbet_value_tutorial_done") !== "true") {
        setTutorialOpen(true);
      }
    } catch {}
  }, []);

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

  const filtered = useMemo(() => bets.filter((b) => Number(b.ev_pct) >= minEv), [bets, minEv]);

  const stats = useMemo(() => ({
    count: filtered.length,
    bestEv: filtered.length ? Math.max(...filtered.map((b) => Number(b.ev_pct))) : 0,
    avgEv: filtered.length ? filtered.reduce((s, b) => s + Number(b.ev_pct), 0) / filtered.length : 0,
    totalExpectedProfit: filtered.reduce((s, b) => s + Number(b.expected_profit), 0),
  }), [filtered]);

  const demoBets: ValueBet[] = [
    { id: 1, event: "Arsenal vs Chelsea", sport_key: "soccer_epl", market_group: "h2h", commence_time: new Date(Date.now() + 3600000).toISOString(), selection: "Arsenal win", soft_book: "Bet365", soft_odds: 2.4, point: null, sharp_book: "Betfair Exchange", sharp_odds: 2.1, ev_pct: 14.3, true_prob: 47.6, soft_implied_prob: 41.7, kelly_stake: 18.5, expected_profit: 2.65, created_at: new Date().toISOString() },
    { id: 2, event: "Lakers vs Celtics", sport_key: "basketball_nba", market_group: "totals", commence_time: new Date(Date.now() + 7200000).toISOString(), selection: "Over 224.5", soft_book: "William Hill", soft_odds: 2.2, point: "224.5", sharp_book: "Betfair Exchange", sharp_odds: 1.95, ev_pct: 12.8, true_prob: 51.3, soft_implied_prob: 45.5, kelly_stake: 14.2, expected_profit: 1.82, created_at: new Date().toISOString() },
    { id: 3, event: "Djokovic vs Alcaraz", sport_key: "tennis_atp", market_group: "h2h", commence_time: new Date(Date.now() + 10800000).toISOString(), selection: "Alcaraz win", soft_book: "Coral", soft_odds: 1.85, point: null, sharp_book: "Betfair Exchange", sharp_odds: 1.68, ev_pct: 10.1, true_prob: 59.5, soft_implied_prob: 54.1, kelly_stake: 11.8, expected_profit: 1.19, created_at: new Date().toISOString() },
  ];

  return (
    <div className="narrowPage">
      <div style={{ padding: mob ? "24px 0 60px" : "40px 0 80px" }}>

        {/* Tutorial modal */}
        {tutorialOpen && (
          <ValueTutorialModal
            onClose={(dontShow) => {
              setTutorialOpen(false);
              if (dontShow) {
                try { localStorage.setItem("hitbet_value_tutorial_done", "true"); } catch {}
              }
            }}
          />
        )}

        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: 16, marginBottom: 8, flexWrap: "wrap" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
              <h1 style={{ fontSize: mob ? 26 : 34, fontWeight: 900, letterSpacing: "-0.03em", margin: 0, color: "white" }}>
                Value Watchlist
              </h1>
              <button
                onClick={() => setTutorialOpen(true)}
                title="How this works"
                style={{ width: 22, height: 22, borderRadius: "50%", border: "1px solid rgba(255,255,255,0.15)", background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.5)", fontSize: 12, fontWeight: 800, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}
              >
                ?
              </button>
            </div>
            <p style={{ margin: 0, fontSize: 13, color: "rgba(255,255,255,0.5)", maxWidth: 560, lineHeight: 1.6 }}>
              Bets where soft bookmakers are offering significantly better odds than the true market price — mathematically profitable over volume, not guaranteed on any single bet.
            </p>
          </div>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <button
              onClick={manualRefresh}
              style={{ display: "flex", alignItems: "center", gap: 5, padding: "8px 12px", borderRadius: 10, border: "1px solid rgba(255,255,255,0.1)", background: "rgba(10,14,20,0.5)", color: "rgba(255,255,255,0.6)", fontSize: 13, cursor: "pointer", fontWeight: 600 }}
            >
              <span style={{ display: "inline-block", animation: isRefreshing ? "spin 0.6s linear infinite" : "none" }}>↻</span>
              Refresh
            </button>
            {updatedAt && (
              <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)" }}>{updatedAt.toLocaleTimeString("en-GB")}</div>
            )}
          </div>
        </div>

        {/* How it works explainer */}
        <div style={{ padding: "14px 16px", borderRadius: 14, border: "1px solid rgba(120,110,255,0.15)", background: "rgba(120,110,255,0.05)", marginBottom: 20 }}>
          <div style={{ fontSize: 13, color: "rgba(255,255,255,0.6)", lineHeight: 1.7 }}>
            <strong style={{ color: "white" }}>How this works:</strong> We compare soft bookmaker prices against Betfair Exchange (the sharp market). When a soft book is significantly above the true price, that's a value bet. Place enough of them and the edge compounds into profit — even though individual bets can lose.
          </div>
        </div>

        {/* Access gates */}
        {!loading && signedIn && !isElite && (
          <div style={{ border: "1px solid rgba(0,190,255,0.2)", background: "rgba(0,190,255,0.05)", borderRadius: 16, padding: "20px 22px", marginBottom: 20 }}>
            <div style={{ fontSize: 17, fontWeight: 800, color: "white", marginBottom: 6 }}>Long Run or Both plan required</div>
            <div style={{ fontSize: 13, color: "rgba(255,255,255,0.55)", marginBottom: 16, lineHeight: 1.6 }}>
              The value watchlist is included in the Long Run and Both plans. Upgrade to access positive EV bets alongside your arb feed.
            </div>
            <Link href="/pricing" style={{ display: "inline-flex", alignItems: "center", padding: "10px 18px", borderRadius: 12, fontWeight: 700, fontSize: 14, color: "white", background: "linear-gradient(90deg, rgba(120,110,255,0.95), rgba(0,190,255,0.75))", border: "1px solid rgba(120,110,255,0.4)", textDecoration: "none" }}>
              {active ? "Upgrade your plan" : "Try free — 24 hours"}
            </Link>
          </div>
        )}

        {!loading && !signedIn && (
          <div style={{ border: "1px solid rgba(255,255,255,0.07)", background: "rgba(10,14,20,0.5)", borderRadius: 14, padding: "16px 18px", marginBottom: 20, display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
            <div>
              <div style={{ color: "white", fontSize: 15, fontWeight: 800, marginBottom: 3 }}>Sign in to access value bets</div>
              <div style={{ color: "rgba(255,255,255,0.5)", fontSize: 13 }}>Included with Long Run and Both plans.</div>
            </div>
            <Link href="/login" style={{ display: "inline-flex", alignItems: "center", padding: "9px 14px", borderRadius: 11, fontWeight: 700, fontSize: 13, color: "white", background: "linear-gradient(90deg, rgba(120,110,255,0.95), rgba(0,190,255,0.75))", border: "1px solid rgba(120,110,255,0.4)", textDecoration: "none" }}>
              Log in
            </Link>
          </div>
        )}

        {/* Stats */}
        {(isElite || !signedIn) && (
          <div style={{ display: "grid", gridTemplateColumns: mob ? "repeat(2,1fr)" : "repeat(4,1fr)", gap: 8, marginBottom: 20 }}>
            {[
              { l: "Value bets", v: isElite ? stats.count : "?" },
              { l: "Best edge", v: isElite ? `+${stats.bestEv.toFixed(1)}%` : "?" },
              { l: "Avg edge", v: isElite ? `+${stats.avgEv.toFixed(1)}%` : "?" },
              { l: "Total EV", v: isElite ? `+£${stats.totalExpectedProfit.toFixed(2)}` : "?" },
            ].map(({ l, v }) => (
              <div key={l} style={{ border: "1px solid rgba(255,255,255,0.06)", background: "rgba(10,14,20,0.35)", borderRadius: 12, padding: "12px 14px" }}>
                <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", marginBottom: 5 }}>{l}</div>
                <div style={{ fontSize: 18, fontWeight: 800, color: "white", letterSpacing: "-0.02em" }}>{v}</div>
              </div>
            ))}
          </div>
        )}

        {/* EV filter */}
        {isElite && (
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16, flexWrap: "wrap" }}>
            <span style={{ fontSize: 12, color: "rgba(255,255,255,0.45)" }}>Min edge:</span>
            {[5, 8, 10, 15].map((v) => (
              <button key={v} style={{ fontSize: 12, fontWeight: 600, padding: "5px 10px", borderRadius: 8, border: minEv === v ? "1px solid rgba(120,110,255,0.5)" : "1px solid rgba(255,255,255,0.09)", background: minEv === v ? "rgba(120,110,255,0.15)" : "transparent", color: minEv === v ? "white" : "rgba(255,255,255,0.5)", cursor: "pointer" }} onClick={() => setMinEv(v)}>
                {v}%+
              </button>
            ))}
            <span style={{ fontSize: 12, color: "rgba(255,255,255,0.35)", marginLeft: 4 }}>{filtered.length} bets</span>
          </div>
        )}

        {loading && (
          <div style={{ border: "1px solid rgba(255,255,255,0.06)", background: "rgba(10,14,20,0.35)", borderRadius: 12, padding: 16, color: "rgba(255,255,255,0.55)", fontSize: 14 }}>
            Loading value bets…
          </div>
        )}
        {!loading && error && (
          <div style={{ border: "1px solid rgba(255,90,90,0.22)", background: "rgba(10,14,20,0.35)", borderRadius: 12, padding: 16, color: "#ffb4b4", fontSize: 14 }}>
            {error}
          </div>
        )}

        {/* Live bets */}
        {isElite && !loading && !error && (
          filtered.length === 0 ? (
            <div style={{ border: "1px solid rgba(255,255,255,0.06)", background: "rgba(10,14,20,0.35)", borderRadius: 12, padding: 16, color: "rgba(255,255,255,0.55)", fontSize: 14 }}>
              No value bets above {minEv}% edge right now. Try lowering the threshold or check back later.
            </div>
          ) : (
            <div>{filtered.map((bet) => <ValueCard key={bet.id} bet={bet} />)}</div>
          )
        )}

        {/* Demo for users without access */}
        {!isElite && !loading && (
          <div style={{ position: "relative" }}>
            <div style={{ filter: "blur(4px)", pointerEvents: "none", opacity: 0.5 }}>
              {demoBets.map((bet) => <ValueCard key={bet.id} bet={bet} />)}
            </div>
            <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <div style={{ textAlign: "center", padding: "24px 32px", borderRadius: 18, background: "rgba(8,11,18,0.92)", border: "1px solid rgba(120,110,255,0.3)", boxShadow: "0 20px 60px rgba(0,0,0,0.5)" }}>
                <div style={{ fontSize: 32, marginBottom: 10 }}>🔒</div>
                <div style={{ fontSize: 17, fontWeight: 800, color: "white", marginBottom: 6 }}>Long Run or Both plan</div>
                <div style={{ fontSize: 13, color: "rgba(255,255,255,0.55)", marginBottom: 18, maxWidth: 280 }}>
                  Upgrade to access the full value watchlist with live positive EV bets
                </div>
                <Link href="/pricing" style={{ display: "inline-flex", alignItems: "center", padding: "10px 20px", borderRadius: 12, fontWeight: 700, fontSize: 14, color: "white", background: "linear-gradient(90deg, rgba(120,110,255,0.95), rgba(0,190,255,0.75))", border: "1px solid rgba(120,110,255,0.4)", textDecoration: "none" }}>
                  See plans
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
