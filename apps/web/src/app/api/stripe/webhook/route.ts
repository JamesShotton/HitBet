import Stripe from "stripe";
import { headers } from "next/headers";
import { pool } from "../../../lib/db";

export const runtime = "nodejs";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: Request) {
  const body = await req.text();
  const signature = (await headers()).get("stripe-signature");

  if (!signature) {
    return new Response("Missing stripe signature", { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err: any) {
    return new Response(`Webhook error: ${err.message}`, { status: 400 });
  }

  try {
    // ── Checkout completed (first time, includes trials) ──────────────────
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;

      const email =
        session.customer_details?.email || session.metadata?.user_email || null;

      const rawPlan = session.metadata?.plan ?? "arbitrage";
      const plan = ["arbitrage", "longrun", "both"].includes(rawPlan)
        ? rawPlan
        : "arbitrage";
      const isTrial = session.metadata?.is_trial === "true";

      if (email) {
        // Fetch the subscription to get trial_end
        let trialExpiresAt: string | null = null;

        if (typeof session.subscription === "string") {
          const sub = await stripe.subscriptions.retrieve(session.subscription);
          if (sub.trial_end) {
            trialExpiresAt = new Date(sub.trial_end * 1000).toISOString();
          }
        }

        const status = isTrial ? "trialing" : "active";

        await pool.query(
          `
          insert into subscriptions (
            user_email,
            status,
            plan,
            stripe_customer_id,
            stripe_subscription_id,
            trial_expires_at,
            updated_at
          )
          values ($1, $2, $3, $4, $5, $6, now())
          on conflict (user_email)
          do update set
            status = excluded.status,
            plan = excluded.plan,
            stripe_customer_id = excluded.stripe_customer_id,
            stripe_subscription_id = excluded.stripe_subscription_id,
            trial_expires_at = coalesce(excluded.trial_expires_at, subscriptions.trial_expires_at),
            updated_at = now()
          `,
          [
            email,
            status,
            plan,
            typeof session.customer === "string" ? session.customer : null,
            typeof session.subscription === "string"
              ? session.subscription
              : null,
            trialExpiresAt,
          ]
        );

        // ── Record affiliate conversion if ref_code present ────────────
        const refCode = session.metadata?.ref_code;
        if (refCode) {
          const PLAN_AMOUNTS: Record<string, number> = {
            arbitrage: 39.99,
            longrun: 59.99,
            both: 89.99,
          };
          const COMMISSION_RATE = 0.20;
          const saleAmount = PLAN_AMOUNTS[plan] ?? 39.99;
          const commission = Math.round(saleAmount * COMMISSION_RATE * 100) / 100;

          // Verify the ref_code exists and isn't the purchaser's own code
          const affCheck = await pool.query(
            `SELECT user_email FROM affiliates WHERE ref_code = $1`,
            [refCode]
          );
          const affEmail = affCheck.rows[0]?.user_email;
          if (affEmail && affEmail !== email) {
            await pool.query(
              `INSERT INTO referral_conversions
                 (ref_code, referred_email, plan, sale_amount, commission, is_trial, stripe_session_id)
               VALUES ($1, $2, $3, $4, $5, $6, $7)
               ON CONFLICT (stripe_session_id) DO NOTHING`,
              [refCode, email, plan, saleAmount, commission, isTrial, session.id]
            );
          }
        }
      }
    }

    // ── Subscription updated (trial → active, cancellations, etc) ─────────
    if (event.type === "customer.subscription.updated") {
      const subscription = event.data.object as Stripe.Subscription;

      const status =
        subscription.status === "active" || subscription.status === "trialing"
          ? subscription.status
          : "inactive";

      // When trial converts to active, clear trial_expires_at
      const trialEnded =
        subscription.status === "active" && !subscription.trial_end;

      await pool.query(
        `
        update subscriptions
        set
          status = $1,
          trial_expires_at = case when $2 then null else trial_expires_at end,
          updated_at = now()
        where stripe_subscription_id = $3
        `,
        [status, trialEnded, subscription.id]
      );
    }

    // ── Subscription deleted (cancelled / payment failed) ─────────────────
    if (event.type === "customer.subscription.deleted") {
      const subscription = event.data.object as Stripe.Subscription;

      await pool.query(
        `
        update subscriptions
        set status = 'inactive', trial_expires_at = null, updated_at = now()
        where stripe_subscription_id = $1
        `,
        [subscription.id]
      );
    }

    return new Response("ok", { status: 200 });
  } catch (err: any) {
    console.error("Stripe webhook handler failed:", err);
    return new Response(`Webhook handler failed: ${err.message}`, {
      status: 500,
    });
  }
}
