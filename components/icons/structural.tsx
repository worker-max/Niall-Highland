import { IconSvg, type IconProps } from "./IconSvg";

/**
 * Structural icons — section markers. Each one encodes its section's
 * argument visually, not literally. Shared language:
 *  - orthogonal circuit traces
 *  - one "human element" per icon that breaks the grid (a curve, a nib,
 *    a hand-drawn undulation)
 *  - one "icon-pulse" node per icon (animates when svg[data-active="true"])
 */

/** GapIcon — hero mark. Two tracks converge on one destination node.
 *  Bottom track is hand-drawn (the pre-AI teacher). Top track is a clean
 *  orthogonal circuit (the AI-fluent teacher). They meet at the same
 *  classroom — the hot node on the right. */
export function GapIcon(props: IconProps) {
  return (
    <IconSvg {...props}>
      {/* Upper track: orthogonal circuit */}
      <path d="M6 18 L18 18 L18 28 L34 28 L34 22 L48 22 L48 32" />
      <circle cx={18} cy={18} r={1.75} fill="currentColor" />
      <circle cx={34} cy={28} r={1.75} fill="currentColor" />
      <circle cx={48} cy={22} r={1.75} fill="currentColor" />

      {/* Lower track: the one curve — pre-AI handwriting */}
      <path
        d="M6 46 C 14 42, 18 50, 26 46 S 38 42, 44 46 L 48 42"
        strokeWidth={1.25}
      />

      {/* The gap — three faint verticals on the left */}
      <line x1={10} y1={22} x2={10} y2={42} className="icon-dashed" />
      <line x1={14} y1={24} x2={14} y2={40} className="icon-dashed" />

      {/* Convergence: final trace into the classroom node */}
      <path d="M48 32 L56 32" />
      <circle cx={56} cy={32} r={3.5} className="icon-pulse icon-hot" />
      <circle cx={56} cy={32} r={6} strokeWidth={1} opacity={0.5} />
    </IconSvg>
  );
}

/** FluencyIcon — compounding knowledge. 3 inputs, 3 outputs, one output
 *  loops back as input (the "practice feeds practice" recursion). */
export function FluencyIcon(props: IconProps) {
  return (
    <IconSvg {...props}>
      {/* Center node */}
      <circle cx={32} cy={32} r={3.5} className="icon-pulse icon-hot" />
      <circle cx={32} cy={32} r={7} strokeWidth={1} opacity={0.6} />

      {/* 3 input pins on the left */}
      <line x1={8} y1={18} x2={22} y2={18} />
      <line x1={22} y1={18} x2={25} y2={28} />
      <line x1={8} y1={32} x2={25} y2={32} />
      <line x1={8} y1={46} x2={22} y2={46} />
      <line x1={22} y1={46} x2={25} y2={36} />
      <circle cx={8} cy={18} r={1.5} />
      <circle cx={8} cy={32} r={1.5} />
      <circle cx={8} cy={46} r={1.5} />

      {/* 3 output pins on the right; one loops back */}
      <line x1={39} y1={28} x2={42} y2={18} />
      <line x1={42} y1={18} x2={56} y2={18} />
      <line x1={39} y1={32} x2={56} y2={32} />
      <circle cx={56} cy={18} r={1.5} fill="currentColor" />
      <circle cx={56} cy={32} r={1.5} fill="currentColor" />

      {/* The recursion — bottom output loops up over the top back to the input side */}
      <path d="M39 36 L42 46 L54 46 L54 8 L8 8 L8 14" className="icon-trace" strokeWidth={1} />
    </IconSvg>
  );
}

/** TimelineIcon — career trace. Vertical spine, 5 irregular nodes, top
 *  node hollow and pulsing (current role). Each node has a horizontal
 *  achievement line of varied length to the right. */
