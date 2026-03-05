import { NODE_TEMPLATES } from "../../templates/nodeTemplates";

export const WEBHOOK_TYPE_V2 = "WEBHOOK_V2";

export const WEBHOOK_V2_NODE = {
  cmsId: "webhook-v2",
  _src: "https://cdn-v1.tinycommand.com/1234567890/1742543611755/webhook.svg",
  name: "Webhook",
  description: "Receive incoming HTTP requests from external systems",
  hoverDescription: "Starts when a webhook is received from an external system, triggering workflow execution.",
  type: WEBHOOK_TYPE_V2,
  template: NODE_TEMPLATES.START,
  background: "#8B5CF6",
  foreground: "#fff",
  dark: "#6d28d9",
  light: "#a78bfa",
  hasTestModule: true,
  canSkipTest: false,
  denyFromLink: true,
  meta: {
    search_keys: [
      "Webhook",
      "Trigger",
      "Receive",
      "Listen",
      "Endpoint",
      "Callback",
      "Hook",
      "Integration",
    ],
  },
};

export const RESPONSE_TYPES = {
  JSON: { id: "json", label: "JSON", contentType: "application/json" },
  TEXT: { id: "text", label: "Plain Text", contentType: "text/plain" },
  HTML: { id: "html", label: "HTML", contentType: "text/html" },
};

export const HTTP_METHODS = {
  GET: "GET",
  POST: "POST",
  PUT: "PUT",
  PATCH: "PATCH",
  DELETE: "DELETE",
  ANY: "ANY",
};

export const WEBHOOK_TEMPLATES = [
  {
    id: "receive-json",
    name: "Receive JSON",
    description: "Accept JSON payloads from external services",
    icon: "FileJson",
    defaults: {
      method: HTTP_METHODS.POST,
      expectedSchema: { type: "object", properties: {} },
      responseType: RESPONSE_TYPES.JSON.id,
      responseBody: '{"success": true}',
      responseStatus: 200,
    },
  },
  {
    id: "receive-form",
    name: "Receive Form Data",
    description: "Accept form submissions from websites",
    icon: "FormInput",
    defaults: {
      method: HTTP_METHODS.POST,
      expectedSchema: { type: "object", properties: {} },
      responseType: RESPONSE_TYPES.JSON.id,
      responseBody: '{"received": true}',
      responseStatus: 200,
    },
  },
  {
    id: "github-webhook",
    name: "GitHub Webhook",
    description: "Receive events from GitHub repositories",
    icon: "Github",
    defaults: {
      method: HTTP_METHODS.POST,
      expectedSchema: {
        type: "object",
        properties: {
          action: { type: "string" },
          repository: { type: "object" },
          sender: { type: "object" },
        },
      },
      responseType: RESPONSE_TYPES.JSON.id,
      responseBody: '{"status": "received"}',
      responseStatus: 200,
      verifySignature: true,
      signatureHeader: "X-Hub-Signature-256",
    },
  },
];

export const TABS = {
  INITIALISE: "initialise",
  CONFIGURE: "configure",
  TEST: "test",
};

export const getDefaultState = () => ({
  name: "",
  webhookUrl: "",
  method: HTTP_METHODS.ANY,
  expectedSchema: { type: "object", properties: {} },
  responseType: RESPONSE_TYPES.JSON.id,
  responseBody: '{"success": true}',
  responseStatus: 200,
  headers: [],
  verifySignature: false,
  signatureHeader: "",
  signatureSecret: "",
  output_schema: null,
  _templateId: null,
  _isFromScratch: false,
});
