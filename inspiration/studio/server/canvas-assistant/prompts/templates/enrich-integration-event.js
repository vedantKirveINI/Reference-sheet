/**
 * Enrichment prompt for a single integration event (trigger or action).
 * Used by server/scripts/enrich-integrations.js to produce LLM-enriched fields
 * for integration_knowledge_v2. Output must be valid JSON only (no markdown).
 *
 * Expected output keys:
 * - enriched_description: string (2-3 sentences)
 * - use_cases: string[] (3-5 items)
 * - keywords: string[] (10-15 terms)
 * - aliases: string[] (5-8 alternative names)
 * - category_tags: string[] (3-5 categories)
 * - intent_patterns: string[] (5-10 example intents)
 * - common_queries: string[] (5-8 natural-language search queries)
 */

export const ENRICHMENT_OUTPUT_KEYS = [
  "enriched_description",
  "use_cases",
  "keywords",
  "aliases",
  "category_tags",
  "intent_patterns",
  "common_queries",
];

export function getEnrichIntegrationEventSystemPrompt() {
  return `You are an expert at describing workflow integrations for a workflow builder. Output valid JSON only. No markdown, no code fences, no explanation—only a single JSON object with the exact keys requested.`;
}

/**
 * @param {object} variables - { title, description, annotation, integration_slug, event_slug, kind, input_schema_summary, output_schema_summary [, raw_snippet ] }
 * @returns {string} User message content for the enrichment request
 */
export default function enrichIntegrationEventPrompt(variables = {}) {
  const {
    title = "",
    description = "",
    annotation = "",
    integration_slug = "",
    event_slug = "",
    kind = "",
    input_schema_summary = "",
    output_schema_summary = "",
    raw_snippet = "",
  } = variables;

  const schemaPart = [input_schema_summary, output_schema_summary].filter(Boolean).join("\n- Output schema: ");
  const schemaBlock = schemaPart
    ? `\n- Input schema summary: ${schemaPart}`
    : "";
  const rawBlock = raw_snippet ? `\n- Raw snippet (optional context):\n${raw_snippet}` : "";

  return `Enrich this workflow integration event for search and discovery.

Integration/event context:
- title: ${title}
- description: ${description}
- annotation: ${annotation}
- integration_slug: ${integration_slug}
- event_slug: ${event_slug}
- kind: ${kind}${schemaBlock}${rawBlock}

Return a single JSON object with exactly these keys (all arrays of strings except enriched_description):
- enriched_description: 2-3 sentences describing what this integration/event does and when to use it.
- use_cases: array of 3-5 short use-case strings.
- keywords: 10-15 terms (product name, synonyms, related concepts; e.g. slack, messaging, channel, post, notify).
- aliases: 5-8 alternative names or phrases for this action/trigger.
- category_tags: 3-5 categories (e.g. messaging, communication, notifications, team-collaboration).
- intent_patterns: 5-10 example user intents (e.g. "send message to Slack", "post to channel").
- common_queries: 5-8 natural-language search queries that should match this integration.

Output only the JSON object, no other text.`;
}
