import {
  Globe,
  Sparkles,
  Table2,
  Database,
  UserSearch,
  Bot,
  Zap,
  GitBranch,
  Mail,
  Webhook,
  RefreshCw,
  Calculator,
  FileJson,
  Clock,
  Play,
} from "lucide-react";

export const CONTEXTUAL_CONTENT_DEFAULTS = {
  HTTP: {
    title: "Test Your API Request",
    description: "Send a test request to verify your endpoint configuration",
    tips: [
      "Check headers and authentication are correctly configured",
      "Use test/sandbox endpoints when available",
      "Review rate limits before testing",
    ],
    icon: Globe,
    category: "http",
  },

  AI_GPT: {
    title: "Test AI Processing",
    description: "Run your prompt with sample input to preview the AI response",
    tips: [
      "Use representative sample text for accurate results",
      "Longer inputs may take more time to process",
      "Review token usage for cost estimation",
    ],
    icon: Sparkles,
    category: "ai",
  },

  SHEET: {
    title: "Test Sheet Operation",
    description: "Execute this operation against your connected spreadsheet",
    tips: [
      "Use a test sheet to avoid modifying production data",
      "Check column mappings match your sheet structure",
      "Large operations may take longer",
    ],
    icon: Table2,
    category: "sheet",
  },

  CRUD: {
    title: "Test Database Query",
    description: "Execute this operation against your database connection",
    tips: [
      "Use a test database when possible",
      "Check field types match your schema",
      "Review WHERE clauses for update/delete operations",
    ],
    icon: Database,
    category: "crud",
  },

  ENRICHMENT: {
    title: "Test Data Enrichment",
    description: "Look up additional data for your input record",
    tips: [
      "API credits may be consumed during testing",
      "Use real data for accurate enrichment results",
      "Some lookups may take a few seconds",
    ],
    icon: UserSearch,
    category: "enrichment",
  },

  AGENT: {
    title: "Test Agent Execution",
    description: "Run the agent with sample inputs to verify its behavior",
    tips: [
      "Agent responses may vary based on context",
      "Review tool configurations before testing",
      "Monitor for unexpected tool calls",
    ],
    icon: Bot,
    category: "agent",
  },

  TRIGGER: {
    title: "Simulate Trigger Event",
    description: "Preview how this trigger will fire with sample data",
    tips: [
      "Manual triggers start immediately",
      "Scheduled triggers show next run time",
      "Webhook triggers need sample payload",
    ],
    icon: Zap,
    category: "trigger",
  },

  LOGIC: {
    title: "Test Condition Logic",
    description: "Evaluate your conditions with sample values",
    tips: [
      "Provide values for all referenced fields",
      "Check edge cases (null, empty, boundary values)",
      "Review branch outcomes match expectations",
    ],
    icon: GitBranch,
    category: "logic",
  },

  EMAIL: {
    title: "Test Email Sending",
    description: "Send a test email to verify your configuration",
    tips: [
      "Check recipient addresses are valid",
      "Review email content and formatting",
      "Test with your own email first",
    ],
    icon: Mail,
    category: "email",
  },

  WEBHOOK: {
    title: "Test Webhook Configuration",
    description: "Verify your webhook setup and payload format",
    tips: [
      "Check the webhook URL is accessible",
      "Verify signature validation if enabled",
      "Review expected payload structure",
    ],
    icon: Webhook,
    category: "webhook",
  },

  LOOP: {
    title: "Test Loop Iteration",
    description: "Execute your loop with sample array data",
    tips: [
      "Provide a representative array for testing",
      "Check iteration limits for large arrays",
      "Review variable mappings per iteration",
    ],
    icon: RefreshCw,
    category: "loop",
  },

  TRANSFORMER: {
    title: "Test Data Transformation",
    description: "Transform your input and preview the result",
    tips: [
      "Check formula syntax is correct",
      "Use sample data that represents production",
      "Review output structure matches expectations",
    ],
    icon: Calculator,
    category: "transformer",
  },

  JSON: {
    title: "Test JSON Processing",
    description: "Parse and manipulate JSON data",
    tips: [
      "Ensure JSON syntax is valid",
      "Check path expressions for nested data",
      "Review output format requirements",
    ],
    icon: FileJson,
    category: "json",
  },

  SCHEDULER: {
    title: "Test Scheduled Task",
    description: "Preview when your scheduled task will run",
    tips: [
      "Check timezone settings are correct",
      "Review schedule expression syntax",
      "Consider time-based edge cases",
    ],
    icon: Clock,
    category: "scheduler",
  },

  DEFAULT: {
    title: "Run Test",
    description: "Execute a test to verify your configuration",
    tips: [
      "Provide sample values for all required fields",
      "Review outputs to confirm expected behavior",
      "Re-run tests after making changes",
    ],
    icon: Play,
    category: "default",
  },
};

