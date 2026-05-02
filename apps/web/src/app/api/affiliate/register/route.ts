import crypto from "crypto";
import { pool } from "../../../lib/db";
import { auth } from "../../../lib/auth";

export async function POST() {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if already registered
    const existing = await pool.query(
      `SELECT ref_code FROM affiliates WHERE user_email = $1`,
      [session.user.email]
    );
    if (existing.rows[0]) {
      return Response.json({ ref_code: existing.rows[0].ref_code });
    }

    // Generate unique 10-char code
    let ref_code: string;
    let attempts = 0;
    do {
      ref_code = crypto.randomBytes(5).toString("hex");
      const taken = await pool.query(
        `SELECT 1 FROM affiliates WHERE ref_code = $1`,
        [ref_code]
      );
      if (!taken.rows[0]) break;
      attempts++;
    } while (attempts < 5);

    await pool.query(
      `INSERT INTO affiliates (user_email, ref_code) VALUES ($1, $2)`,
      [session.user.email, ref_code]
    );

    return Response.json({ ref_code });
  } catch (err) {
    console.error("POST /api/affiliate/register failed:", err);
    return Response.json({ error: "Failed to register" }, { status: 500 });
  }
}
