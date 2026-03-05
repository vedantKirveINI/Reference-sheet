/**
 * Node utilities for canvas assistant: pure helpers for node resolution, trigger config, disambiguation.
 * No React dependencies.
 */

import { NODE_TEMPLATES } from "../../canvas/templates/nodeTemplates";
import {
  TIME_BASED_TRIGGER,
  INPUT_SETUP_TYPE,
  WEBHOOK_TYPE,
  FORM_TRIGGER,
  SHEET_TRIGGER,
  SHEET_DATE_FIELD_TRIGGER,
} from "../../canvas/extensions/constants/types";
import { QUESTIONS_NODES } from "../../canvas/extensions/question-setup/constants/questionNodes";
import { TRANSFORMER_NODE } from "../../canvas/extensions/transformer/constants";
import { HTTP_NODE } from "../../canvas/extensions/http/constants";
import { IF_ELSE_NODE_V2 } from "../../canvas/extensions/if-else-v2/constants";
import { CREATE_RECORD_V2_NODE as CREATE_RECORD_NODE } from "../../canvas/extensions/crud-operations/create-record/constants";
import { UPDATE_RECORD_V2_NODE as UPDATE_RECORD_NODE } from "../../canvas/extensions/crud-operations/update-record/constants";
import { DELETE_V2_NODE as DELETE_RECORD_NODE } from "../../canvas/extensions/crud-operations/delete-record/constants";
import { FIND_ALL_V2_NODE as FIND_ALL_RECORD_NODE } from "../../canvas/extensions/crud-operations/find-all/constants";
import { FIND_ONE_V2_NODE as FIND_ONE_RECORD_NODE } from "../../canvas/extensions/crud-operations/find-one/constants";
import { EXECUTE_V2_NODE as EXECUTE_QUERY_NODE } from "../../canvas/extensions/crud-operations/execute-query/constants";
import DELAY_NODE from "../../canvas/extensions/delay/constant";
import ITERATOR_NODE from "../../canvas/extensions/iterator/constant";
import { TINYGPT_NODE } from "../../canvas/extensions/tiny-gpt/constants";
import TINYGPT_RESEARCHER_NODE from "../../canvas/extensions/tiny-gpt-researcher/constant";
import TINYGPT_WRITER_NODE from "../../canvas/extensions/tiny-gpt-writer/constant";
import { TINYGPT_ANALYZER_V2_NODE as TINYGPT_ANALYZER_NODE } from "../../canvas/extensions/tiny-gpt-analyzer/constants";
import { TINYGPT_SUMMARIZER_V2_NODE as TINYGPT_SUMMARIZER_NODE } from "../../canvas/extensions/tiny-gpt-summarizer/constants";
import { TINYGPT_TRANSLATOR_V2_NODE as TINYGPT_TRANSLATOR_NODE } from "../../canvas/extensions/tiny-gpt-translator/constants";
import { TINYGPT_LEARNING_V2_NODE as TINYGPT_LEARNING_NODE } from "../../canvas/extensions/tiny-gpt-learning/constants";
import { TINYGPT_CONSULTANT_V2_NODE as TINYGPT_CONSULTANT_NODE } from "../../canvas/extensions/tiny-gpt-consultant/constants";
import { TINYGPT_CREATIVE_V2_NODE as TINYGPT_CREATIVE_NODE } from "../../canvas/extensions/tiny-gpt-creative/constants";
import { SEND_EMAIL_TO_YOURSELF_V2_NODE as SEND_EMAIL_NODE } from "../../canvas/extensions/send-email-to-yourself-v2/constants";
import { PERSON_ENRICHMENT_V2_NODE as PERSON_ENRICHMENT_NODE } from "../../canvas/extensions/enrichment/person/constants";
import { EMAIL_ENRICHMENT_V2_NODE as EMAIL_ENRICHMENT_NODE } from "../../canvas/extensions/enrichment/email/constants";
import { COMPANY_ENRICHMENT_V2_NODE as COMPANY_ENRICHMENT_NODE } from "../../canvas/extensions/enrichment/company/constants";
import LOG_NODE from "../../canvas/extensions/log/constant";
import SKIP_NODE from "../../canvas/extensions/skip/constant";
import BREAK_NODE from "../../canvas/extensions/break/constant";
import MATCH_PATTERN_NODE from "../../canvas/extensions/text-parsers/match-pattern/constant";
import { FOR_EACH_NODE } from "../../canvas/extensions/for-each/constants";
import { REPEAT_NODE } from "../../canvas/extensions/repeat/constants";
import { LOOP_UNTIL_NODE } from "../../canvas/extensions/loop-until/constants";
import { LOOP_END_NODE } from "../../canvas/extensions/loop-end/constants";
import WEBHOOK_NODE from "../../canvas/extensions/webhook/constant";
import FORMULA_FX_NODE from "../../canvas/extensions/formula-fx/constant";
import { JUMP_TO_V2_NODE } from "../../canvas/extensions/jump-to-v2/constants";

