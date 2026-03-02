import { NextRequest, NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";
import { generateOGImage } from "@/lib/og-generator";
import type { AnalysisResult } from "@/lib/types";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const { slug } = await req.json();
    if (!slug || typeof slug !== "string") {
      return NextResponse.json({ error: "Missing slug" }, { status: 400 });
    }

    const supabase = getSupabase();
    if (!supabase) {
      return NextResponse.json({ error: "Supabase not configured" }, { status: 503 });
    }

    // Fetch audit
    const { data: audit, error: fetchError } = await supabase
      .from("audits")
      .select("result_json, og_image_url")
      .eq("slug", slug)
      .single();

    if (fetchError || !audit) {
      return NextResponse.json({ error: "Audit not found" }, { status: 404 });
    }

    // Idempotent: skip if already generated
    if (audit.og_image_url) {
      return NextResponse.json({ url: audit.og_image_url });
    }

    const result = audit.result_json as AnalysisResult;
    const channelA = result.channelA?.meta?.title || "Channel A";
    const channelB = result.channelB?.meta?.title || "Channel B";
    const coreFinding = result.coreFinding || "";

    // Generate image via Gemini
    const imageBuffer = await generateOGImage(channelA, channelB, coreFinding);

    // Upload to Supabase Storage (Uint8Array for cross-runtime compat)
    const filePath = `${slug}.png`;
    const { error: uploadError } = await supabase.storage
      .from("og-images")
      .upload(filePath, new Uint8Array(imageBuffer), {
        contentType: "image/png",
        upsert: true,
      });

    if (uploadError) {
      console.error("[generate-og] Upload error:", uploadError);
      return NextResponse.json(
        { error: "Upload failed", detail: uploadError.message },
        { status: 500 },
      );
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from("og-images")
      .getPublicUrl(filePath);

    const publicUrl = urlData.publicUrl;

    // Update audit with OG image URL
    const { error: updateError } = await supabase
      .from("audits")
      .update({ og_image_url: publicUrl })
      .eq("slug", slug);

    if (updateError) {
      console.error("[generate-og] Update error:", updateError);
      return NextResponse.json({ error: "DB update failed" }, { status: 500 });
    }

    return NextResponse.json({ url: publicUrl });
  } catch (e) {
    console.error("[generate-og] Error:", e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Generation failed" },
      { status: 500 },
    );
  }
}
