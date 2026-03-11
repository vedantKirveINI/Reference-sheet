import {
  CONNECTION_SETUP_NODE,
  START_NODE,
  WORKFLOW_SETUP_NODE,
  AGENT_INPUT_NODE,
  TRIGGER_SETUP_NODE,
  TOOL_INPUT_NODE,
} from "../../../canvas/extensions";
import { getMode } from "../../../../config/config";
import { MODE } from "../../../../constants/mode";

export const SETUP = "Setup";
const mode = getMode();

const getSetupComponents = () => {
  switch (mode) {
    case MODE.INTEGRATION_CANVAS:
      return [START_NODE];
    case MODE.CMS_CANVAS:
      return [CONNECTION_SETUP_NODE, WORKFLOW_SETUP_NODE];
    case MODE.AGENT_CANVAS:
      return [AGENT_INPUT_NODE];
    case MODE.WC_CANVAS:
      return [TRIGGER_SETUP_NODE];
    case MODE.TOOL_CANVAS:
      return [TOOL_INPUT_NODE];
    default:
      return [];
  }
};

export const SETUP_COMPONENTS = getSetupComponents();
