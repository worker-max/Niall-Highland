import { NextResponse } from "next/server";
import { z } from "zod";
import {
  checkPasscode,
  configuredPasscode,
  setSessionCookie,
  clearSessionCookie,
} from "@/lib/desk/auth";
import { deskAuthLimit, ipFromRequest } from "@/lib/ai/rateLimit";

export const runtime = "nodejs";

const schema = z.object({
  passcode: z.string().min(1).max(200),
});

/**
 * POST — login endpoint. Rate-limited per IP. Constant-time passcode check
 * against NIALL_DESK_PASSCODE. On match, sets an HMAC-signed 30-day cookie.
 */
export async function POST(req: Request) {
  if (!configuredPasscode()) {
    return NextResponse.json(
      {
        error:
          "Niall’s Desk isn’t configured yet. Ask the site owner to set NIALL_DESK_PASSCODE.",
      },
      { status: 503 },
    );
  }

  const ip = ipFromRequest(req);
  const { success } = await deskAuthLimit.limit(ip);
  if (!success) {
    return NextResponse.json(
      { error: "Too many attempts. Try again in a few minutes." },
      { status: 429 },
    );
  }

  let body: z.infer<typeof schema>;
  try {
    body = schema.parse(await req.json());
  } catch {
    return NextResponse.json({ error: "Missing passcode." }, { status: 400 });
  }

  if (!checkPasscode(body.passcode)) {
    return NextResponse.json(
      { error: "Incorrect passcode." },
      { status: 401 },
    );
  }

  await setSessionCookie();
  return NextResponse.json({ ok: true });
}

/** DELETE — logout. Clears the cookie. */
export async function DELETE() {
  await clearSessionCookie();
  return NextResponse.json({ ok: true });
}
