import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Outlier — YouTube Channel Gap Analyzer";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OGImage() {
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
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Top-right glow */}
        <div
          style={{
            position: "absolute",
            top: "-100px",
            right: "-100px",
            width: "500px",
            height: "500px",
            background:
              "radial-gradient(ellipse at center, rgba(13, 147, 115, 0.12), transparent 70%)",
          }}
        />

        {/* Bottom-left glow */}
        <div
          style={{
            position: "absolute",
            bottom: "-120px",
            left: "-80px",
            width: "400px",
            height: "400px",
            background:
              "radial-gradient(ellipse at center, rgba(13, 147, 115, 0.06), transparent 70%)",
          }}
        />

        {/* Decorative circle (from favicon motif) */}
        <div
          style={{
            position: "absolute",
            top: "60px",
            right: "80px",
            width: "48px",
            height: "48px",
            borderRadius: "50%",
            border: "3px solid rgba(13, 147, 115, 0.20)",
            display: "flex",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: "44px",
            right: "56px",
            width: "12px",
            height: "12px",
            borderRadius: "50%",
            background: "#0D9373",
          }}
        />

        {/* Label */}
        <div
          style={{
            fontSize: "14px",
            fontFamily: "monospace",
            letterSpacing: "0.15em",
            textTransform: "uppercase",
            color: "#0D9373",
            marginBottom: "28px",
          }}
        >
          YouTube Channel Intelligence
        </div>

        {/* Headline */}
        <div
          style={{
            fontSize: "50px",
            fontWeight: 700,
            color: "#2C2924",
            textAlign: "center",
            lineHeight: 1.15,
            maxWidth: "880px",
            marginBottom: "28px",
          }}
        >
          The gap between your channel and theirs? We measured it.
        </div>

        {/* Subtitle */}
        <div
          style={{
            fontSize: "20px",
            color: "#6B6560",
            textAlign: "center",
          }}
        >
          AI-powered thumbnails, titles, and strategy analysis — free, 30 seconds.
        </div>

        {/* Bottom bar */}
        <div
          style={{
            position: "absolute",
            bottom: "40px",
            display: "flex",
            alignItems: "center",
            gap: "12px",
          }}
        >
          <div
            style={{
              width: "8px",
              height: "8px",
              borderRadius: "50%",
              background: "#0D9373",
            }}
          />
          <div
            style={{
              fontSize: "18px",
              fontWeight: 700,
              color: "#2C2924",
            }}
          >
            Outlier
          </div>
          <div
            style={{
              fontSize: "14px",
              color: "#A8A29E",
            }}
          >
            getoutlier.com
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
