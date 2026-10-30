import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET /api/events/[id]/budget - List all budget items
export async function GET(req: Request, { params }: RouteParams) {
  try {
    const { id: eventId } = await params;
    const supabase = await createServerSupabaseClient();
    if (!supabase) return NextResponse.json({ error: "Supabase not configured" }, { status: 503 });

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { data: items, error } = await supabase
      .from("budget_items")
      .select("*")
      .eq("event_id", eventId)
      .order("created_at", { ascending: true });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ items });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Unexpected error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

// POST /api/events/[id]/budget - Add a budget line item
export async function POST(req: Request, { params }: RouteParams) {
  try {
    const { id: eventId } = await params;
    const supabase = await createServerSupabaseClient();
    if (!supabase) return NextResponse.json({ error: "Supabase not configured" }, { status: 503 });

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // Verify ownership
    const { data: event } = await supabase
      .from("events")
      .select("id, currency")
      .eq("id", eventId)
      .eq("user_id", user.id)
      .single();

    if (!event) return NextResponse.json({ error: "Event not found or access denied" }, { status: 404 });

    const body = await req.json().catch(() => null);
    if (!body || !body.category || typeof body.category !== "string" || !body.category.trim()) {
      return NextResponse.json({ error: "Category name is required" }, { status: 400 });
    }

    const estimated_cost = Math.max(0, Math.round(Number(body.estimated_cost || 0) * 100) / 100);
    const actual_cost = Math.max(0, Math.round(Number(body.actual_cost || 0) * 100) / 100);

    const { data: newItem, error } = await supabase
      .from("budget_items")
      .insert({
        event_id: eventId,
        category: body.category.trim(),
        description: body.description ? String(body.description).trim() : "",
        estimated_cost,
        actual_cost,
        currency: event.currency || "USD",
      })
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ item: newItem }, { status: 201 });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Unexpected error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

// PUT /api/events/[id]/budget - Update a budget line item
export async function PUT(req: Request, { params }: RouteParams) {
  try {
    const { id: eventId } = await params;
    const supabase = await createServerSupabaseClient();
    if (!supabase) return NextResponse.json({ error: "Supabase not configured" }, { status: 503 });

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { data: event } = await supabase
      .from("events")
      .select("id")
      .eq("id", eventId)
      .eq("user_id", user.id)
      .single();

    if (!event) return NextResponse.json({ error: "Event access denied" }, { status: 403 });

    const body = await req.json().catch(() => null);
    if (!body || !body.itemId) {
      return NextResponse.json({ error: "itemId is required" }, { status: 400 });
    }

    const updates: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };

    if (body.category !== undefined) updates.category = String(body.category).trim();
    if (body.description !== undefined) updates.description = String(body.description).trim();
    if (body.estimated_cost !== undefined) {
      const val = Number(body.estimated_cost);
      if (isNaN(val) || val < 0) return NextResponse.json({ error: "Estimated cost cannot be negative" }, { status: 400 });
      updates.estimated_cost = Math.round(val * 100) / 100;
    }
    if (body.actual_cost !== undefined) {
      const val = Number(body.actual_cost);
      if (isNaN(val) || val < 0) return NextResponse.json({ error: "Actual cost cannot be negative" }, { status: 400 });
      updates.actual_cost = Math.round(val * 100) / 100;
    }

    const { data: updatedItem, error } = await supabase
      .from("budget_items")
      .update(updates)
      .eq("id", body.itemId)
      .eq("event_id", eventId)
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ item: updatedItem });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Unexpected error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

// DELETE /api/events/[id]/budget - Delete a budget item
export async function DELETE(req: Request, { params }: RouteParams) {
  try {
    const { id: eventId } = await params;
    const supabase = await createServerSupabaseClient();
    if (!supabase) return NextResponse.json({ error: "Supabase not configured" }, { status: 503 });

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { data: event } = await supabase
      .from("events")
      .select("id")
      .eq("id", eventId)
      .eq("user_id", user.id)
      .single();

    if (!event) return NextResponse.json({ error: "Event access denied" }, { status: 403 });

    const { searchParams } = new URL(req.url);
    const itemId = searchParams.get("itemId");
    if (!itemId) return NextResponse.json({ error: "itemId query parameter required" }, { status: 400 });

    const { error } = await supabase
      .from("budget_items")
      .delete()
      .eq("id", itemId)
      .eq("event_id", eventId);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true, itemId });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Unexpected error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
