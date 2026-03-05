/**
 * @deprecated Use ITERATOR_V3_NODE from iterator-v3/constants.js instead.
 * This component is deprecated and will be removed in a future version.
 * All new implementations should use the WizardDrawer-based IteratorV3.
 */
import { sharedAssets as default_theme } from "@src/module/ods";
import { ITERATOR_TYPE } from "../constants/types";
import { NODE_TEMPLATES } from "../../templates/nodeTemplates";

const ITERATOR_NODE = {
  cmsId: "iterator",
  _src: "https://cdn-v1.tinycommand.com/1234567890/1742550036580/iterator.svg",
  name: "Iterator (Deprecated)",
  type: ITERATOR_TYPE,
  template: NODE_TEMPLATES.CIRCLE,
  background: "linear-gradient(180.4deg, #455A64 27.7%, #8BB6CA 100%)", //"#be63f9",
  foreground: "#fff",
  dark: "#455A64",
  light: "#8BB6CA",
  hasTestModule: false,
  canSkipTest: true,
};

export default ITERATOR_NODE;
