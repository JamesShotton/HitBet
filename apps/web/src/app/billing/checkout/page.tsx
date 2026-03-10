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
  const params = useSearchParams();
  const plan = (params.get("plan") || "pro") as "pro" | "elite";

  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function startCheckout() {
      try {
        setErr(null);
        setClientSecret(null);

        const res = await fetch("/api/stripe/embedded-session", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ plan }),
        });

        const data = await res.json();

        if (!res.ok) {
          if (!cancelled) {
            setErr(data?.error || "Failed to start checkout");
          }
          return;
        }

        if (!cancelled) {
          setClientSecret(data.clientSecret);
        }
      } catch (e: any) {
        if (!cancelled) {
          setErr(e?.message || "Something went wrong");
        }
      }
    }

    startCheckout();

    return () => {
      cancelled = true;
    };
  }, [plan]);

  const options = useMemo(() => {
    if (!clientSecret) return undefined;
    return { clientSecret };
  }, [clientSecret]);

  return (
    <div style={{ maxWidth: 1000, margin: "0 auto", padding: "40px 16px" }}>
      <h1 style={{ fontSize: 28, marginBottom: 8 }}>Checkout</h1>
      <p style={{ opacity: 0.8, marginBottom: 24 }}>
        Plan: <b>{plan.toUpperCase()}</b>
      </p>

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
  );
}

export default function BillingCheckoutPage() {
  return (
    <Suspense
      fallback={
        <div style={{ maxWidth: 1000, margin: "0 auto", padding: "40px 16px" }}>
          Loading checkout…
        </div>
      }
    >
      <CheckoutInner />
    </Suspense>
  );
}