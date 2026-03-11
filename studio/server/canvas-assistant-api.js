import dotenv from "dotenv";
dotenv.config();

import express from "express";
import OpenAI from "openai";
import PRODUCT_KNOWLEDGE from "./product-knowledge.js";
import * as dbStudio from "./db-studio.js";

// Import new modular router
import canvasAssistantRouter from "./canvas-assistant/index.js";

const app = express();
app.use(express.json({ limit: "1mb" }));

// Always use new modular architecture (legacy deprecated)
app.use("/api/canvas-assistant", canvasAssistantRouter);
console.log("[Canvas Assistant] Using new modular architecture");

let openai;
try {
  // the newest OpenAI model is "gpt-5" which was released August 7, 2025. do not change this unless explicitly requested by the user
  openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
} catch (e) {
  console.warn("OpenAI not initialized - OPENAI_API_KEY may be missing. Assistant will return fallback responses.");
}

const MAX_MESSAGES = 30;
const MAX_MESSAGE_LENGTH = 4000;

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
  GPT_CREATIVE: "AI Creative",
  GPT_TRANSLATOR: "AI Translator",
  GPT_LEARNING: "AI Learning",
  GPT_CONSULTANT: "AI Consultant",
  OPENAI: "OpenAI",
  CLAUDE: "Claude AI",
  GEMINI: "Gemini AI",
  IFELSE_V2: "If/Else",
  IF_ELSE: "If/Else",
  SWITCH: "Switch",
  ITERATOR_V2: "Loop",
  ITERATOR: "Loop",
  FOR_EACH: "For Each",
  DELAY_V2: "Delay",
  DELAY: "Delay",
  PERSON_ENRICHMENT_V2: "Person Enrichment",
  COMPANY_ENRICHMENT_V2: "Company Enrichment",
  EMAIL_ENRICHMENT: "Email Enrichment",
  AGGREGATOR: "Aggregator",
  FILTER: "Filter",
  MAP: "Map",
  REDUCE: "Reduce",
  SKIP: "Skip",
  BREAK: "Break",
  JUMP_TO: "Jump To",
  LOG: "Logger",
  "Success Setup": "End",
  PLACEHOLDER: "Placeholder",
  HITL: "Human Review",
  AGENT_INPUT: "Agent Input",
  AGENT_OUTPUT: "Agent Output",
  TOOL_INPUT: "Tool Input",
  TOOL_OUTPUT: "Tool Output",
  INTEGRATION: "Integration",
  "Input Setup": "Manual Trigger",
  "Success Setup": "Success",
};

const SYSTEM_PROMPT = `You are the Canvas Assistant for IC Canvas (Tiny Studio), an AI-powered helper embedded directly in the workflow builder canvas. You are deeply knowledgeable about every feature, node type, and capability of the platform.

## Your Personality
- Friendly, concise, and encouraging — like a smart coworker sitting next to the user
- Talk to the user as if they are a founder, marketer, agency owner, DIY builder, or automation expert — NOT a developer
- Use plain, everyday language — no technical jargon, no code-speak
- Be specific — reference actual node names, features, and configurations
- When you see issues in the workflow, point them out proactively
- Celebrate wins — when a workflow looks good, say so
- Keep responses under 150 words unless the user asks for detail

## Communication Rules — STRICTLY FOLLOW
- **NEVER** show internal type keys like TRIGGER_SETUP_V3, IF_ELSE_V2, DB_FIND_ALL_V2, TRANSFORMER_V3, or any ALL_CAPS_WITH_UNDERSCORES identifiers
- **NEVER** use underscores in node names — always use friendly names (e.g., "Manual Trigger", "If/Else", "Find All Records", "Data Transformer")
- **NEVER** reference internal properties like subType, module, category, template, or key
- **ALWAYS** use the user's custom node name if they gave one, otherwise use the friendly type name
- **ALWAYS** use everyday language: "your workflow", "this step", "the trigger", "the condition", "the action"
- When describing what a node does, speak in plain terms: "this step checks a condition", "this pulls data from your database", "this sends an email"

## Your Capabilities
1. **Explain** any node type, feature, or concept in IC Canvas
2. **Analyze** the user's current workflow and give specific advice
3. **Suggest** next steps, missing nodes, or improvements
4. **Debug** issues by examining node configs, validation errors, and execution results
5. **Teach** workflow design patterns and best practices
6. **Write** formulas using the {{stepName.field}} syntax
7. **Recommend** which node types to use for a given task

## Response Format
- Use bullet points for lists
- Bold important terms with **asterisks**
- Keep paragraphs short (2-3 sentences max)
- When suggesting nodes, mention them by their friendly name
- When referencing the user's workflow, use the actual node names from their canvas

${PRODUCT_KNOWLEDGE}

## Action Suggestions
When you identify a specific, actionable fix for the user's workflow, you may include ONE action tag at the end of your response. You MUST only use these exact action types — do NOT invent new ones:
[ACTION:add_trigger] — when the workflow needs a trigger node
[ACTION:add_node:HTTP Request] — when you suggest adding a specific node type (replace "HTTP Request" with the node name)
[ACTION:connect_nodes] — when nodes need to be connected
[ACTION:add_error_handling] — when error handling should be added

IMPORTANT: These are the ONLY four action types available. Do NOT create custom action tags like [ACTION:add_url], [ACTION:add_email_subject_body], etc. If the fix doesn't match one of the four types above, just explain the steps in text without an action tag. Maximum 1 action per response.

## Selected Node Awareness
When the user has a node selected on their canvas, you'll see it in the context as "Currently Selected Node". Prioritize giving help about that specific node — if the user asks a vague question, assume they're asking about the selected node. Reference it by name in your responses.

## Macro Journey
When the context includes "Macro journey (workflow goal)", use it to keep your suggestions and explanations aligned with what the user is trying to build. If no macro journey is given, infer it from the workflow and conversation and refer to it in your responses (e.g. "It looks like you're building a lead capture flow — here's how to ...").

## Available Tools
You have access to tools that let you search the extension knowledge base. Use these tools when users ask about:
- Specific integrations (e.g., "How do I use Slack?", "Show me SendGrid setup")
- Extension capabilities (e.g., "What extensions can send emails?", "Find database extensions")
- Extension documentation (e.g., "How do I configure the Create Record node?")

When you use these tools, read the returned documentation and provide helpful, specific answers based on the actual extension content. Always cite the extension name and provide relevant details from the documentation.
`;

