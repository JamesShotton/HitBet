import { pool } from "../../lib/db";
import { auth } from "../../lib/auth";
import { redis, VALUE_CACHE_KEY } from "../../lib/redis";

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

    // ── Try Redis cache first ──────────────────────────────────
    try {
      const cached = await redis.get<any[]>(VALUE_CACHE_KEY);
      if (cached && Array.isArray(cached)) {
        return Response.json({
          signedIn: true,
          active: true,
          isElite: true,
          plan,
          bets: cached.slice(0, 100),
        });
      }
    } catch (cacheErr) {
      console.warn("[api/value] Redis read failed, falling back to DB:", cacheErr);
    }

    // ── Cache miss — query DB ──────────────────────────────────
    const result = await pool.query(
      `SELECT * FROM value_bets WHERE expires_at > NOW() ORDER BY ev_pct DESC LIMIT 100`
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
