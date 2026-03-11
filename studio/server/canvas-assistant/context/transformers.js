/**
 * Context Transformers - Transform workflow context to AI-friendly format
 * 
 * Extracts relevant data from goJS format and removes unnecessary fluff.
 */

/**
 * Transform workflow context (nodes, links) to AI-friendly format
 * @param {object} workflowContext - Raw workflow context from frontend
 * @returns {object} - Transformed context
 */
export function transformWorkflowContext(workflowContext) {
  if (!workflowContext) {
    return null;
  }

  const transformed = {
    flowName: workflowContext.flowName || null,
    nodes: [],
    links: [],
    focusedNode: null,
    availableVariables: [],
    flowIssues: [],
    executionHistory: [],
    macroJourney: workflowContext.macroJourney || null,
    canvasType: workflowContext.canvasType ?? null,
  };

  // Transform nodes
  if (workflowContext.nodes && Array.isArray(workflowContext.nodes)) {
    transformed.nodes = workflowContext.nodes.map((node) => ({
      key: node.key,
      name: node.name,
      type: node.type,
      description: node.description,
      config: extractRelevantConfig(node.config),
      errors: node.errors || [],
      warnings: node.warnings || [],
      errorStrategy: node.errorStrategy,
      hasTestData: node.hasTestData || false,
    }));
  }

  // Transform links
  if (workflowContext.links && Array.isArray(workflowContext.links)) {
    transformed.links = workflowContext.links.map((link) => ({
      from: link.from || link.fromKey,
      to: link.to || link.toKey,
      fromName: link.fromName,
      toName: link.toName,
      label: link.label,
      isErrorLink: link.isErrorLink || false,
    }));
  }

  // Extract focused node
  if (workflowContext.focusedNode) {
    transformed.focusedNode = {
      key: workflowContext.focusedNode.key,
      name: workflowContext.focusedNode.name,
      type: workflowContext.focusedNode.type,
      config: extractRelevantConfig(workflowContext.focusedNode.config),
      errors: workflowContext.focusedNode.errors || [],
      warnings: workflowContext.focusedNode.warnings || [],
    };
  }

  // Extract available variables
  if (workflowContext.availableVariables && Array.isArray(workflowContext.availableVariables)) {
    transformed.availableVariables = workflowContext.availableVariables.slice(0, 20);
  }

  // Extract flow issues
  if (workflowContext.flowIssues && Array.isArray(workflowContext.flowIssues)) {
    transformed.flowIssues = workflowContext.flowIssues;
  }

  // Extract execution history
  if (workflowContext.executionHistory && Array.isArray(workflowContext.executionHistory)) {
    transformed.executionHistory = workflowContext.executionHistory.slice(0, 5);
  }

  return transformed;
}

/**
 * Extract relevant configuration from node config
 * Removes internal/fluff properties and keeps only what's useful for AI
 */
function extractRelevantConfig(config) {
  if (!config || typeof config !== "object") {
    return {};
  }

  const relevant = {};

  // Common config keys that are useful
  const relevantKeys = [
    "url",
    "method",
    "headers",
    "body",
    "subject",
    "body",
    "to",
    "prompt",
    "systemPrompt",
    "expression",
    "formula",
    "connectionId",
    "connection",
    "tableName",
    "sheetId",
    "conditions",
    "input",
    "inputs",
  ];

  for (const key of relevantKeys) {
    if (config[key] !== undefined && config[key] !== null) {
      if (typeof config[key] === "string" && config[key].length > 200) {
        // Truncate long strings
        relevant[key] = config[key].substring(0, 200) + "...";
      } else {
        relevant[key] = config[key];
      }
    }
  }

  return relevant;
}

/**
 * Detect existing triggers in workflow
 * @param {object} workflowContext - Transformed workflow context
 * @returns {Array} - Array of trigger nodes
 */
