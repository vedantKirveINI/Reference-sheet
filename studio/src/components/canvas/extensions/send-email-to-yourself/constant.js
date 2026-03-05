/**
 * @deprecated Use SEND_EMAIL_TO_YOURSELF_V2_NODE from send-email-to-yourself-v2/constants.js instead.
 * This component is deprecated and will be removed in a future version.
 * All new implementations should use the WizardDrawer-based SendEmailToYourselfV2.
 */
import { SEND_EMAIL_TO_YOURSELF_TYPE } from "../constants/types";
import { NODE_TEMPLATES } from "../../templates/nodeTemplates";

const SEND_EMAIL_TO_YOURSELF_NODE = {
  cmsId: "send-email-to-yourself",
  _src: "https://cdn-v1.tinycommand.com/1234567890/1757569290393/3178158.png",
  name: "Send Email to Yourself (Deprecated)",
  description: "",
  type: SEND_EMAIL_TO_YOURSELF_TYPE,
  template: NODE_TEMPLATES.CIRCLE,
  background: "linear-gradient(180.4deg, #6200EE 27.7%, #A676EA 100%)", //"#be63f9",
  foreground: "#fff",
  dark: "#6200EE",
  light: "#A676EA",
  hasTestModule: true,
  canSkipTest: false,
  meta: {
    search_keys: ["Ai"],
  },
};

export default SEND_EMAIL_TO_YOURSELF_NODE;
