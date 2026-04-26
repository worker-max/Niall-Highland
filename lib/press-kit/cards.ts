/**
 * Five business-card variants for the press kit. Different moods, same
 * design family. The same definitions drive both the printable HTML
 * page and the digital PNG generated via next/og.
 */

export type CardSurface = "ink" | "paper" | "accent" | "accentDark" | "raised";
export type CardLayout = "standard" | "demo" | "split";
export type CardIconKey =
  | "gap"
  | "fluency"
  | "anchor"
  | "keynote"
  | "amplified"
  | "other-teacher";

export interface CardVariant {
  id: string;
  mood: string;
  surface: CardSurface;
  layout: CardLayout;
  icon: CardIconKey;
  eyebrow: string;
  title: string;
  role: string;
  contacts: ReadonlyArray<string>;
}

const COMMON_CONTACTS = [
  "niallhighland.com",
  "hello@niallhighland.com",
  "in/niall-highland",
] as const;

export const CARDS: ReadonlyArray<CardVariant> = [
  {
    id: "primary-ink",
    mood: "Editorial · Authoritative",
    surface: "ink",
    layout: "standard",
    icon: "gap",
    eyebrow: "AI strategy · International schools",
    title: "Niall Highland",
    role: "Associate Principal · International School of Krakow",
    contacts: [...COMMON_CONTACTS],
  },
  {
    id: "consultant-paper",
    mood: "Editorial · Inviting",
    surface: "paper",
    layout: "standard",
    icon: "fluency",
    eyebrow: "Faculty fluency programs",
    title: "Niall Highland",
    role: "Consultant — AI in international schools",
    contacts: [...COMMON_CONTACTS.slice(0, 2)],
  },
  {
    id: "keynote-accent",
    mood: "Confident · Conference",
    surface: "accent",
    layout: "demo",
    icon: "keynote",
    eyebrow: "Keynotes · INSET · Board sessions",
    title: "On AI, teaching, and the job we’re actually doing now",
    role: "Niall Highland",
    contacts: ["niallhighland.com/engage/keynote", "hello@niallhighland.com"],
  },
  {
    id: "anchor-raised",
    mood: "Premium · Partnership",
    surface: "raised",
    layout: "split",
    icon: "anchor",
    eyebrow: "School-wide partnership",
    title: "Six to eighteen months. One integrated program.",
    role: "Niall Highland · niallhighland.com/engage/partnership",
    contacts: [],
  },
  {
    id: "amplified-deep",
    mood: "Provocative · Quote-led",
    surface: "accentDark",
    layout: "split",
    icon: "amplified",
    eyebrow: "The thesis",
    title: "Teachers aren’t being replaced by AI. They’re being replaced by teachers who use it.",
    role: "Niall Highland · niallhighland.com",
    contacts: [],
  },
];

export function getCard(id: string): CardVariant | undefined {
  return CARDS.find((c) => c.id === id);
}
