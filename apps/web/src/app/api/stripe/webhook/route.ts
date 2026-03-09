import Stripe from "stripe";
import { headers } from "next/headers";
import { pool } from "../../../lib/db";

export const runtime = "nodejs";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: Request) {
  const body = await req.text();
  const sig = (await headers()).get("stripe-signature");

  if (!sig) {
    return new Response("Missing stripe signature", { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
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

      const plan = session.metadata?.plan || "pro";

      if (email) {
        await pool.query(
          `
          insert into subscriptions (user_email, status, plan, stripe_customer_id, stripe_subscription_id, updated_at)
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
      const sub = event.data.object as Stripe.Subscription;

      await pool.query(
        `
        update subscriptions
        set status = 'canceled', updated_at = now()
        where stripe_subscription_id = $1
        `,
        [sub.id]
      );
    }

    return new Response("ok", { status: 200 });
  } catch (e: any) {
    return new Response(`Webhook handler failed: ${e.message}`, { status: 500 });
  }
}