export const getContextualContentByNodeType = (nodeType) => {
  if (!nodeType) return CONTEXTUAL_CONTENT_DEFAULTS.DEFAULT;

  const type = nodeType.toUpperCase();

  if (type.includes("HTTP") || type.includes("API") || type.includes("REST")) {
    return CONTEXTUAL_CONTENT_DEFAULTS.HTTP;
  }

  if (
    type.includes("GPT") ||
    type.includes("AI") ||
    type.includes("OPENAI") ||
    type.includes("LLM") ||
    type.includes("TINY_GPT")
  ) {
    return CONTEXTUAL_CONTENT_DEFAULTS.AI_GPT;
  }

  if (
    type.includes("SHEET") ||
    type.includes("GOOGLE_SHEET") ||
    type.includes("SPREADSHEET")
  ) {
    return CONTEXTUAL_CONTENT_DEFAULTS.SHEET;
  }

  if (
    type.includes("CRUD") ||
    type.includes("DATABASE") ||
    type.includes("DB") ||
    type.includes("SQL") ||
    type.includes("QUERY")
  ) {
    return CONTEXTUAL_CONTENT_DEFAULTS.CRUD;
  }

  if (
    type.includes("ENRICH") ||
    type.includes("PERSON") ||
    type.includes("COMPANY") ||
    type.includes("EMAIL_ENRICH")
  ) {
    return CONTEXTUAL_CONTENT_DEFAULTS.ENRICHMENT;
  }

  if (
    type.includes("AGENT") ||
    type.includes("SCOUT") ||
    type.includes("COMPOSER")
  ) {
    return CONTEXTUAL_CONTENT_DEFAULTS.AGENT;
  }

  if (type.includes("TRIGGER") || type.includes("START")) {
    return CONTEXTUAL_CONTENT_DEFAULTS.TRIGGER;
  }

  if (
    type.includes("IF_ELSE") ||
    type.includes("CONDITION") ||
    type.includes("BRANCH")
  ) {
    return CONTEXTUAL_CONTENT_DEFAULTS.LOGIC;
  }

  if (type.includes("EMAIL") || type.includes("MAIL")) {
    return CONTEXTUAL_CONTENT_DEFAULTS.EMAIL;
  }

  if (type.includes("WEBHOOK")) {
    return CONTEXTUAL_CONTENT_DEFAULTS.WEBHOOK;
  }

  if (
    type.includes("LOOP") ||
    type.includes("ITERATOR") ||
    type.includes("ARRAY_AGGREGATOR")
  ) {
    return CONTEXTUAL_CONTENT_DEFAULTS.LOOP;
  }

  if (type.includes("TRANSFORM") || type.includes("FORMULA")) {
    return CONTEXTUAL_CONTENT_DEFAULTS.TRANSFORMER;
  }

  if (type.includes("JSON") || type.includes("PARSE")) {
    return CONTEXTUAL_CONTENT_DEFAULTS.JSON;
  }

  if (type.includes("SCHEDULE") || type.includes("CRON") || type.includes("TIME")) {
    return CONTEXTUAL_CONTENT_DEFAULTS.SCHEDULER;
  }

  return CONTEXTUAL_CONTENT_DEFAULTS.DEFAULT;
};

export const createContextualContent = ({
  title,
  description,
  tips = [],
  icon,
  category = "default",
}) => {
  return {
    title,
    description,
    tips,
    icon,
    category,
  };
};

export default CONTEXTUAL_CONTENT_DEFAULTS;
