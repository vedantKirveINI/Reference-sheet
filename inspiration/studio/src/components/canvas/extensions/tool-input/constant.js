// import { default_theme } from '@src/module/ods';
import { TOOL_INPUT_TYPE } from "../constants/types";
import { NODE_TEMPLATES } from "../../templates/nodeTemplates";

const TOOL_INPUT_NODE = {
  cmsId: "tool-input",
  _src: "https://cdn-v1.tinycommand.com/1234567890/1756448453857/Union.svg",
  name: "Tool Input",
  hoverDescription: "This is a tool input node",
  type: TOOL_INPUT_TYPE,
  template: NODE_TEMPLATES.FIXED_START,
  dark: "#360083",
  light: "#8133F1",
  viewSpot: "0 0.5",
  background: "linear-gradient(196deg, #8133F1 2.15%, #360083 77.96%)",
  foreground: "#ffffffff",
  denyFromLink: true,
};

export default TOOL_INPUT_NODE;
