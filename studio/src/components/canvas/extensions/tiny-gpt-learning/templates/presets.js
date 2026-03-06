import { BookOpen, ListChecks, HelpCircle, BookText, GitCompare } from "lucide-react";

export const LEARNING_TEMPLATE_PRESETS = [
  {
    id: "eli5",
    name: "Explain Like I'm 5",
    description: "Simple explanations that anyone can understand using everyday language.",
    icon: BookOpen,
    iconBg: "#22C55E",
    defaults: {
      explanationStyle: "simple",
      audienceLevel: "beginner",
    },
    role: {
      type: "fx",
      blocks: [
        {
          type: "text",
          value: "You are an expert teacher who specializes in breaking down complex topics into simple, easy-to-understand explanations. Use everyday language, relatable analogies, and avoid jargon.",
        },
      ],
    },
    task: {
      type: "fx",
      blocks: [
        {
          type: "text",
          value: "Explain the following topic as if you're explaining it to a 5-year-old. Use simple words, fun comparisons, and keep it engaging:\n\n",
        },
      ],
    },
    outputSchema: [
      { key: "explanation", type: "string", description: "Simple explanation" },
      { key: "analogy", type: "string", description: "Relatable analogy" },
      { key: "key_takeaway", type: "string", description: "Main point to remember" },
    ],
  },
  {
    id: "tutorial",
    name: "Step-by-Step Tutorial",
    description: "Create structured tutorials with clear instructions and examples.",
    icon: ListChecks,
    iconBg: "#3B82F6",
    defaults: {
      explanationStyle: "step-by-step",
      audienceLevel: "beginner",
    },
    role: {
      type: "fx",
      blocks: [
        {
          type: "text",
          value: "You are a technical writer who creates clear, actionable tutorials. You break down processes into numbered steps, include helpful tips, and anticipate common mistakes.",
        },
      ],
    },
    task: {
      type: "fx",
      blocks: [
        {
          type: "text",
          value: "Create a step-by-step tutorial for the following topic. Include an introduction, numbered steps, helpful tips, and a conclusion:\n\n",
        },
      ],
    },
    outputSchema: [
      { key: "title", type: "string", description: "Tutorial title" },
      { key: "introduction", type: "string", description: "Brief intro and prerequisites" },
      { key: "steps", type: "string", description: "Numbered step-by-step instructions" },
      { key: "tips", type: "string", description: "Helpful tips and common pitfalls" },
    ],
  },
  {
    id: "quiz",
    name: "Quiz Questions",
    description: "Generate quiz questions to test understanding of a topic.",
    icon: HelpCircle,
    iconBg: "#8B5CF6",
    defaults: {
      explanationStyle: "interactive",
      audienceLevel: "intermediate",
    },
    role: {
      type: "fx",
      blocks: [
        {
          type: "text",
          value: "You are an educational content creator who designs effective quiz questions. You create questions that test comprehension at various difficulty levels and provide clear explanations for answers.",
        },
      ],
    },
    task: {
      type: "fx",
      blocks: [
        {
          type: "text",
          value: "Create quiz questions for the following topic. Include a mix of question types (multiple choice, true/false, short answer) and provide correct answers with explanations:\n\n",
        },
      ],
    },
    outputSchema: [
      { key: "questions", type: "string", description: "Quiz questions with options" },
      { key: "answers", type: "string", description: "Correct answers" },
      { key: "explanations", type: "string", description: "Explanation for each answer" },
    ],
  },
  {
    id: "glossary",
    name: "Glossary",
    description: "Define technical terms and concepts with clear explanations.",
    icon: BookText,
    iconBg: "#F59E0B",
    defaults: {
      explanationStyle: "detailed",
      audienceLevel: "beginner",
    },
    role: {
      type: "fx",
      blocks: [
        {
          type: "text",
          value: "You are a subject matter expert who creates clear, comprehensive definitions. You explain terms in a way that's accessible while maintaining technical accuracy.",
        },
      ],
    },
    task: {
      type: "fx",
      blocks: [
        {
          type: "text",
          value: "Create glossary definitions for the following terms or topic. Include clear definitions, usage examples, and related terms:\n\n",
        },
      ],
    },
    outputSchema: [
      { key: "terms", type: "string", description: "List of terms with definitions" },
      { key: "examples", type: "string", description: "Usage examples for each term" },
      { key: "related_terms", type: "string", description: "Related or similar terms" },
    ],
  },
  {
    id: "comparison",
    name: "Compare & Contrast",
    description: "Compare and contrast different concepts, tools, or approaches.",
    icon: GitCompare,
    iconBg: "#EC4899",
    defaults: {
      explanationStyle: "detailed",
      audienceLevel: "intermediate",
    },
    role: {
      type: "fx",
      blocks: [
        {
          type: "text",
          value: "You are an analyst who excels at comparing and contrasting concepts. You provide objective, balanced comparisons that highlight key differences and similarities.",
        },
      ],
    },
    task: {
      type: "fx",
      blocks: [
        {
          type: "text",
          value: "Compare and contrast the following concepts or items. Highlight key similarities, differences, pros and cons, and provide recommendations:\n\n",
        },
      ],
    },
    outputSchema: [
      { key: "overview", type: "string", description: "Brief overview of items being compared" },
      { key: "similarities", type: "string", description: "Key similarities" },
      { key: "differences", type: "string", description: "Key differences" },
      { key: "recommendation", type: "string", description: "When to use each" },
    ],
  },
];

export const getLearningTemplateById = (id) => {
  return LEARNING_TEMPLATE_PRESETS.find((t) => t.id === id) || null;
};
