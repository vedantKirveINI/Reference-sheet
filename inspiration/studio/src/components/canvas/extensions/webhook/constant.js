// import { default_theme } from '@src/module/ods';
import { WEBHOOK_TYPE } from "../constants/types";
import { NODE_TEMPLATES } from "../../templates/nodeTemplates";

const WEBHOOK_NODE = {
  cmsId: "webhook",
  _src: "https://cdn-v1.tinycommand.com/1234567890/1742543611755/webhook.svg",
  name: "Webhook Trigger",
  hoverDescription:
    "Starts when a webhook is received from an external system, triggering workflow execution.",
  type: WEBHOOK_TYPE,
  template: NODE_TEMPLATES.START,
  dark: "#E19C00",
  light: "#FFD16C",
  background: "#F8B31E",
  foreground: "#263238",
  denyFromLink: true,
};

export default WEBHOOK_NODE;