// =============================================================================
// Tool Definitions for Function Calling
// =============================================================================

const TOOLS = [
  {
    type: "function",
    function: {
      name: "searchInternalExtensions",
      description: "Search for internal/built-in platform extensions (e.g., Create Record, Update Record, Send Email, HTTP Request). Use when users ask about core platform features or built-in nodes.",
      parameters: {
        type: "object",
        properties: {
          query: {
            type: "string",
            description: "Search query describing what extension or functionality the user is looking for (e.g., 'create database record', 'send email', 'HTTP request')",
          },
          limit: {
            type: "number",
            description: "Maximum number of results to return (default: 5)",
            default: 5,
          },
        },
        required: ["query"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "searchExternalExtensions",
      description: "Search for external/third-party integration extensions (e.g., Slack, SendGrid, Stripe, Google Sheets). Use when users ask about specific integrations or third-party services.",
      parameters: {
        type: "object",
        properties: {
          query: {
            type: "string",
            description: "Search query for the integration or service name (e.g., 'Slack messaging', 'SendGrid email', 'Stripe payment')",
          },
          limit: {
            type: "number",
            description: "Maximum number of results to return (default: 5)",
            default: 5,
          },
        },
        required: ["query"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "searchAllExtensions",
      description: "Search across all extensions (both internal and external). Use when users ask general questions about available extensions or when you're unsure if an extension is internal or external.",
      parameters: {
        type: "object",
        properties: {
          query: {
            type: "string",
            description: "Search query for any extension or functionality (e.g., 'email', 'database', 'messaging', 'payment')",
          },
          limit: {
            type: "number",
            description: "Maximum number of results to return (default: 5)",
            default: 5,
          },
        },
        required: ["query"],
      },
    },
  },
];

/**
 * Execute a tool/function call
 * @param {string} functionName - Name of the function to call
 * @param {object} args - Function arguments
 * @returns {Promise<any>} - Function result
 */
async function executeTool(functionName, args) {
  try {
    switch (functionName) {
      case "searchInternalExtensions":
        return [];
      
      case "searchExternalExtensions":
      case "searchAllExtensions":
        return await dbStudio.searchIntegrationKnowledgeV2(args.query, {
          limit: args.limit || 5,
          similarityThreshold: 0.6,
        });
      
      default:
        throw new Error(`Unknown function: ${functionName}`);
    }
  } catch (error) {
    console.error(`Error executing tool ${functionName}:`, error);
    return { error: error.message };
  }
}

function buildContextBlock(context) {
  if (!context) return "";

  const parts = [];

  if (context.flowName) {
    parts.push(`**Workflow Name:** "${context.flowName}"`);
  }

  if (context.nodes?.length) {
    parts.push(`**Nodes (${context.nodes.length}):**`);
    context.nodes.forEach((node, i) => {
      const friendlyType = FRIENDLY_NAMES[node.type] || (node.type || "Step").replace(/_/g, " ").replace(/\bV\d+$/i, "").replace(/\b\w/g, c => c.toUpperCase()).trim() || "Step";
      const name = node.name || friendlyType || "Unnamed";

      let configSummary = "";
      if (node.config) {
        const cfg = node.config;
        const configParts = [];
        if (cfg.url) configParts.push(`url: "${cfg.url}"`);
        if (cfg.method) configParts.push(`method: ${cfg.method}`);
        if (cfg.prompt) configParts.push(`prompt: "${cfg.prompt.substring(0, 100)}..."`);
        if (cfg.systemPrompt) configParts.push(`system prompt set`);
        if (cfg.connectionId || cfg.connection) configParts.push(`connection: configured`);
        if (cfg.expression) configParts.push(`expression set`);
        if (cfg.formula) configParts.push(`formula set`);
        if (cfg.subject) configParts.push(`subject: "${cfg.subject}"`);
        if (cfg.body) configParts.push(`body set`);
        if (cfg.input || cfg.inputs) configParts.push(`input configured`);
        if (cfg.sheetId) configParts.push(`sheet connected`);
        if (cfg.tableName) configParts.push(`table: ${cfg.tableName}`);
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

  if (context.links?.length) {
    parts.push(`\n**Connections (${context.links.length}):**`);
    context.links.forEach((link) => {
      const from = link.fromName || link.from || "?";
      const to = link.toName || link.to || "?";
      const label = link.label ? ` [${link.label}]` : "";
      const isError = link.isErrorLink ? " (error route)" : "";
      parts.push(`  - ${from} → ${to}${label}${isError}`);
    });
  }

  if (context.flowIssues?.length) {
    parts.push(`\n**Flow Issues Detected:**`);
    context.flowIssues.forEach((issue) => {
      parts.push(`  ⚠️ ${issue}`);
    });
  }

  if (context.executionHistory?.length) {
    parts.push(`\n**Recent Executions:**`);
    context.executionHistory.slice(0, 5).forEach((exec) => {
      const status = exec.status || "unknown";
      const duration = exec.duration ? ` (${exec.duration})` : "";
      const failedNode = exec.failedNode ? ` — failed at: "${exec.failedNode}"` : "";
      const error = exec.error ? ` — error: "${exec.error.substring(0, 200)}"` : "";
      parts.push(`  - ${status}${duration}${failedNode}${error}`);
    });
  }

  if (context.focusedNode) {
    const fn = context.focusedNode;
    const friendlyType = FRIENDLY_NAMES[fn.type] || fn.type;
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

  if (context.availableVariables?.length) {
    parts.push(`\n**Available Variables (from previous steps):**`);
    context.availableVariables.slice(0, 20).forEach((v) => {
      parts.push(`  - {{${v.path}}} (${v.type || "any"})`);
    });
  }

  if (context.macroJourney) {
    parts.push(`\n**Macro journey (workflow goal):** ${context.macroJourney}`);
  }

  if (parts.length === 0) return "";
  return "\n\n---\n[USER'S CURRENT WORKFLOW CONTEXT]\n" + parts.join("\n");
}

function buildSpecialModePrompt(mode, context) {
  if (mode === "explain_flow") {
    return `The user wants you to explain their workflow in plain English. Walk through the entire flow step-by-step, describing what happens at each node and how data moves between them. Use simple language as if explaining to someone non-technical. Start with the trigger, follow the connections, and describe each branch if there are any. End with a summary of what the overall workflow accomplishes.`;
  }

  if (mode === "health_check") {
    return `The user wants a health check of their workflow. Analyze the flow and provide:
1. **Health Score** (X/10) based on completeness, error handling, and best practices
2. **What's working well** — things they've done right
3. **Issues found** — specific problems (unconfigured nodes, missing connections, dead-end branches, no error handling on risky nodes)
4. **Recommendations** — concrete improvements they should make, in priority order
Be specific — reference actual node names from their canvas.`;
  }

  if (mode === "debug") {
    return `The user needs help debugging their workflow. Look at the execution history, validation errors, and node configurations to identify what went wrong. Explain the error in plain language, identify the root cause, and suggest a specific fix. If there's a failed node, focus on that node's configuration and the data flowing into it.`;
  }

  if (mode === "suggest_next") {
    return `Based on the user's current workflow, suggest the most logical next node(s) to add. Consider what's already built, what the workflow appears to be doing, and what common patterns suggest. Give 2-3 specific suggestions with brief explanations of why each would be useful.`;
  }

  return "";
}

// --- Conversation and messages (Studio DB) ---
app.get("/api/canvas-assistant/conversation", async (req, res) => {
  try {
    const assetId = req.query.asset_id;
    if (!assetId || typeof assetId !== "string") {
      return res.status(400).json({ error: "asset_id is required" });
    }
    const threadId = req.query.thread_id || null;
    const userId = req.query.user_id || null;
    const conv = await dbStudio.getOrCreateConversation(assetId, threadId, userId);
    return res.json({
      conversationId: conv.id,
      inferredMacroJourney: conv.inferredMacroJourney || null,
      created: conv.created,
    });
  } catch (err) {
    console.error("Conversation get/create error:", err.message);
    if (process.env.NODE_ENV !== "production") console.error(err.stack);
    return res.status(500).json({ error: "Failed to get or create conversation" });
  }
});

app.patch("/api/canvas-assistant/conversation", async (req, res) => {
  try {
    const { conversationId, inferredMacroJourney } = req.body || {};
    if (!conversationId || typeof conversationId !== "string") {
      return res.status(400).json({ error: "conversationId is required" });
    }
    await dbStudio.updateConversationMacroJourney(conversationId, inferredMacroJourney ?? null);
    return res.json({ ok: true });
  } catch (err) {
    console.error("Conversation update error:", err.message);
    return res.status(500).json({ error: "Failed to update conversation" });
  }
});

app.get("/api/canvas-assistant/messages", async (req, res) => {
  try {
    const conversationId = req.query.conversation_id;
    if (!conversationId || typeof conversationId !== "string") {
      return res.status(400).json({ error: "conversation_id is required" });
    }
    const limit = Math.min(parseInt(req.query.limit || "50", 10) || 50, 100);
    const messages = await dbStudio.getMessages(conversationId, limit);
    return res.json({ messages });
  } catch (err) {
    console.error("Messages get error:", err.message);
    return res.status(500).json({ error: "Failed to get messages" });
  }
});

app.post("/api/canvas-assistant/messages", async (req, res) => {
  try {
    const { conversationId, role, content, metadata } = req.body || {};
    if (!conversationId || !role || typeof content !== "string") {
      return res.status(400).json({ error: "conversationId, role, and content are required" });
    }
    if (!["user", "assistant", "system"].includes(role)) {
      return res.status(400).json({ error: "role must be user, assistant, or system" });
    }
    const msg = await dbStudio.insertMessage(conversationId, role, content, metadata || null);
    return res.json({ message: msg });
  } catch (err) {
    console.error("Message insert error:", err.message);
    return res.status(500).json({ error: "Failed to save message" });
  }
});

app.post("/api/canvas-assistant", async (req, res) => {
  try {
    const { messages, workflowContext, mode } = req.body;

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: "Messages array is required" });
    }

    if (messages.length > MAX_MESSAGES) {
      return res.status(400).json({ error: `Too many messages (max ${MAX_MESSAGES})` });
    }

    const validRoles = new Set(["system", "user", "assistant"]);
    for (const msg of messages) {
      if (!msg.role || !validRoles.has(msg.role)) {
        return res.status(400).json({ error: "Invalid message role" });
      }
      if (typeof msg.content !== "string" || msg.content.length > MAX_MESSAGE_LENGTH) {
        return res.status(400).json({ error: `Message content too long (max ${MAX_MESSAGE_LENGTH} chars)` });
      }
    }

    if (!openai) {
      return res.json({
        message: "I'm not fully set up yet — the AI service needs an API key to be configured. In the meantime, I can still show you tips about your workflow! Try adding nodes and connecting them to build your automation.",
      });
    }

    const contextBlock = buildContextBlock(workflowContext);
    const modePrompt = buildSpecialModePrompt(mode, workflowContext);
    const fullSystemPrompt = SYSTEM_PROMPT + contextBlock + (modePrompt ? `\n\n[SPECIAL MODE: ${mode}]\n${modePrompt}` : "");

    const apiMessages = [
      { role: "system", content: fullSystemPrompt },
      ...messages.filter((m) => m.role !== "system"),
    ];

    // Handle function calling loop
    let finalResponse = null;
    let maxIterations = 5;
    let iteration = 0;

    while (iteration < maxIterations) {
      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: apiMessages,
        tools: TOOLS,
        tool_choice: "auto",
        max_completion_tokens: 1024,
      });

      const message = response.choices[0]?.message;
      if (!message) break;

      // Add assistant's message to conversation
      apiMessages.push(message);

      // Check if model wants to call a function
      const toolCalls = message.tool_calls;
      if (!toolCalls || toolCalls.length === 0) {
        // No function calls, we're done
        finalResponse = message.content || "";
        break;
      }

      // Execute all tool calls
      for (const toolCall of toolCalls) {
        const functionName = toolCall.function.name;
        const functionArgs = JSON.parse(toolCall.function.arguments || "{}");
        
        console.log(`[Tool Call] ${functionName}`, functionArgs);
        
        const functionResult = await executeTool(functionName, functionArgs);
        
        // Add function result to conversation
        apiMessages.push({
          role: "tool",
          tool_call_id: toolCall.id,
          name: functionName,
          content: JSON.stringify(functionResult),
        });
      }

      iteration++;
    }

    if (!finalResponse && iteration >= maxIterations) {
      finalResponse = "I encountered an issue processing your request. Please try again.";
    }

    res.json({ message: finalResponse || "" });
  } catch (error) {
    console.error("Canvas Assistant API error:", error.message);
    res.status(500).json({ error: "Failed to generate response" });
  }
});

const GENERATE_FLOW_PROMPT = `You are an expert workflow architect for IC Canvas (Tiny Studio). Given a natural language description, generate a structured workflow as a JSON array of node objects.

Available node types and their type values:
TRIGGERS (pick exactly one):
- "TRIGGER_SETUP_V3" — Manual trigger (user clicks Run)
- "FORM_TRIGGER" — Form submission trigger
- "CUSTOM_WEBHOOK" — Webhook trigger (external API calls your URL)
- "TIME_BASED_TRIGGER_V2" — Schedule trigger (cron/interval)
- "SHEET_TRIGGER_V2" — Sheet record change trigger

ACTIONS:
- "HTTP" — HTTP Request (API calls). Config: { url, method }
- "TRANSFORMER_V3" — Transform/reshape data. Config: { expression }
- "SELF_EMAIL" — Send email. Config: { subject, body }
- "CREATE_RECORD_V2" — Create database record
- "UPDATE_RECORD_V2" — Update database record
- "DB_FIND_ALL_V2" — Find all records
- "DB_FIND_ONE_V2" — Find one record

AI/GPT:
- "GPT" — AI text generation. Config: { prompt }
- "GPT_RESEARCHER" — AI research
- "GPT_WRITER" — AI writing
- "GPT_ANALYZER" — AI analysis
- "GPT_SUMMARIZER" — AI summarization

LOGIC:
- "IFELSE_V2" — Conditional branching
- "ITERATOR_V2" — Loop through list items
- "DELAY_V2" — Wait/pause

ENRICHMENT:
- "PERSON_ENRICHMENT_V2" — Enrich person data
- "COMPANY_ENRICHMENT_V2" — Enrich company data

Each node in your response must have:
- "type": one of the types above
- "name": a short descriptive label (2-4 words)
- "description": what this node does in context (1 sentence)
- "config": relevant configuration hints (optional object)

Return a JSON object with a "nodes" key containing the array. Order nodes in execution sequence. First node must be a trigger.
Example: {"nodes":[{"type":"TRIGGER_SETUP_V3","name":"Start","description":"Manual trigger"},{"type":"HTTP","name":"Fetch Users","description":"Get user list from API","config":{"url":"https://api.example.com/users","method":"GET"}},{"type":"IFELSE_V2","name":"Check Status","description":"Branch based on response status"},{"type":"SELF_EMAIL","name":"Send Report","description":"Email the results"}]}`;

app.post("/api/canvas-assistant/stream", async (req, res) => {
  try {
    const { messages, workflowContext, mode } = req.body;

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: "Messages array is required" });
    }

    if (messages.length > MAX_MESSAGES) {
      return res.status(400).json({ error: `Too many messages (max ${MAX_MESSAGES})` });
    }

    const validRoles = new Set(["system", "user", "assistant"]);
    for (const msg of messages) {
      if (!msg.role || !validRoles.has(msg.role)) {
        return res.status(400).json({ error: "Invalid message role" });
      }
      if (typeof msg.content !== "string" || msg.content.length > MAX_MESSAGE_LENGTH) {
        return res.status(400).json({ error: `Message content too long (max ${MAX_MESSAGE_LENGTH} chars)` });
      }
    }

    if (!openai) {
      return res.json({
        message: "I'm not fully set up yet — the AI service needs an API key to be configured. In the meantime, I can still show you tips about your workflow! Try adding nodes and connecting them to build your automation.",
      });
    }

    res.writeHead(200, {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      "Connection": "keep-alive",
    });

    const contextBlock = buildContextBlock(workflowContext);
    const modePrompt = buildSpecialModePrompt(mode, workflowContext);
    const fullSystemPrompt = SYSTEM_PROMPT + contextBlock + (modePrompt ? `\n\n[SPECIAL MODE: ${mode}]\n${modePrompt}` : "");

    const apiMessages = [
      { role: "system", content: fullSystemPrompt },
      ...messages.filter((m) => m.role !== "system"),
    ];

    // Handle function calling for streaming
    let maxIterations = 5;
    let iteration = 0;

    while (iteration < maxIterations) {
      const stream = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: apiMessages,
        tools: TOOLS,
        tool_choice: "auto",
        max_completion_tokens: 1024,
        stream: true,
      });

      let assistantMessage = { role: "assistant", content: "", tool_calls: [] };
      let hasContent = false;

      for await (const chunk of stream) {
        const delta = chunk.choices[0]?.delta;
        if (!delta) continue;

        // Handle content streaming
        if (delta.content) {
          hasContent = true;
          res.write(`data: ${JSON.stringify({ delta: delta.content })}\n\n`);
          assistantMessage.content += delta.content;
        }

        // Handle tool calls (accumulate them)
        if (delta.tool_calls) {
          for (const toolCallDelta of delta.tool_calls) {
            const index = toolCallDelta.index || 0;
            if (!assistantMessage.tool_calls[index]) {
              assistantMessage.tool_calls[index] = {
                id: toolCallDelta.id || `call_${Date.now()}_${index}`,
                type: "function",
                function: { name: "", arguments: "" },
              };
            }
            if (toolCallDelta.function?.name) {
              assistantMessage.tool_calls[index].function.name += toolCallDelta.function.name;
            }
            if (toolCallDelta.function?.arguments) {
              assistantMessage.tool_calls[index].function.arguments += toolCallDelta.function.arguments;
            }
          }
        }
      }

      // Add assistant message to conversation
      if (assistantMessage.content || (assistantMessage.tool_calls && assistantMessage.tool_calls.length > 0)) {
        apiMessages.push(assistantMessage);
      }

      // Check if we need to execute tool calls
      if (assistantMessage.tool_calls && assistantMessage.tool_calls.length > 0) {
        // Notify client that we're executing tools
        res.write(`data: ${JSON.stringify({ tool_calls: assistantMessage.tool_calls.map(tc => tc.function.name) })}\n\n`);

        // Execute all tool calls
        for (const toolCall of assistantMessage.tool_calls) {
          const functionName = toolCall.function.name;
          let functionArgs = {};
          try {
            functionArgs = JSON.parse(toolCall.function.arguments || "{}");
          } catch (e) {
            console.error("Error parsing tool arguments:", e);
            functionArgs = {};
          }

          console.log(`[Tool Call] ${functionName}`, functionArgs);

          const functionResult = await executeTool(functionName, functionArgs);

          // Add function result to conversation
          apiMessages.push({
            role: "tool",
            tool_call_id: toolCall.id,
            name: functionName,
            content: JSON.stringify(functionResult),
          });
        }

        iteration++;
        // Continue loop to get final response (non-streaming for final response after tool calls)
      } else {
        // No tool calls, we're done streaming
        break;
      }
    }

    // If we executed tools, get final response and stream it
    if (iteration > 0) {
      const finalResponse = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: apiMessages,
        tools: TOOLS,
        tool_choice: "auto",
        max_completion_tokens: 1024,
      });

      const finalMessage = finalResponse.choices[0]?.message;
      if (finalMessage?.content) {
        // Stream the final response word by word
        const words = finalMessage.content.split(" ");
        for (const word of words) {
          res.write(`data: ${JSON.stringify({ delta: word + " " })}\n\n`);
          await new Promise((resolve) => setTimeout(resolve, 20)); // Small delay for streaming effect
        }
      }
    }

    res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
    res.end();
  } catch (error) {
    console.error("Canvas Assistant stream error:", error.message);
    if (!res.headersSent) {
      res.status(500).json({ error: "Failed to generate response" });
    } else {
      res.write(`data: ${JSON.stringify({ error: "Stream interrupted" })}\n\n`);
      res.end();
    }
  }
});

