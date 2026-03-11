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
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;

      const email =
        session.customer_details?.email ||
        session.metadata?.user_email ||
        null;

      const plan =
        session.metadata?.plan === "elite" ? "elite" : "pro";

      if (email) {
        await pool.query(
          `
          insert into subscriptions (
            user_email,
            status,
            plan,
            stripe_customer_id,
            stripe_subscription_id,
            updated_at
          )
          values ($1, 'active', $2, $3, $4, now())
          on conflict (user_email)
          do update set
            status = 'active',
            plan = excluded.plan,
            stripe_customer_id = excluded.stripe_customer_id,
            stripe_subscription_id = excluded.stripe_subscription_id,
            updated_at = now()
          `,
          [
            email,
            plan,
            typeof session.customer === "string" ? session.customer : null,
            typeof session.subscription === "string" ? session.subscription : null,
          ]
        );
      }
    }

    if (event.type === "customer.subscription.deleted") {
      const subscription = event.data.object as Stripe.Subscription;

      await pool.query(
        `
        update subscriptions
        set status = 'inactive', updated_at = now()
        where stripe_subscription_id = $1
        `,
        [subscription.id]
      );
    }

    if (event.type === "customer.subscription.updated") {
      const subscription = event.data.object as Stripe.Subscription;

      const status =
        subscription.status === "active" || subscription.status === "trialing"
          ? "active"
          : "inactive";

      await pool.query(
        `
        update subscriptions
        set status = $1, updated_at = now()
        where stripe_subscription_id = $2
        `,
        [status, subscription.id]
      );
    }

    return new Response("ok", { status: 200 });
  } catch (err: any) {
    console.error("Stripe webhook handler failed:", err);
    return new Response(`Webhook handler failed: ${err.message}`, { status: 500 });
  }
}