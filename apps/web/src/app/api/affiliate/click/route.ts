import { pool } from "../../../lib/db";

export async function POST(req: Request) {
  try {
    const { ref_code } = await req.json();
    if (!ref_code || typeof ref_code !== "string") {
      return Response.json({ ok: false }, { status: 400 });
    }

    // Verify ref_code exists
    const aff = await pool.query(
      `SELECT 1 FROM affiliates WHERE ref_code = $1`,
      [ref_code]
    );
    if (!aff.rows[0]) {
      return Response.json({ ok: false }, { status: 404 });
    }

    await pool.query(
      `INSERT INTO referral_clicks (ref_code) VALUES ($1)`,
      [ref_code]
    );
    return Response.json({ ok: true });
  } catch (err) {
    console.error("POST /api/affiliate/click failed:", err);
    return Response.json({ ok: false }, { status: 500 });
  }
}
