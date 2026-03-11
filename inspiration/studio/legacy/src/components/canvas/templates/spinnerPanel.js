import * as go from "gojs";
const $ = go.GraphObject.make;

export const spinnerPanel = $(
  go.Panel,
  "Spot",
  {
    alignment: new go.Spot(0.7, 0.1),
  }, // position relative to the node
  // a transparent circle with a single dashed arc
  $(go.Shape, "Circle", {
    width: 40,
    height: 40,
    fill: "green",
    stroke: "transparent",
    strokeWidth: 0,
  }),
  new go.Shape("Circle", {
    name: "SPINNER",
    width: 30,
    height: 30,
    fill: null,
    stroke: "white",
    strokeWidth: 4,
    // dash length + gap length ≈ circumference to draw a single arc
    strokeDashArray: [80, 20],
  })
  // NOTE opaque only when data._state === "running"
)
  .bind("opacity", "", (d) => (d._state === "running" ? 1 : 0))
  .bind("scale", "", (d) => (d._state === "running" ? 1 : 0.001));
