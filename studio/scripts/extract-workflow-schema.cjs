#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const NODE_TEMPLATES = {
  PLACEHOLDER: "placeholder",
  CIRCLE: "",
  FIXED_START: "fixedStartNode",
  FIXED_END: "fixedEndNode",
  START: "startNode",
  END: "endNode",
  ROUNDED_RECTANGLE: "roundedRectangle",
  AGENT_INPUT: "agentInput",
  START_ROUNDED_RECTANGLE: "startRoundedRectangle",
  END_ROUNDED_RECTANGLE: "endRoundedRectangle",
  STICKY_NOTE: "stickyNote",
  TRIGGER_SETUP: "triggerSetup",
};

const WorkflowNodeType = {
  IF_ELSE: "If Else",
  IF_ELSE_V2: "IFELSE_V2",
  HTTP: "HTTP",
  DELAY: "Delay",
  TRANSFORMER: "Transformer",
  TRANSFORMER_V2: "TRANSFORMER_V2",
  FORMULA_FX: "FORMULA_FX",
  INTEGRATION: "Integration",
  ITERATOR: "Iterator",
  ARRAY_AGGREGATOR: "Array Aggregator",
  LOG: "LOG",
  JUMP_TO: "JUMP_TO",
  SKIP: "SKIP",
  BREAK: "BREAK",
  INPUT_SETUP: "Input Setup",
  WEBHOOK: "CUSTOM_WEBHOOK",
  TIME_BASED_TRIGGER: "TIME_BASED_TRIGGER",
  SHEET_TRIGGER: "SHEET_TRIGGER",
  DATE_FIELD_TRIGGER: "DATE_FIELD_TRIGGER",
  FORM_TRIGGER: "FORM_TRIGGER",
  TRIGGER_SETUP: "TRIGGER_SETUP",
  TINY_GPT: "GPT",
  TINY_GPT_RESEARCHER: "GPT_RESEARCHER",
  TINY_GPT_WRITER: "GPT_WRITER",
  TINY_GPT_ANALYZER: "GPT_ANALYZER",
  TINY_GPT_CREATIVE: "GPT_CREATIVE",
  TINY_GPT_SUMMARIZER: "GPT_SUMMARIZER",
  TINY_GPT_TRANSLATOR: "GPT_TRANSLATOR",
  TINY_GPT_LEARNING: "GPT_LEARNING",
  TINY_GPT_CONSULTANT: "GPT_CONSULTANT",
  CREATE_RECORD: "Create Record",
  READ_RECORD: "Read Record",
  UPDATE_RECORD: "Update Record",
  DELETE_RECORD: "Delete Record",
  EXECUTE_QUERY: "Execute Query",
  FIND_ALL: "DB_FIND_ALL",
  FIND_ONE: "DB_FIND_ONE",
  CREATE_SHEET_RECORD: "CREATE_SHEET_RECORD",
  UPDATE_SHEET_RECORD: "UPDATE_SHEET_RECORD",
  DELETE_SHEET_RECORD: "DELETE_SHEET_RECORD",
  FIND_ALL_SHEET_RECORD: "FIND_ALL_SHEET_RECORD",
  FIND_ONE_SHEET_RECORD: "FIND_ONE_SHEET_RECORD",
  FIND_ONE_SHEET_RECORD_V2: "FIND_ONE_SHEET_RECORD_V2",
  FIND_ALL_SHEET_RECORD_V2: "FIND_ALL_SHEET_RECORD_V2",
  UPDATE_SHEET_RECORD_V2: "UPDATE_SHEET_RECORD_V2",
  CREATE_SHEET_RECORD_V2: "CREATE_SHEET_RECORD_V2",
  MATCH_PATTERN: "MATCH_PATTERN",
  CONNECTION_SETUP: "Connection Setup",
  WORKFLOW_SETUP: "Workflow Setup",
  TINY_SEARCH: "TINY_SEARCH",
  TINY_SEARCH_V2: "TINY_SEARCH_V2",
  HITL: "HITL",
  SEND_EMAIL_TO_YOURSELF: "SELF_EMAIL",
  PERSON_ENRICHMENT: "PERSON_ENRICHMENT",
  COMPANY_ENRICHMENT: "COMPANY_ENRICHMENT",
  EMAIL_ENRICHMENT: "EMAIL_ENRICHMENT",
  AGENT_WORKFLOW: "AGENT_WORKFLOW",
  AGENT_OUTPUT: "AGENT_OUTPUT",
  AGENT_INPUT: "AGENT_INPUT",
  AGENT: "AGENT",
  AGENT_TINY_SCOUT: "AGENT_SCOUT",
  AGENT_TINY_COMPOSER: "AGENT_COMPOSER",
  TOOL_INPUT: "TOOL_INPUT",
  TOOL_OUTPUT: "TOOL_OUTPUT",
};

const INPUT_SETUP_DEFAULT = {
  type: WorkflowNodeType.INPUT_SETUP,
  name: "Manual Trigger",
  go_data: {
    inputs: [],
    configured: false,
  },
};

const WEBHOOK_DEFAULT = {
  type: WorkflowNodeType.WEBHOOK,
  name: "Webhook Trigger",
  go_data: {
    configured: false,
    method: "POST",
    headers: {},
  },
};

const TIME_BASED_TRIGGER_DEFAULT = {
  type: WorkflowNodeType.TIME_BASED_TRIGGER,
  name: "Time Based Trigger",
  go_data: {
    configured: false,
    schedule_type: "AT_REGULAR_INTERVALS",
    interval: 60,
    interval_unit: "minutes",
  },
};

const SHEET_TRIGGER_DEFAULT = {
  type: WorkflowNodeType.SHEET_TRIGGER,
  name: "Table Trigger",
  go_data: {
    configured: false,
    sheet_id: "",
    event_type: "ROW_CREATED",
  },
};

const DATE_FIELD_TRIGGER_DEFAULT = {
  type: WorkflowNodeType.DATE_FIELD_TRIGGER,
  name: "Date Field Trigger",
  go_data: {
    configured: false,
    sheet_id: "",
    date_field: "",
    trigger_offset: 0,
    trigger_offset_unit: "days",
  },
};

