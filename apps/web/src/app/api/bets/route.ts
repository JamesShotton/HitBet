import { pool } from "../../lib/db";
import { auth } from "../../lib/auth";

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const url = new URL(req.url);
    if (url.searchParams.get("summary") === "true") {
      const monthStart = new Date(
        new Date().getFullYear(),
        new Date().getMonth(),
        1
      ).toISOString();
      const [monthRes, totalRes] = await Promise.all([
        pool.query(
          `SELECT COALESCE(SUM(profit), 0) AS pnl, COUNT(*) AS bets
           FROM bet_logs WHERE user_email = $1 AND created_at >= $2`,
          [session.user.email, monthStart]
        ),
        pool.query(
          `SELECT COALESCE(SUM(profit), 0) AS pnl, COUNT(*) AS bets
           FROM bet_logs WHERE user_email = $1`,
          [session.user.email]
        ),
      ]);
      return Response.json({
        monthPnl: Number(monthRes.rows[0].pnl),
        monthBets: Number(monthRes.rows[0].bets),
        totalPnl: Number(totalRes.rows[0].pnl),
        totalBets: Number(totalRes.rows[0].bets),
      });
    }

    const result = await pool.query(
      `SELECT * FROM bet_logs WHERE user_email = $1 ORDER BY created_at DESC LIMIT 100`,
      [session.user.email]
    );
    return Response.json({ bets: result.rows });
  } catch (err) {
    console.error("GET /api/bets failed:", err);
    return Response.json({ error: "Failed to load" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { event, market_group, leg1_book, leg2_book, leg3_book, stake, profit, notes } = body;

    if (typeof profit !== "number") {
      return Response.json({ error: "profit is required" }, { status: 400 });
    }

    const result = await pool.query(
      `INSERT INTO bet_logs
         (user_email, event, market_group, leg1_book, leg2_book, leg3_book, stake, profit, notes)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
       RETURNING id, created_at`,
      [
        session.user.email,
        event ?? null,
        market_group ?? null,
        leg1_book ?? null,
        leg2_book ?? null,
        leg3_book ?? null,
        stake ?? null,
        profit,
        notes ?? null,
      ]
    );
    return Response.json(result.rows[0]);
  } catch (err) {
    console.error("POST /api/bets failed:", err);
    return Response.json({ error: "Failed to save" }, { status: 500 });
  }
}
