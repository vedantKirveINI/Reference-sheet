import extensionIcons from "../../assets/extensions";
import { CONNECTION_SETUP_TYPE } from "../constants/types";
import { NODE_TEMPLATES } from "../../templates/nodeTemplates";

const CONNECTION_SETUP_NODE = {
  _src: extensionIcons.connectionSetupIcon,
  name: "Connection",
  type: CONNECTION_SETUP_TYPE,
  template: NODE_TEMPLATES.FIXED_START,
  background: "#fff",
  foreground: "rgb(38, 50, 56)",
  viewSpot: "0 0.5",
  hasTestModule: false,
  denyFromLink: true,
};

export const CONNECTION_SETUP_NODE_THEME = {
  background: "#FB6D2B",
  foreground: "#fff",
  dark: "#FD5D2D",
  light: "#F09A19",
};

export default CONNECTION_SETUP_NODE;
