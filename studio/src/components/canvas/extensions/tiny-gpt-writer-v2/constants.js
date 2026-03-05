import { NODE_TEMPLATES } from "../../templates/nodeTemplates";
import { TINY_GPT_WRITER_TYPE } from "../constants/types";

export { TINY_GPT_WRITER_TYPE };

export const TINYGPT_WRITER_V2_NODE = {
  cmsId: "tiny-gpt-writer-v2",
  _src: "https://cdn-v1.tinycommand.com/1234567890/1741763289265/TinyGPT.svg",
  name: "Tiny GPT Writer",
  description: "AI-powered content generation",
  type: TINY_GPT_WRITER_TYPE,
  template: NODE_TEMPLATES.CIRCLE,
  background: "linear-gradient(180.4deg, #6200EE 27.7%, #A676EA 100%)",
  foreground: "#fff",
  dark: "#6200EE",
  light: "#A676EA",
  hasTestModule: true,
  canSkipTest: false,
  credits: 15,
  meta: {
    search_keys: ["Writer", "Content", "Blog", "Email", "AI Writing"],
  },
};

export const TONE_OPTIONS = [
  { id: "professional", label: "Professional", description: "Formal and business-appropriate" },
  { id: "conversational", label: "Conversational", description: "Friendly and approachable" },
  { id: "persuasive", label: "Persuasive", description: "Compelling and action-oriented" },
  { id: "informative", label: "Informative", description: "Educational and fact-focused" },
  { id: "creative", label: "Creative", description: "Expressive and imaginative" },
];

export const LENGTH_OPTIONS = [
  { id: "short", label: "Short", description: "~100-200 words" },
  { id: "medium", label: "Medium", description: "~300-500 words" },
  { id: "long", label: "Long", description: "~800-1200 words" },
  { id: "custom", label: "Custom", description: "Specify your own length" },
];
