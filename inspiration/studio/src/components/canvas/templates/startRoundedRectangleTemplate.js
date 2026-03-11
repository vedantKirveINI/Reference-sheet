import * as go from "gojs";
import { FROM_PORT, SELECTION_ADORNMENT_COLOR } from "../constants";
import {
  hideAddNodeAdornment,
  showAddNodeAdornment,
  zoomInNodeIcon,
  zoomOutNodeIcon,
} from "./template-utils";
import { errorPanel } from "./errorPanel";
import { errorHandlingPanel } from "./errorHandlingPanel";
import { spinnerPanel } from "./spinnerPanel";
import { executionPanel } from "./executionPanel";
import { pendingOverlay } from "./pendingOverlay";
import { getHaloBindings } from "./haloEffect";
import "./shapes";
import { nodeNumberPanel } from "./nodeNumberPanel";

const $ = go.GraphObject.make;

export const startRoundedRectangleTemplate = $(
  go.Node,
  {
    isShadowed: true,
    shadowBlur: 12,
    shadowOffset: new go.Point(0, 6),
    shadowColor: "rgba(122,124, 141, 0.2)",
    selectionAdornmentTemplate: $(
      go.Adornment,
      "Spot",
      {
        name: "SELECTIONADORNMENTTEMPLATEGO",
        zOrder: 99,
        mouseEnter: (e, adornment) => {
          zoomInNodeIcon(adornment.adornedObject.part);
          showAddNodeAdornment(adornment.adornedObject.part);
        },
        mouseLeave: (e, adornment, nextObj) => {
          zoomOutNodeIcon(adornment.adornedObject.part);
          hideAddNodeAdornment(adornment.adornedObject.part, nextObj);
        },
      },
      $(go.Placeholder),
      $(go.Shape, "RoundedRectangle", {
        strokeWidth: 5,
        stroke: SELECTION_ADORNMENT_COLOR,
        width: 100,
        height: 100,
        fill: "transparent",
        parameter1: 16,
        name: "SELECTIONADORNMENTSHAPE",
      })
    ),
    selectionObjectName: "SELECTIONADORNMENTGO",
  },
  $(
    go.Panel,
    "Spot",
    $(
      go.Panel,
      "Spot",
      {
        mouseEnter: (e, node) => {
          zoomInNodeIcon(node);
          showAddNodeAdornment(node);
        },
        mouseLeave: (e, node, nextObj) => {
          zoomOutNodeIcon(node);
          hideAddNodeAdornment(node, nextObj);
        },
      },
      $(go.Shape, "RoundedRectangle", {
        width: 100,
        height: 100,
        fill: "white",
        stroke: "#cfd8dc",
        name: "SELECTIONADORNMENTGO",
        parameter1: 16,
      }),
      $(
        go.Panel,
        "Spot",
        { isClipping: true },
        $(go.Shape, "RoundedRectangle", {
          width: 100,
          height: 100,
          fill: "transparent",
          stroke: "transparent",
          strokeWidth: 0,
          parameter1: 16,
        }),
        $(
          go.Picture,
          { width: 45, height: 45, name: "NODEICON" },
          new go.Binding("source", "_src")
        )
      ),
      $(go.Shape, "Circle", {
        fill: "transparent",
        stroke: "transparent",
        width: 1,
        height: 1,
        portId: FROM_PORT,
        alignment: go.Spot.Right,
        fromSpot: go.Spot.Right,
        fromLinkable: true,
        name: "FROMPORTGO",
      }),
      $(go.Shape, "RoundedRectangle", {
        width: 100,
        height: 100,
        opacity: 0.2,
        name: "HOVEROVERLAY",
        fill: "#263238",
        stroke: "transparent",
        parameter1: 16,
        visible: false,
      })
    ),
    $(
      go.Panel,
      "Vertical",
      {
        alignment: new go.Spot(0.5, 1),
        alignmentFocus: new go.Spot(0.5, 0),
        width: 200,
      },
      $(
        go.TextBlock,
        {
          font: "16px Inter",
          overflow: go.TextOverflow.Ellipsis,
          spacingAbove: 16,
          spacingBelow: 8,
          maxLines: 1,
          textAlign: "center",
        },
        new go.Binding("text", "name")
      ),
      $(
        go.TextBlock,
        {
          font: "14px Inter",
          maxLines: 3,
          spacingAbove: 4,
          textAlign: "center",
          overflow: go.TextOverflow.Ellipsis,
        },
        new go.Binding("text", "description"),
        new go.Binding("visible", "", (data) => !!data.description)
      ),
      nodeNumberPanel.copyTemplate(true)
    ),
    errorPanel.copyTemplate(true),
    errorHandlingPanel.copyTemplate(true),
    spinnerPanel.copyTemplate(true),
    executionPanel.copyTemplate(true),
    pendingOverlay.copyTemplate(true)
  ),
  new go.Binding("location", "location", go.Point.parse).makeTwoWay(
    go.Point.stringify
  ),
  ...getHaloBindings()
);
