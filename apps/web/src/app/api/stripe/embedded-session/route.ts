import Stripe from "stripe";
import { NextResponse } from "next/server";
import { auth } from "../../../lib/auth";
import { pool } from "../../../lib/db";

export const runtime = "nodejs";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: Request) {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Not signed in" }, { status: 401 });
    }

    const body = await req.json();
    const plan = body?.plan === "elite" ? "elite" : "pro";
    const isTrial = body?.trial === true;

    const priceId =
      plan === "elite"
        ? process.env.STRIPE_PRICE_ELITE
        : process.env.STRIPE_PRICE_PRO;

    if (!priceId) {
      return NextResponse.json(
        { error: "Missing Stripe price id" },
        { status: 500 }
      );
    }

    // Check if this user has already had a trial — prevent abuse
    const existing = await pool.query(
      `select trial_expires_at, status from subscriptions where user_email = $1 limit 1`,
      [session.user.email]
    );
    const alreadyTrialed = existing.rows[0]?.trial_expires_at != null;

    const appUrl =
      process.env.NEXT_PUBLIC_APP_URL ||
      process.env.NEXTAUTH_URL ||
      "http://localhost:3000";

    const checkoutParams: Stripe.Checkout.SessionCreateParams = {
      mode: "subscription",
      ui_mode: "embedded",
      customer_email: session.user.email,
      line_items: [{ price: priceId, quantity: 1 }],
      return_url: `${appUrl}/dashboard?checkout=success`,
      metadata: {
        user_email: session.user.email,
        plan,
        is_trial: isTrial && !alreadyTrialed ? "true" : "false",
      },
    };

    // Add 7-day trial if requested and not already used
    if (isTrial && !alreadyTrialed) {
      checkoutParams.subscription_data = {
        trial_period_days: 7,
        trial_settings: {
          end_behavior: {
            missing_payment_method: "cancel",
          },
        },
      };
      // Require card upfront
      checkoutParams.payment_method_collection = "always";
    }

    const checkout = await stripe.checkout.sessions.create(checkoutParams);

    return NextResponse.json({ clientSecret: checkout.client_secret });
  } catch (err: any) {
    console.error("Embedded session route failed:", err);
    return NextResponse.json(
      { error: err?.message || "Failed to create checkout session" },
      { status: 500 }
    );
  }
}