const FORM_TRIGGER_DEFAULT = {
  type: WorkflowNodeType.FORM_TRIGGER,
  name: "Form Trigger",
  go_data: {
    configured: false,
    form_id: "",
  },
};

const HTTP_DEFAULT = {
  type: WorkflowNodeType.HTTP,
  name: "HTTP Request",
  go_data: {
    configured: false,
    method: "GET",
    url: "",
    headers: {},
    body: {},
    params: {},
    auth: {
      type: "none",
    },
  },
};

const TRANSFORMER_DEFAULT = {
  type: WorkflowNodeType.TRANSFORMER,
  name: "Transformer",
  go_data: {
    configured: false,
    expression: "",
    output_variable: "",
  },
};

const IF_ELSE_V2_DEFAULT = {
  type: WorkflowNodeType.IF_ELSE_V2,
  name: "If Else",
  go_data: {
    configured: false,
    conditions: [],
    default_branch: "false",
  },
};

const DELAY_DEFAULT = {
  type: WorkflowNodeType.DELAY,
  name: "Delay",
  go_data: {
    configured: false,
    delay_value: 1,
    delay_unit: "minutes",
  },
};

const ITERATOR_DEFAULT = {
  type: WorkflowNodeType.ITERATOR,
  name: "Iterator",
  go_data: {
    configured: false,
    array_input: "",
    item_variable: "item",
    index_variable: "index",
  },
};

const ARRAY_AGGREGATOR_DEFAULT = {
  type: WorkflowNodeType.ARRAY_AGGREGATOR,
  name: "Array Aggregator",
  go_data: {
    configured: false,
    output_variable: "aggregated_array",
  },
};

const BREAK_DEFAULT = {
  type: WorkflowNodeType.BREAK,
  name: "Break",
  go_data: {
    configured: true,
  },
};

const SKIP_DEFAULT = {
  type: WorkflowNodeType.SKIP,
  name: "Skip",
  go_data: {
    configured: true,
  },
};

const JUMP_TO_DEFAULT = {
  type: WorkflowNodeType.JUMP_TO,
  name: "Jump To",
  go_data: {
    configured: false,
    target_node_id: "",
  },
};

const LOG_DEFAULT = {
  type: WorkflowNodeType.LOG,
  name: "Log",
  go_data: {
    configured: false,
    level: "INFO",
    message: "",
  },
};

const TINY_GPT_DEFAULT = {
  type: WorkflowNodeType.TINY_GPT,
  name: "Tiny GPT",
  go_data: {
    configured: false,
    prompt: "",
    model: "gpt-4o",
    temperature: 0.7,
    max_tokens: 1000,
  },
};

const TINY_GPT_RESEARCHER_DEFAULT = {
  type: WorkflowNodeType.TINY_GPT_RESEARCHER,
  name: "Tiny GPT Researcher",
  go_data: {
    configured: false,
    research_topic: "",
    depth: "comprehensive",
    sources: [],
  },
};

const TINY_GPT_WRITER_DEFAULT = {
  type: WorkflowNodeType.TINY_GPT_WRITER,
  name: "Tiny GPT Writer",
  go_data: {
    configured: false,
    content_type: "Article",
    topic: "",
    tone: "Conversational",
    outline_structure: "Generate Outline",
  },
};

const TINY_GPT_ANALYZER_DEFAULT = {
  type: WorkflowNodeType.TINY_GPT_ANALYZER,
  name: "Tiny GPT Analyzer",
  go_data: {
    configured: false,
    analysis_focus: "Trend Identification",
    data_type: "Text",
    input_data: "",
  },
};

const TINY_GPT_CREATIVE_DEFAULT = {
  type: WorkflowNodeType.TINY_GPT_CREATIVE,
  name: "Tiny GPT Creative",
  go_data: {
    configured: false,
    creative_type: "Story",
    prompt: "",
    style: "",
  },
};

const TINY_GPT_SUMMARIZER_DEFAULT = {
  type: WorkflowNodeType.TINY_GPT_SUMMARIZER,
  name: "Tiny GPT Summarizer",
  go_data: {
    configured: false,
    input_text: "",
    summary_length: "medium",
    format: "paragraph",
  },
};

const TINY_GPT_TRANSLATOR_DEFAULT = {
  type: WorkflowNodeType.TINY_GPT_TRANSLATOR,
  name: "Tiny GPT Translator",
  go_data: {
    configured: false,
    input_text: "",
    source_language: "auto",
    target_language: "en",
  },
};

const TINY_GPT_LEARNING_DEFAULT = {
  type: WorkflowNodeType.TINY_GPT_LEARNING,
  name: "Tiny GPT Learning",
  go_data: {
    configured: false,
    topic: "",
    learning_style: "conceptual",
    difficulty: "intermediate",
  },
};

const TINY_GPT_CONSULTANT_DEFAULT = {
  type: WorkflowNodeType.TINY_GPT_CONSULTANT,
  name: "Tiny GPT Consultant",
  go_data: {
    configured: false,
    domain: "business",
    question: "",
    context: "",
  },
};

const CREATE_RECORD_DEFAULT = {
  type: WorkflowNodeType.CREATE_RECORD,
  name: "Create Record",
  go_data: {
    configured: false,
    connection_id: "",
    schema: "",
    table: "",
    fields: {},
  },
};

const UPDATE_RECORD_DEFAULT = {
  type: WorkflowNodeType.UPDATE_RECORD,
  name: "Update Record",
  go_data: {
    configured: false,
    connection_id: "",
    schema: "",
    table: "",
    filter: {},
    fields: {},
  },
};

const DELETE_RECORD_DEFAULT = {
  type: WorkflowNodeType.DELETE_RECORD,
  name: "Delete Record",
  go_data: {
    configured: false,
    connection_id: "",
    schema: "",
    table: "",
    filter: {},
  },
};

const FIND_ONE_DEFAULT = {
  type: WorkflowNodeType.FIND_ONE,
  name: "Find One Record",
  go_data: {
    configured: false,
    connection_id: "",
    schema: "",
    table: "",
    filter: {},
    select: [],
  },
};

const FIND_ALL_DEFAULT = {
  type: WorkflowNodeType.FIND_ALL,
  name: "Find All Records",
  go_data: {
    configured: false,
    connection_id: "",
    schema: "",
    table: "",
    filter: {},
    select: [],
    limit: 100,
    offset: 0,
    order_by: [],
  },
};

