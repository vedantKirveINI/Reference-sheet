import express from "express";
import { ChatHandler } from "./handlers/ChatHandler.js";
import { StreamHandler } from "./handlers/StreamHandler.js";
import { GenerateFlowHandler } from "./handlers/GenerateFlowHandler.js";
import { InternalNodeSetupHandler } from "./handlers/InternalNodeSetupHandler.js";
import { IntegrationNodeSetupHandler } from "./handlers/IntegrationNodeSetupHandler.js";
import { SuggestNextBarHandler } from "./handlers/SuggestNextBarHandler.js";
import { TinyGPTHandler } from "./handlers/TinyGPTHandler.js";
import { FormNodeSetupHandler, FormGenerateFlowHandler } from "./form/index.js";
import { PlanActionHandler } from "./handlers/PlanActionHandler.js";
import { FORM_CANVAS_MODE } from "./common/canvas-constants.js";
import { errorHandler } from "./utils/errors.js";
import { isIntegrationNode } from "./utils/internalNodeTypes.js";
import toolRegistry from "./tools/ToolRegistry.js";
import * as dbStudio from "../db-studio.js";

const router = express.Router();

// Initialize handlers
const chatHandler = new ChatHandler();
const streamHandler = new StreamHandler();
const generateFlowHandler = new GenerateFlowHandler();
const internalNodeSetupHandler = new InternalNodeSetupHandler();
const integrationNodeSetupHandler = new IntegrationNodeSetupHandler();
const suggestNextBarHandler = new SuggestNextBarHandler();
const tinyGPTHandler = new TinyGPTHandler();
// Form canvas handlers
const formNodeSetupHandler = new FormNodeSetupHandler();
const formGenerateFlowHandler = new FormGenerateFlowHandler();
const planActionHandler = new PlanActionHandler();

// Conversation endpoints
router.get("/conversation", async (req, res) => {
  try {
    const assetId = req.query.asset_id;
    const threadId = req.query.thread_id || null;
    const userId = req.query.user_id || null;

    if (!assetId) {
      return res.status(400).json({ error: "asset_id is required" });
    }

    const conv = await dbStudio.getOrCreateConversation(assetId, threadId, userId);
    return res.json({
      conversationId: conv.id,
      inferredMacroJourney: conv.inferredMacroJourney || null,
      created: conv.created,
    });
  } catch (err) {
    console.error("Conversation get/create error:", err.message);
    return res.status(500).json({ error: "Failed to get or create conversation" });
  }
});

router.patch("/conversation", async (req, res) => {
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

router.get("/messages", async (req, res) => {
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

router.post("/messages", async (req, res) => {
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

// Main chat endpoint
router.post("/", async (req, res) => {
  await chatHandler.handle(req, res);
});

// Streaming chat endpoint
router.post("/stream", async (req, res) => {
  await streamHandler.handle(req, res);
});

// Generate flow endpoint (JSON response, legacy)
router.post("/generate-flow", async (req, res) => {
  const canvasType = req.body?.canvasType;
  if (canvasType === FORM_CANVAS_MODE) {
    // Form canvas - use form handler
    await formGenerateFlowHandler.handle(req, res);
  } else {
    // Workflow canvas (default) - use existing handler
    await generateFlowHandler.handle(req, res);
  }
});

// Generate flow endpoint (SSE streaming with thinking events)
router.post("/generate-flow-stream", async (req, res) => {
  const canvasType = req.body?.canvasType;
  if (canvasType === FORM_CANVAS_MODE) {
    // Form canvas - use form handler
    await formGenerateFlowHandler.handleStream(req, res);
  } else {
    // Workflow canvas (default) - use existing handler
    await generateFlowHandler.handleStream(req, res);
  }
});

// Setup node endpoint - route by node type: Integration vs Internal, and by canvas type: Form vs Workflow
router.post("/setup-node", async (req, res) => {
  const nodeType = req.body?.nodeType;
  const canvasType = req.body?.canvasType;
  
  if (isIntegrationNode(nodeType)) {
    // Integration nodes - handled by integration handler (available on both Form and Workflow)
    await integrationNodeSetupHandler.handle(req, res);
  } else if (canvasType === FORM_CANVAS_MODE) {
    // Form canvas - use form handler
    await formNodeSetupHandler.handle(req, res);
  } else {
    // Workflow canvas (default) - use existing handler
    await internalNodeSetupHandler.handle(req, res);
  }
});

// Suggest next bar endpoint
router.post("/suggest-next-bar", async (req, res) => {
  await suggestNextBarHandler.handle(req, res);
});

// TinyGPT test proxy endpoint
router.post("/tinygpt-test", async (req, res) => {
  await tinyGPTHandler.handle(req, res);
});

// Plan action endpoint (LLM returns ActionPlan JSON)
router.post("/plan-action", async (req, res) => {
  await planActionHandler.handle(req, res);
});

// Health check endpoint
router.get("/health", async (req, res) => {
  try {
    const health = {
      status: "ok",
      timestamp: new Date().toISOString(),
      checks: {},
    };

    // Check database
    try {
      await dbStudio.getPool().query("SELECT 1");
      health.checks.database = "ok";
    } catch (error) {
      health.checks.database = "error";
      health.status = "degraded";
    }

    // Check OpenAI (if configured)
    if (process.env.OPENAI_API_KEY) {
      health.checks.openai = "configured";
    } else {
      health.checks.openai = "not_configured";
      health.status = "degraded";
    }

    // Check tool registry
    try {
      if (!toolRegistry.initialized) {
        await toolRegistry.initialize();
      }
      const toolCount = toolRegistry.size();
      health.checks.tools = `ok (${toolCount} tools registered)`;
    } catch (error) {
      health.checks.tools = `error: ${error.message}`;
      health.status = "degraded";
    }

    const statusCode = health.status === "ok" ? 200 : 503;
    res.status(statusCode).json(health);
  } catch (error) {
    res.status(503).json({
      status: "error",
      timestamp: new Date().toISOString(),
      error: error.message,
    });
  }
});

// Error handling middleware (must be last)
router.use(errorHandler);

export default router;
