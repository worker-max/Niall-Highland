import { Fraunces, Inter, JetBrains_Mono } from "next/font/google";

/**
 * Self-hosted via next/font/google — fonts are downloaded at build time and
 * served from the same origin (no runtime request to Google). Satisfies the
 * "self-hosted" requirement of seed §2.3 while avoiding manual WOFF wrangling.
 */

export const fraunces = Fraunces({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-fraunces",
  axes: ["opsz", "SOFT"],
  preload: true,
});

export const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
  preload: true,
});

export const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-jetbrains-mono",
  preload: false,
});

export const fontVariables = [
  fraunces.variable,
  inter.variable,
  jetbrainsMono.variable,
].join(" ");
