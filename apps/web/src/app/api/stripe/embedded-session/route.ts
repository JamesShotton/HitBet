import Stripe from "stripe";
import { NextResponse } from "next/server";
import { auth } from "../../../lib/auth";

export const runtime = "nodejs";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: Request) {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Not signed in" }, { status: 401 });
    }

    const body = await req.json();
    const plan = (body?.plan || "pro") as "pro" | "elite";

    const price =
      plan === "elite"
        ? process.env.STRIPE_PRICE_ELITE
        : process.env.STRIPE_PRICE_PRO;

    if (!price) {
      return NextResponse.json({ error: "Missing Stripe price id" }, { status: 500 });
    }

    const appUrl =
      process.env.NEXT_PUBLIC_APP_URL ||
      process.env.NEXTAUTH_URL ||
      "http://localhost:3000";

    const checkout = await stripe.checkout.sessions.create({
      mode: "subscription",
      ui_mode: "embedded",
      customer_email: session.user.email,
      line_items: [{ price, quantity: 1 }],
      return_url: `${appUrl}/account?checkout=success`,
      metadata: {
        plan,
        user_email: session.user.email,
      },
    });

    return NextResponse.json({
      clientSecret: checkout.client_secret,
    });
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message || "Failed to create checkout session" },
      { status: 500 }
    );
  }
}