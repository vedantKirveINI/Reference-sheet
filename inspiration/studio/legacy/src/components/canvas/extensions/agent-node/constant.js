import { NODE_TEMPLATES } from "../../templates";
import { AGENT_WORKFLOW } from "../constants/types";

const AGENT_NODE = {
  cmsId: "agent",
  _src: "https://cdn-v1.tinycommand.com/1234567890/1757056195376/Bot%20Sparkle.svg",
  name: "Agent",
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
