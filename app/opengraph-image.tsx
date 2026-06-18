import { ImageResponse } from "next/og";

export const alt = "AlgoViz — See How Algorithms Think";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          backgroundColor: "#070a12",
          backgroundImage:
            "radial-gradient(circle at 15% 0%, rgba(45,212,191,0.22), transparent 45%), radial-gradient(circle at 90% 20%, rgba(163,230,53,0.14), transparent 45%), radial-gradient(circle at 50% 100%, rgba(251,191,36,0.16), transparent 50%)",
          padding: "72px",
          fontFamily: "sans-serif",
        }}
      >
        {/* brand row */}
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <div style={{ display: "flex", gap: 10 }}>
            <div style={{ width: 22, height: 22, borderRadius: 999, background: "#2DD4BF" }} />
            <div style={{ width: 22, height: 22, borderRadius: 999, background: "#A3E635" }} />
            <div style={{ width: 22, height: 22, borderRadius: 999, background: "#FBBF24" }} />
          </div>
          <div style={{ color: "#e7ecf5", fontSize: 34, fontWeight: 800, letterSpacing: -1 }}>
            AlgoViz
          </div>
        </div>

        {/* headline */}
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              fontSize: 88,
              fontWeight: 800,
              color: "#f8fafc",
              lineHeight: 1.05,
              letterSpacing: -3,
            }}
          >
            <span>See&nbsp;how&nbsp;</span>
            <span
              style={{
                backgroundImage: "linear-gradient(120deg,#5eead4,#a3e635,#fbbf24)",
                backgroundClip: "text",
                color: "transparent",
              }}
            >
              algorithms
            </span>
            <span>&nbsp;think.</span>
          </div>
          <div style={{ fontSize: 32, color: "#94a3b8", maxWidth: 900 }}>
            Master data structures, algorithms &amp; system design through interactive, animated visualizers.
          </div>
        </div>

        {/* footer pills */}
        <div style={{ display: "flex", gap: 16 }}>
          {["Data Structures", "Algorithms", "System Design"].map((t, i) => (
            <div
              key={t}
              style={{
                fontSize: 24,
                color: ["#2DD4BF", "#A3E635", "#FBBF24"][i],
                border: `1px solid ${["#2DD4BF", "#A3E635", "#FBBF24"][i]}55`,
                borderRadius: 999,
                padding: "10px 26px",
              }}
            >
              {t}
            </div>
          ))}
        </div>
      </div>
    ),
    { ...size },
  );
}
