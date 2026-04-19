import { IconSvg, type IconProps } from "./IconSvg";

/**
 * Demo icons — one per P-demo. Each encodes the demo's core mechanic
 * (a race, a branching plan, a three-bucket audit, a choice inbox,
 *  a threaded query) so the icon previews what the demo does.
 */

/** P1 OtherTeacherIcon — two race lanes sharing a finish. Top lane
 *  dense/solid (AI-assisted, near the finish); bottom lane sparse/dashed
 *  (by-hand, still mid-race). Flag at the finish. */
export function OtherTeacherIcon(props: IconProps) {
  return (
    <IconSvg {...props}>
      {/* Top lane — AI teacher, dense */}
      <line x1={6} y1={22} x2={52} y2={22} />
      {[10, 18, 26, 34, 42, 50].map((x) => (
        <circle key={`t-${x}`} cx={x} cy={22} r={1.5} fill="currentColor" />
      ))}
      <circle cx={50} cy={22} r={2.5} className="icon-pulse icon-hot" />

      {/* Bottom lane — hand-planned, sparse dashed */}
      <line
        x1={6}
        y1={42}
        x2={52}
        y2={42}
        strokeDasharray="3 4"
        strokeWidth={1.25}
        opacity={0.7}
      />
      <circle cx={10} cy={42} r={1.5} opacity={0.7} />
      <circle cx={22} cy={42} r={1.5} opacity={0.7} />

      {/* Finish flagpole at shared x=56 */}
      <line x1={56} y1={10} x2={56} y2={54} strokeWidth={1.5} />
      <path d="M56 10 L62 13 L56 16 Z" fill="currentColor" stroke="none" />
    </IconSvg>
  );
}

/** P2 LessonPlanIcon — objective splits into structured outputs.
 *  Three rows, three leaves each, one leaf in the top row is the hot node. */
export function LessonPlanIcon(props: IconProps) {
  return (
    <IconSvg {...props}>
      {/* Input */}
      <circle cx={8} cy={32} r={2} fill="currentColor" />
      <line x1={10} y1={32} x2={22} y2={32} />
      <circle cx={22} cy={32} r={2} />

      {/* Split up/straight/down */}
      <path d="M22 32 L22 18 L32 18" />
      <line x1={22} y1={32} x2={32} y2={32} />
      <path d="M22 32 L22 46 L32 46" />

      {/* Row 1 — three leaves */}
      <line x1={32} y1={18} x2={56} y2={18} strokeWidth={1} />
      {[38, 46, 54].map((x, i) => (
        <circle
          key={`r1-${x}`}
          cx={x}
          cy={18}
          r={i === 1 ? 2.5 : 1.5}
          fill="currentColor"
          className={i === 1 ? "icon-pulse icon-hot" : undefined}
        />
      ))}

      {/* Row 2 */}
      <line x1={32} y1={32} x2={56} y2={32} strokeWidth={1} />
      {[38, 46, 54].map((x) => (
        <circle key={`r2-${x}`} cx={x} cy={32} r={1.5} />
      ))}

      {/* Row 3 */}
      <line x1={32} y1={46} x2={56} y2={46} strokeWidth={1} />
      {[38, 46, 54].map((x) => (
        <circle key={`r3-${x}`} cx={x} cy={46} r={1.5} />
      ))}
    </IconSvg>
  );
}

/** P3 CurriculumAuditIcon — 3 columns, each bucket rendered with its
 *  distinct terminal language. Proof column = shields. Vulnerable = gaps.
 *  Amplified = radiating rings. Cell grid left faint. */
