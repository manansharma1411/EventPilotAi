import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { generateCopilotProposal } from "@/lib/copilot/service";
import { isGeminiConfigured, GeminiServiceError } from "@/lib/ai/client";
import type { EventRecord, BudgetItemRecord, TaskRecord } from "@/types";
import type { StructuredChangeProposal } from "@/lib/copilot/schemas";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// POST /api/events/[id]/copilot - Generate a proposal OR apply an approved proposal
export async function POST(req: Request, { params }: RouteParams) {
  try {
    const { id: eventId } = await params;
    const supabase = await createServerSupabaseClient();
    if (!supabase) return NextResponse.json({ error: "Supabase not configured" }, { status: 503 });

    // 1. Session Authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // 2. Ownership Verification
    const { data: event, error: eventError } = await supabase
      .from("events")
      .select("*")
      .eq("id", eventId)
      .eq("user_id", user.id)
      .single();

    if (eventError || !event) return NextResponse.json({ error: "Event not found or access denied" }, { status: 404 });

    const body = await req.json().catch(() => ({}));
    const action = body.action || "propose"; // "propose" | "apply"

    // Fetch existing budget items and tasks for context & preservation
    const [budgetRes, tasksRes] = await Promise.all([
      supabase.from("budget_items").select("*").eq("event_id", eventId),
      supabase.from("tasks").select("*").eq("event_id", eventId),
    ]);

    const budgetItems: BudgetItemRecord[] = budgetRes.data || [];
    const tasks: TaskRecord[] = tasksRes.data || [];

    // --- CASE A: GENERATE CHANGE PROPOSAL ---
    if (action === "propose") {
      const userRequest = body.userRequest;
      if (!userRequest || typeof userRequest !== "string" || !userRequest.trim()) {
        return NextResponse.json({ error: "userRequest prompt is required" }, { status: 400 });
      }

      if (!isGeminiConfigured()) {
        return NextResponse.json(
          { error: "GEMINI_API_KEY is not configured on the server. Please add it to your environment." },
          { status: 503 }
        );
      }

      const proposal = await generateCopilotProposal(event as EventRecord, budgetItems, tasks, userRequest.trim());
      return NextResponse.json({ proposal });
    }

    // --- CASE B: APPLY APPROVED CHANGE PROPOSAL ---
    if (action === "apply") {
      const proposal = body.approvedProposal as StructuredChangeProposal;
      if (!proposal) {
        return NextResponse.json({ error: "approvedProposal object is required" }, { status: 400 });
      }

      // 1. Apply Event Field Updates (Fixed permitted fields only)
      const eventUpdates: Record<string, unknown> = {
        updated_at: new Date().toISOString(),
      };

      for (const fieldChange of proposal.event_field_changes) {
        if (fieldChange.field === "guest_count") {
          eventUpdates.guest_count = Number(fieldChange.new_value);
        } else if (fieldChange.field === "total_budget") {
          eventUpdates.total_budget = Math.max(0, Number(fieldChange.new_value));
        } else if (fieldChange.field === "event_date") {
          eventUpdates.event_date = String(fieldChange.new_value);
        } else if (fieldChange.field === "theme") {
          eventUpdates.theme = String(fieldChange.new_value);
        } else if (fieldChange.field === "title") {
          eventUpdates.title = String(fieldChange.new_value);
        } else if (fieldChange.field === "location") {
          eventUpdates.location = String(fieldChange.new_value);
        }
      }

      if (Object.keys(eventUpdates).length > 1) {
        await supabase
          .from("events")
          .update(eventUpdates)
          .eq("id", eventId);
      }

      // 2. Apply Budget Changes
      for (const bChange of proposal.budget_changes) {
        if (bChange.action === "add" && bChange.new_estimated_cost !== undefined) {
          await supabase.from("budget_items").insert({
            event_id: eventId,
            category: bChange.category,
            description: bChange.description || bChange.reason,
            estimated_cost: bChange.new_estimated_cost,
            actual_cost: 0,
            currency: event.currency || "USD",
          });
        } else if (bChange.action === "update" && bChange.new_estimated_cost !== undefined) {
          // Find existing item by category
          const existing = budgetItems.find((i) => i.category.toLowerCase().trim() === bChange.category.toLowerCase().trim());
          if (existing) {
            await supabase
              .from("budget_items")
              .update({
                estimated_cost: bChange.new_estimated_cost,
                description: bChange.description || existing.description,
                updated_at: new Date().toISOString(),
              })
              .eq("id", existing.id);
          } else {
            // If doesn't exist, insert
            await supabase.from("budget_items").insert({
              event_id: eventId,
              category: bChange.category,
              description: bChange.description || bChange.reason,
              estimated_cost: bChange.new_estimated_cost,
              actual_cost: 0,
              currency: event.currency || "USD",
            });
          }
        } else if (bChange.action === "delete") {
          await supabase
            .from("budget_items")
            .delete()
            .eq("event_id", eventId)
            .ilike("category", bChange.category.trim());
        }
      }

      // 3. Apply Task Changes
      for (const tChange of proposal.task_changes) {
        if (tChange.action === "add") {
          await supabase.from("tasks").insert({
            event_id: eventId,
            title: tChange.title,
            description: tChange.description || tChange.reason,
            priority: tChange.priority || "medium",
            status: "pending",
            due_at: tChange.due_at || null,
          });
        } else if (tChange.action === "delete") {
          await supabase
            .from("tasks")
            .delete()
            .eq("event_id", eventId)
            .ilike("title", `%${tChange.title.trim()}%`);
        }
      }

      // 4. Record new Version Snapshot
      const { data: versions } = await supabase
        .from("event_plan_versions")
        .select("version_number")
        .eq("event_id", eventId)
        .order("version_number", { ascending: false })
        .limit(1);

      const nextVersion = (versions?.[0]?.version_number || 0) + 1;

      await supabase.from("event_plan_versions").insert({
        event_id: eventId,
        version_number: nextVersion,
        plan_snapshot: {
          proposal_applied: proposal,
          timestamp: new Date().toISOString(),
        },
        change_summary: `AI Copilot Revision: ${proposal.user_intent_summary}`,
      });

      return NextResponse.json({
        success: true,
        message: "Approved changes applied cleanly to database",
        version: nextVersion,
      });
    }

    return NextResponse.json({ error: "Invalid action specified" }, { status: 400 });
  } catch (err: unknown) {
    if (err instanceof GeminiServiceError) {
      return NextResponse.json({ error: err.message }, { status: err.statusCode || 500 });
    }
    const msg = err instanceof Error ? err.message : "Internal error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