export const FORM_NODE_REGISTRY = Object.keys(QUESTIONS_NODES || {}).reduce((acc, k) => {
  const n = QUESTIONS_NODES[k];
  if (n && n.type) acc[n.type] = { type: n.type, template: n.template, _src: n._src || "" };
  return acc;
}, {});

export const NODE_REGISTRY = {
  ...FORM_NODE_REGISTRY,
  HTTP: HTTP_NODE,
  TRANSFORMER_V3: TRANSFORMER_NODE,
  IFELSE_V2: IF_ELSE_NODE_V2,
  CREATE_RECORD_V2: CREATE_RECORD_NODE,
  UPDATE_RECORD_V2: UPDATE_RECORD_NODE,
  DELETE_RECORD_V2: DELETE_RECORD_NODE,
  DB_FIND_ALL_V2: FIND_ALL_RECORD_NODE,
  DB_FIND_ONE_V2: FIND_ONE_RECORD_NODE,
  EXECUTE_QUERY_V2: EXECUTE_QUERY_NODE,
  DELAY_V2: DELAY_NODE,
  ITERATOR_V2: ITERATOR_NODE,
  GPT: TINYGPT_NODE,
  GPT_RESEARCHER: TINYGPT_RESEARCHER_NODE,
  GPT_WRITER: TINYGPT_WRITER_NODE,
  GPT_ANALYZER: TINYGPT_ANALYZER_NODE,
  GPT_SUMMARIZER: TINYGPT_SUMMARIZER_NODE,
  GPT_TRANSLATOR: TINYGPT_TRANSLATOR_NODE,
  GPT_LEARNING: TINYGPT_LEARNING_NODE,
  GPT_CONSULTANT: TINYGPT_CONSULTANT_NODE,
  GPT_CREATIVE: TINYGPT_CREATIVE_NODE,
  SELF_EMAIL: SEND_EMAIL_NODE,
  FORMULA_FX: FORMULA_FX_NODE,
  JUMP_TO: JUMP_TO_V2_NODE,
  PERSON_ENRICHMENT_V2: PERSON_ENRICHMENT_NODE,
  COMPANY_ENRICHMENT_V2: COMPANY_ENRICHMENT_NODE,
  EMAIL_ENRICHMENT_V2: EMAIL_ENRICHMENT_NODE,
  LOG: LOG_NODE,
  SKIP: SKIP_NODE,
  BREAK: BREAK_NODE,
  MATCH_PATTERN: MATCH_PATTERN_NODE,
  FOR_EACH: FOR_EACH_NODE,
  REPEAT: REPEAT_NODE,
  LOOP_UNTIL: LOOP_UNTIL_NODE,
  LOOP_END: LOOP_END_NODE,
  CUSTOM_WEBHOOK: WEBHOOK_NODE,
};

/** Backend type strings for the first node (trigger). Only one trigger per workflow. */
export const TRIGGER_BACKEND_TYPES = new Set([
  "TRIGGER_SETUP_V3",
  "TIME_BASED_TRIGGER_V2",
  "TIME_BASED_TRIGGER",
  "CUSTOM_WEBHOOK",
  "FORM_TRIGGER",
  "SHEET_TRIGGER_V2",
  "SHEET_TRIGGER",
  "SHEET_DATE_FIELD_TRIGGER",
]);

/**
 * Parse user reply when disambiguating delete: both/all, indices (1, 2 and 3), or name/description phrases.
 * @param {Array<{ key: string, name?: string, text?: string, description?: string, type?: string }>} candidates
 * @param {string} reply
 * @returns {{ keys: string[], labels: string[] } | null}
 */
export function parseDisambiguationReply(candidates, reply) {
  if (!candidates?.length || !reply?.trim()) return null;
  const getLabel = (c) => (c.name || c.text || c.description || c.type || c.key || "?").trim();

  // both / all / everything -> all candidates
  if (/\b(both|all|everything)\b/i.test(reply)) {
    return {
      keys: candidates.map((c) => c.key),
      labels: candidates.map(getLabel),
    };
  }

  // indices: 1, 2 and 3, 1 and 2, etc. (1-based)
  const indexMatches = reply.match(/\b\d+\b/g);
  if (indexMatches?.length) {
    const indices = [...new Set(indexMatches.map((s) => parseInt(s, 10)))].filter(
      (i) => i >= 1 && i <= candidates.length
    );
    if (indices.length) {
      const keys = indices.map((i) => candidates[i - 1].key);
      const labels = indices.map((i) => getLabel(candidates[i - 1]));
      return { keys, labels };
    }
  }

  // name/description: split by "and", ",", ";" and match each phrase
  const phrases = reply
    .split(/\s+and\s+|\s*,\s*|\s*;\s*/i)
    .map((p) => p.trim().toLowerCase())
    .filter(Boolean);
  if (phrases.length) {
    const matchedKeys = new Set();
    const matchedLabels = [];
    for (const phrase of phrases) {
      if (!phrase) continue;
      const found = candidates.find((c) => {
        const name = (c.name || "").toLowerCase();
        const text = (c.text || "").toLowerCase();
        const desc = (c.description || "").toLowerCase();
        const type = (c.type || "").toLowerCase();
        return (
          (name && (name.includes(phrase) || phrase.includes(name))) ||
          (text && (text.includes(phrase) || phrase.includes(text))) ||
          (desc && (desc.includes(phrase) || phrase.includes(desc))) ||
          (type && (type.includes(phrase) || phrase.includes(type)))
        );
      });
      if (found && !matchedKeys.has(found.key)) {
        matchedKeys.add(found.key);
        matchedLabels.push(getLabel(found));
      }
    }
    if (matchedKeys.size) {
      return {
        keys: [...matchedKeys],
        labels: matchedLabels,
      };
    }
  }

  return null;
}