// LEGACY ENDPOINT - DEPRECATED
// This endpoint has been replaced by the new modular architecture in GenerateFlowHandler.js
// All requests now go through /api/canvas-assistant/generate-flow via canvasAssistantRouter
/*
app.post("/api/canvas-assistant/generate-flow", async (req, res) => {
  try {
    const { description } = req.body;

    if (!description || typeof description !== "string") {
      return res.status(400).json({ error: "Description is required" });
    }

    if (!openai) {
      return res.json({ error: "AI service not configured", nodes: [] });
    }

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: GENERATE_FLOW_PROMPT },
        { role: "user", content: description },
      ],
      max_completion_tokens: 2048,
      response_format: { type: "json_object" },
    });

    const content = response.choices?.[0]?.message?.content || "[]";
    let parsed;
    try {
      const obj = JSON.parse(content);
      parsed = Array.isArray(obj) ? obj : obj.nodes || obj.workflow || obj.steps || [];
    } catch {
      parsed = [];
    }

    const validTypes = new Set([
      "TRIGGER_SETUP_V3", "FORM_TRIGGER", "CUSTOM_WEBHOOK", "TIME_BASED_TRIGGER_V2", "SHEET_TRIGGER_V2",
      "HTTP", "TRANSFORMER_V3", "SELF_EMAIL",
      "CREATE_RECORD_V2", "UPDATE_RECORD_V2", "DB_FIND_ALL_V2", "DB_FIND_ONE_V2",
      "GPT", "GPT_RESEARCHER", "GPT_WRITER", "GPT_ANALYZER", "GPT_SUMMARIZER",
      "IFELSE_V2", "ITERATOR_V2", "DELAY_V2",
      "PERSON_ENRICHMENT_V2", "COMPANY_ENRICHMENT_V2",
    ]);

    const validNodes = parsed
      .filter((n) => n.type && validTypes.has(n.type))
      .map((n) => ({
        type: n.type,
        name: (n.name || n.type).substring(0, 40),
        description: (n.description || "").substring(0, 200),
        config: n.config || {},
      }));

    res.json({ nodes: validNodes });
  } catch (error) {
    console.error("Generate flow error:", error.message);
    res.status(500).json({ error: "Failed to generate workflow" });
  }
});
*/

