/**
 * Build node type prompt section from config.
 * Used by generate-flow-form and generate-flow prompts.
 */

import { configSchemaToPromptFormat } from "../common/config-schema-to-prompt.js";
import { PLACEHOLDER_NODE_TYPES } from "../common/placeholder-types.js";
import { SETUP_FORM_QUESTION_TYPES } from "../form/setup-form-question-types.js";
import { SETUP_SHARED_NODE_TYPES } from "../common/setup-shared-node-types.js";
import { SETUP_INTERNAL_TYPES } from "./setup-internal-types.js";

/** Form category display order and labels */
const FORM_CATEGORY_ORDER = [
  "TEXT_INPUT",
  "SELECTION",
  "DATES_TIME",
  "SPECIAL_INPUTS",
  "RATINGS_SCALES",
  "LAYOUT_DISPLAY",
  "ADVANCED",
  "PAYMENT",
  "OTHER",
];

const FORM_CATEGORY_LABELS = {
  TEXT_INPUT: "TEXT INPUT",
  SELECTION: "SELECTION",
  DATES_TIME: "DATES & TIME",
  SPECIAL_INPUTS: "SPECIAL INPUTS",
  RATINGS_SCALES: "RATINGS & SCALES",
  LAYOUT_DISPLAY: "LAYOUT & DISPLAY",
  ADVANCED: "ADVANCED",
  PAYMENT: "PAYMENT",
  OTHER: "OTHER",
};

/** Workflow group mapping for internal types (ACTIONS, AI_GPT, LOGIC, ENRICHMENT) */
const WORKFLOW_GROUP_MAP = {
  HTTP: "ACTIONS",
  TRANSFORMER_V3: "ACTIONS",
  SELF_EMAIL: "ACTIONS",
  CREATE_RECORD_V2: "ACTIONS",
  UPDATE_RECORD_V2: "ACTIONS",
  DB_FIND_ALL_V2: "ACTIONS",
  DB_FIND_ONE_V2: "ACTIONS",
  GPT: "AI_GPT",
  GPT_RESEARCHER: "AI_GPT",
  GPT_WRITER: "AI_GPT",
  GPT_ANALYZER: "AI_GPT",
  GPT_SUMMARIZER: "AI_GPT",
  GPT_TRANSLATOR: "AI_GPT",
  GPT_CREATIVE: "AI_GPT",
  GPT_LEARNING: "AI_GPT",
  GPT_CONSULTANT: "AI_GPT",
  IFELSE_V2: "LOGIC",
  ITERATOR_V2: "LOGIC",
  DELAY_V2: "LOGIC",
  PERSON_ENRICHMENT_V2: "ENRICHMENT",
  COMPANY_ENRICHMENT_V2: "ENRICHMENT",
};

const WORKFLOW_GROUP_LABELS = {
  ACTIONS: "ACTIONS",
  AI_GPT: "AI/GPT",
  LOGIC: "LOGIC",
  ENRICHMENT: "ENRICHMENT",
};

function formatNodeLine(type, shortDescription, configSchema) {
  const configStr = configSchemaToPromptFormat(configSchema || "");
  return `- "${type}" — ${shortDescription || type}. Config: ${configStr}`;
}

function isApplicableToCanvas(config, canvasType) {
  if (!canvasType) return true;
  const applicable = config?.applicableCanvases;
  if (!applicable || !Array.isArray(applicable)) return true;
  if (applicable.length === 0) return true;
  return applicable.includes(canvasType);
}

/**
 * Build node type prompt section for generate-flow prompts.
 * @param {object} options
 * @param {string} [options.canvasType] - Canvas type for filtering (e.g. WORKFLOW_CANVAS, WC_CANVAS)
 * @param {boolean} [options.includeFormQuestions] - Include form question types (Form canvas)
 * @param {boolean} [options.includeSharedNodes] - Include shared node types
 * @param {boolean} [options.includeWorkflowOnly] - Include workflow-only internal types
 * @param {boolean} [options.skipIfelseV2] - Skip IFELSE_V2 (handled by dedicated fragment)
 * @returns {string}
 */
