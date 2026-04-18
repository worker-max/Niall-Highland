import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { Providers } from "./providers";
import { fontVariables } from "@/lib/fonts";
import "../styles/globals.css";

export const metadata: Metadata = {
  title: {
    default: "Niall Highland — AI strategy for international schools",
    template: "%s · Niall Highland",
  },
  description:
    "Teachers aren't being replaced by AI. They're being replaced by teachers who use it. Niall Highland helps international schools build AI fluency across faculty, curriculum, and leadership.",
  metadataBase: new URL("https://niallhighland.com"),
  openGraph: {
    title: "Niall Highland — AI strategy for international schools",
    description:
      "Teachers aren't being replaced by AI. They're being replaced by teachers who use it.",
    url: "https://niallhighland.com",
    siteName: "Niall Highland",
    locale: "en_GB",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#0B0D0E" },
    { media: "(prefers-color-scheme: light)", color: "#F4EFE7" },
  ],
  colorScheme: "dark light",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className={fontVariables}>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
