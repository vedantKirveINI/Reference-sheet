import extensionIcons from "../../assets/extensions";

export const GPT_LEARNING_NODE = {
  cmsId: "gpt-learning",
  _src: extensionIcons.tinyGptLearning,
  name: "GPT Learning",
  description: "Create educational content and materials",
  type: "GPT_LEARNING",
  background: "#22C55E",
  dark: "#16A34A",
  light: "#22C55E",
  hasTestModule: true,
  canSkipTest: false,
  credits: 10,
  meta: {
    search_keys: ["AI", "GPT", "Learning", "Education", "Quiz", "Study", "Lesson", "Teaching"],
  },
};

export const LEARNING_TEMPLATES = [
  {
    id: "create-quiz",
    name: "Create Quiz",
    description: "Generate quizzes and test questions from content",
    icon: "HelpCircle",
    iconBg: "#6366F1",
    defaults: {
      prompt: "Create a quiz with 5 questions based on:\n\n{{input}}",
      systemPrompt: "You are an educational content creator. Create clear, engaging quiz questions with correct answers.",
      outputSchema: [
        { id: "field-questions", key: "questions", type: "array", required: true },
        { id: "field-answers", key: "answers", type: "array", required: true },
      ],
    },
  },
  {
    id: "explain-concept",
    name: "Explain Concept",
    description: "Break down complex topics into simple explanations",
    icon: "Lightbulb",
    iconBg: "#F59E0B",
    defaults: {
      prompt: "Explain this concept in simple terms:\n\n{{input}}",
      systemPrompt: "You are a skilled teacher. Explain complex concepts simply with examples and analogies.",
      outputSchema: [
        { id: "field-explanation", key: "explanation", type: "string", required: true },
        { id: "field-examples", key: "examples", type: "array", required: false },
      ],
    },
  },
  {
    id: "study-guide",
    name: "Study Guide",
    description: "Create comprehensive study guides from content",
    icon: "BookOpen",
    iconBg: "#10B981",
    defaults: {
      prompt: "Create a study guide for:\n\n{{input}}",
      systemPrompt: "You are an academic tutor. Create well-structured study guides with key points and summaries.",
      outputSchema: [
        { id: "field-summary", key: "summary", type: "string", required: true },
        { id: "field-keypoints", key: "key_points", type: "array", required: true },
      ],
    },
  },
  {
    id: "lesson-plan",
    name: "Lesson Plan",
    description: "Generate structured lesson plans for educators",
    icon: "GraduationCap",
    iconBg: "#8B5CF6",
    defaults: {
      prompt: "Create a lesson plan for teaching:\n\n{{input}}",
      systemPrompt: "You are an experienced educator. Create detailed lesson plans with objectives, activities, and assessments.",
      outputSchema: [
        { id: "field-objectives", key: "objectives", type: "array", required: true },
        { id: "field-activities", key: "activities", type: "array", required: true },
        { id: "field-assessment", key: "assessment", type: "string", required: false },
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
  primaryButtonBg: GPT_LEARNING_NODE.dark,
  activeTabBg: GPT_LEARNING_NODE.dark,
  activeTabText: "#ffffff",
};

export const getTemplateById = (id) =>
  LEARNING_TEMPLATES.find((t) => t.id === id);
