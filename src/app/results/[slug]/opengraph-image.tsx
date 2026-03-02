import { ImageResponse } from "next/og";
import { getSupabase } from "@/lib/supabase";
import type { AnalysisResult } from "@/lib/types";

export const runtime = "edge";
export const alt = "Outlier Analysis";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// ── Utility functions (ported from HeadToHeadCard) ──

function gradeColor(letter: string): string {
  switch (letter[0]) {
    case "A": return "#0D9373";
    case "B": return "#3B7DD8";
    case "C": return "#B8860B";
    case "D": return "#C27A1A";
    case "F": return "#DC4A3E";
    default: return "#666";
  }
}

function formatCompact(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(n >= 10_000 ? 0 : 1)}K`;
  return n.toString();
}

function truncate(s: string, max: number): string {
  return s.length > max ? s.slice(0, max - 1) + "…" : s;
}


// ── Metric derivation (defensive for legacy audits) ──

interface MetricRow {
  label: string;
  valueA: string;
  valueB: string;
  winnerA: boolean;
  winnerB: boolean;
}

function deriveMetrics(result: AnalysisResult): MetricRow[] {
  const rows: MetricRow[] = [];

  // Engagement Rate
  const engA = result.engagement?.channelA?.combinedRate;
  const engB = result.engagement?.channelB?.combinedRate;
  if (engA != null && engB != null) {
    const pctA = engA * 100;
    const pctB = engB * 100;
    rows.push({
      label: "ENGAGEMENT",
      valueA: `${pctA.toFixed(2)}%`,
      valueB: `${pctB.toFixed(2)}%`,
      winnerA: pctA > pctB,
      winnerB: pctB > pctA,
    });
  } else {
    rows.push({ label: "ENGAGEMENT", valueA: "—", valueB: "—", winnerA: false, winnerB: false });
  }

  // Avg Views
  const videosA = result.channelA?.videos;
  const videosB = result.channelB?.videos;
  if (videosA?.length && videosB?.length) {
    const avgA = videosA.reduce((s, v) => s + v.viewCount, 0) / videosA.length;
    const avgB = videosB.reduce((s, v) => s + v.viewCount, 0) / videosB.length;
    rows.push({
      label: "AVG VIEWS",
      valueA: formatCompact(Math.round(avgA)),
      valueB: formatCompact(Math.round(avgB)),
      winnerA: avgA > avgB,
      winnerB: avgB > avgA,
    });
  } else {
    rows.push({ label: "AVG VIEWS", valueA: "—", valueB: "—", winnerA: false, winnerB: false });
  }

  // Upload Frequency
  const freqA = result.uploadCadence?.channelA?.postsPerWeek;
  const freqB = result.uploadCadence?.channelB?.postsPerWeek;
  if (freqA != null && freqB != null) {
    rows.push({
      label: "UPLOADS",
      valueA: `${freqA}/wk`,
      valueB: `${freqB}/wk`,
      winnerA: freqA > freqB,
      winnerB: freqB > freqA,
    });
  } else {
    rows.push({ label: "UPLOADS", valueA: "—", valueB: "—", winnerA: false, winnerB: false });
  }

  return rows;
}

// ── Main OG Image ──

export default async function OGImage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  // Fetch font (DM Sans Bold 700)
  let fontData: ArrayBuffer | null = null;
  try {
    const fontRes = await fetch(
      "https://fonts.gstatic.com/s/dmsans/v17/rP2tp2ywxg089UriI5-g4vlH9VoD8CmcqZG40F9JadbnoEwARZthTg.ttf"
    );
    if (fontRes.ok) {
      fontData = await fontRes.arrayBuffer();
    }
  } catch {
    // Fall back to system font
  }

  // Generic fallback — always returns a valid PNG
  function fallback() {
    return new ImageResponse(
      (
        <div
          style={{
            background: "#FAF9F6",
            width: "100%",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "60px 80px",
          }}
        >
          <div style={{ fontSize: "52px", fontWeight: 700, color: "#2C2924", textAlign: "center" }}>
            YouTube channel competitive analysis
          </div>
          <div style={{ fontSize: "24px", color: "#6B6560", marginTop: "16px" }}>
            Analyzed by Outlier
          </div>
        </div>
      ),
      { ...size, ...(fontData ? { fonts: [{ name: "DM Sans", data: fontData, weight: 700 as const }] } : {}) }
    );
  }

  try {
  // Fetch result from Supabase
  let result: AnalysisResult | null = null;

  const supabase = getSupabase();
  if (supabase) {
    const { data } = await supabase
      .from("audits")
      .select("result_json")
      .eq("slug", slug)
      .single();

    if (data?.result_json) {
      result = data.result_json as AnalysisResult;
    }
  }

  if (!result) {
    return fallback();
  }

  // Extract data
  const channelAName = truncate(result.channelA?.meta?.title || "Channel A", 18);
  const channelBName = truncate(result.channelB?.meta?.title || "Channel B", 18);
  const gradeA = result.viral?.grades?.channelA?.letter;
  const gradeB = result.viral?.grades?.channelB?.letter;
  const metrics = deriveMetrics(result);

  const initialA = (result.channelA?.meta?.title || "A")[0].toUpperCase();
  const initialB = (result.channelB?.meta?.title || "B")[0].toUpperCase();

  const fonts = fontData
    ? [{ name: "DM Sans", data: fontData, weight: 700 as const }]
    : [];

  const response = new ImageResponse(
    (
      <div
        style={{
          background: "linear-gradient(180deg, #FAF9F6 0%, #FFFFFF 100%)",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          padding: "48px 64px",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* ─── Zone 1: Channel Header ─── */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "24px",
          }}
        >
          {/* Channel A */}
          <div style={{ display: "flex", alignItems: "center", flex: 1 }}>
            <div
              style={{
                width: "72px",
                height: "72px",
                borderRadius: "50%",
                background: "#0D9373",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginRight: "16px",
                fontSize: "30px",
                fontWeight: 700,
                color: "#fff",
              }}
            >
              {initialA}
            </div>
            <div style={{ display: "flex", flexDirection: "column" }}>
              <div style={{ fontSize: "36px", fontWeight: 700, color: "#2C2924", fontFamily: "DM Sans" }}>
                {channelAName}
              </div>
            </div>
          </div>

          {/* VS */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: "80px",
            }}
          >
            <div
              style={{
                fontSize: "28px",
                fontWeight: 700,
                color: "#A8A29E",
                letterSpacing: "0.2em",
              }}
            >
              VS
            </div>
          </div>

          {/* Channel B */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", flex: 1 }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end" }}>
              <div style={{ fontSize: "36px", fontWeight: 700, color: "#2C2924", fontFamily: "DM Sans" }}>
                {channelBName}
              </div>
            </div>
            <div
              style={{
                width: "72px",
                height: "72px",
                borderRadius: "50%",
                background: "#0D9373",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginLeft: "16px",
                fontSize: "30px",
                fontWeight: 700,
                color: "#fff",
              }}
            >
              {initialB}
            </div>
          </div>
        </div>

        {/* Divider */}
        <div style={{ height: "2px", background: "#E0DDD6", width: "100%", display: "flex" }} />

        {/* ─── Zone 2: Metric Rows ─── */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            flex: 1,
            justifyContent: "center",
          }}
        >
          {metrics.map((row, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                alignItems: "center",
                marginBottom: i < metrics.length - 1 ? "28px" : "0px",
              }}
            >
              {/* Value A side */}
              <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "flex-end" }}>
                <div
                  style={{
                    fontSize: "40px",
                    fontWeight: 700,
                    fontFamily: "monospace",
                    color: row.winnerA ? "#0D9373" : "#6B6560",
                    marginRight: "12px",
                  }}
                >
                  {row.valueA}
                </div>
                {/* Winner indicator */}
                <div
                  style={{
                    width: "32px",
                    height: "32px",
                    borderRadius: "50%",
                    background: row.winnerA ? "#0D9373" : "#E0DDD6",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {row.winnerA ? (
                    <div style={{ width: "14px", height: "14px", borderRadius: "50%", background: "#fff" }} />
                  ) : null}
                </div>
              </div>

              {/* Label */}
              <div
                style={{
                  width: "180px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <div
                  style={{
                    fontSize: "20px",
                    color: "#A8A29E",
                    letterSpacing: "0.12em",
                    fontFamily: "monospace",
                  }}
                >
                  {row.label}
                </div>
              </div>

              {/* Value B side */}
              <div style={{ flex: 1, display: "flex", alignItems: "center" }}>
                {/* Winner indicator */}
                <div
                  style={{
                    width: "32px",
                    height: "32px",
                    borderRadius: "50%",
                    background: row.winnerB ? "#0D9373" : "#E0DDD6",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {row.winnerB ? (
                    <div style={{ width: "14px", height: "14px", borderRadius: "50%", background: "#fff" }} />
                  ) : null}
                </div>
                <div
                  style={{
                    fontSize: "40px",
                    fontWeight: 700,
                    fontFamily: "monospace",
                    color: row.winnerB ? "#0D9373" : "#6B6560",
                    marginLeft: "12px",
                  }}
                >
                  {row.valueB}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Divider */}
        <div style={{ height: "2px", background: "#E0DDD6", width: "100%", display: "flex" }} />

        {/* ─── Zone 3: Grades + Watermark ─── */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginTop: "20px",
          }}
        >
          {/* Grade A */}
          <div style={{ display: "flex", alignItems: "center" }}>
            {gradeA && (
              <div
                style={{
                  fontSize: "64px",
                  fontWeight: 700,
                  fontFamily: "monospace",
                  color: gradeColor(gradeA),
                  lineHeight: 1,
                }}
              >
                {gradeA}
              </div>
            )}
          </div>

          {/* Watermark */}
          <div style={{ display: "flex", alignItems: "center" }}>
            <div
              style={{
                width: "10px",
                height: "10px",
                borderRadius: "50%",
                background: "#0D9373",
                marginRight: "8px",
              }}
            />
            <div
              style={{
                fontSize: "18px",
                color: "#A8A29E",
                letterSpacing: "0.15em",
              }}
            >
              OUTLIER
            </div>
          </div>

          {/* Grade B */}
          <div style={{ display: "flex", alignItems: "center" }}>
            {gradeB && (
              <div
                style={{
                  fontSize: "64px",
                  fontWeight: 700,
                  fontFamily: "monospace",
                  color: gradeColor(gradeB),
                  lineHeight: 1,
                }}
              >
                {gradeB}
              </div>
            )}
          </div>
        </div>
      </div>
    ),
    { ...size, fonts }
  );

  // Buffer the response — Satori renders lazily during stream read,
  // so 0-byte failures only surface here, not during construction.
  const buf = await response.arrayBuffer();
  if (buf.byteLength > 0) {
    return new Response(buf, {
      headers: { "Content-Type": "image/png", "Cache-Control": "public, max-age=3600" },
    });
  }
  return fallback();

  } catch {
    return fallback();
  }
}
