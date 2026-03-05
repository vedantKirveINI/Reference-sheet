export const GUIDED_SETUP_EVENT = "GUIDED_SETUP_START";

export const GUIDED_STATES = {
  IDLE: "idle",
  GUIDING: "guiding",
  COMPLETE: "complete",
};

export const NODE_STEP_STATUS = {
  PENDING: "pending",
  ACTIVE: "active",
  COMPLETED: "completed",
  SKIPPED: "skipped",
};

export const GUIDED_SHADOW = {
  color: "rgba(28, 54, 147, 0.85)",
  blur: 130,
  offset: { x: 0, y: 0 },
};

export const GUIDED_PULSE_PERIOD = 2200;

export const DIM_OPACITY = 0.35;
export const ACTIVE_OPACITY = 1.0;

export const AUTO_PAN_DURATION_MS = 500;

export const NODE_FRIENDLY_NAMES = {
  TRIGGER_SETUP: "Trigger",
  TRIGGER_SETUP_V3: "Trigger",
  CUSTOM_WEBHOOK: "Webhook Trigger",
  WEBHOOK_V2: "Webhook",
  TIME_BASED_TRIGGER: "Scheduled Trigger",
  TIME_BASED_TRIGGER_V2: "Scheduled Trigger",
  FORM_TRIGGER: "Form Trigger",
  SHEET_TRIGGER: "Sheet Trigger",
  SHEET_TRIGGER_V2: "Sheet Trigger",
  HTTP: "HTTP Request",
  Integration: "App Connection",
  TRANSFORMER_V3: "Data Transformer",
  FORMULA_FX: "Formula",
  IFELSE_V2: "If/Else Condition",
  "If Else": "If/Else Condition",
  CREATE_RECORD_V2: "Create Record",
  UPDATE_RECORD_V2: "Update Record",
  DELETE_RECORD_V2: "Delete Record",
  DB_FIND_ALL_V2: "Find All Records",
  DB_FIND_ONE_V2: "Find One Record",
  EXECUTE_QUERY_V2: "Execute Query",
  GPT: "AI Text Generator",
  GPT_RESEARCHER: "AI Researcher",
  GPT_WRITER: "AI Writer",
  GPT_ANALYZER: "AI Analyzer",
  GPT_SUMMARIZER: "AI Summarizer",
  GPT_TRANSLATOR: "AI Translator",
  GPT_LEARNING: "AI Learning",
  GPT_CONSULTANT: "AI Consultant",
  GPT_CREATIVE: "AI Creative",
  SELF_EMAIL: "Send Email",
  DELAY_V2: "Delay",
  Delay: "Delay",
  ITERATOR_V2: "Loop",
  FOR_EACH: "For Each Loop",
  REPEAT: "Repeat Loop",
  LOOP_UNTIL: "Loop Until",
  LOG: "Log",
  SKIP: "Skip",
  BREAK: "Break",
  MATCH_PATTERN: "Text Parser",
  CUSTOM_WEBHOOK_NODE: "Webhook",
  PERSON_ENRICHMENT_V2: "Person Enrichment",
  COMPANY_ENRICHMENT_V2: "Company Enrichment",
  EMAIL_ENRICHMENT_V2: "Email Enrichment",
};

export const NODE_GUIDANCE = {
  TRIGGER_SETUP: "Choose what starts your workflow — an app event, a schedule, or a manual trigger.",
  TRIGGER_SETUP_V3: "Choose what starts your workflow — an app event, a schedule, or a manual trigger.",
  HTTP: "Set the URL and method for this API call. You can add headers and a request body too.",
  Integration: "Connect to the app and choose which action to perform.",
  TRANSFORMER_V3: "Write the logic that transforms your data from one format to another.",
  FORMULA_FX: "Define the formula that processes your data.",
  IFELSE_V2: "Set up the conditions that decide which path the workflow takes.",
  "If Else": "Set up the conditions that decide which path the workflow takes.",
  CREATE_RECORD_V2: "Pick the database table and map the fields you want to create.",
  UPDATE_RECORD_V2: "Choose which record to update and map the new field values.",
  DELETE_RECORD_V2: "Select the record you want to remove.",
  DB_FIND_ALL_V2: "Choose the table and set filters to find matching records.",
  DB_FIND_ONE_V2: "Set the criteria to find a specific record.",
  EXECUTE_QUERY_V2: "Write or paste your database query.",
  GPT: "Describe what the AI should do, set a persona, and define the output format.",
  GPT_RESEARCHER: "Tell the AI what to research and how to present findings.",
  GPT_WRITER: "Give the AI a writing prompt and style instructions.",
  GPT_ANALYZER: "Describe what data to analyze and what insights to extract.",
  GPT_SUMMARIZER: "Point the AI to the content you want summarized.",
  GPT_TRANSLATOR: "Set the source and target languages for translation.",
  SELF_EMAIL: "Set the email subject and body content.",
  DELAY_V2: "Choose how long to wait before the next step runs.",
  Delay: "Choose how long to wait before the next step runs.",
  FOR_EACH: "Select the list to iterate over.",
  CUSTOM_WEBHOOK: "Configure the webhook URL and payload format.",
  WEBHOOK_V2: "Configure the webhook endpoint.",
  PERSON_ENRICHMENT_V2: "Provide an email or name to look up person details.",
  COMPANY_ENRICHMENT_V2: "Provide a domain or company name to enrich.",
  EMAIL_ENRICHMENT_V2: "Provide an email address to verify and enrich.",
};

export const DEFAULT_GUIDANCE = "Configure this step to continue building your workflow.";

export const SKIP_NODE_TYPES = new Set([
  "STICKY_NOTE",
  "NOTE",
  "COMMENT",
  "GROUP",
  "LOOP_END",
  "END",
  "END_V2",
  "END_V3",
  "START",
  "START_V2",
]);

export const AUTO_CONFIGURED_DEFAULTS = [
  { label: "Error handling", value: "Skip on error" },
];
