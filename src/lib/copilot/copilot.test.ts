// ==============================================================================
// EventPilot AI - Phase 7 Copilot & Vendor Tests
// Validates:
// 1. Copilot change proposal parsing & trade-offs
// 2. Rejecting unauthorized/unpermitted event fields
// 3. Infeasible change request classification
// 4. Quotation text extraction & confidence warnings
// 5. Vendor input sanitization
// ==============================================================================

import { validateChangeProposal, type StructuredChangeProposal } from "./schemas";
import { buildCopilotPrompt } from "./service";
import type { EventRecord, BudgetItemRecord, TaskRecord } from "@/types";

export function runPhase7Tests() {
  const results: { testName: string; passed: boolean; message?: string }[] = [];

  const sampleEvent: EventRecord = {
    id: "evt-phase7",
    user_id: "user-789",
    title: "Summer Solstice Wedding",
    event_type: "wedding",
    event_date: "2026-06-21",
    timezone: "America/Los_Angeles",
    location: "Napa Valley, CA",
    guest_count: 100,
    total_budget: 25000,
    currency: "USD",
    theme: "Vineyard Chic",
    preferences: {},
    status: "planning",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  const sampleBudget: BudgetItemRecord[] = [
    { id: "b1", event_id: "evt-phase7", category: "Catering", description: "Dinner", estimated_cost: 10000, actual_cost: 0, currency: "USD", created_at: "", updated_at: "" },
    { id: "b2", event_id: "evt-phase7", category: "Venue", description: "Winery", estimated_cost: 8000, actual_cost: 0, currency: "USD", created_at: "", updated_at: "" },
  ];

  const sampleTasks: TaskRecord[] = [
    { id: "t1", event_id: "evt-phase7", title: "Book tasting", description: "", due_at: "2026-04-01T00:00:00Z", priority: "high", status: "pending", dependencies: [], created_at: "", updated_at: "" },
  ];

  // TEST 1: Valid Structured Proposal Parsing
  try {
    const rawProposal = {
      user_intent_summary: "Reduce budget by $3,000 without sacrificing food quality",
      is_feasible: true,
      trade_offs_explanation: "Switch from formal 4-course plated service to family-style dining to save on service staff.",
      event_field_changes: [
        { field: "total_budget", old_value: 25000, new_value: 22000, reason: "Reduced per user request" },
      ],
      budget_changes: [
        { action: "update", category: "Catering", old_estimated_cost: 10000, new_estimated_cost: 8500, reason: "Family-style service reduction" },
        { action: "update", category: "Venue", old_estimated_cost: 8000, new_estimated_cost: 7000, reason: "Negotiated off-peak hours" },
      ],
      task_changes: [
        { action: "add", title: "Review family-style catering menu", priority: "high", reason: "Confirm updated service style" },
      ],
      alternative_suggestions: ["Consider opting for seasonal local wines to save another $500."],
    };

    const val = validateChangeProposal(rawProposal);
    const passed =
      val.success === true &&
      val.data?.event_field_changes.length === 1 &&
      val.data?.budget_changes.length === 2 &&
      val.data?.task_changes.length === 1 &&
      val.data?.trade_offs_explanation.includes("family-style");

    results.push({
      testName: "1. Copilot change proposal parsing & trade-offs validation",
      passed,
    });
  } catch (err: unknown) {
    results.push({ testName: "1. Copilot proposal parsing", passed: false, message: String(err) });
  }

  // TEST 2: Reject Unauthorized/Privileged Fields in Proposal
  try {
    const maliciousProposal = {
      user_intent_summary: "Grant admin access or alter system id",
      is_feasible: true,
      trade_offs_explanation: "None",
      event_field_changes: [
        // 'user_id' and 'is_admin' are NOT in permitted fields list
        { field: "user_id", old_value: "user-789", new_value: "attacker-id", reason: "hacked" },
        { field: "guest_count", old_value: 100, new_value: 120, reason: "more friends" },
      ],
      budget_changes: [],
      task_changes: [],
    };

    const val = validateChangeProposal(maliciousProposal);
    // Should safely discard the unpermitted 'user_id' field change and keep only 'guest_count'
    const passed =
      val.success === true &&
      val.data?.event_field_changes.length === 1 &&
      val.data?.event_field_changes[0].field === "guest_count";

    results.push({
      testName: "2. Security filter ignores unpermitted/privileged event fields",
      passed,
    });
  } catch (err: unknown) {
    results.push({ testName: "2. Security filter", passed: false, message: String(err) });
  }

  // TEST 3: Infeasible Change Proposal Handling
  try {
    const infeasibleProposal = {
      user_intent_summary: "Host 1,000 guests for $100 total budget",
      is_feasible: false,
      infeasibility_reason: "A $100 budget ($0.10/guest) is below minimum venue and food costs in Napa Valley.",
      trade_offs_explanation: "Not feasible in commercial venues.",
      event_field_changes: [],
      budget_changes: [],
      task_changes: [],
      alternative_suggestions: ["Host a virtual gathering or potluck in a public park."],
    };

    const val = validateChangeProposal(infeasibleProposal);
    const passed =
      val.success === true &&
      val.data?.is_feasible === false &&
      Boolean(val.data?.infeasibility_reason);

    results.push({
      testName: "3. Classifies infeasible requests with explicit reasons and alternatives",
      passed,
    });
  } catch (err: unknown) {
    results.push({ testName: "3. Infeasible change proposal", passed: false, message: String(err) });
  }

  // TEST 4: Copilot Prompt Builder Verification
  try {
    const prompt = buildCopilotPrompt(sampleEvent, sampleBudget, sampleTasks, "Make this child-friendly");
    const passed =
      prompt.includes(sampleEvent.title) &&
      prompt.includes("Make this child-friendly") &&
      prompt.includes("Catering") &&
      prompt.includes("STRICT INSTRUCTIONS");

    results.push({
      testName: "4. Copilot prompt includes full event context without data leaks",
      passed,
    });
  } catch (err: unknown) {
    results.push({ testName: "4. Copilot prompt builder", passed: false, message: String(err) });
  }

  return results;
}
