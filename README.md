# HomeHealthTools.com

Independent SaaS for home health branch directors. Admission heat maps,
territory builder, PTO manager, coverage scheduler — all tied to a single
branch roster. No PHI ever stored.

**Notion sits at the center of this build.** Specs, system prompts, agent
configs, and the machine registry live in Notion; the app reads them at
build time and runtime. Editing a system prompt in Notion takes effect on
the next agent invocation — zero code change, zero deployment.

## Architecture (from the stack diagram)

```
          You + dev partner
                ↓  write specs, prompts, agent configs
          Notion workspace
            · Machine Registry DB
            · Agent Config DB
            · Prompt Library DB
            · Sprint + Roadmap DB
         ┌──────┼──────┐
    build│deploy│runtime│
         ↓      ↓      ↓
    Claude   Next.js  Runtime config
    Code     app      (live prompt
     ↓       ↓         injection)
   GitHub  Vercel   Anthropic API
     ↓       ↓         ↓
    Neon   Customer  KB vault
  (Postgres) portal   (RAG)
```

Three paths through the stack, all originating from Notion:

- **Build path (purple)** — Claude Code reads specs from Notion, writes
  code, commits to GitHub. Tenants, billing, logs persist in Neon Postgres.
- **Deploy path (blue)** — Next.js pages pull content from Notion at
  build time, Vercel deploys, customers run machines through the portal.
- **Runtime path (green)** — Agents fetch their system prompts + configs
  from Notion on every run. Anthropic API executes. KB vault provides RAG.

The build loop closes on itself: `Notion spec → Claude Code builds →
GitHub → Vercel deploys → Notion updated with route + status`.

## Stack

- **Next.js 14** App Router, TypeScript, Tailwind CSS
- **Clerk** auth (organizations = branches)
- **Prisma** + **Neon Postgres** (tenants, billing, logs)
- **Notion** (specs, prompts, agent configs, machine registry, docs, changelog)
- **Stripe** subscriptions (MAP / OPS / BRANCH tiers)
- **Leaflet** + CartoDB dark tiles for maps
- **Papa Parse** (client-side CSV parsing — aggregated counts only leave the browser)
- **Anthropic Claude Sonnet 4** for the Territory Builder Agent and future machines
- **Resend** for transactional email
- **Census TIGER + ACS** APIs (server-side, cached in Postgres, no API keys)

## Notion schema

Set up four databases in a single Notion workspace and share them with
your internal integration. Copy each database ID into the corresponding
env var.

### Machine Registry DB (`NOTION_MACHINE_REGISTRY_DB`)
Catalog of tools/agents in the platform.

| Property     | Type        | Example                         |
|--------------|-------------|---------------------------------|
| Name         | Title       | `Territory Builder`             |
| Slug         | Rich text   | `territory-builder`             |
| Description  | Rich text   | Conversational territory agent  |
| Status       | Select      | `Draft` / `Active` / `Deprecated` |
| Tier         | Select      | `MAP` / `OPS` / `BRANCH`        |
| Route        | Rich text   | `/dashboard/territories`        |
| Owner        | Rich text   | `@chigh`                        |

### Agent Config DB (`NOTION_AGENT_CONFIG_DB`)
Per-agent runtime configuration, keyed by machine slug.

| Property      | Type        | Example                     |
|---------------|-------------|-----------------------------|
| Name          | Title       | `Territory Builder · prod`  |
| Machine Slug  | Rich text   | `territory-builder`         |
| Model         | Rich text   | `claude-sonnet-4-20250514`  |
| Temperature   | Number      | `0.7`                       |
| Max Tokens    | Number      | `1200`                      |
| Tools         | Multi-select| `census_lookup, db_read`    |

### Prompt Library DB (`NOTION_PROMPT_LIBRARY_DB`)
**The runtime superpower.** System prompts are fetched on each agent run.

