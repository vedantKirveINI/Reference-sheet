import * as go from "gojs";
import addNodeIcon from "../assets/add-node.svg";
const $ = go.GraphObject.make;

export const addNodeAdornment = $(
  go.Adornment,
  "Spot",
  {
    name: "ADDNODEADORNMENTTEMPLATEGO",
    cursor: "pointer",
    zOrder: 100, //zOrder should be greater than zOrder of selectionAdornmentTemplate
  },
  $(go.Placeholder),
  $(go.Picture, {
    source: addNodeIcon,
    width: 40,
    height: 40,
    isActionable: true,
    actionMove: (e, ad) => {
      let tool = e.diagram.toolManager.linkingTool;
      tool.startObject = ad.part.adornedObject;
      e.diagram.currentTool = tool;
      tool.doActivate();
    },
  })
);
