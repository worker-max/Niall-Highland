# HomeHealthTools Development Protocol

## The Loop: Review → Plan → Implement → Validate → Document

Every feature, fix, or change follows this loop. The loop runs until
zero changes are produced on a pass.

### 1. REVIEW
- Read all relevant existing code before touching anything
- Check for conflicts with existing patterns
- Identify which files will be affected
- Note any linter/agent changes that need to be preserved

### 2. PLAN
- State exactly what will change and why (in the commit message)
- List every file to create or modify
- Identify which MetricIntake lane(s) are needed (paste UI, Excel template, compliance entry)
- Check: does this metric handle PHI? If yes, which PHI scanner rules apply?

### 3. IMPLEMENT
- Write the code
- Follow existing patterns (don't invent new conventions)
- Every metric ships with all three lanes (paste UI, Excel template, compliance packet entry)
- No `any` types. No skipped error handling at system boundaries.

### 4. VALIDATE
- `npx tsc --noEmit` — zero errors required
- Check that the GeoJSON key includes all relevant state variables (prevents stale renders)
- Verify PHI scanner covers all 10+ patterns for this metric
- Verify cell suppression is enforced both client-side AND server-side

### 5. DOCUMENT (inline)
- Update compliance packet page if a new data type is accepted
- Update README if architecture changes
- Commit message must explain WHY, not just WHAT
- If the change affects the demo, verify the demo still works

### Loop exit condition
Run the loop again. If `npx tsc --noEmit` passes AND no files need
changes AND the commit message accurately describes the state, the
loop exits. Otherwise, repeat from step 1.

---

## Three-Lane Rule for Metrics

No metric ships without all three:

| Lane | What | Where |
|------|------|-------|
| 1. Paste UI | Data Studio sub-tab with template, paste box, PHI scan, validation | `/dashboard/data/*` |
| 2. Excel template | Downloadable workbook with instructions, column mapper, clean output | `/api/templates/excel?type={metric}` |
| 3. Compliance entry | What we accept, what we reject, EMR recipe | `/dashboard/data/compliance` |

### MetricIntake config pattern

Each metric is defined as a `MetricIntake` config in `lib/metric-intake/`.
The framework generates all three lanes from the config.

```typescript
// Example: lib/metric-intake/admissions.ts
export const ADMISSIONS: MetricIntake = {
  id: "admissions",
  snapshotType: "ADMISSIONS_AGG",
  label: "Admissions",
  description: "Aggregated new admission counts by ZIP code and quarter.",
  columns: [
    { key: "zip", label: "ZIP code", type: "zip5", required: true },
    { key: "year", label: "Year", type: "year", required: true },
    { key: "quarter", label: "Quarter (1-4)", type: "quarter", required: true },
    { key: "count", label: "Count", type: "count", min: 11, required: true },
  ],
  emrRecipes: { ... },
  phiRules: [...all 10+],
  suppressionThreshold: 11,
};
```

---

## PHI Scanner Rules (always applied)

Every paste goes through `lib/phi-scanner.ts` checking for:
1. Patient names (Last, First pattern)
2. Social Security Numbers
3. Dates of birth
4. Exact dates (only year+quarter allowed)
5. Medical Record Numbers
6. Street addresses
7. ZIP+4 extensions
8. ICD-10 diagnosis codes
9. Phone numbers
10. Email addresses

New PHI patterns are added to the scanner, never to individual metrics.

## HIPAA Architecture

- Commercial SaaS (HIPAA_SAFE): pre-aggregated ZIP counts only, cell suppression ≥11
- Enterprise (ENTERPRISE_PHI): patient-level rows with in-boundary geocoding, requires BAA
- No addresses ever accepted in commercial mode
- No tract-level data in commercial mode (directors don't have tract codes)
- ZIP is the atomic geography unit for commercial customers
