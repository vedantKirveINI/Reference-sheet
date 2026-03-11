import * as go from "gojs";

const $ = go.GraphObject.make;

export const aiWarningPanel = $(
  go.Panel,
  "Spot",
  {
    alignment: new go.Spot(0.2, 0.1),
    name: "AIWARNINGPANELGO",
    isActionable: true,
    cursor: "pointer",
    toolTip: $(
      "ToolTip",
      $(go.TextBlock, {
        margin: 4,
        text: "AI Generated - May need review",
        stroke: "#333",
      })
    ),
  },
  $(go.Shape, "Circle", {
    fill: "#7C3AED",
    stroke: "white",
    strokeWidth: 2,
    width: 20,
    height: 20,
  }),
  $(go.TextBlock, {
    text: "AI",
    font: "bold 8px Archivo, sans-serif",
    stroke: "white",
  }),
  new go.Binding("visible", "", (data) => {
    return data?._aiGenerated === true && data?._hasWarning === true;
  }),
  new go.Binding("scale", "", (data) => {
    return data?._aiGenerated === true && data?._hasWarning === true ? 1 : 0.001;
  })
);
