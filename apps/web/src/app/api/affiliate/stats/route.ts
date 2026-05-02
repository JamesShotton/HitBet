import { pool } from "../../../lib/db";
import { auth } from "../../../lib/auth";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const aff = await pool.query(
      `SELECT ref_code, payout_email, created_at FROM affiliates WHERE user_email = $1`,
      [session.user.email]
    );
    if (!aff.rows[0]) {
      return Response.json({ registered: false });
    }

    const { ref_code, payout_email, created_at } = aff.rows[0];

    const [clicks, convRows] = await Promise.all([
      pool.query(`SELECT COUNT(*) AS total FROM referral_clicks WHERE ref_code = $1`, [ref_code]),
      pool.query(
        `SELECT plan, sale_amount, commission, is_trial, paid_out, created_at
         FROM referral_conversions WHERE ref_code = $1 ORDER BY created_at DESC`,
        [ref_code]
      ),
    ]);

    const conversions = convRows.rows;
    const pendingCommission = conversions
      .filter((c) => !c.paid_out)
      .reduce((sum, c) => sum + Number(c.commission), 0);
    const paidCommission = conversions
      .filter((c) => c.paid_out)
      .reduce((sum, c) => sum + Number(c.commission), 0);

    return Response.json({
      registered: true,
      ref_code,
      payout_email,
      created_at,
      clicks: Number(clicks.rows[0].total),
      conversions: conversions.length,
      pendingCommission,
      paidCommission,
      history: conversions,
    });
  } catch (err) {
    console.error("GET /api/affiliate/stats failed:", err);
    return Response.json({ error: "Failed to load" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { payout_email } = await req.json();
    await pool.query(
      `UPDATE affiliates SET payout_email = $1 WHERE user_email = $2`,
      [payout_email ?? null, session.user.email]
    );
    return Response.json({ ok: true });
  } catch (err) {
    console.error("PATCH /api/affiliate/stats failed:", err);
    return Response.json({ error: "Failed to update" }, { status: 500 });
  }
}
