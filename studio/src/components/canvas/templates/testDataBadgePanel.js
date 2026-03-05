import * as go from "gojs";
import "./shapes";
const $ = go.GraphObject.make;

export const testDataBadgePanel = $(
  go.Panel,
  "Spot",
  {
    alignment: new go.Spot(0.8, 0.9),
    name: "TESTDATABADGEGO",
    isActionable: true,
    cursor: "pointer",
  },
  $(
    go.Shape,
    "CapsuleH",
    {
      fill: "#059669",
      stroke: "white",
      strokeWidth: 2,
      width: 22,
      height: 22,
    }
  ),
  $(go.TextBlock, {
    text: "\u2713",
    stroke: "white",
    font: "bold 11px sans-serif",
  }),
  $(go.Shape, "CapsuleH", {
    fill: "transparent",
    stroke: "transparent",
    width: 22,
    height: 22,
    mouseEnter: (e, thisObj) => {
      thisObj.fill = "rgba(38, 50, 56, 0.3)";
    },
    mouseLeave: (e, thisObj) => {
      thisObj.fill = "transparent";
    },
  }),
  new go.Binding("visible", "", (data) => {
    return !!data?._hasTestData;
  }),
  new go.Binding("scale", "", (data) => {
    return data?._hasTestData ? 1 : 0.001;
  })
);
