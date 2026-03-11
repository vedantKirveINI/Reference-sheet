import promptManager from "./PromptManager.js";

/**
 * Prompt Composers - Functions to compose prompts with context
 */

/**
 * Compose system prompt with context and mode
 */
const FORM_CANVAS_HEADER = `You are on the Form canvas (form builder), not the Workflow canvas.
Forms have no triggers. Never suggest triggers. Never output [ACTION:add_trigger].
If the user asks for schedules/events, say it requires Workflow canvas and offer to help build the form instead.

`;

export function composeSystemPrompt(contextBlock = "", modePrompt = "", mode = null, canvasType = null) {
  const basePrompt = promptManager.get("system-prompt");
  
  let fullPrompt = canvasType === "WORKFLOW_CANVAS" ? FORM_CANVAS_HEADER + basePrompt : basePrompt;
  
  if (contextBlock) {
    fullPrompt += contextBlock;
  }
  
  if (modePrompt && mode) {
    fullPrompt += `\n\n[SPECIAL MODE: ${mode}]\n${modePrompt}`;
  }
  
  if (canvasType === "WORKFLOW_CANVAS") {
    fullPrompt += `

## Form canvas rules (you are on the Form canvas)
- The user is on the **Form canvas**. Forms have **no triggers** — they are started when someone opens the form, not by schedules or events.
- **Never** suggest adding a trigger. **Never** use [ACTION:add_trigger] on Form canvas.
- Suggest only: form question nodes (e.g. Short Text, Email, MCQ, Date), shared nodes (HTTP Request, Data Transformer, If/Else, Formula, Log, Jump To), or integrations.
- If the user describes a **scheduled or event-driven automation** (e.g. "at 12 noon", "when I get email", "every day"), politely explain that that is a **workflow** and suggest they use the **Workflow canvas** for it. On Form canvas, offer to help with the form (questions, fields, thank-you page) instead.`;
  }
  
  return fullPrompt;
}

/**
 * Build special mode prompt based on mode type
 */
export function buildSpecialModePrompt(mode, workflowContext) {
  if (!mode) return "";

  switch (mode) {
    case "explain_flow":
      return `The user wants you to explain their workflow in plain English. Walk through the entire flow step-by-step, describing what happens at each node and how data moves between them. Use simple language as if explaining to someone non-technical. Start with the trigger, follow the connections, and describe each branch if there are any. End with a summary of what the overall workflow accomplishes.`;

    case "health_check":
      return `The user wants a health check of their workflow. Analyze the flow and provide:
1. **Health Score** (X/10) based on completeness, error handling, and best practices
2. **What's working well** — things they've done right
3. **Issues found** — specific problems (unconfigured nodes, missing connections, dead-end branches, no error handling on risky nodes)
4. **Recommendations** — concrete improvements they should make, in priority order

Be specific — reference actual node names and configurations.`;

    case "debug":
      return `The user is debugging their workflow. Help them identify and fix issues. Look for:
- Nodes with validation errors or warnings
- Missing configurations
- Broken connections
- Logic errors in conditions
- Missing error handling on risky operations

Reference specific nodes by name and provide actionable fixes.`;

    case "suggest_next":
      // This uses the suggest-next template instead
      return "";

    default:
      return "";
  }
}

/**
 * Compose generate flow prompt with context
 */
