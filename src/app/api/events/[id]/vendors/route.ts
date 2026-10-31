import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET /api/events/[id]/vendors - List vendors associated with this event + platform directory
export async function GET(req: Request, { params }: RouteParams) {
  try {
    const { id: eventId } = await params;
    const supabase = await createServerSupabaseClient();
    if (!supabase) return NextResponse.json({ error: "Supabase not configured" }, { status: 503 });

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // Fetch event vendors junction with joined vendor info
    const { data: eventVendors, error: evError } = await supabase
      .from("event_vendors")
      .select("*, vendors(*)")
      .eq("event_id", eventId)
      .order("created_at", { ascending: false });

    if (evError) return NextResponse.json({ error: evError.message }, { status: 500 });

    // Also fetch directory of available demo/public vendors
    const { data: directoryVendors } = await supabase
      .from("vendors")
      .select("*")
      .eq("is_public", true)
      .order("name", { ascending: true });

    return NextResponse.json({
      eventVendors: eventVendors || [],
      directoryVendors: directoryVendors || [],
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Unexpected error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

// POST /api/events/[id]/vendors - Add a vendor to the event (either from directory or new custom vendor)
export async function POST(req: Request, { params }: RouteParams) {
  try {
    const { id: eventId } = await params;
    const supabase = await createServerSupabaseClient();
    if (!supabase) return NextResponse.json({ error: "Supabase not configured" }, { status: 503 });

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { data: event } = await supabase.from("events").select("id, currency").eq("id", eventId).eq("user_id", user.id).single();
    if (!event) return NextResponse.json({ error: "Event access denied" }, { status: 403 });

    const body = await req.json().catch(() => null);
    if (!body) return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });

    let vendorId = body.vendor_id;

    // If adding a custom vendor
    if (!vendorId) {
      if (!body.name || !body.category) {
        return NextResponse.json({ error: "Vendor name and category are required" }, { status: 400 });
      }

      const { data: newVendor, error: vError } = await supabase
        .from("vendors")
        .insert({
          name: String(body.name).trim(),
          category: String(body.category).trim(),
          location: body.location ? String(body.location).trim() : "Custom / Direct Entry",
          contact_info: body.contact_info || {},
          source: "custom",
          verification_status: "unverified",
          is_public: false,
          created_by: user.id,
        })
        .select()
        .single();

      if (vError) return NextResponse.json({ error: "Failed creating vendor: " + vError.message }, { status: 500 });
      vendorId = newVendor.id;
    }

    // Link vendor to event in event_vendors junction
    const quoted_price = Math.max(0, Math.round(Number(body.quoted_price || 0) * 100) / 100);
    const selection_status = body.selection_status || "inquired";

    const { data: eventVendor, error: linkError } = await supabase
      .from("event_vendors")
      .insert({
        event_id: eventId,
        vendor_id: vendorId,
        quoted_price,
        currency: event.currency || "USD",
        selection_status,
        notes: body.notes ? String(body.notes).trim() : null,
      })
      .select("*, vendors(*)")
      .single();

    if (linkError) {
      if (linkError.code === "23505") {
        return NextResponse.json({ error: "This vendor is already added to this event." }, { status: 409 });
      }
      return NextResponse.json({ error: linkError.message }, { status: 500 });
    }

    return NextResponse.json({ eventVendor }, { status: 201 });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Unexpected error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

// PUT /api/events/[id]/vendors - Update quotation price, selection status, or notes
export async function PUT(req: Request, { params }: RouteParams) {
  try {
    const { id: eventId } = await params;
    const supabase = await createServerSupabaseClient();
    if (!supabase) return NextResponse.json({ error: "Supabase not configured" }, { status: 503 });

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json().catch(() => null);
    if (!body || !body.eventVendorId) {
      return NextResponse.json({ error: "eventVendorId is required" }, { status: 400 });
    }

    const updates: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };

    if (body.quoted_price !== undefined) {
      updates.quoted_price = Math.max(0, Math.round(Number(body.quoted_price) * 100) / 100);
    }
    if (body.selection_status !== undefined) {
      updates.selection_status = body.selection_status;
    }
    if (body.notes !== undefined) {
      updates.notes = String(body.notes).trim();
    }

    const { data: updated, error } = await supabase
      .from("event_vendors")
      .update(updates)
      .eq("id", body.eventVendorId)
      .eq("event_id", eventId)
      .select("*, vendors(*)")
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ eventVendor: updated });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Unexpected error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

// DELETE /api/events/[id]/vendors - Remove vendor from event
export async function DELETE(req: Request, { params }: RouteParams) {
  try {
    const { id: eventId } = await params;
    const supabase = await createServerSupabaseClient();
    if (!supabase) return NextResponse.json({ error: "Supabase not configured" }, { status: 503 });

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const eventVendorId = searchParams.get("eventVendorId");
    if (!eventVendorId) return NextResponse.json({ error: "eventVendorId parameter required" }, { status: 400 });

    const { error } = await supabase
      .from("event_vendors")
      .delete()
      .eq("id", eventVendorId)
      .eq("event_id", eventId);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true, eventVendorId });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Unexpected error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
