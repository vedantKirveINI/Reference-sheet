import * as go from "gojs";
import { FROM_PORT, SELECTION_ADORNMENT_COLOR, TO_PORT } from "../constants";
import {
  hideAddNodeAdornment,
  showAddNodeAdornment,
  zoomInNodeIcon,
  zoomOutNodeIcon,
} from "./template-utils";
import { spinnerPanel } from "./spinnerPanel";
import { executionPanel } from "./executionPanel";
import { errorPanel } from "./errorPanel";
import { errorHandlingPanel } from "./errorHandlingPanel";
import { pendingOverlay } from "./pendingOverlay";
import { getHaloBindings } from "./haloEffect";
import "./shapes";
import { nodeNumberPanel } from "./nodeNumberPanel";

const $ = go.GraphObject.make;

export const loopNodeTemplate = $(
  go.Node,
  {
    isShadowed: true,
    shadowBlur: 16,
    shadowOffset: new go.Point(0, 6),
    shadowColor: "rgba(0, 0, 0, 0.08)",
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
      $(go.Shape, "CapsuleH", {
        strokeWidth: 5,
        stroke: SELECTION_ADORNMENT_COLOR,
        width: 145,
        height: 85,
        name: "SELECTIONADORNMENTSHAPE",
        fill: "transparent",
      }),
      errorPanel.copyTemplate(true),
      spinnerPanel.copyTemplate(true),
      executionPanel.copyTemplate(true)
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
      $(go.Shape, "CapsuleH", {
        width: 140,
        height: 80,
        name: "SELECTIONADORNMENTGO",
        strokeWidth: 2.5,
        fill: "#FFFFFF",
      },
        new go.Binding("stroke", "dark")
      ),
      $(
        go.Panel,
        "Spot",
        { isClipping: true },
        $(go.Shape, "CapsuleH", {
          width: 120,
          height: 60,
          fill: "transparent",
          stroke: "transparent",
          strokeWidth: 0,
        }),
        $(
          go.Picture,
          { width: 40, height: 40, name: "NODEICON" },
          new go.Binding("source", "_src")
        )
      ),
      $(go.Panel, "Auto",
        {
          alignment: new go.Spot(0.5, 1, 0, -6),
          alignmentFocus: go.Spot.Center,
        },
        new go.Binding("visible", "modeBadge", (v) => !!v),
        $(go.Shape, "RoundedRectangle", {
          parameter1: 8,
          strokeWidth: 0,
        },
          new go.Binding("fill", "dark")
        ),
        $(go.TextBlock, {
          font: "600 10px Inter, system-ui, sans-serif",
          stroke: "white",
          margin: new go.Margin(3, 8, 3, 8),
        },
          new go.Binding("text", "modeBadge")
        )
      ),
      $(go.Shape, "Circle", {
        cursor: "pointer",
        fill: "transparent",
        stroke: "transparent",
        width: 1,
        height: 1,
        portId: TO_PORT,
        alignment: go.Spot.Left,
        toSpot: go.Spot.Left,
        toLinkable: true,
      }),
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
      $(go.Shape, "CapsuleH", {
        width: 140,
        height: 80,
        fill: "#263238",
        opacity: 0.2,
        name: "HOVEROVERLAY",
        stroke: "transparent",
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
          font: "600 15px Inter, system-ui, sans-serif",
          stroke: "#1E293B",
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
          font: "13px Inter",
          stroke: "#64748B",
          maxLines: 2,
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
  new go.Binding("location", "location", go.Point.parse).makeTwoWay(go.Point.stringify),
  ...getHaloBindings()
);
