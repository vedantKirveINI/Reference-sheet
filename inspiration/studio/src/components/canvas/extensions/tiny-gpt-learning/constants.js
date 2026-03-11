import { NODE_TEMPLATES } from "../../templates/nodeTemplates";
import { TINY_GPT_LEARNING_TYPE } from "../constants/types";
import extensionIcons from "../../assets/extensions";

export { TINY_GPT_LEARNING_TYPE };

export const TINYGPT_LEARNING_V2_NODE = {
  cmsId: "tiny-gpt-learning-v2",
  _src: extensionIcons.tinyGptLearning,
  name: "Tiny GPT Learning",
  description: "Create educational content and explanations",
  type: TINY_GPT_LEARNING_TYPE,
  template: NODE_TEMPLATES.CIRCLE,
  background: "#22C55E",
  foreground: "#fff",
  dark: "#22C55E",
  light: "#4ADE80",
  hasTestModule: true,
  canSkipTest: false,
  credits: 15,
  meta: {
    search_keys: ["Learning", "Education", "Tutorial", "Quiz", "Explain"],
  },
};

export const TABS = {
  INITIALISE: "initialise",
  CONFIGURE: "configure",
  TEST: "test",
};

export const THEME = {
  headerBg: "#ffffff",
  primaryButtonBg: TINYGPT_LEARNING_V2_NODE.dark,
  activeTabBg: TINYGPT_LEARNING_V2_NODE.dark,
  activeTabText: "#ffffff",
};

export const EXPLANATION_STYLE_OPTIONS = [
  { id: "simple", label: "Simple", description: "Easy to understand explanations" },
  { id: "detailed", label: "Detailed", description: "Comprehensive with examples" },
  { id: "visual", label: "Visual", description: "Use analogies and diagrams" },
  { id: "step-by-step", label: "Step-by-Step", description: "Break down into clear steps" },
  { id: "interactive", label: "Interactive", description: "Include practice questions" },
];

export const AUDIENCE_LEVEL_OPTIONS = [
  { id: "beginner", label: "Beginner", description: "No prior knowledge required" },
  { id: "intermediate", label: "Intermediate", description: "Some background expected" },
  { id: "expert", label: "Expert", description: "Advanced technical audience" },
];
