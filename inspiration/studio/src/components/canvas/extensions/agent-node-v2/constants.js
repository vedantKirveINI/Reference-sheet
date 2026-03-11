/**
 * @deprecated Use AGENT_NODE_V3 from agent-node-v3/constants.js instead.
 * This component is deprecated and will be removed in a future version.
 * All new implementations should use the WizardDrawer-based AgentNodeV3.
 */
import extensionIcons from "../../assets/extensions";
import { NODE_TEMPLATES } from "../../templates/nodeTemplates";

export const AGENT_NODE_V2_TYPE = "AGENT_NODE_V2";

export const AGENT_NODE_V2 = {
  _src: extensionIcons.agentIcon || "https://cdn-v1.tinycommand.com/1234567890/1757056195376/Bot%20Sparkle.svg",
  name: "Agent V2 (Deprecated)",
  type: AGENT_NODE_V2_TYPE,
  template: NODE_TEMPLATES.CIRCLE,
  background: "#8B5CF6",
  foreground: "#fff",
  dark: "#7C3AED",
  light: "#8B5CF6",
  hasTestModule: true,
  canSkipTest: true,
  credits: 10,
};

export const AGENT_TEMPLATES = [
  {
    id: "simple-agent",
    name: "Simple Agent",
    description: "Basic agent for straightforward task execution",
    icon: "Bot",
    defaults: {
      agentConfig: {},
      inputMapping: { type: "fx", blocks: [{ type: "PRIMITIVES", value: "" }] },
    },
  },
  {
    id: "research-agent",
    name: "Research Agent",
    description: "Agent optimized for research and information gathering",
    icon: "Search",
    defaults: {
      agentConfig: { mode: "research" },
      inputMapping: { type: "fx", blocks: [{ type: "PRIMITIVES", value: "" }] },
    },
  },
  {
    id: "automation-agent",
    name: "Automation Agent",
    description: "Agent designed for automated workflow processing",
    icon: "Cog",
    defaults: {
      agentConfig: { mode: "automation" },
      inputMapping: { type: "fx", blocks: [{ type: "PRIMITIVES", value: "" }] },
    },
  },
];
