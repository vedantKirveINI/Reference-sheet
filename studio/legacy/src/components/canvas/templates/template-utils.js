import * as go from "gojs";
import {
  addNodeAdornment,
  // linkOptionAdornment
} from "./adornmentTemplates";

export const zoomInNodeIcon = (node) => {
  const animation = new go.Animation();
  animation.duration = 300;
  const iconPanel = node.findObject("NODEICON");
  const hoverPanel = node.findObject("HOVEROVERLAY");
  hoverPanel.visible = true;
  animation.add(iconPanel, "scale", 1, 1.1);
  animation.start();
};
export const zoomOutNodeIcon = (node) => {
  const animation = new go.Animation();
  animation.duration = 300;
  const iconPanel = node.findObject("NODEICON");
  const hoverPanel = node.findObject("HOVEROVERLAY");
  hoverPanel.visible = false;
  animation.add(iconPanel, "scale", 1.1, 1);
  animation.start();
};
const removeAdornment = (node) => {
  node.part.removeAdornment("ADDNODEADORNMENT");
  addNodeAdornment.adornedObject = null;
};
export const showAddNodeAdornment = (node) => {
  // Check if diagram is readonly - if so, don't show add node adornment
  if (node.diagram && node.diagram.isReadOnly) {
    return;
  }

  const animation = new go.Animation();
  animation.duration = 300;
  const mainNodeObject = node.part.findObject("FROMPORTGO");
  if (!addNodeAdornment.adornedObject) {
    addNodeAdornment.adornedObject = mainNodeObject;
    addNodeAdornment.mouseLeave = () => {
      removeAdornment(node);
    };
    node.part.addAdornment("ADDNODEADORNMENT", addNodeAdornment);
  }
  animation.add(addNodeAdornment, "scale", 0.3, 1);
  animation.start();
};
export const hideAddNodeAdornment = (node, nextObj) => {
  if (
    nextObj?.part.name !== "ADDNODEADORNMENTTEMPLATEGO" &&
    nextObj?.part.name !== "SELECTIONADORNMENTTEMPLATEGO"
  ) {
    removeAdornment(node);
  }
};
export const showLinkOptionAdornment = (link) => {
  if (link.data.label) {
    return;
  }
  // Check if diagram is readonly - if so, don't show link add icon
  if (link.diagram && link.diagram.isReadOnly) {
    return;
  }

  const animation = new go.Animation();
  animation.duration = 300;
  const linkAddIconObject = link.part.findObject("LINKADDICONPART");
  animation.add(linkAddIconObject, "width", 1, 40);
  animation.add(linkAddIconObject, "height", 1, 40);
  animation.start();
  animation.finished = () => {
    linkAddIconObject.width = 40;
    linkAddIconObject.height = 40;
  };
};
export const hideLinkOptionAdornment = (link, nextObj) => {
  if (link.data.label) {
    return;
  }
  if (link.diagram && link.diagram.isReadOnly) {
    return;
  }

  const animation = new go.Animation();
  animation.duration = 300;
  const linkAddIconObject = link.part.findObject("LINKADDICONPART");
  animation.add(linkAddIconObject, "width", 40, 1);
  animation.add(linkAddIconObject, "height", 40, 1);
  animation.start();
  animation.finished = () => {
    linkAddIconObject.width = 1;
    linkAddIconObject.height = 1;
  };
};
const getFillColor = (state) => {
  switch (state) {
    case "begin_node":
      return "lightyellow";
    case "end_node":
      return "lightgreen";
    case "error":
      return "red";
    case "aborted":
      return "purple";
    default:
      return "lightyellow";
  }
};
/**
 *
 * @param {go.Node} node
 * @param {String} state
 */
export const animateNode = (node, state, skipAnimation = false) => {
  if (!node) return;
  const mainPanel = node?.findObject("SELECTIONADORNMENTGO");
  const diagram = node.diagram;
  const anim = new go.Animation();
  anim.add(mainPanel, "fill", "#E4E5E8", getFillColor(state));
  anim.duration = skipAnimation ? 10 : 300;
  anim.start();
  diagram.commandHandler.scrollToPart(node);
};
