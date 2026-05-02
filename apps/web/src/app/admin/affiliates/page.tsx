"use client";

import { useEffect, useState } from "react";

const fmt = (v: number) => `£${Number(v).toFixed(2)}`;

type AffiliateRow = {
  user_email: string;
  ref_code: string;
  payout_email: string | null;
  clicks: number;
  conversions: number;
  pending: number;
  paid: number;
  created_at: string;
};

type ConversionRow = {
  id: number;
  ref_code: string;
  referred_email: string;
  plan: string;
  sale_amount: number;
  commission: number;
  is_trial: boolean;
  created_at: string;
  affiliate_email: string;
  payout_email: string | null;
};

export default function AdminAffiliatesPage() {
  const [affiliates, setAffiliates] = useState<AffiliateRow[]>([]);
  const [unpaid, setUnpaid] = useState<ConversionRow[]>([]);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [marking, setMarking] = useState(false);

  async function load() {
    try {
      const res = await fetch("/api/affiliate/admin");
      if (res.status === 403) {
        setError("Access denied.");
        setLoading(false);
        return;
      }
      const d = await res.json();
      setAffiliates(d.affiliates ?? []);
      setUnpaid(d.unpaidConversions ?? []);
    } catch {
      setError("Failed to load.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  function toggleSelect(id: number) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  async function markPaid() {
    if (selected.size === 0) return;
    setMarking(true);
    try {
      await fetch("/api/affiliate/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ conversion_ids: Array.from(selected) }),
      });
      setSelected(new Set());
      await load();
    } finally {
      setMarking(false);
    }
  }

  if (loading) {
    return (
      <div className="narrowPage">
        <main style={{ padding: "60px 0", color: "rgba(255,255,255,0.5)", fontSize: 14 }}>Loading…</main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="narrowPage">
        <main style={{ padding: "60px 0", color: "#ff8080", fontSize: 14 }}>{error}</main>
      </div>
    );
  }

  const totalPending = unpaid.reduce((s, c) => s + Number(c.commission), 0);
  const selectedTotal = unpaid
    .filter((c) => selected.has(c.id))
    .reduce((s, c) => s + Number(c.commission), 0);

  return (
    <div className="narrowPage">
      <main style={{ padding: "40px 0 80px" }}>
        <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 4 }}>Affiliate admin</h1>
        <p style={{ fontSize: 13, color: "rgba(255,255,255,0.45)", marginBottom: 32 }}>
          {affiliates.length} affiliates · {fmt(totalPending)} pending payouts
        </p>

        {/* Affiliates overview */}
        <div style={{ fontSize: 12, fontWeight: 700, color: "rgba(255,255,255,0.35)", letterSpacing: "0.1em", marginBottom: 10 }}>
          AFFILIATES
        </div>
        <div
          style={{
            border: "1px solid rgba(255,255,255,0.07)",
            borderRadius: 14,
            overflow: "hidden",
            marginBottom: 36,
          }}
        >
          {affiliates.length === 0 ? (
            <div style={{ padding: 16, fontSize: 13, color: "rgba(255,255,255,0.4)" }}>No affiliates yet.</div>
          ) : (
            affiliates.map((a, i) => (
              <div
                key={a.ref_code}
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr auto auto auto auto",
                  gap: 16,
                  padding: "12px 16px",
                  alignItems: "center",
                  borderBottom:
                    i < affiliates.length - 1 ? "1px solid rgba(255,255,255,0.05)" : "none",
                }}
              >
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "white" }}>{a.user_email}</div>
                  <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", fontFamily: "monospace" }}>
                    {a.ref_code}
                    {a.payout_email && <span style={{ marginLeft: 8 }}>→ {a.payout_email}</span>}
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)" }}>Clicks</div>
                  <div style={{ fontSize: 14, fontWeight: 700 }}>{a.clicks}</div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)" }}>Conv.</div>
                  <div style={{ fontSize: 14, fontWeight: 700 }}>{a.conversions}</div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)" }}>Pending</div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: "#9be7bf" }}>{fmt(Number(a.pending))}</div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)" }}>Paid</div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: "rgba(255,255,255,0.45)" }}>{fmt(Number(a.paid))}</div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Unpaid conversions */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 10,
          }}
        >
          <div style={{ fontSize: 12, fontWeight: 700, color: "rgba(255,255,255,0.35)", letterSpacing: "0.1em" }}>
            PENDING PAYOUTS
          </div>
          {selected.size > 0 && (
            <button
              onClick={markPaid}
              disabled={marking}
              style={{
                padding: "8px 16px",
                borderRadius: 10,
                border: "1px solid rgba(0,255,140,0.35)",
                background: "rgba(0,255,140,0.1)",
                color: "#9be7bf",
                fontSize: 13,
                fontWeight: 700,
                cursor: "pointer",
                opacity: marking ? 0.6 : 1,
              }}
            >
              {marking ? "Saving…" : `Mark ${selected.size} paid (${fmt(selectedTotal)})`}
            </button>
          )}
        </div>
        <div
          style={{
            border: "1px solid rgba(255,255,255,0.07)",
            borderRadius: 14,
            overflow: "hidden",
          }}
        >
          {unpaid.length === 0 ? (
            <div style={{ padding: 16, fontSize: 13, color: "rgba(255,255,255,0.4)" }}>No pending payouts.</div>
          ) : (
            unpaid.map((c, i) => (
              <div
                key={c.id}
                onClick={() => toggleSelect(c.id)}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: 12,
                  padding: "12px 16px",
                  cursor: "pointer",
                  background: selected.has(c.id) ? "rgba(0,255,140,0.05)" : undefined,
                  borderBottom:
                    i < unpaid.length - 1 ? "1px solid rgba(255,255,255,0.05)" : "none",
                  transition: "background 0.1s",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div
                    style={{
                      width: 18,
                      height: 18,
                      borderRadius: 4,
                      border: selected.has(c.id) ? "none" : "1px solid rgba(255,255,255,0.2)",
                      background: selected.has(c.id) ? "#9be7bf" : "transparent",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 11,
                      color: "#05060a",
                      fontWeight: 900,
                      flexShrink: 0,
                    }}
                  >
                    {selected.has(c.id) ? "✓" : ""}
                  </div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: "white" }}>
                      {c.affiliate_email}
                      {c.payout_email && (
                        <span style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", marginLeft: 8 }}>
                          → {c.payout_email}
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)" }}>
                      Referred: {c.referred_email} ·{" "}
                      {c.plan === "longrun" ? "Long Run" : c.plan === "arbitrage" ? "Arbitrage" : "Both"} ·{" "}
                      {new Date(c.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                      {c.is_trial && (
                        <span style={{ marginLeft: 6, color: "rgba(245,158,11,0.7)" }}>TRIAL</span>
                      )}
                    </div>
                  </div>
                </div>
                <div style={{ textAlign: "right", flexShrink: 0 }}>
                  <div style={{ fontSize: 15, fontWeight: 800, color: "#9be7bf" }}>{fmt(Number(c.commission))}</div>
                  <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)" }}>of {fmt(Number(c.sale_amount))}</div>
                </div>
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  );
}
