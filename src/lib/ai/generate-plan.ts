// ==============================================================================
// EventPilot AI - Generate Plan Service
// Orchestrates Gemini calling, schema validation, and bounded retry logic
// ==============================================================================

import { callGemini, GeminiServiceError } from "./client";
import { buildEventPlanSystemPrompt, buildEventPlanUserPrompt } from "./prompts";
import { validateEventPlanSchema, type GeneratedEventPlan } from "./schemas";
import type { EventRecord } from "@/types";

export interface GeneratePlanResult {
  plan: GeneratedEventPlan;
  attemptCount: number;
}

const MAX_RETRIES = 2; // Bounded retries: max 2 attempts to protect token usage & avoid infinite loops

export async function generateEventPlan(
  event: EventRecord,
  customMockOutput?: string
): Promise<GeneratePlanResult> {
  const systemPrompt = buildEventPlanSystemPrompt();
  const userPrompt = buildEventPlanUserPrompt(event);

  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      // Allow passing mock output during tests
      const rawResponse = customMockOutput !== undefined
        ? customMockOutput
        : await callGemini(systemPrompt, userPrompt);

      // Clean response (strip any inadvertent markdown fences if present)
      let cleanedJson = rawResponse.trim();
      if (cleanedJson.startsWith("```json")) {
        cleanedJson = cleanedJson.replace(/^```json\s*/, "").replace(/\s*```$/, "");
      } else if (cleanedJson.startsWith("```")) {
        cleanedJson = cleanedJson.replace(/^```\s*/, "").replace(/\s*```$/, "");
      }

      let parsedObj: unknown;
      try {
        parsedObj = JSON.parse(cleanedJson);
      } catch (jsonErr) {
        throw new Error(`Invalid JSON syntax in AI model output: ${jsonErr instanceof Error ? jsonErr.message : "Parse failure"}`);
      }

      // Validate against strict typed schema with deterministic financial calculations
      const validation = validateEventPlanSchema(
        parsedObj,
        Number(event.total_budget),
        event.currency || "USD",
        event.guest_count || 1
      );

      if (!validation.success || !validation.data) {
        const errorList = validation.errors?.join("; ") || "Schema mismatch";
        throw new Error(`AI generated plan failed schema verification: ${errorList}`);
      }

      return {
        plan: validation.data,
        attemptCount: attempt,
      };
    } catch (err: unknown) {
      lastError = err instanceof Error ? err : new Error(String(err));

      // Don't retry on rate limit or authentication errors
      if (err instanceof GeminiServiceError && (err.statusCode === 429 || err.statusCode === 503 || err.statusCode === 401 || err.statusCode === 403)) {
        throw err;
      }

      if (attempt === MAX_RETRIES) {
        break;
      }
    }
  }

  throw lastError || new Error("Failed to generate valid event plan after retries.");
}
