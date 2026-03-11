// import default_theme from "oute-ds-shared-assets";
import { sharedAssets as default_theme } from "@src/module/ods";
// import InputSetupDialog from ".";
import { TRANSFORMER_TYPE } from "../constants/types";
import { NODE_TEMPLATES } from "../../templates/nodeTemplates";

const TRANSFORMER_NODE = {
  cmsId: "transformer",
  _src: "https://cdn-v1.tinycommand.com/1234567890/1742541673656/fx.svg",
  name: "Transformer",
  description: "",
  type: TRANSFORMER_TYPE,
  template: NODE_TEMPLATES.CIRCLE,
  background: default_theme.palette.primary.main,
  foreground: "#fff",
  dark: "#00457D",
  light: "#4AA3EB",
  meta: {
    search_keys: [
      "Modify",
      "Convert",
      "Function",
      "Evaluate",
      "Change",
    ],
  },
};

export default TRANSFORMER_NODE;
