// import default_theme from "oute-ds-shared-assets";
import { TOOL_OUTPUT_TYPE } from "../constants/types";
import { NODE_TEMPLATES } from "../../templates/nodeTemplates";

const TOOL_OUTPUT_NODE = {
  cmsId: "tool-output",
  _src: "https://cdn-v1.tinycommand.com/1234567890/1756448453857/Union.svg",
  name: "Tool Output",
  description: "",
  hoverDescription: "This is a tool output node",
  type: TOOL_OUTPUT_TYPE,
  template: NODE_TEMPLATES.END,
  foreground: "white",
  dark: "#360083",
  light: "#8133F1",
  background: "linear-gradient(196deg, #8133F1 2.15%, #360083 77.96%)",
  denyToLink: true,
};

export default TOOL_OUTPUT_NODE;
