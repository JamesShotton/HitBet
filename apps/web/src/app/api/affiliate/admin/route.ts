import { pool } from "../../../lib/db";
import { auth } from "../../../lib/auth";

const COMMISSION_RATE = 0.20;

function isAdmin(email: string): boolean {
  const admins = (process.env.ADMIN_EMAILS ?? "").split(",").map((e) => e.trim().toLowerCase());
  return admins.includes(email.toLowerCase());
}

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.email || !isAdmin(session.user.email)) {
      return Response.json({ error: "Forbidden" }, { status: 403 });
    }

    const affiliates = await pool.query(
      `SELECT a.user_email, a.ref_code, a.payout_email, a.created_at,
              COUNT(DISTINCT rc.id) AS clicks,
              COUNT(DISTINCT rv.id) AS conversions,
              COALESCE(SUM(rv.commission) FILTER (WHERE NOT rv.paid_out), 0) AS pending,
              COALESCE(SUM(rv.commission) FILTER (WHERE rv.paid_out), 0) AS paid
       FROM affiliates a
       LEFT JOIN referral_clicks rc ON rc.ref_code = a.ref_code
       LEFT JOIN referral_conversions rv ON rv.ref_code = a.ref_code
       GROUP BY a.user_email, a.ref_code, a.payout_email, a.created_at
       ORDER BY a.created_at DESC`
    );

    const unpaidConversions = await pool.query(
      `SELECT rv.id, rv.ref_code, rv.referred_email, rv.plan,
              rv.sale_amount, rv.commission, rv.is_trial, rv.created_at,
              a.user_email AS affiliate_email, a.payout_email
       FROM referral_conversions rv
       JOIN affiliates a ON a.ref_code = rv.ref_code
       WHERE NOT rv.paid_out
       ORDER BY rv.created_at DESC`
    );

    return Response.json({
      affiliates: affiliates.rows,
      unpaidConversions: unpaidConversions.rows,
      commissionRate: COMMISSION_RATE,
    });
  } catch (err) {
    console.error("GET /api/affiliate/admin failed:", err);
    return Response.json({ error: "Failed to load" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.email || !isAdmin(session.user.email)) {
      return Response.json({ error: "Forbidden" }, { status: 403 });
    }

    const { conversion_ids } = await req.json();
    if (!Array.isArray(conversion_ids) || conversion_ids.length === 0) {
      return Response.json({ error: "conversion_ids required" }, { status: 400 });
    }

    await pool.query(
      `UPDATE referral_conversions SET paid_out = TRUE WHERE id = ANY($1)`,
      [conversion_ids]
    );

    return Response.json({ ok: true, marked: conversion_ids.length });
  } catch (err) {
    console.error("POST /api/affiliate/admin failed:", err);
    return Response.json({ error: "Failed to update" }, { status: 500 });
  }
}
