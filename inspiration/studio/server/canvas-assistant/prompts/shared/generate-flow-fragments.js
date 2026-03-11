/**
 * Shared prompt fragments for generate-flow prompts (Form and Workflow).
 * Each export is a function that returns a string fragment.
 */

/**
 * IFELSE_V2 section: config format, operators, branch structure.
 * @param {object} options
 * @param {string} options.exampleJson - Canvas-specific example JSON block (form vs workflow)
 * @returns {string}
 */
export function getIfelseV2Fragment(options = {}) {
  const { exampleJson } = options;
  const example = exampleJson || "";

  return `## IFELSE_V2 (Conditional Branching)

When the user asks for a condition (e.g. "if age > 18 then X else Y"), return an IFELSE_V2 node followed by exactly 2 branch nodes.

**Config format:** Include a "config" object with a "conditions" array. Each condition: { field, operator, value }
- field: Reference to the variable to check. Use {{StepName.field}} syntax for previous step output (e.g. {{Age.age}} for a step named "Age" with field "age")
- operator: One of "gt" (greater than), "lt" (less than), "gte" (>=), "lte" (<=), "equals", "isEmpty", "isNotEmpty", "contains"
- value: The value to compare against (number, string, or array depending on operator)

**Branch structure:** The next 2 nodes after IFELSE_V2 are the true and false branches. Add "branch": "true" to the first branch node and "branch": "false" to the second. This tells the frontend how to wire the links.

**Example:**
\`\`\`json
${example}
\`\`\``;
}

/**
 * EXTERNAL INTEGRATIONS section.
 * @param {object} options
 * @param {'form'|'workflow'} options.canvasTerm - Drives "form flow" vs "workflow" wording
 * @param {string} [options.extraSearchHints] - Optional workflow-specific bullet list (e.g. "For example:" bullets)
 * @returns {string}
 */
export function getExternalIntegrationsFragment(options = {}) {
  const { canvasTerm = "form", extraSearchHints = "" } = options;

  const flowLabel = canvasTerm === "form" ? "form flow" : "workflow";
  const flowAction = canvasTerm === "form" ? "form flow" : "workflow";

  let text = `## EXTERNAL INTEGRATIONS

The platform supports many external integrations (Slack, Gmail, SendGrid, Stripe, etc.) that can be used in ${canvasTerm === "form" ? "forms" : "workflows"}. These integrations are stored in a knowledge base and can be discovered using available tools.

**IMPORTANT:** Before generating the ${flowLabel}, use the searchAllExtensions or searchExternalExtensions tools to discover relevant integrations mentioned in the user's request. When the user's intent is ambiguous (e.g. "send a message"), call the search tool first to get ranked matches.`;

  if (extraSearchHints) {
    text += ` ${extraSearchHints}`;
  }

  text += `

Search results include inputSchema and output_schema (or input_schema). Use these to populate the node's "config" field with keys that match the schema.`;

  if (canvasTerm === "workflow") {
    text += ` You may also call getExtensionKnowledge(workflow_node_identifier) after choosing an integration to get the full schema and description for that node, then set "config" accurately from the returned inputSchema and outputSchema (or from config_key_summary if present).`;
  }

  text += `

After discovering integrations:
1. Use the workflow_node_identifier from the search results as the node "type" in your response (e.g. "external/slack/action/create-a-message")`;

  if (canvasTerm === "workflow") {
    text += `. The backend will automatically transform this to the correct format for the frontend.`;
  }

  text += `
2. Use the keys from input_schema (or inputSchema) to set the node's config object
3. Optionally call getExtensionKnowledge(workflow_node_identifier) to get full schema details
4. Include relevant configuration details in the "config" field`;

  if (canvasTerm === "form") {
    text += `

**Note:** Nodes with type "external/..." are automatically transformed into Integration nodes on the canvas; they will appear as configurable integration nodes (same as on the workflow canvas).`;
  }

  text += `

If no matching external integrations are found, fall back to using shared node types (e.g., HTTP for API calls${canvasTerm === "workflow" ? ", SELF_EMAIL for email" : ""}).`;

  return text;
}

