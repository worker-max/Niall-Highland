import type { Metadata } from "next";
import { isAuthorized, configuredPasscode } from "@/lib/desk/auth";
import { EditorialSection } from "@/components/primitives/EditorialSection";
import { PasscodeGate } from "./PasscodeGate";
import { DeskClient } from "./DeskClient";

export const metadata: Metadata = {
  title: "Niall’s Desk",
  description:
    "A private workspace for Niall to drop notes, upload files, and submit structured updates for the site owner to edit in.",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

/**
 * /desk — passcode-gated workspace. Server component reads the session
 * cookie and decides which surface to render. When NIALL_DESK_PASSCODE
 * isn’t configured, the page renders a setup notice instead of letting
 * anyone through.
 */
export default async function DeskPage() {
  if (!configuredPasscode()) {
    return (
      <EditorialSection
        container="reading"
        padding="spacious"
        eyebrow="Niall’s Desk"
        className="pt-[var(--space-32)]"
      >
        <h1 className="font-display text-[length:var(--text-h1)] leading-[1.1] tracking-[-0.02em]">
          Not configured yet.
        </h1>
        <p className="mt-[var(--space-4)] text-[length:var(--text-body)] leading-[var(--leading-body)] text-[color:var(--text-muted)]">
          The site owner needs to set <code className="font-mono text-[var(--text-small)]">NIALL_DESK_PASSCODE</code>{" "}
          in the deployment environment before this workspace opens. Once
          it&rsquo;s set, refresh this page.
        </p>
      </EditorialSection>
    );
  }

  const authed = await isAuthorized();
  return authed ? <DeskClient /> : <PasscodeGate />;
}