| Property | Type       | Example                |
|----------|------------|------------------------|
| Name     | Title      | `Territory Builder v3` |
| Slug     | Rich text  | `territory-builder`    |
| Active   | Checkbox   | `true` (only one at a time per slug) |
| Version  | Rich text  | `3.0.2`                |
| (body)   | Page blocks| The actual prompt text |

Edit the body, toggle Active, and the next agent call picks it up (cached
for `NOTION_PROMPT_TTL_SECONDS`, default 60s). The Notion webhook at
`/api/notion/webhook` can force an immediate cache bust for zero-latency
propagation.

### Sprint + Roadmap DB (`NOTION_SPRINT_ROADMAP_DB`)
Engineering sprint and public changelog.

| Property    | Type      | Example                |
|-------------|-----------|------------------------|
| Name        | Title     | `Heat map tract toggle`|
| Status      | Status    | `Shipped` / `In Progress` / `Backlog` |
| Shipped At  | Date      | `2025-03-14`           |
| Description | Rich text | Short changelog blurb  |

Rendered at `/changelog` (ISR, revalidated every 5 minutes or on webhook).

### Docs DB (`NOTION_DOCS_DB`, optional)
Public help center backing `/docs/[slug]`.

| Property  | Type      | Example            |
|-----------|-----------|--------------------|
| Name      | Title     | `HCHB import guide`|
| Slug      | Rich text | `hchb-import`      |
| Summary   | Rich text | One-liner          |
| Published | Checkbox  | `true`             |

## Running locally

```bash
npm install
cp .env.example .env           # fill in secrets (Notion vars optional — local fallbacks work)
npx prisma db push             # apply schema to Neon / local Postgres
npm run dev                    # http://localhost:3000
```

## Deploying to Vercel

1. Point this repo at Vercel and select the working branch.
2. Add all env vars from `.env.example` to the Vercel project.
3. Point the `homehealthtools.com` domain at the Vercel project.
4. Set `DATABASE_URL` to your Neon Postgres connection string.
5. Configure Stripe webhook endpoint: `https://homehealthtools.com/api/stripe/webhook`.
6. Configure Clerk redirect URLs for `/login`, `/signup`, `/dashboard`.
7. **Notion integration**: create an internal integration at
   https://www.notion.so/my-integrations, copy the secret into
   `NOTION_API_KEY`, share each of the four databases with the
   integration, and copy database IDs into the env vars.
8. (Optional) Configure a Notion automation / polling worker that POSTs to
   `/api/notion/webhook` with the database name and affected slug whenever
   a Prompt Library or Docs row changes. This gives zero-latency edit
   propagation. Without it, edits still propagate within `NOTION_PROMPT_TTL_SECONDS`.

Vercel build command is `prisma generate && next build` (set in `vercel.json`).

## HIPAA posture

- CSV uploads are parsed in the browser by Papa Parse. Only aggregated counts
  by Census tract or ZIP are transmitted.
- Census API calls are proxied server-side — clients never hit third-party
  services directly.
- Clinicians are identified by discipline + number. Names are optional and
  never required. Home ZIP is only used for conflict-of-interest avoidance.
- **Notion never receives PHI.** Specs, prompts, configs, docs — never
  patient data. Notion is not HIPAA-eligible and we design around that.

## Project layout

