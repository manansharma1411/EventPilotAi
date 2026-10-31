// ==============================================================================
// EventPilot AI - AI Copilot Structured Change Proposal Schema
// Fixed set of permitted application operations & strict validation
// ==============================================================================

import type { EventType } from "@/types";

export interface EventFieldChange {
  field: "title" | "event_date" | "guest_count" | "total_budget" | "theme" | "location";
  old_value: string | number | null;
  new_value: string | number;
  reason: string;
}

export interface BudgetChangeProposal {
  action: "update" | "add" | "delete";
  category: string;
  old_estimated_cost?: number;
  new_estimated_cost?: number;
  description?: string;
  reason: string;
}

export interface TaskChangeProposal {
  action: "add" | "update" | "delete";
  title: string;
  description?: string;
  priority?: "low" | "medium" | "high" | "urgent";
  due_at?: string | null;
  reason: string;
}

export interface StructuredChangeProposal {
  user_intent_summary: string;
  is_feasible: boolean;
  infeasibility_reason?: string;
  trade_offs_explanation: string;
  event_field_changes: EventFieldChange[];
  budget_changes: BudgetChangeProposal[];
  task_changes: TaskChangeProposal[];
  alternative_suggestions: string[];
}

export interface CopilotValidationResult {
  success: boolean;
  data?: StructuredChangeProposal;
  errors?: string[];
}

export function validateChangeProposal(raw: unknown): CopilotValidationResult {
  const errors: string[] = [];
  if (!raw || typeof raw !== "object") {
    return { success: false, errors: ["Proposal must be a valid JSON object"] };
  }

  const obj = raw as Record<string, unknown>;

  if (typeof obj.user_intent_summary !== "string" || !obj.user_intent_summary.trim()) {
    errors.push("Missing user_intent_summary");
  }

  const is_feasible = Boolean(obj.is_feasible);
  const trade_offs_explanation = typeof obj.trade_offs_explanation === "string" ? obj.trade_offs_explanation : "";

  // Validate event field changes
  const event_field_changes: EventFieldChange[] = [];
  if (Array.isArray(obj.event_field_changes)) {
    const allowedFields = ["title", "event_date", "guest_count", "total_budget", "theme", "location"];
    for (const ch of obj.event_field_changes) {
      if (typeof ch === "object" && ch !== null) {
        const item = ch as Record<string, unknown>;
        if (typeof item.field === "string" && allowedFields.includes(item.field)) {
          event_field_changes.push({
            field: item.field as EventFieldChange["field"],
            old_value: (item.old_value as string | number) ?? null,
            new_value: item.new_value as string | number,
            reason: typeof item.reason === "string" ? item.reason : "Requested by user",
          });
        }
      }
    }
  }

  // Validate budget changes
  const budget_changes: BudgetChangeProposal[] = [];
  if (Array.isArray(obj.budget_changes)) {
    for (const b of obj.budget_changes) {
      if (typeof b === "object" && b !== null) {
        const item = b as Record<string, unknown>;
        const action = item.action === "add" || item.action === "delete" || item.action === "update" ? item.action : "update";
        const category = typeof item.category === "string" ? item.category.trim() : "General";
        const new_estimated_cost = typeof item.new_estimated_cost === "number" ? Math.max(0, Math.round(item.new_estimated_cost * 100) / 100) : undefined;
        const old_estimated_cost = typeof item.old_estimated_cost === "number" ? Math.max(0, Math.round(item.old_estimated_cost * 100) / 100) : undefined;

        budget_changes.push({
          action,
          category,
          old_estimated_cost,
          new_estimated_cost,
          description: typeof item.description === "string" ? item.description : undefined,
          reason: typeof item.reason === "string" ? item.reason : "Budget realignment",
        });
      }
    }
  }

  // Validate task changes
  const task_changes: TaskChangeProposal[] = [];
  if (Array.isArray(obj.task_changes)) {
    for (const t of obj.task_changes) {
      if (typeof t === "object" && t !== null) {
        const item = t as Record<string, unknown>;
        const action = item.action === "add" || item.action === "delete" || item.action === "update" ? item.action : "add";
        const title = typeof item.title === "string" ? item.title.trim() : "New Milestone";
        const validPriorities = ["low", "medium", "high", "urgent"];
        const priority = typeof item.priority === "string" && validPriorities.includes(item.priority) ? (item.priority as TaskChangeProposal["priority"]) : "medium";

        task_changes.push({
          action,
          title,
          description: typeof item.description === "string" ? item.description : undefined,
          priority,
          due_at: typeof item.due_at === "string" ? item.due_at : null,
          reason: typeof item.reason === "string" ? item.reason : "Timeline adjustment",
        });
      }
    }
  }

  const alternative_suggestions = Array.isArray(obj.alternative_suggestions)
    ? (obj.alternative_suggestions.filter((s): s is string => typeof s === "string"))
    : [];

  if (errors.length > 0) {
    return { success: false, errors };
  }

  return {
    success: true,
    data: {
      user_intent_summary: String(obj.user_intent_summary).trim(),
      is_feasible,
      infeasibility_reason: typeof obj.infeasibility_reason === "string" ? obj.infeasibility_reason : undefined,
      trade_offs_explanation,
      event_field_changes,
      budget_changes,
      task_changes,
      alternative_suggestions,
    },
  };
}
