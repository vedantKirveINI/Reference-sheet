import { NODE_TEMPLATES } from "../../templates/nodeTemplates";

export const TOOL_OUTPUT_V2_TYPE = "TOOL_OUTPUT_V2";

export const TOOL_OUTPUT_V2_NODE = {
  cmsId: "tool-output-v2",
  _src: "https://cdn-v1.tinycommand.com/1234567890/1756448453857/Union.svg",
  name: "Tool Output",
  description: "Define response schema for AI agent tools",
  hoverDescription: "Define tool response schema",
  type: TOOL_OUTPUT_V2_TYPE,
  template: NODE_TEMPLATES.END,
  background: "#10B981",
  foreground: "#fff",
  dark: "#059669",
  light: "#10B981",
  hasTestModule: true,
  denyToLink: true,
};

export const OUTPUT_TYPES = [
  { 
    id: "STRING", 
    label: "String", 
    description: "Text response",
    color: "#3b82f6"
  },
  { 
    id: "NUMBER", 
    label: "Number", 
    description: "Numeric response",
    color: "#8b5cf6"
  },
  { 
    id: "BOOLEAN", 
    label: "Boolean", 
    description: "True or false",
    color: "#f59e0b"
  },
  { 
    id: "OBJECT", 
    label: "Object", 
    description: "Structured response",
    color: "#10b981"
  },
  { 
    id: "ARRAY", 
    label: "Array", 
    description: "List of items",
    color: "#ef4444"
  },
];

export const FORMAT_OPTIONS = [
  { id: "raw", label: "Raw", description: "Return as-is" },
  { id: "json", label: "JSON", description: "Format as JSON" },
  { id: "markdown", label: "Markdown", description: "Format as Markdown" },
  { id: "text", label: "Plain Text", description: "Format as plain text" },
];

export const TOOL_OUTPUT_TEMPLATES = [
  {
    id: "text-output",
    name: "Text Output",
    description: "Simple text response from the tool",
    icon: "FileText",
    defaults: {
      outputs: [
        {
          name: "result",
          type: "STRING",
          description: "Text result from the tool",
          value: { type: "fx", blocks: [{ type: "PRIMITIVES", value: "" }] },
          format: "raw",
        },
      ],
    },
  },
  {
    id: "object-output",
    name: "Object Output",
    description: "Structured object response with multiple fields",
    icon: "Braces",
    defaults: {
      outputs: [
        {
          name: "data",
          type: "OBJECT",
          description: "Structured data response",
          value: { type: "fx", blocks: [{ type: "PRIMITIVES", value: "" }] },
          format: "json",
        },
      ],
    },
  },
  {
    id: "success-error",
    name: "Success/Error Response",
    description: "Standard success or error response format",
    icon: "CheckCircle",
    defaults: {
      outputs: [
        {
          name: "success",
          type: "BOOLEAN",
          description: "Whether the operation succeeded",
          value: { type: "fx", blocks: [{ type: "PRIMITIVES", value: "true" }] },
          format: "raw",
        },
        {
          name: "message",
          type: "STRING",
          description: "Status message or error details",
          value: { type: "fx", blocks: [{ type: "PRIMITIVES", value: "" }] },
          format: "text",
        },
      ],
    },
  },
];
