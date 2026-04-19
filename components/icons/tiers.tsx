import { IconSvg, type IconProps } from "./IconSvg";

/**
 * Tier icons for EngagementCard. Anchor for partnership (heaviest,
 * highest commitment), Sprint for bolt (fast, directed), Keynote for
 * podium + soundwave (single radiating event).
 */

/** AnchorTierIcon — tier 1. An anchor literally rendered as a circuit.
 *  Ring at top is a diamond (rotated square) for engineered feel.
 *  Crossbar has pin nodes. Bottom hooks are short trace flicks.
 *  The one curve: the anchor-shank terminates in two gentle flukes. */
export function AnchorTierIcon(props: IconProps) {
  return (
    <IconSvg {...props}>
      {/* Top ring — diamond */}
      <path d="M32 6 L38 12 L32 18 L26 12 Z" />
      <circle cx={32} cy={12} r={1.25} fill="currentColor" />

      {/* Shank */}
      <line x1={32} y1={18} x2={32} y2={48} />

      {/* Crossbar */}
      <line x1={14} y1={24} x2={50} y2={24} />
      <circle cx={14} cy={24} r={1.75} fill="currentColor" />
      <circle cx={50} cy={24} r={1.75} fill="currentColor" />

      {/* Flukes — the one curve. Two symmetric arcs from shank tip out and up. */}
      <path
        d="M32 48 C 26 54, 18 52, 14 44"
        strokeWidth={1.5}
      />
      <path
        d="M32 48 C 38 54, 46 52, 50 44"
        strokeWidth={1.5}
      />

      {/* Hot node at the bottom of the shank — "engagement signal sent" */}
      <circle cx={32} cy={48} r={2.25} className="icon-pulse icon-hot" />
    </IconSvg>
  );
}

/** SprintTierIcon — tier 2. Lightning bolt as two angled traces joined
 *  at a node. Dashed afterglow trails to show speed. Second node at the
 *  tip is hot. */
export function SprintTierIcon(props: IconProps) {
  return (
    <IconSvg {...props}>
      {/* Main bolt */}
      <path d="M40 6 L22 30 L34 30 L20 56" strokeWidth={2} />

      {/* Node at the junction */}
      <circle cx={22} cy={30} r={2} fill="currentColor" />
      <circle cx={34} cy={30} r={2} fill="currentColor" />

      {/* Hot tip */}
      <circle cx={20} cy={56} r={2.5} className="icon-pulse icon-hot" />

      {/* Afterglow — fainter parallel bolt offset 4px right */}
      <path
        d="M44 6 L26 30 L38 30 L24 56"
        strokeWidth={1}
        strokeDasharray="2 3"
        opacity={0.45}
      />
    </IconSvg>
  );
}

/** KeynoteTierIcon — tier 3. Podium as stepped trace; mic as a vertical
 *  pin with a node; three concentric soundwave arcs (the one curve
 *  allowance) emanate from the mic. */
export function KeynoteTierIcon(props: IconProps) {
  return (
    <IconSvg {...props}>
      {/* Podium — three steps */}
      <path d="M12 52 L12 44 L24 44 L24 38 L40 38 L40 44 L52 44 L52 52 Z" />

      {/* Mic stem */}
      <line x1={32} y1={38} x2={32} y2={28} />
      {/* Mic head */}
      <rect x={28} y={20} width={8} height={10} rx={2} strokeWidth={1.5} />
      <line x1={28} y1={26} x2={36} y2={26} strokeWidth={1} opacity={0.6} />

      {/* Soundwaves — the one curve */}
      <path d="M20 18 A 16 16 0 0 1 44 18" strokeWidth={1.25} opacity={0.85} />
      <path d="M16 12 A 22 22 0 0 1 48 12" strokeWidth={1} opacity={0.5} strokeDasharray="3 3" />

      {/* Hot node in the mic (signal being broadcast) */}
      <circle cx={32} cy={25} r={1.75} className="icon-pulse icon-hot" />
    </IconSvg>
  );
}
