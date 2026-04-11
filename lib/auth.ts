import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "./db";
import type { Branch } from "@prisma/client";

/**
 * Get the current signed-in user's branch.  Creates a Branch row on first
 * access if the user has a Clerk organization but no Branch yet.
 *
 * Redirects to /login if unauthenticated, or /onboarding if there is
 * no active organization (Clerk org = branch).
 */
export async function requireBranch(): Promise<Branch> {
  const { userId, orgId, orgSlug } = await auth();

  if (!userId) {
    redirect("/login");
  }

  if (!orgId) {
    redirect("/onboarding");
  }

  let branch = await prisma.branch.findUnique({
    where: { clerkOrgId: orgId },
  });

  if (!branch) {
    branch = await prisma.branch.create({
      data: {
        clerkOrgId: orgId,
        name: orgSlug ?? "New Branch",
        tier: "MAP",
        trialEndsAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days
      },
    });
  }

  return branch;
}

export function tierAllows(branchTier: string, required: "MAP" | "OPS" | "BRANCH"): boolean {
  const rank: Record<string, number> = { MAP: 1, OPS: 2, BRANCH: 3 };
  return (rank[branchTier] ?? 0) >= (rank[required] ?? 0);
}
