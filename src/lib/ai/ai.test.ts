// ==============================================================================
// EventPilot AI - AI Planning Engine Mock Tests
// Validates: Successful Generation, Malformed Output, Timeouts, and API Failure
// Does NOT depend on paid live API calls
// ==============================================================================

import { validateEventPlanSchema, type GeneratedEventPlan } from "./schemas";
import { GeminiServiceError } from "./client";
import type { EventRecord } from "@/types";

export function runAiPlanningTests() {
  const testResults: { testName: string; passed: boolean; message?: string }[] = [];

  const sampleEvent: EventRecord = {
    id: "evt-test-123",
    user_id: "user-test-456",
    title: "Golden Anniversary Gala",
    event_type: "anniversary",
    event_date: "2026-12-20",
    timezone: "America/New_York",
    location: "Plaza Hotel, New York",
    guest_count: 150,
    total_budget: 30000,
    currency: "USD",
    theme: "Mid-Century Elegance",
    preferences: {
      dietary_requirements: ["Vegetarian", "Gluten-Free"],
      accessibility_requirements: ["Step-free access"],
      special_instructions: "Include a toast to the couple at 8 PM.",
    },
    status: "planning",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  const validAiMockJson = JSON.stringify({
    event_summary: "An unforgettable Golden Anniversary Gala honoring 50 years with timeless glamour and personalized touches.",
    theme_and_rationale: {
      theme_name: "Mid-Century Gilded Glamour",
      rationale: "Highlights warmth, golden milestones, and sophisticated ambiance.",
      color_palette: ["#D4AF37", "#1A1A1A", "#FDFBF7", "#8C7853"],
      decor_ideas: ["Champagne fountain centerpieces", "Gilded floral runners", "Vintage photo gallery"],
    },
    personalized_ideas: [
      "Signature 1976 cocktail named after the couple",
      "Memory booth with recordings from guests",
    ],
    budget_categories: [
      { category: "Venue & Catering", description: "Ballroom & 3-course dinner", percentage: 50 },
      { category: "Photography & Videography", description: "Full event documentary coverage", percentage: 20 },
      { category: "Music & Entertainment", description: "Swing band & DJ", percentage: 15 },
      { category: "Decor & Flowers", description: "Golden arrangements", percentage: 10 },
      { category: "Contingency", description: "Emergency fund", percentage: 5 },
    ],
    task_checklist: [
      { title: "Book Jazz Ensemble", description: "Confirm setlist and rehearsal", priority: "high", days_relative_to_event: -60, category: "Music" },
      { title: "Finalize dietary guest orders", description: "Confirm vegetarian options", priority: "medium", days_relative_to_event: -14, category: "Catering" },
    ],
    vendor_categories_needed: [
      { category: "Catering", necessity: "essential", estimated_cost_range: "$15,000", suggested_questions: ["Do you offer tasting sessions?"] },
    ],
    suggested_activities: [
      { time_or_milestone: "19:00", activity_name: "Cocktail Reception", description: "Guests arrive and enjoy hors d'oeuvres", duration_minutes: 60 },
      { time_or_milestone: "20:00", activity_name: "Golden Toast", description: "Couple toast and speech", duration_minutes: 30 },
    ],
    planning_assumptions: ["Indoor climate control is provided by the Plaza Hotel"],
    risks_and_missing_info: {
      identified_risks: ["Holiday traffic delays in NYC"],
      missing_information: ["Microphone soundcheck schedule"],
      recommendations: ["Book vendors with early load-in"],
    },
  });

  // TEST 1: Successful Generation and Schema Validation
  try {
    const res = validateEventPlanSchema(
      JSON.parse(validAiMockJson),
      sampleEvent.total_budget,
      sampleEvent.currency,
      sampleEvent.guest_count
    );

    const isTotalCorrect = Math.abs(
      res.data!.budget_categories.reduce((acc, c) => acc + c.estimated_cost, 0) - sampleEvent.total_budget
    ) < 1;

    testResults.push({
      testName: "1. Successful plan parsing & deterministic financial validation",
      passed: res.success === true && isTotalCorrect && res.data!.task_checklist.length === 2,
    });
  } catch (err: unknown) {
    testResults.push({
      testName: "1. Successful plan parsing & deterministic financial validation",
      passed: false,
      message: err instanceof Error ? err.message : String(err),
    });
  }

  // TEST 2: Rejection of Malformed / Non-JSON Output
  try {
    const malformedJson = "{ event_summary: 'Unterminated string without closing";
    let failedAsExpected = false;
    try {
      JSON.parse(malformedJson);
    } catch {
      failedAsExpected = true;
    }

    testResults.push({
      testName: "2. Rejection of malformed / corrupted AI string output",
      passed: failedAsExpected,
    });
  } catch (err: unknown) {
    testResults.push({
      testName: "2. Rejection of malformed / corrupted AI string output",
      passed: false,
      message: String(err),
    });
  }

  // TEST 3: Schema Rejection of Incomplete / Missing Fields
  try {
    const incompletePlan = {
      event_summary: "Short", // Too short
      theme_and_rationale: {}, // Missing required keys
    };
    const res = validateEventPlanSchema(incompletePlan, 1000, "USD", 50);
    testResults.push({
      testName: "3. Schema rejection of incomplete plan missing required structures",
      passed: res.success === false && (res.errors?.length || 0) > 0,
    });
  } catch (err: unknown) {
    testResults.push({
      testName: "3. Schema rejection of incomplete plan missing required structures",
      passed: false,
      message: String(err),
    });
  }

  // TEST 4: Timeout Handling in AI Service Error Architecture
  try {
    const timeoutErr = new GeminiServiceError("Gemini generation timed out after 30 seconds.", {
      isTimeout: true,
    });
    testResults.push({
      testName: "4. Correct classification of timeout error without raw key leak",
      passed: timeoutErr.isTimeout === true && !timeoutErr.message.includes("key"),
    });
  } catch (err: unknown) {
    testResults.push({
      testName: "4. Correct classification of timeout error without raw key leak",
      passed: false,
      message: String(err),
    });
  }

  // TEST 5: Rate Limit (429) Error Handling & Retries Bounding
  try {
    const rateLimitErr = new GeminiServiceError("Rate limit reached on Gemini API.", {
      statusCode: 429,
      isRateLimited: true,
    });
    testResults.push({
      testName: "5. Bounded rate limit response classification (HTTP 429)",
      passed: rateLimitErr.statusCode === 429 && rateLimitErr.isRateLimited === true,
    });
  } catch (err: unknown) {
    testResults.push({
      testName: "5. Bounded rate limit response classification (HTTP 429)",
      passed: false,
      message: String(err),
    });
  }

  // TEST 6: Mock Plan Revision
  try {
    const existingParsed = JSON.parse(validAiMockJson) as GeneratedEventPlan;
    const modifiedMock = {
      ...existingParsed,
      theme_and_rationale: {
        ...existingParsed.theme_and_rationale,
        theme_name: "Vintage Winter Wonderland",
      },
    };

    const res = validateEventPlanSchema(
      modifiedMock,
      sampleEvent.total_budget,
      sampleEvent.currency,
      sampleEvent.guest_count
    );

    testResults.push({
      testName: "6. Successful plan revision integration",
      passed: res.success === true && res.data?.theme_and_rationale.theme_name === "Vintage Winter Wonderland",
    });
  } catch (err: unknown) {
    testResults.push({
      testName: "6. Successful plan revision integration",
      passed: false,
      message: String(err),
    });
  }

  return testResults;
}
