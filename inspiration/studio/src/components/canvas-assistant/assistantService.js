
const CANVAS_ASSISTANT_BASE =
  typeof import.meta !== "undefined" && import.meta.env?.REACT_APP_CANVAS_ASSISTANT_API_BASE != null
    ? String(import.meta.env.REACT_APP_CANVAS_ASSISTANT_API_BASE).replace(/\/$/, "")
    : "";
const API_BASE = CANVAS_ASSISTANT_BASE ? `${CANVAS_ASSISTANT_BASE}/api/canvas-assistant` : "/api/canvas-assistant";

export async function getOrCreateConversation(assetId, threadId = null, userId = null) {
  const params = new URLSearchParams({ asset_id: assetId });
  if (threadId != null) params.set("thread_id", threadId);
  if (userId != null) params.set("user_id", userId);
  const response = await fetch(`${API_BASE}/conversation?${params}`);
  if (!response.ok) {
    throw new Error(`Conversation API error: ${response.status}`);
  }
  const data = await response.json();
  return { conversationId: data.conversationId, inferredMacroJourney: data.inferredMacroJourney, created: data.created };
}

export async function getMessages(conversationId) {
  const params = new URLSearchParams({ conversation_id: conversationId, limit: "50" });
  const response = await fetch(`${API_BASE}/messages?${params}`);
  if (!response.ok) {
    throw new Error(`Messages API error: ${response.status}`);
  }
  const data = await response.json();
  return data.messages || [];
}

export async function updateConversationMacroJourney(conversationId, inferredMacroJourney) {
  const response = await fetch(`${API_BASE}/conversation`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ conversationId, inferredMacroJourney: inferredMacroJourney ?? null }),
  });
  if (!response.ok) {
    throw new Error(`Update conversation API error: ${response.status}`);
  }
}

export async function saveMessage(conversationId, role, content, metadata = null) {
  const response = await fetch(`${API_BASE}/messages`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ conversationId, role, content, metadata }),
  });
  if (!response.ok) {
    throw new Error(`Save message API error: ${response.status}`);
  }
  const data = await response.json();
  return data.message;
}

/**
 * Call setup-node to get suggested config for a node (internal or integration).
 * @param {object} params
 * @param {string} params.nodeType - e.g. "HTTP", "Integration", "SELF_EMAIL"
 * @param {string} [params.nodeKey]
 * @param {string} [params.canvasType] - WORKFLOW_CANVAS | WC_CANVAS
 * @param {object} [params.currentConfig] - nodeData.go_data or nodeData.config
 * @param {object|string} [params.dataAtNode] - data available at this node
 * @param {string} [params.macroJourney]
 * @param {string} [params.conversationSnippet] - user message / instruction
 * @param {string} [params.eventId] - for Integration nodes (integration knowledge event id)
 * @param {string} [params.template]
 * @param {Array} [params.connectionsList]
 * @param {object} [params.clarificationAnswers]
 * @returns {Promise<{ config?: object, needs_clarification?: boolean, questions?: string[], connectionHints?: string[], message?: string }>}
 */