export function composeGenerateFlowPrompt(description, workflowContext = null, userConnections = null) {
  const basePrompt = promptManager.get("generate-flow");
  
  let prompt = basePrompt;
  
  if (workflowContext) {
    prompt += `\n\n**Current Workflow Context:**\n`;
    if (workflowContext.nodes && workflowContext.nodes.length > 0) {
      prompt += `- Existing nodes: ${workflowContext.nodes.length}\n`;
      const triggers = workflowContext.nodes.filter(n => 
        n.type && (n.type.includes("TRIGGER") || n.type.includes("WEBHOOK"))
      );
      if (triggers.length > 0) {
        prompt += `- ⚠️ WARNING: A trigger already exists (${triggers[0].type}). You CANNOT add another trigger.\n`;
      }
    }
  }
  
  if (userConnections && userConnections.length > 0) {
    prompt += `\n\n**User's Connected Integrations:**\n`;
    userConnections.forEach(conn => {
      prompt += `- ${conn.name || conn.type || "Unknown"}\n`;
    });
    prompt += `\nConsider using these integrations when relevant.\n`;
  }
  
  prompt += `\n\n**User Request:**\n${description}`;
  
  return prompt;
}

/**
 * Compose setup node prompt with context
 */
export function composeSetupNodePrompt(nodeType, dataAtNode, macroJourney, conversationSnippet = "") {
  const basePrompt = promptManager.get("setup-node");
  
  return `${basePrompt}

Node type: ${nodeType}
Data available at this node: ${typeof dataAtNode === "string" ? dataAtNode : JSON.stringify(dataAtNode)}
Workflow goal: ${macroJourney || "Complete the workflow step."}
${conversationSnippet ? `Recent context: ${conversationSnippet}` : ""}

Return a JSON object with only the config keys for this node type, filled using the data and goal.`;
}

/**
 * Compose internal node setup system prompt (per-type) and return both system and user message content.
 * Used by InternalNodeSetupHandler.
 */
export function composeInternalSetupNodePrompt(nodeType, dataAtNode, macroJourney, conversationSnippet = "", currentConfig = null, clarificationAnswers = null) {
  const systemPrompt = promptManager.get("setup-internal", null, { nodeType });
  const data = typeof dataAtNode === "string" ? dataAtNode : JSON.stringify(dataAtNode ?? {});
  const goal = macroJourney || "Complete the workflow step.";
  let userContent = `Node type: ${nodeType}
Current config (optional): ${currentConfig ? JSON.stringify(currentConfig) : "{}"}
Data available at this node: ${data}
Workflow goal: ${goal}`;
  if (conversationSnippet) {
    userContent += `\nRecent context: ${conversationSnippet}`;
  }
  if (clarificationAnswers && Object.keys(clarificationAnswers).length > 0) {
    userContent += `\nUser provided answers: ${JSON.stringify(clarificationAnswers)}`;
  }
  userContent += "\n\nReturn a JSON object with only the config keys for this node type, filled using the data and goal.";
  return { systemPrompt, userContent };
}

/**
 * Compose suggest next prompt with context
 */
export function composeSuggestNextPrompt(workflowContext, suggestNextBarTypes, isStructurallyComplete = false, canvasType = null) {
  const basePrompt = promptManager.get("suggest-next", null, {
    suggestNextBarTypes: Array.isArray(suggestNextBarTypes) ? suggestNextBarTypes : [],
  });
  
  let prompt = basePrompt;
  
  // Add canvas-specific context
  if (canvasType === "WORKFLOW_CANVAS") {
    // Form canvas
    prompt += `\n\nIMPORTANT: This is a Form canvas. Forms have NO triggers. Never suggest trigger nodes. Suggest form question nodes (SHORT_TEXT, EMAIL, MCQ, etc.) or shared nodes (HTTP, TRANSFORMER_V3, IFELSE_V2, LOG, JUMP_TO).`;
  }
  
  if (isStructurallyComplete) {
    const canvasContext = canvasType === "WORKFLOW_CANVAS" 
      ? "This form appears to be structurally complete (has questions and connections)."
      : "This workflow appears to be structurally complete (has trigger, actions, and connections).";
    prompt += `\n\nIMPORTANT: ${canvasContext} Carefully assess whether the inferred goal is already met by the existing nodes. If the goal is fully accomplished, set goalMet to true and return an empty suggestedNodeTypes array. If more nodes would improve or complete the goal, set goalMet to false.`;
  }
  
  return prompt;
}
