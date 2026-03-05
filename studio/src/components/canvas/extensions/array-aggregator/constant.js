/**
 * @deprecated Use ARRAY_AGGREGATOR_V3_NODE from array-aggregator-v3/constants.js instead.
 * This component is deprecated and will be removed in a future version.
 * All new implementations should use the WizardDrawer-based ArrayAggregatorV3.
 */
import { default_theme } from "@src/module/ods";
import { ARRAY_AGGREGATOR_TYPE } from "../constants/types";
import { NODE_TEMPLATES } from "../../templates/nodeTemplates";

const ARRAY_AGGREGATOR_NODE = {
  cmsId: "array-aggregator",
  _src: "https://cdn-v1.tinycommand.com/1234567890/1742543022007/aggregrator.svg",
  name: "Array Aggregator (Deprecated)",
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