// --- Setup node (fill config from data + goal) ---
const SETUP_NODE_PROMPT = `You are a workflow configuration assistant. Given a node type, the data available at that node (from previous steps), and the workflow goal, fill in the node's configuration.

Node types and their config keys (return ONLY these keys in your JSON):
- HTTP: url (string), method (string: GET, POST, PUT, DELETE, PATCH), headers (object, optional), body (string or object, optional)
- SELF_EMAIL: subject (string), body (string), to (string or formula like {{StepName.field}})
- TRANSFORMER_V3: expression (string, JavaScript expression that transforms the input)
- IFELSE_V2: conditions (array of condition objects; if complex, return a minimal structure)
- GPT: prompt (string), systemPrompt (string, optional)

Use the "dataAtNode" payload to infer values (e.g. use a field from the data for subject, body, or expression). Use {{StepName.field}} syntax when referencing previous step output.

Return ONLY a valid JSON object with the config keys for this node type. No explanation. Example for HTTP: {"url":"https://api.example.com/users","method":"GET"}`;

app.post("/api/canvas-assistant/setup-node", async (req, res) => {
  try {
    const { nodeType, nodeKey, currentConfig, dataAtNode, macroJourney, conversationSnippet } = req.body || {};
    if (!nodeType || typeof nodeType !== "string") {
      return res.status(400).json({ error: "nodeType is required" });
    }
    const data = dataAtNode != null ? (typeof dataAtNode === "string" ? dataAtNode : JSON.stringify(dataAtNode)) : "{}";
    const goal = macroJourney || "Complete the workflow step.";
    const snippet = conversationSnippet || "";

    if (!openai) {
      return res.json({ config: {}, connectionHints: [], message: "AI service not configured." });
    }

    const userContent = `Node type: ${nodeType}
Current config (optional): ${currentConfig ? JSON.stringify(currentConfig) : "{}"}
Data available at this node: ${data}
Workflow goal: ${goal}
${snippet ? `Recent context: ${snippet}` : ""}

Return a JSON object with only the config keys for this node type, filled using the data and goal.`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: SETUP_NODE_PROMPT },
        { role: "user", content: userContent },
      ],
      max_completion_tokens: 1024,
      response_format: { type: "json_object" },
    });

    const raw = response.choices?.[0]?.message?.content || "{}";
    let config = {};
    try {
      config = JSON.parse(raw);
    } catch {
      config = {};
    }
    res.json({ config, connectionHints: [], message: "Configuration suggested. Review and save." });
  } catch (err) {
    console.error("Setup node error:", err.message);
    res.status(500).json({ config: {}, connectionHints: [], message: "Failed to generate config." });
  }
});

