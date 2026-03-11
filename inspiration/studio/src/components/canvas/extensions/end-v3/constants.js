import extensionIcons from "../../assets/extensions";
import { NODE_TEMPLATES } from "../../templates/nodeTemplates";
import { SUCCESS_SETUP_TYPE } from "../constants/types";

/** Re-export for consumers; same as SUCCESS_SETUP_TYPE ("Success Setup"). */
export { SUCCESS_SETUP_TYPE as END_NODE_TYPE } from "../constants/types";

export const END_NODE = {
  cmsId: "end-v3",
  _src: extensionIcons.endIcon,
  name: "End",
  type: SUCCESS_SETUP_TYPE,
  template: NODE_TEMPLATES.END,
  background: "#22C55E",
  foreground: "#fff",
  dark: "#16a34a",
  light: "#22C55E",
  hasTestModule: false,
  denyToLink: true,
};

export const THEME = {
  primaryButtonBg: "#16a34a",
  primaryButtonText: "#ffffff",
  iconBg: "rgba(34, 197, 94, 0.08)",
  iconBorder: "rgba(34, 197, 94, 0.15)",
  iconColor: "#22C55E",
};

export const FAILURE_THEME = {
  primaryButtonBg: "#dc2626",
  primaryButtonText: "#ffffff",
  iconBg: "rgba(239, 68, 68, 0.08)",
  iconBorder: "rgba(239, 68, 68, 0.15)",
  iconColor: "#EF4444",
};

export const END_TYPES = [
  {
    id: "success",
    label: "Success",
    description: "Workflow completed successfully",
    color: "#22C55E",
    background: "#22C55E",
  },
  {
    id: "failure",
    label: "Failure",
    description: "Workflow ended with an error",
    color: "#EF4444",
    background: "#EF4444",
  },
];

export const END_TEMPLATES = [
  {
    id: "success",
    name: "Success",
    description: "Mark workflow as successfully completed",
    icon: "CheckCircle",
    defaults: {
      endType: "success",
      output: { type: "fx", blocks: [{ type: "PRIMITIVES", value: "" }] },
      message: "",
      enableJsonResponse: false,
      statusCode: 200,
      outputs: [],
    },
  },
  {
    id: "failure",
    name: "Failure",
    description: "Mark workflow as failed with error details",
    icon: "XCircle",
    defaults: {
      endType: "failure",
      output: { type: "fx", blocks: [{ type: "PRIMITIVES", value: "" }] },
      message: "",
      enableJsonResponse: false,
      statusCode: 500,
      outputs: [],
    },
  },
  {
    id: "json-response",
    name: "JSON Response",
    description: "Return a structured JSON response with custom fields",
    icon: "Code",
    defaults: {
      endType: "success",
      output: { type: "fx", blocks: [{ type: "PRIMITIVES", value: "" }] },
      message: "",
      enableJsonResponse: true,
      statusCode: 200,
      outputs: [],
    },
  },
  {
    id: "conditional-end",
    name: "Conditional End",
    description: "End workflow based on specific conditions",
    icon: "GitBranch",
    defaults: {
      endType: "success",
      output: { type: "fx", blocks: [{ type: "PRIMITIVES", value: "" }] },
      message: "",
      enableJsonResponse: false,
      statusCode: 200,
      outputs: [],
    },
  },
];
