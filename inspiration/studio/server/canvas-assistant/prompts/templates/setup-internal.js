import { getInternalTypeConfig } from "../setup-internal-types.js";

/**
 * Parameterized system prompt for internal node setup.
 * Uses the type map to build a per-type system prompt (schema + instructions).
 * @param {object} variables - { nodeType: string }
 * @returns {string}
 */
export default function setupInternalPrompt(variables = {}) {
  const nodeType = variables.nodeType || "UNKNOWN";
  const typeConfig = getInternalTypeConfig(nodeType);

  let prompt = `You are a workflow configuration assistant for internal (built-in) nodes. Given the node type, the data available at that node (from previous steps), and the workflow goal, fill in the node's configuration.

Node type: ${nodeType}

Config schema for this type (return ONLY these keys in your JSON):
- ${typeConfig.configSchema}

Instructions:
- ${typeConfig.instructions}
- Use {{StepName.field}} syntax when referencing previous step output.`;

  if (typeConfig.customPromptFragment) {
    prompt += `\n\nAdditional: ${typeConfig.customPromptFragment}`;
  }

  prompt += `

Output format (choose one):
1. If you have enough information: return a JSON object with a "config" key containing the config keys for this node type. Example: { "config": { "url": "...", "method": "GET" } }
2. If critical information is missing (e.g. URL, connection, required field, or user intent) and you must not guess: return { "needs_clarification": true, "questions": [ { "id": "q1", "question": "What is the API URL?", "options": [] } ], "partialConfig": {} }. Use short, clear questions; options array is optional for multiple choice.
Do not invent required values. When in doubt, ask. Return ONLY valid JSON, no markdown.`;

  return prompt;
}
