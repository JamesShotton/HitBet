"use client";

import { useRouter } from "next/navigation";

export default function PricingPage() {
  const router = useRouter();
  function go(plan: "pro" | "elite", trial = false) {
    router.push(`/checkout?plan=${plan}${trial ? "&trial=true" : ""}`);
  }
  return (
    <div className="narrowPage">
      <main style={styles.page}>
        <section style={styles.wrap}>
          <div style={styles.header}>
            <h1 style={styles.h1}>Choose your plan</h1>
            <p style={styles.sub}>
              Try free for 7 days. Card required — cancels automatically if you
              don't continue.
            </p>
          </div>
          <div style={styles.grid}>
            <div style={styles.card}>
              <div style={styles.cardTop}>
                <div>
                  <div style={styles.planName}>Pro</div>
                  <div style={styles.planDesc}>
                    2-outcome arbs only (cleanest execution)
                  </div>
                </div>
                <div style={styles.priceBlock}>
                  <div style={styles.price}>£39.99</div>
                  <div style={styles.per}>/month</div>
                </div>
              </div>
              <div style={styles.hr} />
              <ul style={styles.ul}>
                <li style={styles.li}>Full 2-outcome arb feed</li>
                <li style={styles.li}>Stake splits included</li>
                <li style={styles.li}>Faster refresh</li>
                <li style={styles.li}>Suspicious edge flags</li>
              </ul>
              <div style={styles.cardBottom}>
                <button
                  style={{ ...styles.btn, ...styles.btnPrimary }}
                  onClick={() => go("pro", true)}
                >
                  Try free — 7 days
                </button>
                <button
                  style={{ ...styles.btn, ...styles.btnGhost }}
                  onClick={() => go("pro")}
                >
                  Subscribe now
                </button>
              </div>
              <div style={styles.trialNote}>
                Then £39.99/month. Cancel anytime.
              </div>
            </div>
            <div style={{ ...styles.card, ...styles.cardElite }}>
              <div style={styles.badge}>Most popular</div>
              <div style={styles.cardTop}>
                <div>
                  <div style={styles.planName}>Elite</div>
                  <div style={styles.planDesc}>
                    Expanded markets + curated angles
                  </div>
                </div>
                <div style={styles.priceBlock}>
                  <div style={styles.price}>£59.99</div>
                  <div style={styles.per}>/month</div>
                </div>
              </div>
              <div style={styles.hr} />
              <div style={styles.smallLabel}>Everything in Pro, plus:</div>
              <ul style={styles.ul}>
                <li style={styles.li}>3-way markets (where available)</li>
                <li style={styles.li}>Higher-variance "value" watchlist</li>
                <li style={styles.li}>Priority alerts (Telegram/email)</li>
              </ul>
              <div style={styles.cardBottom}>
                <button
                  style={{ ...styles.btn, ...styles.btnPrimary }}
                  onClick={() => go("elite", true)}
                >
                  Try free — 7 days
                </button>
                <button
                  style={{ ...styles.btn, ...styles.btnGhost }}
                  onClick={() => go("elite")}
                >
                  Subscribe now
                </button>
              </div>
              <div style={styles.trialNote}>
                Then £59.99/month. Cancel anytime.
              </div>
            </div>
          </div>
          <p style={styles.footerNote}>
            We provide information and tools for execution. Outcomes depend on
            timing, odds movement, rules, and settlement.
          </p>
        </section>
      </main>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: "calc(100vh - 120px)",
    display: "flex",
    justifyContent: "center",
    padding: "60px 0",
  },
  wrap: { width: "100%" },
  header: { marginBottom: 22 },
  h1: {
    fontSize: 44,
    lineHeight: 1.05,
    margin: 0,
    fontWeight: 800,
    letterSpacing: -0.6,
  },
  sub: { margin: "10px 0 0", opacity: 0.8, fontSize: 16 },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
    gap: 18,
  },
  card: {
    position: "relative",
    borderRadius: 20,
    padding: 22,
    border: "1px solid rgba(255,255,255,0.10)",
    background: "rgba(10, 14, 20, 0.55)",
    boxShadow: "0 18px 60px rgba(0,0,0,0.35)",
    backdropFilter: "blur(10px)",
    display: "flex",
    flexDirection: "column",
    minHeight: 340,
  },
  cardElite: {
    border: "1px solid rgba(118, 111, 255, 0.35)",
    boxShadow: "0 18px 80px rgba(71, 109, 255, 0.18)",
  },
  badge: {
    position: "absolute",
    top: 14,
    right: 14,
    padding: "6px 10px",
    borderRadius: 999,
    fontSize: 12,
    fontWeight: 700,
    background: "rgba(255, 90, 180, 0.14)",
    border: "1px solid rgba(255, 90, 180, 0.22)",
    color: "rgba(255,255,255,0.9)",
  },
  cardTop: {
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 12,
    minHeight: 64,
  },
  planName: { fontSize: 18, fontWeight: 800, marginBottom: 4 },
  planDesc: { fontSize: 13, opacity: 0.78 },
  priceBlock: { textAlign: "right", paddingTop: 2 },
  price: { fontSize: 44, fontWeight: 900, letterSpacing: -0.8, lineHeight: 1 },
  per: { fontSize: 12, opacity: 0.75, marginTop: 4 },
  hr: { height: 1, background: "rgba(255,255,255,0.10)", margin: "16px 0" },
  smallLabel: { fontSize: 12, opacity: 0.75, marginBottom: 10 },
  ul: { margin: 0, paddingLeft: 18, display: "grid", gap: 8, flex: 1 },
  li: { fontSize: 14, opacity: 0.9 },
  cardBottom: {
    marginTop: 18,
    display: "flex",
    alignItems: "center",
    gap: 10,
    flexWrap: "wrap",
  },
  trialNote: { marginTop: 10, fontSize: 12, opacity: 0.55 },
  btn: {
    borderRadius: 12,
    padding: "10px 14px",
    fontWeight: 800,
    cursor: "pointer",
    border: "1px solid rgba(255,255,255,0.14)",
    background: "rgba(255,255,255,0.06)",
    color: "rgba(255,255,255,0.92)",
  },
  btnPrimary: {
    border: "1px solid rgba(120, 110, 255, 0.45)",
    background:
      "linear-gradient(90deg, rgba(120,110,255,0.95), rgba(0,190,255,0.75))",
    boxShadow: "0 12px 35px rgba(80,120,255,0.25)",
  },
  btnGhost: { opacity: 0.9 },
  footerNote: { marginTop: 14, fontSize: 12, opacity: 0.7 },
};
