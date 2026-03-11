import React from "react";
import FrameLayout from "../../FrameLayout";

export default function SliderPreview({ properties = {} }) {
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
      </div>
      <div
        id="filler-embed"
        {...properties}
        style={{
          display: "flex",
          justifyContent: "center",
          width: "100%",
          height: "max-content",
        }}
      ></div>
    </div>
  );
}
