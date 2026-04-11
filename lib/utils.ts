import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function quarterLabel(year: number, quarter: number): string {
  return `${year}-Q${quarter}`;
}

export function parseQuarterLabel(label: string): { year: number; quarter: number } | null {
  const m = /^(\d{4})-Q([1-4])$/.exec(label);
  if (!m) return null;
  return { year: Number(m[1]), quarter: Number(m[2]) };
}
