import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getLandingPage, getDescriptor } from "@/lib/press-kit/landing-pages";
import { LandingPageEditor } from "./LandingPageEditor";

export const metadata: Metadata = {
  title: "Edit landing page · Press kit",
  robots: { index: false, follow: false },
};

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function LandingPageEditorRoute({ params }: PageProps) {
  const { slug } = await params;
  const descriptor = getDescriptor(slug);
  if (!descriptor) notFound();

  const existing = await getLandingPage(slug);
  const initial = existing ?? {
    slug,
    headline: descriptor.defaultHeadline,
    subhead: descriptor.defaultSubhead,
    ctaText: descriptor.defaultCtaText,
    ctaUrl: descriptor.defaultCtaUrl,
    ctaColor: "accent",
    imageUrl: null,
    imageAlt: "",
  };

  return <LandingPageEditor descriptor={descriptor} initial={initial} />;
}
