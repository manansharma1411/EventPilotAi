import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { validateEventInput } from "@/lib/validation/event";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET /api/events/[id] - Fetch single event with associated tasks and budget items
export async function GET(req: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const supabase = await createServerSupabaseClient();
    if (!supabase) {
      return NextResponse.json(
        { error: "Supabase client not initialized." },
        { status: 503 }
      );
    }

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    // Row Level Security automatically enforces access, but we explicitly filter by user_id
    const { data: event, error: eventError } = await supabase
      .from("events")
      .select("*")
      .eq("id", id)
      .eq("user_id", user.id)
      .single();

    if (eventError || !event) {
      return NextResponse.json(
        { error: "Event not found or access denied." },
        { status: 404 }
      );
    }

    // Fetch related tasks and budget items in parallel
    const [tasksRes, budgetRes, vendorsRes] = await Promise.all([
      supabase.from("tasks").select("*").eq("event_id", id).order("created_at", { ascending: true }),
      supabase.from("budget_items").select("*").eq("event_id", id).order("created_at", { ascending: true }),
      supabase.from("event_vendors").select("*, vendors(*)").eq("event_id", id),
    ]);

    return NextResponse.json({
      event,
      tasks: tasksRes.data || [],
      budget_items: budgetRes.data || [],
      event_vendors: vendorsRes.data || [],
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Unexpected error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

// PUT /api/events/[id] - Update event details
export async function PUT(req: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const supabase = await createServerSupabaseClient();
    if (!supabase) {
      return NextResponse.json(
        { error: "Supabase client not initialized." },
        { status: 503 }
      );
    }

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const body = await req.json().catch(() => null);
    if (!body) {
      return NextResponse.json({ error: "Invalid JSON body provided" }, { status: 400 });
    }

    // Validate server-side
    const validation = validateEventInput(body);
    if (!validation.success || !validation.data) {
      return NextResponse.json(
        { error: "Validation failed", errors: validation.errors },
        { status: 422 }
      );
    }

    const payload = validation.data;

    // Enforce ownership: update only where id = id AND user_id = user.id
    // Fetch current event to detect if event_date changed
    const { data: currentEvent } = await supabase
      .from("events")
      .select("event_date")
      .eq("id", id)
      .eq("user_id", user.id)
      .single();

    const { data: updatedEvent, error: updateError } = await supabase
      .from("events")
      .update({
        title: payload.title,
        event_type: payload.event_type,
        event_date: payload.event_date,
        timezone: payload.timezone || "UTC",
        location: payload.location,
        guest_count: payload.guest_count,
        total_budget: payload.total_budget,
        currency: payload.currency,
        theme: payload.theme || null,
        preferences: payload.preferences || {},
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .eq("user_id", user.id)
      .select()
      .single();

    if (updateError || !updatedEvent) {
      return NextResponse.json(
        { error: "Failed to update event: " + (updateError?.message || "Not found") },
        { status: 400 }
      );
    }

    // If event_date changed, recalculate relative task deadlines deterministically on the server
    if (currentEvent && currentEvent.event_date !== payload.event_date) {
      const { data: currentTasks } = await supabase
        .from("tasks")
        .select("*")
        .eq("event_id", id);

      if (currentTasks && currentTasks.length > 0) {
        const oldDate = new Date(currentEvent.event_date);
        const newDate = new Date(payload.event_date);
        const dayShift = Math.round((newDate.getTime() - oldDate.getTime()) / (1000 * 60 * 60 * 24));

        for (const t of currentTasks) {
          if (t.due_at) {
            const tDate = new Date(t.due_at);
            if (!isNaN(tDate.getTime())) {
              tDate.setDate(tDate.getDate() + dayShift);
              await supabase
                .from("tasks")
                .update({ due_at: tDate.toISOString() })
                .eq("id", t.id);
            }
          }
        }
      }
    }

    return NextResponse.json({ event: updatedEvent });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Unexpected error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

// DELETE /api/events/[id] - Delete event with cascading safety
export async function DELETE(req: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const supabase = await createServerSupabaseClient();
    if (!supabase) {
      return NextResponse.json(
        { error: "Supabase client not initialized." },
        { status: 503 }
      );
    }

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    // Delete event only if user owns it
    const { error: deleteError } = await supabase
      .from("events")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id);

    if (deleteError) {
      return NextResponse.json(
        { error: "Failed to delete event: " + deleteError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, message: "Event successfully deleted" });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Unexpected error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
