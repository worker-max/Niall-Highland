import type { ReactElement } from "react";
import {
  AnchorTierIcon,
  SprintTierIcon,
  KeynoteTierIcon,
} from "@/components/icons";
import type { EngagementTier } from "@/lib/engagement-tiers";

/** Map a tier id to its custom icon. Server component-safe, no hooks. */
export function tierIcon(id: EngagementTier["id"], size = 56): ReactElement {
  switch (id) {
    case "partnership":
      return <AnchorTierIcon size={size} />;
    case "sprint":
      return <SprintTierIcon size={size} />;
    case "keynote":
      return <KeynoteTierIcon size={size} />;
  }
}
