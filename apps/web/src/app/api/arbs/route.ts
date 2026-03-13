import { pool } from "../../lib/db";
import { auth } from "../../lib/auth";

function demoArbs() {
  return [
    {
      id: "demo-1",
      event: "Arsenal vs Chelsea",
      sport_key: "soccer_epl",
      market_group: "h2h",
      commence_time: new Date(Date.now() + 45 * 60 * 1000).toISOString(),
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
        arbs: demoArbs(),
      });
    }

    const sub = await pool.query(
      `
      select status, plan, trial_expires_at
      from subscriptions
      where user_email = $1
      order by updated_at desc
      limit 1
      `,
      [session.user.email]
    );

    const row = sub.rows[0];
    const status = row?.status ?? null;
    const plan = row?.plan ?? null;
    const trialExpiresAt = row?.trial_expires_at ?? null;

    // User is active if: status is active, trialing, OR trial hasn't expired yet
    const isActive = status === "active";
    const isTrialing =
      status === "trialing" ||
      (trialExpiresAt && new Date(trialExpiresAt) > new Date());

    const hasAccess = isActive || isTrialing;

    // Calculate days left in trial
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
        arbs: demoArbs(),
      });
    }

    const result = await pool.query(`
      select *
      from arbs
      order by margin desc
      limit 50
    `);

    return Response.json({
      signedIn: true,
      active: true,
      demo: false,
      plan,
      trial: isTrialing && !isActive,
      trialDaysLeft,
      arbs: result.rows,
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
        arbs: [],
        error: "Failed to load arbs",
      },
      { status: 500 }
    );
  }
}