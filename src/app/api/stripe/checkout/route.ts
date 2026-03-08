import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

// Lazy-init Stripe to avoid build crashes when env vars aren't set
function getStripe() {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error("STRIPE_SECRET_KEY is not set");
  }
  return new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: "2026-02-25.clover",
  });
}

// Price IDs — create these in your Stripe dashboard and replace the values below.
// For now we use price_data (inline pricing) so no dashboard setup is needed.
const PLANS = {
  monthly: {
    amount: 499, // $4.99 in cents
    interval: "month" as const,
    label: "Quiplet Pro — Monthly",
  },
  yearly: {
    amount: 3900, // $39.00 in cents
    interval: "year" as const,
    label: "Quiplet Pro — Yearly",
  },
};

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const plan = body.plan === "yearly" ? "yearly" : "monthly";
    const planConfig = PLANS[plan];

    const stripe = getStripe();

    const origin = req.headers.get("origin") ?? "http://localhost:3000";

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: planConfig.label,
              description: "Unlimited quotes, family sharing, PDF export & more.",
              images: [], // Add a product image URL here if desired
            },
            recurring: {
              interval: planConfig.interval,
            },
            unit_amount: planConfig.amount,
          },
          quantity: 1,
        },
      ],
      success_url: `${origin}/feed?upgraded=true`,
      cancel_url: `${origin}/pricing`,
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error("[stripe/checkout] error:", err);
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 }
    );
  }
}
