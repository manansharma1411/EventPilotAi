// ==============================================================================
// EventPilot AI - Generated Event Plan Schema & Contracts
// Strongly typed contracts with runtime validation & financial constraints
// ==============================================================================

export interface BudgetCategoryPlan {
  category: string;
  description: string;
  percentage: number; // 0 to 100
  estimated_cost: number; // Computed exact numeric
  is_estimate: true;
}

export interface TaskPlanItem {
  title: string;
  description: string;
  priority: "low" | "medium" | "high" | "urgent";
  days_relative_to_event: number; // e.g., -60 means 60 days before event date
  category: string;
}

export interface VendorNeed {
  category: string;
  necessity: "essential" | "recommended" | "optional";
  estimated_cost_range: string;
  suggested_questions: string[];
}

export interface ActivityScheduleItem {
  time_or_milestone: string;
  activity_name: string;
  description: string;
  duration_minutes: number;
}

export interface GeneratedEventPlan {
  event_summary: string;
  theme_and_rationale: {
    theme_name: string;
    rationale: string;
    color_palette: string[];
    decor_ideas: string[];
  };
  personalized_ideas: string[];
  budget_categories: BudgetCategoryPlan[];
  task_checklist: TaskPlanItem[];
  vendor_categories_needed: VendorNeed[];
  suggested_activities: ActivityScheduleItem[];
  planning_assumptions: string[];
  risks_and_missing_info: {
    identified_risks: string[];
    missing_information: string[];
    recommendations: string[];
  };
  metadata: {
    total_budget: number;
    currency: string;
    guest_count: number;
    generated_at: string;
    model: string;
    unverified_estimates_disclaimer: string;
  };
}

export interface PlanValidationResult {
  success: boolean;
  data?: GeneratedEventPlan;
  errors?: string[];
}

