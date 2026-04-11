// Client-safe helpers (no server imports).

export function tierAllows(
  branchTier: string,
  required: "MAP" | "OPS" | "BRANCH"
): boolean {
  const rank: Record<string, number> = { MAP: 1, OPS: 2, BRANCH: 3 };
  return (rank[branchTier] ?? 0) >= (rank[required] ?? 0);
}
