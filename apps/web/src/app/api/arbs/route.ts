import { pool } from "../../lib/db";
import { auth } from "../../lib/auth";

function demoArbs2Way() {
  return [
    {
      id: "demo-1",
      event: "Arsenal vs Chelsea",
      sport_key: "soccer_epl",
      market_group: "h2h",
      commence_time: new Date(Date.now() + 45 * 60 * 1000).toISOString(),
      legs: 2,
      margin: 0.021,
      est_profit: 1.12,
      total_stake: 50,
      leg1_name: "Arsenal win",
      leg1_book: "Bet365",
      leg1_odds: 2.05,
      leg1_stake: 24.63,
      leg2_name: "Chelsea win",
      leg2_book: "Unibet",
      leg2_odds: 2.1,
      leg2_stake: 25.37,
    },
  ];
}

function demoArbs3Way() {
  return [
    {
      id: "demo-3w-1",
      event: "Man City vs Liverpool",
      sport_key: "soccer_epl",
      market_group: "h2h_3way",
      commence_time: new Date(Date.now() + 90 * 60 * 1000).toISOString(),
      legs: 3,
      margin: 0.018,
      est_profit: 0.92,
      total_stake: 50,
      leg1_name: "Man City win",
      leg1_book: "Bet365",
      leg1_odds: 2.2,
      leg1_stake: 18.94,
      leg2_name: "Draw",
      leg2_book: "William Hill",
      leg2_odds: 3.6,
      leg2_stake: 11.57,
      leg3_name: "Liverpool win",
      leg3_book: "Unibet",
      leg3_odds: 3.1,
      leg3_stake: 19.49,
    },
  ];
}

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return Response.json({
        signedIn: false,
        active: false,
        demo: true,
        plan: null,
        trial: false,
        trialDaysLeft: 0,
        arbs2way: demoArbs2Way(),
        arbs3way: [],
      });
    }

    const sub = await pool.query(
      `select status, plan, trial_expires_at
       from subscriptions where user_email = $1
       order by updated_at desc limit 1`,
      [session.user.email]
    );

    const row = sub.rows[0];
    const status = row?.status ?? null;
    const plan = row?.plan ?? null;
    const trialExpiresAt = row?.trial_expires_at ?? null;

    const isActive = status === "active";
    const isTrialing =
      status === "trialing" ||
      (trialExpiresAt && new Date(trialExpiresAt) > new Date());
    const hasAccess = isActive || isTrialing;

    // Plan access logic:
    // "arbitrage" — 2-way arbs only
    // "longrun"   — value watchlist + Telegram only (no arbs)
    // both plans  — everything (user has two subscriptions)
    const hasArbitrage = hasAccess && (plan === "arbitrage" || plan === "both");
    const hasLongRun = hasAccess && (plan === "longrun" || plan === "both");
    const has3Way = hasLongRun; // 3-way arbs are a Long Run feature

    let trialDaysLeft = 0;
    if (isTrialing && trialExpiresAt) {
      const msLeft = new Date(trialExpiresAt).getTime() - Date.now();
      trialDaysLeft = Math.max(0, Math.ceil(msLeft / (1000 * 60 * 60 * 24)));
    }

    if (!hasAccess) {
      return Response.json({
        signedIn: true,
        active: false,
        demo: true,
        plan,
        trial: false,
        trialDaysLeft: 0,
        arbs2way: demoArbs2Way(),
        arbs3way: [],
      });
    }

    // No arb access — longrun only subscriber
    if (!hasArbitrage) {
      return Response.json({
        signedIn: true,
        active: true,
        demo: false,
        plan,
        trial: isTrialing && !isActive,
        trialDaysLeft,
        arbs2way: [],
        arbs3way: [],
        noArbAccess: true,
      });
    }

    const result2 = await pool.query(
      `select *, created_at from arbs where legs = 2 order by margin desc limit 50`
    );

    let arbs3way: any[] = [];
    if (has3Way) {
      const result3 = await pool.query(
        `select *, created_at from arbs where legs = 3 order by margin desc limit 50`
      );
      arbs3way = result3.rows;
    }

    return Response.json({
      signedIn: true,
      active: true,
      demo: false,
      plan,
      trial: isTrialing && !isActive,
      trialDaysLeft,
      arbs2way: result2.rows,
      arbs3way,
      hasLongRun,
    });
  } catch (err) {
    console.error("API /api/arbs failed:", err);
    return Response.json(
      {
        signedIn: false,
        active: false,
        demo: true,
        plan: null,
        trial: false,
        trialDaysLeft: 0,
        arbs2way: [],
        arbs3way: [],
        error: "Failed to load arbs",
      },
      { status: 500 }
    );
  }
}
