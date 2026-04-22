/**
 * Custom icon family. Circuit-trace visual language — each icon is a
 * hand-authored SVG encoding the section/concept it marks. See
 * IconSvg for the shared primitive; globals.css for animations.
 */

export { IconSvg, type IconProps } from "./IconSvg";
export { NHMonogram } from "./monogram";
export { DeskIcon } from "./desk";

// Structural / section icons
export {
  GapIcon,
  FluencyIcon,
  TimelineIcon,
  EngageSplitIcon,
  ContactIcon,
  WritingIcon,
} from "./structural";

// Demo icons
export {
  OtherTeacherIcon,
  LessonPlanIcon,
  CurriculumAuditIcon,
  PrincipalsInboxIcon,
  TalkExplorerIcon,
} from "./demos";

// Engagement tier icons
export {
  AnchorTierIcon,
  SprintTierIcon,
  KeynoteTierIcon,
} from "./tiers";

// Concept icons
export {
  AIProofIcon,
  AIVulnerableIcon,
  AIAmplifiedIcon,
  FluencyGapIcon,
} from "./concepts";