const EXECUTE_QUERY_DEFAULT = {
  type: WorkflowNodeType.EXECUTE_QUERY,
  name: "Execute Query",
  go_data: {
    configured: false,
    connection_id: "",
    query: "",
    parameters: {},
  },
};

const CREATE_SHEET_RECORD_DEFAULT = {
  type: WorkflowNodeType.CREATE_SHEET_RECORD,
  name: "Create Table Record",
  go_data: {
    configured: false,
    sheet_id: "",
    fields: {},
  },
};

const UPDATE_SHEET_RECORD_DEFAULT = {
  type: WorkflowNodeType.UPDATE_SHEET_RECORD,
  name: "Update Table Record",
  go_data: {
    configured: false,
    sheet_id: "",
    record_id: "",
    fields: {},
  },
};

const DELETE_SHEET_RECORD_DEFAULT = {
  type: WorkflowNodeType.DELETE_SHEET_RECORD,
  name: "Delete Table Record",
  go_data: {
    configured: false,
    sheet_id: "",
    record_id: "",
  },
};

const FIND_ONE_SHEET_RECORD_DEFAULT = {
  type: WorkflowNodeType.FIND_ONE_SHEET_RECORD,
  name: "Find One Table Record",
  go_data: {
    configured: false,
    sheet_id: "",
    filter: {},
  },
};

const FIND_ALL_SHEET_RECORD_DEFAULT = {
  type: WorkflowNodeType.FIND_ALL_SHEET_RECORD,
  name: "Find All Table Records",
  go_data: {
    configured: false,
    sheet_id: "",
    filter: {},
    limit: 100,
  },
};

const MATCH_PATTERN_DEFAULT = {
  type: WorkflowNodeType.MATCH_PATTERN,
  name: "Match Pattern",
  go_data: {
    configured: false,
    input: "",
    pattern: "",
    flags: "g",
  },
};

const TINY_SEARCH_DEFAULT = {
  type: WorkflowNodeType.TINY_SEARCH,
  name: "Tiny Search",
  go_data: {
    configured: false,
    query: "",
    max_results: 10,
  },
};

const HITL_DEFAULT = {
  type: WorkflowNodeType.HITL,
  name: "Human in the Loop",
  go_data: {
    configured: false,
    title: "",
    description: "",
    buttons: [],
    timeout: 86400,
  },
};

const SEND_EMAIL_TO_YOURSELF_DEFAULT = {
  type: WorkflowNodeType.SEND_EMAIL_TO_YOURSELF,
  name: "Send Email to Yourself",
  go_data: {
    configured: false,
    subject: "",
    body: "",
    format: "text",
  },
};

const INTEGRATION_DEFAULT = {
  type: WorkflowNodeType.INTEGRATION,
  name: "Integration",
  go_data: {
    configured: false,
    app_id: "",
    action_id: "",
    inputs: {},
  },
};

const PERSON_ENRICHMENT_DEFAULT = {
  type: WorkflowNodeType.PERSON_ENRICHMENT,
  name: "Person Enrichment",
  go_data: {
    configured: false,
    email: "",
    linkedin_url: "",
  },
};

const COMPANY_ENRICHMENT_DEFAULT = {
  type: WorkflowNodeType.COMPANY_ENRICHMENT,
  name: "Company Enrichment",
  go_data: {
    configured: false,
    domain: "",
    company_name: "",
  },
};

const EMAIL_ENRICHMENT_DEFAULT = {
  type: WorkflowNodeType.EMAIL_ENRICHMENT,
  name: "Email Enrichment",
  go_data: {
    configured: false,
    email: "",
  },
};

