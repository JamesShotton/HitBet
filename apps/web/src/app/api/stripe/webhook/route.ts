import Stripe from "stripe";
import { headers } from "next/headers";
import { pool } from "../../../lib/db";

export const runtime = "nodejs";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

// ── Commission config (change here to update everywhere) ──────────────────────
const FLAT_COMMISSION = 7.50;   // £7.50 per signup
const RECURRING_RATE  = 0.10;   // 10% of each recurring payment

async function recordAffiliateConversion({
  refCode,
  referredEmail,
  plan,
  saleAmount,
  commission,
  isTrial,
  commissionType,
  stripeSessionId,
  stripeInvoiceId,
  stripeSubscriptionId,
}: {
  refCode: string;
  referredEmail: string;
  plan: string;
  saleAmount: number;
  commission: number;
  isTrial: boolean;
  commissionType: "flat" | "recurring";
  stripeSessionId?: string;
  stripeInvoiceId?: string;
  stripeSubscriptionId?: string;
}) {
  const affCheck = await pool.query(
    `SELECT user_email FROM affiliates WHERE ref_code = $1`,
    [refCode]
  );
  const affEmail = affCheck.rows[0]?.user_email;
  // Don't pay self-referrals
  if (!affEmail || affEmail === referredEmail) return;

  await pool.query(
    `INSERT INTO referral_conversions
       (ref_code, referred_email, plan, sale_amount, commission, is_trial,
        commission_type, stripe_session_id, stripe_invoice_id, stripe_subscription_id)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
     ON CONFLICT (stripe_session_id) DO NOTHING`,
    [
      refCode,
      referredEmail,
      plan,
      saleAmount,
      commission,
      isTrial,
      commissionType,
      stripeSessionId ?? null,
      stripeInvoiceId ?? null,
      stripeSubscriptionId ?? null,
    ]
  );
}

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
    // ── Checkout completed (first signup, includes trial starts) ──────────────
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
        let trialExpiresAt: string | null = null;

        if (typeof session.subscription === "string") {
          const sub = await stripe.subscriptions.retrieve(session.subscription);
          if (sub.trial_end) {
            trialExpiresAt = new Date(sub.trial_end * 1000).toISOString();
          }
        }

        const status = isTrial ? "trialing" : "active";

        await pool.query(
          `INSERT INTO subscriptions
             (user_email, status, plan, stripe_customer_id, stripe_subscription_id, trial_expires_at, updated_at)
           VALUES ($1,$2,$3,$4,$5,$6,now())
           ON CONFLICT (user_email) DO UPDATE SET
             status = excluded.status,
             plan = excluded.plan,
             stripe_customer_id = excluded.stripe_customer_id,
             stripe_subscription_id = excluded.stripe_subscription_id,
             trial_expires_at = coalesce(excluded.trial_expires_at, subscriptions.trial_expires_at),
             updated_at = now()`,
          [
            email,
            status,
            plan,
            typeof session.customer === "string" ? session.customer : null,
            typeof session.subscription === "string" ? session.subscription : null,
            trialExpiresAt,
          ]
        );

        // ── Flat £25 affiliate commission — only on direct paid signup (not trial) ──
        // Trial signups: £25 fires on first successful payment instead (see invoice handler)
        const refCode = session.metadata?.ref_code;
        if (refCode && !isTrial) {
          await recordAffiliateConversion({
            refCode,
            referredEmail: email,
            plan,
            saleAmount: FLAT_COMMISSION,
            commission: FLAT_COMMISSION,
            isTrial: false,
            commissionType: "flat",
            stripeSessionId: session.id,
            stripeSubscriptionId:
              typeof session.subscription === "string"
                ? session.subscription
                : undefined,
          });
        }
      }
    }

    // ── Recurring invoice paid — 10% commission on each billing cycle ─────────
    if (event.type === "invoice.payment_succeeded") {
      const invoice = event.data.object as Stripe.Invoice;

      // Only subscription cycle payments (not first invoice — that's the checkout)
      if (invoice.billing_reason !== "subscription_cycle") return new Response("ok", { status: 200 });
      if (!invoice.subscription) return new Response("ok", { status: 200 });

      const subscriptionId =
        typeof invoice.subscription === "string"
          ? invoice.subscription
          : invoice.subscription.id;

      const subscription = await stripe.subscriptions.retrieve(subscriptionId);
      const refCode = subscription.metadata?.ref_code;
      if (!refCode) return new Response("ok", { status: 200 });

      const customerEmail =
        invoice.customer_email ??
        (typeof invoice.customer === "string"
          ? (await stripe.customers.retrieve(invoice.customer) as Stripe.Customer).email
          : null);

      if (!customerEmail) return new Response("ok", { status: 200 });

      const amountPaid = (invoice.amount_paid ?? 0) / 100;
      const plan = subscription.metadata?.plan ?? "unknown";

      // If no flat commission exists yet for this subscription, the trial just converted —
      // pay the £25 now that we know they're a real paying customer
      const flatExists = await pool.query(
        `SELECT id FROM referral_conversions WHERE stripe_subscription_id = $1 AND commission_type = 'flat' LIMIT 1`,
        [subscriptionId]
      );
      if (flatExists.rows.length === 0) {
        await pool.query(
          `INSERT INTO referral_conversions
             (ref_code, referred_email, plan, sale_amount, commission, is_trial,
              commission_type, stripe_session_id, stripe_subscription_id)
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
           ON CONFLICT (stripe_session_id) DO NOTHING`,
          [refCode, customerEmail, plan, FLAT_COMMISSION, FLAT_COMMISSION, false,
           "flat", `trial_converted_${subscriptionId}`, subscriptionId]
        );
      }

      // 10% recurring commission on every cycle payment
      const commission = Math.round(amountPaid * RECURRING_RATE * 100) / 100;
      await recordAffiliateConversion({
        refCode,
        referredEmail: customerEmail,
        plan,
        saleAmount: amountPaid,
        commission,
        isTrial: false,
        commissionType: "recurring",
        stripeInvoiceId: invoice.id,
        stripeSubscriptionId: subscriptionId,
      });
    }

    // ── Subscription updated (trial → active, cancellations, etc) ─────────────
    if (event.type === "customer.subscription.updated") {
      const subscription = event.data.object as Stripe.Subscription;

      const status =
        subscription.status === "active" || subscription.status === "trialing"
          ? subscription.status
          : "inactive";

      const trialEnded =
        subscription.status === "active" && !subscription.trial_end;

      await pool.query(
        `UPDATE subscriptions SET
           status = $1,
           trial_expires_at = CASE WHEN $2 THEN NULL ELSE trial_expires_at END,
           updated_at = now()
         WHERE stripe_subscription_id = $3`,
        [status, trialEnded, subscription.id]
      );
    }

    // ── Subscription deleted (cancelled / payment failed) ─────────────────────
    if (event.type === "customer.subscription.deleted") {
      const subscription = event.data.object as Stripe.Subscription;

      await pool.query(
        `UPDATE subscriptions SET status = 'inactive', trial_expires_at = NULL, updated_at = now()
         WHERE stripe_subscription_id = $1`,
        [subscription.id]
      );
    }

    return new Response("ok", { status: 200 });
  } catch (err: any) {
    console.error("Stripe webhook handler failed:", err);
    return new Response(`Webhook handler failed: ${err.message}`, { status: 500 });
  }
}
