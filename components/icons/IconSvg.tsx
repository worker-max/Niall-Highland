import type { SVGProps } from "react";
import { cn } from "@/lib/cn";

export interface IconProps extends Omit<SVGProps<SVGSVGElement>, "children"> {
  /** Pixel size. Defaults to 1em so icons scale with surrounding type. */
  size?: number | string;
  /**
   * When true, nodes marked with className="icon-pulse" animate a slow
   * opacity pulse. Respects prefers-reduced-motion via globals.css.
   */
  active?: boolean;
  /** Accessible label. Omit for purely decorative icons (aria-hidden). */
  label?: string;
  className?: string;
}

interface BaseProps extends IconProps {
  children: React.ReactNode;
}

/**
 * Shared SVG wrapper for the custom icon family. Consistent viewBox,
 * stroke defaults, and accessible labeling so each icon component stays
 * focused on the geometry.
 */
export function IconSvg({
  size = "1em",
  active = false,
  label,
  className,
  children,
  ...rest
}: BaseProps) {
  const decorative = !label;
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 64 64"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      role={decorative ? "presentation" : "img"}
      aria-hidden={decorative ? true : undefined}
      aria-label={label}
      data-active={active ? true : undefined}
      className={cn("inline-block shrink-0", className)}
      {...rest}
    >
      {children}
    </svg>
  );
}
