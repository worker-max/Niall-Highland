/**
 * Notion client + typed helpers for the four databases that sit at the
 * center of the HomeHealthTools stack:
 *
 *   - Machine Registry DB   → catalog of "machines" (tools/agents) with
 *                              slug, status, tier, route, owner
 *   - Agent Config DB       → per-agent model, temperature, tools, max_tokens
 *   - Prompt Library DB     → versioned system prompts, fetched at RUNTIME
 *                              (the "superpower" — edit in Notion, live)
 *   - Sprint + Roadmap DB   → engineering sprint + public roadmap/changelog
 *
 * All reads are type-narrowed to the fields we actually use.  Notion's
 * typings are famously loose — we pay the ergonomic cost once, here.
 */

import { Client } from "@notionhq/client";
import type { QueryDatabaseResponse } from "@notionhq/client/build/src/api-endpoints";

const apiKey = process.env.NOTION_API_KEY;

export const notion = apiKey ? new Client({ auth: apiKey }) : null;

export const NOTION_DBS = {
  machineRegistry: process.env.NOTION_MACHINE_REGISTRY_DB,
  agentConfig: process.env.NOTION_AGENT_CONFIG_DB,
  promptLibrary: process.env.NOTION_PROMPT_LIBRARY_DB,
  sprintRoadmap: process.env.NOTION_SPRINT_ROADMAP_DB,
  docs: process.env.NOTION_DOCS_DB,
};

export function notionEnabled(): boolean {
  return !!notion;
}

// ---------------------------------------------------------------------------
// Property readers — Notion returns a big union; these narrow it safely.
// ---------------------------------------------------------------------------

type PageRow = QueryDatabaseResponse["results"][number];
type PageWithProps = Extract<PageRow, { properties: Record<string, any> }>;

function hasProps(row: PageRow): row is PageWithProps {
  return "properties" in row;
}

export function readTitle(row: PageRow, key = "Name"): string {
  if (!hasProps(row)) return "";
  const p = row.properties[key];
  if (p?.type === "title") {
    return p.title.map((t: any) => t.plain_text).join("");
  }
  return "";
}

export function readRichText(row: PageRow, key: string): string {
  if (!hasProps(row)) return "";
  const p = row.properties[key];
  if (p?.type === "rich_text") {
    return p.rich_text.map((t: any) => t.plain_text).join("");
  }
  return "";
}

export function readSelect(row: PageRow, key: string): string | null {
  if (!hasProps(row)) return null;
  const p = row.properties[key];
  if (p?.type === "select") return p.select?.name ?? null;
  if (p?.type === "status") return p.status?.name ?? null;
  return null;
}

export function readMultiSelect(row: PageRow, key: string): string[] {
  if (!hasProps(row)) return [];
  const p = row.properties[key];
  if (p?.type === "multi_select") return p.multi_select.map((s: any) => s.name);
  return [];
}

export function readNumber(row: PageRow, key: string): number | null {
  if (!hasProps(row)) return null;
  const p = row.properties[key];
  if (p?.type === "number") return p.number;
  return null;
}

export function readCheckbox(row: PageRow, key: string): boolean {
  if (!hasProps(row)) return false;
  const p = row.properties[key];
  return p?.type === "checkbox" ? p.checkbox : false;
}

export function readDate(row: PageRow, key: string): Date | null {
  if (!hasProps(row)) return null;
  const p = row.properties[key];
  if (p?.type === "date" && p.date?.start) return new Date(p.date.start);
  return null;
}

export function readSlug(row: PageRow, key = "Slug"): string {
  return readRichText(row, key) || readTitle(row, "Name").toLowerCase().replace(/\s+/g, "-");
}

// ---------------------------------------------------------------------------
// Machine Registry — top-level catalog of tools/agents in the platform
// ---------------------------------------------------------------------------

export type MachineRecord = {
  id: string;
  slug: string;
  name: string;
  description: string;
  status: string | null; // e.g. Draft, Active, Deprecated
  tier: string | null; // MAP / OPS / BRANCH
  route: string | null; // e.g. /dashboard/territories
  owner: string | null;
};

