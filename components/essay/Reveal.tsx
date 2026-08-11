"use client";

import type { ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";

interface RevealProps {
  children: ReactNode;
  /** Stagger delay in seconds. */
  delay?: number;
  /** Rise distance in px before settling. */
  y?: number;
  className?: string;
}

/**
 * Scroll-triggered fade-and-rise. Fires once when the block enters the
 * viewport. Honors prefers-reduced-motion by rendering statically — no
 * transform, no opacity animation — so motion-sensitive readers get the
 * finished layout immediately (seed §2.5).
 */
export function Reveal({ children, delay = 0, y = 20, className }: RevealProps) {
  const reduce = useReducedMotion();

  if (reduce) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "0px 0px -12% 0px" }}
      transition={{
        duration: 0.6,
        delay,
        ease: [0.16, 1, 0.3, 1],
      }}
    >
      {children}
    </motion.div>
  );
}
