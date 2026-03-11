import { pool } from "../../lib/db";
import { auth } from "../../lib/auth";

function demoArbs() {
  return [
    {
      id: "demo-1",
      event: "Example FC vs Sample United",
      sport_key: "demo",
      market_group: "h2h",
      commence_time: new Date(Date.now() + 45 * 60 * 1000).toISOString(),
      margin: 0.021,
      est_profit: 1.12,
      total_stake: 50,
      leg1_name: "Example FC win",
      leg1_book: "Bookie A",
      leg1_odds: 2.05,
      leg1_stake: 24.63,
      leg1_point: null,
      leg2_name: "Sample United win",
      leg2_book: "Bookie B",
      leg2_odds: 2.10,
      leg2_stake: 25.37,
      leg2_point: null,
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
        arbs: demoArbs(),
      });
    }

    const sub = await pool.query(
      `
      select status, plan
      from subscriptions
      where user_email = $1
      order by updated_at desc nulls last
      limit 1
      `,
      [session.user.email]
    );

    const active = sub.rows[0]?.status === "active";
    const plan = sub.rows[0]?.plan ?? null;

    if (!active) {
      return Response.json({
        signedIn: true,
        active: false,
        demo: true,
        plan,
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
      arbs: result.rows,
    });
  } catch (error) {
    console.error("API /api/arbs failed:", error);

    return Response.json(
      {
        signedIn: false,
        active: false,
        demo: true,
        plan: null,
        arbs: [],
        error: "Failed to load arbs",
      },
      { status: 500 }
    );
  }
}