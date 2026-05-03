"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const FLAT_COMMISSION = 15;
const RECURRING_RATE = 0.10;
const fmt = (v: number) => `£${v.toFixed(2)}`;

type StatsData = {
  registered: boolean;
  ref_code?: string;
  payout_email?: string | null;
  clicks?: number;
  conversions?: number;
  pendingCommission?: number;
  paidCommission?: number;
  history?: {
    plan: string;
    sale_amount: number;
    commission: number;
    is_trial: boolean;
    paid_out: boolean;
    created_at: string;
  }[];
};

export default function AffiliatePage() {
  const [data, setData] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState(false);
  const [payoutEmail, setPayoutEmail] = useState("");
  const [savingPayout, setSavingPayout] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");

  const appUrl =
    typeof window !== "undefined"
      ? window.location.origin
      : "https://hitbet.com";

  async function load() {
    try {
      const res = await fetch("/api/affiliate/stats");
      if (res.status === 401) {
        setError("Please sign in to access the affiliate programme.");
        setLoading(false);
        return;
      }
      const d = await res.json();
      setData(d);
      if (d.payout_email) setPayoutEmail(d.payout_email);
    } catch {
      setError("Failed to load affiliate data.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function register() {
    setRegistering(true);
    try {
      const res = await fetch("/api/affiliate/register", { method: "POST" });
      if (res.ok) await load();
    } finally {
      setRegistering(false);
    }
  }

  async function savePayout() {
    setSavingPayout(true);
    try {
      await fetch("/api/affiliate/stats", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ payout_email: payoutEmail.trim() || null }),
      });
      setData((d) => d ? { ...d, payout_email: payoutEmail.trim() || null } : d);
    } finally {
      setSavingPayout(false);
    }
  }

  function copyLink() {
    if (!data?.ref_code) return;
    navigator.clipboard
      .writeText(`${appUrl}/pricing?ref=${data.ref_code}`)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      });
  }

  if (loading) {
    return (
      <div className="narrowPage">
        <main style={{ padding: "60px 0", color: "rgba(255,255,255,0.5)", fontSize: 14 }}>
          Loading…
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="narrowPage">
        <main style={{ padding: "60px 0" }}>
          <p style={{ color: "rgba(255,255,255,0.6)", fontSize: 14 }}>{error}</p>
          <Link href="/login" style={{ color: "#98b8ff", fontSize: 14 }}>
            Sign in →
          </Link>
        </main>
      </div>
    );
  }

  const refUrl = data?.ref_code ? `${appUrl}/pricing?ref=${data.ref_code}` : "";

  return (
    <div className="narrowPage">
      <main style={{ padding: "52px 0 80px" }}>
        <div style={{ marginBottom: 36 }}>
          <h1 style={{ fontSize: 36, fontWeight: 800, letterSpacing: -0.6, margin: 0 }}>
            Affiliate programme
          </h1>
          <p style={{ margin: "10px 0 0", opacity: 0.7, fontSize: 15 }}>
            <strong>£{FLAT_COMMISSION} per signup</strong> + <strong>{RECURRING_RATE * 100}%</strong> of every payment they make after that.
          </p>
        </div>

        {!data?.registered ? (
          <div
            style={{
              borderRadius: 20,
              padding: "32px 28px",
              border: "1px solid rgba(120,110,255,0.3)",
              background: "rgba(120,110,255,0.06)",
              maxWidth: 480,
            }}
          >
            <div style={{ fontSize: 18, fontWeight: 800, marginBottom: 8 }}>
              Join as an affiliate
            </div>
            <p style={{ fontSize: 14, color: "rgba(255,255,255,0.6)", lineHeight: 1.65, marginBottom: 22 }}>
              Share your unique link. Every person who subscribes through it earns you{" "}
              <strong style={{ color: "white" }}>£{FLAT_COMMISSION} upfront</strong>, plus{" "}
              <strong style={{ color: "white" }}>{RECURRING_RATE * 100}% of every payment</strong> they make for as long as they stay subscribed.
            </p>
            <div style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", marginBottom: 20, display: "grid", gap: 8 }}>
              <div style={{ padding: "10px 14px", borderRadius: 10, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
                <div style={{ color: "white", fontWeight: 700, marginBottom: 2 }}>Any plan — £{FLAT_COMMISSION} flat on signup</div>
                <div>Then 10% of each weekly payment (~£1–2/wk per referral)</div>
              </div>
              <div style={{ padding: "10px 14px", borderRadius: 10, background: "rgba(0,255,140,0.04)", border: "1px solid rgba(0,255,140,0.12)" }}>
                <div style={{ color: "#9be7bf", fontWeight: 700, marginBottom: 2 }}>Example: 10 referrals staying 3 months</div>
                <div>£{FLAT_COMMISSION * 10} upfront + ~£{(9.99 * RECURRING_RATE * 13 * 10).toFixed(0)} recurring = <strong style={{ color: "white" }}>~£{(FLAT_COMMISSION * 10 + 9.99 * RECURRING_RATE * 13 * 10).toFixed(0)} total</strong></div>
              </div>
            </div>
            <button
              onClick={register}
              disabled={registering}
              style={{
                padding: "12px 24px",
                borderRadius: 12,
                border: "1px solid rgba(120,110,255,0.45)",
                background: "linear-gradient(90deg, rgba(120,110,255,0.95), rgba(0,190,255,0.75))",
                color: "white",
                fontSize: 15,
                fontWeight: 800,
                cursor: "pointer",
                opacity: registering ? 0.6 : 1,
              }}
            >
              {registering ? "Creating link…" : "Get my referral link"}
            </button>
          </div>
        ) : (
          <>
            {/* Stats grid */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(2, 1fr)",
                gap: 10,
                marginBottom: 28,
              }}
            >
              {[
                { l: "Total clicks", v: String(data.clicks ?? 0) },
                { l: "Conversions", v: String(data.conversions ?? 0) },
                {
                  l: "Pending commission",
                  v: fmt(data.pendingCommission ?? 0),
                  green: true,
                },
                {
                  l: "Paid out",
                  v: fmt(data.paidCommission ?? 0),
                },
              ].map(({ l, v, green }) => (
                <div
                  key={l}
                  style={{
                    borderRadius: 16,
                    padding: "18px 20px",
                    border: "1px solid rgba(255,255,255,0.08)",
                    background: "rgba(10,14,20,0.4)",
                  }}
                >
                  <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", marginBottom: 6 }}>
                    {l}
                  </div>
                  <div
                    style={{
                      fontSize: 22,
                      fontWeight: 900,
                      color: green ? "#9be7bf" : "white",
                      letterSpacing: -0.5,
                    }}
                  >
                    {v}
                  </div>
                </div>
              ))}
            </div>

            {/* Referral link */}
            <div
              style={{
                borderRadius: 16,
                padding: "20px 22px",
                border: "1px solid rgba(120,110,255,0.25)",
                background: "rgba(120,110,255,0.05)",
                marginBottom: 24,
              }}
            >
              <div style={{ fontSize: 12, fontWeight: 700, color: "rgba(160,150,255,0.8)", letterSpacing: "0.1em", marginBottom: 10 }}>
                YOUR REFERRAL LINK
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  flexWrap: "wrap",
                }}
              >
                <div
                  style={{
                    flex: 1,
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.09)",
                    borderRadius: 10,
                    padding: "10px 14px",
                    fontSize: 14,
                    fontWeight: 600,
                    color: "rgba(255,255,255,0.75)",
                    fontFamily: "monospace",
                    wordBreak: "break-all",
                  }}
                >
                  {refUrl}
                </div>
                <button
                  onClick={copyLink}
                  style={{
                    padding: "10px 16px",
                    borderRadius: 10,
                    border: copied
                      ? "1px solid rgba(0,255,140,0.35)"
                      : "1px solid rgba(120,110,255,0.4)",
                    background: copied
                      ? "rgba(0,255,140,0.1)"
                      : "linear-gradient(90deg, rgba(120,110,255,0.95), rgba(0,190,255,0.75))",
                    color: copied ? "#9be7bf" : "white",
                    fontSize: 13,
                    fontWeight: 700,
                    cursor: "pointer",
                    whiteSpace: "nowrap",
                  }}
                >
                  {copied ? "✓ Copied" : "Copy link"}
                </button>
              </div>
            </div>

            {/* Payout email */}
            <div
              style={{
                borderRadius: 16,
                padding: "18px 22px",
                border: "1px solid rgba(255,255,255,0.08)",
                background: "rgba(10,14,20,0.35)",
                marginBottom: 28,
              }}
            >
              <div style={{ fontSize: 12, fontWeight: 700, color: "rgba(255,255,255,0.4)", letterSpacing: "0.1em", marginBottom: 4 }}>
                PAYOUT DETAILS
              </div>
              <div style={{ fontSize: 12, color: "rgba(255,255,255,0.35)", marginBottom: 12 }}>
                PayPal email, bank account, Revolut, or any payment details you want us to send to.
              </div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                <input
                  type="text"
                  value={payoutEmail}
                  onChange={(e) => setPayoutEmail(e.target.value)}
                  placeholder="e.g. your@paypal.com or sort code / account number"
                  style={{
                    flex: 1,
                    minWidth: 200,
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.09)",
                    borderRadius: 10,
                    color: "white",
                    padding: "10px 14px",
                    fontSize: 14,
                    outline: "none",
                  }}
                />
                <button
                  onClick={savePayout}
                  disabled={savingPayout}
                  style={{
                    padding: "10px 18px",
                    borderRadius: 10,
                    border: "1px solid rgba(255,255,255,0.12)",
                    background: "rgba(255,255,255,0.06)",
                    color: "rgba(255,255,255,0.8)",
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: "pointer",
                    opacity: savingPayout ? 0.6 : 1,
                  }}
                >
                  {savingPayout ? "Saving…" : "Save"}
                </button>
              </div>
            </div>

            {/* Conversion history */}
            {(data.history ?? []).length > 0 && (
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: "rgba(255,255,255,0.4)", letterSpacing: "0.08em", marginBottom: 12 }}>
                  CONVERSION HISTORY
                </div>
                <div
                  style={{
                    border: "1px solid rgba(255,255,255,0.07)",
                    borderRadius: 14,
                    overflow: "hidden",
                  }}
                >
                  {(data.history ?? []).map((h, i) => (
                    <div
                      key={i}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        gap: 12,
                        padding: "13px 16px",
                        borderBottom:
                          i < (data.history ?? []).length - 1
                            ? "1px solid rgba(255,255,255,0.05)"
                            : "none",
                        flexWrap: "wrap",
                      }}
                    >
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 600, color: "white", marginBottom: 2 }}>
                          {h.plan === "longrun"
                            ? "Long Run"
                            : h.plan === "arbitrage"
                            ? "Arbitrage"
                            : "Both Plans"}
                          {h.is_trial && (
                            <span
                              style={{
                                marginLeft: 8,
                                fontSize: 10,
                                padding: "2px 6px",
                                borderRadius: 999,
                                background: "rgba(245,158,11,0.1)",
                                border: "1px solid rgba(245,158,11,0.2)",
                                color: "rgba(245,158,11,0.8)",
                              }}
                            >
                              TRIAL
                            </span>
                          )}
                        </div>
                        <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)" }}>
                          {new Date(h.created_at).toLocaleDateString("en-GB", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </div>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <div
                          style={{
                            fontSize: 15,
                            fontWeight: 800,
                            color: h.paid_out ? "rgba(255,255,255,0.4)" : "#9be7bf",
                          }}
                        >
                          {fmt(Number(h.commission))}
                        </div>
                        <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)" }}>
                          {h.paid_out ? "Paid out" : "Pending"}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
