import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/db";
import type Stripe from "stripe";

export const runtime = "nodejs";

export async function POST(req: Request) {
  if (!stripe) {
    return NextResponse.json({ error: "Stripe not configured" }, { status: 500 });
  }

  const sig = req.headers.get("stripe-signature");
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!sig || !secret) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  const body = await req.text();
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, secret);
  } catch (err) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const s = event.data.object as Stripe.Checkout.Session;
      const customerId = typeof s.customer === "string" ? s.customer : s.customer?.id;
      const subId = typeof s.subscription === "string" ? s.subscription : s.subscription?.id;
      if (customerId) {
        await prisma.branch.updateMany({
          where: { stripeCustomerId: customerId },
          data: { stripeSubId: subId ?? null },
        });
      }
      break;
    }
    case "customer.subscription.updated":
    case "customer.subscription.created": {
      const sub = event.data.object as Stripe.Subscription;
      const tier = (sub.metadata?.tier as "MAP" | "OPS" | "BRANCH") ?? undefined;
      if (tier && typeof sub.customer === "string") {
        await prisma.branch.updateMany({
          where: { stripeCustomerId: sub.customer },
          data: {
            tier,
            stripeSubId: sub.id,
            trialEndsAt: sub.trial_end ? new Date(sub.trial_end * 1000) : null,
          },
        });
      }
      break;
    }
    case "customer.subscription.deleted": {
      const sub = event.data.object as Stripe.Subscription;
      if (typeof sub.customer === "string") {
        await prisma.branch.updateMany({
          where: { stripeCustomerId: sub.customer },
          data: { stripeSubId: null, tier: "MAP" },
        });
      }
      break;
    }
    default:
      break;
  }

  return NextResponse.json({ received: true });
}