/**
 * CLARIFICATION QUESTIONS section: structure, JSON format, Important bullets.
 * @param {object} options
 * @param {string[]} options.whenToAskLines - Array of "- If X → Ask Y" lines
 * @param {'form'|'workflow'} options.userFacingTerm - "form" or "workflow" for user-facing text
 * @returns {string}
 */
export function getClarificationBaseFragment(options = {}) {
  const { whenToAskLines = [], userFacingTerm = "form" } = options;

  const whenToAskText = whenToAskLines.length > 0 ? whenToAskLines.join("\n") : "";

  let text = `## CLARIFICATION QUESTIONS

**CRITICAL:** If the user's request contains ambiguity about which service, integration, or data source to use, you MUST ask clarification questions BEFORE generating the ${userFacingTerm} flow. Do NOT guess or assume.

**When to ask for clarification:**
${whenToAskText}

**Clarification format (required):** Always use the \`(e.g. option1, option2, option3)\` format so the UI can show selectable pills. Options appear as clickable choices; users can choose "Other..." for custom input.

**How to return clarification questions:**
If clarification is needed, return a JSON object with this structure:
\`\`\`json
{
  "needs_clarification": true,
  "clarification_questions": [
    "Which email provider would you like to use? (e.g., Gmail, Outlook, SendGrid)",
    "Which Slack workspace should receive the ${userFacingTerm === "form" ? "form submission" : "summary"}?"
  ],
  "nodes": []
}
\`\`\`

**Important:**
- Return clarification questions as an array of strings (simple questions)
- Only ask questions about critical information that prevents ${userFacingTerm} generation
- Do NOT ask questions about optional configuration details (those can be set later)
- After the user answers, you will receive their answers and can then generate the complete ${userFacingTerm} flow`;

  if (userFacingTerm === "form") {
    text += `
- Always include options in the \`(e.g. x, y, z)\` format for "what to collect" questions
- Use "form" not "workflow" in all user-facing text (this is the Form canvas)`;
  }

  text += `

`;

  return text;
}

/**
 * RESPONSE FORMAT section: CRITICAL valid JSON, node structure, Workflow steps.
 * @param {object} options
 * @param {string} [options.nodeFieldsNote] - Optional extra line (e.g. config key hints for form)
 * @param {string} [options.typeLabel] - Label for the "type" field (e.g. "form question types above OR a shared node type OR...")
 * @param {string} [options.extraImportant] - Optional extra IMPORTANT bullets
 * @param {string} [options.flowLabel] - Label for the "Workflow:" or "Form Flow:" section
 * @returns {string}
 */
export function getResponseFormatBaseFragment(options = {}) {
  const {
    nodeFieldsNote = "",
    typeLabel = "one of the internal types above OR a workflow_node_identifier from discovered external integrations",
    extraImportant = "",
    flowLabel = "Workflow",
  } = options;

  let text = `## RESPONSE FORMAT

**CRITICAL: You MUST always return valid JSON. Never return explanatory text, markdown, or code blocks. Return ONLY the JSON object.**

Each node in your response must have:
- "type": ${typeLabel}
- "name": a short descriptive label (2-4 words)
- "description": what this node does in context (1 sentence)
- "config": relevant configuration hints (optional object)`;

  if (nodeFieldsNote) {
    text += ` ${nodeFieldsNote}`;
  }

  text += `

Return a JSON object with a "nodes" key containing the array.`;

  if (extraImportant) {
    text += ` ${extraImportant}`;
  }

  text += `

**${flowLabel}:**
1. If you need to discover integrations, use the search tools first
2. After tool calls complete, immediately return the JSON workflow (do NOT add explanatory text)
3. If no tools are needed, return the JSON workflow immediately
4. Always return valid JSON - never wrap it in markdown code blocks or add explanations

`;

  return text;
}
