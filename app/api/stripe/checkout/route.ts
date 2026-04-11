import { NextResponse } from "next/server";
import { stripe, PRICE_LOOKUP } from "@/lib/stripe";
import { requireBranch } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function POST(req: Request) {
  const branch = await requireBranch();
  if (!stripe) {
    return NextResponse.json({ error: "Stripe is not configured" }, { status: 500 });
  }

  const form = await req.formData();
  const tier = (form.get("tier") ?? "MAP") as "MAP" | "OPS" | "BRANCH";
  const interval = (form.get("interval") ?? "annual") as "annual" | "quarterly";

  const priceId = PRICE_LOOKUP[tier]?.[interval];
  if (!priceId) {
    return NextResponse.json({ error: "Missing Stripe price" }, { status: 400 });
  }

  let customerId = branch.stripeCustomerId;
  if (!customerId) {
    const customer = await stripe.customers.create({
      metadata: { branchId: branch.id, clerkOrgId: branch.clerkOrgId },
      name: branch.name,
    });
    customerId = customer.id;
    await prisma.branch.update({
      where: { id: branch.id },
      data: { stripeCustomerId: customerId },
    });
  }

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer: customerId,
    line_items: [{ price: priceId, quantity: 1 }],
    subscription_data: {
      trial_period_days: 90,
      metadata: { branchId: branch.id, tier },
    },
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/billing?status=ok`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/billing?status=canceled`,
    payment_method_collection: "always",
  });

  return NextResponse.redirect(session.url!, { status: 303 });
}
