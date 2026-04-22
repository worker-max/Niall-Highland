/**
 * Structured capture card shapes. Owner receives these in the notification
 * email so updates are already slotted against known site sections.
 */

export type CaptureKind =
  | "whiteboard"
  | "new-talk"
  | "new-essay"
  | "copy-correction"
  | "credentials"
  | "voice-note";

export interface CaptureCardDefinition {
  kind: CaptureKind;
  label: string;
  blurb: string;
  fields: ReadonlyArray<CaptureField>;
}

export interface CaptureField {
  name: string;
  label: string;
  placeholder?: string;
  rows?: number;
  required?: boolean;
}

export const CAPTURE_CARDS: ReadonlyArray<CaptureCardDefinition> = [
  {
    kind: "new-talk",
    label: "New talk I gave",
    blurb: "Conference, INSET, board session — anything worth adding to the talks archive.",
    fields: [
      { name: "title", label: "Talk title", placeholder: "e.g. Teaching With, Not Against", required: true },
      { name: "venue", label: "Venue", placeholder: "ECIS Leadership Conference, Barcelona", required: true },
      { name: "date", label: "Date", placeholder: "2026-03-14", required: true },
      { name: "abstract", label: "Two-sentence abstract", rows: 3, required: true },
      { name: "recording", label: "Recording / transcript URL (optional)" },
    ],
  },
  {
    kind: "new-essay",
    label: "Essay I want to write",
    blurb: "A pitch, not the whole draft. One paragraph is fine.",
    fields: [
      { name: "title", label: "Working title", required: true },
      { name: "pitch", label: "What you want to argue (100–200 words)", rows: 5, required: true },
      { name: "audience", label: "Who you’re writing for" },
    ],
  },
  {
    kind: "copy-correction",
    label: "Copy correction",
    blurb: "Something on the site reads wrong. Paste the passage and what to change it to.",
    fields: [
      { name: "location", label: "Where on the site", placeholder: "/about, section 3", required: true },
      { name: "current", label: "Current text", rows: 3, required: true },
      { name: "replacement", label: "What it should say", rows: 3, required: true },
    ],
  },
  {
    kind: "credentials",
    label: "Credentials update",
    blurb: "New certification, new role, something to add to the track record.",
    fields: [
      { name: "change", label: "What changed", rows: 3, required: true },
      { name: "effective", label: "Effective date" },
      { name: "evidence", label: "Evidence URL (diploma, announcement, etc.)" },
    ],
  },
  {
    kind: "voice-note",
    label: "Voice calibration",
    blurb: "A passage sounds off — too marketing-y, too formal, not my voice.",
    fields: [
      { name: "passage", label: "Passage that sounds off", rows: 3, required: true },
      { name: "direction", label: "How it should feel instead", rows: 2, required: true },
    ],
  },
];
