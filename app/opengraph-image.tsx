import { ImageResponse } from "next/og";

export const alt = "QUANTUMNOVA, We Build Digital Universes";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const stars = Array.from({ length: 128 }, (_, index) => ({
  left: `${(index * 47 + (index % 7) * 9) % 100}%`,
  top: `${(index * 71 + (index % 11) * 5) % 100}%`,
  size: 1 + (index % 4) * 0.55,
  opacity: 0.24 + (index % 5) * 0.13,
}));

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          position: "relative",
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          overflow: "hidden",
          padding: "72px 80px",
          background:
            "radial-gradient(circle at 70% 48%, rgba(120,98,255,0.28), transparent 27%), radial-gradient(circle at 62% 54%, rgba(75,255,221,0.16), transparent 36%), #010204",
          color: "#F5FFFC",
          fontFamily: "Arial, sans-serif",
        }}
      >
        {stars.map((star, index) => (
          <span
            key={index}
            style={{
              position: "absolute",
              left: star.left,
              top: star.top,
              width: `${star.size}px`,
              height: `${star.size}px`,
              borderRadius: "999px",
              background: index % 9 === 0 ? "#88FFE4" : "#FFFFFF",
              opacity: star.opacity,
              boxShadow: index % 13 === 0 ? "0 0 9px #88FFE4" : "none",
            }}
          />
        ))}
        <div
          style={{
            position: "absolute",
            right: 92,
            width: 420,
            height: 420,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            border: "1px solid rgba(136,255,228,0.18)",
            borderRadius: "999px",
            boxShadow: "0 0 90px rgba(120,98,255,0.18), inset 0 0 80px rgba(136,255,228,0.05)",
          }}
        >
          <div
            style={{
              width: 205,
              height: 205,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              border: "2px solid #88FFE4",
              borderRadius: "999px",
              background: "radial-gradient(circle, rgba(136,255,228,0.18), rgba(7,10,24,0.88) 62%)",
              boxShadow: "0 0 60px rgba(136,255,228,0.2)",
              color: "#CFFFF4",
              fontSize: 116,
              fontWeight: 700,
              letterSpacing: -10,
            }}
          >
            Q
          </div>
        </div>
        <div style={{ position: "relative", width: 660, display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16, color: "#88FFE4", fontSize: 20, fontWeight: 700, letterSpacing: 7 }}>
            <span style={{ width: 44, height: 1, display: "flex", background: "#88FFE4" }} />
            QUANTUMNOVA
          </div>
          <div style={{ marginTop: 34, display: "flex", flexDirection: "column", fontSize: 82, fontWeight: 700, lineHeight: 0.91, letterSpacing: -5 }}>
            <span>WE BUILD</span>
            <span style={{ color: "#BFFFF0" }}>DIGITAL UNIVERSES.</span>
          </div>
          <div style={{ marginTop: 35, width: 590, color: "rgba(255,255,255,0.7)", fontSize: 22, lineHeight: 1.45 }}>
            Immersive websites • 3D product worlds • WebGL experiences • Motion systems
          </div>
          <div style={{ marginTop: 32, color: "rgba(255,255,255,0.42)", fontSize: 16, letterSpacing: 3 }}>
            AUSTRALIAN CREATIVE TECHNOLOGY STUDIO
          </div>
        </div>
      </div>
    ),
    size,
  );
}
