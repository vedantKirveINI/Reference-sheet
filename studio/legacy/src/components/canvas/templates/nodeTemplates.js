import * as go from "gojs";
import { circleNodeTemplate } from "./circleNodeTemplate";
import { andGateNodeTemplate } from "./andGateNodeTemplate";
import { mirroredAndGateNodeTemplate } from "./mirroredAndGateTemplate";
import { placeholderNodeTemplate } from "./placeholderNodeTemplate";
import { roundedRectangleTemplate } from "./roundedRectangleTemplate";
import { startNodeTemplate } from "./startNodeTemplate";
import { endNodeTemplate } from "./endNodeTemplate";
import { agentInputTemplate } from "./agentInputTemplate";
import { startRoundedRectangleTemplate } from "./startRoundedRectangleTemplate";
import { endRoundedRectangleTemplate } from "./endRoundedRectangleTemplate";
import { stickyNoteTemplate } from "./stickyNoteTemplate";
import { SELECTION_ADORNMENT_COLOR } from "../constants";
import { triggerSetupTemplate } from "./triggerSetupTemplate";

export const NODE_TEMPLATES = {
  PLACEHOLDER: "placeholder",
  CIRCLE: "",
  FIXED_START: "fixedStartNode",
  FIXED_END: "fixedEndNode",
  START: "startNode",
  END: "endNode",
  ROUNDED_RECTANGLE: "roundedRectangle",
  AGENT_INPUT: "agentInput",
  START_ROUNDED_RECTANGLE: "startRoundedRectangle",
  END_ROUNDED_RECTANGLE: "endRoundedRectangle",
  STICKY_NOTE: "stickyNote",
  TRIGGER_SETUP: "triggerSetup",
};

const templates = [
  { key: NODE_TEMPLATES.FIXED_START, template: andGateNodeTemplate },
  { key: NODE_TEMPLATES.FIXED_END, template: mirroredAndGateNodeTemplate },
  { key: NODE_TEMPLATES.START, template: startNodeTemplate },
  { key: NODE_TEMPLATES.END, template: endNodeTemplate },
  { key: NODE_TEMPLATES.PLACEHOLDER, template: placeholderNodeTemplate },
  { key: NODE_TEMPLATES.ROUNDED_RECTANGLE, template: roundedRectangleTemplate },
  { key: NODE_TEMPLATES.CIRCLE, template: circleNodeTemplate },
  { key: NODE_TEMPLATES.AGENT_INPUT, template: agentInputTemplate },
  {
    key: NODE_TEMPLATES.START_ROUNDED_RECTANGLE,
    template: startRoundedRectangleTemplate,
  },
  {
    key: NODE_TEMPLATES.END_ROUNDED_RECTANGLE,
    template: endRoundedRectangleTemplate,
  },
  { key: NODE_TEMPLATES.STICKY_NOTE, template: stickyNoteTemplate },
  { key: NODE_TEMPLATES.TRIGGER_SETUP, template: triggerSetupTemplate },
];
export const getNodeTemplates = (mode) => {
  const map = new go.Map();

  for (const template of templates) {
    const adornment = template.template?.selectionAdornmentTemplate?.findObject(
      "SELECTIONADORNMENTSHAPE"
    );
    if (adornment) {
      adornment.stroke = SELECTION_ADORNMENT_COLOR;
    }
    map.add(template.key, template.template);
  }

  return map;
};
