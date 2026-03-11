import extensionIcons from "../../assets/extensions";
import { NODE_TEMPLATES } from "../../templates/nodeTemplates";
import { LOG_TYPE } from "../constants/types";

const LOG_NODE = {
  _src: extensionIcons.logIcon,
  name: "Log",
  description: "",
  type: LOG_TYPE,
  template: NODE_TEMPLATES.CIRCLE,
  background: "#2695A4",
  foreground: "#fff",
};

export const logOptions = ["ERROR", "WARN", "INFO", "DEBUG"];

export default LOG_NODE;
