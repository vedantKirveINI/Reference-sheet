
import { IF_ELSE_TYPE_V2 } from "../constants/types";
import { NODE_TEMPLATES } from "../../templates/nodeTemplates";
// import IfElseDialog from ".";

const IF_ELSE_NODE_V2 = {
  cmsId: "if-else",
  _src: "https://cdn-v1.tinycommand.com/1234567890/1742541487770/Ifelse.svg",
  name: "If Else",
  type: IF_ELSE_TYPE_V2,
  template: NODE_TEMPLATES.CIRCLE, // GOJS default key for template
  background: "linear-gradient(181deg, #0038C8 0%, #799EFF 129.04%)", //default_theme.palette.primary.main,
  foreground: "#fff",
  dark: "#0038C8",
  light: "#799EFF",
  hasTestModule: false,
  meta: {
    search_keys: ["Alston", "If Else", "If Else V2"],
  },
  canSkipTest: true,
};

export default IF_ELSE_NODE_V2;
