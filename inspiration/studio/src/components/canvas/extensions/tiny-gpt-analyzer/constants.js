import { NODE_TEMPLATES } from "../../templates/nodeTemplates";
import { TINY_GPT_ANALYZER_TYPE } from "../constants/types";
import extensionIcons from "../../assets/extensions";

export { TINY_GPT_ANALYZER_TYPE };

export const TINYGPT_ANALYZER_V2_NODE = {
  cmsId: "tiny-gpt-analyzer-v2",
  _src: extensionIcons.tinyGptAnalyzer,
  name: "Tiny GPT Analyzer",
  description: "AI-powered content analysis",
  type: TINY_GPT_ANALYZER_TYPE,
  template: NODE_TEMPLATES.CIRCLE,
  background: "linear-gradient(180.4deg, #7C3AED 27.7%, #A78BFA 100%)",
  foreground: "#fff",
  dark: "#7C3AED",
  light: "#A78BFA",
  hasTestModule: true,
  canSkipTest: false,
  credits: 15,
  meta: {
    search_keys: ["Analyzer", "Sentiment", "Classification", "Entity", "Intent"],
  },
};

export const TABS = {
  INITIALISE: "initialise",
  CONFIGURE: "configure",
  TEST: "test",
};

export const THEME = {
  headerBg: "#ffffff",
  primaryButtonBg: TINYGPT_ANALYZER_V2_NODE.dark,
  activeTabBg: TINYGPT_ANALYZER_V2_NODE.dark,
  activeTabText: "#ffffff",
};

export const ANALYSIS_TYPE_OPTIONS = [
  { id: "sentiment", label: "Sentiment", description: "Positive, negative, or neutral" },
  { id: "classification", label: "Classification", description: "Categorize into labels" },
  { id: "extraction", label: "Extraction", description: "Extract entities from text" },
  { id: "intent", label: "Intent", description: "Detect user intent" },
];

export const OUTPUT_FORMAT_OPTIONS = [
  { id: "structured", label: "Structured", description: "JSON with detailed fields" },
  { id: "simple", label: "Simple", description: "Single value result" },
  { id: "detailed", label: "Detailed", description: "With confidence scores" },
];
