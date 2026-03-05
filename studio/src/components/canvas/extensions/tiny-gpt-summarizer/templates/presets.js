import { Zap, List, Briefcase, GraduationCap } from "lucide-react";

export const SUMMARIZER_TEMPLATE_PRESETS = [
  {
    id: "tldr",
    name: "TL;DR Summary",
    description: "Create a one-sentence summary capturing the essence of the content.",
    icon: Zap,
    iconBg: "#EF4444",
    defaults: {
      summaryStyle: "tldr",
      length: "brief",
    },
    role: {
      type: "fx",
      blocks: [
        {
          type: "text",
          value: "You are an expert at distilling complex information into single, impactful sentences. Create TL;DR summaries that capture the essential message.",
        },
      ],
    },
    task: {
      type: "fx",
      blocks: [
        {
          type: "text",
          value: "Create a single-sentence TL;DR summary of the following content. Capture the most important point:\n\n",
        },
      ],
    },
    outputSchema: [
      { key: "summary", type: "string", description: "One-sentence TL;DR summary" },
    ],
  },
  {
    id: "key-points",
    name: "Key Points",
    description: "Extract the main points as clear bullet point highlights.",
    icon: List,
    iconBg: "#10B981",
    defaults: {
      summaryStyle: "key-points",
      length: "standard",
    },
    role: {
      type: "fx",
      blocks: [
        {
          type: "text",
          value: "You are skilled at extracting and organizing key information. Create clear, actionable bullet points that highlight the most important takeaways.",
        },
      ],
    },
    task: {
      type: "fx",
      blocks: [
        {
          type: "text",
          value: "Extract the key points from the following content as clear bullet points. Focus on actionable insights:\n\n",
        },
      ],
    },
    outputSchema: [
      { key: "key_points", type: "string", description: "Bullet-pointed key takeaways" },
      { key: "main_theme", type: "string", description: "Overall theme or topic" },
    ],
  },
  {
    id: "executive",
    name: "Executive Summary",
    description: "Create a business-style executive summary for stakeholders.",
    icon: Briefcase,
    iconBg: "#6366F1",
    defaults: {
      summaryStyle: "executive",
      length: "detailed",
    },
    role: {
      type: "fx",
      blocks: [
        {
          type: "text",
          value: "You are a business writing expert who creates executive summaries for C-level stakeholders. Write concise, professional summaries that highlight key findings, implications, and recommendations.",
        },
      ],
    },
    task: {
      type: "fx",
      blocks: [
        {
          type: "text",
          value: "Create an executive summary of the following content. Include key findings, implications, and any recommendations:\n\n",
        },
      ],
    },
    outputSchema: [
      { key: "summary", type: "string", description: "Executive summary" },
      { key: "key_findings", type: "string", description: "Main findings" },
      { key: "recommendations", type: "string", description: "Action items or recommendations" },
    ],
  },
  {
    id: "abstract",
    name: "Academic Abstract",
    description: "Generate an academic-style abstract with structured sections.",
    icon: GraduationCap,
    iconBg: "#8B5CF6",
    defaults: {
      summaryStyle: "abstract",
      length: "detailed",
    },
    role: {
      type: "fx",
      blocks: [
        {
          type: "text",
          value: "You are an academic writing expert who creates structured abstracts following scholarly conventions. Write abstracts that include background, methods, results, and conclusions where applicable.",
        },
      ],
    },
    task: {
      type: "fx",
      blocks: [
        {
          type: "text",
          value: "Create an academic-style abstract of the following content. Include background, key points, and conclusions:\n\n",
        },
      ],
    },
    outputSchema: [
      { key: "abstract", type: "string", description: "Structured abstract" },
      { key: "keywords", type: "string", description: "Relevant keywords (comma-separated)" },
    ],
  },
];

export const getSummarizerTemplateById = (id) => {
  return SUMMARIZER_TEMPLATE_PRESETS.find((t) => t.id === id) || null;
};
