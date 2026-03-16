import { pool } from "../../lib/db";
import { auth } from "../../lib/auth";

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return Response.json({ signedIn: false, active: false, bets: [] });
    }

    const sub = await pool.query(
      `select status, plan, trial_expires_at from subscriptions
       where user_email = $1 order by updated_at desc limit 1`,
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
    // Long Run or both plans get value access
    const isElite = (plan === "longrun" || plan === "both") && hasAccess;

    if (!isElite) {
      return Response.json({
        signedIn: true,
        active: hasAccess,
        isElite: false,
        plan,
        bets: [],
      });
    }

    const result = await pool.query(
      `select * from value_bets order by ev_pct desc limit 100`
    );

    return Response.json({
      signedIn: true,
      active: true,
      isElite: true,
      plan,
      bets: result.rows,
    });
  } catch (err) {
    console.error("API /api/value failed:", err);
    return Response.json(
      {
        signedIn: false,
        active: false,
        isElite: false,
        bets: [],
        error: "Failed to load",
      },
      { status: 500 }
    );
  }
}