const SUGGEST_NEXT_BAR_TYPES = [
  "TRIGGER_SETUP_V3", "FORM_TRIGGER", "CUSTOM_WEBHOOK", "TIME_BASED_TRIGGER_V2", "SHEET_TRIGGER_V2",
  "HTTP", "TRANSFORMER_V3", "SELF_EMAIL",
  "CREATE_RECORD_V2", "UPDATE_RECORD_V2", "DB_FIND_ALL_V2", "DB_FIND_ONE_V2",
  "GPT", "GPT_RESEARCHER", "GPT_WRITER", "GPT_ANALYZER", "GPT_SUMMARIZER",
  "IFELSE_V2", "ITERATOR_V2", "DELAY_V2",
  "PERSON_ENRICHMENT_V2", "COMPANY_ENRICHMENT_V2",
];

const SUGGEST_NEXT_BAR_PROMPT = `Based on the user's current workflow context below, do the following:

1. Write a short 2-line plain-English summary of what you think they are trying to build (max 2 sentences, friendly tone).
2. Infer their workflow goal (e.g., "lead capture", "content pipeline", "notification system", "data enrichment", etc.). Return as a single short phrase.
3. Assess whether that goal appears to be met based on the existing nodes and connections.
4. Suggest node types to add. If the goal is already met, return an empty array. Otherwise, suggest exactly 2 next node types they would likely add. Use only the internal type IDs from this list: ${SUGGEST_NEXT_BAR_TYPES.join(", ")}.
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

app.post("/api/canvas-assistant/suggest-next-bar", async (req, res) => {
  try {
    const { workflowContext, decisionHistory, conversationId } = req.body;

    if (!openai) {
      return res.json({
        intentSummary: "",
        suggestedNodeTypes: [],
        inferredGoal: "",
        goalMet: false,
        suggestedConfig: {},
        connectionHints: [],
      });
    }

    // Phase 2: Completeness pre-check
    const nodes = workflowContext?.nodes || [];
    const links = workflowContext?.links || [];
    
    const nodeCount = nodes.length;
    const hasTrigger = nodes.some(n => n.type && (n.type.includes("TRIGGER") || n.type.includes("WEBHOOK")));
    const hasAction = nodes.some(n => n.type && !n.type.includes("TRIGGER") && !n.type.includes("WEBHOOK"));
    const hasLinks = links.length > 0;
    
    const isStructurallyComplete = hasTrigger && hasAction && hasLinks;
    const shouldIncludeGoalMet = isStructurallyComplete && nodeCount >= 4;
    
    // Skip AI for trivial workflows (0 nodes)
    if (nodeCount === 0) {
      return res.json({
        intentSummary: "",
        suggestedNodeTypes: [],
        inferredGoal: "",
        goalMet: false,
        suggestedConfig: {},
        connectionHints: [],
      });
    }
    
    // For single trigger node, skip goalMet logic and just suggest actions
    if (nodeCount === 1) {
      const basicPrompt = `Based on the user's current workflow context below, do two things:

