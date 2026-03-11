/**
 * @deprecated Use AGENT_COMPOSER_V3_NODE from agent-composer-v3/constants.js instead.
 * This component is deprecated and will be removed in a future version.
 * All new implementations should use the WizardDrawer-based AgentComposerV3.
 */
import { default_theme } from "@src/module/ods";
import { AGENT_TINY_COMPOSER } from "../../constants/types";
import { NODE_TEMPLATES } from "../../../templates";

const AGENT_COMPOSER_NODE = {
  cmsId: "agent-composer",
  _src: "https://cdn-v1.tinycommand.com/1234567890/1741763088435/TinyComposer.svg",
  name: "Tiny Composer (Deprecated)",
  description: "",
  type: AGENT_TINY_COMPOSER,
  template: NODE_TEMPLATES.CIRCLE,
  background: "linear-gradient(135deg, #8133F1 0%, #360083 100%)",
  foreground: "#fff",
  dark: "#360083",
  light: "#8133F1",
  hasTestModule: true,
  canSkipTest: true,
  credits: 10,
  // meta: {
  //     search_keys: [
  //         "Modify",
  //         "Convert",
  //         "Function",
  //         "Evaluate",
  //         "Change",
  //     ],
  // },
};

export default AGENT_COMPOSER_NODE;
