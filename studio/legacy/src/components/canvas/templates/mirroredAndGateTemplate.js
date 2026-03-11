import * as go from "gojs";
import { zoomInNodeIcon, zoomOutNodeIcon } from "./template-utils";
import { SELECTION_ADORNMENT_COLOR, TO_PORT } from "../constants";
const $ = go.GraphObject.make;

export const mirroredAndGateNodeTemplate = $(
  go.Node,
  {
    isShadowed: true,
    shadowBlur: 12,
    shadowOffset: new go.Point(0, 6),
    shadowColor: "rgba(122,124, 141, 0.2)",
    fromLinkable: false,
    deletable: false,
    movable: false,
    selectionAdornmentTemplate: $(
      go.Adornment,
      "Spot",
      {
        name: "SELECTIONADORNMENTTEMPLATEGO",
        zOrder: 99, // zOrder should be less than zOrder of AddNodeAdornment
        mouseEnter: (e, adornment) => {
          zoomInNodeIcon(adornment.adornedObject.part);
        },
        mouseLeave: (e, adornment, nextObj) => {
          zoomOutNodeIcon(adornment.adornedObject.part);
        },
        angle: 180,
      },
      $(go.Placeholder),
      $(go.Shape, "AndGate", {
        strokeWidth: 5,
        stroke: SELECTION_ADORNMENT_COLOR,
        width: 75,
        height: 75,
        fill: "transparent",
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
        },
        mouseLeave: (e, node) => {
          zoomOutNodeIcon(node);
        },
      },
      $(go.Shape, "AndGate", {
        width: 80,
        height: 80,
        fill: "white",
        stroke: "#E4E5E8",
        name: "SELECTIONADORNMENTGO",
        angle: 180, //Mirrored AND GATE
        // shadowVisible: true,
      }),
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
      $(
        go.Panel,
        "Spot",
        $(go.Shape, "Circle", {
          fill: "transparent",
          stroke: "transparent",
          width: 75,
          height: 75,
        }),
        $(
          go.Picture,
          { width: 45, height: 45, name: "NODEICON" },
          new go.Binding("source", "_src")
        )
      ),
      $(go.Shape, "AndGate", {
        angle: 180, //Mirrored AND GATE
        width: 80,
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
        alignment: new go.Spot(0.5, 1, 0, 32),
        width: 80,
      },
      $(
        go.TextBlock,
        {
          font: "16px Inter",
          height: 30,
          spacingAbove: 10,
          spacingBelow: 10,
          overflow: go.TextOverflow.Ellipsis,
        },
        new go.Binding("text", "description"),
        new go.Binding("visible", "", (data) => !!data.description)
      ),
      $(
        go.TextBlock,
        {
          font: "14px Inter",
          height: 30,
          overflow: go.TextOverflow.Ellipsis,
        },
        new go.Binding("text", "name"),
        new go.Binding("font", "", (data) => {
          return data.description ? "14px Inter" : "16px Inter";
        }),
        new go.Binding("spacingAbove", "", (data) => {
          return data.description ? 0 : 10;
        }),
        new go.Binding("spacingBelow", "", (data) => {
          return data.description ? 0 : 10;
        })
      ),
      $(
        go.Panel,
        "Spot",
        {
          // alignment: new go.Spot(0.8, 0.1),
          name: "NODENUMBER",
          // isActionable: true,
          // cursor: "pointer",
        },
        $(go.Shape, "CapsuleH", {
          fill: "#cfd8dc",
          stroke: "transparent",
          // strokeWidth: 1,
          width: 30,
          height: 25,
        }),
        $(
          go.TextBlock,
          { stroke: "black" },
          new go.Binding("text", "nodeNumber")
        ),
        new go.Binding("visible", "", (data) => !!data.nodeNumber)
      )
    ),
    $(
      go.Panel,
      "Spot",
      {
        alignment: new go.Spot(0.2, 0.1),
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
        return data?.errors?.length > 0 || data?.warnings?.length > 0;
      })
    )
  ),
  new go.Binding("location", "location", go.Point.parse).makeTwoWay(
    go.Point.stringify
  ),
  new go.Binding("locationSpot", "viewSpot", go.Spot.parse)
);
