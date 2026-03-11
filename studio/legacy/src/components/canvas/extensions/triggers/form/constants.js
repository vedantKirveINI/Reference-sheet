// import default_theme from "oute-ds-shared-assets";
import { FORM_TRIGGER } from "../../constants/types";
import { NODE_TEMPLATES } from "../../../templates/nodeTemplates";

const FORM_TRIGGER_NODE = {
  cmsId: "form_trigger",
  _src: "https://cdn-v1.tinycommand.com/1234567890/1756107470171/Form_trigger.svg",
  name: "Form Trigger",
  description: "",
  hoverDescription:
    "Start a workflow whenever a new form response is submitted.",
  type: FORM_TRIGGER,
  template: NODE_TEMPLATES.START,
  background: "linear-gradient(180deg, #E19C00 0%, #FFD16C 100%)", //"#F8B31E",
  foreground: "#fff",
  dark: "#E19C00",
  light: "#FFD16C",
  denyFromLink: true,
};

export default FORM_TRIGGER_NODE;
