// ==============================================================================
// EventPilot AI - Deterministic Budget Calculations & Financial Engine
// Exact numeric arithmetic (rounded to 2 decimal places / cents)
// ==============================================================================

import type { BudgetItemRecord } from "@/types";

export interface BudgetSummaryMetrics {
  totalBudget: number;
  totalEstimated: number;
  totalActual: number;
  remainingBudget: number;
  contingencyReserve: number;
  unallocatedBudget: number;
  isOverBudget: boolean;
  overspendAmount: number;
  allocationPercent: number;
  actualSpentPercent: number;
  categoryBreakdown: {
    category: string;
    estimatedTotal: number;
    actualTotal: number;
    itemCount: number;
    percentageOfBudget: number;
    color: string;
  }[];
}

const CATEGORY_COLORS: Record<string, string> = {
  "venue": "#4F46E5", // indigo-600
  "catering": "#059669", // emerald-600
  "food & beverage": "#059669",
  "photography": "#D97706", // amber-600
  "photo & video": "#D97706",
  "videography": "#D97706",
  "entertainment": "#7C3AED", // violet-600
  "music & sound": "#7C3AED",
  "decor": "#DB2777", // pink-600
  "floral & decor": "#DB2777",
  "contingency": "#64748B", // slate-500
  "emergency": "#64748B",
  "attire": "#2563EB", // blue-600
  "invitations": "#0891B2", // cyan-600
  "logistics": "#475569", // slate-600
};

export function getCategoryColor(categoryName: string, index: number = 0): string {
  const normalized = categoryName.toLowerCase().trim();
  for (const [key, color] of Object.entries(CATEGORY_COLORS)) {
    if (normalized.includes(key)) return color;
  }
  const fallbackPalette = ["#4F46E5", "#059669", "#D97706", "#7C3AED", "#DB2777", "#0891B2", "#2563EB", "#64748B"];
  return fallbackPalette[index % fallbackPalette.length];
}

/**
 * Deterministically calculates all budget metrics without floating point arithmetic anomalies
 */
export function calculateBudgetMetrics(
  totalBudget: number,
  items: BudgetItemRecord[]
): BudgetSummaryMetrics {
  const safeTotalBudget = Math.max(0, Math.round(Number(totalBudget || 0) * 100) / 100);

  let totalEstimated = 0;
  let totalActual = 0;
  let contingencyReserve = 0;

  const categoryMap = new Map<string, { estimated: number; actual: number; count: number }>();

  for (const item of items) {
    const est = Math.max(0, Math.round(Number(item.estimated_cost || 0) * 100) / 100);
    const act = Math.max(0, Math.round(Number(item.actual_cost || 0) * 100) / 100);

    totalEstimated += est;
    totalActual += act;

    const lowerCat = item.category.toLowerCase().trim();
    if (lowerCat.includes("contingency") || lowerCat.includes("emergency buffer")) {
      contingencyReserve += est;
    }

    const catKey = item.category.trim() || "Uncategorized";
    const existing = categoryMap.get(catKey) || { estimated: 0, actual: 0, count: 0 };
    categoryMap.set(catKey, {
      estimated: existing.estimated + est,
      actual: existing.actual + act,
      count: existing.count + 1,
    });
  }

  // Round values to exact 2 decimals
  totalEstimated = Math.round(totalEstimated * 100) / 100;
  totalActual = Math.round(totalActual * 100) / 100;
  contingencyReserve = Math.round(contingencyReserve * 100) / 100;

  // Remaining budget based on committed actual spending (or estimated if actual is 0)
  const effectiveCommitted = totalActual > 0 ? totalActual : totalEstimated;
  const rawRemaining = safeTotalBudget - effectiveCommitted;
  const remainingBudget = Math.round(rawRemaining * 100) / 100;

  // Unallocated budget: difference between approved total budget and total allocated estimates
  const unallocatedBudget = Math.max(0, Math.round((safeTotalBudget - totalEstimated) * 100) / 100);

  const isOverBudget = effectiveCommitted > safeTotalBudget;
  const overspendAmount = isOverBudget ? Math.round((effectiveCommitted - safeTotalBudget) * 100) / 100 : 0;

  const allocationPercent = safeTotalBudget > 0
    ? Math.min(100, Math.round((totalEstimated / safeTotalBudget) * 100))
    : (totalEstimated > 0 ? 100 : 0);

  const actualSpentPercent = safeTotalBudget > 0
    ? Math.min(100, Math.round((totalActual / safeTotalBudget) * 100))
    : (totalActual > 0 ? 100 : 0);

  // Build category breakdown
  let colorIdx = 0;
  const categoryBreakdown = Array.from(categoryMap.entries()).map(([category, val]) => {
    const estTotal = Math.round(val.estimated * 100) / 100;
    const actTotal = Math.round(val.actual * 100) / 100;
    const pct = safeTotalBudget > 0 ? Math.round((estTotal / safeTotalBudget) * 1000) / 10 : 0;
    const color = getCategoryColor(category, colorIdx++);

    return {
      category,
      estimatedTotal: estTotal,
      actualTotal: actTotal,
      itemCount: val.count,
      percentageOfBudget: pct,
      color,
    };
  });

  // Sort by estimated cost descending
  categoryBreakdown.sort((a, b) => b.estimatedTotal - a.estimatedTotal);

  return {
    totalBudget: safeTotalBudget,
    totalEstimated,
    totalActual,
    remainingBudget,
    contingencyReserve,
    unallocatedBudget,
    isOverBudget,
    overspendAmount,
    allocationPercent,
    actualSpentPercent,
    categoryBreakdown,
  };
}

/**
 * Formats monetary amounts with consistent currency symbol and commas
 */
export function formatCurrency(amount: number, currency: string = "USD"): string {
  const safeAmount = Number(amount || 0);
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency.toUpperCase(),
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(safeAmount);
  } catch {
    return `${currency} ${safeAmount.toFixed(2)}`;
  }
}
