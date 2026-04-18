"use client";

import { useEffect } from "react";
import { initAnalytics } from "@/lib/analytics";

/**
 * Tiny client boundary whose sole job is to boot PostHog on first mount.
 * Kept out of <Providers> so analytics stays optional and the provider
 * tree isn't forced to re-render when analytics state changes.
 */
export function AnalyticsInit() {
  useEffect(() => {
    initAnalytics();
  }, []);
  return null;
}
