import React from "react";
import FrameLayout from "../../FrameLayout";

export default function PopoverPreview({ properties = {} }) {
  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        display: "grid",
        gridTemplateRows: "auto 1fr",
        gap: "1.5rem",
        padding: "2rem",
      }}
    >
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "grid",
          gridTemplateRows: "auto auto",
          gap: "1.5rem",
        }}
      >
        <FrameLayout bottomRectangleStyle={{ width: "60%" }} />
        <FrameLayout bottomRectangleStyle={{ width: "40%" }} />
        <FrameLayout bottomRectangleStyle={{ width: "50%" }} />
      </div>
      <div id="filler-embed" {...properties}></div>
    </div>
  );
}
