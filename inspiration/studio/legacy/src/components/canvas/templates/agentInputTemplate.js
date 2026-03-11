import * as go from "gojs";
import {
  hideAddNodeAdornment,
  showAddNodeAdornment,
  zoomInNodeIcon,
  zoomOutNodeIcon,
} from "./template-utils";
import { FROM_PORT, SELECTION_ADORNMENT_COLOR } from "../constants";
import deleteIcon from "../assets/delete.svg";
import "./shapes";

const $ = go.GraphObject.make;

export const agentInputTemplate = $(
  go.Node,
  {
    isShadowed: true,
    shadowBlur: 12,
    shadowOffset: new go.Point(6, 6),
    shadowColor: "rgba(122,124, 141, 0.2)",
    mouseEnter: (e, node) => {
      zoomInNodeIcon(node);
      showAddNodeAdornment(node);
    },
    mouseLeave: (e, node, nextObj) => {
      zoomOutNodeIcon(node);
      hideAddNodeAdornment(node, nextObj);
    },
    toLinkable: false,
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
          showAddNodeAdornment(adornment.adornedObject.part);
        },
        mouseLeave: (e, adornment, nextObj) => {
          zoomOutNodeIcon(adornment.adornedObject.part);
          hideAddNodeAdornment(adornment.adornedObject.part, nextObj);
        },
      },
      $(go.Placeholder),
      $(
        go.Panel,
        "Spot",
        $(go.Shape, "RoundedRightRectangle", {
          strokeWidth: 2,
          stroke: SELECTION_ADORNMENT_COLOR,
          width: 200,
          height: 120,
          parameter1: 20,
          fill: "transparent",
          name: "SELECTIONADORNMENTSHAPE",
        }),
        $(go.Shape, "LineH", {
          width: 200,
          stroke: SELECTION_ADORNMENT_COLOR,
          strokeWidth: 2,
          margin: 3,
        }),
        $(
          go.Panel,
          "Spot",
          {
            alignment: new go.Spot(0.85, 0.75, 0, 0),
            cursor: "pointer",
            name: "RESET_TRIGGER_TYPE",
            isActionable: true,
            toolTip: new go.Adornment("Auto")
              .add(
                new go.Shape("RoundedRectangle", {
                  parameter1: 4,
                })
              )
              .add(
                new go.TextBlock({
                  margin: go.Margin.parse("8 16 8 16"),
                  stroke: "white",
                  text: "Change trigger type",
                })
              ),
          },
          $(go.Shape, "Circle", {
            width: 30,
            height: 30,
            fill: "white",
            stroke: "transparent",
          }),
          $(go.Picture, {
            source: deleteIcon,
            width: 24,
            height: 24,
          }),
          new go.Binding("visible", "", (data) => !!data.subType)
        )
      )
    ),
    selectionObjectName: "SELECTIONADORNMENTGO",
  },
  $(
    go.Panel,
    "Spot",
    $(
      go.Panel,
      "Spot",
      $(go.Shape, "RoundedRightRectangle", {
        width: 200,
        height: 120,
        fill: "white",
        // stroke: "#E4E5E8",
        name: "SELECTIONADORNMENTGO",
        parameter1: 20,
        stroke: "#CFD8DC",
        strokeWidth: 2,
      }),
      $(go.Shape, "LineH", { width: 200, stroke: "#CFD8DC", strokeWidth: 2 }),
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
      $(
        go.Panel,
        "Vertical",
        $(
          go.Panel,
          "Spot",
          $(go.Shape, "RoundedRectangle", {
            width: 200,
            height: 60,
            parameter1: 20,
            parameter2: 2,
            fill: "transparent",
            stroke: "transparent",
          }),
          $(
            go.Panel,
            "Horizontal",
            $(go.Picture, {
              width: 25,
              height: 25,
              source: "https://ccc.oute.app/test/1738677583891/workflow_icon",
            }),
            $(go.TextBlock, {
              font: "16px Inter",
              margin: go.Margin.parse("0 16 0 16"),
              text: "Agent Input",
            })
          )
        ),
        $(
          go.Panel,
          "Spot",
          $(go.Shape, "RoundedRectangle", {
            width: 200,
            height: 60,
            parameter1: 20,
            parameter2: 4,
            fill: "transparent",
            stroke: "transparent",
          }),
          $(
            go.Panel,
            "Horizontal",
            { width: 200, height: 60 },
            $(
              go.Picture,
              { width: 24, height: 24, margin: go.Margin.parse("0 4 0 8") },
              new go.Binding("source", "_src"),
              new go.Binding("visible", "", (data) => !!data.subType)
            ),
            $(
              go.TextBlock,
              {
                font: "16px Inter",
                overflow: go.TextOverflow.Ellipsis,
                cursor: "pointer",
                maxSize: new go.Size(110, NaN),
                wrap: go.Wrap.None,
                textAlign: "center",
              },
              new go.Binding("text", "", (data) =>
                data.subType ? data.name : "No inputs available!"
              ),
              new go.Binding("maxSize", "", (data) =>
                data.subType ? new go.Size(110, NaN) : new go.Size(200, NaN)
              ),
              new go.Binding("margin", "", (data) =>
                data.subType
                  ? go.Margin.parse("0 8 0 8")
                  : go.Margin.parse("0 32 0 32")
              )
            )
          )
        )
      ),
      $(go.Shape, "RoundedRightRectangle", {
        width: 200,
        height: 120,
        fill: "#263238",
        opacity: 0.2,
        name: "HOVEROVERLAY",
        stroke: "transparent",
        parameter1: 20,
        visible: false,
      }),
      $(
        go.Panel,
        "Spot",
        {
          alignment: new go.Spot(0.85, 0.75, 0, 0),
          cursor: "pointer",
          name: "AGENT_RESET_TRIGGER_TYPE",
          isActionable: true,
          toolTip: new go.Adornment("Auto")
            .add(
              new go.Shape("RoundedRectangle", {
                parameter1: 4,
              })
            )
            .add(
              new go.TextBlock({
                margin: go.Margin.parse("8 16 8 16"),
                stroke: "white",
                text: "Change trigger type",
              })
            ),
        },
        $(go.Shape, "Circle", {
          width: 30,
          height: 30,
          fill: "white",
          stroke: "transparent",
        }),
        $(go.Picture, {
          source: deleteIcon,
          width: 24,
          height: 24,
        }),
        new go.Binding("visible", "", (data) => !!data.subType)
      )
    ),
    $(
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
        return data?.errors?.length > 0 || data?.warnings?.length > 0;
      })
    )
  ),
  new go.Binding("location", "location", go.Point.parse).makeTwoWay(
    go.Point.stringify
  ),
  new go.Binding("locationSpot", "viewSpot", go.Spot.parse)
);