const WORKFLOW_NODES_METADATA = {
  [WorkflowNodeType.INPUT_SETUP]: {
    displayName: "Manual Trigger",
    category: "TRIGGER",
    integrationOwner: null,
    aliases: [
      "manual trigger", "start", "run", "manual start",
      "trigger manually", "begin", "launch"
    ],
    template: NODE_TEMPLATES.START,
    connectionRules: {
      denyFromLink: false,
      denyToLink: true,
      maxInstances: 1,
      allowedParents: [],
      allowedChildren: ["*"],
      hasBranches: false,
    },
    safeOverrides: ["name", "description"],
  },
  [WorkflowNodeType.WEBHOOK]: {
    displayName: "Webhook Trigger",
    category: "TRIGGER",
    integrationOwner: null,
    aliases: [
      "webhook", "incoming hook", "api trigger", "http trigger",
      "webhook listener", "external trigger", "callback url"
    ],
    template: NODE_TEMPLATES.START,
    connectionRules: {
      denyFromLink: false,
      denyToLink: true,
      maxInstances: 1,
      allowedParents: [],
      allowedChildren: ["*"],
      hasBranches: false,
    },
    safeOverrides: ["name", "description"],
  },
  [WorkflowNodeType.TIME_BASED_TRIGGER]: {
    displayName: "Time Based Trigger",
    category: "TRIGGER",
    integrationOwner: null,
    aliases: [
      "schedule", "scheduled trigger", "cron", "timer",
      "time trigger", "scheduled job", "recurring", "interval"
    ],
    template: NODE_TEMPLATES.CIRCLE,
    connectionRules: {
      denyFromLink: false,
      denyToLink: true,
      maxInstances: 1,
      allowedParents: [],
      allowedChildren: ["*"],
      hasBranches: false,
    },
    safeOverrides: ["name", "description"],
  },
  [WorkflowNodeType.SHEET_TRIGGER]: {
    displayName: "Table Trigger",
    category: "TRIGGER",
    integrationOwner: null,
    aliases: [
      "table trigger", "sheet trigger", "spreadsheet trigger",
      "row created", "row updated", "table event", "database trigger"
    ],
    template: NODE_TEMPLATES.CIRCLE,
    connectionRules: {
      denyFromLink: false,
      denyToLink: true,
      maxInstances: 1,
      allowedParents: [],
      allowedChildren: ["*"],
      hasBranches: false,
    },
    safeOverrides: ["name", "description"],
  },
  [WorkflowNodeType.DATE_FIELD_TRIGGER]: {
    displayName: "Date Field Trigger",
    category: "TRIGGER",
    integrationOwner: null,
    aliases: [
      "date trigger", "date field", "calendar trigger",
      "due date", "reminder trigger", "deadline trigger"
    ],
    template: NODE_TEMPLATES.CIRCLE,
    connectionRules: {
      denyFromLink: false,
      denyToLink: true,
      maxInstances: 1,
      allowedParents: [],
      allowedChildren: ["*"],
      hasBranches: false,
    },
    safeOverrides: ["name", "description"],
  },
  [WorkflowNodeType.FORM_TRIGGER]: {
    displayName: "Form Trigger",
    category: "TRIGGER",
    integrationOwner: null,
    aliases: [
      "form trigger", "form submission", "form response",
      "on form submit", "form submitted", "new response"
    ],
    template: NODE_TEMPLATES.START,
    connectionRules: {
      denyFromLink: false,
      denyToLink: true,
      maxInstances: 1,
      allowedParents: [],
      allowedChildren: ["*"],
      hasBranches: false,
    },
    safeOverrides: ["name", "description"],
  },
  [WorkflowNodeType.HTTP]: {
    displayName: "HTTP Request",
    category: "ACTION",
    integrationOwner: null,
    aliases: [
      "http", "api call", "rest api", "curl", "fetch",
      "request", "post", "get", "api request", "web request"
    ],
    template: NODE_TEMPLATES.CIRCLE,
    connectionRules: {
      denyFromLink: false,
      denyToLink: false,
      maxInstances: null,
      allowedParents: ["*"],
      allowedChildren: ["*"],
      hasBranches: false,
    },
    safeOverrides: ["name", "description"],
  },
  [WorkflowNodeType.TRANSFORMER]: {
    displayName: "Transformer",
    category: "ACTION",
    integrationOwner: null,
    aliases: [
      "transformer", "transform", "modify", "convert",
      "function", "evaluate", "change", "formula", "fx"
    ],
    template: NODE_TEMPLATES.CIRCLE,
    connectionRules: {
      denyFromLink: false,
      denyToLink: false,
      maxInstances: null,
      allowedParents: ["*"],
      allowedChildren: ["*"],
      hasBranches: false,
    },
    safeOverrides: ["name", "description"],
  },
  [WorkflowNodeType.IF_ELSE_V2]: {
    displayName: "If Else",
    category: "CONTROL",
    integrationOwner: null,
    aliases: [
      "if else", "condition", "branch", "conditional",
      "decision", "switch", "check", "filter", "when"
    ],
    template: NODE_TEMPLATES.CIRCLE,
    connectionRules: {
      denyFromLink: false,
      denyToLink: false,
      maxInstances: null,
      allowedParents: ["*"],
      allowedChildren: ["*"],
      hasBranches: true,
      branchTypes: ["true", "false"],
    },
    safeOverrides: ["name", "description"],
  },
  [WorkflowNodeType.DELAY]: {
    displayName: "Delay",
    category: "CONTROL",
    integrationOwner: null,
    aliases: [
      "delay", "wait", "pause", "sleep",
      "timer", "hold", "timeout"
    ],
    template: NODE_TEMPLATES.CIRCLE,
    connectionRules: {
      denyFromLink: false,
      denyToLink: false,
      maxInstances: null,
      allowedParents: ["*"],
      allowedChildren: ["*"],
      hasBranches: false,
    },
    safeOverrides: ["name", "description"],
  },
  [WorkflowNodeType.ITERATOR]: {
    displayName: "Iterator",
    category: "CONTROL",
    integrationOwner: null,
    aliases: [
      "iterator", "loop", "for each", "iterate",
      "repeat", "cycle", "process each", "batch"
    ],
    template: NODE_TEMPLATES.CIRCLE,
    connectionRules: {
      denyFromLink: false,
      denyToLink: false,
      maxInstances: null,
      allowedParents: ["*"],
      allowedChildren: ["*"],
      hasBranches: true,
      branchTypes: ["loop_body"],
      requiresAggregator: true,
    },
    safeOverrides: ["name", "description"],
  },
  [WorkflowNodeType.ARRAY_AGGREGATOR]: {
    displayName: "Array Aggregator",
    category: "CONTROL",
    integrationOwner: null,
    aliases: [
      "aggregator", "collect", "gather", "combine",
      "merge", "accumulate", "end loop"
    ],
    template: NODE_TEMPLATES.CIRCLE,
    connectionRules: {
      denyFromLink: false,
      denyToLink: false,
      maxInstances: null,
      allowedParents: ["*"],
      allowedChildren: ["*"],
      hasBranches: false,
      requiresIterator: true,
    },
    safeOverrides: ["name", "description"],
  },
  [WorkflowNodeType.BREAK]: {
    displayName: "Break",
    category: "CONTROL",
    integrationOwner: null,
    aliases: [
      "break", "stop loop", "exit loop",
      "terminate", "end early"
    ],
    template: NODE_TEMPLATES.END,
    connectionRules: {
      denyFromLink: false,
      denyToLink: true,
      maxInstances: null,
      allowedParents: ["*"],
      allowedChildren: [],
      hasBranches: false,
    },
    safeOverrides: ["name", "description"],
  },
  [WorkflowNodeType.SKIP]: {
    displayName: "Skip",
    category: "CONTROL",
    integrationOwner: null,
    aliases: [
      "skip", "continue", "next iteration",
      "bypass", "pass"
    ],
    template: NODE_TEMPLATES.END,
    connectionRules: {
      denyFromLink: false,
      denyToLink: true,
      maxInstances: null,
      allowedParents: ["*"],
      allowedChildren: [],
      hasBranches: false,
    },
    safeOverrides: ["name", "description"],
  },
  [WorkflowNodeType.JUMP_TO]: {
    displayName: "Jump To",
    category: "CONTROL",
    integrationOwner: null,
    aliases: [
      "jump to", "goto", "go to",
      "redirect", "navigate to"
    ],
    template: NODE_TEMPLATES.END,
    connectionRules: {
      denyFromLink: false,
      denyToLink: true,
      maxInstances: null,
      allowedParents: ["*"],
      allowedChildren: [],
      hasBranches: false,
    },
    safeOverrides: ["name", "description"],
  },
  [WorkflowNodeType.LOG]: {
    displayName: "Log",
    category: "ACTION",
    integrationOwner: null,
    aliases: [
      "log", "debug", "print", "console",
      "output", "trace", "message"
    ],
    template: NODE_TEMPLATES.CIRCLE,
    connectionRules: {
      denyFromLink: false,
      denyToLink: false,
      maxInstances: null,
      allowedParents: ["*"],
      allowedChildren: ["*"],
      hasBranches: false,
    },
    safeOverrides: ["name", "description"],
  },
  [WorkflowNodeType.TINY_GPT]: {
    displayName: "Tiny GPT",
    category: "ACTION",
    integrationOwner: null,
    aliases: [
      "gpt", "ai", "chatgpt", "llm",
      "prompt", "generate text", "ai assistant"
    ],
    template: NODE_TEMPLATES.CIRCLE,
    connectionRules: {
      denyFromLink: false,
      denyToLink: false,
      maxInstances: null,
      allowedParents: ["*"],
      allowedChildren: ["*"],
      hasBranches: false,
    },
    safeOverrides: ["name", "description"],
  },
  [WorkflowNodeType.TINY_GPT_RESEARCHER]: {
    displayName: "Tiny GPT Researcher",
    category: "ACTION",
    integrationOwner: null,
    aliases: [
      "researcher", "research", "investigate",
      "ai research", "deep research"
    ],
    template: NODE_TEMPLATES.CIRCLE,
    connectionRules: {
      denyFromLink: false,
      denyToLink: false,
      maxInstances: null,
      allowedParents: ["*"],
      allowedChildren: ["*"],
      hasBranches: false,
    },
    safeOverrides: ["name", "description"],
  },
  [WorkflowNodeType.TINY_GPT_WRITER]: {
    displayName: "Tiny GPT Writer",
    category: "ACTION",
    integrationOwner: null,
    aliases: [
      "writer", "write", "content writer",
      "ai writer", "article writer", "copywriter"
    ],
    template: NODE_TEMPLATES.CIRCLE,
    connectionRules: {
      denyFromLink: false,
      denyToLink: false,
      maxInstances: null,
      allowedParents: ["*"],
      allowedChildren: ["*"],
      hasBranches: false,
    },
    safeOverrides: ["name", "description"],
  },
  [WorkflowNodeType.TINY_GPT_ANALYZER]: {
    displayName: "Tiny GPT Analyzer",
    category: "ACTION",
    integrationOwner: null,
    aliases: [
      "analyzer", "analyze", "analysis",
      "data analyzer", "sentiment", "trends"
    ],
    template: NODE_TEMPLATES.CIRCLE,
    connectionRules: {
      denyFromLink: false,
      denyToLink: false,
      maxInstances: null,
      allowedParents: ["*"],
      allowedChildren: ["*"],
      hasBranches: false,
    },
    safeOverrides: ["name", "description"],
  },
  [WorkflowNodeType.TINY_GPT_CREATIVE]: {
    displayName: "Tiny GPT Creative",
    category: "ACTION",
    integrationOwner: null,
    aliases: [
      "creative", "creative writing", "story",
      "imagination", "brainstorm"
    ],
    template: NODE_TEMPLATES.CIRCLE,
    connectionRules: {
      denyFromLink: false,
      denyToLink: false,
      maxInstances: null,
      allowedParents: ["*"],
      allowedChildren: ["*"],
      hasBranches: false,
    },
    safeOverrides: ["name", "description"],
  },
  [WorkflowNodeType.TINY_GPT_SUMMARIZER]: {
    displayName: "Tiny GPT Summarizer",
    category: "ACTION",
    integrationOwner: null,
    aliases: [
      "summarizer", "summarize", "summary",
      "tldr", "condense", "brief"
    ],
    template: NODE_TEMPLATES.CIRCLE,
    connectionRules: {
      denyFromLink: false,
      denyToLink: false,
      maxInstances: null,
      allowedParents: ["*"],
      allowedChildren: ["*"],
      hasBranches: false,
    },
    safeOverrides: ["name", "description"],
  },
  [WorkflowNodeType.TINY_GPT_TRANSLATOR]: {
    displayName: "Tiny GPT Translator",
    category: "ACTION",
    integrationOwner: null,
    aliases: [
      "translator", "translate", "translation",
      "language", "localize"
    ],
    template: NODE_TEMPLATES.CIRCLE,
    connectionRules: {
      denyFromLink: false,
      denyToLink: false,
      maxInstances: null,
      allowedParents: ["*"],
      allowedChildren: ["*"],
      hasBranches: false,
    },
    safeOverrides: ["name", "description"],
  },
  [WorkflowNodeType.TINY_GPT_LEARNING]: {
    displayName: "Tiny GPT Learning",
    category: "ACTION",
    integrationOwner: null,
    aliases: [
      "learning", "teach", "explain",
      "tutor", "education"
    ],
    template: NODE_TEMPLATES.CIRCLE,
    connectionRules: {
      denyFromLink: false,
      denyToLink: false,
      maxInstances: null,
      allowedParents: ["*"],
      allowedChildren: ["*"],
      hasBranches: false,
    },
    safeOverrides: ["name", "description"],
  },
  [WorkflowNodeType.TINY_GPT_CONSULTANT]: {
    displayName: "Tiny GPT Consultant",
    category: "ACTION",
    integrationOwner: null,
    aliases: [
      "consultant", "advisor", "expert",
      "consult", "advice"
    ],
    template: NODE_TEMPLATES.CIRCLE,
    connectionRules: {
      denyFromLink: false,
      denyToLink: false,
      maxInstances: null,
      allowedParents: ["*"],
      allowedChildren: ["*"],
      hasBranches: false,
    },
    safeOverrides: ["name", "description"],
  },
  [WorkflowNodeType.CREATE_RECORD]: {
    displayName: "Create Record",
    category: "ACTION",
    integrationOwner: null,
    aliases: [
      "create record", "insert", "add record",
      "new record", "create row", "insert row"
    ],
    template: NODE_TEMPLATES.CIRCLE,
    connectionRules: {
      denyFromLink: false,
      denyToLink: false,
      maxInstances: null,
      allowedParents: ["*"],
      allowedChildren: ["*"],
      hasBranches: false,
    },
    safeOverrides: ["name", "description"],
  },
  [WorkflowNodeType.UPDATE_RECORD]: {
    displayName: "Update Record",
    category: "ACTION",
    integrationOwner: null,
    aliases: [
      "update record", "edit", "modify record",
      "change record", "update row"
    ],
    template: NODE_TEMPLATES.CIRCLE,
    connectionRules: {
      denyFromLink: false,
      denyToLink: false,
      maxInstances: null,
      allowedParents: ["*"],
      allowedChildren: ["*"],
      hasBranches: false,
    },
    safeOverrides: ["name", "description"],
  },
  [WorkflowNodeType.DELETE_RECORD]: {
    displayName: "Delete Record",
    category: "ACTION",
    integrationOwner: null,
    aliases: [
      "delete record", "remove", "delete row",
      "remove record", "erase"
    ],
    template: NODE_TEMPLATES.CIRCLE,
    connectionRules: {
      denyFromLink: false,
      denyToLink: false,
      maxInstances: null,
      allowedParents: ["*"],
      allowedChildren: ["*"],
      hasBranches: false,
    },
    safeOverrides: ["name", "description"],
  },
  [WorkflowNodeType.FIND_ONE]: {
    displayName: "Find One Record",
    category: "ACTION",
    integrationOwner: null,
    aliases: [
      "find one", "get record", "fetch one",
      "lookup", "find record", "read record"
    ],
    template: NODE_TEMPLATES.CIRCLE,
    connectionRules: {
      denyFromLink: false,
      denyToLink: false,
      maxInstances: null,
      allowedParents: ["*"],
      allowedChildren: ["*"],
      hasBranches: false,
    },
    safeOverrides: ["name", "description"],
  },
  [WorkflowNodeType.FIND_ALL]: {
    displayName: "Find All Records",
    category: "ACTION",
    integrationOwner: null,
    aliases: [
      "find all", "get all", "fetch all",
      "list records", "query", "search records"
    ],
    template: NODE_TEMPLATES.CIRCLE,
    connectionRules: {
      denyFromLink: false,
      denyToLink: false,
      maxInstances: null,
      allowedParents: ["*"],
      allowedChildren: ["*"],
      hasBranches: false,
    },
    safeOverrides: ["name", "description"],
  },
  [WorkflowNodeType.EXECUTE_QUERY]: {
    displayName: "Execute Query",
    category: "ACTION",
    integrationOwner: null,
    aliases: [
      "execute query", "sql", "raw query",
      "database query", "custom query"
    ],
    template: NODE_TEMPLATES.CIRCLE,
    connectionRules: {
      denyFromLink: false,
      denyToLink: false,
      maxInstances: null,
      allowedParents: ["*"],
      allowedChildren: ["*"],
      hasBranches: false,
    },
    safeOverrides: ["name", "description"],
  },
  [WorkflowNodeType.CREATE_SHEET_RECORD]: {
    displayName: "Create Table Record",
    category: "ACTION",
    integrationOwner: null,
    aliases: [
      "create table record", "add to table",
      "insert table row", "new table entry"
    ],
    template: NODE_TEMPLATES.CIRCLE,
    connectionRules: {
      denyFromLink: false,
      denyToLink: false,
      maxInstances: null,
      allowedParents: ["*"],
      allowedChildren: ["*"],
      hasBranches: false,
    },
    safeOverrides: ["name", "description"],
  },
  [WorkflowNodeType.UPDATE_SHEET_RECORD]: {
    displayName: "Update Table Record",
    category: "ACTION",
    integrationOwner: null,
    aliases: [
      "update table record", "edit table row",
      "modify table entry"
    ],
    template: NODE_TEMPLATES.CIRCLE,
    connectionRules: {
      denyFromLink: false,
      denyToLink: false,
      maxInstances: null,
      allowedParents: ["*"],
      allowedChildren: ["*"],
      hasBranches: false,
    },
    safeOverrides: ["name", "description"],
  },
  [WorkflowNodeType.DELETE_SHEET_RECORD]: {
    displayName: "Delete Table Record",
    category: "ACTION",
    integrationOwner: null,
    aliases: [
      "delete table record", "remove table row",
      "delete table entry"
    ],
    template: NODE_TEMPLATES.CIRCLE,
    connectionRules: {
      denyFromLink: false,
      denyToLink: false,
      maxInstances: null,
      allowedParents: ["*"],
      allowedChildren: ["*"],
      hasBranches: false,
    },
    safeOverrides: ["name", "description"],
  },
  [WorkflowNodeType.FIND_ONE_SHEET_RECORD]: {
    displayName: "Find One Table Record",
    category: "ACTION",
    integrationOwner: null,
    aliases: [
      "find table record", "get table row",
      "lookup table"
    ],
    template: NODE_TEMPLATES.CIRCLE,
    connectionRules: {
      denyFromLink: false,
      denyToLink: false,
      maxInstances: null,
      allowedParents: ["*"],
      allowedChildren: ["*"],
      hasBranches: false,
    },
    safeOverrides: ["name", "description"],
  },
  [WorkflowNodeType.FIND_ALL_SHEET_RECORD]: {
    displayName: "Find All Table Records",
    category: "ACTION",
    integrationOwner: null,
    aliases: [
      "find all table records", "list table rows",
      "query table"
    ],
    template: NODE_TEMPLATES.CIRCLE,
    connectionRules: {
      denyFromLink: false,
      denyToLink: false,
      maxInstances: null,
      allowedParents: ["*"],
      allowedChildren: ["*"],
      hasBranches: false,
    },
    safeOverrides: ["name", "description"],
  },
  [WorkflowNodeType.MATCH_PATTERN]: {
    displayName: "Match Pattern",
    category: "ACTION",
    integrationOwner: null,
    aliases: [
      "match pattern", "regex", "pattern match",
      "text match", "extract pattern"
    ],
    template: NODE_TEMPLATES.CIRCLE,
    connectionRules: {
      denyFromLink: false,
      denyToLink: false,
      maxInstances: null,
      allowedParents: ["*"],
      allowedChildren: ["*"],
      hasBranches: false,
    },
    safeOverrides: ["name", "description"],
  },
  [WorkflowNodeType.TINY_SEARCH]: {
    displayName: "Tiny Search",
    category: "ACTION",
    integrationOwner: null,
    aliases: [
      "search", "web search", "google",
      "find online", "lookup online"
    ],
    template: NODE_TEMPLATES.CIRCLE,
    connectionRules: {
      denyFromLink: false,
      denyToLink: false,
      maxInstances: null,
      allowedParents: ["*"],
      allowedChildren: ["*"],
      hasBranches: false,
    },
    safeOverrides: ["name", "description"],
  },
  [WorkflowNodeType.HITL]: {
    displayName: "Human in the Loop",
    category: "ACTION",
    integrationOwner: null,
    aliases: [
      "human in the loop", "approval", "manual review",
      "human approval", "wait for approval", "hitl"
    ],
    template: NODE_TEMPLATES.CIRCLE,
    connectionRules: {
      denyFromLink: false,
      denyToLink: false,
      maxInstances: null,
      allowedParents: ["*"],
      allowedChildren: ["*"],
      hasBranches: true,
      branchTypes: ["approved", "rejected"],
    },
    safeOverrides: ["name", "description"],
  },
  [WorkflowNodeType.SEND_EMAIL_TO_YOURSELF]: {
    displayName: "Send Email to Yourself",
    category: "ACTION",
    integrationOwner: null,
    aliases: [
      "email myself", "send email", "notify me",
      "self email", "alert me"
    ],
    template: NODE_TEMPLATES.CIRCLE,
    connectionRules: {
      denyFromLink: false,
      denyToLink: false,
      maxInstances: null,
      allowedParents: ["*"],
      allowedChildren: ["*"],
      hasBranches: false,
    },
    safeOverrides: ["name", "description"],
  },
  [WorkflowNodeType.INTEGRATION]: {
    displayName: "Integration",
    category: "INTEGRATION",
    integrationOwner: null,
    aliases: [
      "integration", "app", "connect app",
      "third party", "external app"
    ],
    template: NODE_TEMPLATES.CIRCLE,
    connectionRules: {
      denyFromLink: false,
      denyToLink: false,
      maxInstances: null,
      allowedParents: ["*"],
      allowedChildren: ["*"],
      hasBranches: false,
    },
    safeOverrides: ["name", "description"],
  },
  [WorkflowNodeType.PERSON_ENRICHMENT]: {
    displayName: "Person Enrichment",
    category: "ACTION",
    integrationOwner: null,
    aliases: [
      "person enrichment", "enrich person", "person lookup",
      "contact enrichment", "lead enrichment"
    ],
    template: NODE_TEMPLATES.CIRCLE,
    connectionRules: {
      denyFromLink: false,
      denyToLink: false,
      maxInstances: null,
      allowedParents: ["*"],
      allowedChildren: ["*"],
      hasBranches: false,
    },
    safeOverrides: ["name", "description"],
  },
  [WorkflowNodeType.COMPANY_ENRICHMENT]: {
    displayName: "Company Enrichment",
    category: "ACTION",
    integrationOwner: null,
    aliases: [
      "company enrichment", "enrich company", "company lookup",
      "business enrichment", "org enrichment"
    ],
    template: NODE_TEMPLATES.CIRCLE,
    connectionRules: {
      denyFromLink: false,
      denyToLink: false,
      maxInstances: null,
      allowedParents: ["*"],
      allowedChildren: ["*"],
      hasBranches: false,
    },
    safeOverrides: ["name", "description"],
  },
  [WorkflowNodeType.EMAIL_ENRICHMENT]: {
    displayName: "Email Enrichment",
    category: "ACTION",
    integrationOwner: null,
    aliases: [
      "email enrichment", "enrich email", "email lookup",
      "verify email", "email validation"
    ],
    template: NODE_TEMPLATES.CIRCLE,
    connectionRules: {
      denyFromLink: false,
      denyToLink: false,
      maxInstances: null,
      allowedParents: ["*"],
      allowedChildren: ["*"],
      hasBranches: false,
    },
    safeOverrides: ["name", "description"],
  },
};

