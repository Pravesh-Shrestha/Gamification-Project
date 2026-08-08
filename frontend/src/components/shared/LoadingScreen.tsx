import React from "react";

interface LoadingScreenProps {
  message?: string;
  durationSeconds?: number;
}

export function CodedexLoadingScreen({ message = "Loading your workspace... ✦", durationSeconds = 5 }: LoadingScreenProps) {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        width: "100vw",
        height: "100vh",
        zIndex: 9999,
        backgroundColor: "#162832",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "flex-end",
        overflow: "hidden",
      }}
    >
      {/* ── Layer 1: Sky ── */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: "url('/assets/LandingPage_Sky.webp')",
          backgroundSize: "cover",
          backgroundPosition: "center top",
          zIndex: 1,
          imageRendering: "pixelated",
        }}
      />

      {/* ── Layer 2: Mountains ── */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: "url('/assets/LandingPage_Mountain.webp')",
          backgroundSize: "cover",
          backgroundPosition: "center bottom",
          zIndex: 2,
          imageRendering: "pixelated",
        }}
      />

      {/* ── Layer 3: Rolling Hills ── */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: "url('/assets/LandingPage_Hills.webp')",
          backgroundSize: "cover",
          backgroundPosition: "center bottom",
          zIndex: 3,
          imageRendering: "pixelated",
        }}
      />

      {/* ── Layer 4: Grass Field ── */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: "url('/assets/LandingPage_Grass.webp')",
          backgroundSize: "cover",
          backgroundPosition: "center bottom",
          zIndex: 4,
          imageRendering: "pixelated",
        }}
      />

      {/* ── Layer 5: Mascot ── */}
      <div
        style={{
          position: "absolute",
          left: "25%",
          bottom: "15%",
          width: "12vw",
          height: "12vw",
          minWidth: 100,
          minHeight: 100,
          maxWidth: 160,
          maxHeight: 160,
          zIndex: 5,
          pointerEvents: "none",
        }}
      >
        <img
          src="/assets/LandingPage_Mascot.webp"
          alt="Pixel Mascot"
          className="animate-pixel-float"
          style={{
            width: "100%",
            height: "100%",
            objectFit: "contain",
            imageRendering: "pixelated",
            filter: "drop-shadow(0 6px 14px rgba(0,0,0,0.45))",
          }}
        />
      </div>

      {/* ── Centered Glass Card Header & 5-Second Retro Progress Bar ── */}
      <div
        style={{
          position: "relative",
          zIndex: 20,
          marginBottom: "6vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 12,
          background: "rgba(11, 13, 23, 0.8)",
          padding: "20px 38px",
          borderRadius: 20,
          backdropFilter: "blur(12px)",
          border: "1.5px solid rgba(255, 199, 0, 0.45)",
          boxShadow: "0 16px 40px rgba(0, 0, 0, 0.75), 0 0 25px rgba(255, 199, 0, 0.15)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div
            className="font-pixel"
            style={{
              width: 34,
              height: 34,
              borderRadius: 8,
              background: "#FFC700",
              color: "#0B0D17",
              display: "grid",
              placeItems: "center",
              fontWeight: 900,
              fontSize: 18,
              boxShadow: "0 0 16px rgba(255, 199, 0, 0.4)",
            }}
          >
            a
          </div>
          <span className="font-pixel-sans" style={{ color: "#FFFFFF", fontWeight: 800, fontSize: 22 }}>
            academia.io
          </span>
        </div>

        {/* 8-Bit Pixel Progress Bar with 5-Second Animation */}
        <div
          style={{
            width: 270,
            height: 12,
            background: "#0B0D17",
            border: "2px solid #FFC700",
            borderRadius: 6,
            overflow: "hidden",
            position: "relative",
            boxShadow: "0 4px 14px rgba(0,0,0,0.6), 2px 2px 0 0 #000",
          }}
        >
          <div
            style={{
              height: "100%",
              background: "linear-gradient(90deg, #FFC700 0%, #F59E0B 100%)",
              animation: `loading5Seconds ${durationSeconds}s linear forwards`,
            }}
          />
        </div>

        <div className="font-pixel-sans" style={{ color: "#E2E8F0", fontSize: 13, fontWeight: 700, letterSpacing: "0.02em" }}>
          {message}
        </div>
      </div>

      <style>{`
        @keyframes loading5Seconds {
          0% { width: 0%; }
          15% { width: 20%; }
          45% { width: 55%; }
          75% { width: 82%; }
          100% { width: 100%; }
        }
      `}</style>
    </div>
  );
}

(window as any).CodedexLoadingScreen = CodedexLoadingScreen;
export default CodedexLoadingScreen;
