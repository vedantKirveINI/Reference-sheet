// import { default_theme } from '@src/module/ods';
import { INPUT_SETUP_TYPE } from "../constants/types";
import { NODE_TEMPLATES } from "../../templates/nodeTemplates";

const START_NODE = {
  cmsId: "start",
  _src: "https://cdn-v1.tinycommand.com/1234567890/1742543775187/manual.svg",
  name: "Manual Trigger",
  hoverDescription:
    "Starts when manually triggered by the 'Run' button, executing the workflow immediately.",
  type: INPUT_SETUP_TYPE,
  template: NODE_TEMPLATES.START,
  background: "linear-gradient(180deg, #E19C00 0%, #FFD16C 100%)", //"#F8B31E",
  foreground: "#fff",
  dark: "#E19C00",
  light: "#FFD16C",
  denyFromLink: true,
};

export default START_NODE;