export function CurriculumAuditIcon(props: IconProps) {
  return (
    <IconSvg {...props}>
      {/* Faint cell grid */}
      <g opacity={0.35} strokeWidth={1}>
        <line x1={6} y1={16} x2={58} y2={16} />
        <line x1={6} y1={32} x2={58} y2={32} />
        <line x1={6} y1={48} x2={58} y2={48} />
        <line x1={23} y1={8} x2={23} y2={56} />
        <line x1={41} y1={8} x2={41} y2={56} />
      </g>

      {/* Column 1 — AI-Proof (shield markers) */}
      <g stroke="currentColor">
        <path d="M10 12 L19 12 L19 18 L14.5 22 L10 18 Z" strokeWidth={1.25} />
        <path d="M10 36 L19 36 L19 42 L14.5 46 L10 42 Z" strokeWidth={1.25} />
      </g>

      {/* Column 2 — AI-Vulnerable (broken traces) */}
      <g strokeWidth={1.25}>
        <line x1={26} y1={20} x2={30} y2={20} />
        <line x1={34} y1={20} x2={38} y2={20} strokeDasharray="2 2" opacity={0.6} />
        <line x1={26} y1={40} x2={32} y2={40} />
        <line x1={36} y1={40} x2={38} y2={40} strokeDasharray="2 2" opacity={0.6} />
      </g>

      {/* Column 3 — AI-Amplified (concentric rings; the hot column) */}
      <g strokeWidth={1.25}>
        <circle cx={50} cy={20} r={2} fill="currentColor" className="icon-pulse icon-hot" />
        <circle cx={50} cy={20} r={5} opacity={0.7} />
        <circle cx={50} cy={20} r={8} opacity={0.35} />
        <circle cx={50} cy={40} r={2} fill="currentColor" />
        <circle cx={50} cy={40} r={5} opacity={0.7} />
      </g>
    </IconSvg>
  );
}

/** P4 PrincipalsInboxIcon — three stacked "cards" (messages), top card
 *  shows three response options with the middle (Niall's response)
 *  haloed + active. */
export function PrincipalsInboxIcon(props: IconProps) {
  return (
    <IconSvg {...props}>
      {/* Card stack — bottom to top */}
      <rect x={14} y={36} width={40} height={16} strokeWidth={1.25} opacity={0.45} />
      <rect x={10} y={26} width={40} height={16} strokeWidth={1.25} opacity={0.7} />
      <rect x={6} y={14} width={44} height={20} strokeWidth={1.5} fill="var(--surface)" />

      {/* Top-card content — three option markers */}
      <circle cx={16} cy={24} r={2} />
      <circle cx={28} cy={24} r={2.75} className="icon-pulse icon-hot" />
      <circle cx={28} cy={24} r={5.5} strokeWidth={1} opacity={0.5} />
      <path d="M37 22 L43 24 L37 26 Z" fill="currentColor" />

      {/* Subject line (circuit-style) */}
      <line x1={12} y1={30} x2={30} y2={30} strokeWidth={1} opacity={0.6} />
    </IconSvg>
  );
}

/** P5 TalkExplorerIcon — constellation of talk-nodes connected by a
 *  threaded query path. One node hot. Dashed alternates hint at other
 *  possible paths (the retrieval). */
export function TalkExplorerIcon(props: IconProps) {
  // Seven constellation points
  const pts: [number, number][] = [
    [12, 14],
    [24, 24],
    [40, 12],
    [52, 22],
    [32, 38],
    [48, 46],
    [16, 50],
  ];
  return (
    <IconSvg {...props}>
      {/* Query path (main thread) */}
      <path
        d={`M${pts[0][0]} ${pts[0][1]} L${pts[1][0]} ${pts[1][1]} L${pts[4][0]} ${pts[4][1]} L${pts[5][0]} ${pts[5][1]}`}
        strokeWidth={1.5}
      />
      {/* Dashed possible paths */}
      <path
        d={`M${pts[1][0]} ${pts[1][1]} L${pts[2][0]} ${pts[2][1]} L${pts[3][0]} ${pts[3][1]}`}
        strokeWidth={1}
        strokeDasharray="2 3"
        opacity={0.55}
      />
      <path
        d={`M${pts[4][0]} ${pts[4][1]} L${pts[6][0]} ${pts[6][1]}`}
        strokeWidth={1}
        strokeDasharray="2 3"
        opacity={0.55}
      />

      {/* Nodes */}
      {pts.map(([x, y], i) => (
        <circle
          key={`${x}-${y}`}
          cx={x}
          cy={y}
          r={i === 4 ? 2.75 : 1.75}
          fill={i === 4 ? "currentColor" : undefined}
          className={i === 4 ? "icon-pulse icon-hot" : undefined}
        />
      ))}
      {/* Halo around the hot node */}
      <circle cx={32} cy={38} r={6} strokeWidth={1} opacity={0.45} />
    </IconSvg>
  );
}
