import { IconSvg, type IconProps } from "./IconSvg";

/**
 * Concept icons — the three audit buckets and the fluency-gap mark.
 * Used inline in curriculum-audit output, engage copy, essays. Shared
 * language carries through from the structural family.
 */

/** AIProofIcon — shield with a human silhouette inside, rendered as
 *  connected circuit nodes. Human presence is the irreducible element. */
export function AIProofIcon(props: IconProps) {
  return (
    <IconSvg {...props}>
      {/* Shield outline */}
      <path d="M32 6 L52 14 L52 32 C 52 44, 42 52, 32 56 C 22 52, 12 44, 12 32 L12 14 Z" />

      {/* Internal serif "H" — suggests 'human' without being literal */}
      <line x1={24} y1={20} x2={24} y2={40} strokeWidth={1.5} />
      <line x1={40} y1={20} x2={40} y2={40} strokeWidth={1.5} />
      <line x1={24} y1={30} x2={40} y2={30} strokeWidth={1.5} />

      {/* Defense nodes on the shield rim */}
      <circle cx={32} cy={6} r={2} fill="currentColor" />
      <circle cx={52} cy={14} r={1.5} fill="currentColor" />
      <circle cx={12} cy={14} r={1.5} fill="currentColor" />
      {/* Hot node at the shield's apex — signals the human-centered core */}
      <circle cx={32} cy={30} r={2.25} className="icon-pulse icon-hot" />
    </IconSvg>
  );
}

/** AIVulnerableIcon — broken circuit: a trace with a visible gap,
 *  warning pins above the gap pointing inward. The gap is the point. */
export function AIVulnerableIcon(props: IconProps) {
  return (
    <IconSvg {...props}>
      {/* Left trace */}
      <line x1={6} y1={32} x2={24} y2={32} />
      <circle cx={6} cy={32} r={1.5} fill="currentColor" />
      <circle cx={24} cy={32} r={2.5} strokeWidth={1.5} /> {/* hollow endpoint */}

      {/* Right trace */}
      <line x1={40} y1={32} x2={58} y2={32} />
      <circle cx={40} cy={32} r={2.5} strokeWidth={1.5} />
      <circle cx={58} cy={32} r={1.5} fill="currentColor" />

      {/* Faint dashed "what should be here" */}
      <line x1={26} y1={32} x2={38} y2={32} strokeDasharray="2 3" opacity={0.4} />

      {/* Warning pins pointing at the gap */}
      <path d="M28 24 L32 22 L30 24" fill="currentColor" stroke="currentColor" />
      <path d="M36 24 L32 22 L34 24" fill="currentColor" stroke="currentColor" />

      {/* Pulsing warning glyph above gap */}
      <circle cx={32} cy={14} r={2.5} className="icon-pulse icon-hot" />
      <line x1={32} y1={16} x2={32} y2={22} strokeWidth={1} opacity={0.55} />
    </IconSvg>
  );
}

/** AIAmplifiedIcon — concentric amplification rings from a central node.
 *  Each ring has a pulse tick at a different angle, echoing SDR/broadcast
 *  imagery. One diagonal input trace from outside to center. */
export function AIAmplifiedIcon(props: IconProps) {
  return (
    <IconSvg {...props}>
      {/* Center hot node */}
      <circle cx={32} cy={32} r={3} className="icon-pulse icon-hot" />

      {/* Three concentric rings */}
      <circle cx={32} cy={32} r={8} strokeWidth={1.5} />
      <circle cx={32} cy={32} r={16} strokeWidth={1.25} opacity={0.7} />
      <circle cx={32} cy={32} r={24} strokeWidth={1} opacity={0.45} strokeDasharray="3 3" />

      {/* Pulse ticks on each ring at varied angles */}
      {/* inner ring tick at 60 degrees */}
      <line x1={32 + 8 * Math.cos(-Math.PI / 3)} y1={32 + 8 * Math.sin(-Math.PI / 3)} x2={32 + 12 * Math.cos(-Math.PI / 3)} y2={32 + 12 * Math.sin(-Math.PI / 3)} strokeWidth={1.25} />
      {/* middle ring tick at 180 degrees */}
      <line x1={32 - 16} y1={32} x2={32 - 20} y2={32} strokeWidth={1.25} />
      {/* outer ring tick at 300 degrees */}
      <line x1={32 + 24 * Math.cos(Math.PI / 3)} y1={32 + 24 * Math.sin(Math.PI / 3)} x2={32 + 28 * Math.cos(Math.PI / 3)} y2={32 + 28 * Math.sin(Math.PI / 3)} strokeWidth={1.25} />

      {/* Input trace from upper-left corner to center */}
      <path d="M6 8 L14 16 L22 24" strokeWidth={1} className="icon-trace" />
      <circle cx={6} cy={8} r={1.5} fill="currentColor" />
    </IconSvg>
  );
}

/** FluencyGapIcon — two circuits side by side. Left sparse (3 nodes),
 *  right dense (9 nodes in a 3x3). A diagonal score line divides them. */
export function FluencyGapIcon(props: IconProps) {
  return (
    <IconSvg {...props}>
      {/* Left circuit — sparse */}
      <circle cx={10} cy={20} r={1.75} fill="currentColor" opacity={0.7} />
      <circle cx={20} cy={32} r={1.75} fill="currentColor" opacity={0.7} />
      <circle cx={10} cy={44} r={1.75} fill="currentColor" opacity={0.7} />
      <line x1={10} y1={20} x2={20} y2={32} strokeWidth={1} opacity={0.55} />
      <line x1={10} y1={44} x2={20} y2={32} strokeWidth={1} opacity={0.55} />

      {/* Right circuit — dense 3x3 grid */}
      {[38, 48, 58].map((x) =>
        [16, 32, 48].map((y) => (
          <circle key={`${x}-${y}`} cx={x} cy={y} r={1.5} fill="currentColor" />
        )),
      )}
      {/* Horizontal connects */}
      {[16, 32, 48].map((y) => (
        <line key={`h-${y}`} x1={38} y1={y} x2={58} y2={y} strokeWidth={1} />
      ))}
      {/* Vertical connects */}
      {[38, 48, 58].map((x) => (
        <line key={`v-${x}`} x1={x} y1={16} x2={x} y2={48} strokeWidth={1} />
      ))}

      {/* Hot pulsing node in dense grid center */}
      <circle cx={48} cy={32} r={2.5} className="icon-pulse icon-hot" />

      {/* Diagonal score line — the gap */}
      <line x1={30} y1={6} x2={34} y2={58} strokeWidth={1.5} className="icon-dashed" />
    </IconSvg>
  );
}
