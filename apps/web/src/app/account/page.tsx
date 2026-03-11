"use client";

import { useEffect, useState } from "react";
import { useSession, signIn } from "next-auth/react";
import Link from "next/link";

type AccountInfo = {
  email: string;
  isPro: boolean;
  status: string;
  currentPeriodEnd?: string | null;
};

export default function AccountPage() {
  const { data: session, status } = useSession();
  const [info, setInfo] = useState<AccountInfo | null>(null);

  useEffect(() => {
    async function load() {
      const r = await fetch("/api/account", { cache: "no-store" as any });
      if (r.ok) setInfo(await r.json());
    }
    if (status === "authenticated") load();
  }, [status]);

  if (status === "loading") {
    return (
      <div className="section">
        <div className="card">
          <h3>Loading…</h3>
        </div>
      </div>
    );
  }

  if (!session?.user?.email) {
    return (
      <div className="section">
        <div className="card" style={{ maxWidth: 560 }}>
          <h3>Login required</h3>
          <p className="small">Please log in to view your account.</p>
          <div className="row" style={{ marginTop: 12 }}>
            <button className="btn primary" onClick={() => signIn()}>
              Log in
            </button>
            <Link className="btn" href="/pricing">
              Pricing
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const renewal = info?.currentPeriodEnd
    ? new Date(info.currentPeriodEnd).toLocaleString()
    : "—";

  return (
    <div className="section">
      <div className="card" style={{ maxWidth: 760 }}>
        <h3>Account</h3>
        <p className="small">
          Signed in as <b>{session.user.email}</b>
        </p>

        <div className="hr" />

        <div
          className="grid3"
          style={{ gridTemplateColumns: "repeat(3, minmax(0, 1fr))" }}
        >
          <div
            className="card"
            style={{ background: "rgba(255,255,255,0.04)" }}
          >
            <div className="small">Plan</div>
            <div className="kpi" style={{ fontSize: 22, marginTop: 6 }}>
              {info?.isPro ? "Pro" : "Free"}
            </div>
          </div>

          <div
            className="card"
            style={{ background: "rgba(255,255,255,0.04)" }}
          >
            <div className="small">Status</div>
            <div className="kpi" style={{ fontSize: 22, marginTop: 6 }}>
              {info?.status ?? "—"}
            </div>
          </div>

          <div
            className="card"
            style={{ background: "rgba(255,255,255,0.04)" }}
          >
            <div className="small">Renews / Ends</div>
            <div className="kpi" style={{ fontSize: 16, marginTop: 10 }}>
              {renewal}
            </div>
          </div>
        </div>

        {!info?.isPro && (
          <div
            className="card"
            style={{
              marginTop: 14,
              borderColor: "rgba(124,58,237,0.5)",
              background: "rgba(124,58,237,0.10)",
            }}
          >
            <div className="row" style={{ justifyContent: "space-between" }}>
              <div>
                <strong>Upgrade to Pro</strong>
                <div className="small">Unlock the full feed + alerts.</div>
              </div>
              <Link className="btn primary" href="/pricing">
                Subscribe
              </Link>
            </div>
          </div>
        )}

        <div className="row" style={{ marginTop: 14 }}>
          <Link className="btn" href="/dashboard">
            Go to dashboard
          </Link>
          <Link className="btn" href="/pricing">
            Pricing
          </Link>
        </div>
      </div>
    </div>
  );
}
