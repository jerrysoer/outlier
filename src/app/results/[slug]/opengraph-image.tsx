import { ImageResponse } from "next/og";
import { getSupabase } from "@/lib/supabase";
import type { AnalysisResult } from "@/lib/types";

export const runtime = "edge";
export const alt = "Outlier Analysis";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OGImage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  let roastText = "YouTube channel competitive analysis by Outlier";
  let channelAName = "";
  let channelBName = "";

  const supabase = getSupabase();
  if (supabase) {
    try {
      const { data } = await supabase
        .from("audits")
        .select("result_json")
        .eq("slug", slug)
        .single();

      if (data?.result_json) {
        const result = data.result_json as AnalysisResult;
        const rawRoast = result.viral?.roastCard;
        roastText = typeof rawRoast === "string"
          ? rawRoast
          : (rawRoast?.forA || rawRoast?.forB || roastText);
        channelAName = result.channelA?.meta?.title || "";
        channelBName = result.channelB?.meta?.title || "";
      }
    } catch {
      // Use default text
    }
  }

  return new ImageResponse(
    (
      <div
        style={{
          background: "#0A0A0F",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          padding: "60px 80px",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Top-right glow */}
        <div
          style={{
            position: "absolute",
            top: "-60px",
            right: "-60px",
            width: "400px",
            height: "400px",
            background:
              "radial-gradient(ellipse at center, rgba(6, 214, 160, 0.12), transparent 70%)",
          }}
        />

        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            marginBottom: "20px",
          }}
        >
          {/* Dot accent */}
          <div
            style={{
              width: "8px",
              height: "8px",
              borderRadius: "50%",
              background: "#06D6A0",
            }}
          />
          <div
            style={{
              fontSize: "14px",
              fontFamily: "monospace",
              letterSpacing: "0.15em",
              textTransform: "uppercase",
              color: "#06D6A0",
            }}
          >
            {channelAName && channelBName
              ? `${channelAName} vs ${channelBName}`
              : "Channel Analysis"}
          </div>
        </div>

        {/* Roast text */}
        <div
          style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
          }}
        >
          <div
            style={{
              fontSize: "36px",
              fontWeight: 700,
              color: "#F0F0FF",
              lineHeight: 1.3,
              maxWidth: "900px",
            }}
          >
            &ldquo;{roastText}&rdquo;
          </div>
        </div>

        {/* Watermark */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-end",
            gap: "8px",
          }}
        >
          <div
            style={{
              width: "6px",
              height: "6px",
              borderRadius: "50%",
              background: "rgba(6, 214, 160, 0.4)",
            }}
          />
          <div
            style={{
              fontSize: "14px",
              color: "#4A4A5A",
              letterSpacing: "0.1em",
              textTransform: "uppercase",
            }}
          >
            Analyzed by Outlier
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
