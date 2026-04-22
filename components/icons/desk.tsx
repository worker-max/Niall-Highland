import { IconSvg, type IconProps } from "./IconSvg";

/**
 * DeskIcon — Niall’s Desk mark. A desk surface (horizontal trace) with
 * a stacked paper sheet, a signal node ("send" indicator), and a return
 * connector that loops back. The organic element is the top-right corner
 * curve on the paper sheet, suggesting a physical page rather than a pure
 * circuit.
 */
export function DeskIcon(props: IconProps) {
  return (
    <IconSvg {...props}>
      {/* Desk surface */}
      <line x1={6} y1={46} x2={58} y2={46} strokeWidth={1.5} />
      <circle cx={6} cy={46} r={1.5} fill="currentColor" />
      <circle cx={58} cy={46} r={1.5} fill="currentColor" />

      {/* Desk leg traces (pin connectors) */}
      <line x1={14} y1={46} x2={14} y2={56} strokeWidth={1} />
      <line x1={50} y1={46} x2={50} y2={56} strokeWidth={1} />

      {/* Paper sheet with dog-eared corner (the one curve) */}
      <path d="M20 14 L42 14 C 44 14, 46 16, 46 18 L46 42 L20 42 Z" strokeWidth={1.5} />
      <path d="M42 14 L46 18" strokeWidth={1} />

      {/* Paper content: three short lines */}
      <line x1={24} y1={22} x2={40} y2={22} strokeWidth={1} opacity={0.7} />
      <line x1={24} y1={28} x2={42} y2={28} strokeWidth={1} opacity={0.7} />
      <line x1={24} y1={34} x2={36} y2={34} strokeWidth={1} opacity={0.7} />

      {/* Send signal node */}
      <circle cx={52} cy={20} r={2.5} className="icon-pulse icon-hot" />
      <path d="M46 18 L52 20" strokeWidth={1} className="icon-trace" />

      {/* Return connector loop */}
      <path d="M14 34 L10 34 L10 52 L22 52" strokeWidth={1} opacity={0.55} />
    </IconSvg>
  );
}
