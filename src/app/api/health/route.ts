import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  const isSupabaseConfigured = Boolean(
    supabaseUrl &&
    supabaseKey &&
    supabaseUrl.startsWith("https://")
  );

  const isGeminiConfigured = Boolean(
    process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.length > 5
  );

  const payload = {
    status: "ok",
    app: "EventPilot AI",
    tagline: "Plan smarter. Celebrate better.",
    version: "0.1.0",
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.floor(process.uptime()),
    environment: process.env.NODE_ENV ?? "development",
    services: {
      supabase: isSupabaseConfigured ? "configured" : "pending_keys",
      gemini: isGeminiConfigured ? "configured" : "pending_keys",
    },
  };

  return NextResponse.json(payload, {
    status: 200,
    headers: {
      "Cache-Control": "no-store, max-age=0",
      "Content-Type": "application/json",
    },
  });
}
