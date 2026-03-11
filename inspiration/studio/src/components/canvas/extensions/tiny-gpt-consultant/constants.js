import { NODE_TEMPLATES } from "../../templates/nodeTemplates";
import { TINY_GPT_CONSULTANT_TYPE } from "../constants/types";
import extensionIcons from "../../assets/extensions";

export { TINY_GPT_CONSULTANT_TYPE };

export const TINYGPT_CONSULTANT_V2_NODE = {
  cmsId: "tiny-gpt-consultant-v2",
  _src: extensionIcons.tinyGptConsultant,
  name: "Tiny GPT Consultant",
  description: "Provide expert advice and recommendations",
  type: TINY_GPT_CONSULTANT_TYPE,
  template: NODE_TEMPLATES.CIRCLE,
  background: "#F97316",
  foreground: "#fff",
  dark: "#F97316",
  light: "#FB923C",
  hasTestModule: true,
  canSkipTest: false,
  credits: 15,
  meta: {
    search_keys: ["Consultant", "Advice", "Expert", "Strategy", "Analysis"],
  },
};

export const TABS = {
  INITIALISE: "initialise",
  CONFIGURE: "configure",
  TEST: "test",
};

export const THEME = {
  headerBg: "#ffffff",
  primaryButtonBg: TINYGPT_CONSULTANT_V2_NODE.dark,
  activeTabBg: TINYGPT_CONSULTANT_V2_NODE.dark,
  activeTabText: "#ffffff",
};

export const CONSULTATION_TYPE_OPTIONS = [
  { id: "strategic", label: "Strategic", description: "High-level strategic advice" },
  { id: "tactical", label: "Tactical", description: "Specific actionable recommendations" },
  { id: "analytical", label: "Analytical", description: "Data-driven analysis" },
  { id: "diagnostic", label: "Diagnostic", description: "Identify problems and root causes" },
  { id: "prescriptive", label: "Prescriptive", description: "Specific solutions and steps" },
];

export const OUTPUT_FORMAT_OPTIONS = [
  { id: "executive-summary", label: "Executive Summary", description: "Concise overview for leaders" },
  { id: "detailed-report", label: "Detailed Report", description: "Comprehensive analysis" },
  { id: "action-items", label: "Action Items", description: "List of specific next steps" },
  { id: "framework", label: "Framework", description: "Structured decision-making model" },
];
