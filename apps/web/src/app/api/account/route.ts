import { auth } from "../../lib/auth";
import { pool } from "../../lib/db";

export async function GET() {
  const session = await auth();
  if (!session?.user?.email) return new Response("Unauthorized", { status: 401 });

  const userId = session.user.email;

  const sub = await pool.query(
    "select status, current_period_end from subscriptions where user_id=$1",
    [userId]
  );

  const status = sub.rowCount ? sub.rows[0].status : "inactive";
  const currentPeriodEnd = sub.rowCount ? sub.rows[0].current_period_end : null;

  return Response.json({
    email: userId,
    isPro: status === "active",
    status,
    currentPeriodEnd
  });
}