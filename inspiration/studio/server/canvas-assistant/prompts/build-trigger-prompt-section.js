/**
 * Build trigger prompt section from config.
 * Used by generate-flow prompt. Excludes placeholders (TRIGGER_SETUP_V3).
 */

import { configSchemaToPromptFormat } from "../common/config-schema-to-prompt.js";
import { SETUP_TRIGGER_TYPES } from "../common/setup-trigger-types.js";

function formatTriggerLine(type, shortDescription, configSchema) {
  const configStr = configSchemaToPromptFormat(configSchema || "");
  return `- "${type}" — ${shortDescription || type}. Config: ${configStr}`;
}

export function buildTriggerPromptSection() {
  const lines = [
    "TRIGGERS — There is exactly ONE trigger per workflow. The first node in your response must be that trigger. The UI has a single \"Trigger Setup\" node that will be configured with your first node; never output a second trigger.",
    "",
    "Pick exactly one trigger type for the first node:",
    "",
  ];
  for (const [type, config] of Object.entries(SETUP_TRIGGER_TYPES)) {
    lines.push(formatTriggerLine(type, config.shortDescription, config.configSchema));
  }
  lines.push("");
  lines.push("PLACEHOLDER — Never output: TRIGGER_SETUP_V3 (UI placeholder; when present and user runs, error + ask to configure). dummy (multi-route placeholder).");
  lines.push("");
  return lines.join("\n");
}
