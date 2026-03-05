import { NODE_TEMPLATES } from "../../templates/nodeTemplates";
import { TINY_GPT_TYPE } from "../constants/types";
import extensionIcons from "../../assets/extensions";

export { TINY_GPT_TYPE };

export const TINYGPT_NODE = {
  cmsId: "tiny-gpt-v4",
  _src: "https://cdn-v1.tinycommand.com/1234567890/1770458055954/tiny%20gpt.svg",
  name: "TinyGPT",
  type: "GPT",
  template: NODE_TEMPLATES.CIRCLE,
  background: "#6366F1",
  foreground: "#fff",
  dark: "#4F46E5",
  light: "#6366F1",
  hasTestModule: true,
  canSkipTest: false,
  credits: 10,
  meta: {
    search_keys: ["AI", "GPT", "Assistant", "Chat", "Prompt", "Answer", "Generate", "Classify"],
  },
};

export const TINYGPT_TEMPLATES = [
  {
    id: "answer-questions",
    name: "Answer Questions",
    description: "Build Q&A bots and knowledge assistants",
    icon: "MessageSquare",
    iconBg: "#6366F1",
    defaults: {
      prompt: "Answer the following question accurately and concisely:\n\n{{input}}",
      systemPrompt: "You are a helpful assistant that answers questions clearly and accurately.",
      outputFormat: "text",
      outputSchema: [
        { id: "field-answer", key: "answer", type: "string", required: true },
      ],
    },
  },
  {
    id: "generate-content",
    name: "Generate Content",
    description: "Create articles, emails, and marketing copy",
    icon: "FileText",
    iconBg: "#8B5CF6",
    defaults: {
      prompt: "Generate content based on the following brief:\n\n{{input}}",
      systemPrompt: "You are a skilled content writer.",
      outputFormat: "text",
      outputSchema: [
        { id: "field-content", key: "content", type: "string", required: true },
      ],
    },
  },
  {
    id: "extract-data",
    name: "Extract Data",
    description: "Pull structured information from unstructured text",
    icon: "Database",
    iconBg: "#06B6D4",
    defaults: {
      prompt: "Extract the following information from this text:\n\n{{input}}",
      systemPrompt: "You are a data extraction specialist. Output structured data only.",
      outputFormat: "json",
      outputSchema: [
        { id: "field-data", key: "extracted_data", type: "object", required: true },
      ],
    },
  },
  {
    id: "classify-categorize",
    name: "Classify & Categorize",
    description: "Sort and label inputs into predefined categories",
    icon: "Tags",
    iconBg: "#F59E0B",
    defaults: {
      prompt: "Classify the following input into one of the categories:\n\n{{input}}",
      systemPrompt: "You are a classification expert.",
      outputFormat: "json",
      outputSchema: [
        { id: "field-category", key: "category", type: "string", required: true },
        { id: "field-confidence", key: "confidence", type: "number", required: false },
      ],
    },
  },
];

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

export const getTemplateById = (id) => 
  TINYGPT_TEMPLATES.find((t) => t.id === id);
