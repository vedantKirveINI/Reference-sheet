import extensionIcons from "../../assets/extensions";

export const GPT_ANALYZER_NODE = {
  cmsId: "gpt-analyzer",
  _src: extensionIcons.tinyGptAnalyzer,
  name: "GPT Analyzer",
  description: "Analyze data and extract insights",
  type: "GPT_ANALYZER",
  background: "#7C3AED",
  dark: "#6D28D9",
  light: "#7C3AED",
  hasTestModule: true,
  canSkipTest: false,
  credits: 10,
  meta: {
    search_keys: ["AI", "GPT", "Analyzer", "Sentiment", "Pattern", "Data", "Insights", "Document"],
  },
};

export const ANALYZER_TEMPLATES = [
  {
    id: "sentiment-analysis",
    name: "Sentiment Analysis",
    description: "Analyze sentiment from reviews, feedback, or social posts",
    icon: "Heart",
    iconBg: "#EC4899",
    defaults: {
      prompt: "Analyze the sentiment of the following text and provide a score from -1 (negative) to 1 (positive):\n\n{{input}}",
      systemPrompt: "You are a sentiment analysis expert. Analyze text and provide sentiment scores with explanations.",
      outputSchema: [
        { id: "field-score", key: "sentiment_score", type: "number", required: true },
        { id: "field-label", key: "sentiment_label", type: "string", required: true },
        { id: "field-explanation", key: "explanation", type: "string", required: false },
      ],
    },
  },
  {
    id: "data-pattern",
    name: "Data Pattern Analysis",
    description: "Find patterns and trends in spreadsheet or structured data",
    icon: "TrendingUp",
    iconBg: "#10B981",
    defaults: {
      prompt: "Analyze the following data and identify key patterns, trends, and anomalies:\n\n{{input}}",
      systemPrompt: "You are a data analyst. Identify patterns, correlations, and insights in data.",
      outputSchema: [
        { id: "field-patterns", key: "patterns", type: "array", required: true },
        { id: "field-trends", key: "trends", type: "array", required: false },
        { id: "field-anomalies", key: "anomalies", type: "array", required: false },
      ],
    },
  },
  {
    id: "document-analysis",
    name: "Document Analysis",
    description: "Extract key information from contracts, reports, or documents",
    icon: "FileSearch",
    iconBg: "#3B82F6",
    defaults: {
      prompt: "Analyze this document and extract the key information:\n\n{{input}}",
      systemPrompt: "You are a document analysis expert. Extract key points, dates, entities, and summaries.",
      outputSchema: [
        { id: "field-summary", key: "summary", type: "string", required: true },
        { id: "field-key-points", key: "key_points", type: "array", required: true },
        { id: "field-entities", key: "entities", type: "object", required: false },
      ],
    },
  },
  {
    id: "survey-response",
    name: "Survey Response Analysis",
    description: "Analyze and summarize survey or form responses",
    icon: "ClipboardList",
    iconBg: "#F59E0B",
    defaults: {
      prompt: "Analyze these survey responses and provide insights:\n\n{{input}}",
      systemPrompt: "You are a survey analyst. Summarize responses, identify trends, and provide actionable insights.",
      outputSchema: [
        { id: "field-summary", key: "summary", type: "string", required: true },
        { id: "field-insights", key: "insights", type: "array", required: true },
        { id: "field-recommendations", key: "recommendations", type: "array", required: false },
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
  primaryButtonBg: GPT_ANALYZER_NODE.dark,
  activeTabBg: GPT_ANALYZER_NODE.dark,
  activeTabText: "#ffffff",
};

export const getTemplateById = (id) =>
  ANALYZER_TEMPLATES.find((t) => t.id === id);
