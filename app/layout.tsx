import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? "https://homehealthtools.com"),
  title: {
    default: "HomeHealthTools — Workforce & Territory Tools for Home Health Branch Directors",
    template: "%s | HomeHealthTools",
  },
  description:
    "Independent SaaS for home health branch directors: heat-map your admissions, build equitable territories, manage PTO against school calendars, and run on-call coverage without the whiteboard.",
  keywords: [
    "home health",
    "branch director",
    "territory management",
    "PTO scheduler",
    "on-call coverage",
    "admissions heat map",
  ],
  openGraph: {
    title: "HomeHealthTools",
    description:
      "Tools that should have existed years ago for home health branch directors. No PHI. No fluff.",
    url: "https://homehealthtools.com",
    siteName: "HomeHealthTools",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="en" className={inter.variable}>
        <body className="min-h-screen font-sans antialiased">{children}</body>
      </html>
    </ClerkProvider>
  );
}
