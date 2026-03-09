"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { loadStripe } from "@stripe/stripe-js";
import {
  EmbeddedCheckout,
  EmbeddedCheckoutProvider,
} from "@stripe/react-stripe-js";

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || ""
);

type Plan = "pro" | "elite";

export default function CheckoutPage() {
  const sp = useSearchParams();
  const plan = (sp.get("plan") || "pro") as Plan;

  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const fetchClientSecret = useMemo(() => {
    return async () => {
      setErr(null);
      setClientSecret(null);

      try {
        const res = await fetch("/api/stripe/embedded-session", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ plan }),
        });

        const data = await res.json();

        if (!res.ok) {
          setErr(data?.error || "Failed to start checkout.");
          return;
        }

        setClientSecret(data.clientSecret);
      } catch (e: any) {
        setErr(e?.message || "Network error starting checkout.");
      }
    };
  }, [plan]);

  useEffect(() => {
    fetchClientSecret();
  }, [fetchClientSecret]);

  return (
    <main style={{ minHeight: "calc(100vh - 120px)", padding: "56px 24px" }}>
      <div style={{ width: "min(1100px, 100%)", margin: "0 auto" }}>
        <h1 style={{ margin: 0, fontSize: 42, fontWeight: 900, letterSpacing: -0.6 }}>
          Checkout
        </h1>
        <p style={{ marginTop: 10, opacity: 0.8 }}>
          Plan: <b style={{ textTransform: "uppercase" }}>{plan}</b>
        </p>

        <div
          style={{
            marginTop: 18,
            borderRadius: 18,
            border: "1px solid rgba(255,255,255,0.12)",
            background: "rgba(10,14,20,0.55)",
            boxShadow: "0 18px 60px rgba(0,0,0,0.35)",
            backdropFilter: "blur(10px)",
            padding: 18,
          }}
        >
          {err && (
            <div
              style={{
                borderRadius: 14,
                border: "1px solid rgba(255,80,80,0.35)",
                background: "rgba(255,80,80,0.10)",
                padding: "12px 14px",
                marginBottom: 12,
              }}
            >
              {err}
              <div style={{ marginTop: 8, opacity: 0.8, fontSize: 13 }}>
                If this says “Invalid API Key”, your <code>STRIPE_SECRET_KEY</code> is wrong.
              </div>
            </div>
          )}

          {!clientSecret && !err && (
            <div style={{ padding: "18px 10px", opacity: 0.8 }}>
              Loading secure checkout…
            </div>
          )}

          {clientSecret && (
            <EmbeddedCheckoutProvider
              stripe={stripePromise}
              options={{ clientSecret }}
            >
              <EmbeddedCheckout />
            </EmbeddedCheckoutProvider>
          )}
        </div>
      </div>
    </main>
  );
}