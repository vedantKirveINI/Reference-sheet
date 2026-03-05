import { NODE_TEMPLATES } from "../../templates";
import { AGENT_WORKFLOW } from "../constants/types";

export const AGENT_NODE_V3 = {
  cmsId: "agent-v3",
  _src: "https://cdn-v1.tinycommand.com/1234567890/1757056195376/Bot%20Sparkle.svg",
  name: "Agent",
  type: AGENT_WORKFLOW,
  template: NODE_TEMPLATES.CIRCLE,
  background: "linear-gradient(180.4deg, #3A0782 27.7%, #8F40FF 100%)",
  foreground: "#fff",
  dark: "#3A0782",
  light: "#8F40FF",
  hasTestModule: true,
  canSkipTest: true,
  credits: 10,
};

export const TABS = {
  INITIALISE: "initialise",
  CONFIGURE: "configure",
  TEST: "test",
};

export const THEME = {
  headerBg: "#ffffff",
  primaryButtonBg: "#3A0782",
};
