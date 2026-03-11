import * as go from "gojs";
const $ = go.GraphObject.make;

export const pendingOverlay = $(
  go.Panel,
  "Position",
  { name: "PENDINGOVERLAY", alignment: go.Spot.Center },
  $(go.Shape, "Circle", {
    fill: "rgba(255, 255, 255, 0.55)",
    stroke: "transparent",
    width: 100,
    height: 100,
    isActionable: false,
  }),
  new go.Binding("visible", "", (data) => data?._state === "pending"),
  new go.Binding("scale", "", (data) => {
    return data?._state === "pending" ? 1 : 0.001;
  })
);
