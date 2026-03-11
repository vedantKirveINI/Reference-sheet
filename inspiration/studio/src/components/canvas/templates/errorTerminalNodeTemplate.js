import * as go from "gojs";
import { TO_PORT } from "../constants";
import { getHaloBindings } from "./haloEffect";

const $ = go.GraphObject.make;

const ERROR_BG = "#7F1D1D";
const ERROR_BORDER = "#991B1B";
const ERROR_TEXT = "#FECACA";

export const errorTerminalNodeTemplate = $(
  go.Node,
  "Spot",
  {
    isShadowed: true,
    shadowBlur: 10,
    shadowOffset: new go.Point(0, 4),
    shadowColor: "rgba(127, 29, 29, 0.25)",
    selectionAdorned: false,
    deletable: true,
    movable: true,
    fromLinkable: false,
    toLinkable: true,
    cursor: "pointer",
  },
  new go.Binding("location", "location", go.Point.parse).makeTwoWay(
    go.Point.stringify
  ),
  $(
    go.Panel,
    "Auto",
    $(go.Shape, "RoundedRectangle", {
      name: "ERROR_TERMINAL_BG",
      fill: ERROR_BG,
      stroke: ERROR_BORDER,
      strokeWidth: 1.5,
      parameter1: 20,
      minSize: new go.Size(60, 36),
    }),
    $(
      go.Panel,
      "Horizontal",
      {
        margin: new go.Margin(8, 16, 8, 16),
        alignment: go.Spot.Center,
      },
      $(go.Shape, "XLine", {
        width: 10,
        height: 10,
        stroke: ERROR_TEXT,
        strokeWidth: 2,
        margin: new go.Margin(0, 6, 0, 0),
      }),
      $(
        go.TextBlock,
        {
          font: "600 12px Inter",
          stroke: ERROR_TEXT,
          textAlign: "center",
          verticalAlignment: go.Spot.Center,
        },
        new go.Binding("text", "name")
      )
    )
  ),
  $(go.Shape, "Circle", {
    fill: "transparent",
    stroke: "transparent",
    width: 1,
    height: 1,
    portId: TO_PORT,
    alignment: go.Spot.Left,
    toSpot: go.Spot.Left,
    toLinkable: true,
  }),
  ...getHaloBindings()
);
