"use client";

/**
 * Demo-funnel analytics (seed §6.1). Fires client-side events that map to
 * the conversion chain: demo_started → demo_completed → demo_cta_clicked.
 *
 * PostHog is dynamically imported on first use so its ~55kB payload doesn't
 * land in the home-page first-load JS (seed §6.5 budget: <150kB). When
 * NEXT_PUBLIC_POSTHOG_KEY is absent, every call is a no-op and nothing is
 * fetched.
 */

type DemoId =
  | "other-teacher"
  | "lesson-plan"
  | "curriculum-audit"
  | "principals-inbox"
  | "talk-explorer";

type EventName =
  | "demo_started"
  | "demo_completed"
  | "demo_rate_limited"
  | "demo_errored"
  | "demo_cta_clicked";

interface EventProps {
  demo: DemoId;
  [key: string]: unknown;
}

type PostHogLike = {
  init: (key: string, opts: Record<string, unknown>) => void;
  capture: (event: string, props: Record<string, unknown>) => void;
};

let loader: Promise<PostHogLike | null> | null = null;

function loadPostHog(): Promise<PostHogLike | null> {
  if (loader) return loader;
  if (typeof window === "undefined") return Promise.resolve(null);
  const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;
  if (!key) return Promise.resolve(null);

  loader = import("posthog-js")
    .then((mod) => {
      const posthog = mod.default as unknown as PostHogLike;
      posthog.init(key, {
        api_host:
          process.env.NEXT_PUBLIC_POSTHOG_HOST ?? "https://eu.i.posthog.com",
        capture_pageview: true,
        capture_pageleave: true,
        persistence: "localStorage+cookie",
        autocapture: false,
      });
      return posthog;
    })
    .catch(() => null);
  return loader;
}

export function initAnalytics(): void {
  void loadPostHog();
}

export function track(event: EventName, props: EventProps): void {
  void loadPostHog().then((posthog) => {
    if (!posthog) return;
    posthog.capture(event, props);
  });
}
