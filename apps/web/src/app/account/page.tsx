"use client";

import { useEffect, useState } from "react";
import { useSession, signIn, signOut } from "next-auth/react";
import Link from "next/link";

type AccountInfo = {
  email: string;
  plan: string | null;
  status: string;
  isActive: boolean;
  isTrialing: boolean;
  trialDaysLeft: number;
  currentPeriodEnd?: string | null;
};

function PlanBadge({
  plan,
  isTrialing,
}: {
  plan: string | null;
  isTrialing: boolean;
}) {
  if (!plan) return <span style={b.free}>Free</span>;
  const label = plan[0].toUpperCase() + plan.slice(1);
  if (isTrialing) return <span style={b.trial}>{label} · Trial</span>;
  if (plan === "elite") return <span style={b.elite}>{label}</span>;
  return <span style={b.pro}>{label}</span>;
}

const b: Record<string, React.CSSProperties> = {
  free: {
    fontSize: 13,
    fontWeight: 700,
    padding: "4px 10px",
    borderRadius: 999,
    background: "rgba(255,255,255,0.07)",
    border: "1px solid rgba(255,255,255,0.12)",
    color: "rgba(255,255,255,0.7)",
  },
  pro: {
    fontSize: 13,
    fontWeight: 700,
    padding: "4px 10px",
    borderRadius: 999,
    background: "rgba(120,110,255,0.15)",
    border: "1px solid rgba(120,110,255,0.3)",
    color: "rgba(180,170,255,0.95)",
  },
  elite: {
    fontSize: 13,
    fontWeight: 700,
    padding: "4px 10px",
    borderRadius: 999,
    background: "rgba(0,190,255,0.12)",
    border: "1px solid rgba(0,190,255,0.28)",
    color: "rgba(100,210,255,0.95)",
  },
  trial: {
    fontSize: 13,
    fontWeight: 700,
    padding: "4px 10px",
    borderRadius: 999,
    background: "rgba(245,158,11,0.12)",
    border: "1px solid rgba(245,158,11,0.28)",
    color: "rgba(245,158,11,0.95)",
  },
};

