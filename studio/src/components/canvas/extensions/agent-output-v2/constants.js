import extensionIcons from "../../assets/extensions";
import { NODE_TEMPLATES } from "../../templates/nodeTemplates";

export const AGENT_OUTPUT_V2_TYPE = "AGENT_OUTPUT_V2";

export const AGENT_OUTPUT_V2_NODE = {
  _src: extensionIcons.endIcon,
  name: "Agent Output",
  description: "Define what your agent returns",
  type: AGENT_OUTPUT_V2_TYPE,
  template: NODE_TEMPLATES.CIRCLE,
  background: "#3B82F6",
  foreground: "#fff",
  dark: "#2563eb",
  light: "#3B82F6",
  hasTestModule: true,
};

export const OUTPUT_TYPES = [
  { 
    id: "text", 
    label: "Text", 
    description: "Single or formatted text response",
  },
  { 
    id: "number", 
    label: "Number", 
    description: "Numeric result value",
  },
  { 
    id: "object", 
    label: "Object", 
    description: "Structured JSON object response",
  },
  { 
    id: "array", 
    label: "Array", 
    description: "List of items or results",
  },
];

export const FORMAT_OPTIONS = [
  { id: "raw", label: "Raw", description: "No formatting applied" },
  { id: "json", label: "JSON", description: "Format as JSON string" },
  { id: "markdown", label: "Markdown", description: "Format as Markdown" },
];

export const AGENT_OUTPUT_TEMPLATES = [
  {
    id: "text-response",
    name: "Text Response",
    description: "Simple text output from your agent",
    icon: "MessageSquare",
    defaults: {
      outputs: [
        {
          name: "response",
          type: "text",
          value: { type: "fx", blocks: [{ type: "PRIMITIVES", value: "" }] },
          format: "raw",
        },
      ],
    },
  },
  {
    id: "structured-response",
    name: "Structured Response",
    description: "Return structured data with multiple fields",
    icon: "LayoutList",
    defaults: {
      outputs: [
        {
          name: "result",
          type: "object",
          value: { type: "fx", blocks: [{ type: "PRIMITIVES", value: "" }] },
          format: "json",
        },
      ],
    },
  },
  {
    id: "action-result",
    name: "Action Result",
    description: "Return the result of an action with status",
    icon: "CheckCircle",
    defaults: {
      outputs: [
        {
          name: "success",
          type: "text",
          value: { type: "fx", blocks: [{ type: "PRIMITIVES", value: "true" }] },
          format: "raw",
        },
        {
          name: "data",
          type: "object",
          value: { type: "fx", blocks: [{ type: "PRIMITIVES", value: "" }] },
          format: "json",
        },
      ],
    },
  },
];
