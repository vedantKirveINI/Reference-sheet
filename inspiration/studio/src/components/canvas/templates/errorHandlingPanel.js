import * as go from "gojs";
import "./shapes";
const $ = go.GraphObject.make;

const getErrorTooltipText = (data) => {
  if (!data?.errorConfig) return "";
  switch (data.errorConfig.strategy) {
    case "skip":
      return "On Error: Skip & Continue";
    case "retry":
      return `On Error: Retry ${data.errorConfig.retryCount || 3}x`;
    case "custom_error_flow":
      return "On Error: Custom Error Flow";
    default:
      return "";
  }
};

export const errorHandlingPanel = $(
  go.Panel,
  "Spot",
  {
    alignment: new go.Spot(0.2, 0.9),
    name: "ERRORHANDLINGNODEGO",
    isActionable: true,
    cursor: "pointer",
  },
  $(
    go.Shape,
    "CapsuleH",
    {
      fill: "#1E40AF",
      stroke: "white",
      strokeWidth: 2,
      width: 22,
      height: 22,
    },
    new go.Binding("fill", "", (data) => {
      if (data?.errorConfig?.strategy === "custom_error_flow") return "#DC2626";
      if (
        data?.errorConfig?.strategy === "retry" &&
        data?.errorConfig?.retryFallback === "custom_error_flow"
      )
        return "#DC2626";
      return "#1E40AF";
    })
  ),
  $(go.TextBlock, {
    text: "⚡",
    stroke: "white",
    font: "10px sans-serif",
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
    return !!(
      data?.errorConfig &&
      data?.errorConfig?.strategy &&
      data?.errorConfig?.strategy !== "stop"
    );
  }),
  new go.Binding("scale", "", (data) => {
    const hasConfig = !!(
      data?.errorConfig &&
      data?.errorConfig?.strategy &&
      data?.errorConfig?.strategy !== "stop"
    );
    return hasConfig ? 1 : 0.001;
  })
);
