import extensionIcons from "../../assets/extensions";
import { AGENT_OUTPUT } from "../constants/types";
import { NODE_TEMPLATES } from "../../templates/nodeTemplates";

const AGENT_OUTPUT_NODE = {
  _src: extensionIcons.endIcon,
  name: "Agent Reply",
  description: "",
  type: AGENT_OUTPUT,
  template: NODE_TEMPLATES.CIRCLE,
  background: "linear-gradient(180.4deg, #455A64 27.7%, #8BB6CA 100%)", //"#be63f9",
  foreground: "#fff",
  dark: "#455A64",
  light: "#8BB6CA",
  hasTestModule: false,
  canSkipTest: true,
};

export default AGENT_OUTPUT_NODE;
