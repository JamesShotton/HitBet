"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { loadStripe } from "@stripe/stripe-js";
import {
  EmbeddedCheckout,
  EmbeddedCheckoutProvider,
} from "@stripe/react-stripe-js";

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || ""
);

function CheckoutInner() {
  const searchParams = useSearchParams();
  const plan = (searchParams.get("plan") || "arbitrage") as
    | "arbitrage"
    | "longrun"
    | "both";
  const trial = searchParams.get("trial") === "true";
  const ref = searchParams.get("ref") ?? "";
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function createSession() {
      try {
        setErr(null);
        setClientSecret(null);
        const res = await fetch("/api/stripe/embedded-session", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ plan, trial, ref_code: ref || undefined }),
        });
        const data = await res.json();
        if (!res.ok) {
          if (!cancelled)
            setErr(data?.error || "Failed to create checkout session.");
          return;
        }
        if (!cancelled) setClientSecret(data.clientSecret);
      } catch (e: any) {
        if (!cancelled) setErr(e?.message || "Something went wrong.");
      }
    }
    createSession();
    return () => {
      cancelled = true;
    };
  }, [plan, trial, ref]);

  const options = useMemo(
    () => (clientSecret ? { clientSecret } : undefined),
    [clientSecret]
  );

  return (
    <div className="narrowPage">
      <div style={{ padding: "40px 0" }}>
        <h1 style={{ fontSize: 28, marginBottom: 8 }}>
          {trial ? "Start your free trial" : "Checkout"}
        </h1>
        <p style={{ opacity: 0.8, marginBottom: 24 }}>
          Plan:{" "}
          <b>
            {plan === "both"
              ? "Arbitrage + Long Run"
              : plan === "longrun"
              ? "Long Run"
              : "Arbitrage"}
          </b>
          {trial && (
            <span
              style={{
                marginLeft: 12,
                fontSize: 13,
                padding: "4px 10px",
                borderRadius: 999,
                background: "rgba(0,255,140,0.10)",
                border: "1px solid rgba(0,255,140,0.22)",
                color: "#9be7bf",
              }}
            >
              7-day free trial
            </span>
          )}
        </p>
        {trial && (
          <div
            style={{
              marginBottom: 20,
              padding: "14px 16px",
              borderRadius: 14,
              border: "1px solid rgba(255,255,255,0.10)",
              background: "rgba(255,255,255,0.04)",
              fontSize: 14,
              opacity: 0.85,
              lineHeight: 1.6,
            }}
          >
            Your card won't be charged today. After 7 days, you'll be billed £
            {plan === "both" ? "89.99" : plan === "longrun" ? "59.99" : "39.99"}
            /month automatically. Cancel anytime before the trial ends.
          </div>
        )}
        {err && (
          <div
            style={{
              padding: 12,
              border: "1px solid #ff5a5a",
              borderRadius: 10,
              marginBottom: 16,
            }}
          >
            {err}
          </div>
        )}
        {!clientSecret && !err && <div>Loading secure checkout…</div>}
        {clientSecret && options && (
          <EmbeddedCheckoutProvider stripe={stripePromise} options={options}>
            <EmbeddedCheckout />
          </EmbeddedCheckoutProvider>
        )}
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense
      fallback={
        <div className="narrowPage">
          <div style={{ padding: "40px 0" }}>Loading checkout…</div>
        </div>
      }
    >
      <CheckoutInner />
    </Suspense>
  );
}
