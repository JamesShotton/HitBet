"use client";

import Link from "next/link";

function Section({
  title,
  lead,
  children,
  alt,
}: {
  title: string;
  lead: string;
  children: React.ReactNode;
  alt?: "dark" | "contrast" | "normal";
}) {
  const bgClass =
    alt === "dark"
      ? "sectionBg alt"
      : alt === "contrast"
      ? "sectionBg"
      : "sectionBg";
  return (
    <section className="sectionShell">
      <div className={bgClass} aria-hidden />
      <div className="sectionInner">
        <h2 className="sectionTitle">{title}</h2>
        <div className="sectionLead">{lead}</div>
        <div style={{ height: 22 }} />
        {children}
      </div>
    </section>
  );
}

export default function Home() {
  return (
    <div>
      {/* HERO BANNER */}
      <section className="heroBanner">
        <div className="heroInner">
          <div className="heroKicker">
            LIVE ARB FEED • STAKE SPLITS • FAST EXECUTION
          </div>

          <div className="heroBrand">HitBet</div>

          <h1 className="heroHeadline">
            Turn pricing mistakes
            <br />
            into <span className="heroGradient">repeatable profit</span>
          </h1>

          <div className="heroSub">
            HitBet scans sportsbooks, flags true arbitrage, and gives you clean
            stake splits to place immediately. Built for people who want a
            system — not guesses.
          </div>

          {/* ONLY BUTTON IN HERO */}
          <div className="row" style={{ justifyContent: "center" }}>
            <Link className="btn primary" href="/pricing">
              Get Pro / Elite
            </Link>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS (blended, content-rich) */}
      <Section
        title="How it actually works"
        lead="We’re not predicting outcomes — we’re detecting pricing mismatches, then packaging the exact two-leg action to balance returns."
        alt="contrast"
      >
        <div className="panel highContrast">
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1.2fr 0.8fr",
              gap: 18,
            }}
          >
            <div>
              <div className="badge" style={{ width: "fit-content" }}>
                FIND SPORTSBOOK MISPRICES
              </div>
              <div style={{ height: 12 }} />
              <h3 style={{ margin: 0, fontSize: 24 }}>
                From “odds noise” → one clean instruction
              </h3>
              <div
                className="small"
                style={{ marginTop: 10, lineHeight: 1.75 }}
              >
                We scan books, pick best prices on both sides, then compute a
                stake split. The result is an execution card: who to back, where
                to back them, and how much.
              </div>

              <div className="softDivider" />

              <div className="statsRow">
                <div className="stat">
                  <div className="label">Signal</div>
                  <div className="value">&lt; 100%</div>
                </div>
                <div className="stat">
                  <div className="label">Output</div>
                  <div className="value">2 legs</div>
                </div>
                <div className="stat">
                  <div className="label">You get</div>
                  <div className="value">Stake split</div>
                </div>
                <div className="stat">
                  <div className="label">Goal</div>
                  <div className="value">Fast place</div>
                </div>
              </div>

              <div className="row" style={{ marginTop: 16 }}>
                <Link className="btn primary" href="/dashboard">
                  See the feed
                </Link>
                <Link className="btn" href="/pricing">
                  Get access
                </Link>
              </div>
            </div>

            <div className="panel dark noBorder" style={{ padding: 22 }}>
              <div className="small muted">Example (formatted)</div>
              <div className="softDivider" />
              <div
                className="mono"
                style={{ display: "grid", gap: 10, fontSize: 13 }}
              >
                <div>
                  <b>Event:</b> Team A vs Team B
                </div>
                <div>
                  <b>Market:</b> Moneyline (2-way)
                </div>
                <div>
                  <b>Arb margin:</b> 2.10%
                </div>
                <div>
                  <b>Leg 1:</b> Team A @ 2.10 (Book X) — £24.38
                </div>
                <div>
                  <b>Leg 2:</b> Team B @ 2.05 (Book Y) — £25.62
                </div>
                <div className="small">
                  Tip: place legs close together to avoid drift.
                </div>
              </div>
            </div>
          </div>
        </div>
      </Section>

      {/* EXECUTION FLOW */}
      <Section
        title="Execution flow"
        lead="A simple loop: spot it → verify it → place it. The UI is built around that loop so you don’t get stuck thinking."
        alt="dark"
      >
        <div className="panel dark" style={{ padding: 26 }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1.15fr 0.85fr",
              gap: 18,
              alignItems: "stretch",
            }}
          >
            {/* Left: step flow */}
            <div style={{ display: "grid", gap: 12 }}>
              {[
                {
                  n: "01",
                  title: "Spot",
                  text: "Scan the feed for clean 2-way opportunities with a margin you like.",
                  chips: ["Newest first", "Min margin filter", "Hide in-play"],
                },
                {
                  n: "02",
                  title: "Verify",
                  text: "Quick checks so you don’t get baited: market match, rule match, odds still live.",
                  chips: ["Line match", "Void risk", "Stale odds"],
                },
                {
                  n: "03",
                  title: "Place",
                  text: "Stake split is the instruction. Place both legs close together, then move on.",
                  chips: ["Stake split", "Copy card", "Fast refresh"],
                },
              ].map((s) => (
                <div
                  key={s.n}
                  style={{
                    border: "1px solid rgba(255,255,255,.10)",
                    background: "rgba(255,255,255,.03)",
                    borderRadius: 20,
                    padding: 18,
                    position: "relative",
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      position: "absolute",
                      top: 12,
                      right: 14,
                      fontWeight: 900,
                      letterSpacing: "-.5px",
                      opacity: 0.7,
                    }}
                    className="mono"
                  >
                    {s.n}
                  </div>

                  <div
                    style={{ fontSize: 18, fontWeight: 900, marginBottom: 6 }}
                  >
                    {s.title}
                  </div>
                  <div className="small" style={{ lineHeight: 1.7 }}>
                    {s.text}
                  </div>

                  <div className="chips" style={{ marginTop: 12 }}>
                    {s.chips.map((c) => (
                      <div key={c} className="chip">
                        {c}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Right: “mini dashboard” mock */}
            <div
              style={{
                border: "1px solid rgba(255,255,255,.10)",
                background:
                  "radial-gradient(900px 520px at 30% 20%, rgba(34,211,238,.10), transparent 60%), rgba(255,255,255,.02)",
                borderRadius: 22,
                padding: 18,
              }}
            >
              <div className="badge" style={{ width: "fit-content" }}>
                WHAT YOU SEE
              </div>

              <div style={{ height: 12 }} />

              <div style={{ display: "grid", gap: 10 }}>
                {[
                  { t: "Margin", v: "2.10%", tone: "good" },
                  { t: "Market", v: "2-way moneyline", tone: "" },
                  { t: "Start", v: "In ~1h", tone: "" },
                ].map((x) => (
                  <div
                    key={x.t}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      border: "1px solid rgba(255,255,255,.10)",
                      background: "rgba(0,0,0,.18)",
                      borderRadius: 16,
                      padding: "12px 12px",
                    }}
                  >
                    <div className="small muted">{x.t}</div>
                    <div className={`pill ${x.tone}`}>{x.v}</div>
                  </div>
                ))}

                <div className="softDivider" style={{ margin: "12px 0" }} />

                <div className="small muted">Legs</div>

                <div
                  style={{
                    border: "1px solid rgba(255,255,255,.10)",
                    background: "rgba(0,0,0,.18)",
                    borderRadius: 16,
                    padding: 12,
                  }}
                >
                  <div style={{ fontWeight: 900 }}>Leg 1 • Book X</div>
                  <div className="small" style={{ marginTop: 4 }}>
                    Team A to WIN{" "}
                    <span className="muted">• @ 2.10 • £24.38</span>
                  </div>
                </div>

                <div
                  style={{
                    border: "1px solid rgba(255,255,255,.10)",
                    background: "rgba(0,0,0,.18)",
                    borderRadius: 16,
                    padding: 12,
                  }}
                >
                  <div style={{ fontWeight: 900 }}>Leg 2 • Book Y</div>
                  <div className="small" style={{ marginTop: 4 }}>
                    Team B to WIN{" "}
                    <span className="muted">• @ 2.05 • £25.62</span>
                  </div>
                </div>

                <div className="row" style={{ marginTop: 8 }}>
                  <Link className="btn primary" href="/dashboard">
                    Open dashboard
                  </Link>
                  <Link className="btn" href="/pricing">
                    Get access
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Section>

      {/* PLANS CTA */}
      <Section
        title="Choose Pro or Elite"
        lead="Pro: clean 2-way arbs. Elite: expanded markets + curated angles for serious operators."
      >
        <div className="panel highContrast">
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1.1fr 0.9fr",
              gap: 18,
              alignItems: "center",
            }}
          >
            <div>
              <div className="badge" style={{ width: "fit-content" }}>
                PLANS
              </div>
              <div style={{ height: 10 }} />
              <div
                style={{
                  fontSize: 26,
                  fontWeight: 900,
                  letterSpacing: "-.6px",
                }}
              >
                Pro £39.99 • Elite £59.99
              </div>
              <div className="small" style={{ marginTop: 10, lineHeight: 1.7 }}>
                No free tier. You get a feed built for execution — and gating so
                only paid users see live data.
              </div>
              <div className="chips">
                <div className="chip">
                  <strong>Pro</strong> 2-way arbs
                </div>
                <div className="chip">
                  <strong>Elite</strong> 3-way + value watchlist
                </div>
                <div className="chip">Cancel anytime</div>
              </div>
            </div>

            <div className="panel dark noBorder" style={{ padding: 22 }}>
              <div className="small muted">Ready?</div>
              <div style={{ height: 10 }} />
              <div className="row">
                <Link className="btn primary" href="/pricing">
                  Choose plan
                </Link>
                <Link className="btn" href="/dashboard">
                  Open dashboard
                </Link>
              </div>
              <div className="small" style={{ marginTop: 12 }}>
                Tomorrow: Stripe activates plan gating automatically.
              </div>
            </div>
          </div>
        </div>
      </Section>
    </div>
  );
}
