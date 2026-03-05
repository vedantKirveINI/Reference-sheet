/**
 * @deprecated delay_deprecate — Use Delay V2 (type: "Delay") from delay-v2 instead.
 * This component is deprecated and will be deleted after testing. All new nodes use Delay V2.
 */
import extensionIcons from "../../assets/extensions";
import { NODE_TEMPLATES } from "../../templates/nodeTemplates";
import { DELAY_TYPE } from "../constants/types";

const DELAY_NODE = {
  cmsId: "delay",
  _src: extensionIcons.delayIcon,
  name: "Delay (Deprecated)",
  type: DELAY_TYPE,
  template: NODE_TEMPLATES.CIRCLE,
  // component: DelayDialog,
  dark: "#EB4A84",
  light: "#EB4A84",
  background: "#EB4A84",
  foreground: "#fff",
};

export default DELAY_NODE;
