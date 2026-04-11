import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { requireBranch } from "@/lib/auth";

export async function POST() {
  const branch = await requireBranch();
  if (!stripe) {
    return NextResponse.json({ error: "Stripe is not configured" }, { status: 500 });
  }
  if (!branch.stripeCustomerId) {
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/dashboard/billing`, {
      status: 303,
    });
  }

  const session = await stripe.billingPortal.sessions.create({
    customer: branch.stripeCustomerId,
    return_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/billing`,
  });

  return NextResponse.redirect(session.url, { status: 303 });
}
