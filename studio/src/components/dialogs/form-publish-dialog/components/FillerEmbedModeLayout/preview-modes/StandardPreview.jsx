import React from "react";
import FrameLayout from "../../FrameLayout";

export default function StandardPreview({ properties = {} }) {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        padding: "2rem",
        display: "grid",
        gridTemplateRows: "auto 1fr auto",
        gap: "1.5rem",
      }}
    >
      <FrameLayout />

      <div
        id="filler-embed"
        {...properties}
        style={{
          borderRadius: "0.75rem",
          overflow: "hidden",
        }}
      ></div>

      <FrameLayout />
    </div>
  );
}
