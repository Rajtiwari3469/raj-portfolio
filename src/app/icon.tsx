import { ImageResponse } from "next/og";

export const size = {
  width: 64,
  height: 64,
};
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: 14,
          background: "linear-gradient(135deg, #050510 0%, #0a0a2e 40%, #0d1b3e 70%, #00d4ff 100%)",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            width: "100%",
            height: "100%",
            background: "radial-gradient(circle at 20% 30%, rgba(0,212,255,0.4) 0%, transparent 50%), radial-gradient(circle at 80% 70%, rgba(139,92,246,0.3) 0%, transparent 50%)",
          }}
        />
        <div
          style={{
            position: "absolute",
            width: "100%",
            height: "100%",
            background: "radial-gradient(1px 1px at 10% 20%, rgba(255,255,255,0.8) 0%, transparent 100%), radial-gradient(1px 1px at 30% 60%, rgba(255,255,255,0.6) 0%, transparent 100%), radial-gradient(1px 1px at 50% 15%, rgba(255,255,255,0.7) 0%, transparent 100%), radial-gradient(1px 1px at 70% 45%, rgba(255,255,255,0.5) 0%, transparent 100%), radial-gradient(1px 1px at 85% 80%, rgba(255,255,255,0.6) 0%, transparent 100%), radial-gradient(1px 1px at 15% 85%, rgba(255,255,255,0.4) 0%, transparent 100%), radial-gradient(1px 1px at 60% 75%, rgba(255,255,255,0.5) 0%, transparent 100%), radial-gradient(1px 1px at 90% 25%, rgba(255,255,255,0.3) 0%, transparent 100%)",
          }}
        />
        <span
          style={{
            color: "white",
            fontSize: 30,
            fontWeight: "bold",
            fontFamily: "Arial",
            letterSpacing: "2px",
            zIndex: 1,
            textShadow: "0 0 10px rgba(0,212,255,0.8), 0 0 20px rgba(139,92,246,0.5)",
          }}
        >
          RT
        </span>
      </div>
    ),
    {
      ...size,
    }
  );
}
