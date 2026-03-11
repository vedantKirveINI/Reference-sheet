import * as go from "gojs";
import "./shapes";
const $ = go.GraphObject.make;

export const executionPanel = $(
  go.Panel,
  "Spot",
  {
    alignment: new go.Spot(0.8, 0.1),
    isActionable: true,
    cursor: "pointer",
    name: "EXECUTIONRESULTGO",
  },
  $(
    go.Shape,
    "CapsuleH",
    {
      stroke: "white",
      strokeWidth: 3,
      width: 30,
      height: 25,
    },
    new go.Binding("fill", "", (data) => {
      return data?._executions?.some((e) => !!e.error) ? "red" : "#212121";
    })
  ),
  $(
    go.TextBlock,
    { stroke: "white" },
    new go.Binding("text", "", (data) => {
      return data?._executions?.length || 0;
    })
  ),
  $(go.Shape, "CapsuleH", {
    fill: "transparent",
    stroke: "transparent",
    width: 30,
    height: 25,
    mouseEnter: (e, thisObj) => {
      thisObj.fill = "rgba(38, 50, 56, 0.3)";
    },
    mouseLeave: (e, thisObj) => {
      thisObj.fill = "transparent";
    },
  }),
  new go.Binding("visible", "", (data) => {
    return data._state === "completed";
  }),
  new go.Binding("scale", "", (data) => {
    return data._state === "completed" ? 1 : 0.001;
  })
);
