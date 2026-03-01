import { NextRequest, NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function GET() {
  const supabase = getSupabase();
  if (!supabase) {
    return NextResponse.json({ count: 0 });
  }

  const { count } = await supabase
    .from("waitlist")
    .select("*", { count: "exact", head: true });

  return NextResponse.json({ count: count ?? 0 });
}

export async function POST(req: NextRequest) {
  let body: { email?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const email = body.email?.trim().toLowerCase();
  if (!email || !EMAIL_RE.test(email)) {
    return NextResponse.json(
      { error: "Invalid email address" },
      { status: 400 }
    );
  }

  const supabase = getSupabase();
  if (!supabase) {
    return NextResponse.json(
      { error: "Waitlist temporarily unavailable" },
      { status: 503 }
    );
  }

  const { error } = await supabase.from("waitlist").insert({ email });

  if (error) {
    // Unique constraint violation — already signed up
    if (error.code === "23505") {
      return NextResponse.json({
        success: true,
        message: "You're already on the list!",
      });
    }
    console.error("[waitlist] insert failed:", error.message);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true });
}