1. Write a short 2-line plain-English summary of what you think they are trying to build (max 2 sentences, friendly tone).
2. Suggest exactly 2 next node types they would likely add. Use only the internal type IDs from this list: ${SUGGEST_NEXT_BAR_TYPES.join(", ")}.

Return ONLY a JSON object with these exact keys:
- "intentSummary": string (your 2-line summary)
- "suggestedNodeTypes": array of exactly 2 strings (node type IDs from the list above)

Example: {"intentSummary":"You're building a lead capture flow that enriches contacts and routes to CRM or email.","suggestedNodeTypes":["IFELSE_V2","CREATE_RECORD_V2"]}`;

      const contextBlock = buildContextBlock(workflowContext);
      const decisionBlock = decisionHistory ? `\n\n[USER DECISION HISTORY]\n${decisionHistory}\n\nIMPORTANT: Do NOT re-suggest node types that the user has already declined or dismissed. Prioritize node types similar to what the user has manually added or accepted.` : "";
      const userContent = contextBlock
        ? `${basicPrompt}\n\n${contextBlock}${decisionBlock}`
        : "No workflow context provided.";

      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: "You are a workflow automation assistant. Return only valid JSON." },
          { role: "user", content: userContent },
        ],
        max_completion_tokens: 256,
        response_format: { type: "json_object" },
      });

      const content = response.choices?.[0]?.message?.content || "{}";
      let parsed;
      try {
        parsed = JSON.parse(content);
      } catch {
        return res.json({ 
          intentSummary: "", 
          suggestedNodeTypes: [],
          inferredGoal: "",
          goalMet: false
        });
      }

      const validTypesSet = new Set(SUGGEST_NEXT_BAR_TYPES);
      const suggestedNodeTypes = (parsed.suggestedNodeTypes || [])
        .filter((t) => typeof t === "string" && validTypesSet.has(t))
        .slice(0, 2);
      const suggestedConfig = parsed.suggestedConfig && typeof parsed.suggestedConfig === "object" ? parsed.suggestedConfig : {};
      const connectionHints = Array.isArray(parsed.connectionHints) ? parsed.connectionHints : [];
      const inferredGoal = typeof parsed.inferredGoal === "string" ? parsed.inferredGoal.trim() : "";
      if (conversationId && inferredGoal) {
        dbStudio.updateConversationMacroJourney(conversationId, inferredGoal).catch(() => {});
      }
      return res.json({
        intentSummary: typeof parsed.intentSummary === "string" ? parsed.intentSummary.trim().substring(0, 300) : "",
        suggestedNodeTypes,
        inferredGoal: "",
        goalMet: false,
        suggestedConfig,
        connectionHints,
      });
    }

    // For workflows with 2+ nodes, use the enhanced prompt
    const contextBlock = buildContextBlock(workflowContext);
    let promptToUse = SUGGEST_NEXT_BAR_PROMPT;
    
    // If structurally complete with 4+ nodes, add additional instruction for goalMet
    if (shouldIncludeGoalMet) {
      promptToUse = SUGGEST_NEXT_BAR_PROMPT + `\n\nIMPORTANT: This workflow appears to be structurally complete (has trigger, actions, and connections). Carefully assess whether the inferred goal is already met by the existing nodes. If the goal is fully accomplished, set goalMet to true and return an empty suggestedNodeTypes array. If more nodes would improve or complete the goal, set goalMet to false.`;
    }
    
    const decisionBlock = decisionHistory ? `\n\n[USER DECISION HISTORY]\n${decisionHistory}\n\nIMPORTANT: Do NOT re-suggest node types that the user has already declined or dismissed. Prioritize node types similar to what the user has manually added or accepted.` : "";
    const userContent = contextBlock
      ? `${promptToUse}\n\n${contextBlock}${decisionBlock}`
      : "No workflow context provided.";

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "You are a workflow automation assistant. Return only valid JSON." },
        { role: "user", content: userContent },
      ],
      max_completion_tokens: 256,
      response_format: { type: "json_object" },
    });

    const content = response.choices?.[0]?.message?.content || "{}";
    let parsed;
    try {
      parsed = JSON.parse(content);
    } catch {
      return res.json({ 
        intentSummary: "", 
        suggestedNodeTypes: [],
        inferredGoal: "",
        goalMet: false
      });
    }

    const validTypesSet = new Set(SUGGEST_NEXT_BAR_TYPES);
    const suggestedNodeTypes = (parsed.suggestedNodeTypes || [])
      .filter((t) => typeof t === "string" && validTypesSet.has(t))
      .slice(0, 2);
    
    const suggestedConfig = parsed.suggestedConfig && typeof parsed.suggestedConfig === "object" ? parsed.suggestedConfig : {};
    const connectionHints = Array.isArray(parsed.connectionHints) ? parsed.connectionHints : [];

    // If completeness check failed, don't include goalMet
    if (!shouldIncludeGoalMet) {
      const inferredGoal = typeof parsed.inferredGoal === "string" ? parsed.inferredGoal.trim() : "";
      if (conversationId && inferredGoal) {
        dbStudio.updateConversationMacroJourney(conversationId, inferredGoal).catch(() => {});
      }
      return res.json({
        intentSummary: typeof parsed.intentSummary === "string" ? parsed.intentSummary.trim().substring(0, 300) : "",
        suggestedNodeTypes,
        inferredGoal: "",
        goalMet: false,
        suggestedConfig,
        connectionHints,
      });
    }

    // Include goalMet and inferredGoal only if structurally complete with 4+ nodes
    const inferredGoal = typeof parsed.inferredGoal === "string" ? parsed.inferredGoal.trim().substring(0, 100) : "";
    if (conversationId && inferredGoal) {
      dbStudio.updateConversationMacroJourney(conversationId, inferredGoal).catch(() => {});
    }
    res.json({
      intentSummary: typeof parsed.intentSummary === "string" ? parsed.intentSummary.trim().substring(0, 300) : "",
      suggestedNodeTypes: parsed.goalMet ? [] : suggestedNodeTypes,
      inferredGoal,
      goalMet: typeof parsed.goalMet === "boolean" ? parsed.goalMet : false,
      suggestedConfig,
      connectionHints,
    });
  } catch (error) {
    console.error("Suggest next bar error:", error.message);
    if (process.env.NODE_ENV !== "production") console.error(error.stack);
    res.status(500).json({
      intentSummary: "",
      suggestedNodeTypes: [],
      inferredGoal: "",
      goalMet: false,
      suggestedConfig: {},
      connectionHints: [],
    });
  }
});

// --- TinyGPT Test Proxy ---
const TINYGPT_API_URL = "https://gptbff.gofo.app/chatgpt";
const TINYGPT_AUTH_TOKEN =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiTVdfVE9LRU4iLCJpYXQiOjE3MTM0MzQxMzYsImV4cCI6MzMyMzk0NzY1MzZ9.WkteIQd5UM-IABV-JiTCjftVhunt4dG4_KjoDI8ES-k";

function extractBlocksText(fxData, stateValues = {}) {
  if (!fxData) return "";
  if (typeof fxData === "string") return fxData;
  const blocks = fxData.blocks || [];
  if (blocks.length === 0) return "";
  return blocks
    .map((block) => {
      if (block.type === "PRIMITIVES") {
        return block.value || "";
      }
      if (block.type === "VARIABLE" || block.type === "REF") {
        const varKey = block.value || block.key || "";
        if (stateValues[varKey] !== undefined) {
          return String(stateValues[varKey]);
        }
        return `{{${varKey}}}`;
      }
      return block.value || "";
    })
    .join("");
}

function buildOutputFormat(format, originalOutputFormat) {
  if (originalOutputFormat === "text" || !format || format.length === 0) {
    return { response: "string" };
  }
  const outputFormat = {};
  const fields = Array.isArray(format) ? format : [];
  fields.forEach((field) => {
    const key = field.key || field.label || "";
    if (!key.trim()) return;
    const rawType = (field.type || "string").toLowerCase();
    const typeMap = {
      string: "string",
      number: "number",
      int: "number",
      boolean: "boolean",
      object: "object",
      array: "array",
    };
    outputFormat[key] = typeMap[rawType] || "string";
  });
  if (Object.keys(outputFormat).length === 0) {
    return { response: "string" };
  }
  return outputFormat;
}

app.post("/api/canvas-assistant/tinygpt-test", async (req, res) => {
  try {
    const { goData, stateValues = {} } = req.body || {};
    if (!goData) {
      return res.status(400).json({ error: "goData is required" });
    }

    const persona = extractBlocksText(goData.persona || goData.systemPrompt, stateValues);
    const query = extractBlocksText(goData.query || goData.prompt, stateValues);
    const originalOutputFormat =
      goData._originalOutputFormat ||
      (typeof goData.outputFormat === "string" ? goData.outputFormat : "json");
    const formatArray = goData.format || goData.outputSchema || [];
    const outputFormat = buildOutputFormat(formatArray, originalOutputFormat);

    const apiPayload = { persona, query, outputFormat };

    const apiResponse = await fetch(TINYGPT_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${TINYGPT_AUTH_TOKEN}`,
      },
      body: JSON.stringify(apiPayload),
    });

    if (!apiResponse.ok) {
      const errorText = await apiResponse.text().catch(() => "Unknown error");
      return res.status(apiResponse.status).json({
        error: true,
        message: `TinyGPT API error (${apiResponse.status}): ${errorText}`,
      });
    }

    const result = await apiResponse.json();
    return res.json(result);
  } catch (error) {
    console.error("TinyGPT test proxy error:", error.message);
    return res.status(500).json({
      error: true,
      message: error.message || "Failed to execute TinyGPT test",
    });
  }
});

// Legacy endpoints below are only used if USE_NEW_ARCHITECTURE is false
// If USE_NEW_ARCHITECTURE is true, the new router handles all requests

const PORT = 3003;
app.listen(PORT, "0.0.0.0", async () => {
  console.log(`Canvas Assistant API running on port ${PORT}`);
  try {
    await dbStudio.runMigration();
    console.log("Studio DB migration checked.");
  } catch (e) {
    console.warn("Studio DB migration skip or failed (tables may already exist):", e.message);
  }
});
