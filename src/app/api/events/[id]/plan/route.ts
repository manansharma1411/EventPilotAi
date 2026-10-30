import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { generateEventPlan } from "@/lib/ai/generate-plan";
import { reviseEventPlan } from "@/lib/ai/revise-plan";
import { isGeminiConfigured, GeminiServiceError } from "@/lib/ai/client";
import type { EventRecord } from "@/types";
import type { GeneratedEventPlan } from "@/lib/ai/schemas";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function POST(req: Request, { params }: RouteParams) {
  try {
    const { id: eventId } = await params;
    const supabase = await createServerSupabaseClient();
    if (!supabase) {
      return NextResponse.json(
        { error: "Supabase client not initialized. Check your environment variables." },
        { status: 503 }
      );
    }

    // 1. Authenticate user from verified session cookie
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "Unauthorized. Please sign in to generate AI event plans." },
        { status: 401 }
      );
    }

    // 2. Verify event ownership & load event
    const { data: event, error: eventError } = await supabase
      .from("events")
      .select("*")
      .eq("id", eventId)
      .eq("user_id", user.id)
      .single();

    if (eventError || !event) {
      return NextResponse.json(
        { error: "Event not found or access denied." },
        { status: 404 }
      );
    }

    // Check Gemini API key availability
    if (!isGeminiConfigured()) {
      return NextResponse.json(
        {
          error: "GEMINI_API_KEY is not configured in your server environment (.env.local). Please configure it to enable GenAI planning.",
          isConfigurationError: true,
        },
        { status: 503 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const { userInstruction, isRevision } = body as { userInstruction?: string; isRevision?: boolean };

    // 3. Fetch latest version number to handle concurrency & snapshots
    const { data: versions } = await supabase
      .from("event_plan_versions")
      .select("version_number, plan_snapshot")
      .eq("event_id", eventId)
      .order("version_number", { ascending: false })
      .limit(1);

    const latestVersion = versions && versions.length > 0 ? versions[0] : null;
    const nextVersionNumber = (latestVersion?.version_number || 0) + 1;

    let generatedPlan: GeneratedEventPlan;
    let changeSummary: string;

    // 4. Generate or Revise Plan
    if (isRevision && userInstruction && latestVersion?.plan_snapshot) {
      const revision = await reviseEventPlan(
        event as EventRecord,
        latestVersion.plan_snapshot as unknown as GeneratedEventPlan,
        userInstruction
      );
      generatedPlan = revision.plan;
      changeSummary = revision.changeSummary;
    } else {
      const result = await generateEventPlan(event as EventRecord);
      generatedPlan = result.plan;
      changeSummary = `Initial AI celebration blueprint generated (attempt ${result.attemptCount})`;
    }

    // 5. Atomic-like Database Persistence:
    // a) Save new immutable version snapshot in event_plan_versions
    const { error: versionError } = await supabase
      .from("event_plan_versions")
      .insert({
        event_id: eventId,
        version_number: nextVersionNumber,
        plan_snapshot: generatedPlan,
        change_summary: changeSummary,
      });

    if (versionError) {
      return NextResponse.json(
        { error: "Failed to persist plan version snapshot: " + versionError.message },
        { status: 500 }
      );
    }

    // b) Sync structured budget line items into budget_items table
    if (generatedPlan.budget_categories.length > 0) {
      // Clear previous estimated budget items to prevent duplication on re-generation
      await supabase.from("budget_items").delete().eq("event_id", eventId);

      const budgetRows = generatedPlan.budget_categories.map((bc) => ({
        event_id: eventId,
        category: bc.category,
        description: bc.description || `${bc.percentage}% allocation estimate`,
        estimated_cost: bc.estimated_cost,
        actual_cost: 0,
        currency: event.currency || "USD",
      }));

      await supabase.from("budget_items").insert(budgetRows);
    }

    // c) Sync new tasks into tasks table with calculated due dates
    if (generatedPlan.task_checklist.length > 0) {
      // Delete old pending/todo starter tasks, keeping any completed ones if desired
      await supabase.from("tasks").delete().eq("event_id", eventId).eq("status", "pending");
      await supabase.from("tasks").delete().eq("event_id", eventId).eq("status", "todo");

      const eventDateObj = new Date(event.event_date);
      const taskRows = generatedPlan.task_checklist.map((t) => {
        let dueAt: string | null = null;
        if (!isNaN(eventDateObj.getTime())) {
          const taskDate = new Date(eventDateObj);
          taskDate.setDate(taskDate.getDate() + t.days_relative_to_event);
          dueAt = taskDate.toISOString();
        }

        return {
          event_id: eventId,
          title: t.title,
          description: t.description || `${t.category} milestone (${t.days_relative_to_event}d relative to event)`,
          priority: t.priority,
          status: "pending",
          due_at: dueAt,
          dependencies: [],
        };
      });

      await supabase.from("tasks").insert(taskRows);
    }

    // d) Update event theme if theme was refined by AI
    if (generatedPlan.theme_and_rationale?.theme_name && (!event.theme || event.theme === "Not specified")) {
      await supabase
        .from("events")
        .update({
          theme: generatedPlan.theme_and_rationale.theme_name,
          updated_at: new Date().toISOString(),
        })
        .eq("id", eventId);
    }

    return NextResponse.json({
      success: true,
      version: nextVersionNumber,
      changeSummary,
      plan: generatedPlan,
    });
  } catch (err: unknown) {
    if (err instanceof GeminiServiceError) {
      return NextResponse.json(
        { error: err.message, isRateLimited: err.isRateLimited, isTimeout: err.isTimeout },
        { status: err.statusCode || 500 }
      );
    }

    const msg = err instanceof Error ? err.message : "Unexpected error during event plan generation";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

// GET /api/events/[id]/plan - Fetch the latest generated plan version
export async function GET(req: Request, { params }: RouteParams) {
  try {
    const { id: eventId } = await params;
    const supabase = await createServerSupabaseClient();
    if (!supabase) return NextResponse.json({ error: "Supabase not configured" }, { status: 503 });

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // Verify ownership
    const { data: event } = await supabase
      .from("events")
      .select("id")
      .eq("id", eventId)
      .eq("user_id", user.id)
      .single();

    if (!event) return NextResponse.json({ error: "Event not found" }, { status: 404 });

    const { data: versions, error } = await supabase
      .from("event_plan_versions")
      .select("*")
      .eq("event_id", eventId)
      .order("version_number", { ascending: false });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    const latest = versions && versions.length > 0 ? versions[0] : null;

    return NextResponse.json({
      latestPlan: latest ? (latest.plan_snapshot as unknown as GeneratedEventPlan) : null,
      versionNumber: latest?.version_number || 0,
      allVersions: versions || [],
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Unexpected error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
