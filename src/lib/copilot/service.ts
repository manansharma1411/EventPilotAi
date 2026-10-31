// ==============================================================================
// EventPilot AI - AI Copilot Server Service
// Generates structured change proposals with trade-off analysis
// ==============================================================================

import { callGemini, GeminiServiceError } from "@/lib/ai/client";
import { validateChangeProposal, type StructuredChangeProposal } from "./schemas";
import type { EventRecord, BudgetItemRecord, TaskRecord } from "@/types";

export function buildCopilotPrompt(
  event: EventRecord,
  budgetItems: BudgetItemRecord[],
  tasks: TaskRecord[],
  userRequest: string
): string {
  const currentBudgetSummary = budgetItems.map((b) => `${b.category}: ${event.currency} ${b.estimated_cost}`).join(", ");
  const currentTasksSummary = tasks.slice(0, 10).map((t) => t.title).join(", ");

  return `You are EventPilot Copilot, an AI event planning assistant.
Analyze this user revision request in the context of the current event parameters and generate a strictly structured JSON change proposal.

CURRENT EVENT CONTEXT:
- Title: "${event.title}"
- Event Category: "${event.event_type}"
- Event Date: ${event.event_date} (Timezone: ${event.timezone || "UTC"})
- Location: "${event.location}"
- Guest Count: ${event.guest_count}
- Total Approved Budget: ${event.currency} ${Number(event.total_budget).toLocaleString()}
- Theme: "${event.theme || "None"}"
- Current Budget Items: [${currentBudgetSummary}]
- Current Tasks: [${currentTasksSummary}]

USER REQUEST:
"${userRequest}"

STRICT INSTRUCTIONS:
1. Identify if the request is feasible. If it violates realistic physics or extreme negative constraints, mark "is_feasible": false and explain why.
2. Outline trade-offs (e.g. reducing catering budget without touching quality might mean choosing buffet style over plated, or reallocating from decor).
3. If the user asks to change the guest count, date, budget, or theme, propose the exact field changes.
4. For budget adjustments, propose specific category updates, additions, or reductions.
5. Return RAW JSON ONLY matching this schema without markdown code blocks:
{
  "user_intent_summary": "Short 1-line recap of what the user wants to accomplish",
  "is_feasible": true,
  "infeasibility_reason": null,
  "trade_offs_explanation": "Clear explanation of trade-offs and impacts",
  "event_field_changes": [
    {
      "field": "total_budget | guest_count | event_date | theme | title | location",
      "old_value": "previous value",
      "new_value": "new value",
      "reason": "Why this field changes"
    }
  ],
  "budget_changes": [
    {
      "action": "update | add | delete",
      "category": "Category name",
      "old_estimated_cost": 5000,
      "new_estimated_cost": 4200,
      "description": "Optional notes",
      "reason": "Why this category changes"
    }
  ],
  "task_changes": [
    {
      "action": "add | update | delete",
      "title": "Task title",
      "description": "Task description",
      "priority": "low | medium | high | urgent",
      "due_at": "YYYY-MM-DD or null",
      "reason": "Why this task is proposed"
    }
  ],
  "alternative_suggestions": [
    "Alternative or supplementary creative suggestion 1",
    "Alternative suggestion 2"
  ]
}`;
}

export async function generateCopilotProposal(
  event: EventRecord,
  budgetItems: BudgetItemRecord[],
  tasks: TaskRecord[],
  userRequest: string,
  mockOutput?: string
): Promise<StructuredChangeProposal> {
  const prompt = buildCopilotPrompt(event, budgetItems, tasks, userRequest);
  const systemInstruction = "You are an expert AI event financial & logistics copilot. Always output raw JSON only.";

  const raw = mockOutput !== undefined
    ? mockOutput
    : await callGemini(systemInstruction, prompt);

  let cleaned = raw.trim();
  if (cleaned.startsWith("```json")) {
    cleaned = cleaned.replace(/^```json\s*/, "").replace(/\s*```$/, "");
  } else if (cleaned.startsWith("```")) {
    cleaned = cleaned.replace(/^```\s*/, "").replace(/\s*```$/, "");
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(cleaned);
  } catch (err: unknown) {
    throw new Error(`Copilot returned malformed output: ${err instanceof Error ? err.message : "Parse error"}`);
  }

  const validated = validateChangeProposal(parsed);
  if (!validated.success || !validated.data) {
    throw new Error(`Copilot proposal schema validation failed: ${validated.errors?.join(", ")}`);
  }

  return validated.data;
}
