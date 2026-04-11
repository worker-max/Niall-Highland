import { CreateOrganization } from "@clerk/nextjs";

export const metadata = { title: "Create your branch" };

export default function OnboardingPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-cream-50 p-6">
      <div className="w-full max-w-md">
        <h1 className="mb-4 text-center text-xl font-semibold text-teal-900">
          Create your branch
        </h1>
        <p className="mb-6 text-center text-sm text-ink-600">
          One branch = one account. You can invite co-workers after setup.
        </p>
        <CreateOrganization afterCreateOrganizationUrl="/dashboard/setup" />
      </div>
    </div>
  );
}
