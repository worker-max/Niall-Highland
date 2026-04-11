# HomeHealthTools.com

Independent SaaS for home health branch directors. Admission heat maps,
territory builder, PTO manager, coverage scheduler — all tied to a single
branch roster. No PHI ever stored.

## Stack

- **Next.js 14** App Router, TypeScript, Tailwind CSS
- **Clerk** auth (organizations = branches)
- **Prisma** + **PostgreSQL** (Railway)
- **Stripe** subscriptions (MAP / OPS / BRANCH tiers)
- **Leaflet** + CartoDB dark tiles for maps
- **Papa Parse** (client-side CSV parsing — aggregated counts only leave the browser)
- **Anthropic Claude Sonnet 4** for the Territory Builder Agent
- **Resend** for transactional email
- **Census TIGER + ACS** APIs (server-side, cached in Postgres, no API keys)

## Running locally

```bash
npm install
cp .env.example .env           # fill in secrets
npx prisma db push              # apply schema to a local/Railway postgres
npm run dev                     # http://localhost:3000
```

## Deploying to Vercel

1. Point this repo at Vercel and select the `claude/build-homehealthtools-site-fVh7Z` branch (or `main` after merge).
2. Add all env vars from `.env.example` to the Vercel project.
3. Point the `homehealthtools.com` domain at the Vercel project.
4. Set `DATABASE_URL` to your Railway Postgres connection string.
5. Configure Stripe webhook endpoint: `https://homehealthtools.com/api/stripe/webhook`.
6. Configure Clerk redirect URLs for `/login`, `/signup`, `/dashboard`.

Vercel build command is `prisma generate && next build` (set in `vercel.json`).

## HIPAA posture

- CSV uploads are parsed in the browser by Papa Parse. Only aggregated counts
  by Census tract or ZIP are transmitted.
- Census API calls are proxied server-side — clients never hit third-party
  services directly.
- Clinicians are identified by discipline + number. Names are optional and
  never required. Home ZIP is only used for conflict-of-interest avoidance.

## Project layout

```
app/
  (marketing)         landing, contact, login, signup
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
    admissions/aggregate  Map aggregation endpoint
    templates/        EMR-specific CSV templates
    counties/         Add licensed counties (FIPS resolution)
    clinicians/       Add roster entries
    agent/territory   Claude-backed Territory Builder API
    stripe/           checkout, portal, webhook
    survey/           Public PTO + coverage submission
    coverage/build    Calendar builder
    school-calendar   School calendar upload
    contact           Contact form
    health            health check

components/
  marketing/          landing sections
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
  utils.ts            misc helpers
  agent/
    territory-system-prompt.ts   critical product asset — edit with care

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

## Branch build plan

This repo is a working scaffold for all of Phase 1 (foundation), Phase 2
(Heat Map), and the shells for Phases 3–5. The heaviest future work is:

- School calendar PDF/iCal parser in `app/api/school-calendar/route.ts`
- Territory assignment algorithm wiring in `app/api/agent/territory/route.ts`
  (the Claude agent currently returns conversational proposals; the JSON
  assignments block it emits needs to be persisted to `TerritoryAssignment`)
- Real aggregation for the ADC combined view
- iCal feed for confirmed coverage assignments
- Email send paths via Resend (contact form already wired)
