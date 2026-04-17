# Claude Code Project Instructions

## Development Protocol: The Loop

Every change follows this loop. It runs until zero changes are produced.

### 1. REVIEW
- Read all relevant existing code before modifying anything
- Check for conflicts with existing patterns and linter changes
- Identify every file that will be affected

### 2. PLAN
- State what will change and why before writing code
- List files to create or modify
- For metrics: confirm all three lanes are addressed (paste UI, Excel template, compliance entry)

### 3. IMPLEMENT
- Write the code following existing conventions
- No `any` types unless interfacing with external untyped APIs
- Every metric ships with all three intake lanes

### 4. VALIDATE
- Run `npx tsc --noEmit` — zero errors required before committing
- If TypeScript fails, fix and re-validate (loop back to step 3)
- Verify PHI scanner covers the change if data intake is involved

### 5. DOCUMENT (inline)
- Commit message explains WHY, not just WHAT
- Update compliance packet if new data types are accepted
- Update README if architecture changes

### Loop exit condition
If `tsc --noEmit` passes AND no files need further changes AND the
commit message accurately describes the final state → exit loop.
Otherwise → repeat from step 1.

## Three-Lane Rule

No data metric ships without:
1. **Paste UI** in Data Studio with PHI scanner
2. **Excel template** downloadable workbook
3. **Compliance packet entry** documenting what's accepted/rejected

## HIPAA Rules

- Commercial mode: pre-aggregated ZIP counts only, cell suppression ≥11
- Never accept addresses, names, MRNs, DOBs, exact dates, diagnoses
- PHI scanner runs client-side BEFORE any transmission
- Server-side validation re-enforces all rules as belt-and-suspenders

## Code Conventions

- TypeScript strict throughout
- All database mutations through server actions or API routes
- Census/geographic data fetched server-side, cached in DB when available
- Clinicians identified by discipline + number only (PT-1, RN-3), never names
- Leaflet components loaded via next/dynamic with ssr: false
