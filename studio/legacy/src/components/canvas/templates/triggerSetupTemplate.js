import * as go from "gojs";
import { FROM_PORT, SELECTION_ADORNMENT_COLOR } from "../constants";
import {
  hideAddNodeAdornment,
  showAddNodeAdornment,
  zoomInNodeIcon,
  zoomOutNodeIcon,
} from "./template-utils";
import "./shapes";
import { spinnerPanel } from "./spinnerPanel";
import { executionPanel } from "./executionPanel";
import { errorPanel } from "./errorPanel";
import { pendingOverlay } from "./pendingOverlay";
import { nodeNumberPanel } from "./nodeNumberPanel";

const $ = go.GraphObject.make;

const resetPanel = $(
  go.Panel,
  "Spot",
  {
    alignment: new go.Spot(0.1, 0.2, 0, 0),
    // cursor: "pointer",
    name: "RESET_TRIGGER_SETUP",
    // isActionable: true,
    // toolTip: new go.Adornment("Auto")
    //   .add(
    //     new go.Shape("RoundedRectangle", {
    //       parameter1: 4,
    //     })
    //   )
    //   .add(
    //     new go.TextBlock({
    //       margin: go.Margin.parse("8 16 8 16"),
    //       stroke: "white",
    //       text: "Change trigger type",
    //     })
    //   ),
  },
  $(go.Picture, {
    source:
      "https://cdn-v1.tinycommand.com/1234567890/1749279773375/change-trigger.svg",
    width: 55,
    height: 55,
  }),
  $(go.Shape, {
    width: 0,
    height: 0,
    fill: "transparent",
    stroke: "transparent",
  }),
  new go.Binding("opacity", "", (data) => {
    return data?.subType ? 1 : 0;
  })
);

export const triggerSetupTemplate = $(
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
        zOrder: 99, // zOrder should be less than zOrder of AddNodeAdornment
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
      $(go.Shape, "Circle", {
        strokeWidth: 5,
        stroke: SELECTION_ADORNMENT_COLOR,
        width: 95,
        height: 95,
        fill: "transparent",
        name: "SELECTIONADORNMENTSHAPE",
      }),
      errorPanel.copyTemplate(true),
      resetPanel.copyTemplate(true),
      spinnerPanel.copyTemplate(true),
      executionPanel.copyTemplate(true)
    ),
    selectionObjectName: "SELECTIONADORNMENTGO",
    toLinkable: false,
    deletable: false,
    movable: false,
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
      $(go.Shape, "Circle", {
        width: 100,
        height: 100,
        fill: "white",
        stroke: "#E4E5E8",
        name: "SELECTIONADORNMENTGO",
        // shadowVisible: true,
      }),
      $(
        go.Panel,
        "Spot",
        { isClipping: true },
        $(go.Shape, "Circle", {
          width: 75,
          height: 75,
          fill: "transparent",
          stroke: "transparent",
          strokeWidth: 0,
        }),
        $(
          go.Picture,
          { width: 45, height: 45, name: "NODEICON" },
          new go.Binding("source", "_src")
        )
      ),
      $(go.Shape, "Circle", {
        cursor: "pointer",
        fill: "transparent",
        stroke: "transparent",
        width: 1,
        height: 1,
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
      $(go.Shape, "Circle", {
        width: 0,
        height: 0,
        fill: "#263238",
        opacity: 0.2,
        name: "HOVEROVERLAY",
        stroke: "transparent",
      })
    ),
    $(
      go.Panel,
      "Vertical",
      {
        alignment: new go.Spot(0.5, 1),
        alignmentFocus: new go.Spot(0.5, 0),
        width: 200,
        toolTip: new go.Adornment(
          "Auto", // that has several labels around it
          { background: "black" }
        ) // avoid hiding tooltip when mouse moves
          .add(
            new go.Placeholder(), // placeholder will be a bit bigger than node
            new go.TextBlock({ margin: 4, stroke: "white" }).bind(
              "text",
              "hoverDescription"
            )
          )
          .bind("visible", "", (data) => data.hoverDescription?.length > 0), // end Adornment
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
    resetPanel.copyTemplate(true),
    spinnerPanel.copyTemplate(true),
    executionPanel.copyTemplate(true),
    pendingOverlay.copyTemplate(true)
  ),
  new go.Binding("location", "location", go.Point.parse).makeTwoWay(
    go.Point.stringify
  )
);
