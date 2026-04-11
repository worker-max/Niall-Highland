import { prisma } from "./db";
import { randomBytes } from "crypto";

export async function issueSurveyToken(
  clinicianId: string,
  purpose: "PTO_REQUEST" | "COVERAGE_SIGNUP",
  ttlDays = 30
): Promise<string> {
  const token = randomBytes(24).toString("base64url");
  await prisma.surveyToken.create({
    data: {
      token,
      clinicianId,
      purpose,
      expiresAt: new Date(Date.now() + ttlDays * 24 * 60 * 60 * 1000),
    },
  });
  return token;
}

export function surveyUrl(
  appUrl: string,
  purpose: "PTO_REQUEST" | "COVERAGE_SIGNUP",
  token: string
): string {
  const path = purpose === "PTO_REQUEST" ? "/request" : "/coverage";
  return `${appUrl}${path}/${token}`;
}
