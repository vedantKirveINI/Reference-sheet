import extensionIcons from "../../assets/extensions";

export const GPT_SUMMARIZER_NODE = {
  cmsId: "gpt-summarizer",
  _src: extensionIcons.tinyGptSummarizer,
  name: "GPT Summarizer",
  description: "Condense long content into key points",
  type: "GPT_SUMMARIZER",
  background: "#06B6D4",
  dark: "#0891B2",
  light: "#06B6D4",
  hasTestModule: true,
  canSkipTest: false,
  credits: 10,
  meta: {
    search_keys: ["AI", "GPT", "Summarizer", "Summary", "Condense", "Brief", "Notes", "Digest"],
  },
};

export const SUMMARIZER_TEMPLATES = [
  {
    id: "article-summary",
    name: "Article Summary",
    description: "Summarize blog posts, news articles, or web pages",
    icon: "Newspaper",
    iconBg: "#6366F1",
    defaults: {
      prompt: "Summarize this article in 3-5 bullet points:\n\n{{input}}",
      systemPrompt: "You are a skilled editor. Create concise, informative summaries that capture key points.",
      outputSchema: [
        { id: "field-summary", key: "summary", type: "string", required: true },
        { id: "field-bullet-points", key: "bullet_points", type: "array", required: true },
        { id: "field-key-takeaway", key: "key_takeaway", type: "string", required: false },
      ],
    },
  },
  {
    id: "meeting-notes",
    name: "Meeting Notes",
    description: "Turn meeting transcripts into actionable summaries",
    icon: "Users",
    iconBg: "#8B5CF6",
    defaults: {
      prompt: "Summarize this meeting transcript with key decisions and action items:\n\n{{input}}",
      systemPrompt: "You are a meeting facilitator. Extract decisions, action items, and key discussion points.",
      outputSchema: [
        { id: "field-summary", key: "summary", type: "string", required: true },
        { id: "field-decisions", key: "decisions", type: "array", required: true },
        { id: "field-action-items", key: "action_items", type: "array", required: true },
      ],
    },
  },
  {
    id: "email-thread",
    name: "Email Thread Summary",
    description: "Condense long email chains into key points",
    icon: "Mail",
    iconBg: "#EC4899",
    defaults: {
      prompt: "Summarize this email thread with the main points and any required actions:\n\n{{input}}",
      systemPrompt: "You are an executive assistant. Summarize email threads clearly and identify action items.",
      outputSchema: [
        { id: "field-summary", key: "summary", type: "string", required: true },
        { id: "field-main-points", key: "main_points", type: "array", required: true },
        { id: "field-actions", key: "required_actions", type: "array", required: false },
      ],
    },
  },
  {
    id: "document-summary",
    name: "Document Summary",
    description: "Create executive summaries from long documents",
    icon: "FileText",
    iconBg: "#10B981",
    defaults: {
      prompt: "Create an executive summary of this document:\n\n{{input}}",
      systemPrompt: "You are a professional summarizer. Create clear, structured summaries for executives.",
      outputSchema: [
        { id: "field-executive-summary", key: "executive_summary", type: "string", required: true },
        { id: "field-key-points", key: "key_points", type: "array", required: true },
        { id: "field-conclusion", key: "conclusion", type: "string", required: false },
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
  primaryButtonBg: GPT_SUMMARIZER_NODE.dark,
  activeTabBg: GPT_SUMMARIZER_NODE.dark,
  activeTabText: "#ffffff",
};

export const getTemplateById = (id) =>
  SUMMARIZER_TEMPLATES.find((t) => t.id === id);
