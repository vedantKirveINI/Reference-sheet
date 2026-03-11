/**
 * @deprecated Use SKIP_V3_NODE from skip-v3/constants.js instead.
 * This component is deprecated and will be removed in a future version.
 * All new implementations should use the WizardDrawer-based SkipV3.
 */
import { sharedAssets as default_theme } from "@src/module/ods";
import { SKIP_TYPE } from "../constants/types";
import { NODE_TEMPLATES } from "../../templates/nodeTemplates";

const SKIP_NODE = {
  cmsId: "skip",
  _src: "https://cdn-v1.tinycommand.com/1234567890/1742542462019/skip.svg",
  name: "Skip (Deprecated)",
  type: SKIP_TYPE,
  template: NODE_TEMPLATES.END,
  background: "linear-gradient(180.4deg, #455A64 27.7%, #8BB6CA 100%)", //"#be63f9",
  foreground: "#fff",
  dark: "#455A64",
  light: "#8BB6CA",
  hasTestModule: false,
  canSkipTest: true,
  denyToLink: true,
};

export default SKIP_NODE;
