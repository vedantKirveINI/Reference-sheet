import { sharedAssets as default_theme } from "@src/module/ods";
import { TRANSFORMER_TYPE_V2 } from "../constants/types";
import { NODE_TEMPLATES } from "../../templates/nodeTemplates";

const TRANSFORMER_V2_NODE = {
  cmsId: "transformer-v2",
  _src: "https://cdn-v1.tinycommand.com/1234567890/1742541673656/fx.svg",
  name: "Transformer V2",
  description: "Advanced formula editor with Notion-style UI",
  type: TRANSFORMER_TYPE_V2,
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
      "Formula",
      "Transform",
      "V2",
    ],
  },
};

export default TRANSFORMER_V2_NODE;
