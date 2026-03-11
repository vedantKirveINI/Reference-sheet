// import default_theme from "oute-ds-shared-assets";
import { default_theme } from "@src/module/ods";
import { ARRAY_AGGREGATOR_TYPE } from "../constants/types";
import { NODE_TEMPLATES } from "../../templates/nodeTemplates";

const ARRAY_AGGREGATOR_NODE = {
  cmsId: "array-aggregator",
  _src: "https://cdn-v1.tinycommand.com/1234567890/1742543022007/aggregrator.svg",
  name: ARRAY_AGGREGATOR_TYPE,
  description: "",
  type: ARRAY_AGGREGATOR_TYPE,
  template: NODE_TEMPLATES.CIRCLE,
  background: "linear-gradient(180.4deg, #455A64 27.7%, #8BB6CA 100%)", //"#be63f9",
  foreground: "#fff",
  dark: "#455A64",
  light: "#8BB6CA",
  hasTestModule: false,
  canSkipTest: true,
};

export default ARRAY_AGGREGATOR_NODE;