export async function setupNode(params) {
  const body = {
    nodeType: params.nodeType,
    nodeKey: params.nodeKey,
    canvasType: params.canvasType,
    currentConfig: params.currentConfig,
    dataAtNode: params.dataAtNode,
    macroJourney: params.macroJourney,
    conversationSnippet: params.conversationSnippet,
    eventId: params.eventId,
    template: params.template,
    connectionsList: params.connectionsList,
    clarificationAnswers: params.clarificationAnswers,
  };
  const response = await fetch(`${API_BASE}/setup-node`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Setup node API error: ${response.status}${text ? ` ${text}` : ""}`);
  }
  const data = await response.json();
  return {
    config: data.config,
    needs_clarification: data.needs_clarification,
    questions: data.questions,
    connectionHints: data.connectionHints,
    message: data.message,
  };
}

export async function sendAssistantMessage(userMessage, conversationHistory = [], workflowContext = {}, mode = null, userContext = {}) {
  console.log("[assistantService] sendAssistantMessage called", { userMessage, mode, hasWorkflowContext: !!workflowContext });
  const recentHistory = conversationHistory.slice(-10);
  const messages = [];

  recentHistory.forEach((msg) => {
    if (msg.role === "user" || msg.role === "assistant") {
      messages.push({ role: msg.role, content: msg.content });
    }
  });

  if (!recentHistory.find((m) => m.content === userMessage && m.role === "user")) {
    messages.push({ role: "user", content: userMessage });
  }

  const requestBody = {
    messages,
    workflowContext: formatWorkflowContext(workflowContext),
    mode,
    canvasType: workflowContext?.canvasType || null,
    conversationId: userContext.conversationId,
    assetId: userContext.assetId,
    userId: userContext.userId,
    accessToken: userContext.accessToken,
    workspaceId: userContext.workspaceId,
  };
  console.log("[assistantService] Sending chat request", { url: `${API_BASE}`, bodyKeys: Object.keys(requestBody), messageCount: messages.length });

  try {
    const response = await fetch(`${API_BASE}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(requestBody),
    });

    console.log("[assistantService] Chat response status", { status: response.status, ok: response.ok, statusText: response.statusText });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("[assistantService] Chat API error", { status: response.status, errorText });
      throw new Error(`Assistant API error: ${response.status}`);
    }

    const data = await response.json();
    console.log("[assistantService] Chat response data", { hasMessage: !!data.message, messageLength: data.message?.length, dataKeys: Object.keys(data) });
    return data.message || "I'm not sure how to respond to that.";
  } catch (error) {
    console.error("[assistantService] Chat request failed", { error: error.message, stack: error.stack });
    throw error;
  }
}

function formatWorkflowContext(context) {
  if (!context) return null;

  const result = {};

  if (context.flowName) result.flowName = context.flowName;

  if (context.nodes?.length) {
    result.nodes = context.nodes.map((node) => {
      const mapped = {
        name: node.name || node.text || node.type || "Unnamed",
        type: node.type || "unknown",
      };
      if (node.subType) mapped.subType = node.subType;
      if (node.module) mapped.module = node.module;
      if (node.key) mapped.key = node.key;

      if (node.go_data) {
        const cfg = {};
        const gd = node.go_data;
        if (gd.url) cfg.url = typeof gd.url === "string" ? gd.url : gd.url?.text || "[formula]";
        if (gd.method) cfg.method = gd.method;
        if (gd.prompt) cfg.prompt = typeof gd.prompt === "string" ? gd.prompt : gd.prompt?.text || "[formula]";
        if (gd.systemPrompt) cfg.systemPrompt = typeof gd.systemPrompt === "string" ? gd.systemPrompt : "[set]";
        if (gd.connectionId || gd.connection) cfg.connectionId = gd.connectionId || gd.connection;
        if (gd.expression) cfg.expression = typeof gd.expression === "string" ? gd.expression.substring(0, 200) : "[set]";
        if (gd.formula) cfg.formula = "[set]";
        if (gd.subject) cfg.subject = typeof gd.subject === "string" ? gd.subject : "[formula]";
        if (gd.body) cfg.body = "[set]";
        if (gd.input || gd.inputs) cfg.input = "[configured]";
        if (gd.sheetId) cfg.sheetId = gd.sheetId;
        if (gd.tableName) cfg.tableName = gd.tableName;
        if (gd.errorConfig) mapped.errorStrategy = gd.errorConfig.strategy;
        if (Object.keys(cfg).length > 0) mapped.config = cfg;
      }

      if (node.errors?.length) mapped.errors = node.errors;
      if (node.warnings?.length) mapped.warnings = node.warnings;
      if (node._testOutput || node.testOutput) mapped.hasTestData = true;

      return mapped;
    });
  }

  if (context.links?.length) {
    result.links = context.links.map((link) => {
      const mapped = {
        from: link.from,
        to: link.to,
      };
      if (link.fromName) mapped.fromName = link.fromName;
      if (link.toName) mapped.toName = link.toName;
      if (link.label || link.text) mapped.label = link.label || link.text;
      if (link.category === "error" || link.isErrorLink) mapped.isErrorLink = true;
      return mapped;
    });
  }

  if (context.flowIssues?.length) {
    result.flowIssues = context.flowIssues;
  }

  if (context.executionHistory?.length) {
    result.executionHistory = context.executionHistory.slice(0, 5);
  }

  if (context.focusedNode) {
    result.focusedNode = context.focusedNode;
  }

  if (context.availableVariables?.length) {
    result.availableVariables = context.availableVariables;
  }

  if (context.macroJourney) {
    result.macroJourney = context.macroJourney;
  }

  if (context.canvasType != null) result.canvasType = context.canvasType;

  return result;
}

