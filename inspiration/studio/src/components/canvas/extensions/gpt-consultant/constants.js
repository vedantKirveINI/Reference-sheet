import extensionIcons from "../../assets/extensions";

export const GPT_CONSULTANT_NODE = {
  cmsId: "gpt-consultant",
  _src: extensionIcons.tinyGptConsultant,
  name: "GPT Consultant",
  description: "Get expert advice and recommendations",
  type: "GPT_CONSULTANT",
  background: "#F97316",
  dark: "#EA580C",
  light: "#F97316",
  hasTestModule: true,
  canSkipTest: false,
  credits: 10,
  meta: {
    search_keys: ["AI", "GPT", "Consultant", "Advice", "Strategy", "Review", "HR", "Process"],
  },
};

export const CONSULTANT_TEMPLATES = [
  {
    id: "business-strategy",
    name: "Business Strategy",
    description: "Get strategic business advice and recommendations",
    icon: "Briefcase",
    iconBg: "#3B82F6",
    defaults: {
      prompt: "Provide strategic business advice for:\n\n{{input}}",
      systemPrompt: "You are a senior business consultant. Provide strategic, actionable recommendations.",
      outputSchema: [
        { id: "field-recommendations", key: "recommendations", type: "array", required: true },
        { id: "field-rationale", key: "rationale", type: "string", required: true },
      ],
    },
  },
  {
    id: "technical-review",
    name: "Technical Review",
    description: "Get expert technical feedback and code reviews",
    icon: "Code",
    iconBg: "#10B981",
    defaults: {
      prompt: "Review this technical implementation and provide feedback:\n\n{{input}}",
      systemPrompt: "You are a senior software architect. Provide thorough technical reviews with specific recommendations.",
      outputSchema: [
        { id: "field-feedback", key: "feedback", type: "string", required: true },
        { id: "field-improvements", key: "improvements", type: "array", required: true },
      ],
    },
  },
  {
    id: "hr-recommendations",
    name: "HR Recommendations",
    description: "Get HR and people management advice",
    icon: "Users",
    iconBg: "#8B5CF6",
    defaults: {
      prompt: "Provide HR recommendations for:\n\n{{input}}",
      systemPrompt: "You are an HR consultant. Provide professional, legally-sound HR recommendations.",
      outputSchema: [
        { id: "field-recommendations", key: "recommendations", type: "array", required: true },
        { id: "field-considerations", key: "considerations", type: "string", required: false },
      ],
    },
  },
  {
    id: "process-improvement",
    name: "Process Improvement",
    description: "Get advice on optimizing workflows and processes",
    icon: "Settings",
    iconBg: "#F59E0B",
    defaults: {
      prompt: "Suggest process improvements for:\n\n{{input}}",
      systemPrompt: "You are a process optimization expert. Identify inefficiencies and recommend improvements.",
      outputSchema: [
        { id: "field-inefficiencies", key: "inefficiencies", type: "array", required: true },
        { id: "field-improvements", key: "improvements", type: "array", required: true },
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
  primaryButtonBg: GPT_CONSULTANT_NODE.dark,
  activeTabBg: GPT_CONSULTANT_NODE.dark,
  activeTabText: "#ffffff",
};

export const getTemplateById = (id) =>
  CONSULTANT_TEMPLATES.find((t) => t.id === id);
