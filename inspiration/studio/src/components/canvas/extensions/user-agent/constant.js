import extensionIcons from "../../assets/extensions";
import { AGENT_WORKFLOW } from "../constants/types";
import { NODE_TEMPLATES } from "../../templates/nodeTemplates";

const AGENT_WORKFLOW_NODE = {
  _src: "https://ccc.oute.app/test/1745918133175/agent_workflow",
  name: "Agent",
  description: "",
  type: AGENT_WORKFLOW,
  template: NODE_TEMPLATES.ROUNDED_RECTANGLE,
  background: "var(--primary-500)",
  foreground: "#fff",
  dark: "#00457D",
  light: "#4AA3EB",
  denyFromLink: true,
};

export default AGENT_WORKFLOW_NODE;
