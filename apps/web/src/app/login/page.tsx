"use client";

import { useState } from "react";
import { signIn, useSession } from "next-auth/react";
import Link from "next/link";

export default function LoginPage() {
  const { data } = useSession();
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  async function submit() {
    setLoading(true);
    setSent(false);
    await signIn("resend", { email, redirect: false });
    setLoading(false);
    setSent(true);
  }

  if (data?.user?.email) {
    return (
      <div className="narrowPage">
        <div className="section">
          <div className="card" style={{ maxWidth: 640, margin: "0 auto" }}>
            <h3>You're logged in</h3>
            <p className="small">
              Signed in as <b>{data.user.email}</b>
            </p>
            <div className="row" style={{ marginTop: 12 }}>
              <Link className="btn primary" href="/dashboard">
                Go to dashboard
              </Link>
              <Link className="btn" href="/account">
                Account
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="narrowPage">
      <div className="section">
        <div className="card" style={{ maxWidth: 640, margin: "0 auto" }}>
          <h3>Log in</h3>
          <p className="small">
            Enter your email and we'll send a one-tap login link.
          </p>
          <div className="hr" />
          <div className="small" style={{ marginBottom: 8 }}>
            Email
          </div>
          <input
            className="input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
          />
          <div className="row" style={{ marginTop: 12 }}>
            <button
              className="btn primary"
              onClick={submit}
              disabled={loading || !email.includes("@")}
            >
              {loading ? "Sending…" : "Send login link"}
            </button>
            <Link className="btn" href="/pricing">
              Pricing
            </Link>
          </div>
          {sent && (
            <div
              className="card"
              style={{
                marginTop: 14,
                borderColor: "rgba(34,197,94,0.35)",
                background: "rgba(34,197,94,0.10)",
              }}
            >
              <strong>Check your email</strong>
              <div className="small">
                We sent a login link to <b>{email}</b>. Click it to finish
                signing in.
              </div>
            </div>
          )}
          <div className="small" style={{ marginTop: 14 }}>
            Tip: if it doesn't arrive, check Spam/Promotions.
          </div>
        </div>
      </div>
    </div>
  );
}