export default function AccountPage() {
  const { data: session, status } = useSession();
  const [info, setInfo] = useState<AccountInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const r = await fetch("/api/account", { cache: "no-store" as any });
        if (r.ok) setInfo(await r.json());
      } finally {
        setLoading(false);
      }
    }
    if (status === "authenticated") load();
    if (status === "unauthenticated") setLoading(false);
  }, [status]);

  if (status === "loading" || (status === "authenticated" && loading)) {
    return (
      <div className="narrowPage">
        <div style={s.page}>
          <div style={s.card}>
            <div
              style={{
                height: 80,
                borderRadius: 10,
                background: "rgba(255,255,255,0.04)",
              }}
            />
          </div>
        </div>
      </div>
    );
  }

  if (!session?.user?.email) {
    return (
      <div className="narrowPage">
        <div style={s.page}>
          <div style={s.card}>
            <div style={s.cardTitle}>Login required</div>
            <p style={s.cardSub}>
              Sign in to view your account and subscription.
            </p>
            <div style={s.actions}>
              <button style={s.btnP} onClick={() => signIn()}>
                Log in
              </button>
              <Link href="/pricing" style={s.btnG}>
                View plans
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const hasAccess = info?.isActive || info?.isTrialing;
  const planName = info?.plan
    ? info.plan[0].toUpperCase() + info.plan.slice(1)
    : "Free";

  const renewal = info?.currentPeriodEnd
    ? new Date(info.currentPeriodEnd).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : "—";

  return (
    <div className="narrowPage">
      <div style={s.page}>
        {/* Header */}
        <div style={s.pageHeader}>
          <h1 style={s.pageTitle}>Account</h1>
          <button style={s.btnGhost} onClick={() => signOut()}>
            Log out
          </button>
        </div>

        {/* Email + plan badge */}
        <div style={s.card}>
          <div style={s.cardRow}>
            <div>
              <div style={s.cardLabel}>Signed in as</div>
              <div style={s.cardValue}>{session.user.email}</div>
            </div>
            <PlanBadge
              plan={info?.plan ?? null}
              isTrialing={Boolean(info?.isTrialing)}
            />
          </div>
        </div>

        {/* Trial banner */}
        {info?.isTrialing && (
          <div style={s.trialCard}>
            <div style={s.trialLeft}>
              <span style={s.trialBadge}>FREE TRIAL</span>
              <div>
                <div style={s.trialTitle}>
                  {info.trialDaysLeft > 0
                    ? `${info.trialDaysLeft} day${
                        info.trialDaysLeft !== 1 ? "s" : ""
                      } remaining`
                    : "Trial ends today"}
                </div>
                <div style={s.trialSub}>
                  Card charged automatically when trial ends.
                </div>
              </div>
            </div>
            <Link href="/pricing" style={s.trialManage}>
              Manage
            </Link>
          </div>
        )}

        {/* Stats */}
        <div style={s.statsGrid}>
          <div style={s.statCard}>
            <div style={s.statLabel}>Plan</div>
            <div style={s.statValue}>{planName}</div>
          </div>
          <div style={s.statCard}>
            <div style={s.statLabel}>Status</div>
            <div
              style={{
                ...s.statValue,
                color: hasAccess ? "#9be7bf" : "rgba(255,255,255,0.45)",
              }}
            >
              {info?.isTrialing
                ? "Trial"
                : info?.isActive
                ? "Active"
                : info?.status === "inactive"
                ? "Inactive"
                : info?.status ?? "—"}
            </div>
          </div>
          <div style={s.statCard}>
            <div style={s.statLabel}>
              {info?.isTrialing ? "Trial ends" : "Renews"}
            </div>
            <div style={s.statValue}>
              {info?.isTrialing && info.trialDaysLeft > 0
                ? `in ${info.trialDaysLeft}d`
                : renewal}
            </div>
          </div>
        </div>

        {/* Features included */}
        {hasAccess && (
          <div style={s.card}>
            <div style={s.cardTitle}>What's included</div>
            <div style={s.featureList}>
              {[
                { label: "Live 2-way arb feed", included: true },
                { label: "Stake split calculator", included: true },
                { label: "Step-by-step placement cards", included: true },
                { label: "30s feed refresh", included: true },
                {
                  label: "3-way football arbs (1X2)",
                  included: info?.plan === "elite",
                },
                { label: "Telegram alerts", included: info?.plan === "elite" },
                { label: "Value watchlist", included: info?.plan === "elite" },
              ].map(({ label, included }) => (
                <div key={label} style={s.featureRow}>
                  <span
                    style={{
                      ...s.featureIcon,
                      color: included ? "#9be7bf" : "rgba(255,255,255,0.2)",
                    }}
                  >
                    {included ? "✓" : "✗"}
                  </span>
                  <span
                    style={{
                      ...s.featureLabel,
                      color: included
                        ? "rgba(255,255,255,0.85)"
                        : "rgba(255,255,255,0.3)",
                    }}
                  >
                    {label}
                  </span>
                  {!included && <span style={s.eliteOnly}>Elite</span>}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* No subscription upsell */}
        {!hasAccess && (
          <div style={s.upsellCard}>
            <div style={s.upsellTitle}>Start your free trial</div>
            <div style={s.upsellSub}>
              7 days free, card required. Access the full live arb feed with
              execution cards and stake splits.
            </div>
            <div style={s.actions}>
              <Link href="/pricing" style={s.btnP}>
                Try free — 7 days
              </Link>
            </div>
          </div>
        )}

        {/* Telegram channel for Elite */}
        {hasAccess && info?.plan === "elite" && (
          <div style={s.card}>
            <div style={s.cardTitle}>📣 Telegram alerts</div>
            <div
              style={{
                fontSize: 13,
                color: "rgba(255,255,255,0.55)",
                lineHeight: 1.6,
                marginBottom: 14,
              }}
            >
              Join the HitBet Elite channel to receive real-time arb alerts as
              they appear in the feed. Read-only — we post, you act.
            </div>
            <a
              href={
                process.env.NEXT_PUBLIC_TELEGRAM_CHANNEL_URL ??
                "https://t.me/hitbetalerts"
              }
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                padding: "10px 16px",
                borderRadius: 12,
                fontWeight: 700,
                fontSize: 14,
                color: "white",
                background:
                  "linear-gradient(90deg, rgba(0,136,204,0.9), rgba(0,180,255,0.7))",
                border: "1px solid rgba(0,180,255,0.3)",
                textDecoration: "none",
              }}
            >
              <span>✈️</span> Join Telegram channel
            </a>
          </div>
        )}

        {/* Pro → Elite upgrade nudge */}
        {hasAccess && info?.plan === "pro" && (
          <div style={s.upgradeCard}>
            <div>
              <div style={s.upgradeTitle}>Upgrade to Elite</div>
              <div style={s.upgradeSub}>
                3-way arbs, Telegram alerts and value watchlist. £20/mo more.
              </div>
            </div>
            <Link href="/checkout?plan=elite" style={s.btnP}>
              Upgrade → £59.99/mo
            </Link>
          </div>
        )}

        {/* Quick links */}
        <div style={s.navLinks}>
          <Link href="/dashboard" style={s.navLink}>
            → Open dashboard
          </Link>
          <Link href="/guide" style={s.navLink}>
            → Anti-ban guide
          </Link>
          <Link href="/pricing" style={s.navLink}>
            → View all plans
          </Link>
        </div>
      </div>
    </div>
  );
}

const s: Record<string, React.CSSProperties> = {
  page: { maxWidth: 680, margin: "0 auto", padding: "40px 16px 80px" },

  pageHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  pageTitle: {
    fontSize: 32,
    fontWeight: 900,
    letterSpacing: "-0.03em",
    margin: 0,
    color: "white",
  },

  card: {
    border: "1px solid rgba(255,255,255,0.08)",
    background: "rgba(10,14,20,0.45)",
    borderRadius: 16,
    padding: "18px 20px",
    marginBottom: 12,
  },
  cardRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
    flexWrap: "wrap" as const,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: 800,
    color: "white",
    marginBottom: 14,
  },
  cardLabel: { fontSize: 12, color: "rgba(255,255,255,0.45)", marginBottom: 4 },
  cardValue: { fontSize: 15, fontWeight: 600, color: "white" },
  cardSub: {
    fontSize: 14,
    color: "rgba(255,255,255,0.55)",
    margin: "6px 0 16px",
  },

  trialCard: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 14,
    flexWrap: "wrap" as const,
    padding: "14px 20px",
    marginBottom: 12,
    borderRadius: 16,
    border: "1px solid rgba(245,158,11,0.25)",
    background: "rgba(245,158,11,0.06)",
  },
  trialLeft: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    flexWrap: "wrap" as const,
  },
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
  trialTitle: {
    fontSize: 14,
    fontWeight: 700,
    color: "white",
    marginBottom: 2,
  },
  trialSub: { fontSize: 12, color: "rgba(255,255,255,0.5)" },
  trialManage: {
    fontSize: 12,
    fontWeight: 700,
    padding: "7px 12px",
    borderRadius: 10,
    border: "1px solid rgba(245,158,11,0.3)",
    background: "rgba(245,158,11,0.1)",
    color: "rgba(245,158,11,0.9)",
    textDecoration: "none",
    whiteSpace: "nowrap" as const,
  },

  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, minmax(0,1fr))",
    gap: 10,
    marginBottom: 12,
  },
  statCard: {
    border: "1px solid rgba(255,255,255,0.07)",
    background: "rgba(10,14,20,0.4)",
    borderRadius: 14,
    padding: "14px 16px",
  },
  statLabel: { fontSize: 11, color: "rgba(255,255,255,0.4)", marginBottom: 6 },
  statValue: {
    fontSize: 20,
    fontWeight: 800,
    color: "white",
    letterSpacing: "-0.02em",
  },

  featureList: { display: "grid", gap: 10 },
  featureRow: { display: "flex", alignItems: "center", gap: 10 },
  featureIcon: { fontSize: 13, fontWeight: 900, flexShrink: 0, width: 16 },
  featureLabel: { fontSize: 14, flex: 1 },
  eliteOnly: {
    fontSize: 10,
    fontWeight: 700,
    padding: "2px 7px",
    borderRadius: 999,
    background: "rgba(0,190,255,0.1)",
    border: "1px solid rgba(0,190,255,0.2)",
    color: "rgba(100,210,255,0.8)",
  },

  upsellCard: {
    border: "1px solid rgba(120,110,255,0.2)",
    background: "rgba(120,110,255,0.06)",
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
  },
  upsellTitle: {
    fontSize: 17,
    fontWeight: 800,
    color: "white",
    marginBottom: 6,
  },
  upsellSub: {
    fontSize: 13,
    color: "rgba(255,255,255,0.55)",
    lineHeight: 1.6,
    marginBottom: 16,
  },

  upgradeCard: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 16,
    flexWrap: "wrap" as const,
    border: "1px solid rgba(0,190,255,0.15)",
    background: "rgba(0,190,255,0.04)",
    borderRadius: 16,
    padding: "18px 20px",
    marginBottom: 12,
  },
  upgradeTitle: {
    fontSize: 15,
    fontWeight: 800,
    color: "white",
    marginBottom: 4,
  },
  upgradeSub: {
    fontSize: 13,
    color: "rgba(255,255,255,0.55)",
    lineHeight: 1.5,
  },

  navLinks: {
    display: "flex",
    flexDirection: "column" as const,
    gap: 0,
    marginTop: 8,
  },
  navLink: {
    fontSize: 13,
    color: "rgba(255,255,255,0.45)",
    textDecoration: "none",
    padding: "10px 0",
    borderBottom: "1px solid rgba(255,255,255,0.05)",
  },

  actions: { display: "flex", gap: 10, flexWrap: "wrap" as const },

  btnP: {
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
    cursor: "pointer",
  },
  btnG: {
    display: "inline-flex",
    alignItems: "center",
    padding: "10px 18px",
    borderRadius: 12,
    fontWeight: 700,
    fontSize: 14,
    color: "rgba(255,255,255,0.75)",
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.09)",
    textDecoration: "none",
  },
  btnGhost: {
    display: "inline-flex",
    alignItems: "center",
    padding: "9px 14px",
    borderRadius: 11,
    fontWeight: 700,
    fontSize: 13,
    color: "rgba(255,255,255,0.6)",
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.09)",
    cursor: "pointer",
  },
};
