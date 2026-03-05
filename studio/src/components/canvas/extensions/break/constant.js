/**
 * @deprecated Use BREAK_V3_NODE from break-v3/constants.js instead.
 * This component is deprecated and will be removed in a future version.
 * All new implementations should use the WizardDrawer-based BreakV3.
 */
import { default_theme } from "@src/module/ods";
import { BREAK_TYPE } from "../constants/types";
import { NODE_TEMPLATES } from "../../templates/nodeTemplates";

const BREAK_NODE = {
  cmsId: "break",
  _src: "https://cdn-v1.tinycommand.com/1234567890/1742542883829/break.svg",
  name: "Break (Deprecated)",
  type: BREAK_TYPE,
  template: NODE_TEMPLATES.END,
  background: "linear-gradient(180.4deg, #455A64 27.7%, #8BB6CA 100%)", //"#be63f9",
  foreground: "#fff",
  dark: "#455A64",
  light: "#8BB6CA",
  hasTestModule: false,
  canSkipTest: true,
  denyToLink: true,
};

export default BREAK_NODE;