```
app/
  (marketing)         landing, contact, login, signup
  docs/               Notion-backed help center (/docs, /docs/[slug])
  changelog/          Notion-backed changelog + roadmap
  dashboard/          authed branch director area
    map/              Heat Map + ADC Overlay
    territories/      Territory Builder Agent
    pto/              PTO Manager, rules, school calendars
    coverage/         Coverage Scheduler + builder
    billing/          Stripe portal + plan switching
    settings/         Branch settings
  request/[token]     Public PTO request form (token-gated)
  coverage/[token]    Public coverage sign-up form (token-gated)
  api/
    census/           Boundaries + ACS demographics (cached)
    uploads/          Admission + ADC CSV intake
    admissions/       Map aggregation endpoint
    templates/        EMR-specific CSV templates
    counties/         Add licensed counties (FIPS resolution)
    clinicians/       Add roster entries
    agent/territory   Claude-backed Territory Builder API (Notion-backed prompt)
    notion/webhook    Cache bust + ISR revalidation on Notion edits
    notion/revalidate Manual revalidate endpoint (deploy-hook friendly)
    stripe/           checkout, portal, webhook
    survey/           Public PTO + coverage submission
    coverage/build    Calendar builder
    school-calendar   School calendar upload
    contact           Contact form
    health            Health check

components/
  marketing/          landing, header, footer, pricing
  dashboard/          nav, forms
  map/                Leaflet canvas, CSV uploader, heat map client
  territory/          Territory Agent chat UI
  survey/             PTO request form

lib/
  db.ts               Prisma singleton
  auth.ts             requireBranch + tier helpers (server)
  auth-client.ts      tier helpers (client-safe)
  census.ts           TIGER + ACS helpers with caching
  stripe.ts           Stripe client + price lookup
  survey-tokens.ts    signed one-time tokens
  notion.ts           Notion client + typed readers for all four DBs
  notion-prompts.ts   Runtime prompt fetcher + cache (the "superpower")
  notion-render.ts    Notion page → markdown → HTML
  utils.ts            misc helpers
  agent/
    territory-system-prompt.ts   Local fallback (Notion is source of truth)

prisma/
  schema.prisma       full data model
```

## Tiers

| Tier   | Tools                                              | Quarter | Year |
|--------|----------------------------------------------------|---------|------|
| MAP    | Heat Map + ADC Overlay                             | $99     | $199 |
| OPS    | + Territory Builder Agent                          | $199    | $399 |
| BRANCH | + PTO Manager + Coverage Scheduler                 | $299    | $599 |

All plans include a free first quarter and up to 5 counties per branch.

## The Notion superpower, in practice

The Territory Builder agent lives at `app/api/agent/territory/route.ts`.
On every request it does this:

```ts
const [promptResult, agentConfig] = await Promise.all([
  getPrompt("territory-builder", TERRITORY_SYSTEM_PROMPT), // local fallback
  getAgentConfig("territory-builder"),
]);

const completion = await anthropic.messages.create({
  model: agentConfig.model,           // from Notion
  max_tokens: agentConfig.maxTokens,  // from Notion
  temperature: agentConfig.temperature,// from Notion
  system: [{ type: "text", text: promptResult.text, cache_control: ... }],
  messages: ...,
});
```

To change the agent's behavior in production:

1. Edit the `territory-builder` page in the Notion Prompt Library DB.
2. (Optional) POST to `/api/notion/webhook` to bust the cache immediately.
3. Done — next invocation uses the new prompt. No deploy, no git.

Every machine in the platform should follow this pattern.

## Future machines

The Machine Registry DB is the single source of truth for what exists in
the platform. As new machines are added — ADC intelligence, territory
drift detection, coverage gap alerts, PTO forecasting — each one gets a
row in Machine Registry, an entry in Agent Config, a prompt in Prompt
Library, and a route in `/app`. The build loop shown in the diagram
handles the glue automatically: Claude Code reads the spec, writes the
code, pushes to GitHub, Vercel deploys, and the Notion row gets updated
with the route and status.

## Branch build plan

- Phase 1 ✅ Foundation (auth, setup, Stripe, Prisma)
- Phase 2 ✅ Heat Map (client-side CSV, TIGER/ACS cache, Leaflet)
- Phase 3 🚧 PTO Manager (scaffold shipped; school calendar parser TODO)
- Phase 4 🚧 Coverage Scheduler (scaffold shipped; iCal export TODO)
- Phase 5 🚧 Territory Builder + ADC Overlay (agent scaffold shipped,
  Notion-backed prompt + config live; JSON assignment persistence TODO)
- Phase 6 🆕 Notion-native build loop (this commit — full wiring)
