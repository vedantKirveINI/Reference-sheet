import React from "react";

export default function FrameLayout({
  topRectangleStyle = {},
  bottomRectangleStyle = {},
}) {
  return (
    <div
      style={{
        content: "stretch",
        display: "flex",
        flexDirection: "column",
        gap: "0.75rem",
        alignItems: "flex-start",
        justifyContent: "flex-start",
        position: "relative",
        width: "100%",
        height: "100%",
      }}
    >
      <div
        style={{
          backgroundColor: "#ebf4ff",
          height: "2rem",
          borderRadius: "0.5rem",
          flexShrink: 0,
          width: "100%",
          ...topRectangleStyle,
        }}
      />
      <div
        style={{
          backgroundColor: "#ebf4ff",
          height: "2rem",
          borderRadius: "0.5rem",
          flexShrink: 0,
          width: "45%",
          ...bottomRectangleStyle,
        }}
      />
    </div>
  );
}
