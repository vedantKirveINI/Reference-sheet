import { NODE_TEMPLATES } from "../../templates/nodeTemplates";
import { TRIGGER_SETUP_TYPE } from "../constants/types";

const TRIGGER_SETUP_NODE = {
  _src: "https://cdn-v1.tinycommand.com/1234567890/1749475877233/trigger-setup.svg",
  name: "Setup Trigger",
  description: "",
  type: TRIGGER_SETUP_TYPE,
  template: NODE_TEMPLATES.TRIGGER_SETUP,
  background: "linear-gradient(rgb(28, 54, 147) 0%, rgb(44, 111, 218) 100%)",
  foreground: "#fff",
  dark: "#1C3693",
  light: "#2C6FDA",
  hasTestModule: false,
  canSkipTest: true,
};

export default TRIGGER_SETUP_NODE;
