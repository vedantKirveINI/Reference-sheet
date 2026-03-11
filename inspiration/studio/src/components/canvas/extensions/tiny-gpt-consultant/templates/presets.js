import { TrendingUp, Code, BarChart3, Lightbulb, TableProperties } from "lucide-react";

export const CONSULTANT_TEMPLATE_PRESETS = [
  {
    id: "business-advice",
    name: "Business Advice",
    description: "Strategic business recommendations and guidance for growth.",
    icon: TrendingUp,
    iconBg: "#F97316",
    defaults: {
      consultationType: "strategic",
      outputFormat: "executive-summary",
    },
    role: {
      type: "fx",
      blocks: [
        {
          type: "text",
          value: "You are a seasoned business consultant with expertise in strategy, operations, and growth. You provide clear, actionable recommendations backed by industry best practices.",
        },
      ],
    },
    task: {
      type: "fx",
      blocks: [
        {
          type: "text",
          value: "Provide strategic business advice for the following situation. Include analysis, recommendations, and potential risks to consider:\n\n",
        },
      ],
    },
    outputSchema: [
      { key: "situation_analysis", type: "string", description: "Analysis of the current situation" },
      { key: "recommendations", type: "string", description: "Strategic recommendations" },
      { key: "risks", type: "string", description: "Potential risks and mitigation strategies" },
      { key: "next_steps", type: "string", description: "Immediate action items" },
    ],
  },
  {
    id: "technical-review",
    name: "Technical Review",
    description: "Code, architecture, and technical implementation reviews.",
    icon: Code,
    iconBg: "#3B82F6",
    defaults: {
      consultationType: "diagnostic",
      outputFormat: "detailed-report",
    },
    role: {
      type: "fx",
      blocks: [
        {
          type: "text",
          value: "You are a senior software architect and technical reviewer. You evaluate code quality, architecture decisions, and technical implementations with a focus on maintainability, scalability, and best practices.",
        },
      ],
    },
    task: {
      type: "fx",
      blocks: [
        {
          type: "text",
          value: "Review the following code, architecture, or technical implementation. Identify issues, suggest improvements, and provide specific recommendations:\n\n",
        },
      ],
    },
    outputSchema: [
      { key: "overview", type: "string", description: "Technical overview assessment" },
      { key: "issues", type: "string", description: "Identified issues and concerns" },
      { key: "improvements", type: "string", description: "Recommended improvements" },
      { key: "best_practices", type: "string", description: "Best practices to follow" },
    ],
  },
  {
    id: "market-analysis",
    name: "Market Analysis",
    description: "Market research and competitive analysis insights.",
    icon: BarChart3,
    iconBg: "#8B5CF6",
    defaults: {
      consultationType: "analytical",
      outputFormat: "detailed-report",
    },
    role: {
      type: "fx",
      blocks: [
        {
          type: "text",
          value: "You are a market research analyst with expertise in competitive analysis, market trends, and strategic positioning. You provide data-driven insights and actionable market intelligence.",
        },
      ],
    },
    task: {
      type: "fx",
      blocks: [
        {
          type: "text",
          value: "Analyze the market and competitive landscape for the following. Include market trends, competitor analysis, and strategic opportunities:\n\n",
        },
      ],
    },
    outputSchema: [
      { key: "market_overview", type: "string", description: "Market size and trends" },
      { key: "competitive_landscape", type: "string", description: "Key competitors and positioning" },
      { key: "opportunities", type: "string", description: "Market opportunities" },
      { key: "threats", type: "string", description: "Market threats and challenges" },
    ],
  },
  {
    id: "problem-solving",
    name: "Problem Solving",
    description: "Structured problem analysis and solution development.",
    icon: Lightbulb,
    iconBg: "#22C55E",
    defaults: {
      consultationType: "diagnostic",
      outputFormat: "action-items",
    },
    role: {
      type: "fx",
      blocks: [
        {
          type: "text",
          value: "You are a problem-solving consultant who uses structured frameworks to analyze complex problems. You identify root causes, evaluate options, and recommend practical solutions.",
        },
      ],
    },
    task: {
      type: "fx",
      blocks: [
        {
          type: "text",
          value: "Analyze the following problem using a structured approach. Identify the root cause, evaluate potential solutions, and recommend the best course of action:\n\n",
        },
      ],
    },
    outputSchema: [
      { key: "problem_statement", type: "string", description: "Clear problem definition" },
      { key: "root_cause", type: "string", description: "Root cause analysis" },
      { key: "solutions", type: "string", description: "Potential solutions with pros/cons" },
      { key: "recommendation", type: "string", description: "Recommended solution and rationale" },
    ],
  },
  {
    id: "decision-matrix",
    name: "Decision Matrix",
    description: "Structured framework for evaluating options and making decisions.",
    icon: TableProperties,
    iconBg: "#EC4899",
    defaults: {
      consultationType: "prescriptive",
      outputFormat: "framework",
    },
    role: {
      type: "fx",
      blocks: [
        {
          type: "text",
          value: "You are a decision-making consultant who helps evaluate options systematically. You use frameworks like weighted scoring, SWOT analysis, and decision matrices to provide clear recommendations.",
        },
      ],
    },
    task: {
      type: "fx",
      blocks: [
        {
          type: "text",
          value: "Create a decision-making framework for the following situation. Define criteria, evaluate options, and provide a clear recommendation:\n\n",
        },
      ],
    },
    outputSchema: [
      { key: "decision_context", type: "string", description: "Context and decision to be made" },
      { key: "criteria", type: "string", description: "Evaluation criteria with weights" },
      { key: "options_analysis", type: "string", description: "Analysis of each option" },
      { key: "recommendation", type: "string", description: "Recommended decision with justification" },
    ],
  },
];

export const getConsultantTemplateById = (id) => {
  return CONSULTANT_TEMPLATE_PRESETS.find((t) => t.id === id) || null;
};
