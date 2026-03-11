
import extensionIcons from "../../assets/extensions";
import { NODE_TEMPLATES } from "../../templates/nodeTemplates";
import { DELAY_TYPE } from "../constants/types";

const DELAY_NODE = {
  cmsId: "delay",
  _src: extensionIcons.delayIcon,
  name: "Delay",
  description: DELAY_TYPE,
  type: DELAY_TYPE,
  template: NODE_TEMPLATES.CIRCLE,
  // component: DelayDialog,
  dark: "#EB4A84",
  light: "#EB4A84",
  background: "#EB4A84",
  foreground: "#fff",
};

export default DELAY_NODE;
