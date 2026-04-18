import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { Providers } from "./providers";
import { Nav } from "@/components/chrome/Nav";
import { Footer } from "@/components/chrome/Footer";
import { AnalyticsInit } from "@/components/chrome/AnalyticsInit";
import { fontVariables } from "@/lib/fonts";
import "../styles/globals.css";

export const metadata: Metadata = {
  title: {
    default: "Niall Highland \u2014 AI strategy for international schools",
    template: "%s \u00b7 Niall Highland",
  },
  description:
    "Teachers aren't being replaced by AI. They're being replaced by teachers who use it. Niall Highland helps international schools build AI fluency across faculty, curriculum, and leadership.",
  metadataBase: new URL("https://niallhighland.com"),
  openGraph: {
    title: "Niall Highland \u2014 AI strategy for international schools",
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
        <Providers>
          <AnalyticsInit />
          <Nav />
          <main id="main" className="relative">
            {children}
          </main>
          <Footer
            email="hello@niallhighland.com"
            calendlyUrl={process.env.NEXT_PUBLIC_CALENDLY_URL}
            linkedInUrl="https://www.linkedin.com/in/niall-highland"
          />
        </Providers>
      </body>
    </html>
  );
}
