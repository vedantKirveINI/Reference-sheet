import { FORMULA_FX_TYPE } from "../constants/types";
import { NODE_TEMPLATES } from "../../templates/nodeTemplates";

const FORMULA_FX_NODE = {
  cmsId: "formula-fx",
  _src: "https://cdn-v1.tinycommand.com/1234567890/1742541673656/fx.svg",
  name: "Formula FX",
  type: FORMULA_FX_TYPE,
  template: NODE_TEMPLATES.CIRCLE,
  background: "#6366F1",
  foreground: "#fff",
  dark: "#4338CA",
  light: "#818CF8",
  meta: {
    search_keys: [
      "Formula",
      "FX",
      "AI Formula",
      "Transform",
      "Calculate",
      "Expression",
      "Function",
      "Math",
      "Convert",
      "AI",
      "Generate",
      "Smart",
    ],
  },
};

export default FORMULA_FX_NODE;
