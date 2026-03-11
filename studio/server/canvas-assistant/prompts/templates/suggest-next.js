/**
 * Suggest Next Prompt Template
 * Used for suggesting next nodes in the workflow
 */
const DEFAULT_SUGGEST_NEXT_BAR_TYPES = [
  "TRIGGER_SETUP_V3", "FORM_TRIGGER", "CUSTOM_WEBHOOK", "TIME_BASED_TRIGGER_V2", "SHEET_TRIGGER_V2",
  "HTTP", "TRANSFORMER_V3", "SELF_EMAIL",
  "CREATE_RECORD_V2", "UPDATE_RECORD_V2", "DB_FIND_ALL_V2", "DB_FIND_ONE_V2",
  "GPT", "GPT_RESEARCHER", "GPT_WRITER", "GPT_ANALYZER", "GPT_SUMMARIZER",
  "IFELSE_V2", "ITERATOR_V2", "DELAY_V2",
  "PERSON_ENRICHMENT_V2", "COMPANY_ENRICHMENT_V2",
];

export default function suggestNextPrompt(variables = {}) {
  const { suggestNextBarTypes } = variables;
  const typesList = Array.isArray(suggestNextBarTypes) && suggestNextBarTypes.length > 0
    ? suggestNextBarTypes
    : DEFAULT_SUGGEST_NEXT_BAR_TYPES;
  const typesListStr = typesList.join(", ");

  return `Based on the user's current workflow context below, do the following:

1. Write a short 2-line plain-English summary of what you think they are trying to build (max 2 sentences, friendly tone).
2. Infer their workflow goal (e.g., "lead capture", "content pipeline", "notification system", "data enrichment", etc.). Return as a single short phrase.
3. Assess whether that goal appears to be met based on the existing nodes and connections.
4. Suggest node types to add. If the goal is already met, return an empty array. Otherwise, suggest exactly 2 next node types they would likely add. Use only the internal type IDs from this list: ${typesListStr}.
5. Optionally, for the FIRST suggested node type only, include "suggestedConfig": an object with config keys for that node type (e.g. for HTTP: url, method; for SELF_EMAIL: subject, body, to). Use {{StepName.field}} for values from previous steps when relevant. Omit suggestedConfig if you cannot infer sensible values.
6. Optionally, include "connectionHints": array of { "from": "nodeKey or 'last'", "to": "nodeKey or 'new'", "label": "optional" } to suggest how to connect the new node. Omit if not needed.

Return ONLY a JSON object with these keys:
- "intentSummary": string
- "inferredGoal": string (max 50 chars)
- "goalMet": boolean
- "suggestedNodeTypes": array of strings (empty if goalMet is true, otherwise exactly 2 node type IDs)
- "suggestedConfig": object (optional, for first suggested node only)
- "connectionHints": array (optional)

Example: {"intentSummary":"You're building a lead capture flow.","inferredGoal":"lead capture","goalMet":false,"suggestedNodeTypes":["IFELSE_V2","CREATE_RECORD_V2"],"suggestedConfig":{},"connectionHints":[{"from":"last","to":"new","label":null}]}
Example when goal is met: {"intentSummary":"Your workflow is complete.","inferredGoal":"form notifications","goalMet":true,"suggestedNodeTypes":[]}`;
}
