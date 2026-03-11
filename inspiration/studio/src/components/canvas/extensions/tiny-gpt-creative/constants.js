import { NODE_TEMPLATES } from "../../templates/nodeTemplates";
import { TINY_GPT_CREATIVE_TYPE } from "../constants/types";
import extensionIcons from "../../assets/extensions";

export { TINY_GPT_CREATIVE_TYPE };

export const TINYGPT_CREATIVE_V2_NODE = {
  cmsId: "tiny-gpt-creative-v2",
  _src: extensionIcons.tinyGptCreative,
  name: "Tiny GPT Creative",
  description: "Generate creative content",
  type: TINY_GPT_CREATIVE_TYPE,
  template: NODE_TEMPLATES.CIRCLE,
  background: "#F472B6",
  foreground: "#fff",
  dark: "#DB2777",
  light: "#F9A8D4",
  hasTestModule: true,
  canSkipTest: false,
  credits: 15,
  meta: {
    search_keys: ["Creative", "Story", "Poetry", "Marketing", "Content", "AI Writing"],
  },
};

export const TABS = {
  INITIALISE: "initialise",
  CONFIGURE: "configure",
  TEST: "test",
};

export const THEME = {
  headerBg: "#ffffff",
  primaryButtonBg: TINYGPT_CREATIVE_V2_NODE.dark,
  activeTabBg: TINYGPT_CREATIVE_V2_NODE.dark,
  activeTabText: "#ffffff",
};

export const STYLE_OPTIONS = [
  { id: "narrative", label: "Narrative", description: "Story-driven and descriptive" },
  { id: "poetic", label: "Poetic", description: "Rhythmic and expressive" },
  { id: "punchy", label: "Punchy", description: "Short, impactful phrases" },
  { id: "conversational", label: "Conversational", description: "Casual and relatable" },
  { id: "dramatic", label: "Dramatic", description: "Bold and attention-grabbing" },
];

export const LENGTH_OPTIONS = [
  { id: "micro", label: "Micro", description: "1-2 sentences" },
  { id: "short", label: "Short", description: "1 paragraph" },
  { id: "medium", label: "Medium", description: "2-3 paragraphs" },
  { id: "long", label: "Long", description: "4+ paragraphs" },
];

export const TONE_OPTIONS = [
  { id: "inspiring", label: "Inspiring", description: "Uplifting and motivational" },
  { id: "witty", label: "Witty", description: "Clever and humorous" },
  { id: "emotional", label: "Emotional", description: "Heart-touching and sincere" },
  { id: "professional", label: "Professional", description: "Polished and refined" },
  { id: "playful", label: "Playful", description: "Fun and lighthearted" },
];
