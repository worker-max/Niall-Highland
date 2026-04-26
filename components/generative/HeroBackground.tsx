"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/cn";

/**
 * Knowledge graph particles — seed §2.7 hero treatment. Slow-drifting
 * nodes with proximity-based edges, 8% opacity over the parent surface.
 * Pure canvas (no p5.js dep), 60fps target, pauses when document hidden,
 * respects prefers-reduced-motion (renders a single static frame).
 *
 * Usage: drop inside a position:relative parent. The canvas is
 * absolute-positioned, pointer-events-none, and inherits the parent
 * text color via currentColor — set className="text-[color:var(--accent)]"
 * to tint the graph.
 */
interface HeroBackgroundProps {
  className?: string;
  /** Density of nodes per million pixels of canvas area. */
  density?: number;
  /** Max distance (px) at which an edge is drawn. */
  maxDist?: number;
}

export function HeroBackground({
  className,
  density = 80,
  maxDist = 160,
}: HeroBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvasEl = canvasRef.current;
    if (!canvasEl) return;
    const ctxLocal = canvasEl.getContext("2d");
    if (!ctxLocal) return;

    // Re-bind to non-null locals so inner closures keep the narrowing.
    const canvas: HTMLCanvasElement = canvasEl;
    const ctx: CanvasRenderingContext2D = ctxLocal;

    const reduced =
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    type Node = { x: number; y: number; vx: number; vy: number; r: number };
    let nodes: Node[] = [];
    let w = 0;
    let h = 0;
    let raf = 0;
    let running = true;

    const spawn = () => {
      const rect = canvas.parentElement?.getBoundingClientRect();
      w = rect?.width ?? canvas.clientWidth;
      h = rect?.height ?? canvas.clientHeight;
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const count = Math.max(20, Math.min(110, Math.round((w * h) / 1_000_000 * density)));
      nodes = Array.from({ length: count }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.18,
        vy: (Math.random() - 0.5) * 0.18,
        r: 0.6 + Math.random() * 0.9,
      }));
    };

    const step = () => {
      if (!running) return;
      ctx.clearRect(0, 0, w, h);

      if (!reduced) {
        for (const n of nodes) {
          n.x += n.vx;
          n.y += n.vy;
          if (n.x < -10) n.x = w + 10;
          if (n.x > w + 10) n.x = -10;
          if (n.y < -10) n.y = h + 10;
          if (n.y > h + 10) n.y = -10;
        }
      }

      const max2 = maxDist * maxDist;
      ctx.lineWidth = 0.6;
      for (let i = 0; i < nodes.length; i++) {
        const a = nodes[i]!;
        for (let j = i + 1; j < nodes.length; j++) {
          const b = nodes[j]!;
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const d2 = dx * dx + dy * dy;
          if (d2 < max2) {
            const alpha = (1 - d2 / max2) * 0.55;
            ctx.strokeStyle = "currentColor";
            ctx.globalAlpha = alpha;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      }

      ctx.globalAlpha = 0.7;
      ctx.fillStyle = "currentColor";
      for (const n of nodes) {
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.globalAlpha = 1;
      raf = requestAnimationFrame(step);
    };

    spawn();
    step();

    const onResize = () => {
      cancelAnimationFrame(raf);
      spawn();
      step();
    };
    const onVisibility = () => {
      if (document.hidden) {
        running = false;
        cancelAnimationFrame(raf);
      } else if (!running) {
        running = true;
        step();
      }
    };

    window.addEventListener("resize", onResize, { passive: true });
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      running = false;
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [density, maxDist]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className={cn(
        "pointer-events-none absolute inset-0 -z-10",
        "opacity-[0.085] mix-blend-normal",
        className,
      )}
    />
  );
}
