import { auth } from "../../lib/auth";
import { pool } from "../../lib/db";

function demoArbs() {
  return [
    {
      id: "demo-1",
      event: "Example FC vs Sample United",
      sport_key: "demo",
      market_group: "h2h",
      commence_time: new Date(Date.now() + 45 * 60 * 1000).toISOString(),
      margin: 0.021,
      est_profit: 7.49,
      leg1_name: "Example FC to WIN",
      leg1_book: "Bookie A",
      leg1_odds: 2.05,
      leg1_stake: 21.98,
      leg1_point: null,
      leg2_name: "Sample United to WIN",
      leg2_book: "Bookie B",
      leg2_odds: 1.62,
      leg2_stake: 42.24,
      leg2_point: null,
    },
  ];
}

export async function GET() {
  const session = await auth();

  if (!session?.user?.email) {
    return new Response("Unauthorized", { status: 401 });
  }

  const email = session.user.email;

  let sub;
  try {
    sub = await pool.query(
      `select status, plan
       from subscriptions
       where user_email = $1
       order by updated_at desc nulls last
       limit 1`,
      [email]
    );
  } catch {
    return Response.json({
      isPro: false,
      demo: true,
      arbs: demoArbs(),
    });
  }

  const row = sub.rows[0];
  const isActive = row?.status === "active";

  if (!isActive) {
    return Response.json({
      isPro: false,
      demo: true,
      arbs: demoArbs(),
    });
  }

  const arbs = await pool.query(
    `select *
     from arbs
     order by margin desc, created_at desc
     limit 100`
  );

  return Response.json({
    isPro: true,
    demo: false,
    plan: row?.plan || "pro",
    arbs: arbs.rows,
  });
}