import { ThumbsUp, Tags, Search, Target } from "lucide-react";

export const ANALYZER_TEMPLATE_PRESETS = [
  {
    id: "sentiment",
    name: "Sentiment Analysis",
    description: "Analyze sentiment (positive/negative/neutral) with confidence scores.",
    icon: ThumbsUp,
    iconBg: "#10B981",
    defaults: {
      analysisType: "sentiment",
      outputFormat: "detailed",
    },
    role: {
      type: "fx",
      blocks: [
        {
          type: "text",
          value: "You are a sentiment analysis expert. Analyze the emotional tone and sentiment of text with high accuracy, providing confidence scores for your assessments.",
        },
      ],
    },
    task: {
      type: "fx",
      blocks: [
        {
          type: "text",
          value: "Analyze the sentiment of the following text. Determine if it is positive, negative, or neutral, and provide a confidence score:\n\n",
        },
      ],
    },
    outputSchema: [
      { key: "sentiment", type: "string", description: "Overall sentiment (positive/negative/neutral)" },
      { key: "confidence", type: "number", description: "Confidence score (0-1)" },
      { key: "explanation", type: "string", description: "Brief explanation of the analysis" },
    ],
  },
  {
    id: "classification",
    name: "Content Classification",
    description: "Categorize content into predefined labels or topics.",
    icon: Tags,
    iconBg: "#8B5CF6",
    defaults: {
      analysisType: "classification",
      outputFormat: "structured",
    },
    role: {
      type: "fx",
      blocks: [
        {
          type: "text",
          value: "You are a content classification specialist. Accurately categorize text into appropriate labels, topics, or categories based on the content's subject matter and context.",
        },
      ],
    },
    task: {
      type: "fx",
      blocks: [
        {
          type: "text",
          value: "Classify the following content into appropriate categories. Identify the primary category and any secondary categories:\n\n",
        },
      ],
    },
    outputSchema: [
      { key: "primary_category", type: "string", description: "Main category" },
      { key: "secondary_categories", type: "string", description: "Additional categories (comma-separated)" },
      { key: "confidence", type: "number", description: "Confidence score (0-1)" },
    ],
  },
  {
    id: "extraction",
    name: "Entity Extraction",
    description: "Extract entities like names, dates, amounts, and locations.",
    icon: Search,
    iconBg: "#F59E0B",
    defaults: {
      analysisType: "extraction",
      outputFormat: "structured",
    },
    role: {
      type: "fx",
      blocks: [
        {
          type: "text",
          value: "You are an expert in named entity recognition and information extraction. Identify and extract key entities from text including people, organizations, dates, monetary amounts, locations, and other relevant information.",
        },
      ],
    },
    task: {
      type: "fx",
      blocks: [
        {
          type: "text",
          value: "Extract all relevant entities from the following text. Identify names, dates, amounts, locations, and organizations:\n\n",
        },
      ],
    },
    outputSchema: [
      { key: "people", type: "string", description: "Names of people (comma-separated)" },
      { key: "organizations", type: "string", description: "Organization names (comma-separated)" },
      { key: "dates", type: "string", description: "Dates mentioned (comma-separated)" },
      { key: "amounts", type: "string", description: "Monetary or numeric amounts" },
      { key: "locations", type: "string", description: "Places and locations" },
    ],
  },
  {
    id: "intent",
    name: "Intent Detection",
    description: "Detect user intent from text for chatbots and support.",
    icon: Target,
    iconBg: "#EF4444",
    defaults: {
      analysisType: "intent",
      outputFormat: "detailed",
    },
    role: {
      type: "fx",
      blocks: [
        {
          type: "text",
          value: "You are an intent classification expert for conversational AI. Accurately identify the user's intent, desired action, and any relevant parameters from their message.",
        },
      ],
    },
    task: {
      type: "fx",
      blocks: [
        {
          type: "text",
          value: "Analyze the following user message and detect their intent. Identify what action they want to take and any relevant parameters:\n\n",
        },
      ],
    },
    outputSchema: [
      { key: "intent", type: "string", description: "Primary user intent" },
      { key: "action", type: "string", description: "Desired action" },
      { key: "parameters", type: "string", description: "Extracted parameters (JSON format)" },
      { key: "confidence", type: "number", description: "Confidence score (0-1)" },
    ],
  },
];

export const getAnalyzerTemplateById = (id) => {
  return ANALYZER_TEMPLATE_PRESETS.find((t) => t.id === id) || null;
};
