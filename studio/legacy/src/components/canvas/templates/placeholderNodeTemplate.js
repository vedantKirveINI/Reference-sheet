import * as go from "gojs";
import addNodeIcon from "../assets/add-node.svg";
import { FROM_PORT } from "../constants";
const $ = go.GraphObject.make;

export const placeholderNodeTemplate = $(
  go.Node,
  { name: "PLACEHOLDERNODE" },
  $(
    go.Panel,
    "Spot",
    $(go.Picture, {
      source: addNodeIcon,
      width: 40,
      height: 40,
      portId: FROM_PORT,
      alignment: go.Spot.Right,
      fromSpot: go.Spot.Center,
      toSpot: go.Spot.Left,
      fromLinkable: true,
      name: "FROMPORTGO",
      isActionable: true,
      cursor: "pointer",
      actionMove: (e, obj) => {
        let tool = e.diagram.toolManager.linkingTool;
        tool.startObject = obj.part.findObject("FROMPORTGO");
        e.diagram.currentTool = tool;
        tool.doActivate();
      },
    })
  )
);
