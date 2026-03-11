import * as go from "gojs";
import { SEQUENCE_NODE_TEMPLATES } from "../constants";

import { circleNodeTemplate } from "@/components/canvas/templates/circleNodeTemplate";
import { roundedRectangleTemplate } from "@/components/canvas/templates/roundedRectangleTemplate";
import { startNodeTemplate } from "@/components/canvas/templates/startNodeTemplate";
import { endNodeTemplate } from "@/components/canvas/templates/endNodeTemplate";
import { triggerSetupTemplate } from "@/components/canvas/templates/triggerSetupTemplate";
import { linkTemplate } from "@/components/canvas/templates/linkTemplate";

const templates = [
  { key: SEQUENCE_NODE_TEMPLATES.TRIGGER, template: triggerSetupTemplate },
  {
    key: SEQUENCE_NODE_TEMPLATES.TINY_MODULE,
    template: roundedRectangleTemplate,
  },
  { key: SEQUENCE_NODE_TEMPLATES.WAIT, template: circleNodeTemplate },
  {
    key: SEQUENCE_NODE_TEMPLATES.CONDITIONAL,
    template: roundedRectangleTemplate,
  },
  { key: SEQUENCE_NODE_TEMPLATES.EXIT, template: endNodeTemplate },
  { key: SEQUENCE_NODE_TEMPLATES.HITL, template: circleNodeTemplate },
  { key: SEQUENCE_NODE_TEMPLATES.MERGE_JOIN, template: circleNodeTemplate },
  {
    key: SEQUENCE_NODE_TEMPLATES.LOOP_START,
    template: roundedRectangleTemplate,
  },
  { key: SEQUENCE_NODE_TEMPLATES.LOOP_END, template: roundedRectangleTemplate },
];

export const getSequenceNodeTemplates = () => {
  const map = new go.Map();

  for (const { key, template } of templates) {
    map.add(key, template);
  }

  return map;
};

export const getSequenceLinkTemplates = () => {
  const map = new go.Map();
  map.add("", linkTemplate);
  return map;
};

export const getSequenceGroupTemplates = () => {
  return new go.Map();
};