const DEFAULT_SETUPS = {
  [WorkflowNodeType.INPUT_SETUP]: INPUT_SETUP_DEFAULT,
  [WorkflowNodeType.WEBHOOK]: WEBHOOK_DEFAULT,
  [WorkflowNodeType.TIME_BASED_TRIGGER]: TIME_BASED_TRIGGER_DEFAULT,
  [WorkflowNodeType.SHEET_TRIGGER]: SHEET_TRIGGER_DEFAULT,
  [WorkflowNodeType.DATE_FIELD_TRIGGER]: DATE_FIELD_TRIGGER_DEFAULT,
  [WorkflowNodeType.FORM_TRIGGER]: FORM_TRIGGER_DEFAULT,
  [WorkflowNodeType.HTTP]: HTTP_DEFAULT,
  [WorkflowNodeType.TRANSFORMER]: TRANSFORMER_DEFAULT,
  [WorkflowNodeType.IF_ELSE_V2]: IF_ELSE_V2_DEFAULT,
  [WorkflowNodeType.DELAY]: DELAY_DEFAULT,
  [WorkflowNodeType.ITERATOR]: ITERATOR_DEFAULT,
  [WorkflowNodeType.ARRAY_AGGREGATOR]: ARRAY_AGGREGATOR_DEFAULT,
  [WorkflowNodeType.BREAK]: BREAK_DEFAULT,
  [WorkflowNodeType.SKIP]: SKIP_DEFAULT,
  [WorkflowNodeType.JUMP_TO]: JUMP_TO_DEFAULT,
  [WorkflowNodeType.LOG]: LOG_DEFAULT,
  [WorkflowNodeType.TINY_GPT]: TINY_GPT_DEFAULT,
  [WorkflowNodeType.TINY_GPT_RESEARCHER]: TINY_GPT_RESEARCHER_DEFAULT,
  [WorkflowNodeType.TINY_GPT_WRITER]: TINY_GPT_WRITER_DEFAULT,
  [WorkflowNodeType.TINY_GPT_ANALYZER]: TINY_GPT_ANALYZER_DEFAULT,
  [WorkflowNodeType.TINY_GPT_CREATIVE]: TINY_GPT_CREATIVE_DEFAULT,
  [WorkflowNodeType.TINY_GPT_SUMMARIZER]: TINY_GPT_SUMMARIZER_DEFAULT,
  [WorkflowNodeType.TINY_GPT_TRANSLATOR]: TINY_GPT_TRANSLATOR_DEFAULT,
  [WorkflowNodeType.TINY_GPT_LEARNING]: TINY_GPT_LEARNING_DEFAULT,
  [WorkflowNodeType.TINY_GPT_CONSULTANT]: TINY_GPT_CONSULTANT_DEFAULT,
  [WorkflowNodeType.CREATE_RECORD]: CREATE_RECORD_DEFAULT,
  [WorkflowNodeType.UPDATE_RECORD]: UPDATE_RECORD_DEFAULT,
  [WorkflowNodeType.DELETE_RECORD]: DELETE_RECORD_DEFAULT,
  [WorkflowNodeType.FIND_ONE]: FIND_ONE_DEFAULT,
  [WorkflowNodeType.FIND_ALL]: FIND_ALL_DEFAULT,
  [WorkflowNodeType.EXECUTE_QUERY]: EXECUTE_QUERY_DEFAULT,
  [WorkflowNodeType.CREATE_SHEET_RECORD]: CREATE_SHEET_RECORD_DEFAULT,
  [WorkflowNodeType.UPDATE_SHEET_RECORD]: UPDATE_SHEET_RECORD_DEFAULT,
  [WorkflowNodeType.DELETE_SHEET_RECORD]: DELETE_SHEET_RECORD_DEFAULT,
  [WorkflowNodeType.FIND_ONE_SHEET_RECORD]: FIND_ONE_SHEET_RECORD_DEFAULT,
  [WorkflowNodeType.FIND_ALL_SHEET_RECORD]: FIND_ALL_SHEET_RECORD_DEFAULT,
  [WorkflowNodeType.MATCH_PATTERN]: MATCH_PATTERN_DEFAULT,
  [WorkflowNodeType.TINY_SEARCH]: TINY_SEARCH_DEFAULT,
  [WorkflowNodeType.HITL]: HITL_DEFAULT,
  [WorkflowNodeType.SEND_EMAIL_TO_YOURSELF]: SEND_EMAIL_TO_YOURSELF_DEFAULT,
  [WorkflowNodeType.INTEGRATION]: INTEGRATION_DEFAULT,
  [WorkflowNodeType.PERSON_ENRICHMENT]: PERSON_ENRICHMENT_DEFAULT,
  [WorkflowNodeType.COMPANY_ENRICHMENT]: COMPANY_ENRICHMENT_DEFAULT,
  [WorkflowNodeType.EMAIL_ENRICHMENT]: EMAIL_ENRICHMENT_DEFAULT,
};

