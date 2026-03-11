/**
 * @deprecated Use TINY_SEARCH_V3_NODE from tiny-search-v3/constants.js instead.
 * This component is deprecated and will be removed in a future version.
 * All new implementations should use the WizardDrawer-based TinySearchV3.
 */
import { NODE_TEMPLATES } from "../../templates";
import { TINY_SEARCH_V2 } from "../constants/types";

const TINY_SEARCH_NODE = {
  cmsId: "tiny-search",
  _src: "https://cdn-v1.tinycommand.com/1234567890/1757394192884/TinySearch.svg",
  name: "Tiny Search V2 (Deprecated)",
  type: TINY_SEARCH_V2,
  template: NODE_TEMPLATES.CIRCLE,
  background: "linear-gradient(135deg, #8133F1 0%, #360083 100%)",
  foreground: "#fff",
  dark: "#360083",
  light: "#8133F1",
  hasTestModule: true,
  credits: 10,
  //   canSkipTest: true,
};

export default TINY_SEARCH_NODE;
