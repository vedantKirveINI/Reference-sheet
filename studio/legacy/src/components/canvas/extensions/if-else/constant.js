import extensionIcons from "../../assets/extensions";
import { IF_ELSE_TYPE } from "../constants/types";
import { NODE_TEMPLATES } from "../../templates/nodeTemplates";
// import IfElseDialog from ".";

const IF_ELSE_NODE = {
  _src: extensionIcons.ifElseIcon,
  name: "If Else (deprecated)",
  // description: "Condition",
  type: IF_ELSE_TYPE,
  template: NODE_TEMPLATES.CIRCLE, // GOJS default key for template
  // component: IfElseDialog,
  background: "linear-gradient(181deg, #0038C8 0%, #799EFF 129.04%)", //default_theme.palette.primary.main,
  foreground: "#fff",
  dark: "#0038C8",
  light: "#799EFF",
  hasTestModule: false,
  canSkipTest: true,
  deprecated: true,
};

export default IF_ELSE_NODE;
