// DEPRECATED: This file is no longer used. Shadow bindings in haloEffect.js are used instead.
import * as go from "gojs";
import "./shapes";
const $ = go.GraphObject.make;

const getHaloColor = (data) => {
  if (data?._state === "running") return "rgba(59, 130, 246, 0.12)";
  if (data?._executionResult?.success === false || data?.errors?.length > 0) return "rgba(239, 68, 68, 0.15)";
  if (data?.warnings?.length > 0) return "rgba(245, 158, 11, 0.15)";
  if (data?._state === "completed" && data?._executionResult?.success === true) return "rgba(34, 197, 94, 0.12)";
  if (data?._executions?.some((e) => !!e.error)) return "rgba(239, 68, 68, 0.15)";
  return "transparent";
};

const shouldShowHalo = (data) => {
  return (
    data?._state === "running" ||
    (data?._state === "completed" && data?._executionResult?.success === true) ||
    (data?._executionResult?.success === false) ||
    (data?.errors?.length > 0) ||
    (data?.warnings?.length > 0) ||
    (data?._executions?.some((e) => !!e.error))
  );
};

export const createHaloPanel = (shapeType = "Circle", size = 150) => {
  return $(
    go.Panel,
    "Spot",
    {
      alignment: go.Spot.Center,
      alignmentFocus: go.Spot.Center,
      name: "HALOPANEL",
    },
    $(
      go.Shape,
      shapeType,
      {
        width: size,
        height: size,
        strokeWidth: 0,
        stroke: "transparent",
        name: "HALOSHAPE",
      },
      new go.Binding("fill", "", getHaloColor),
      new go.Binding("width", "", (data) => shouldShowHalo(data) ? size : 0.001),
      new go.Binding("height", "", (data) => shouldShowHalo(data) ? size : 0.001),
      new go.Binding("opacity", "", (data) => shouldShowHalo(data) ? 1 : 0)
    ),
    new go.Binding("visible", "", shouldShowHalo),
    new go.Binding("scale", "", (data) => shouldShowHalo(data) ? 1 : 0.001)
  );
};

export const haloPanel = createHaloPanel("Circle", 150);
export const haloRectPanel = createHaloPanel("RoundedRectangle", 150);
export const haloSmallPanel = createHaloPanel("Circle", 130);
