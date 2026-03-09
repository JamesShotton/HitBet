import Link from "next/link";

export default function BillingReturnPage({
  searchParams,
}: {
  searchParams: { session_id?: string };
}) {
  const sessionId = searchParams.session_id;

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: "40px 16px" }}>
      <h1 style={{ fontSize: 28, marginBottom: 12 }}>Payment complete</h1>

      <p style={{ opacity: 0.8, marginBottom: 18 }}>
        {sessionId
          ? "Thanks — Stripe returned a session id. Next step is confirming it via webhook."
          : "Missing session id."}
      </p>

      <div style={{ display: "flex", gap: 12 }}>
        <Link href="/dashboard">Go to dashboard</Link>
        <Link href="/">Back home</Link>
      </div>
    </div>
  );
}