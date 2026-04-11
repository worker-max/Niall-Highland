import { prisma } from "@/lib/db";
import { PtoRequestForm } from "@/components/survey/pto-request-form";

export const dynamic = "force-dynamic";

export default async function PtoRequestPage({
  params,
}: {
  params: { token: string };
}) {
  const token = await prisma.surveyToken.findUnique({
    where: { token: params.token },
    include: { clinician: true },
  });

  if (!token || token.consumedAt || token.expiresAt < new Date() || token.purpose !== "PTO_REQUEST") {
    return <InvalidLink />;
  }

  return (
    <div className="min-h-screen bg-cream-50 p-6">
      <div className="mx-auto max-w-xl">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-teal-900">PTO Request</h1>
          <p className="mt-1 text-sm text-ink-600">
            {token.clinician.discipline}-{token.clinician.number}
          </p>
        </div>
        <div className="card">
          <PtoRequestForm token={token.token} />
        </div>
        <p className="mt-4 text-center text-xs text-ink-500">
          No patient information is collected on this form.
        </p>
      </div>
    </div>
  );
}

function InvalidLink() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-cream-50 p-6">
      <div className="card max-w-md text-center">
        <h1 className="text-xl font-semibold text-teal-900">Link unavailable</h1>
        <p className="mt-2 text-sm text-ink-600">
          This request link is invalid, expired, or already used. Please contact your branch director.
        </p>
      </div>
    </div>
  );
}
