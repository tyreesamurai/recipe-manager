import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    <div
      style={{
        width: 32,
        height: 32,
        borderRadius: 7,
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
          top: 7,
          left: 7,
          width: 18,
          height: 12,
          borderRadius: "9px 9px 0 0",
          background: "#e8a800",
        }}
      />
      {/* Left side panel */}
      <div
        style={{
          position: "absolute",
          top: 18,
          left: 7,
          width: 4,
          height: 5,
          background: "#e8a800",
        }}
      />
      {/* Right side panel */}
      <div
        style={{
          position: "absolute",
          top: 18,
          left: 21,
          width: 4,
          height: 5,
          background: "#e8a800",
        }}
      />
      {/* Brim */}
      <div
        style={{
          position: "absolute",
          top: 22,
          left: 5,
          width: 22,
          height: 4,
          borderRadius: 2,
          background: "#e8a800",
        }}
      />
    </div>,
    { ...size },
  );
}
