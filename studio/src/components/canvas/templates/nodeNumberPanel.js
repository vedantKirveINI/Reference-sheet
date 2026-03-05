import * as go from "gojs";
const $ = go.GraphObject.make;

export const nodeNumberPanel = $(
  go.Panel,
  "Spot",
  {
    name: "NODENUMBER",
    margin: new go.Margin(4, 0, 0, 0),
  },
  $(go.Shape, "CapsuleH", {
    fill: "#cfd8dc",
    stroke: "transparent",
    width: 30,
    height: 25,
  }),
  $(
    go.TextBlock,
    { stroke: "#263238", font: "14px Inter" },
    new go.Binding("text", "nodeNumber")
  ),
  new go.Binding("visible", "", (data) => !!data.nodeNumber)
);
