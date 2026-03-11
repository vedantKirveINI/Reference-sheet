import { Agent } from "../core/Agent.js";
import * as dbStudio from "../../db-studio.js";
import { ValidationError, asyncHandler, createRequestId, logWithContext } from "../utils/errors.js";

const MAX_MESSAGES = 30;
const MAX_MESSAGE_LENGTH = 4000;

/**
 * ChatHandler - Handles /api/canvas-assistant endpoint
 */
export class ChatHandler {
  constructor() {
    this.agent = new Agent();
    this.initialized = false;
  }

  async initialize() {
    if (!this.initialized) {
      await this.agent.initialize();
      this.initialized = true;
    }
  }

  async handle(req, res) {
    const requestId = createRequestId();
    
    try {
      await this.initialize();

      logWithContext("info", "Chat request received", requestId, {
        path: req.path,
        method: req.method,
      });
      const { messages, workflowContext, mode, conversationId, assetId, userId, accessToken, workspaceId, canvasType } = req.body;

      // Validation
      if (!messages || !Array.isArray(messages)) {
        throw new ValidationError("Messages array is required");
      }

      if (messages.length > MAX_MESSAGES) {
        throw new ValidationError(`Too many messages (max ${MAX_MESSAGES})`);
      }

      const validRoles = new Set(["system", "user", "assistant"]);
      for (const msg of messages) {
        if (!msg.role || !validRoles.has(msg.role)) {
          throw new ValidationError(`Invalid message role: ${msg.role}`);
        }
        if (typeof msg.content !== "string" || msg.content.length > MAX_MESSAGE_LENGTH) {
          throw new ValidationError(`Message content too long (max ${MAX_MESSAGE_LENGTH} chars)`);
        }
      }

      // Get or create conversation
      let convId = conversationId;
      if (!convId && assetId) {
        try {
          const conv = await dbStudio.getOrCreateConversation(assetId, null, userId);
          convId = conv.id;
          logWithContext("info", "Conversation created/retrieved", requestId, {
            conversationId: convId,
            assetId,
          });
        } catch (error) {
          logWithContext("error", "Failed to get/create conversation", requestId, { error: error.message });
          throw error;
        }
      }

      if (!convId) {
        throw new ValidationError("conversationId or assetId is required");
      }

      // Get last user message
      const userMessages = messages.filter(m => m.role === "user");
      const lastUserMessage = userMessages[userMessages.length - 1]?.content || "";

      // Call agent
      logWithContext("info", "Calling agent chat", requestId, {
        conversationId: convId,
        messageLength: lastUserMessage.length,
        mode,
      });

      const result = await this.agent.chat({
        conversationId: convId,
        message: lastUserMessage,
        workflowContext,
        userContext: {
          userId,
          accessToken,
          workspaceId,
          assetId,
        },
        mode,
        canvasType: canvasType ?? workflowContext?.canvasType ?? null,
      });

      logWithContext("info", "Chat response generated", requestId, {
        conversationId: convId,
        responseLength: result.message?.length || 0,
      });

      res.json({
        message: result.message,
        conversationId: convId,
      });
    } catch (error) {
      logWithContext("error", "Chat handler error", requestId, {
        error: error.message,
        stack: process.env.NODE_ENV !== "production" ? error.stack : undefined,
      });

      if (error instanceof ValidationError) {
        return res.status(400).json(error.toJSON());
      }

      res.status(500).json({
        error: true,
        message: error.message || "Failed to process chat request",
        code: "CHAT_ERROR",
      });
    }
  }
}
