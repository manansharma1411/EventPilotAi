import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { callGemini, isGeminiConfigured } from "@/lib/ai/client";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export interface ExtractedQuotation {
  vendor_name: string;
  category: string;
  quoted_total: number;
  currency: string;
  itemized_costs: { item: string; cost: number }[];
  inclusions: string[];
  exclusions: string[];
  validity_period: string;
  payment_terms: string;
  confidence_warning: string;
}

// POST /api/events/[id]/vendors/extract - Extract structured quotation details from untrusted text / document
export async function POST(req: Request, { params }: RouteParams) {
  try {
    const { id: eventId } = await params;
    const supabase = await createServerSupabaseClient();
    if (!supabase) return NextResponse.json({ error: "Supabase not configured" }, { status: 503 });

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // Verify event ownership
    const { data: event, error: eventError } = await supabase
      .from("events")
      .select("id")
      .eq("id", eventId)
      .eq("user_id", user.id)
      .single();

    if (eventError || !event) {
      return NextResponse.json({ error: "Event not found or unauthorized access" }, { status: 404 });
    }

    const body = await req.json().catch(() => null);
    if (!body || !body.rawText || typeof body.rawText !== "string" || !body.rawText.trim()) {
      return NextResponse.json({ error: "rawText quotation content is required" }, { status: 400 });
    }

    // Safety checks: bounded input size (max 20,000 characters)
    const sanitizedText = body.rawText.trim().slice(0, 20000);

    if (!isGeminiConfigured()) {
      return NextResponse.json(
        { error: "GEMINI_API_KEY is not configured on the server." },
        { status: 503 }
      );
    }

    const systemInstruction = `You are a quotation parsing engine for EventPilot.
Extract structured vendor quotation details from this untrusted quotation text.
Output RAW JSON ONLY strictly matching this structure without markdown fences:
{
  "vendor_name": "Name of vendor or Estimated Provider",
  "category": "venue | catering | photography | entertainment | decor | other",
  "quoted_total": 0,
  "currency": "USD or detected currency",
  "itemized_costs": [
    { "item": "Line item name", "cost": 0 }
  ],
  "inclusions": ["Included service 1", "Included service 2"],
  "exclusions": ["Excluded service 1", "Excluded service 2"],
  "validity_period": "e.g. 30 days from issue or date",
  "payment_terms": "e.g. 50% deposit on signing, 50% on event date",
  "confidence_warning": "AI extracted quotation. Always verify with actual physical contracts."
}`;

    const prompt = `Extract structured quotation fields from the following text:\n\n${sanitizedText}`;

    const raw = await callGemini(systemInstruction, prompt);
    let cleaned = raw.trim();
    if (cleaned.startsWith("```json")) {
      cleaned = cleaned.replace(/^```json\s*/, "").replace(/\s*```$/, "");
    } else if (cleaned.startsWith("```")) {
      cleaned = cleaned.replace(/^```\s*/, "").replace(/\s*```$/, "");
    }

    const parsed = JSON.parse(cleaned) as ExtractedQuotation;

    // Deterministic validation & sanitization
    const result: ExtractedQuotation = {
      vendor_name: typeof parsed.vendor_name === "string" ? parsed.vendor_name.trim() : "Quoted Vendor",
      category: typeof parsed.category === "string" ? parsed.category.trim() : "other",
      quoted_total: typeof parsed.quoted_total === "number" ? Math.max(0, Math.round(parsed.quoted_total * 100) / 100) : 0,
      currency: typeof parsed.currency === "string" ? parsed.currency.toUpperCase().trim() : "USD",
      itemized_costs: Array.isArray(parsed.itemized_costs)
        ? parsed.itemized_costs.map((c) => ({
            item: String(c.item || "Line item"),
            cost: typeof c.cost === "number" ? Math.max(0, Math.round(c.cost * 100) / 100) : 0,
          }))
        : [],
      inclusions: Array.isArray(parsed.inclusions) ? parsed.inclusions.map(String) : [],
      exclusions: Array.isArray(parsed.exclusions) ? parsed.exclusions.map(String) : [],
      validity_period: typeof parsed.validity_period === "string" ? parsed.validity_period : "Unspecified",
      payment_terms: typeof parsed.payment_terms === "string" ? parsed.payment_terms : "Standard terms",
      confidence_warning: "Extracted from untrusted text by AI. User verification required before saving.",
    };

    return NextResponse.json({ extracted: result });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Error extracting quotation";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
