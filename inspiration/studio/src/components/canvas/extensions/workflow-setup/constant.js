import extensionIcons from "../../assets/extensions";
import { WORKFLOW_SETUP_TYPE } from "../constants/types";
import { NODE_TEMPLATES } from "../../templates/nodeTemplates";

const WORKFLOW_SETUP_NODE = {
  _src: extensionIcons.workflowSetupIcon,
  name: "Workflow",
  type: WORKFLOW_SETUP_TYPE,
  template: NODE_TEMPLATES.FIXED_END,
  background: "var(--primary-500)",
  foreground: "#fff",
  dark: "#00457D",
  light: "#4AA3EB",
  denyToLink: true,
};

export default WORKFLOW_SETUP_NODE;
