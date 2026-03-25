import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    <div
      style={{
        width: 180,
        height: 180,
        borderRadius: 40,
        background: "#3d1668",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
      }}
    >
      {/* Chef hat dome */}
      <div
        style={{
          position: "absolute",
          top: 40,
          left: 36,
          width: 108,
          height: 72,
          borderRadius: "54px 54px 0 0",
          background: "#e8a800",
        }}
      />
      {/* Left side panel */}
      <div
        style={{
          position: "absolute",
          top: 110,
          left: 36,
          width: 24,
          height: 30,
          background: "#e8a800",
        }}
      />
      {/* Right side panel */}
      <div
        style={{
          position: "absolute",
          top: 110,
          left: 120,
          width: 24,
          height: 30,
          background: "#e8a800",
        }}
      />
      {/* Brim */}
      <div
        style={{
          position: "absolute",
          top: 135,
          left: 28,
          width: 124,
          height: 22,
          borderRadius: 11,
          background: "#e8a800",
        }}
      />
    </div>,
    { ...size },
  );
}
