import type { SVGProps } from "react";
import { cn } from "@/lib/cn";

interface MonogramProps extends Omit<SVGProps<SVGSVGElement>, "children"> {
  size?: number | string;
  className?: string;
}

/**
 * NH Monogram. Stylized N and H where the crossbar of the H continues
 * into a right-pointing pin — a circuit node that reads as forward
 * motion. Scales cleanly from 20px (nav) to 96px (hero mark).
 * No pulse — a logomark should not animate.
 */
export function NHMonogram({ size = 24, className, ...rest }: MonogramProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 48 24"
      width={size}
      height={(typeof size === "number" ? size / 2 : undefined)}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      role="img"
      aria-label="Niall Highland"
      className={cn("inline-block shrink-0", className)}
      {...rest}
    >
      {/* N: vertical | diagonal | vertical */}
      <line x1={3} y1={4} x2={3} y2={20} />
      <line x1={3} y1={4} x2={15} y2={20} />
      <line x1={15} y1={4} x2={15} y2={20} />

      {/* H: two verticals + crossbar continuing into pin */}
      <line x1={24} y1={4} x2={24} y2={20} />
      <line x1={36} y1={4} x2={36} y2={20} />
      <line x1={24} y1={12} x2={40} y2={12} />

      {/* Forward pin at the end of the crossbar */}
      <path d="M40 12 L43 10 L43 14 Z" fill="currentColor" stroke="currentColor" />

      {/* Connection node at the N/H junction */}
      <circle cx={19.5} cy={12} r={1.25} fill="currentColor" />
    </svg>
  );
}
