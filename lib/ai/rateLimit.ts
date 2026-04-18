import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

/**
 * Per-IP rate limits for demo endpoints. Seed §5.1 specifies 5 runs/hour for
 * the Other Teacher demo. Other demos get their own instance — sliding window
 * keeps the UX forgiving while still capping the spend surface.
 *
 * Graceful degradation: when Upstash env vars are absent (local dev,
 * preview deploy without secrets) we return a no-op limiter that always
 * allows. Never block the demo on missing infra — the rate limit is a
 * cost guard, not a correctness guard.
 */

type LimitResult = { success: boolean; remaining: number; reset: number };

interface LimiterHandle {
  limit(identifier: string): Promise<LimitResult>;
}

const noopLimiter: LimiterHandle = {
  async limit() {
    return { success: true, remaining: Number.POSITIVE_INFINITY, reset: 0 };
  },
};

function createLimiter(
  prefix: string,
  requests: number,
  window: `${number} ${"s" | "m" | "h" | "d"}`,
): LimiterHandle {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return noopLimiter;

  const redis = new Redis({ url, token });
  return new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(requests, window),
    prefix,
    analytics: true,
  });
}

export const otherTeacherLimit = createLimiter(
  "demo:other-teacher",
  5,
  "1 h",
);

export function ipFromRequest(req: Request): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    req.headers.get("x-real-ip") ??
    "anonymous"
  );
}
