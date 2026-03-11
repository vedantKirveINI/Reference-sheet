import * as go from "gojs";
import "./shapes";
const $ = go.GraphObject.make;

export const errorPanel = $(
  go.Panel,
  "Spot",
  {
    alignment: new go.Spot(0.8, 0.1),
    name: "ERRORNODEGO",
    isActionable: true,
    cursor: "pointer",
  },
  $(
    go.Shape,
    "CapsuleH",
    {
      fill: "red",
      stroke: "white",
      strokeWidth: 3,
      width: 30,
      height: 25,
    },
    new go.Binding("fill", "", (data) => {
      return data?.warnings?.length > 0 ? "#fb8c00" : "red";
    })
  ),
  $(
    go.TextBlock,
    { stroke: "white" },
    new go.Binding(
      "text",
      "",
      (data) => (data?.errors?.length || 0) + (data.warnings?.length || 0)
    )
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
    if (data?._state === "completed" && data?._executions?.length > 0) return false;
    return (data?.errors?.length || 0) + (data?.warnings?.length || 0) > 0;
  }),
  new go.Binding("scale", "", (data) => {
    if (data?._state === "completed" && data?._executions?.length > 0) return 0.001;
    return (data?.errors?.length || 0) + (data?.warnings?.length || 0) > 0
      ? 1
      : 0.001;
  }),
  new go.Binding("alignment", "", (data) => {
    return data.module === "Question"
      ? new go.Spot(0.8, 0)
      : new go.Spot(0.8, 0.1);
  })
);
