// import default_theme from "oute-ds-shared-assets";
import { sharedAssets as default_theme } from "@src/module/ods";
import extensionIcons from "../../assets/extensions";
import { WORKFLOW_SETUP_TYPE } from "../constants/types";
import { NODE_TEMPLATES } from "../../templates/nodeTemplates";

const WORKFLOW_SETUP_NODE = {
  _src: extensionIcons.workflowSetupIcon,
  name: "Workflow",
  description: "",
  type: WORKFLOW_SETUP_TYPE,
  template: NODE_TEMPLATES.FIXED_END,
  background: default_theme.palette.primary.main,
  foreground: "#fff",
  dark: "#00457D",
  light: "#4AA3EB",
  denyToLink: true,
};

export default WORKFLOW_SETUP_NODE;
