"use client";

import dynamic from "next/dynamic";

/**
 * Client-side wrapper that defers Contact (react-hook-form + zod resolver +
 * the form markup) out of the initial JS bundle. The Contact section sits
 * deep below the fold \u2014 users who hit it have already scrolled past the
 * three demos, so a brief hydration-time load is acceptable and the
 * first-load JS saving keeps the home page under the seed \u00a76.5 budget.
 */
const Contact = dynamic(
  () => import("./Contact").then((m) => m.Contact),
  { ssr: false },
);

interface ContactLazyProps {
  email: string;
  calendlyUrl?: string;
  linkedInUrl?: string;
}

export function ContactLazy(props: ContactLazyProps) {
  return <Contact {...props} />;
}
