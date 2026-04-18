"use client";

import { ThemeProvider } from "next-themes";
import type { ReactNode } from "react";

/**
 * Dark-mode-first (seed §2.2). Toggle exposed in chrome; stored in
 * localStorage by next-themes. `attribute="class"` writes .dark / .light on
 * <html>, which our CSS uses to flip semantic role aliases.
 */
export function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="dark"
      enableSystem={false}
      disableTransitionOnChange={false}
    >
      {children}
    </ThemeProvider>
  );
}
