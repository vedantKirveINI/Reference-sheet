import * as go from "gojs";
import addNodeIcon from "../assets/add-node.svg";
import { FROM_PORT, TO_PORT } from "../constants";
const $ = go.GraphObject.make;

export const placeholderNodeTemplate = $(
  go.Node,
  { name: "PLACEHOLDERNODE" },
  new go.Binding("location", "location", go.Point.parse).makeTwoWay(
    go.Point.stringify
  ),
  $(
    go.Panel,
    "Spot",
    $(go.Picture, {
      source: addNodeIcon,
      width: 40,
      height: 40,
      name: "PLACEHOLDER_ICON",
      isActionable: true,
      cursor: "pointer",
      actionMove: (e, obj) => {
        const part = obj.part;
        const fromPort = part.findObject("FROMPORTGO");
        if (process.env.NODE_ENV === "development") {
          console.log("[placeholderNodeTemplate] actionMove on PLACEHOLDER_ICON", {
            nodeKey: part?.data?.key,
            hasFromPort: !!fromPort,
            isReadOnly: e.diagram?.isReadOnly,
          });
        }
        const tool = e.diagram.toolManager.linkingTool;
        tool.startObject = fromPort;
        e.diagram.currentTool = tool;
        tool.doActivate();
      },
    }),
    $(go.Shape, {
      fill: "transparent",
      stroke: "transparent",
      width: 1,
      height: 1,
      portId: TO_PORT,
      alignment: go.Spot.Left,
      toSpot: go.Spot.Left,
      toLinkable: true,
    }),
    $(go.Shape, {
      fill: "transparent",
      stroke: "transparent",
      width: 1,
      height: 1,
      portId: FROM_PORT,
      alignment: go.Spot.Right,
      fromSpot: go.Spot.Right,
      fromLinkable: true,
      name: "FROMPORTGO",
      isActionable: true,
      cursor: "pointer",
      actionMove: (e, obj) => {
        const part = obj.part;
        const fromPort = part.findObject("FROMPORTGO");
        if (process.env.NODE_ENV === "development") {
          console.log("[placeholderNodeTemplate] actionMove on FROMPORTGO", {
            nodeKey: part?.data?.key,
            hasFromPort: !!fromPort,
            isReadOnly: e.diagram?.isReadOnly,
          });
        }
        const tool = e.diagram.toolManager.linkingTool;
        tool.startObject = fromPort;
        e.diagram.currentTool = tool;
        tool.doActivate();
      },
    })
  )
);
