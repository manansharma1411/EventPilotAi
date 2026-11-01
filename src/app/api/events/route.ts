import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { validateEventInput } from "@/lib/validation/event";

// GET /api/events - List all events for the current authenticated user
export async function GET() {
  try {
    const supabase = await createServerSupabaseClient();
    if (!supabase) {
      return NextResponse.json(
        { error: "Supabase client not initialized. Check your environment variables." },
        { status: 503 }
      );
    }

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "Unauthorized. Please sign in to view events." },
        { status: 401 }
      );
    }

    const { data: events, error: dbError } = await supabase
      .from("events")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (dbError) {
      return NextResponse.json(
        { error: "Failed to fetch events from database: " + dbError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ events });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Unexpected error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

// POST /api/events - Create a new event
export async function POST(req: Request) {
  try {
    const supabase = await createServerSupabaseClient();
    if (!supabase) {
      return NextResponse.json(
        { error: "Supabase client not initialized. Check your environment variables." },
        { status: 503 }
      );
    }

    // Authenticate user identity from verified session - NEVER from client payload
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "Unauthorized. You must be signed in to create an event." },
        { status: 401 }
      );
    }

    const body = await req.json().catch(() => null);
    if (!body) {
      return NextResponse.json(
        { error: "Invalid JSON body provided" },
        { status: 400 }
      );
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

    // Insert new event with user_id securely attached
    const { data: newEvent, error: insertError } = await supabase
      .from("events")
      .insert({
        user_id: user.id,
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
        status: payload.status || "planning",
      })
      .select()
      .single();

    if (insertError) {
      return NextResponse.json(
        { error: "Database error creating event: " + insertError.message },
        { status: 500 }
      );
    }

    // Initialize starter tasks for the event
    const starterTasks = [
      {
        event_id: newEvent.id,
        title: "Confirm event date & finalize guest list",
        description: "Review preliminary invitations and secure venue availability.",
        priority: "high",
        status: "todo",
      },
      {
        event_id: newEvent.id,
        title: "Research and shortlist core vendors",
        description: "Gather quotes for catering, photography, and entertainment.",
        priority: "medium",
        status: "todo",
      },
      {
        event_id: newEvent.id,
        title: "Review preliminary budget allocation",
        description: "Align estimated line items with the total approved budget cap.",
        priority: "high",
        status: "todo",
      },
    ];

    await supabase.from("tasks").insert(starterTasks);

    return NextResponse.json({ event: newEvent }, { status: 201 });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Unexpected error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