export async function sendAssistantMessageStream(userMessage, conversationHistory = [], workflowContext = {}, mode = null, onChunk, signal, userContext = {}, onThinking) {
  console.log("[assistantService] sendAssistantMessageStream called", { userMessage, mode, hasWorkflowContext: !!workflowContext, hasSignal: !!signal });
  const recentHistory = conversationHistory.slice(-10);
  const messages = [];

  recentHistory.forEach((msg) => {
    if (msg.role === "user" || msg.role === "assistant") {
      messages.push({ role: msg.role, content: msg.content });
    }
  });

  if (!recentHistory.find((m) => m.content === userMessage && m.role === "user")) {
    messages.push({ role: "user", content: userMessage });
  }

  const requestBody = {
    messages,
    workflowContext: formatWorkflowContext(workflowContext),
    mode,
    canvasType: workflowContext?.canvasType || null,
    conversationId: userContext.conversationId,
    assetId: userContext.assetId,
    userId: userContext.userId,
    accessToken: userContext.accessToken,
    workspaceId: userContext.workspaceId,
  };
  console.log("[assistantService] Sending stream request", { url: `${API_BASE}/stream`, bodyKeys: Object.keys(requestBody), messageCount: messages.length });

  try {
    const response = await fetch(`${API_BASE}/stream`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(requestBody),
      signal,
    });

    console.log("[assistantService] Stream response status", { status: response.status, ok: response.ok, statusText: response.statusText });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("[assistantService] Stream API error", { status: response.status, errorText });
      throw new Error(`Assistant API error: ${response.status}`);
    }

    const contentType = response.headers.get("content-type");
    console.log("[assistantService] Stream content-type", { contentType });
    
    if (contentType && contentType.includes("application/json")) {
      const data = await response.json();
      console.log("[assistantService] Stream returned JSON (non-streaming)", { hasMessage: !!data.message, messageLength: data.message?.length, dataKeys: Object.keys(data) });
      onChunk(data.message || "I'm not sure how to respond to that.", true);
      return;
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";
    let chunkCount = 0;
    let totalLength = 0;

    console.log("[assistantService] Starting to read stream");
    while (true) {
      const { done, value } = await reader.read();
      if (done) {
        console.log("[assistantService] Stream done", { chunkCount, totalLength, bufferLength: buffer.length });
        break;
      }

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() || "";

      for (const line of lines) {
        if (line.startsWith("data: ")) {
          const dataContent = line.slice(6).trim();
          
          // Handle [DONE] marker (OpenAI streaming format)
          if (dataContent === "[DONE]") {
            console.log("[assistantService] Stream received [DONE] marker", { chunkCount, totalLength });
            return;
          }
          
          try {
            const data = JSON.parse(dataContent);
            if (data.done) {
              console.log("[assistantService] Stream received done signal", { chunkCount, totalLength });
              return;
            }
            if (data.error) {
              console.error("[assistantService] Stream error in data", { error: data.error });
              throw new Error(data.error);
            }
            if (data.thinking) {
              onThinking?.(data.thinking);
              continue;
            }
            const chunk = data.content || data.delta;
            if (chunk) {
              chunkCount++;
              totalLength += chunk.length;
              onChunk(chunk, false);
            }
          } catch (e) {
            if (e.message === "Stream interrupted") throw e;
            console.warn("[assistantService] Error parsing stream line", { error: e.message, line: line.substring(0, 100) });
          }
        }
      }
    }
    console.log("[assistantService] Stream finished", { chunkCount, totalLength });
  } catch (error) {
    console.error("[assistantService] sendAssistantMessageStream failed", { error: error.message, stack: error.stack, name: error.name });
    throw error;
  }
}