export function TimelineIcon(props: IconProps) {
  return (
    <IconSvg {...props}>
      {/* Vertical spine */}
      <line x1={20} y1={6} x2={20} y2={58} />

      {/* Node 1 — current (hollow + pulse) */}
      <circle cx={20} cy={12} r={3.5} className="icon-pulse" fill="none" strokeWidth={1.5} />
      <line x1={24} y1={12} x2={42} y2={12} strokeWidth={1} />

      {/* Node 2 */}
      <circle cx={20} cy={24} r={2.5} fill="currentColor" />
      <line x1={24} y1={24} x2={50} y2={24} strokeWidth={1} />

      {/* Node 3 */}
      <circle cx={20} cy={36} r={2.5} fill="currentColor" />
      <line x1={24} y1={36} x2={36} y2={36} strokeWidth={1} />

      {/* Node 4 */}
      <circle cx={20} cy={46} r={2.5} fill="currentColor" />
      <line x1={24} y1={46} x2={44} y2={46} strokeWidth={1} />

      {/* Node 5 (earliest, small) */}
      <circle cx={20} cy={55} r={1.75} fill="currentColor" />
      <line x1={24} y1={55} x2={32} y2={55} strokeWidth={1} />

      {/* Achievement terminals */}
      <circle cx={42} cy={12} r={1.5} className="icon-hot" />
      <circle cx={50} cy={24} r={1.5} />
      <circle cx={36} cy={36} r={1.5} />
      <circle cx={44} cy={46} r={1.5} />
      <circle cx={32} cy={55} r={1.5} />
    </IconSvg>
  );
}

/** EngageSplitIcon — one input, three diverging tiers, distinct terminals.
 *  Upper = anchor-loop (partnership). Middle = pin (sprint). Lower = soundwave
 *  (keynote). The one curve is the soundwave arc. */
export function EngageSplitIcon(props: IconProps) {
  return (
    <IconSvg {...props}>
      {/* Input */}
      <circle cx={8} cy={32} r={2} fill="currentColor" />
      <line x1={10} y1={32} x2={20} y2={32} />

      {/* Split junction */}
      <circle cx={20} cy={32} r={2} className="icon-hot icon-pulse" />

      {/* Upper: partnership (ring-terminal) */}
      <path d="M20 32 L28 18 L44 18" />
      <circle cx={50} cy={18} r={5} strokeWidth={1.5} />
      <line x1={50} y1={13} x2={50} y2={23} strokeWidth={1} />

      {/* Middle: sprint (pin-terminal with pulse dot) */}
      <line x1={22} y1={32} x2={50} y2={32} />
      <path d="M50 28 L54 32 L50 36 Z" fill="currentColor" />

      {/* Lower: keynote (soundwave — the one curve) */}
      <path d="M20 32 L28 46 L40 46" />
      <path d="M42 46 A 4 4 0 0 1 50 46" strokeWidth={1.25} />
      <path d="M38 50 A 8 8 0 0 1 54 50" strokeWidth={1} opacity={0.55} />
    </IconSvg>
  );
}

/** ContactIcon — envelope built entirely from circuit traces. A "send"
 *  pulse escapes from the upper-right corner in dashed signal form. */
export function ContactIcon(props: IconProps) {
  return (
    <IconSvg {...props}>
      {/* Envelope outline */}
      <rect x={8} y={18} width={44} height={30} strokeWidth={1.5} />
      {/* Fold — drawn as two diagonals meeting at center-top; circuit-style */}
      <path d="M8 18 L30 36 L52 18" />
      <circle cx={30} cy={36} r={2} fill="currentColor" />
      {/* Pin connectors at corners */}
      <circle cx={8} cy={18} r={1.25} />
      <circle cx={52} cy={18} r={1.25} />
      <circle cx={8} cy={48} r={1.25} />
      <circle cx={52} cy={48} r={1.25} />

      {/* Send pulse — signal leaving upper-right */}
      <line x1={52} y1={18} x2={58} y2={12} strokeWidth={1} className="icon-trace" />
      <circle cx={58} cy={12} r={2} className="icon-pulse icon-hot" />
    </IconSvg>
  );
}

/** WritingIcon — pen nib as circuit + ink trails as signal paths.
 *  The nib is a triangle trace with a slit; the ink fans out in 3 dashed paths. */
export function WritingIcon(props: IconProps) {
  return (
    <IconSvg {...props}>
      {/* Nib triangle */}
      <path d="M32 8 L20 44 L44 44 Z" />
      {/* Slit down the middle */}
      <line x1={32} y1={16} x2={32} y2={38} strokeWidth={1} />
      {/* Hot tip node (where ink meets page) */}
      <circle cx={32} cy={44} r={2.25} className="icon-pulse icon-hot" />

      {/* Ink trails (the one curve allowance — handwritten ink). Three diverging */}
      <path
        d="M32 46 C 22 50, 14 52, 10 58"
        strokeWidth={1}
        className="icon-dashed"
        strokeLinecap="round"
      />
      <path
        d="M32 46 C 32 52, 32 56, 32 60"
        strokeWidth={1}
        className="icon-dashed"
      />
      <path
        d="M32 46 C 42 50, 50 52, 54 58"
        strokeWidth={1}
        className="icon-dashed"
      />
    </IconSvg>
  );
}
