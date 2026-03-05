import { NODE_TEMPLATES } from "../../templates";
import { AGENT_WORKFLOW } from "../constants/types";

/**
 * @deprecated Use AGENT_NODE_V3 from agent-node-v3/constants.js instead.
 * This component is deprecated and will be removed in a future version.
 * All new implementations should use the WizardDrawer-based AgentNodeV3.
 */
const AGENT_NODE = {
  cmsId: "agent",
  _src: "https://cdn-v1.tinycommand.com/1234567890/1757056195376/Bot%20Sparkle.svg",
  name: "Agent (Deprecated)",
  description: "",
  type: AGENT_WORKFLOW,
  template: NODE_TEMPLATES.CIRCLE,
  background: "linear-gradient(180.4deg, #3A0782 27.7%, #8F40FF 100%)", //"#be63f9",
  foreground: "#fff",
  dark: "#3A0782",
  light: "#3A0782",
  hasTestModule: true,
  canSkipTest: true,
  credits: 10,
  // meta: {
  //     search_keys: [
  //         "Modify",
  //         "Convert",
  //         "Function",
  //         "Evaluate",
  //         "Change",
  //     ],
  // },
};

export default AGENT_NODE;
