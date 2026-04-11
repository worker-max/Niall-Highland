import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function CoverageSignupPage({
  params,
}: {
  params: { token: string };
}) {
  const token = await prisma.surveyToken.findUnique({
    where: { token: params.token },
    include: { clinician: true },
  });

  if (
    !token ||
    token.consumedAt ||
    token.expiresAt < new Date() ||
    token.purpose !== "COVERAGE_SIGNUP"
  ) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-cream-50 p-6">
        <div className="card max-w-md text-center">
          <h1 className="text-xl font-semibold text-teal-900">Link unavailable</h1>
          <p className="mt-2 text-sm text-ink-600">
            This sign-up link is invalid or no longer active.
          </p>
        </div>
      </div>
    );
  }

  const openSlots = await prisma.coverageSlot.findMany({
    where: { branchId: token.clinician.branchId, status: "UNASSIGNED" },
    orderBy: { slotDate: "asc" },
  });

  return (
    <div className="min-h-screen bg-cream-50 p-6">
      <div className="mx-auto max-w-2xl">
        <h1 className="text-2xl font-semibold text-teal-900">Coverage sign-up</h1>
        <p className="mt-1 text-sm text-ink-600">
          {token.clinician.discipline}-{token.clinician.number}
        </p>
        <div className="card mt-6">
          {openSlots.length === 0 ? (
            <p className="text-sm text-ink-500">No open slots right now.</p>
          ) : (
            <form action="/api/survey/coverage" method="POST" className="space-y-3">
              <input type="hidden" name="token" value={token.token} />
              {openSlots.map((s) => (
                <label key={s.id} className="flex items-center gap-3 text-sm">
                  <input type="checkbox" name="slotIds" value={s.id} />
                  <span>
                    {s.slotDate.toLocaleDateString()} &mdash; {s.slotType.replaceAll("_", " ")}
                  </span>
                </label>
              ))}
              <button type="submit" className="btn-primary">Sign up for selected</button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