export function buildNodeTypePromptSection(options = {}) {
  const {
    canvasType = null,
    includeFormQuestions = false,
    includeSharedNodes = false,
    includeWorkflowOnly = false,
    skipIfelseV2 = false,
  } = options;

  const lines = [];

  if (includeFormQuestions) {
    const formTypes = Object.entries(SETUP_FORM_QUESTION_TYPES)
      .filter(([type]) => !PLACEHOLDER_NODE_TYPES.includes(type))
      .filter(([, config]) => isApplicableToCanvas(config, canvasType))
      .map(([type, config]) => ({
        type,
        ...config,
        category: config.category || "OTHER",
      }));

    const byCategory = {};
    for (const item of formTypes) {
      const cat = item.category;
      if (!byCategory[cat]) byCategory[cat] = [];
      byCategory[cat].push(item);
    }

    for (const cat of FORM_CATEGORY_ORDER) {
      const items = byCategory[cat];
      if (!items || items.length === 0) continue;
      lines.push(`${FORM_CATEGORY_LABELS[cat] || cat}:`);
      for (const item of items) {
        lines.push(
          formatNodeLine(item.type, item.shortDescription, item.configSchema)
        );
      }
      lines.push("");
    }
  }

  if (includeSharedNodes) {
    const sharedTypes = Object.entries(SETUP_SHARED_NODE_TYPES)
      .filter(([type]) => !PLACEHOLDER_NODE_TYPES.includes(type))
      .filter(([type]) => !skipIfelseV2 || type !== "IFELSE_V2")
      .filter(([, config]) => isApplicableToCanvas(config, canvasType))
      .map(([type, config]) => ({
        type,
        shortDescription: config.shortDescription || config.instructions?.split(".")[0] || type,
        configSchema: config.configSchema,
      }));

    if (sharedTypes.length > 0) {
      if (includeFormQuestions) {
        lines.push("## SHARED NODE TYPES (Available on Form and Workflow)");
        lines.push("");
        lines.push("These nodes can be used in forms for data processing and logic:");
        lines.push("");
      }
      for (const item of sharedTypes) {
        lines.push(formatNodeLine(item.type, item.shortDescription, item.configSchema));
      }
      lines.push("");
    }
  }

  if (includeWorkflowOnly) {
    // Include all internal types applicable to workflow (shared types like HTTP are in both)
    const workflowTypes = Object.entries(SETUP_INTERNAL_TYPES)
      .filter(([type]) => !PLACEHOLDER_NODE_TYPES.includes(type))
      .filter(([, config]) => !config?.isPlaceholder)
      .filter(([, config]) => {
        const app = config?.applicableCanvases;
        if (!app || !Array.isArray(app)) return true;
        return app.includes("WC_CANVAS") || app.length === 0;
      })
      .map(([type, config]) => ({
        type,
        shortDescription: config.shortDescription || config.instructions?.split(".")[0] || type,
        configSchema: config.configSchema,
        group: WORKFLOW_GROUP_MAP[type] || "ACTIONS",
      }));

    const byGroup = {};
    for (const item of workflowTypes) {
      const g = item.group;
      if (!byGroup[g]) byGroup[g] = [];
      byGroup[g].push(item);
    }

    const groupOrder = ["ACTIONS", "AI_GPT", "LOGIC", "ENRICHMENT"];
    for (const g of groupOrder) {
      const items = byGroup[g];
      if (!items || items.length === 0) continue;
      lines.push(`${WORKFLOW_GROUP_LABELS[g] || g}:`);
      for (const item of items) {
        lines.push(
          formatNodeLine(item.type, item.shortDescription, item.configSchema)
        );
      }
      lines.push("");
    }
  }

  return lines.join("\n").trim();
}
