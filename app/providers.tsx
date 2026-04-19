"use client";

import { ThemeProvider } from "next-themes";
import type { ReactNode } from "react";

/**
 * Light-mode default (owner directive, supersedes seed §2.2 default). Dark
 * mode remains a first-class option via the toggle in chrome; design tokens
 * are designed to invert cleanly. `attribute="class"` writes .dark / .light
 * on <html>, which our CSS uses to flip semantic role aliases.
 */
export function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="light"
      enableSystem={false}
      disableTransitionOnChange={false}
    >
      {children}
    </ThemeProvider>
  );
}