function buildWorkflowSchema() {
  const nodes = {};

  for (const [key, canonicalType] of Object.entries(WorkflowNodeType)) {
    const metadata = WORKFLOW_NODES_METADATA[canonicalType];
    const defaultSetup = DEFAULT_SETUPS[canonicalType];

    if (!metadata) {
      continue;
    }

    nodes[canonicalType] = {
      canonicalType,
      displayName: metadata.displayName,
      category: metadata.category,
      integrationOwner: metadata.integrationOwner,
      aliases: metadata.aliases,
      template: metadata.template,
      connectionRules: metadata.connectionRules,
      safeOverrides: metadata.safeOverrides,
      defaultSetup: defaultSetup || null,
    };
  }

  return nodes;
}

function buildAliasIndex(nodes) {
  const aliasIndex = {};

  for (const [type, nodeData] of Object.entries(nodes)) {
    for (const alias of nodeData.aliases) {
      const normalizedAlias = alias.toLowerCase().trim();
      if (!aliasIndex[normalizedAlias]) {
        aliasIndex[normalizedAlias] = [];
      }
      aliasIndex[normalizedAlias].push(type);
    }
  }

  return aliasIndex;
}

function getCategorySummary(nodes) {
  const summary = {
    TRIGGER: [],
    ACTION: [],
    CONTROL: [],
    INTEGRATION: [],
  };

  for (const [type, nodeData] of Object.entries(nodes)) {
    if (summary[nodeData.category]) {
      summary[nodeData.category].push(type);
    }
  }

  return summary;
}

