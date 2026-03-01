import { NextRequest, NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";

export async function POST(request: NextRequest) {
  const supabase = getSupabase();
  if (!supabase) {
    return NextResponse.json({ error: "Analytics unavailable" }, { status: 503 });
  }

  let body: { event?: string; properties?: Record<string, unknown>; sessionId?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { event, properties, sessionId } = body;
  if (!event || typeof event !== "string") {
    return NextResponse.json({ error: "event field required" }, { status: 400 });
  }

  try {
    await supabase.from("analytics_events").insert({
      event,
      properties: properties ?? null,
      session_id: sessionId ?? null,
    });
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("[event] insert failed:", e);
    return NextResponse.json({ error: "Insert failed" }, { status: 500 });
  }
}