// Bounded runtime schema validation (Zero external dependencies)
export function validateEventPlanSchema(raw: unknown, totalBudget: number, currency: string, guestCount: number): PlanValidationResult {
  const errors: string[] = [];

  if (!raw || typeof raw !== "object") {
    return { success: false, errors: ["Plan payload must be a JSON object"] };
  }

  const obj = raw as Record<string, unknown>;

  // 1. Event summary
  if (typeof obj.event_summary !== "string" || obj.event_summary.trim().length < 10) {
    errors.push("event_summary must be a non-empty descriptive string (min 10 characters)");
  }

  // 2. Theme & Rationale
  if (!obj.theme_and_rationale || typeof obj.theme_and_rationale !== "object") {
    errors.push("theme_and_rationale must be an object with theme_name, rationale, color_palette, decor_ideas");
  } else {
    const tr = obj.theme_and_rationale as Record<string, unknown>;
    if (typeof tr.theme_name !== "string" || !tr.theme_name.trim()) errors.push("theme_and_rationale.theme_name is required");
    if (typeof tr.rationale !== "string" || !tr.rationale.trim()) errors.push("theme_and_rationale.rationale is required");
    if (!Array.isArray(tr.color_palette) || tr.color_palette.length === 0) errors.push("theme_and_rationale.color_palette must be an array of colors");
  }

  // 3. Personalized ideas
  if (!Array.isArray(obj.personalized_ideas) || obj.personalized_ideas.length === 0) {
    errors.push("personalized_ideas must be a non-empty array of creative suggestions");
  }

  // 4. Budget Categories
  let parsedBudgetCategories: BudgetCategoryPlan[] = [];
  if (!Array.isArray(obj.budget_categories) || obj.budget_categories.length === 0) {
    errors.push("budget_categories must be a non-empty array");
  } else {
    let totalPercentage = 0;
    parsedBudgetCategories = (obj.budget_categories as Record<string, unknown>[]).map((bc, idx) => {
      const category = typeof bc.category === "string" && bc.category.trim() ? bc.category.trim() : `Category ${idx + 1}`;
      const description = typeof bc.description === "string" ? bc.description.trim() : "";
      const rawPct = typeof bc.percentage === "number" ? bc.percentage : parseFloat(String(bc.percentage || 0));
      const percentage = isNaN(rawPct) || rawPct <= 0 ? 10 : rawPct;
      totalPercentage += percentage;

      // Deterministic financial arithmetic on server side: never trust LLM addition
      const estimated_cost = Math.round(((percentage / 100) * totalBudget) * 100) / 100;

      return {
        category,
        description,
        percentage,
        estimated_cost,
        is_estimate: true,
      };
    });

    // Normalize percentages deterministically so they sum to 100% exactly
    if (parsedBudgetCategories.length > 0 && Math.abs(totalPercentage - 100) > 0.01) {
      let runningSum = 0;
      parsedBudgetCategories = parsedBudgetCategories.map((bc, index) => {
        if (index === parsedBudgetCategories.length - 1) {
          // Final category absorbs remainder to ensure exact 100% and totalBudget
          const remainingPct = Math.round((100 - runningSum) * 10) / 10;
          const remainingCost = Math.round((totalBudget - parsedBudgetCategories.slice(0, index).reduce((acc, c) => acc + c.estimated_cost, 0)) * 100) / 100;
          return {
            ...bc,
            percentage: remainingPct,
            estimated_cost: Math.max(0, remainingCost),
          };
        }
        const normalizedPct = Math.round(((bc.percentage / totalPercentage) * 100) * 10) / 10;
        runningSum += normalizedPct;
        const normalizedCost = Math.round(((normalizedPct / 100) * totalBudget) * 100) / 100;
        return {
          ...bc,
          percentage: normalizedPct,
          estimated_cost: normalizedCost,
        };
      });
    }
  }

  // 5. Task Checklist
  let parsedTasks: TaskPlanItem[] = [];
  if (!Array.isArray(obj.task_checklist) || obj.task_checklist.length === 0) {
    errors.push("task_checklist must be a non-empty array of milestones");
  } else {
    parsedTasks = (obj.task_checklist as Record<string, unknown>[]).map((t, idx) => {
      const title = typeof t.title === "string" && t.title.trim() ? t.title.trim() : `Milestone Task ${idx + 1}`;
      const description = typeof t.description === "string" ? t.description.trim() : "";
      const validPriorities = ["low", "medium", "high", "urgent"];
      const priority = (typeof t.priority === "string" && validPriorities.includes(t.priority) ? t.priority : "medium") as TaskPlanItem["priority"];
      const days_relative_to_event = typeof t.days_relative_to_event === "number" ? t.days_relative_to_event : -14;
      const category = typeof t.category === "string" ? t.category : "Logistics";

      return {
        title,
        description,
        priority,
        days_relative_to_event,
        category,
      };
    });
  }

  // 6. Vendor categories needed
  let parsedVendors: VendorNeed[] = [];
  if (Array.isArray(obj.vendor_categories_needed)) {
    parsedVendors = (obj.vendor_categories_needed as Record<string, unknown>[]).map((v, idx) => ({
      category: typeof v.category === "string" ? v.category.trim() : `Vendor Service ${idx + 1}`,
      necessity: (typeof v.necessity === "string" && ["essential", "recommended", "optional"].includes(v.necessity) ? v.necessity : "recommended") as VendorNeed["necessity"],
      estimated_cost_range: typeof v.estimated_cost_range === "string" ? v.estimated_cost_range : "Estimate based on local rates",
      suggested_questions: Array.isArray(v.suggested_questions) ? (v.suggested_questions as string[]) : [],
    }));
  }

  // 7. Suggested activities
  let parsedActivities: ActivityScheduleItem[] = [];
  if (Array.isArray(obj.suggested_activities)) {
    parsedActivities = (obj.suggested_activities as Record<string, unknown>[]).map((a, idx) => ({
      time_or_milestone: typeof a.time_or_milestone === "string" ? a.time_or_milestone : `Phase ${idx + 1}`,
      activity_name: typeof a.activity_name === "string" ? a.activity_name : `Activity ${idx + 1}`,
      description: typeof a.description === "string" ? a.description : "",
      duration_minutes: typeof a.duration_minutes === "number" ? a.duration_minutes : 60,
    }));
  }

  // 8. Planning assumptions and risks
  const planning_assumptions: string[] = Array.isArray(obj.planning_assumptions)
    ? (obj.planning_assumptions.filter((s): s is string => typeof s === "string"))
    : ["All costs and dates are preliminary projections subject to market availability."];

  const rawRisks = (obj.risks_and_missing_info && typeof obj.risks_and_missing_info === "object" ? obj.risks_and_missing_info : {}) as Record<string, unknown>;
  const risks_and_missing_info = {
    identified_risks: Array.isArray(rawRisks.identified_risks) ? (rawRisks.identified_risks as string[]) : [],
    missing_information: Array.isArray(rawRisks.missing_information) ? (rawRisks.missing_information as string[]) : [],
    recommendations: Array.isArray(rawRisks.recommendations) ? (rawRisks.recommendations as string[]) : [],
  };

  if (errors.length > 0) {
    return { success: false, errors };
  }

  const validatedPlan: GeneratedEventPlan = {
    event_summary: String(obj.event_summary).trim(),
    theme_and_rationale: obj.theme_and_rationale as GeneratedEventPlan["theme_and_rationale"],
    personalized_ideas: obj.personalized_ideas as string[],
    budget_categories: parsedBudgetCategories,
    task_checklist: parsedTasks,
    vendor_categories_needed: parsedVendors,
    suggested_activities: parsedActivities,
    planning_assumptions,
    risks_and_missing_info,
    metadata: {
      total_budget: totalBudget,
      currency,
      guest_count: guestCount,
      generated_at: new Date().toISOString(),
      model: "gemini-2.5-flash",
      unverified_estimates_disclaimer: "All budget amounts, vendor categories, and timelines are AI-generated preliminary estimates. Verify quotes and real contract terms directly with vendors.",
    },
  };

  return {
    success: true,
    data: validatedPlan,
  };
}
