import { auth } from "../../../lib/auth";
import { stripe } from "../../../lib/stripe";
import { pool } from "../../../lib/db";

export async function POST() {
  const session = await auth();
  if (!session?.user?.email) return new Response("Unauthorized", { status: 401 });

  const userId = session.user.email;

  // Create/find customer
  const existing = await pool.query("select stripe_customer_id from subscriptions where user_id=$1", [userId]);
  let customerId = existing.rowCount ? existing.rows[0].stripe_customer_id : null;

  if (!customerId) {
    const customer = await stripe.customers.create({ email: session.user.email! });
    customerId = customer.id;
    await pool.query(
      "insert into subscriptions(user_id, stripe_customer_id, status) values($1,$2,'inactive') on conflict(user_id) do update set stripe_customer_id=excluded.stripe_customer_id",
      [userId, customerId]
    );
  }

  const checkout = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer: customerId,
    line_items: [{ price: process.env.STRIPE_PRICE_ID!, quantity: 1 }],
    success_url: process.env.STRIPE_SUCCESS_URL!,
    cancel_url: process.env.STRIPE_CANCEL_URL!
  });

  return Response.json({ url: checkout.url });
}