"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

type Leg = {
  book: string;
  pick: string;
  stake: number;
  odds?: number;
};

type Arb = {
  id: string;
  marginPct: number;
  bookie1: string;
  bookie2: string;
  startIso: string;
  leg1: Leg;
  leg2: Leg;
  guaranteedReturn: number;
};

// Demo data (replace later with live feed)
const DEMO_ARBS: Arb[] = [
  {
    id: "arb-1",
    marginPct: 2.1,
    bookie1: "Bookie A",
    bookie2: "Bookie B",
    startIso: new Date(Date.now() + 1000 * 60 * 40).toISOString(),
    leg1: { book: "Bookie A", pick: "Team A to WIN", stake: 21.98, odds: 2.05 },
    leg2: { book: "Bookie B", pick: "Team B to LOSE", stake: 42.24, odds: 1.62 },
    guaranteedReturn: 7.49,
  },
  {
    id: "arb-2",
    marginPct: 1.3,
    bookie1: "Betfair",
    bookie2: "Unibet",
    startIso: new Date(Date.now() + 1000 * 60 * 115).toISOString(),
    leg1: { book: "Betfair", pick: "Player X to WIN", stake: 34.12, odds: 1.55 },
    leg2: { book: "Unibet", pick: "Player Y to WIN", stake: 15.88, odds: 3.1 },
    guaranteedReturn: 2.01,
  },
];

function fmtMoney(n: number) {
  return n.toLocaleString("en-GB", { style: "currency", currency: "GBP" });
}

function fmtStart(iso: string) {
  const d = new Date(iso);
  return d.toLocaleString("en-GB", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function Chip({ children }: { children: React.ReactNode }) {
  return <span className="chip">{children}</span>;
}

function ArbCard({ arb }: { arb: Arb }) {
  return (
    <div className="arbCard">
      <div className="arbTopRow">
        <div className="arbChips">
          <Chip>{arb.marginPct.toFixed(2)}% margin</Chip>
          <Chip>{arb.bookie1}</Chip>
          <Chip>{arb.bookie2}</Chip>
        </div>

        <div className="arbStart">
          <span className="arbStartLabel">Start</span>
          <span className="arbStartValue">{fmtStart(arb.startIso)}</span>
        </div>
      </div>

      <div className="arbLegsRow">
        <div className="arbLeg">
          <div className="arbLegHead">
            <div className="arbLegBook">{arb.leg1.book}</div>
            {typeof arb.leg1.odds === "number" && (
              <div className="arbLegOdds">@ {arb.leg1.odds.toFixed(2)}</div>
            )}
          </div>
          <div className="arbLegPick">{arb.leg1.pick}</div>
          <div className="arbLegStake">
            Stake: <b>{fmtMoney(arb.leg1.stake)}</b>
          </div>
        </div>

        <div className="arbLeg">
          <div className="arbLegHead">
            <div className="arbLegBook">{arb.leg2.book}</div>
            {typeof arb.leg2.odds === "number" && (
              <div className="arbLegOdds">@ {arb.leg2.odds.toFixed(2)}</div>
            )}
          </div>
          <div className="arbLegPick">{arb.leg2.pick}</div>
          <div className="arbLegStake">
            Stake: <b>{fmtMoney(arb.leg2.stake)}</b>
          </div>
        </div>
      </div>

      <div className="arbReturn">
        <span className="arbReturnLabel">Return:</span>
        <span className="arbReturnValue">{fmtMoney(arb.guaranteedReturn)}</span>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const router = useRouter();
  const arbs = DEMO_ARBS;

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const id = window.setInterval(() => {
      router.refresh(); // revalidates server data when you switch to real feed
    }, 30_000);
    return () => window.clearInterval(id);
  }, [router]);

  return (
    <main className="pageWrap">
      <div className="pageHeader">
        <div>
          <h1 className="pageTitle">Dashboard</h1>
          <p className="pageSub">Auto-refreshing every 30 seconds.</p>
        </div>

        <div className="pageHeaderRight">
          <Link className="pillBtn" href="/pricing">
            Get Pro / Elite
          </Link>
        </div>
      </div>

      <div className="filtersBar">
        <div className="filtersLeft">
          <div className="filtersLabel">Results</div>
          <div className="filtersCount">{arbs.length}</div>
        </div>

        <div className="filtersRight">
          <label className="field">
            <span>Min margin %</span>
            <input className="input" placeholder="e.g. 1.0" />
          </label>

          <label className="field">
            <span>Sort</span>
            <select className="input">
              <option>Newest</option>
              <option>Highest margin</option>
              <option>Start time</option>
            </select>
          </label>
        </div>
      </div>

      <div className="arbList">
        {arbs.map((arb) => (
          <ArbCard key={arb.id} arb={arb} />
        ))}
      </div>
    </main>
  );
}