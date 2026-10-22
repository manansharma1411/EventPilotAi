import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// POST /api/events/[id]/tasks - Create task for this event
export async function POST(req: Request, { params }: RouteParams) {
  try {
    const { id: eventId } = await params;
    const supabase = await createServerSupabaseClient();
    if (!supabase) return NextResponse.json({ error: "Supabase not configured" }, { status: 503 });

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // Verify ownership of the parent event
    const { data: event } = await supabase.from("events").select("id").eq("id", eventId).eq("user_id", user.id).single();
    if (!event) return NextResponse.json({ error: "Event not found or access denied" }, { status: 404 });

    const body = await req.json().catch(() => null);
    if (!body || !body.title) {
      return NextResponse.json({ error: "Task title is required" }, { status: 400 });
    }

    const { data: task, error } = await supabase
      .from("tasks")
      .insert({
        event_id: eventId,
        title: String(body.title).trim(),
        description: body.description ? String(body.description).trim() : null,
        priority: body.priority || "medium",
        status: body.status || "todo",
        due_at: body.due_at || null,
      })
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ task }, { status: 201 });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Unexpected error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

// PATCH /api/events/[id]/tasks - Update a task status
export async function PATCH(req: Request, { params }: RouteParams) {
  try {
    const { id: eventId } = await params;
    const supabase = await createServerSupabaseClient();
    if (!supabase) return NextResponse.json({ error: "Supabase not configured" }, { status: 503 });

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { data: event } = await supabase.from("events").select("id").eq("id", eventId).eq("user_id", user.id).single();
    if (!event) return NextResponse.json({ error: "Event access denied" }, { status: 403 });

    const body = await req.json().catch(() => null);
    if (!body || !body.taskId || !body.status) {
      return NextResponse.json({ error: "taskId and status are required" }, { status: 400 });
    }

    const { data: updatedTask, error } = await supabase
      .from("tasks")
      .update({ status: body.status, updated_at: new Date().toISOString() })
      .eq("id", body.taskId)
      .eq("event_id", eventId)
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ task: updatedTask });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Unexpected error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