export async function generateFlow(description, workflowContext = {}, userContext = {}, intent = null) {
  const endpoint = `${API_BASE}/generate-flow`;
  const body = {
    description,
    workflowContext: formatWorkflowContext(workflowContext),
    canvasType: workflowContext?.canvasType || null,
    userId: userContext.userId,
    accessToken: userContext.accessToken,
    workspaceId: userContext.workspaceId,
    assetId: userContext.assetId,
    hasClarificationAnswers: userContext.hasClarificationAnswers || false,
  };
  if (intent != null && typeof intent === "object") {
    body.intent = {
      kind: intent.kind,
      operation: intent.operation,
      targetHint: intent.targetHint,
      actionKind: intent.actionKind,
      insertOnly: intent.insertOnly === true,
    };
  }
  const response = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const contentType = response.headers.get("content-type") || "";
  const isJson = contentType.toLowerCase().includes("application/json");

  if (!response.ok) {
    const bodyText = await response.text();
    const detail = bodyText ? ` - ${bodyText.substring(0, 200)}` : "";
    throw new Error(`Generate flow error: ${response.status}${detail}`);
  }

  if (!isJson) {
    throw new Error(
      `Generate flow returned non-JSON response (content-type: ${contentType}, endpoint: ${endpoint}). Expected application/json.`
    );
  }

  const data = await response.json();

  if (data.needsClarification && data.clarificationQuestions) {
    return {
      needsClarification: true,
      clarificationQuestions: data.clarificationQuestions,
      nodes: data.nodes || [],
      reasoning: data.reasoning || null,
    };
  }

  return {
    needsClarification: false,
    clarificationQuestions: [],
    nodes: data.nodes || [],
    reasoning: data.reasoning || null,
  };
}

export async function generateFlowStream(description, workflowContext = {}, userContext = {}, onThinking, signal, intent = null) {
  const body = {
    description,
    workflowContext: formatWorkflowContext(workflowContext),
    canvasType: workflowContext?.canvasType || null,
    userId: userContext.userId,
    accessToken: userContext.accessToken,
    workspaceId: userContext.workspaceId,
    assetId: userContext.assetId,
    hasClarificationAnswers: userContext.hasClarificationAnswers || false,
  };
  if (intent != null && typeof intent === "object") {
    body.intent = {
      kind: intent.kind,
      operation: intent.operation,
      targetHint: intent.targetHint,
      actionKind: intent.actionKind,
      insertOnly: intent.insertOnly === true,
    };
  }
  const response = await fetch(`${API_BASE}/generate-flow-stream`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    signal,
  });

  if (!response.ok) {
    throw new Error(`Generate flow stream error: ${response.status}`);
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let finalResult = null;

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });

    const lines = buffer.split("\n");
    buffer = lines.pop() || "";

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || !trimmed.startsWith("data: ")) continue;
      const payload = trimmed.slice(6);
      if (payload === "[DONE]") continue;

      try {
        const parsed = JSON.parse(payload);
        if (parsed.event === "thinking" && parsed.text) {
          onThinking?.(parsed.text);
        } else if (parsed.event === "result") {
          finalResult = parsed;
        } else if (parsed.event === "error") {
          throw new Error(parsed.message || "Stream error");
        }
      } catch (e) {
        if (e.message === "Stream error" || e.message?.startsWith("Generate")) throw e;
      }
    }
  }

  if (!finalResult) {
    throw new Error("No result received from stream");
  }

  if (finalResult.needsClarification && finalResult.clarificationQuestions) {
    return {
      needsClarification: true,
      clarificationQuestions: finalResult.clarificationQuestions,
      nodes: finalResult.nodes || [],
      reasoning: finalResult.reasoning || null,
    };
  }

  return {
    needsClarification: false,
    clarificationQuestions: [],
    nodes: finalResult.nodes || [],
    reasoning: finalResult.reasoning || null,
  };
}

