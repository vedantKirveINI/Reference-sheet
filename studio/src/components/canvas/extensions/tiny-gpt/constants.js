import { NODE_TEMPLATES } from "../../templates/nodeTemplates";
import { TINY_GPT_TYPE } from "../constants/types";
import extensionIcons from "../../assets/extensions";

export { TINY_GPT_TYPE };

export const TINYGPT_NODE = {
  cmsId: "tiny-gpt-v3",
  _src: "https://cdn-v1.tinycommand.com/1234567890/1770458055954/tiny%20gpt.svg",
  name: "TinyGPT",
  type: TINY_GPT_TYPE,
  template: NODE_TEMPLATES.CIRCLE,
  background: "linear-gradient(180.4deg, #6366F1 27.7%, #818CF8 100%)",
  foreground: "#fff",
  dark: "#6366F1",
  light: "#818CF8",
  hasTestModule: true,
  canSkipTest: false,
  credits: 10,
  meta: {
    search_keys: ["AI", "GPT", "Assistant", "Chat", "Prompt", "Answer"],
  },
};

export const TABS = {
  INITIALISE: "initialise",
  CONFIGURE: "configure",
  TEST: "test",
};

export const THEME = {
  headerBg: "#ffffff",
  primaryButtonBg: TINYGPT_NODE.dark,
  activeTabBg: TINYGPT_NODE.dark,
  activeTabText: "#ffffff",
};

export const GPT_V3_TEMPLATES = [
  {
    id: "quick-answer",
    name: "Quick Answer",
    description: "Get a direct answer to a question",
    icon: "Zap",
    iconBg: "#10B981",
    systemPrompt: {
      type: "fx",
      blocks: [
        {
          type: "text",
          value: "You are a helpful assistant that provides clear, concise, and accurate answers. Be direct and avoid unnecessary explanations unless asked.",
        },
      ],
    },
    query: {
      type: "fx",
      blocks: [
        {
          type: "text",
          value: "Answer the following question:\n\n",
        },
      ],
    },
    outputFormat: "text",
    outputSchema: [
      { key: "answer", type: "string", description: "Direct answer to the question" },
    ],
  },
  {
    id: "structured-output",
    name: "Structured Output",
    description: "Get JSON-formatted response",
    icon: "Braces",
    iconBg: "#6366F1",
    systemPrompt: {
      type: "fx",
      blocks: [
        {
          type: "text",
          value: "You are a data extraction specialist. You analyze input and return structured, well-organized JSON data. Always ensure your output matches the requested schema exactly.",
        },
      ],
    },
    query: {
      type: "fx",
      blocks: [
        {
          type: "text",
          value: "Extract and structure the following information:\n\n",
        },
      ],
    },
    outputFormat: "json",
    outputSchema: [
      { key: "field1", type: "string", description: "First extracted field" },
      { key: "field2", type: "string", description: "Second extracted field" },
    ],
  },
  {
    id: "chain-of-thought",
    name: "Chain of Thought",
    description: "Step-by-step reasoning",
    icon: "GitBranch",
    iconBg: "#F59E0B",
    systemPrompt: {
      type: "fx",
      blocks: [
        {
          type: "text",
          value: "You are an analytical assistant that thinks through problems step by step. For each question, break down your reasoning into clear steps before providing a final answer.",
        },
      ],
    },
    query: {
      type: "fx",
      blocks: [
        {
          type: "text",
          value: "Think through this step by step:\n\n",
        },
      ],
    },
    outputFormat: "text",
    outputSchema: [
      { key: "reasoning", type: "string", description: "Step-by-step reasoning process" },
      { key: "conclusion", type: "string", description: "Final conclusion or answer" },
    ],
  },
  {
    id: "few-shot",
    name: "Few-Shot",
    description: "Learn from examples",
    icon: "Lightbulb",
    iconBg: "#EC4899",
    systemPrompt: {
      type: "fx",
      blocks: [
        {
          type: "text",
          value: "You are a pattern-matching assistant. Given examples of input-output pairs, you learn the pattern and apply it to new inputs. Follow the exact format shown in the examples.",
        },
      ],
    },
    query: {
      type: "fx",
      blocks: [
        {
          type: "text",
          value: "Here are some examples:\n\nExample 1:\nInput: [example input]\nOutput: [example output]\n\nNow apply the same pattern to:\n",
        },
      ],
    },
    outputFormat: "text",
    outputSchema: [
      { key: "output", type: "string", description: "Generated output following the pattern" },
    ],
  },
];

export const OUTPUT_FORMAT_OPTIONS = [
  { id: "text", label: "Text", description: "Plain text response" },
  { id: "json", label: "JSON", description: "Structured JSON data" },
];

export const getGPTV3TemplateById = (id) => {
  return GPT_V3_TEMPLATES.find((t) => t.id === id) || null;
};
