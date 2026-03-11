import * as go from "gojs";
const $ = go.GraphObject.make;

export const pendingOverlay = $(
  go.Panel,
  "Spot",
  { name: "PENDINGOVERLAY" },
  $(go.Shape, "Rectangle", {
    fill: "rgba(255, 255, 255, 0.6)", // semi-transparent black background for disabled effect
    stroke: "transparent",
    width: 200, // Bind width to node's actual width
    height: 200, // Bind height to node's actual height
    isActionable: false, // Make sure the overlay doesn't trigger any actions
  }),
  new go.Binding("visible", "", (data) => data?._state === "pending"), // Show overlay only when node state is "pending"
  new go.Binding("scale", "", (data) => {
    return data?._state === "pending" ? 1 : 0.001;
  }) // Show overlay only when node state is "pending"
);
