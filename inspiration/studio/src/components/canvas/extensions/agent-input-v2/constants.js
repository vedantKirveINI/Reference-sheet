import extensionIcons from "../../assets/extensions";
import { NODE_TEMPLATES } from "../../templates/nodeTemplates";

export const AGENT_INPUT_V2_TYPE = "AGENT_INPUT_V2";

export const AGENT_INPUT_V2_NODE = {
  _src: extensionIcons.startIcon,
  name: "Agent Input",
  description: "Define the inputs your agent receives",
  type: AGENT_INPUT_V2_TYPE,
  template: NODE_TEMPLATES.START,
  background: "#22C55E",
  foreground: "#fff",
  dark: "#16a34a",
  light: "#22C55E",
  hasTestModule: true,
};

export const INPUT_TYPES = [
  { 
    id: "text", 
    label: "Text", 
    description: "Single or multi-line text input",
  },
  { 
    id: "number", 
    label: "Number", 
    description: "Numeric values with optional validation",
  },
  { 
    id: "object", 
    label: "Object", 
    description: "Structured JSON object data",
  },
  { 
    id: "array", 
    label: "Array", 
    description: "List of items or values",
  },
];

export const AGENT_INPUT_TEMPLATES = [
  {
    id: "text-input",
    name: "Text Input",
    description: "Simple text parameter for your agent",
    icon: "Type",
    defaults: {
      inputs: [
        {
          name: "message",
          type: "text",
          description: "The main text input for the agent",
          required: true,
          validation: null,
        },
      ],
    },
  },
  {
    id: "structured-input",
    name: "Structured Input",
    description: "Multiple parameters with different types",
    icon: "LayoutList",
    defaults: {
      inputs: [
        {
          name: "data",
          type: "object",
          description: "Structured data object",
          required: true,
          validation: null,
        },
      ],
    },
  },
  {
    id: "file-input",
    name: "File Input",
    description: "Accept file uploads or file references",
    icon: "FileUp",
    defaults: {
      inputs: [
        {
          name: "file",
          type: "text",
          description: "File path or URL reference",
          required: true,
          validation: null,
        },
      ],
    },
  },
];
