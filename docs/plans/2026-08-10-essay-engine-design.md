# Essay Engine ("LOOM for Niall") — Design Spec

**Date:** 2026-08-10
**Branch:** `feat/loom-essay-engine`
**Status:** Design — awaiting review before implementation

---

## Goal

Upgrade the existing `/writing` section from a plain MDX renderer into a
**magazine-grade feature-article engine**, styled and structured like the
long-form science journalism of *Scientific American* and *Discover* — decks,
drop caps, numbered explanatory figures, boxed sidebars, "by the numbers"
callouts, marginalia, and at least one **interactive explanatory figure** per
flagship piece.

This is the Niall-native port of the colinhighland.com "LOOM" / Transmissions
engine. It keeps LOOM's architecture (frontmatter-as-registry, composable MDX
toolkit, per-piece accent, interactive widget, scroll motion, auto-discovery
catalog) but rebuilds every surface on **Niall's own design system** — light-
default editorial tokens, Fraunces/Inter/JetBrains, the `data-surface` island
pattern — rather than colinhighland's cinematic dark palettes.

### Explicitly out of scope

- **No curator chatbot.** (LOOM has one; Niall's is articles only.)
- **No LinkedIn video-capture pipeline.**
- No new routes/IA — we upgrade `/writing` in place.

---

## Decisions (locked with owner)

1. **Placement:** upgrade `/writing` in place. Reuse the existing loader, URLs,
   and the two published essays. Every change is back-compatible.
2. **Accent:** a small **curated accent set** (see §3) delivered as scoped
   CSS-variable islands, each contrast-verified in light *and* dark. Defaults to
   the house teal, so existing essays are untouched.
3. **v1 payload:** build the flagship essay **"Program before platform"** (from
   Niall's follow-up email on building a school AI strategy) as the first
   engine-grade feature, with one bespoke **interactive explanatory figure**.

---

## 1. Architecture overview

```
content/essays/*.mdx ──► lib/content.ts (Zod frontmatter, reading time)
        │                       │
        │                       ├─► app/writing/page.tsx      → upgraded Catalog (featured hero + filter)
        │                       └─► app/writing/[slug]/page.tsx → Feature renderer
        │                                                            │
        │                                            MDXRemote source={content}
        │                                            components={essayComponents}  ← the toolkit, by tag
        ▼
components/essay/*  (magazine feature furniture, all token-driven)
        └─ figures/  (interactive explanatory figures — DemoShell studio aesthetic)
```

The load-bearing fit: Niall renders MDX through `next-mdx-remote/rsc` with a
**components map**. Toolkit components register once in that map and become
available inside every essay **by tag, with no per-file imports**. This is
cleaner than colinhighland's per-file `import { … } from '@/components/…'`.

## 2. Frontmatter registry (extend, don't break)

Extend `essayFrontmatterSchema` in `lib/content.ts`. Every new field is
`.optional()` so the two existing essays still validate.

| Field | Type | Purpose |
|---|---|---|
| `kicker` | `string?` | Category eyebrow, e.g. `"AI Strategy · School Leadership"` |
| `deck` | `string?` | Standfirst / sub-headline under the title (falls back to `excerpt`) |
| `accent` | `enum?` | One of the curated accent keys (§3); default `"teal"` |
| `featured` | `boolean?` | Promotes the piece to the catalog hero slot |
| `readingLevel` | `string?` | Optional audience tag surfaced in furniture (e.g. `"For heads & curriculum leads"`) |
| `figureCredit` | `string?` | Credit line for hero/figure art |

`Essay`/`EssayFrontmatter` types update accordingly. No changes to the talks
schema.

## 3. Accent system (Niall's way, not LOOM's palettes)

colinhighland swaps the entire page to a dark cinematic palette per article.
Niall's system says *"accent holds — #3E8B87 works on both [themes]"* and forbids
pure black/white. So instead of swapping surfaces, we swap **only the accent
family**, scoped by a `data-accent` attribute on the article root — the exact
technique his `data-surface="dark"` island already uses.

New block in `styles/globals.css`:

```css
/* Per-essay accent islands. Each holds AA contrast on BOTH paper-50 (light)
 * and ink-900 (dark). Overrides only accent aliases + a tint wash; surfaces,
 * text, and border stay on the page theme. Verified during implementation. */
[data-accent="teal"]   { --accent: #3E8B87; --accent-hover: #5BA8A4; --accent-tint: rgba(62,139,135,0.07); }
[data-accent="indigo"] { --accent: #4C63B6; --accent-hover: #6B7FCB; --accent-tint: rgba(76,99,182,0.07); }
[data-accent="clay"]   { --accent: #B4603A; --accent-hover: #C87A50; --accent-tint: rgba(180,96,58,0.07); }
[data-accent="moss"]   { --accent: #5C7A3A; --accent-hover: #789A52; --accent-tint: rgba(92,122,58,0.07); }
[data-accent="plum"]   { --accent: #8A4E7A; --accent-hover: #A76B96; --accent-tint: rgba(138,78,122,0.07); }

.dark [data-accent="indigo"] { --accent: #8CA0E8; --accent-hover: #A6B6F0; }
.dark [data-accent="clay"]   { --accent: #E08A5E; --accent-hover: #EBA37E; }
.dark [data-accent="moss"]   { --accent: #9DBE6E; --accent-hover: #B4CE8A; }
.dark [data-accent="plum"]   { --accent: #C48AB4; --accent-hover: #D4A6C8; }
/* teal already holds on dark via existing tokens */
```

Contrast is verified against WCAG AA (≥4.5:1 body / ≥3:1 large) on both themes
during build; any hue that fails is retuned. `--accent-tint` powers the 6–7%
figure/sidebar washes, replacing colinhighland's inline `${accent}07`.

## 4. The toolkit — `components/essay/`

Magazine feature furniture, named to Niall's convention, each pure-token and
theme-aware. Server components where possible; `"use client"` only where motion
or interaction requires it.

| Component | Role (science-magazine analogue) |
|---|---|
| `EssayHero` | Feature opener: kicker, title (Fraunces), deck, byline furniture, reading time, optional hero figure + credit |
| `Byline` | "By Niall Highland" + date + reading level furniture |
| `Deck` | Standfirst — the bold intro paragraph |
| `DropCap` | Initial cap for the opening paragraph |
| `Section` + `SectionLabel` | Section opener with label/dinkus; anchor id for deep links |
| `Figure` | **The signature component.** Numbered ("FIG. 1"), holds image or inline SVG diagram, caption + source credit. Variants: `column`, `wide`, `full-bleed`, `margin` |
| `Sidebar` | Boxed inset ("THE BASICS", "HOW IT WORKS") — bordered, accent-tinted, sits in flow or as a wide break |
| `Stat` / `StatRow` | "By the numbers" callout row |
| `Callout` | Inline emphasis note (info / caution / key-point) |
| `ComparisonTable` | Before/after or A-vs-B (e.g. brittle vs durable policy) |
| `MarginNote` | Tufte-style margin annotation on wide viewports; inline aside on narrow |
| `Reveal` | Scroll-in wrapper (framer-motion), `prefers-reduced-motion` safe |
| `ExplanatoryFigure` | Frame for an **interactive** figure — numbered like `Figure`, rendered in the `DemoShell` `ai-native` studio aesthetic (`data-surface="dark"`, `--signal` rule). Houses the widget. |
| `EndMark` | Closing dinkus (■) that terminates a feature |

Reuse existing primitives: `EditorialSection`, `PullQuote`, `ThesisBlock`,
`DemoShell`, `cn`. `PullQuote` already supports `attribution`/`source` — used
as-is.

### Wiring

`app/writing/[slug]/page.tsx` grows its `mdxComponents` map to spread in an
`essayComponents` object (exported from `components/essay/index.ts`) alongside
the existing HTML-tag overrides. The hero currently hardcoded in the renderer is
replaced by `EssayHero` fed from frontmatter. Article root gets
`data-accent={frontmatter.accent ?? "teal"}`.

## 5. Interactive explanatory figure (the LOOM non-negotiable)

Reframed for a science magazine: not a "widget," an **interactive figure** that
teaches the article's mechanism, rewarding interaction within ~3 seconds.

**Flagship figure — "A shared language for AI use" (the Traffic-Lights classifier).**
The reader sorts real classroom tasks into **Red / Amber / Green** (AI
prohibited / AI with disclosure / AI encouraged). On each drop the figure
reveals the reasoning and tallies coverage — making concrete the essay's Step 3
("draft working guidelines, then test them across subjects"). It is drawn
straight from Niall's own recommended *Traffic Lights* resource, so it deepens
the argument rather than decorating it.

- Lives at `components/essay/figures/TrafficLightsClassifier.tsx` (`"use client"`).
- Rendered inside `ExplanatoryFigure` → `DemoShell variant="ai-native"`.
- Themed via `--accent` / `--signal`; keyboard-operable; reduced-motion safe;
  no external calls (pure client state).

**Alternative / future figure (noted, not built in v1):** *"The Inversion"* —
a program-first vs platform-first two-path diagram the reader flips to watch a
policy go brittle or durable. Natural widget for a second essay.

## 6. Catalog upgrade — `app/writing/page.tsx`

- **Featured hero:** the `featured` essay renders as a large lead card (title,
  deck, accent rule, reading time).
- **Filter:** lightweight client filter by tag (his existing tag vocabulary —
  `leadership`, `policy`, `curriculum`, `assessment`, …). No "domain" taxonomy
  invented; tags already exist.
- **Cards:** editorial style — top accent rule in the essay's accent, kicker,
  title, deck, date · reading time. Built on tokens, not glass/dark.
- Auto-discovery is already how `listEssays()` works; no registry to maintain.

## 7. The flagship essay — `content/essays/program-before-platform.mdx`

- **Frontmatter:** `accent: "indigo"` (distinct from house teal, holds both
  themes), `featured: true`, `kicker: "AI Strategy · School Leadership"`,
  tags `["leadership", "policy"]`, `pullQuote` = the "living document" line,
  today's date.
- **Structure:** deck → drop-cap open → the program-before-platform thesis →
  the five-move sequence (align → task force → draft guidelines → community
  feedback → revise), each a `Section`, reframed as lived practice (not a
  checklist) → the Traffic-Lights `ExplanatoryFigure` at Step 3 → a `Sidebar`
  "The starter shelf" (his resource list: *Co-Intelligence*, *One Useful Thing*,
  Pineapple Charts) → `ComparisonTable` brittle-vs-durable policy → close on the
  "living document" pull quote → `EndMark`.
- ~1,100–1,300 words, warm-authoritative, matching the two existing essays.

## 8. Cross-cutting rules

- **Theming:** never hardcode colors; reference `--accent`, `--text`,
  `--surface`, `--border`, `--signal`, `--accent-tint`. Every component correct
  in light and dark.
- **Motion:** framer-motion for `Reveal` only; honor `prefers-reduced-motion`
  (globals already forces near-zero durations, and `Reveal` will short-circuit).
- **A11y:** figures have captions and `figure/figcaption`; the interactive figure
  is keyboard-operable with visible focus (his `:focus-visible` ring); color is
  never the sole signal (Red/Amber/Green carry labels + icons).
- **TypeScript strict, no `any`.** Props typed; frontmatter via Zod.
- **SSR-first:** toolkit components stay server components unless they need
  motion/interaction.

## 9. File manifest

**New**
- `components/essay/EssayHero.tsx`, `Byline.tsx`, `Deck.tsx`, `DropCap.tsx`,
  `Section.tsx`, `SectionLabel.tsx`, `Figure.tsx`, `Sidebar.tsx`, `Stat.tsx`,
  `Callout.tsx`, `ComparisonTable.tsx`, `MarginNote.tsx`, `Reveal.tsx`,
  `ExplanatoryFigure.tsx`, `EndMark.tsx`, `index.ts`
- `components/essay/figures/TrafficLightsClassifier.tsx`
- `content/essays/program-before-platform.mdx`
- `docs/plans/2026-08-10-essay-engine-design.md` (this file)

**Modified**
- `lib/content.ts` — extend `essayFrontmatterSchema` + `EssayFrontmatter`
- `app/writing/[slug]/page.tsx` — spread `essayComponents`; hero from
  frontmatter; `data-accent` root
- `app/writing/page.tsx` + catalog — featured hero + tag filter
- `styles/globals.css` — `data-accent` island block + `--accent-tint`

## 10. Verification

- `npx tsc --noEmit` clean.
- `next build` succeeds; both existing essays + the new one statically generate.
- Dev-server visual pass: catalog (light + dark), the flagship feature top-to-
  bottom, the interactive figure (mouse + keyboard), reduced-motion.
- Confirm existing essays render unchanged (accent defaults to teal).

## Open question for review

The flagship interactive figure is specced as the **Traffic-Lights classifier**
(tangible, sourced from Niall's own resource, embodies "working guidelines").
If you'd rather the first figure carry the *program-before-platform* thesis
head-on, we swap in **"The Inversion"** two-path diagram instead. Recommendation:
Traffic Lights for v1.