/** First node in Form chain (node with no incoming link). */
export function getFormFirstNode(nodes, links) {
  if (!nodes?.length) return null;
  const withIncoming = new Set((links || []).map((l) => l.to || l.toKey));
  return nodes.find((n) => !withIncoming.has(n.key || n.id)) || null;
}

/**
 * Normalize AI-provided config for a Form question node so it can be deep-merged over defaults.
 * Returns a plain object (never null) so drawer contract go_data is always populated.
 * @param {string} backendType - e.g. SHORT_TEXT, HTTP, etc.
 * @returns {{ frontendType: string, template: string, _src: string } | null}
 */
export function resolveNodeDefaults(backendType) {
  const nodeDef = NODE_REGISTRY[backendType];
  if (!nodeDef) return null;
  return {
    frontendType: nodeDef.type,
    template: nodeDef.template ?? NODE_TEMPLATES.CIRCLE,
    _src: nodeDef._src || "",
  };
}

/** Map backend trigger type to frontend type (go_data.triggerType and node.type for trigger-setup). */
export function getFrontendTriggerType(backendType) {
  const map = {
    TRIGGER_SETUP_V3: INPUT_SETUP_TYPE,
    TIME_BASED_TRIGGER_V2: TIME_BASED_TRIGGER,
    TIME_BASED_TRIGGER: TIME_BASED_TRIGGER,
    CUSTOM_WEBHOOK: WEBHOOK_TYPE,
    FORM_TRIGGER: FORM_TRIGGER,
    SHEET_TRIGGER_V2: SHEET_TRIGGER,
    SHEET_TRIGGER: SHEET_TRIGGER,
    SHEET_DATE_FIELD_TRIGGER: SHEET_DATE_FIELD_TRIGGER,
  };
  return map[backendType] || backendType;
}

/** Build go_data for the single trigger node from the first generated node (for Trigger Setup UI). */
export function buildTriggerGoData(firstNode) {
  const triggerType = getFrontendTriggerType(firstNode.type);
  const config = firstNode.config || {};
  const tz = config.timezone || Intl?.DateTimeFormat?.().resolvedOptions?.()?.timeZone || "UTC";

  if (triggerType === TIME_BASED_TRIGGER) {
    const scheduleType = config.scheduleType || "daily";
    const time = config.time || "12:00";
    const [h = "12", m = "0"] = time.split(":");
    const interval = config.interval || { value: 15, unit: "minutes" };
    const weekdays = config.weekdays ?? [1, 2, 3, 4, 5];
    const dayOfMonth = config.dayOfMonth ?? "1";
    const legacyRunScenario = scheduleType === "interval" ? "AT_REGULAR_INTERVALS" : (scheduleType || "interval").toUpperCase();
    return {
      triggerType: TIME_BASED_TRIGGER,
      scheduleType,
      time,
      timezone: tz,
      interval,
      weekdays,
      dayOfMonth,
      customDates: config.customDates || [],
      onceDate: config.onceDate ?? null,
      advanced: config.advanced || { startDate: null, endDate: null, advancedWeekdays: [0, 1, 2, 3, 4, 5, 6] },
      summary: config.summary || "",
      frequency: scheduleType === "daily" ? "day" : scheduleType === "weekly" ? "week" : scheduleType === "monthly" ? "month" : "day",
      minute: m,
      hour: h,
      minutes: interval?.value ?? 15,
      runScenario: legacyRunScenario,
      dayOfWeek: "monday",
      startDate: null,
      endDate: null,
    };
  }

  if (triggerType === WEBHOOK_TYPE) {
    return {
      triggerType: WEBHOOK_TYPE,
      method: config.method || "POST",
      timezone: tz,
    };
  }

  if (triggerType === FORM_TRIGGER || triggerType === SHEET_TRIGGER || triggerType === SHEET_DATE_FIELD_TRIGGER) {
    return {
      triggerType,
      ...config,
      timezone: tz,
    };
  }

  return {
    triggerType: triggerType || INPUT_SETUP_TYPE,
    timezone: tz,
  };
}