export function detectExistingTriggers(workflowContext) {
  if (!workflowContext || !workflowContext.nodes) {
    return [];
  }

  const triggerTypes = [
    "TRIGGER_SETUP_V3",
    "TRIGGER_SETUP",
    "TRIGGER_SETUP_NODE",
    "FORM_TRIGGER",
    "CUSTOM_WEBHOOK",
    "WEBHOOK_V2",
    "TIME_BASED_TRIGGER_V2",
    "TIME_BASED_TRIGGER",
    "SHEET_TRIGGER_V2",
    "SHEET_TRIGGER",
    "SHEET_DATE_FIELD_TRIGGER",
  ];

  return workflowContext.nodes.filter((node) =>
    triggerTypes.includes(node.type)
  );
}

/**
 * Build context block string for prompts
 * @param {object} workflowContext - Transformed workflow context
 * @returns {string} - Formatted context block
 */
export function buildContextBlock(workflowContext) {
  if (!workflowContext) return "";

  const parts = [];

  if (workflowContext.canvasType) {
    parts.push("**Canvas type:** " + (workflowContext.canvasType === "WORKFLOW_CANVAS" ? "Form canvas" : workflowContext.canvasType));
  }

  if (workflowContext.flowName) {
    parts.push(`**Workflow Name:** "${workflowContext.flowName}"`);
  }

  if (workflowContext.nodes?.length) {
    parts.push(`**Nodes (${workflowContext.nodes.length}):**`);
    workflowContext.nodes.forEach((node, i) => {
      const friendlyType = getFriendlyTypeName(node.type);
      const name = node.name || friendlyType || "Unnamed";

      let configSummary = "";
      if (node.config && Object.keys(node.config).length > 0) {
        const configParts = [];
        if (node.config.url) configParts.push(`url: "${node.config.url}"`);
        if (node.config.method) configParts.push(`method: ${node.config.method}`);
        if (node.config.prompt) configParts.push(`prompt: "${String(node.config.prompt).substring(0, 100)}..."`);
        if (node.config.systemPrompt) configParts.push(`system prompt set`);
        if (node.config.connectionId || node.config.connection) configParts.push(`connection: configured`);
        if (node.config.expression) configParts.push(`expression set`);
        if (node.config.formula) configParts.push(`formula set`);
        if (node.config.subject) configParts.push(`subject: "${node.config.subject}"`);
        if (node.config.body) configParts.push(`body set`);
        if (node.config.input || node.config.inputs) configParts.push(`input configured`);
        if (node.config.sheetId) configParts.push(`sheet connected`);
        if (node.config.tableName) configParts.push(`table: ${node.config.tableName}`);
        if (configParts.length) configSummary = ` | config: {${configParts.join(", ")}}`;
      }

      let validationInfo = "";
      if (node.errors?.length) {
        validationInfo += ` | ERRORS: [${node.errors.join(", ")}]`;
      }
      if (node.warnings?.length) {
        validationInfo += ` | WARNINGS: [${node.warnings.join(", ")}]`;
      }

      let errorHandling = "";
      if (node.errorStrategy) {
        errorHandling = ` | onError: ${node.errorStrategy}`;
      }

      let testData = "";
      if (node.hasTestData) {
        testData = ` | has test output`;
      }

      parts.push(`  ${i + 1}. "${name}" (${friendlyType}${configSummary}${validationInfo}${errorHandling}${testData})`);
    });
  }

  if (workflowContext.links?.length) {
    parts.push(`\n**Connections (${workflowContext.links.length}):**`);
    workflowContext.links.forEach((link) => {
      const from = link.fromName || link.from || "?";
      const to = link.toName || link.to || "?";
      const label = link.label ? ` [${link.label}]` : "";
      const isError = link.isErrorLink ? " (error route)" : "";
      parts.push(`  - ${from} → ${to}${label}${isError}`);
    });
  }

  let flowIssuesToShow = workflowContext.flowIssues ?? [];
  if (workflowContext.canvasType === "WORKFLOW_CANVAS") {
    flowIssuesToShow = flowIssuesToShow.filter((issue) => !/trigger/i.test(issue));
  }
  if (flowIssuesToShow.length) {
    parts.push(`\n**Flow Issues Detected:**`);
    flowIssuesToShow.forEach((issue) => {
      parts.push(`  ⚠️ ${issue}`);
    });
  }

  if (workflowContext.executionHistory?.length) {
    parts.push(`\n**Recent Executions:**`);
    workflowContext.executionHistory.slice(0, 5).forEach((exec) => {
      const status = exec.status || "unknown";
      const duration = exec.duration ? ` (${exec.duration})` : "";
      const failedNode = exec.failedNode ? ` — failed at: "${exec.failedNode}"` : "";
      const error = exec.error ? ` — error: "${String(exec.error).substring(0, 200)}"` : "";
      parts.push(`  - ${status}${duration}${failedNode}${error}`);
    });
  }

  if (workflowContext.focusedNode) {
    const fn = workflowContext.focusedNode;
    const friendlyType = getFriendlyTypeName(fn.type);
    parts.push(`\n**Currently Selected Node:** "${fn.name || friendlyType}" (${friendlyType})`);
    if (fn.errors?.length) {
      parts.push(`  Errors: ${fn.errors.join(", ")}`);
    }
    if (fn.warnings?.length) {
      parts.push(`  Warnings: ${fn.warnings.join(", ")}`);
    }
    if (fn.config && Object.keys(fn.config).length > 0) {
      const configKeys = Object.keys(fn.config).filter(k => fn.config[k]).slice(0, 5);
      if (configKeys.length) {
        parts.push(`  Config: ${configKeys.join(", ")} configured`);
      }
    }
  }

  if (workflowContext.availableVariables?.length) {
    parts.push(`\n**Available Variables (from previous steps):**`);
    workflowContext.availableVariables.slice(0, 20).forEach((v) => {
      parts.push(`  - {{${v.path}}} (${v.type || "any"})`);
    });
  }

  if (workflowContext.macroJourney) {
    parts.push(`\n**Macro journey (workflow goal):** ${workflowContext.macroJourney}`);
  }

  if (parts.length === 0) return "";
  return "\n\n---\n[USER'S CURRENT WORKFLOW CONTEXT]\n" + parts.join("\n");
}

