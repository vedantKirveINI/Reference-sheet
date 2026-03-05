// import { default_theme } from '@src/module/ods';
import { AGENT_INPUT } from "../constants/types";
import { NODE_TEMPLATES } from "../../templates/nodeTemplates";

const AGENT_INPUT_NODE = {
  _src: "https://cdn-v1.tinycommand.com/1234567890/1742543775187/manual.svg",
  name: "Agent Input",
  hoverDescription:
    "The workflow starts when it is manually launched, meaning it begins execution only when the 'Run' button is clicked.",
  type: AGENT_INPUT,
  template: NODE_TEMPLATES.START,
  background: "linear-gradient(180deg, #E19C00 0%, #FFD16C 100%)", //"#F8B31E",
  foreground: "#fff",
  dark: "#E19C00",
  light: "#FFD16C",
  denyFromLink: true,
};

export default AGENT_INPUT_NODE;