export async function listMachines(): Promise<MachineRecord[]> {
  if (!notion || !NOTION_DBS.machineRegistry) return [];
  const res = await notion.databases.query({
    database_id: NOTION_DBS.machineRegistry,
  });
  return res.results.map((row) => ({
    id: row.id,
    slug: readSlug(row),
    name: readTitle(row),
    description: readRichText(row, "Description"),
    status: readSelect(row, "Status"),
    tier: readSelect(row, "Tier"),
    route: readRichText(row, "Route"),
    owner: readRichText(row, "Owner"),
  }));
}

// ---------------------------------------------------------------------------
// Agent Config — runtime configuration per agent (keyed by machine slug)
// ---------------------------------------------------------------------------

export type AgentConfig = {
  machineSlug: string;
  model: string;
  temperature: number;
  maxTokens: number;
  tools: string[];
};

const DEFAULT_AGENT_CONFIG: AgentConfig = {
  machineSlug: "",
  model: "claude-sonnet-4-20250514",
  temperature: 0.7,
  maxTokens: 1200,
  tools: [],
};

export async function getAgentConfig(machineSlug: string): Promise<AgentConfig> {
  if (!notion || !NOTION_DBS.agentConfig) {
    return { ...DEFAULT_AGENT_CONFIG, machineSlug };
  }
  const res = await notion.databases.query({
    database_id: NOTION_DBS.agentConfig,
    filter: {
      property: "Machine Slug",
      rich_text: { equals: machineSlug },
    },
    page_size: 1,
  });
  const row = res.results[0];
  if (!row) return { ...DEFAULT_AGENT_CONFIG, machineSlug };

  return {
    machineSlug,
    model: readRichText(row, "Model") || DEFAULT_AGENT_CONFIG.model,
    temperature: readNumber(row, "Temperature") ?? DEFAULT_AGENT_CONFIG.temperature,
    maxTokens: readNumber(row, "Max Tokens") ?? DEFAULT_AGENT_CONFIG.maxTokens,
    tools: readMultiSelect(row, "Tools"),
  };
}

// ---------------------------------------------------------------------------
// Sprint + Roadmap — public changelog / roadmap feed
// ---------------------------------------------------------------------------

export type RoadmapItem = {
  id: string;
  title: string;
  status: string | null;
  shippedAt: Date | null;
  description: string;
};

export async function listRoadmapItems(
  filter: "shipped" | "upcoming" | "all" = "all"
): Promise<RoadmapItem[]> {
  if (!notion || !NOTION_DBS.sprintRoadmap) return [];
  const query: any = {
    database_id: NOTION_DBS.sprintRoadmap,
    sorts: [{ property: "Shipped At", direction: "descending" }],
  };
  if (filter === "shipped") {
    query.filter = { property: "Status", status: { equals: "Shipped" } };
  } else if (filter === "upcoming") {
    query.filter = { property: "Status", status: { does_not_equal: "Shipped" } };
  }
  const res = await notion.databases.query(query);
  return res.results.map((row) => ({
    id: row.id,
    title: readTitle(row),
    status: readSelect(row, "Status"),
    shippedAt: readDate(row, "Shipped At"),
    description: readRichText(row, "Description"),
  }));
}

// ---------------------------------------------------------------------------
// Docs / help center — public Notion-backed pages by slug
// ---------------------------------------------------------------------------

export type DocRecord = {
  id: string;
  slug: string;
  title: string;
  summary: string;
  published: boolean;
};

export async function listDocs(): Promise<DocRecord[]> {
  if (!notion || !NOTION_DBS.docs) return [];
  const res = await notion.databases.query({
    database_id: NOTION_DBS.docs,
    filter: { property: "Published", checkbox: { equals: true } },
  });
  return res.results.map((row) => ({
    id: row.id,
    slug: readSlug(row),
    title: readTitle(row),
    summary: readRichText(row, "Summary"),
    published: readCheckbox(row, "Published"),
  }));
}

export async function getDocBySlug(slug: string): Promise<DocRecord | null> {
  const all = await listDocs();
  return all.find((d) => d.slug === slug) ?? null;
}