/**
 * Get friendly type name from internal type
 */
function getFriendlyTypeName(type) {
  const FRIENDLY_NAMES = {
    TRIGGER_SETUP_V3: "Manual Trigger",
    TRIGGER_SETUP: "Manual Trigger",
    TRIGGER_SETUP_NODE: "Manual Trigger",
    FORM_TRIGGER: "Form Trigger",
    CUSTOM_WEBHOOK: "Webhook Trigger",
    WEBHOOK_V2: "Webhook Trigger",
    TIME_BASED_TRIGGER_V2: "Schedule Trigger",
    TIME_BASED_TRIGGER: "Schedule Trigger",
    SHEET_TRIGGER_V2: "Sheet Trigger",
    SHEET_TRIGGER: "Sheet Trigger",
    SHEET_DATE_FIELD_TRIGGER: "Sheet Date Trigger",
    HTTP: "HTTP Request",
    TRANSFORMER_V3: "Data Transformer",
    TRANSFORMER: "Data Transformer",
    SELF_EMAIL: "Send Email",
    CREATE_RECORD_V2: "Create Record",
    UPDATE_RECORD_V2: "Update Record",
    DB_FIND_ALL_V2: "Find All Records",
    DB_FIND_ONE_V2: "Find One Record",
    DELETE_RECORD_V2: "Delete Record",
    GPT: "AI Text Generator",
    GPT_RESEARCHER: "AI Researcher",
    GPT_WRITER: "AI Writer",
    GPT_ANALYZER: "AI Analyzer",
    GPT_SUMMARIZER: "AI Summarizer",
    IFELSE_V2: "If/Else",
    ITERATOR_V2: "Iterator",
    DELAY_V2: "Delay",
  };

  return FRIENDLY_NAMES[type] || (type || "Step").replace(/_/g, " ").replace(/\bV\d+$/i, "").replace(/\b\w/g, c => c.toUpperCase()).trim() || "Step";
}
