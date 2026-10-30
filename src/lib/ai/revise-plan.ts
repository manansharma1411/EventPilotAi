// ==============================================================================
// EventPilot AI - Revise Plan Service
// Orchestrates Gemini calling for plan revisions based on user instructions
// ==============================================================================

import { callGemini } from "./client";
import { buildEventPlanSystemPrompt, buildRevisePlanPrompt } from "./prompts";
import { validateEventPlanSchema, type GeneratedEventPlan } from "./schemas";
import type { EventRecord } from "@/types";

export interface RevisePlanResult {
  plan: GeneratedEventPlan;
  changeSummary: string;
}

export async function reviseEventPlan(
  event: EventRecord,
  existingPlan: GeneratedEventPlan,
  userInstruction: string,
  customMockOutput?: string
): Promise<RevisePlanResult> {
  const systemPrompt = buildEventPlanSystemPrompt();
  const userPrompt = buildRevisePlanPrompt(JSON.stringify(existingPlan, null, 2), userInstruction);

  const rawResponse = customMockOutput !== undefined
    ? customMockOutput
    : await callGemini(systemPrompt, userPrompt);

  let cleanedJson = rawResponse.trim();
  if (cleanedJson.startsWith("```json")) {
    cleanedJson = cleanedJson.replace(/^```json\s*/, "").replace(/\s*```$/, "");
  } else if (cleanedJson.startsWith("```")) {
    cleanedJson = cleanedJson.replace(/^```\s*/, "").replace(/\s*```$/, "");
  }

  const parsedObj = JSON.parse(cleanedJson);

  const validation = validateEventPlanSchema(
    parsedObj,
    Number(event.total_budget),
    event.currency || "USD",
    event.guest_count || 1
  );

  if (!validation.success || !validation.data) {
    throw new Error(`Plan revision failed schema verification: ${validation.errors?.join("; ")}`);
  }

  return {
    plan: validation.data,
    changeSummary: `Applied user revision: "${userInstruction.slice(0, 100)}${userInstruction.length > 100 ? "..." : ""}"`,
  };
}
