import { auth } from "../../lib/auth";
import { pool } from "../../lib/db";

export async function GET() {
  const session = await auth();
  if (!session?.user?.email)
    return new Response("Unauthorized", { status: 401 });

  const email = session.user.email;

  const sub = await pool.query(
    `select status, plan, current_period_end, trial_expires_at
     from subscriptions where user_email = $1
     order by updated_at desc limit 1`,
    [email]
  );

  const row = sub.rows[0];
  const status = row?.status ?? "inactive";
  const plan = row?.plan ?? null;
  const currentPeriodEnd = row?.current_period_end ?? null;
  const trialExpiresAt = row?.trial_expires_at ?? null;

  const isActive = status === "active";
  const isTrialing =
    status === "trialing" ||
    (trialExpiresAt && new Date(trialExpiresAt) > new Date());

  let trialDaysLeft = 0;
  if (isTrialing && trialExpiresAt) {
    const msLeft = new Date(trialExpiresAt).getTime() - Date.now();
    trialDaysLeft = Math.max(0, Math.ceil(msLeft / (1000 * 60 * 60 * 24)));
  }

  return Response.json({
    email,
    plan,
    status,
    isActive,
    isTrialing,
    trialDaysLeft,
    currentPeriodEnd,
  });
}