export async function getSuggestNextBar(workflowContext, decisionHistory = "", conversationId = null) {
  console.log("[assistantService] getSuggestNextBar called", { hasWorkflowContext: !!workflowContext, hasDecisionHistory: !!decisionHistory, conversationId });
  const body = {
    workflowContext: formatWorkflowContext(workflowContext),
    canvasType: workflowContext?.canvasType || null,
    decisionHistory,
  };
  if (conversationId) body.conversationId = conversationId;
  
  try {
    console.log("[assistantService] Sending suggest-next-bar request", { url: `${API_BASE}/suggest-next-bar`, bodyKeys: Object.keys(body) });
    const response = await fetch(`${API_BASE}/suggest-next-bar`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    console.log("[assistantService] suggest-next-bar response status", { status: response.status, ok: response.ok, statusText: response.statusText });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("[assistantService] suggest-next-bar API error", { status: response.status, errorText });
      throw new Error(`Suggest next bar failed: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log("[assistantService] suggest-next-bar response data", { 
      intentSummary: data.intentSummary?.substring(0, 50), 
      suggestedNodeTypes: data.suggestedNodeTypes, 
      inferredGoal: data.inferredGoal,
      goalMet: data.goalMet,
      dataKeys: Object.keys(data)
    });
    return {
      intentSummary: data.intentSummary || "",
      suggestedNodeTypes: data.suggestedNodeTypes || [],
      inferredGoal: data.inferredGoal || "",
      goalMet: Boolean(data.goalMet),
      suggestedConfig: data.suggestedConfig && typeof data.suggestedConfig === "object" ? data.suggestedConfig : {},
      connectionHints: Array.isArray(data.connectionHints) ? data.connectionHints : [],
    };
  } catch (error) {
    console.error("[assistantService] getSuggestNextBar failed", { error: error.message, stack: error.stack });
    throw error;
  }
}

export async function planAction({ canvasType, userMessage, nodeIndex, workflowContext, userContext }) {
  const response = await fetch(`${API_BASE}/plan-action`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      canvasType: canvasType ?? null,
      userMessage,
      nodeIndex: Array.isArray(nodeIndex) ? nodeIndex : [],
      workflowContext: formatWorkflowContext(workflowContext),
      userContext,
    }),
  });
  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Plan action API error: ${response.status}${text ? ` ${text}` : ""}`);
  }
  return await response.json();
}

export const PROACTIVE_TIPS = {
  empty_canvas: {
    message: "Fresh canvas, endless possibilities. Tell me what you want to automate and I'll set it up for you.",
    icon: "🚀",
    priority: 1,
  },
  single_node: {
    message: "Good — you've got your starting point. What should happen next? I can suggest the right step.",
    icon: "👆",
    priority: 2,
  },
  no_connections: {
    message: "Your steps aren't linked yet — drag from one to another so data flows through. Need a hand?",
    icon: "🔗",
    priority: 3,
  },
  no_trigger: {
    message: "Missing a trigger — that's what kicks everything off. Want me to add one for you?",
    icon: "⚡",
    priority: 2,
  },
  unconfigured_node: {
    message: "A few steps need your attention — click one to configure it, or ask me to help set it up.",
    icon: "⚙️",
    priority: 3,
  },
  no_error_handling: {
    message: "Pro tip: add error handling to your external calls so things don't break silently. I can do it for you.",
    icon: "🛡️",
    priority: 5,
  },
  dead_end_branch: {
    message: "One of your paths goes nowhere — want me to suggest what should happen at the end?",
    icon: "🔚",
    priority: 4,
  },
  multiple_nodes: {
    message: "Looking solid! Want to add a safety net? I can set up error handling on your key steps.",
    icon: "🛡️",
    priority: 4,
  },
  has_trigger: {
    message: "Trigger's locked in. Hit the Test button on it to make sure everything fires correctly.",
    icon: "✅",
    priority: 5,
  },
  complex_flow: {
    message: "This is shaping up nicely. Want to add an If/Else to handle different scenarios?",
    icon: "🌿",
    priority: 6,
  },
  has_errors: {
    message: "I spotted some issues — let's fix them together. Click me and I'll walk you through it.",
    icon: "🔴",
    priority: 1,
  },
  ready_to_test: {
    message: "Everything looks wired up. Hit Test and let's see it run!",
    icon: "🧪",
    priority: 6,
  },
};

export function getProactiveTip(workflowContext) {
  if (!workflowContext) return PROACTIVE_TIPS.empty_canvas;

  const { nodes = [], links = [] } = workflowContext;

  if (nodes.length === 0) return PROACTIVE_TIPS.empty_canvas;

  const hasErrors = nodes.some((n) => n.errors?.length > 0);
  if (hasErrors) return PROACTIVE_TIPS.has_errors;

  if (workflowContext.focusedNode) {
    const fn = workflowContext.focusedNode;
    if (fn.errors?.length) {
      return {
        message: `"${fn.name || fn.type}" has a problem — let's sort it out. Click me and I'll help you fix it.`,
        icon: "🔴",
        priority: 1,
      };
    }
    if (fn.warnings?.length) {
      return {
        message: `"${fn.name || fn.type}" needs a quick setup. I can walk you through it — just ask.`,
        icon: "⚙️",
        priority: 2,
      };
    }
    return {
      message: `Looking at "${fn.name || fn.type}" — need help configuring it or want to know what it can do?`,
      icon: "💡",
      priority: 3,
    };
  }

  if (nodes.length === 1) return PROACTIVE_TIPS.single_node;

  if (links.length === 0 && nodes.length > 1) return PROACTIVE_TIPS.no_connections;

  const hasTrigger = nodes.some(
    (n) => n.type?.toLowerCase().includes("trigger") || n.category === "trigger"
  );

  if (!hasTrigger && nodes.length >= 2) return PROACTIVE_TIPS.no_trigger;

  const hasWarnings = nodes.some((n) => n.warnings?.length > 0);
  if (hasWarnings) return PROACTIVE_TIPS.unconfigured_node;

  const connectedNodeKeys = new Set();
  links.forEach((l) => {
    connectedNodeKeys.add(l.from);
    connectedNodeKeys.add(l.to);
  });
  const hasDeadEnd = nodes.some((n) => {
    const key = n.key || n.id;
    const isTarget = links.some((l) => l.to === key);
    const isSource = links.some((l) => l.from === key);
    return isTarget && !isSource && !n.type?.toLowerCase().includes("end") && !n.type?.toLowerCase().includes("exit");
  });
  if (hasDeadEnd && nodes.length >= 4) return PROACTIVE_TIPS.dead_end_branch;

  const hasExternalNodes = nodes.some((n) => {
    const t = n.type?.toUpperCase() || "";
    return t.includes("HTTP") || t.includes("INTEGRATION") || t.includes("WEBHOOK") || t.includes("EMAIL");
  });
  const hasErrorHandling = nodes.some((n) => n.go_data?.errorConfig);
  if (hasExternalNodes && !hasErrorHandling && nodes.length >= 3) return PROACTIVE_TIPS.no_error_handling;

  const allConfigured = nodes.every((n) => !n.warnings?.length && !n.errors?.length);
  if (allConfigured && links.length >= nodes.length - 1 && nodes.length >= 3) return PROACTIVE_TIPS.ready_to_test;

  if (nodes.length >= 5) return PROACTIVE_TIPS.complex_flow;
  if (hasTrigger && nodes.length <= 3) return PROACTIVE_TIPS.has_trigger;
  if (nodes.length >= 3) return PROACTIVE_TIPS.multiple_nodes;

  return null;
}
