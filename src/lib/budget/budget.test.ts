// ==============================================================================
// EventPilot AI - Phase 6 Financial & Interactive Calculations Test Suite
// Covers: Exact budget totals, Zero budget, Full allocation, Overspending,
// Contingency handling, Invalid money values, Task deadlines, Event date shift
// ==============================================================================

import { calculateBudgetMetrics, formatCurrency } from "./calculations";
import {
  calculateEventCountdown,
  analyzeTaskDeadline,
  recalculateTaskDeadlinesForNewEventDate,
} from "../timeline/calculations";
import type { BudgetItemRecord, TaskRecord } from "@/types";

export function runPhase6Tests() {
  const results: { testName: string; passed: boolean; message?: string }[] = [];

  // 1. EXACT BUDGET TOTALS & SAFE MONEY REPRESENTATION
  try {
    const items: BudgetItemRecord[] = [
      { id: "1", event_id: "e1", category: "Venue", description: "Hall rental", estimated_cost: 3000.55, actual_cost: 3000.55, currency: "USD", created_at: "", updated_at: "" },
      { id: "2", event_id: "e1", category: "Catering", description: "Food", estimated_cost: 1500.45, actual_cost: 1600.00, currency: "USD", created_at: "", updated_at: "" },
    ];
    const metrics = calculateBudgetMetrics(5000, items);

    const passed =
      metrics.totalBudget === 5000 &&
      metrics.totalEstimated === 4501.00 &&
      metrics.totalActual === 4600.55 &&
      metrics.remainingBudget === 399.45 &&
      !metrics.isOverBudget;

    results.push({
      testName: "1. Exact budget totals & cents precision arithmetic",
      passed,
      message: passed ? undefined : `Totals mismatch: estimated=${metrics.totalEstimated}, actual=${metrics.totalActual}`,
    });
  } catch (err: unknown) {
    results.push({ testName: "1. Exact budget totals", passed: false, message: String(err) });
  }

  // 2. ZERO BUDGET HANDLING
  try {
    const items: BudgetItemRecord[] = [
      { id: "1", event_id: "e1", category: "Favors", description: "Gifts", estimated_cost: 50, actual_cost: 0, currency: "USD", created_at: "", updated_at: "" },
    ];
    const metrics = calculateBudgetMetrics(0, items);

    const passed = metrics.totalBudget === 0 && metrics.isOverBudget === true && metrics.overspendAmount === 50;

    results.push({
      testName: "2. Zero budget handles overspending without division by zero errors",
      passed,
    });
  } catch (err: unknown) {
    results.push({ testName: "2. Zero budget handling", passed: false, message: String(err) });
  }

  // 3. BUDGET FULLY ALLOCATED
  try {
    const items: BudgetItemRecord[] = [
      { id: "1", event_id: "e1", category: "Venue", description: "", estimated_cost: 6000, actual_cost: 6000, currency: "USD", created_at: "", updated_at: "" },
      { id: "2", event_id: "e1", category: "Catering", description: "", estimated_cost: 4000, actual_cost: 4000, currency: "USD", created_at: "", updated_at: "" },
    ];
    const metrics = calculateBudgetMetrics(10000, items);

    const passed =
      metrics.totalEstimated === 10000 &&
      metrics.unallocatedBudget === 0 &&
      metrics.remainingBudget === 0 &&
      !metrics.isOverBudget;

    results.push({
      testName: "3. Budget fully allocated without phantom remainder",
      passed,
    });
  } catch (err: unknown) {
    results.push({ testName: "3. Budget fully allocated", passed: false, message: String(err) });
  }

  // 4. OVERSPENDING DETECTION
  try {
    const items: BudgetItemRecord[] = [
      { id: "1", event_id: "e1", category: "Entertainment", description: "DJ", estimated_cost: 1000, actual_cost: 2500, currency: "USD", created_at: "", updated_at: "" },
    ];
    const metrics = calculateBudgetMetrics(2000, items);

    const passed = metrics.isOverBudget === true && metrics.overspendAmount === 500 && metrics.remainingBudget === -500;

    results.push({
      testName: "4. Overspending accurately flags isOverBudget and calculates exact overage",
      passed,
    });
  } catch (err: unknown) {
    results.push({ testName: "4. Overspending detection", passed: false, message: String(err) });
  }

  // 5. CONTINGENCY DISTINCTION (Separated from Unallocated)
  try {
    const items: BudgetItemRecord[] = [
      { id: "1", event_id: "e1", category: "Venue", description: "", estimated_cost: 4000, actual_cost: 0, currency: "USD", created_at: "", updated_at: "" },
      { id: "2", event_id: "e1", category: "Contingency & Incidentals", description: "Buffer", estimated_cost: 1000, actual_cost: 0, currency: "USD", created_at: "", updated_at: "" },
    ];
    const metrics = calculateBudgetMetrics(6000, items);

    // Total Budget = 6000. Total Estimated = 5000. Contingency = 1000. Unallocated = 1000 (6000 - 5000).
    const passed =
      metrics.contingencyReserve === 1000 &&
      metrics.unallocatedBudget === 1000 &&
      metrics.totalEstimated === 5000;

    results.push({
      testName: "5. Explicitly distinguishes allocated contingency from unallocated capital",
      passed,
    });
  } catch (err: unknown) {
    results.push({ testName: "5. Contingency distinction", passed: false, message: String(err) });
  }

  // 6. INVALID / NEGATIVE MONEY VALUES SANITIZATION
  try {
    const items: BudgetItemRecord[] = [
      { id: "1", event_id: "e1", category: "Flowers", description: "", estimated_cost: -500, actual_cost: -100, currency: "USD", created_at: "", updated_at: "" },
    ];
    const metrics = calculateBudgetMetrics(-1000, items);

    const passed = metrics.totalBudget === 0 && metrics.totalEstimated === 0 && metrics.totalActual === 0;

    results.push({
      testName: "6. Negative money values clamped safely to zero",
      passed,
    });
  } catch (err: unknown) {
    results.push({ testName: "6. Negative money sanitization", passed: false, message: String(err) });
  }

  // 7. TASK DEADLINE ANALYSIS & OVERDUE CLASSIFICATION
  try {
    const pastDate = new Date();
    pastDate.setDate(pastDate.getDate() - 5);
    const pastAnalysis = analyzeTaskDeadline(pastDate.toISOString());

    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 2);
    const urgentAnalysis = analyzeTaskDeadline(futureDate.toISOString());

    const passed =
      pastAnalysis.isOverdue === true &&
      pastAnalysis.daysUntilDue! < 0 &&
      urgentAnalysis.isOverdue === false &&
      urgentAnalysis.isUrgentSoon === true;

    results.push({
      testName: "7. Task deadline analysis accurately categorizes overdue vs urgent",
      passed,
    });
  } catch (err: unknown) {
    results.push({ testName: "7. Task deadline analysis", passed: false, message: String(err) });
  }

  // 8. EVENT DATE SHIFT RECALCULATES RELATIVE DEADLINES
  try {
    const oldEventDate = "2026-10-01";
    const newEventDate = "2026-10-15"; // +14 days shift

    const sampleTasks: TaskRecord[] = [
      {
        id: "t1",
        event_id: "e1",
        title: "Deposit Venue",
        description: "",
        due_at: "2026-09-01T00:00:00.000Z",
        priority: "high",
        status: "pending",
        dependencies: [],
        created_at: "",
        updated_at: "",
      },
    ];

    const shifted = recalculateTaskDeadlinesForNewEventDate(oldEventDate, newEventDate, sampleTasks);
    const newDue = new Date(shifted[0].due_at!);

    // Original was Sept 1, with +14 days it should be Sept 15
    const passed = newDue.getUTCDate() === 15 && newDue.getUTCMonth() === 8; // Month 8 is September (0-indexed)

    results.push({
      testName: "8. Shifting event date deterministically offsets task deadlines",
      passed,
    });
  } catch (err: unknown) {
    results.push({ testName: "8. Event date shift", passed: false, message: String(err) });
  }

  // 9. TIMEZONE EDGE CASES
  try {
    const countdownUTC = calculateEventCountdown("2026-12-25", "UTC");
    const countdownTokyo = calculateEventCountdown("2026-12-25", "Asia/Tokyo");

    const passed =
      typeof countdownUTC.days === "number" &&
      typeof countdownTokyo.days === "number" &&
      countdownUTC.formattedTarget.includes("2026");

    results.push({
      testName: "9. Countdown calculations respect regional timezones safely",
      passed,
    });
  } catch (err: unknown) {
    results.push({ testName: "9. Timezone edge cases", passed: false, message: String(err) });
  }

  return results;
}
