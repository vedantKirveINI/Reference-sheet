import * as go from "gojs";
const $ = go.GraphObject.make;

export const spinnerPanel = $(
  go.Panel,
  "Spot",
  {
    alignment: new go.Spot(0.85, 0.15),
  },
  $(go.Shape, "Circle", {
    width: 28,
    height: 28,
    fill: "#3B82F6",
    stroke: "white",
    strokeWidth: 2,
  }),
  new go.Shape("Circle", {
    name: "SPINNER",
    width: 18,
    height: 18,
    fill: null,
    stroke: "white",
    strokeWidth: 3,
    strokeDashArray: [14, 42],
  })
)
  .bind("opacity", "", (d) => (d._state === "running" ? 1 : 0))
  .bind("scale", "", (d) => (d._state === "running" ? 1 : 0.001));
