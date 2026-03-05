import { NODE_TEMPLATES } from "../../templates/nodeTemplates";
import { TINY_GPT_SUMMARIZER_TYPE } from "../constants/types";
import extensionIcons from "../../assets/extensions";

export { TINY_GPT_SUMMARIZER_TYPE };

export const TINYGPT_SUMMARIZER_V2_NODE = {
  cmsId: "tiny-gpt-summarizer-v2",
  _src: extensionIcons.tinyGptSummarizer,
  name: "Tiny GPT Summarizer",
  description: "AI-powered content summarization",
  type: TINY_GPT_SUMMARIZER_TYPE,
  template: NODE_TEMPLATES.CIRCLE,
  background: "linear-gradient(180.4deg, #06B6D4 27.7%, #67E8F9 100%)",
  foreground: "#fff",
  dark: "#06B6D4",
  light: "#67E8F9",
  hasTestModule: true,
  canSkipTest: false,
  credits: 15,
  meta: {
    search_keys: ["Summarizer", "Summary", "TLDR", "Abstract", "Digest"],
  },
};

export const TABS = {
  INITIALISE: "initialise",
  CONFIGURE: "configure",
  TEST: "test",
};

export const THEME = {
  headerBg: "#ffffff",
  primaryButtonBg: TINYGPT_SUMMARIZER_V2_NODE.dark,
  activeTabBg: TINYGPT_SUMMARIZER_V2_NODE.dark,
  activeTabText: "#ffffff",
};

export const SUMMARY_STYLE_OPTIONS = [
  { id: "tldr", label: "TL;DR", description: "One-sentence summary" },
  { id: "key-points", label: "Key Points", description: "Bullet point highlights" },
  { id: "executive", label: "Executive", description: "Business-style summary" },
  { id: "abstract", label: "Abstract", description: "Academic format" },
];

export const LENGTH_OPTIONS = [
  { id: "brief", label: "Brief", description: "1-2 sentences" },
  { id: "standard", label: "Standard", description: "3-5 sentences" },
  { id: "detailed", label: "Detailed", description: "1-2 paragraphs" },
  { id: "custom", label: "Custom", description: "Specify your own" },
];
