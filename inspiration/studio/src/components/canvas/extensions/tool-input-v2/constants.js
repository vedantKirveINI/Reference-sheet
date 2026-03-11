import { NODE_TEMPLATES } from "../../templates/nodeTemplates";

export const TOOL_INPUT_V2_TYPE = "TOOL_INPUT_V2";

export const TOOL_INPUT_V2_NODE = {
  cmsId: "tool-input-v2",
  _src: "https://cdn-v1.tinycommand.com/1234567890/1756448453857/Union.svg",
  name: "Tool Input",
  description: "Define parameters for AI agent tools",
  hoverDescription: "Define tool parameters for AI agents",
  type: TOOL_INPUT_V2_TYPE,
  template: NODE_TEMPLATES.FIXED_START,
  background: "#6366F1",
  foreground: "#fff",
  dark: "#4f46e5",
  light: "#6366F1",
  hasTestModule: true,
  denyFromLink: true,
};

export const PARAM_TYPES = [
  { 
    id: "STRING", 
    label: "String", 
    description: "Text value",
    color: "#3b82f6"
  },
  { 
    id: "NUMBER", 
    label: "Number", 
    description: "Numeric value",
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
    description: "Complex data structure",
    color: "#10b981"
  },
  { 
    id: "ARRAY", 
    label: "Array", 
    description: "List of values",
    color: "#ef4444"
  },
];

export const TOOL_INPUT_TEMPLATES = [
  {
    id: "text-param",
    name: "Text Parameter",
    description: "Simple text input parameter for AI tools",
    icon: "Type",
    defaults: {
      parameters: [
        {
          name: "text_input",
          type: "STRING",
          description: "Text input for the tool",
          required: true,
          example: { type: "fx", blocks: [{ type: "PRIMITIVES", value: "Sample text" }] },
        },
      ],
    },
  },
  {
    id: "object-param",
    name: "Object Parameter",
    description: "Structured object with multiple properties",
    icon: "Braces",
    defaults: {
      parameters: [
        {
          name: "data",
          type: "OBJECT",
          description: "Structured data object",
          required: true,
          example: { type: "fx", blocks: [{ type: "PRIMITIVES", value: '{"key": "value"}' }] },
        },
      ],
    },
  },
  {
    id: "array-param",
    name: "Array Parameter",
    description: "List of items for batch processing",
    icon: "List",
    defaults: {
      parameters: [
        {
          name: "items",
          type: "ARRAY",
          description: "Array of items to process",
          required: true,
          example: { type: "fx", blocks: [{ type: "PRIMITIVES", value: '["item1", "item2"]' }] },
        },
      ],
    },
  },
];
