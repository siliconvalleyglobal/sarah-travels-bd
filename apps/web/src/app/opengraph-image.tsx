import { ImageResponse } from "next/og";
import { siteConfig } from "@/lib/seo/site";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = siteConfig.name;

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #02132F 0%, #0a2a5e 55%, #02132F 100%)",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <svg viewBox="0 0 100 100" width="120" height="120">
          <path d="M15 35 H40 L22 75 H5 L15 35 Z" fill="#D4AF37" />
          <path d="M35 25 H85 L60 75 H40 L57 37 H35 V25 Z" fill="#FFFFFF" />
        </svg>
        <div
          style={{
            marginTop: 32,
            fontSize: 56,
            fontWeight: 800,
            color: "#FFFFFF",
            letterSpacing: "-0.02em",
          }}
        >
          {siteConfig.name}
        </div>
        <div
          style={{
            marginTop: 12,
            fontSize: 28,
            color: "#D4AF37",
            fontWeight: 600,
          }}
        >
          {siteConfig.tagline}
        </div>
      </div>
    ),
    { ...size },
  );
}