function main() {
  console.log('Extracting workflow node schema...\n');

  const nodes = buildWorkflowSchema();
  const aliasIndex = buildAliasIndex(nodes);
  const categorySummary = getCategorySummary(nodes);

  const totalAliases = Object.values(nodes).reduce(
    (sum, node) => sum + node.aliases.length,
    0
  );

  const schema = {
    version: "1.0.0",
    extractedAt: new Date().toISOString(),
    source: "studio/src/components/canvas/extensions",
    stats: {
      totalNodeTypes: Object.keys(nodes).length,
      totalAliases,
      byCategory: {
        triggers: categorySummary.TRIGGER.length,
        actions: categorySummary.ACTION.length,
        control: categorySummary.CONTROL.length,
        integrations: categorySummary.INTEGRATION.length,
      },
    },
    categorySummary,
    nodes,
    aliasIndex,
  };

  const outputPath = path.join(__dirname, '../../server/src/schemas/workflow-nodes.json');
  const outputDir = path.dirname(outputPath);

  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  fs.writeFileSync(outputPath, JSON.stringify(schema, null, 2));

  console.log('Workflow schema extracted successfully!');
  console.log(`Output: ${outputPath}`);
  console.log(`\nStats:`);
  console.log(`  - Total node types: ${schema.stats.totalNodeTypes}`);
  console.log(`  - Total aliases: ${schema.stats.totalAliases}`);
  console.log(`  - Triggers: ${schema.stats.byCategory.triggers}`);
  console.log(`  - Actions: ${schema.stats.byCategory.actions}`);
  console.log(`  - Control: ${schema.stats.byCategory.control}`);
  console.log(`  - Integrations: ${schema.stats.byCategory.integrations}`);
  console.log(`\nNode types by category:`);
  console.log(`  TRIGGER: ${categorySummary.TRIGGER.join(', ')}`);
  console.log(`  CONTROL: ${categorySummary.CONTROL.join(', ')}`);
  console.log(`  INTEGRATION: ${categorySummary.INTEGRATION.join(', ')}`);
}

main();
