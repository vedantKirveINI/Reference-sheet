import { useState, useRef, useEffect, useCallback } from "react";
import {
  sendAssistantMessageStream,
  generateFlow,
  generateFlowStream,
  getOrCreateConversation,
  getMessages,
  saveMessage,
  setupNode,
  planAction,
} from "./assistantService.js";
import { getCanvasAdapter, defaultCanvasAdapter } from "./adapters/canvasAdapterRegistry.js";
import { executeActionPlanSteps } from "./fullAi/executeActionPlanSteps.js";
import { inferAssistantIntent } from "./intent/inferAssistantIntent.js";
import { resolveActionTarget } from "./intent/resolveActionTarget.js";
import { runActionPolicyGate } from "./builder/actionPolicyGate.js";
import { executeCanvasAction } from "./builder/executeCanvasAction.js";
import { findLastNodeInChain } from "./builder/connectionRules.js";
import { NODE_TEMPLATES } from "../canvas/templates/nodeTemplates.js";
import {
  INTEGRATION_TYPE,
  TRIGGER_SETUP_V3_TYPE,
  TRIGGER_SETUP_TYPE,
  TIME_BASED_TRIGGER,
  INPUT_SETUP_TYPE,
  WEBHOOK_TYPE,
  FORM_TRIGGER,
  SHEET_TRIGGER,
  SHEET_DATE_FIELD_TRIGGER,
} from "../canvas/extensions/constants/types.js";
import { getNodeSrc } from "../canvas/extensions/extension-utils.jsx";
import { TRIGGER_SETUP_V3_NODE } from "../canvas/extensions/trigger-setup/constants.js";

import { TRANSFORMER_NODE } from "../canvas/extensions/transformer/constants.js";
import { HTTP_NODE } from "../canvas/extensions/http/constants.js";
import { IF_ELSE_NODE_V2 } from "../canvas/extensions/if-else-v2/constants.js";
import { CREATE_RECORD_V2_NODE as CREATE_RECORD_NODE } from "../canvas/extensions/crud-operations/create-record/constants.js";
import { UPDATE_RECORD_V2_NODE as UPDATE_RECORD_NODE } from "../canvas/extensions/crud-operations/update-record/constants.js";
import { DELETE_V2_NODE as DELETE_RECORD_NODE } from "../canvas/extensions/crud-operations/delete-record/constants.js";
import { FIND_ALL_V2_NODE as FIND_ALL_RECORD_NODE } from "../canvas/extensions/crud-operations/find-all/constants.js";
import { FIND_ONE_V2_NODE as FIND_ONE_RECORD_NODE } from "../canvas/extensions/crud-operations/find-one/constants.js";
import { EXECUTE_V2_NODE as EXECUTE_QUERY_NODE } from "../canvas/extensions/crud-operations/execute-query/constants.js";
import DELAY_NODE from "../canvas/extensions/delay/constant.js";
import ITERATOR_NODE from "../canvas/extensions/iterator/constant.js";
import { TINYGPT_NODE } from "../canvas/extensions/tiny-gpt/constants.js";
import TINYGPT_RESEARCHER_NODE from "../canvas/extensions/tiny-gpt-researcher/constant.js";
import TINYGPT_WRITER_NODE from "../canvas/extensions/tiny-gpt-writer/constant.js";
import { TINYGPT_ANALYZER_V2_NODE as TINYGPT_ANALYZER_NODE } from "../canvas/extensions/tiny-gpt-analyzer/constants.js";
import { TINYGPT_SUMMARIZER_V2_NODE as TINYGPT_SUMMARIZER_NODE } from "../canvas/extensions/tiny-gpt-summarizer/constants.js";
import { TINYGPT_TRANSLATOR_V2_NODE as TINYGPT_TRANSLATOR_NODE } from "../canvas/extensions/tiny-gpt-translator/constants.js";
import { TINYGPT_LEARNING_V2_NODE as TINYGPT_LEARNING_NODE } from "../canvas/extensions/tiny-gpt-learning/constants.js";
import { TINYGPT_CONSULTANT_V2_NODE as TINYGPT_CONSULTANT_NODE } from "../canvas/extensions/tiny-gpt-consultant/constants.js";
import { TINYGPT_CREATIVE_V2_NODE as TINYGPT_CREATIVE_NODE } from "../canvas/extensions/tiny-gpt-creative/constants.js";
import { SEND_EMAIL_TO_YOURSELF_V2_NODE as SEND_EMAIL_NODE } from "../canvas/extensions/send-email-to-yourself-v2/constants.js";
import { PERSON_ENRICHMENT_V2_NODE as PERSON_ENRICHMENT_NODE } from "../canvas/extensions/enrichment/person/constants.js";
import { EMAIL_ENRICHMENT_V2_NODE as EMAIL_ENRICHMENT_NODE } from "../canvas/extensions/enrichment/email/constants.js";
import { COMPANY_ENRICHMENT_V2_NODE as COMPANY_ENRICHMENT_NODE } from "../canvas/extensions/enrichment/company/constants.js";
import LOG_NODE from "../canvas/extensions/log/constant.js";
import SKIP_NODE from "../canvas/extensions/skip/constant.js";
import BREAK_NODE from "../canvas/extensions/break/constant.js";
import MATCH_PATTERN_NODE from "../canvas/extensions/text-parsers/match-pattern/constant.js";
import { FOR_EACH_NODE } from "../canvas/extensions/for-each/constants.js";
import { REPEAT_NODE } from "../canvas/extensions/repeat/constants.js";
import { LOOP_UNTIL_NODE } from "../canvas/extensions/loop-until/constants.js";
import { LOOP_END_NODE } from "../canvas/extensions/loop-end/constants.js";
import WEBHOOK_NODE from "../canvas/extensions/webhook/constant.js";
import { QUESTIONS_NODES } from "../canvas/extensions/question-setup/constants/questionNodes.js";
import { transformNodeConfig } from "./transformers/nodeConfigTransformer.js";
import FORMULA_FX_NODE from "../canvas/extensions/formula-fx/constant.js";
import { JUMP_TO_V2_NODE } from "../canvas/extensions/jump-to-v2/constants.js";
import {
  normalizeAiGeneratedGoData,
  resolveJumpToTargetsAfterCreate,
} from "./transformers/normalizeAiGeneratedGoData.js";
import { handleAddTrigger } from "./actions/handleAddTrigger.js";
import { handleAddNode } from "./actions/handleAddNode.js";
import {
  parseDisambiguationReply,
  resolveNodeDefaults,
  buildTriggerGoData,
  getFrontendTriggerType,
  FORM_NODE_REGISTRY,
  TRIGGER_BACKEND_TYPES,
} from "./utils/nodeUtils.js";
import {
  runPlanActionPath,
  runRemovePath,
  runUpdatePath,
  runReplaceNodePath,
  runDisambiguationPath,
} from "./orchestrator/canvasAssistantOrchestrator.js";

export const STORAGE_KEY_PREFIX = "canvas_assistant_history_";
export const MAX_STORED_MESSAGES = 50;

export function loadChatHistory(assetId) {
  if (!assetId) return null;
  try {
    const stored = localStorage.getItem(STORAGE_KEY_PREFIX + assetId);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {}
  return null;
}

export function saveChatHistory(assetId, messages) {
  if (!assetId) return;
  try {
    const toSave = messages.slice(-MAX_STORED_MESSAGES);
    localStorage.setItem(STORAGE_KEY_PREFIX + assetId, JSON.stringify(toSave));
  } catch {}
}

export function clearChatHistory(assetId) {
  if (!assetId) return;
  try {
    localStorage.removeItem(STORAGE_KEY_PREFIX + assetId);
  } catch {}
}

export function parseActions(content) {
  const actionRegex = /\[ACTION:([^\]]+)\]/g;
  const actions = [];
  let match;
  while ((match = actionRegex.exec(content)) !== null) {
    const parts = match[1].split(":");
    const type = parts[0];
    if (ACTION_CONFIG[type] || type === "add_node") {
      actions.push({ type, param: parts.slice(1).join(":") || null });
    }
  }
  return actions;
}

export function cleanContent(content) {
  return content.replace(/\[ACTION:[^\]]+\]/g, "").trim();
}

export const ACTION_CONFIG = {
  add_trigger: { label: "Add a Trigger", icon: "⚡" },
  add_node: { label: "Add Node", icon: "➕" },
  connect_nodes: { label: "Auto-connect Nodes", icon: "🔗" },
  add_error_handling: { label: "Add Error Handling", icon: "🛡️" },
  confirm_replace_form: { label: "Confirm replace", icon: "✓" },
  cancel_replace_form: { label: "Cancel", icon: "✕" },
  confirm_bulk_delete: { label: "Confirm delete", icon: "✓" },
  cancel_bulk_delete: { label: "Cancel", icon: "✕" },
};

export const INITIAL_MESSAGES_WORKFLOW = [
  {
    id: "welcome",
    role: "assistant",
    content:
      "Hey there! I'm TinyAI. I can help you build workflows, explain node types, suggest improvements, and troubleshoot your flow logic. What would you like to know?",
  },
];

export const INITIAL_MESSAGES_FORM = [
  {
    id: "welcome",
    role: "assistant",
    content:
      "I can help you build forms: add questions, validations, routing (Jump To), and connect actions like HTTP Request or Data Transformer. What form are you building?",
  },
];

export const INITIAL_MESSAGES = INITIAL_MESSAGES_WORKFLOW;

export const FRIENDLY_TYPE_NAMES = {
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
  LOG_V2: "Logger",
  END_NODE_V3: "End",
  PLACEHOLDER: "Placeholder",
  HITL: "Human Review",
  AGENT_INPUT: "Agent Input",
  AGENT_OUTPUT: "Agent Output",
  TOOL_INPUT: "Tool Input",
  TOOL_OUTPUT: "Tool Output",
  Integration: "Integration",
  INTEGRATION: "Integration",
  "Input Setup": "Manual Trigger",
  "Success Setup": "Success",
  // Form question types (plan preview must never show internal keys)
  WELCOME: "Welcome",
  ENDING: "Ending",
  SHORT_TEXT: "Short Text",
  LONG_TEXT: "Long Text",
  EMAIL: "Email",
  PHONE_NUMBER: "Phone Number",
  NUMBER: "Number",
  DATE: "Date",
  TIME: "Time",
  MCQ: "Multiple Choice",
  SCQ: "Single Choice",
  DROP_DOWN: "Dropdown",
  DROP_DOWN_STATIC: "Dropdown (Static)",
  YES_NO: "Yes/No",
  FILE_PICKER: "File Picker",
  SIGNATURE: "Signature",
  ADDRESS: "Address",
  CURRENCY: "Currency",
  RATING: "Rating",
  SLIDER: "Slider",
  OPINION_SCALE: "Opinion Scale",
  TERMS_OF_USE: "Terms of Use",
  STRIPE_PAYMENT: "Stripe Payment",
  COLLECT_PAYMENT: "Collect Payment",
  QUESTION_FX: "Question (Formula)",
  ZIP_CODE: "ZIP Code",
  RANKING: "Ranking",
  AUTHORIZATION: "Authorization",
  QUOTE: "Quote",
  KEY_VALUE_TABLE: "Key-Value Table",
  LOADING: "Loading",
  PDF_VIEWER: "PDF Viewer",
  TEXT_PREVIEW: "Text Preview",
  AUTOCOMPLETE: "Autocomplete",
  CLOUD_FILE_EXPLORER: "Cloud File Explorer",
  MULTI_QUESTION_PAGE: "Multi-Question Page",
  QUESTIONS_GRID: "Questions Grid",
  PICTURE: "Picture",
  QUESTION_REPEATER: "Question Repeater",
};

const DEFAULT_NODE_TYPES = new Set([
  "TRIGGER_SETUP_V3",
  "TRIGGER_SETUP",
  "TRIGGER_SETUP_NODE",
  "Input Setup",
  "Success Setup",
  "END_NODE_V3",
]);

export function useCanvasAssistantChat({ assetId, getWorkflowContext, canvasRef, saveNodeDataHandler, getUserContext, canvasType = null }) {
  const [messages, setMessages] = useState(() =>
    canvasType === "WORKFLOW_CANVAS" ? INITIAL_MESSAGES_FORM : INITIAL_MESSAGES_WORKFLOW
  );
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [pendingFlow, setPendingFlow] = useState(null);
  const [thinkingSteps, setThinkingSteps] = useState([]);
  const [clarificationData, setClarificationData] = useState(null);
  const [copiedId, setCopiedId] = useState(null);
  const [consumedReplaceMessageIds, setConsumedReplaceMessageIds] = useState(() => new Set());
  const [showOnboarding, setShowOnboarding] = useState(() => {
    if (!assetId) return false;
    const shown = localStorage.getItem("canvas_assistant_onboarded");
    return !shown;
  });
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const streamingId = useRef(null);
  const abortRef = useRef(null);
  const conversationIdRef = useRef(null);
  const inferredMacroJourneyRef = useRef(null);
  const pendingIntentRef = useRef(null);
  const pendingDisambiguationRef = useRef(null);
  const pendingBulkDeleteRef = useRef(null);
  const allowPlacementFallbackRef = useRef(false);

  useEffect(() => {
    if (!assetId) return;
    getOrCreateConversation(assetId)
      .then((conv) => {
        conversationIdRef.current = conv.conversationId;
        if (conv.inferredMacroJourney) inferredMacroJourneyRef.current = conv.inferredMacroJourney;
      })
      .catch(() => {});
  }, [assetId]);

  useEffect(() => {
    if (!showOnboarding) return;
    const timer = setTimeout(() => {
      try {
        const ctx = getWorkflowContext?.() || {};
        const nodes = ctx.nodes || [];
        const realNodes = nodes.filter(
          (n) =>
            !DEFAULT_NODE_TYPES.has(n.type) && !DEFAULT_NODE_TYPES.has(n.subType)
        );
        if (realNodes.length > 0) {
          setShowOnboarding(false);
        }
      } catch {}
    }, 500);
    return () => clearTimeout(timer);
  }, [showOnboarding, getWorkflowContext]);


  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    return () => {
      if (abortRef.current) {
        abortRef.current.abort();
      }
    };
  }, []);

  const handleCopy = useCallback((msgId, content) => {
    navigator.clipboard.writeText(content).then(() => {
      setCopiedId(msgId);
      setTimeout(() => setCopiedId(null), 2000);
    });
  }, []);

  const detectMode = useCallback((text) => {
    const lower = text.toLowerCase();
    if (lower.includes("explain") && (lower.includes("flow") || lower.includes("workflow")))
      return "explain_flow";
    if (lower.includes("health") || lower.includes("audit") || lower.includes("score"))
      return "health_check";
    if (
      lower.includes("debug") ||
      lower.includes("what went wrong") ||
      lower.includes("why did it fail")
    )
      return "debug";
    if (lower.includes("suggest") && (lower.includes("next") || lower.includes("step")))
      return "suggest_next";
    return null;
  }, []);

  const effectiveCanvasType = () => getWorkflowContext?.()?.canvasType ?? canvasType ?? null;

  const shouldRunGenerateFlow = useCallback(
    (text) => {
      const intent = inferAssistantIntent({
        canvasType: effectiveCanvasType(),
        text,
        workflowContext: getWorkflowContext?.() || {},
      });
      return intent.kind === "build_form" || intent.kind === "build_workflow" || intent.kind === "modify_form";
    },
    [canvasType, getWorkflowContext]
  );

  /**
   * Apply generated plan nodes to the canvas. Used by handleBuildFlow (CTA) and by auto-apply for modify_form add/insert.
   * @param {{ planNodes: Array, intent: object, userMessage?: string }} - planNodes from backend, intent from inferAssistantIntent; userMessage for integration prefill
   */
  const applyGeneratedNodesNow = useCallback(
    async ({ planNodes, intent, userMessage }) => {
      if (!planNodes?.length || !canvasRef?.current) return null;

      const diagram = canvasRef.current.getDiagram?.() || canvasRef.current;
      if (!diagram?.model) return null;

      const currentCanvasType = getWorkflowContext?.()?.canvasType ?? canvasType ?? null;
      const existingNodes = diagram.model.nodeDataArray || [];
      const operation = intent?.operation;
      const actionKind = intent?.actionKind;
      const existingLinksForPolicy = diagram.model.linkDataArray || [];
      const isFirstNodeTriggerEarly =
        currentCanvasType !== "WORKFLOW_CANVAS" &&
        planNodes.length > 0 &&
        TRIGGER_BACKEND_TYPES.has(planNodes[0].type);
      const startIndexEarly = isFirstNodeTriggerEarly ? 1 : 0;
      const planNodesForPolicy = planNodes.slice(startIndexEarly);
      const planNodeTypesEarly = planNodesForPolicy.map((n) => n.type);
      const replacePolicy = runActionPolicyGate({
        canvasType: currentCanvasType,
        actionKind: actionKind ?? "replace_graph",
        operation,
        nodes: existingNodes,
        links: existingLinksForPolicy,
        planNodeTypes: planNodeTypesEarly,
        insertMode: "append",
      });
      if (
        (operation === "replace_form" || actionKind === "replace_graph") &&
        existingNodes.length > 0 &&
        replacePolicy.requiresConfirmation
      ) {
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now().toString(),
            role: "assistant",
            content:
              "This will replace your current form. [ACTION:confirm_replace_form] [ACTION:cancel_replace_form]",
          },
        ]);
        return null;
      }

      let anchorNodeKey = null;
      let insertMode = operation === "insert_after" || operation === "insert_before" ? operation : "append";
      const needsTarget = intent?.needsTarget && (insertMode === "insert_after" || insertMode === "insert_before");
      if (needsTarget) {
        const workflowContext = getWorkflowContext?.() || {};
        const resolution = resolveActionTarget({
          diagram,
          workflowContext: { ...workflowContext, nodes: existingNodes },
          targetHint: intent?.targetHint,
          targetStrategy: intent?.targetStrategy,
        });
        if (resolution.status === "ambiguous" && resolution.candidates?.length) {
          const list = resolution.candidates.map((c) => c.name || c.type || c.key).filter(Boolean).join(", ");
          setMessages((prev) => [
            ...prev,
            {
              id: Date.now().toString(),
              role: "assistant",
              content: `More than one node matches. Which one do you mean? (${list}) Please specify by name or select the node and say "after this".`,
            },
          ]);
          return null;
        }
        if (resolution.status === "missing") {
          const content =
            'I couldn\'t find a node matching "' +
            (intent?.targetHint || "that") +
            "\". Please specify which node to insert after or before (e.g. by name or type), or select a node and say \"after this\".";
          setMessages((prev) => [
            ...prev,
            { id: Date.now().toString(), role: "assistant", content },
          ]);
          return null;
        }
        if (resolution.status === "resolved" && resolution.nodeKey) {
          anchorNodeKey = resolution.nodeKey;
        }
      }

      // Form canvas: if appending and last node is ENDING, insert before ENDING so Ending stays last
      if (currentCanvasType === "WORKFLOW_CANVAS" && insertMode === "append") {
        const existingLinksForEnding = diagram.model.linkDataArray || [];
        const lastNode = findLastNodeInChain(existingNodes, existingLinksForEnding);
        if (lastNode) {
          const lastType = (lastNode.type || lastNode.subType || "").toUpperCase();
          if (lastType === "ENDING") {
            anchorNodeKey = lastNode.key || lastNode.id;
            insertMode = "insert_before";
          }
        }
      }

      const startX = 200;
      const startY = 150;
      const spacingY = 120;

      const isFirstNodeTrigger =
        currentCanvasType !== "WORKFLOW_CANVAS" &&
        planNodes.length > 0 &&
        TRIGGER_BACKEND_TYPES.has(planNodes[0].type);

      diagram.startTransaction("generateFlow");
      try {
        if (isFirstNodeTrigger) {
          const firstNode = planNodes[0];
          const frontendType = getFrontendTriggerType(firstNode.type);
          const go_data = buildTriggerGoData(firstNode);
          const existingTrigger = (diagram.model.nodeDataArray || []).find(
            (nd) =>
              nd.template === NODE_TEMPLATES.TRIGGER_SETUP ||
              nd.type === TRIGGER_SETUP_V3_TYPE ||
              nd.subType === TRIGGER_SETUP_TYPE
          );
          if (existingTrigger) {
            diagram.model.setDataProperty(existingTrigger, "type", frontendType);
            diagram.model.setDataProperty(existingTrigger, "subType", TRIGGER_SETUP_TYPE);
            diagram.model.setDataProperty(existingTrigger, "name", firstNode.name || existingTrigger.name);
            diagram.model.setDataProperty(existingTrigger, "text", firstNode.name || existingTrigger.text);
            diagram.model.setDataProperty(existingTrigger, "go_data", go_data);
          } else {
            const triggerKey = `gen_${Date.now()}_trigger`;
            diagram.model.addNodeData({
              ...TRIGGER_SETUP_V3_NODE,
              key: triggerKey,
              type: frontendType,
              subType: TRIGGER_SETUP_TYPE,
              name: firstNode.name || TRIGGER_SETUP_V3_NODE.name,
              text: firstNode.name || TRIGGER_SETUP_V3_NODE.name,
              template: NODE_TEMPLATES.TRIGGER_SETUP,
              category: frontendType,
              location: `${startX} ${startY}`,
              go_data,
            });
          }
        }
        diagram.commitTransaction("generateFlow");
      } catch (err) {
        console.error("Failed to add trigger:", err);
        diagram.commitTransaction("generateFlow");
      }

      const startIndex = isFirstNodeTrigger ? 1 : 0;
      const planNodesForBuilder = planNodes.slice(startIndex);

      if (planNodesForBuilder.length === 0) {
        const count = planNodes.length;
        const successContent =
          currentCanvasType === "WORKFLOW_CANVAS"
            ? `Done! I've added ${count} question${count !== 1 ? "s" : ""}/action${count !== 1 ? "s" : ""} to your form.`
            : `Done! I've added ${count} node${count !== 1 ? "s" : ""} to your canvas. Click any node to configure it.`;
        setMessages((prev) => [
          ...prev,
          { id: Date.now().toString(), role: "assistant", content: successContent },
        ]);
        pendingIntentRef.current = null;
        setPendingFlow(null);
        return successContent;
      }

      const existingLinks = diagram.model.linkDataArray || [];
      const planNodeTypes = planNodesForBuilder.map((n) => n.type);
      const policyResult = runActionPolicyGate({
        canvasType: currentCanvasType,
        actionKind: intent?.actionKind,
        operation,
        nodes: existingNodes,
        links: existingLinks,
        targetNodeKey: anchorNodeKey,
        planNodeTypes,
        insertMode,
        anchorNodeKey,
      });
        if (!policyResult.allowed) {
        const blockContent = policyResult.blockReason || "This action is not allowed on the current canvas.";
        setMessages((prev) => [
          ...prev,
          { id: Date.now().toString(), role: "assistant", content: blockContent },
        ]);
        return null;
      }

      const createNodeData = (planNode, key, i, positionOverride) => {
        const layoutIndex = startIndex + i;
        const x = positionOverride?.x ?? startX;
        const y = positionOverride?.y ?? startY + layoutIndex * spacingY;
        const resolved = resolveNodeDefaults(planNode.type);
        if (resolved) {
          const isFormQuestion = planNode.type in FORM_NODE_REGISTRY;
          const questionDefaults = QUESTIONS_NODES?.[planNode.type];
          const defaultGoData =
            questionDefaults && typeof questionDefaults.go_data === "object" ? questionDefaults.go_data : {};
          const aiConfig =
            planNode.go_data != null && typeof planNode.go_data === "object"
              ? planNode.go_data
              : planNode.config != null && typeof planNode.config === "object"
                ? planNode.config
                : {};
          const go_data = isFormQuestion
            ? transformNodeConfig({
                canvasType: currentCanvasType,
                nodeType: planNode.type,
                aiConfig,
                defaultGoData: { ...defaultGoData },
              }).goData
            : undefined;
          const nodeData = {
            key,
            type: resolved.frontendType,
            subType: resolved.frontendType,
            name: planNode.name,
            text: planNode.name,
            template: resolved.template,
            category: resolved.frontendType,
            _src: resolved._src,
            location: `${x} ${y}`,
            ...(planNode.id && { id: planNode.id }),
            ...(planNode.description && { description: planNode.description }),
            ...(planNode.config && Object.keys(planNode.config).length > 0 && { config: planNode.config }),
          };
          if (isFormQuestion) {
            nodeData.module = "Question";
            nodeData.go_data = go_data;
          } else {
            nodeData.go_data = normalizeAiGeneratedGoData(planNode.type, aiConfig);
          }
          return nodeData;
        }
        const isIntegration = planNode.type === "INTEGRATION" || planNode.type === INTEGRATION_TYPE;
        if (!isIntegration) return null;
        const integrationGoData =
          planNode.integration_id
            ? {
                go_data: {
                  flow: {
                    project_id: planNode.integration_id,
                    ...(planNode.id && { asset_id: planNode.id }),
                    ...(planNode.workflowNodeIdentifier && { workflowNodeIdentifier: planNode.workflowNodeIdentifier }),
                  },
                },
              }
            : {};
        return {
          key,
          type: INTEGRATION_TYPE,
          subType: INTEGRATION_TYPE,
          name: planNode.name,
          text: planNode.name,
          template: NODE_TEMPLATES.CIRCLE,
          category: INTEGRATION_TYPE,
          location: `${x} ${y}`,
          ...(planNode.id && { id: planNode.id }),
          ...(planNode.description && { description: planNode.description }),
          ...(planNode.config && Object.keys(planNode.config).length > 0 && { config: planNode.config }),
          ...(planNode.iconUrl && { _src: planNode.iconUrl }),
          ...integrationGoData,
        };
      };

      const layout = currentCanvasType === "WORKFLOW_CANVAS" ? "horizontal" : "vertical";
      const useLifecycle =
        typeof saveNodeDataHandler === "function" && typeof canvasRef.current?.createNode === "function";
      const result = await executeCanvasAction({
        diagram,
        canvasType: currentCanvasType,
        actionKind: intent?.actionKind,
        operation,
        targetNodeKey: anchorNodeKey,
        planNodes: planNodesForBuilder,
        createNodeData,
        insertMode,
        anchorNodeKey: anchorNodeKey ?? undefined,
        addNode: useLifecycle
          ? async (nodeData) => {
              const newNode = canvasRef.current?.createNode(nodeData, { openNodeAfterCreate: false });
              return { key: newNode?.data?.key ?? nodeData.key };
            }
          : undefined,
        hydrateNode: useLifecycle
          ? async (createdNodeData) => {
              saveNodeDataHandler(
                createdNodeData,
                createdNodeData.go_data || {},
                {},
                false,
                false
              );
            }
          : undefined,
        getNodeByKey: (key) => diagram.model.findNodeDataForKey?.(key) ?? null,
        saveNodeDataHandler,
        layout,
      });

      if (result.success && result.createdKeys?.length) {
        resolveJumpToTargetsAfterCreate({
          diagram,
          createdKeys: result.createdKeys,
          saveNodeDataHandler,
        });
        // Auto-align after adding nodes to avoid overlap (uses LayeredDigraphLayout + zoomToFit)
        canvasRef.current?.autoAlign?.();
        const integrationKeysToResolve = result.createdKeys.filter((key) => {
          const data = diagram.model.findNodeDataForKey?.(key);
          return data && !data._src && (data.type === INTEGRATION_TYPE || data.type === "INTEGRATION");
        });
        if (integrationKeysToResolve.length > 0) {
          setTimeout(async () => {
            for (const key of integrationKeysToResolve) {
              const node = diagram.findNodeForKey?.(key);
              if (!node?.data || node.data._src) continue;
              try {
                const src = await getNodeSrc(node.data, false);
                if (src) {
                  diagram.startTransaction("setIconSrc");
                  diagram.model.setDataProperty(node.data, "_src", src);
                  diagram.commitTransaction("setIconSrc");
                }
              } catch (err) {
                console.warn("[applyGeneratedNodesNow] Icon fetch failed for integration node:", err?.message);
              }
            }
          }, 100);
        }

        const workflowCtx = getWorkflowContext?.() || {};
        const dataAtNode =
          workflowCtx.availableVariables != null
            ? JSON.stringify(workflowCtx.availableVariables)
            : workflowCtx.nodes?.length
              ? JSON.stringify(workflowCtx.nodes.slice(0, 5))
              : "{}";
        for (const key of result.createdKeys) {
          const nodeData = diagram.model.findNodeDataForKey?.(key);
          if (!nodeData) continue;
          const nodeType = nodeData.type || nodeData.subType;
          if (nodeType !== "HTTP") continue;
          const goData = nodeData.go_data || {};
          const hasUrl =
            goData.url != null &&
            (typeof goData.url !== "string" || String(goData.url).trim().length > 0);
          if (hasUrl) continue;
          try {
            const setupResult = await setupNode({
              nodeType: "HTTP",
              nodeKey: key,
              canvasType: currentCanvasType,
              currentConfig: goData,
              dataAtNode,
              macroJourney: inferredMacroJourneyRef?.current ?? undefined,
              conversationSnippet: userMessage ?? undefined,
            });
            if (setupResult.needs_clarification && setupResult.questions?.length) {
              setMessages((prev) => [
                ...prev,
                {
                  id: (Date.now() + 1).toString(),
                  role: "assistant",
                  content: `To configure "${nodeData.name || nodeData.text || "HTTP Request"}": ${setupResult.questions.join(" ")}`,
                },
              ]);
              continue;
            }
            const patch = setupResult.config || {};
            if (Object.keys(patch).length === 0) continue;
            const mergedGoData = { ...goData, ...patch };
            await executeCanvasAction({
              diagram,
              canvasType: currentCanvasType,
              actionKind: "update_node",
              operation: "update",
              targetNodeKey: key,
              payload: { go_data: mergedGoData },
              saveNodeDataHandler,
            });
          } catch (err) {
            console.warn("[applyGeneratedNodesNow] HTTP auto-setup failed for", key, err?.message);
          }
        }

        for (const key of result.createdKeys) {
          const nodeData = diagram.model.findNodeDataForKey?.(key);
          if (!nodeData) continue;
          const nodeType = nodeData.type || nodeData.subType;
          if (nodeType !== "IFELSE_V2") continue;
          if (!userMessage?.trim()) continue;
          const goData = nodeData.go_data || {};
          const hasConditions =
            Array.isArray(goData.conditions) &&
            goData.conditions.some(
              (s) => s?.type === "if" && Array.isArray(s?.conditions) && s.conditions.length > 0 && s.conditions[0]?.operation?.value
            );
          if (hasConditions) continue;
          try {
            const setupResult = await setupNode({
              nodeType: "IFELSE_V2",
              nodeKey: key,
              canvasType: currentCanvasType,
              currentConfig: goData,
              dataAtNode,
              macroJourney: inferredMacroJourneyRef?.current ?? undefined,
              conversationSnippet: userMessage,
            });
            if (setupResult.needs_clarification && setupResult.questions?.length) {
              setMessages((prev) => [
                ...prev,
                {
                  id: (Date.now() + 1).toString(),
                  role: "assistant",
                  content: `To configure "${nodeData.name || nodeData.text || "If/Else"}": ${setupResult.questions.join(" ")}`,
                },
              ]);
              continue;
            }
            const patch = setupResult.config || {};
            if (Object.keys(patch).length === 0) continue;
            const normalizedPatch = normalizeAiGeneratedGoData("IFELSE_V2", { ...goData, ...patch });
            const mergedGoData = { ...goData, ...normalizedPatch };
            await executeCanvasAction({
              diagram,
              canvasType: currentCanvasType,
              actionKind: "update_node",
              operation: "update",
              targetNodeKey: key,
              payload: { go_data: mergedGoData },
              saveNodeDataHandler,
            });
          } catch (err) {
            console.warn("[applyGeneratedNodesNow] IFELSE_V2 auto-setup failed for", key, err?.message);
          }
        }

        const count = result.createdKeys.length;
        let successContent;
        if (currentCanvasType === "WORKFLOW_CANVAS") {
          if (operation === "replace_form" && existingNodes.length > 0) {
            successContent = `Done! I've replaced your form with the new flow. Click any node to configure it.`;
          } else if (insertMode === "insert_after" || insertMode === "insert_before") {
            successContent = `Done! I've inserted ${count} question${count !== 1 ? "s" : ""}/action${count !== 1 ? "s" : ""} and connected them. Click any node to configure it.`;
          } else {
            successContent = `Done! I've added ${count} question${count !== 1 ? "s" : ""}/action${count !== 1 ? "s" : ""} to your form and connected them. Click any node to configure it.`;
          }
        } else {
          successContent = `Done! I've added ${count} nodes to your canvas and connected them in sequence. You'll want to configure each node's settings — click on any node to open its configuration drawer.`;
        }
        if (result.errors?.length) successContent += " " + result.errors.join(" ");
        setMessages((prev) => [
          ...prev,
          { id: Date.now().toString(), role: "assistant", content: successContent },
        ]);
        pendingIntentRef.current = null;
        setPendingFlow(null);

        if (userMessage && result.createdKeys?.length && currentCanvasType === "WORKFLOW_CANVAS") {
          for (const key of result.createdKeys) {
            const nodeData = diagram.model.findNodeDataForKey?.(key);
            if (!nodeData || (nodeData.type !== INTEGRATION_TYPE && nodeData.type !== "Integration")) continue;
            try {
              const setupResult = await setupNode({
                nodeType: "Integration",
                nodeKey: key,
                canvasType: currentCanvasType,
                currentConfig: nodeData.go_data || {},
                conversationSnippet: userMessage,
                eventId: nodeData.id,
                template: nodeData.go_data?.flow?.workflowNodeIdentifier,
              });
              if (setupResult.needs_clarification && setupResult.questions?.length) {
                setMessages((prev) => [
                  ...prev,
                  {
                    id: (Date.now() + 1).toString(),
                    role: "assistant",
                    content: `To configure "${nodeData.name || nodeData.text || "this node"}": ${setupResult.questions.join(" ")}`,
                  },
                ]);
                continue;
              }
              const patch = setupResult.config || {};
              const mergedGoData = { ...(nodeData.go_data || {}), ...patch };
              if (patch.flow != null && typeof patch.flow === "object" && (nodeData.go_data?.flow != null)) {
                mergedGoData.flow = { ...(nodeData.go_data.flow || {}), ...(patch.flow || {}) };
              }
              await executeCanvasAction({
                diagram,
                canvasType: currentCanvasType,
                actionKind: "update_node",
                operation: "update",
                targetNodeKey: key,
                payload: { go_data: mergedGoData },
                saveNodeDataHandler,
              });
            } catch (err) {
              console.warn("[applyGeneratedNodesNow] Integration prefill failed for", key, err?.message);
            }
          }
        }

        return successContent;
      } else {
        const errorContent =
          result.errors?.length > 0
            ? `Couldn't apply the plan: ${result.errors.join(" ")}`
            : currentCanvasType === "WORKFLOW_CANVAS"
              ? "Couldn't add the form nodes. Please try again or adjust the plan."
              : "Couldn't add the workflow nodes. Please try again or adjust the plan.";
        setMessages((prev) => [
          ...prev,
          { id: Date.now().toString(), role: "assistant", content: errorContent },
        ]);
        return errorContent;
      }
    },
    [canvasRef, canvasType, getWorkflowContext, saveNodeDataHandler, setupNode]
  );

  const handleBuildFlow = useCallback(async () => {
    if (!pendingFlow?.length || !canvasRef?.current) return;

    const diagram = canvasRef.current.getDiagram?.() || canvasRef.current;
    if (!diagram?.model) return;

    await applyGeneratedNodesNow({ planNodes: pendingFlow, intent: pendingIntentRef.current });
  }, [pendingFlow, canvasRef, applyGeneratedNodesNow]);

  const handleAction = useCallback(
    (action, messageId) => {
      const isOneShotConfirmOrCancel =
        action.type === "confirm_replace_form" ||
        action.type === "cancel_replace_form" ||
        (typeof action.type === "string" &&
          (action.type.startsWith("confirm_") || action.type.startsWith("cancel_")));
      if (isOneShotConfirmOrCancel && messageId) {
        if (consumedReplaceMessageIds.has(messageId)) return;
        setConsumedReplaceMessageIds((prev) => new Set(prev).add(messageId));
      }
      if (action.type === "confirm_replace_form") {
        if (!pendingFlow?.length) return;
      }

      if (action.type === "cancel_replace_form") {
        pendingIntentRef.current = null;
        setPendingFlow(null);
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now().toString(),
            role: "assistant",
            content: "Cancelled. Your current form was not changed.",
          },
        ]);
        return;
      }

      if (action.type === "cancel_bulk_delete") {
        pendingBulkDeleteRef.current = null;
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now().toString(),
            role: "assistant",
            content: "Cancelled. No nodes were deleted.",
          },
        ]);
        return;
      }

      const diagram = canvasRef?.current?.getDiagram?.() || canvasRef?.current;
      if (!diagram?.model) return;

      if (action.type === "confirm_bulk_delete") {
        const bulk = pendingBulkDeleteRef.current;
        pendingBulkDeleteRef.current = null;
        if (!bulk?.keys?.length) {
          setMessages((prev) => [
            ...prev,
            { id: Date.now().toString(), role: "assistant", content: "Nothing to delete." },
          ]);
          return;
        }
        const currentCanvasType = effectiveCanvasType?.() ?? canvasType ?? "WORKFLOW_CANVAS";
        const keysToDelete = [...bulk.keys];
        const labels = [...bulk.labels];
        (async () => {
          const deleted = [];
          const failed = [];
          for (const key of keysToDelete) {
            const nodeDataArray = diagram.model.nodeDataArray ?? [];
            if (!nodeDataArray.some((n) => (n.key || n.id) === key)) continue;
            const result = await executeCanvasAction({
              diagram,
              canvasType: currentCanvasType,
              actionKind: "remove_node",
              operation: "remove",
              targetNodeKey: key,
            });
            if (result.success && result.removedKeys?.length) deleted.push(key);
            else failed.push(key);
          }
          const deletedLabels = deleted.map((k) => labels[keysToDelete.indexOf(k)]).filter(Boolean);
          const summary =
            failed.length === 0
              ? `Done! I removed ${deleted.length} node(s): ${deletedLabels.join(", ")}.`
              : `Removed ${deleted.length} node(s): ${deletedLabels.join(", ")}.${failed.length ? ` I couldn't remove ${failed.length} node(s).` : ""}`;
          setMessages((prev) => [
            ...prev,
            { id: Date.now().toString(), role: "assistant", content: summary },
          ]);
        })();
        return;
      }

      if (action.type === "confirm_replace_form") {
        const linkDataArray = diagram.model.linkDataArray?.slice() || [];
        const nodeDataArray = diagram.model.nodeDataArray?.slice() || [];
        diagram.startTransaction("clearForm");
        linkDataArray.forEach((link) => diagram.model.removeLinkData(link));
        nodeDataArray.forEach((node) => diagram.model.removeNodeData(node));
        diagram.commitTransaction("clearForm");
        handleBuildFlow();
        return;
      }

      diagram.startTransaction("assistantAction");
      try {
        if (action.type === "add_trigger") {
          const currentCanvasType = getWorkflowContext?.()?.canvasType ?? canvasType ?? null;
          handleAddTrigger({
            diagram,
            canvasType: currentCanvasType,
            getCanvasAdapter,
            setMessages,
          });
        } else if (action.type === "add_node" && action.param) {
          const currentCanvasType = getWorkflowContext?.()?.canvasType ?? canvasType ?? null;
          handleAddNode({
            diagram,
            action,
            canvasType: currentCanvasType,
            saveNodeDataHandler,
            resolveNodeDefaults,
            setMessages,
          });
        } else if (action.type === "connect_nodes") {
          const nodeDataArray = diagram.model.nodeDataArray || [];
          const linkDataArray = diagram.model.linkDataArray || [];
          const connectedTo = new Set(linkDataArray.map((l) => l.to));
          const connectedFrom = new Set(linkDataArray.map((l) => l.from));
          let connected = 0;
          for (let i = 0; i < nodeDataArray.length - 1; i++) {
            const curr = nodeDataArray[i];
            const next = nodeDataArray[i + 1];
            if (!connectedFrom.has(curr.key) && !connectedTo.has(next.key)) {
              diagram.model.addLinkData({ from: curr.key, to: next.key });
              connected++;
            }
          }
          setMessages((prev) => [
            ...prev,
            {
              id: Date.now().toString(),
              role: "assistant",
              content:
                connected > 0
                  ? `Done! I've connected ${connected} pair(s) of nodes. Check the canvas to make sure the flow looks right.`
                  : "All your nodes are already connected!",
            },
          ]);
        }
      } catch (err) {
        console.error("Action failed:", err);
      }
      diagram.commitTransaction("assistantAction");
    },
    [
      canvasRef,
      saveNodeDataHandler,
      getWorkflowContext,
      canvasType,
      handleBuildFlow,
      consumedReplaceMessageIds,
      pendingFlow,
    ]
  );

  const handleSend = useCallback(async () => {
    const trimmed = input.trim();
    if (!trimmed || isLoading) {
      return;
    }

    const userMessage = {
      id: Date.now().toString(),
      role: "user",
      content: trimmed,
    };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    const persistUserMessage = () => {
      const cid = conversationIdRef.current;
      if (cid) {
        saveMessage(cid, "user", trimmed).catch(() => {});
      } else if (assetId) {
        getOrCreateConversation(assetId).then((c) => {
          conversationIdRef.current = c.conversationId;
          saveMessage(c.conversationId, "user", trimmed).catch(() => {});
        }).catch(() => {});
      }
    };
    persistUserMessage();

    let assistantMsgId = null;
    try {
      const currentCanvasType = effectiveCanvasType();
      const intent = inferAssistantIntent({
        canvasType: currentCanvasType,
        text: trimmed,
        workflowContext: getWorkflowContext?.() || {},
      });
      if (currentCanvasType === "WORKFLOW_CANVAS" && intent.kind === "automation_request") {
        setMessages((prev) => [
          ...prev,
          {
            id: (Date.now() + 1).toString(),
            role: "assistant",
            content:
              "I can only help with forms on this canvas. For scheduled or event-driven flows (e.g. triggers, schedules, email automation), please switch to the Workflow canvas.",
          },
        ]);
        return;
      }

      const isFormOrWorkflowCanvas = currentCanvasType === "WORKFLOW_CANVAS" || currentCanvasType === "WC_CANVAS";
      const isReplaceNodeIntent =
        isFormOrWorkflowCanvas && intent.kind === "modify_form" && intent.operation === "replace_node";

      /**
       * AI Assist routing by intent + canvas type:
       *
       * - build_form / build_workflow: ALWAYS use generateFlow. Backend routes by canvasType:
       *   - Form canvas (WORKFLOW_CANVAS) -> FormGenerateFlowHandler (form questions, form prompts)
       *   - Workflow canvas (WC_CANVAS) -> GenerateFlowHandler (triggers, workflow nodes)
       *
       * - modify_form (add/remove/update/insert): use runPlanActionPath -> planAction.
       *   PlanActionHandler is for modifying existing nodes, NOT building from scratch.
       *
       * NEVER route build_form or build_workflow to planAction - it has no canvas-specific handlers.
       */
      const GENERATE_FLOW_INTENTS = new Set(["build_form", "build_workflow"]);
      const isBuildFromScratch = GENERATE_FLOW_INTENTS.has(intent.kind);

      if (!isReplaceNodeIntent && !isBuildFromScratch) {
        try {
          const diagram = canvasRef?.current?.getDiagram?.() ?? canvasRef?.current;
          const userCtx = {
            conversationId: conversationIdRef.current,
            assetId,
            userId: getUserContext?.()?.userId,
            accessToken: getUserContext?.()?.accessToken,
            workspaceId: getUserContext?.()?.workspaceId,
          };

          const result = await runPlanActionPath({
            userMessage: trimmed,
            diagram,
            canvasType: currentCanvasType,
            getWorkflowContext,
            saveNodeDataHandler,
            applyGeneratedNodesNow,
            userContext: userCtx,
            allowPlacementFallback: allowPlacementFallbackRef.current,
            inferredMacroJourney: inferredMacroJourneyRef.current,
          });

          if (result.type === "clarification") {
            const introMsg = (result.message || result.data?.summary || "").trim();
            if (introMsg) {
              setMessages((prev) => [
                ...prev,
                { id: (Date.now() + 1).toString(), role: "assistant", content: introMsg },
              ]);
            }
            setClarificationData(result.data);
            return;
          }

          if (result.explainMessages?.length) {
            for (const msg of result.explainMessages) {
              setMessages((prev) => [
                ...prev,
                { id: (Date.now() + 1).toString(), role: "assistant", content: msg },
              ]);
            }
          }

          if (result.type === "success") {
            if (result.message?.trim()) {
              setMessages((prev) => [
                ...prev,
                { id: (Date.now() + 1).toString(), role: "assistant", content: result.message },
              ]);
            }
            return;
          }

          if (result.type === "missing") {
            setMessages((prev) => [
              ...prev,
              { id: (Date.now() + 1).toString(), role: "assistant", content: result.message },
            ]);
            return;
          }

          if (result.type === "ambiguous") {
            pendingDisambiguationRef.current = result.data.pendingDisambiguation;
            setMessages((prev) => [
              ...prev,
              { id: (Date.now() + 1).toString(), role: "assistant", content: result.data.content },
            ]);
            return;
          }

          if (result.type === "unsupported") {
            // fall through to heuristic path
          } else {
            setMessages((prev) => [
              ...prev,
              { id: (Date.now() + 1).toString(), role: "assistant", content: result.message },
            ]);
            return;
          }
        } catch (_err) {
          setMessages((prev) => [
            ...prev,
            {
              id: (Date.now() + 1).toString(),
              role: "assistant",
              content: "Something went wrong while applying that. Please try again.",
            },
          ]);
          return;
        }
      }

      // Disambiguation reply: user is answering "which one?" for a previous ambiguous delete
      const pending = pendingDisambiguationRef.current;
      if (isFormOrWorkflowCanvas && pending?.kind === "remove" && pending.candidates?.length) {
        const diagram = canvasRef?.current?.getDiagram?.() ?? canvasRef?.current;
        if (!diagram?.model) {
          setMessages((prev) => [
            ...prev,
            {
              id: (Date.now() + 1).toString(),
              role: "assistant",
              content: "I couldn't access the canvas. Please try again.",
            },
          ]);
          return;
        }
        pendingDisambiguationRef.current = null;
        const result = await runDisambiguationPath({
          userMessage: trimmed,
          pendingDisambiguation: pending,
          diagram,
          canvasType: currentCanvasType,
        });
        if (result.type === "unclear") {
          setMessages((prev) => [
            ...prev,
            { id: (Date.now() + 1).toString(), role: "assistant", content: result.message },
          ]);
          return;
        }
        if (result.type === "success" || result.type === "error") {
          setMessages((prev) => [
            ...prev,
            { id: (Date.now() + 1).toString(), role: "assistant", content: result.message },
          ]);
          return;
        }
        if (result.type === "bulk_delete") {
          pendingBulkDeleteRef.current = result.data;
          const labelList = result.data.labels.join(", ");
          setMessages((prev) => [
            ...prev,
            {
              id: (Date.now() + 1).toString(),
              role: "assistant",
              content: `This will delete ${result.data.keys.length} nodes: ${labelList}. [ACTION:confirm_bulk_delete] [ACTION:cancel_bulk_delete]`,
            },
          ]);
          return;
        }
        return;
      }

      // Update node: resolve target, call setup-node (best-effort), apply via update_node
      if (
        isFormOrWorkflowCanvas &&
        intent.kind === "modify_form" &&
        intent.operation === "update"
      ) {
        const diagram = canvasRef?.current?.getDiagram?.() ?? canvasRef?.current;
        if (!diagram?.model) {
          setMessages((prev) => [
            ...prev,
            {
              id: (Date.now() + 1).toString(),
              role: "assistant",
              content: "I couldn't access the canvas. Please try again.",
            },
          ]);
          return;
        }
        const result = await runUpdatePath({
          userMessage: trimmed,
          diagram,
          canvasType: currentCanvasType,
          intent,
          getWorkflowContext,
          saveNodeDataHandler,
          inferredMacroJourney: inferredMacroJourneyRef.current,
        });
        if (result.type === "clarification") {
          setMessages((prev) => [
            ...prev,
            { id: (Date.now() + 1).toString(), role: "assistant", content: result.data.content },
          ]);
          return;
        }
        if (result.type === "missing" || result.type === "ambiguous") {
          setMessages((prev) => [
            ...prev,
            {
              id: (Date.now() + 1).toString(),
              role: "assistant",
              content: result.type === "ambiguous" ? result.data.content : result.message,
            },
          ]);
          return;
        }
        if (result.type === "success" || result.type === "error") {
          setMessages((prev) => [
            ...prev,
            { id: (Date.now() + 1).toString(), role: "assistant", content: result.message },
          ]);
        }
        return;
      }

      // Delete/remove: resolve target and execute remove_node locally (no generate-flow)
      if (
        isFormOrWorkflowCanvas &&
        intent.kind === "modify_form" &&
        intent.operation === "remove"
      ) {
        const diagram = canvasRef?.current?.getDiagram?.() ?? canvasRef?.current;
        if (!diagram?.model) {
          setMessages((prev) => [
            ...prev,
            {
              id: (Date.now() + 1).toString(),
              role: "assistant",
              content: "I couldn't access the canvas. Please try again.",
            },
          ]);
          return;
        }
        const result = await runRemovePath({
          userMessage: trimmed,
          diagram,
          canvasType: currentCanvasType,
          intent,
          getWorkflowContext,
        });
        if (result.type === "missing" || result.type === "ambiguous") {
          if (result.type === "ambiguous") {
            pendingDisambiguationRef.current = result.data.pendingDisambiguation;
          }
          setMessages((prev) => [
            ...prev,
            {
              id: (Date.now() + 1).toString(),
              role: "assistant",
              content: result.type === "ambiguous" ? result.data.content : result.message,
            },
          ]);
          return;
        }
        if (result.type === "success" || result.type === "error") {
          setMessages((prev) => [
            ...prev,
            { id: (Date.now() + 1).toString(), role: "assistant", content: result.message },
          ]);
        }
        return;
      }

      // Replace node: resolve target, remove node, generate replacement (insert_only), insert after predecessor or before successor
      if (
        isFormOrWorkflowCanvas &&
        intent.kind === "modify_form" &&
        intent.operation === "replace_node"
      ) {
        const diagram = canvasRef?.current?.getDiagram?.() ?? canvasRef?.current;
        if (!diagram?.model) {
          setMessages((prev) => [
            ...prev,
            {
              id: (Date.now() + 1).toString(),
              role: "assistant",
              content: "I couldn't access the canvas. Please try again.",
            },
          ]);
          return;
        }
        const userCtx = {
          conversationId: conversationIdRef.current,
          assetId,
          userId: getUserContext?.()?.userId,
          accessToken: getUserContext?.()?.accessToken,
          workspaceId: getUserContext?.()?.workspaceId,
        };
        const result = await runReplaceNodePath({
          userMessage: trimmed,
          diagram,
          canvasType: currentCanvasType,
          intent,
          getWorkflowContext,
          userContext: userCtx,
          signal: abortRef.current?.signal,
        });
        if (result.type === "missing" || result.type === "ambiguous") {
          setMessages((prev) => [
            ...prev,
            {
              id: (Date.now() + 1).toString(),
              role: "assistant",
              content: result.type === "ambiguous" ? result.data.content : result.message,
            },
          ]);
          return;
        }
        if (result.type === "clarification") {
          setMessages((prev) => [
            ...prev,
            { id: (Date.now() + 1).toString(), role: "assistant", content: result.data.content },
          ]);
          return;
        }
        if (result.type === "error") {
          setMessages((prev) => [
            ...prev,
            { id: (Date.now() + 1).toString(), role: "assistant", content: result.message },
          ]);
          return;
        }
        if (result.type === "apply_generated") {
          await applyGeneratedNodesNow({
            planNodes: result.data.planNodes,
            intent: result.data.intent,
            userMessage: result.data.userMessage,
          });
        }
        return;
      }

      if (shouldRunGenerateFlow(trimmed)) {
        const isUnderspecifiedAdd =
          currentCanvasType === "WORKFLOW_CANVAS" &&
          /^add\s+(one\s+)?(a\s+)?(question|field)s?\s*$/i.test(trimmed);
        if (isUnderspecifiedAdd) {
          setMessages((prev) => [
            ...prev,
            {
              id: (Date.now() + 1).toString(),
              role: "assistant",
              content:
                "What question should I add (e.g. name, email, meeting person name) and where should I place it (after which question)?",
            },
          ]);
          return;
        }

        const workflowContext = getWorkflowContext?.() || {};
        workflowContext.canvasType = workflowContext.canvasType ?? canvasType ?? null;
        const userContext = {
          conversationId: conversationIdRef.current,
          assetId,
          userId: getUserContext?.()?.userId,
          accessToken: getUserContext?.()?.accessToken,
          workspaceId: getUserContext?.()?.workspaceId,
        };

        const isInsertAfterOrBefore =
          currentCanvasType === "WORKFLOW_CANVAS" &&
          (intent.operation === "insert_after" || intent.operation === "insert_before");
        if (isInsertAfterOrBefore) {
          const diagram = canvasRef?.current?.getDiagram?.() ?? canvasRef?.current;
          const existingNodes = diagram?.model?.nodeDataArray ?? [];
          const resolution = resolveActionTarget({
            diagram,
            workflowContext: { ...workflowContext, nodes: existingNodes },
            targetHint: intent.targetHint,
            targetStrategy: intent.targetStrategy,
          });
          if (resolution.status === "ambiguous" && resolution.candidates?.length) {
            const list = resolution.candidates
              .map((c) => c.name || c.type || c.key)
              .filter(Boolean)
              .join(", ");
            setMessages((prev) => [
              ...prev,
              {
                id: (Date.now() + 1).toString(),
                role: "assistant",
                content: `More than one node matches. Which one do you mean? (${list}) Please specify by name or select the node and say "after this".`,
              },
            ]);
            return;
          }
          if (resolution.status === "missing") {
            setMessages((prev) => [
              ...prev,
              {
                id: (Date.now() + 1).toString(),
                role: "assistant",
                content:
                  "I couldn't find a node matching \"" +
                  (intent.targetHint || "that") +
                  "\". Please specify which node to insert after or before (e.g. by name or type), or select a node and say \"after this\".",
              },
            ]);
            return;
          }
        }

        setThinkingSteps([{ text: "Understanding your request...", status: "active", ts: Date.now() }]);

        if (abortRef.current) abortRef.current.abort();
        abortRef.current = new AbortController();

        const thinkingQueue = [];
        let processingQueue = false;
        const MIN_STEP_DISPLAY_MS = 600;

        const processQueue = () => {
          if (processingQueue || thinkingQueue.length === 0) return;
          processingQueue = true;
          const text = thinkingQueue.shift();
          setThinkingSteps((prev) => {
            const now = Date.now();
            const updated = prev.map((s) =>
              s.status === "active" ? { ...s, status: "done" } : s
            );
            return [...updated, { text, status: "active", ts: now }];
          });
          setTimeout(() => {
            processingQueue = false;
            processQueue();
          }, MIN_STEP_DISPLAY_MS);
        };

        const onThinking = (text) => {
          thinkingQueue.push(text);
          processQueue();
        };

        const intentPayload =
          intent.kind === "modify_form"
            ? {
                kind: intent.kind,
                operation: intent.operation,
                targetHint: intent.targetHint,
                actionKind: intent.actionKind,
                insertOnly: true,
              }
            : intent.kind === "build_form"
              ? {
                  kind: intent.kind,
                  operation: intent.operation,
                  targetHint: intent.targetHint,
                  actionKind: intent.actionKind,
                  insertOnly: false,
                }
              : null;

        let result;
        try {
          result = await generateFlowStream(
            trimmed,
            workflowContext,
            userContext,
            onThinking,
            abortRef.current?.signal,
            intentPayload
          );
        } catch {
          result = await generateFlow(trimmed, workflowContext, userContext, intentPayload);
        }

        const drainQueue = () => new Promise((resolve) => {
          const check = () => {
            if (thinkingQueue.length === 0 && !processingQueue) {
              resolve();
            } else {
              setTimeout(check, 100);
            }
          };
          check();
        });
        await drainQueue();

        setThinkingSteps((prev) => prev.map((s) => ({ ...s, status: "done" })));

        if (result.needsClarification && result.clarificationQuestions?.length > 0) {
          const clarifyMsg = "I need a couple of details before building this. Please answer the questions below.";
          setMessages((prev) => [
            ...prev,
            {
              id: (Date.now() + 1).toString(),
              role: "assistant",
              content: clarifyMsg,
            },
          ]);
          if (conversationIdRef.current) {
            saveMessage(conversationIdRef.current, "assistant", clarifyMsg).catch(() => {});
          }
          setClarificationData({
            source: "generate_flow",
            questions: result.clarificationQuestions,
            originalRequest: trimmed,
            canvasType: currentCanvasType ?? canvasType ?? null,
          });
        } else if (result.nodes && result.nodes.length > 0) {
          let nodesToApply = result.nodes;
          const isModifyFormAddOrInsert =
            currentCanvasType === "WORKFLOW_CANVAS" &&
            intent.kind === "modify_form" &&
            (intent.operation === "insert_after" || intent.operation === "insert_before" || intent.operation === "append");
          if (isModifyFormAddOrInsert) {
            const lowerTrimmed = trimmed.toLowerCase();
            const userAskedWelcome = lowerTrimmed.includes("welcome");
            const userAskedEnding = lowerTrimmed.includes("ending") || lowerTrimmed.includes("thank you");
            const safeNodes = result.nodes.filter((n) => {
              const type = (n.type || "").toUpperCase();
              if (type === "WELCOME" && !userAskedWelcome) return false;
              if (type === "ENDING" && !userAskedEnding) return false;
              return true;
            });
            if (safeNodes.length !== result.nodes.length) {
              nodesToApply = safeNodes;
            }
          }
          if (nodesToApply.length === 0) {
            setMessages((prev) => [
              ...prev,
              {
                id: (Date.now() + 1).toString(),
                role: "assistant",
                content:
                  "I only got Welcome or Thank You nodes, which can't be inserted in the middle of a form. Try asking to add a specific question (e.g. name, email) after a node.",
              },
            ]);
          } else if (isModifyFormAddOrInsert) {
            // Auto-apply: no plan card or CTA
            const appliedMessage = await applyGeneratedNodesNow({ planNodes: nodesToApply, intent, userMessage: trimmed });
            if (conversationIdRef.current && appliedMessage) {
              saveMessage(conversationIdRef.current, "assistant", appliedMessage).catch(() => {});
            }
          } else {
            pendingIntentRef.current = intent;
            setPendingFlow(nodesToApply);
            const planKind = currentCanvasType === "WORKFLOW_CANVAS" ? "form" : "workflow";
            const nodeList = nodesToApply
              .map(
                (n, i) =>
                  `${i + 1}. **${n.name}** (${FRIENDLY_TYPE_NAMES[n.type] || n.type})${n.description ? ` — ${n.description}` : ""}`
              )
              .join("\n");
            const ctaLabel =
              planKind === "form" && intent.kind === "modify_form"
                ? "Add these to my form"
                : planKind === "form"
                  ? "Build this form"
                  : "Build this flow";
            const flowContent = `Here's what I'd build for you:\n\n${nodeList}\n\nClick "${ctaLabel}" to add these nodes to your canvas, or describe changes you'd like.`;
            setMessages((prev) => [
              ...prev,
              {
                id: (Date.now() + 1).toString(),
                role: "assistant",
                content: flowContent,
                hasFlowPreview: true,
                planKind,
                ...(intent.kind === "modify_form" && { ctaLabel: "Add these to my form" }),
              },
            ]);
            if (conversationIdRef.current) {
              saveMessage(conversationIdRef.current, "assistant", flowContent).catch(() => {});
            }
          }
        } else {
          const fallbackContent =
            currentCanvasType === "WORKFLOW_CANVAS"
              ? "I wasn't able to generate a form plan from that description. Could you give me more detail about what you want the form to collect or do?"
              : "I wasn't able to generate a workflow from that description. Could you give me more detail about what you want the workflow to do?";
          setMessages((prev) => [
            ...prev,
            {
              id: (Date.now() + 1).toString(),
              role: "assistant",
              content: fallbackContent,
            },
          ]);
          if (conversationIdRef.current) {
            saveMessage(conversationIdRef.current, "assistant", fallbackContent).catch(() => {});
          }
        }
      } else {
        const workflowContext = {
          ...(getWorkflowContext?.() || {}),
          macroJourney: inferredMacroJourneyRef.current || undefined,
          canvasType: getWorkflowContext?.()?.canvasType ?? canvasType ?? null,
        };
        const mode = detectMode(trimmed);
        assistantMsgId = (Date.now() + 1).toString();
        setMessages((prev) => [
          ...prev,
          { id: assistantMsgId, role: "assistant", content: "" },
        ]);
        streamingId.current = assistantMsgId;

        if (abortRef.current) abortRef.current.abort();
        abortRef.current = new AbortController();

        const userContext = {
          conversationId: conversationIdRef.current,
          assetId,
          userId: getUserContext?.()?.userId,
          accessToken: getUserContext?.()?.accessToken,
          workspaceId: getUserContext?.()?.workspaceId,
        };

        let receivedChunks = false;
        let thinkingMarkedDone = false;
        const chatThinkingQueue = [];
        let chatProcessing = false;
        const CHAT_STEP_MS = 500;

        const processChatQueue = () => {
          if (chatProcessing || chatThinkingQueue.length === 0) return;
          chatProcessing = true;
          const text = chatThinkingQueue.shift();
          setThinkingSteps((prev) => {
            const updated = prev.map((s) =>
              s.status === "active" ? { ...s, status: "done" } : s
            );
            return [...updated, { text, status: "active", ts: Date.now() }];
          });
          setTimeout(() => {
            chatProcessing = false;
            processChatQueue();
          }, CHAT_STEP_MS);
        };

        const chatOnThinking = (text) => {
          chatThinkingQueue.push(text);
          processChatQueue();
        };

        await sendAssistantMessageStream(
          trimmed,
          messages,
          workflowContext,
          mode,
          (chunk, isFull) => {
            receivedChunks = true;
            if (!thinkingMarkedDone) {
              thinkingMarkedDone = true;
              setThinkingSteps((prev) => prev.map((s) => ({ ...s, status: "done" })));
            }
            setMessages((prev) =>
              prev.map((m) =>
                m.id === assistantMsgId
                  ? { ...m, content: isFull ? chunk : m.content + chunk }
                  : m
              )
            );
            if (isFull && chunk && conversationIdRef.current) {
              saveMessage(conversationIdRef.current, "assistant", chunk).catch(() => {});
            }
          },
          abortRef.current?.signal,
          userContext,
          chatOnThinking
        );

        setMessages((prev) => {
          const assistantMsg = prev.find((m) => m.id === assistantMsgId);
          const next = prev.map((m) =>
            m.id === assistantMsgId && !m.content
              ? { ...m, content: "I wasn't able to generate a response. Please try again." }
              : m
          );
          const finalMsg = next.find((m) => m.id === assistantMsgId);
          if (finalMsg?.content && conversationIdRef.current) {
            saveMessage(conversationIdRef.current, "assistant", finalMsg.content).catch(() => {});
          }
          return next;
        });
      }
    } catch (err) {
      console.error("[useCanvasAssistantChat] handleSendMessage error", { error: err.message, stack: err.stack, streamingId: streamingId.current });
      if (streamingId.current) {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === streamingId.current && !m.content
              ? { ...m, content: "Sorry, I had trouble processing that. Please try again in a moment." }
              : m
          )
        );
      } else {
        setMessages((prev) => [
          ...prev,
          {
            id: (Date.now() + 1).toString(),
            role: "assistant",
            content:
              "Sorry, I had trouble processing that. Please try again in a moment.",
          },
        ]);
      }
    } finally {
      abortRef.current = null;
      setIsLoading(false);
      setThinkingSteps((currentSteps) => {
        if (assistantMsgId && currentSteps.length > 0) {
          const savedSteps = currentSteps.map((s) => ({ ...s, status: "done" }));
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantMsgId
                ? { ...m, thinkingSteps: savedSteps }
                : m
            )
          );
        }
        return currentSteps;
      });
      setTimeout(() => {
        setThinkingSteps([]);
        streamingId.current = null;
      }, 2000);
    }
  }, [
    input,
    isLoading,
    messages,
    getWorkflowContext,
    detectMode,
    shouldRunGenerateFlow,
    canvasType,
    applyGeneratedNodesNow,
  ]);

  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    },
    [handleSend]
  );

  const quickActions =
    effectiveCanvasType() === "WORKFLOW_CANVAS"
    ? [
        { label: "Explain my form", mode: "explain_flow" },
        { label: "Check form health", mode: "health_check" },
        { label: "Suggest next question", mode: "suggest_next" },
        { label: "Help me debug", mode: "debug" },
        { label: "Build a form for me", isGenerate: true },
        { label: "Help write a formula", isFormula: true },
      ]
    : [
        { label: "Explain my workflow", mode: "explain_flow" },
        { label: "Check workflow health", mode: "health_check" },
        { label: "Suggest next step", mode: "suggest_next" },
        { label: "Help me debug", mode: "debug" },
        { label: "Build a workflow for me", isGenerate: true },
        { label: "Help write a formula", isFormula: true },
      ];

  const handleAnswerClarification = useCallback(
    async (answers) => {
      if (!clarificationData) return;

      const { questions, originalRequest, source = "generate_flow" } = clarificationData;
      const isFormCanvas = canvasType === "WORKFLOW_CANVAS";

      const answerStr = (val) => (val != null ? String(val).trim() : "");
      const answersText = questions
        .map((q, idx) => `Q: ${q}\nA: ${answerStr(answers[idx]) || "Not specified"}`)
        .join("\n\n");

      const summaryContent =
        questions
          .map((_, idx) => answerStr(answers[idx]))
          .filter(Boolean)
          .map((a, i) => `${i + 1}. ${a}`)
          .join("; ") || "Answers provided";

      setClarificationData(null);

      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          role: "user",
          content: summaryContent,
          isClarificationAnswer: true,
        },
      ]);

      if (conversationIdRef.current) {
        saveMessage(conversationIdRef.current, "user", summaryContent).catch(() => {});
      }

      setIsLoading(true);

      if (source === "plan_action") {
        setThinkingSteps([{ text: "Applying your choices...", status: "active", ts: Date.now() }]);
        try {
          const combinedPrompt = `${originalRequest}\n\nHere are my answers:\n\n${answersText}`;
          const diagram = canvasRef?.current?.getDiagram?.() ?? canvasRef?.current;
          const currentCanvasType = getWorkflowContext?.()?.canvasType ?? canvasType ?? null;
          const adapter = getCanvasAdapter(currentCanvasType) || defaultCanvasAdapter;
          const nodeIndex = diagram?.model ? adapter.buildNodeIndex(diagram) : [];
          const workflowContext = getWorkflowContext?.() || {};
          const userCtx = {
            conversationId: conversationIdRef.current,
            assetId,
            userId: getUserContext?.()?.userId,
            accessToken: getUserContext?.()?.accessToken,
            workspaceId: getUserContext?.()?.workspaceId,
          };
          const plan = await planAction({
            canvasType: currentCanvasType,
            userMessage: combinedPrompt,
            nodeIndex,
            workflowContext,
            userContext: userCtx,
          });
          setThinkingSteps((prev) => prev.map((s) => ({ ...s, status: "done" })));
          if (plan.needsClarification && plan.clarificationQuestions?.length) {
            if (plan.summary?.trim()) {
              setMessages((prev) => [
                ...prev,
                { id: (Date.now() + 1).toString(), role: "assistant", content: plan.summary },
              ]);
            }
            setClarificationData({
              source: "plan_action",
              questions: plan.clarificationQuestions,
              originalRequest,
              nodeIndex,
              canvasType: currentCanvasType ?? canvasType ?? null,
            });
          } else {
            const execResult = await executeActionPlanSteps({
              plan,
              diagram,
              canvasType: currentCanvasType,
              getWorkflowContext,
              saveNodeDataHandler,
              applyGeneratedNodesNow,
              userMessage: combinedPrompt,
              allowPlacementFallback: allowPlacementFallbackRef.current,
            });
            if (execResult.ok) {
              return;
            } else {
              const errText = execResult.error || "I couldn't apply that. Please try again.";
              setMessages((prev) => [
                ...prev,
                { id: (Date.now() + 1).toString(), role: "assistant", content: errText },
              ]);
            }
          }
        } catch (err) {
          setThinkingSteps((prev) => prev.map((s) => ({ ...s, status: "done" })));
          setMessages((prev) => [
            ...prev,
            { id: (Date.now() + 1).toString(), role: "assistant", content: "Something went wrong. Please try again." },
          ]);
        } finally {
          setIsLoading(false);
          setThinkingSteps([]);
          allowPlacementFallbackRef.current = false;
        }
        return;
      }

      const combinedPrompt = `${originalRequest}\n\nHere are my answers to your questions:\n\n${answersText}\n\nPlease generate the ${isFormCanvas ? "form" : "workflow"} now.`;
      setThinkingSteps([{ text: isFormCanvas ? "Building your form with the provided details..." : "Building your workflow with the provided details...", status: "active", ts: Date.now() }]);

      try {
        const workflowContext = getWorkflowContext?.() || {};
        workflowContext.canvasType = workflowContext.canvasType ?? canvasType ?? null;
        const userContext = {
          conversationId: conversationIdRef.current,
          assetId,
          userId: getUserContext?.()?.userId,
          accessToken: getUserContext?.()?.accessToken,
          workspaceId: getUserContext?.()?.workspaceId,
          hasClarificationAnswers: true,
        };

        const result = await generateFlow(combinedPrompt, workflowContext, userContext);

        setThinkingSteps((prev) => prev.map((s) => ({ ...s, status: "done" })));

        if (result.needsClarification && result.clarificationQuestions?.length > 0) {
          const clarifyMsg = (result.summary || result.message || "").trim();
          if (clarifyMsg) {
            setMessages((prev) => [
              ...prev,
              {
                id: (Date.now() + 1).toString(),
                role: "assistant",
                content: clarifyMsg,
              },
            ]);
            if (conversationIdRef.current) {
              saveMessage(conversationIdRef.current, "assistant", clarifyMsg).catch(() => {});
            }
          }
          setClarificationData({
            source: "generate_flow",
            questions: result.clarificationQuestions,
            originalRequest,
            canvasType: workflowContext?.canvasType ?? canvasType ?? null,
          });
        } else if (result.nodes && result.nodes.length > 0) {
          const ctx = getWorkflowContext?.() || {};
          const canvasTypeForIntent = ctx.canvasType ?? canvasType ?? null;
          pendingIntentRef.current = inferAssistantIntent({
            canvasType: canvasTypeForIntent,
            text: originalRequest,
            workflowContext: ctx,
          });
          setPendingFlow(result.nodes);
          const planKind = workflowContext.canvasType === "WORKFLOW_CANVAS" ? "form" : "workflow";
          const ctaLabel = planKind === "form" ? "Build this form" : "Build this flow";
          const nodeList = result.nodes
            .map(
              (n, i) =>
                `${i + 1}. **${n.name}** (${FRIENDLY_TYPE_NAMES[n.type] || n.type})${n.description ? ` — ${n.description}` : ""}`
            )
            .join("\n");
          const flowContent = `Great! Based on your answers, here's what I'll build:\n\n${nodeList}\n\nClick "${ctaLabel}" to add these nodes to your canvas.`;
          setMessages((prev) => [
            ...prev,
            {
              id: (Date.now() + 1).toString(),
              role: "assistant",
              content: flowContent,
              hasFlowPreview: true,
              planKind,
            },
          ]);
          if (conversationIdRef.current) {
            saveMessage(conversationIdRef.current, "assistant", flowContent).catch(() => {});
          }
        } else {
          const fallbackContent =
            workflowContext.canvasType === "WORKFLOW_CANVAS"
              ? "I wasn't able to generate a form plan from that. Could you provide more details?"
              : "I wasn't able to generate a workflow from that. Could you provide more details?";
          setMessages((prev) => [
            ...prev,
            {
              id: (Date.now() + 1).toString(),
              role: "assistant",
              content: fallbackContent,
            },
          ]);
        }
      } catch (error) {
        const isForm = canvasType === "WORKFLOW_CANVAS";
        console.error(isForm ? "Error generating form from clarification:" : "Error generating workflow from clarification:", error);
        setMessages((prev) => [
          ...prev,
          {
            id: (Date.now() + 1).toString(),
            role: "assistant",
            content: isForm ? "Sorry, I had trouble generating the form. Please try again." : "Sorry, I had trouble generating the workflow. Please try again.",
          },
        ]);
      } finally {
        setIsLoading(false);
        setThinkingSteps([]);
      }
    },
    [
      clarificationData,
      getWorkflowContext,
      getUserContext,
      assetId,
      canvasType,
      canvasRef,
      getCanvasAdapter,
      defaultCanvasAdapter,
      planAction,
      executeActionPlanSteps,
      applyGeneratedNodesNow,
      saveNodeDataHandler,
    ]
  );

  const handleSkipClarification = useCallback(
    async () => {
      if (!clarificationData) return;

      const { originalRequest, source = "generate_flow" } = clarificationData;
      const isFormCanvas = canvasType === "WORKFLOW_CANVAS";

      setClarificationData(null);

      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          role: "user",
          content: "Use best defaults",
          isClarificationAnswer: true,
        },
      ]);

      if (conversationIdRef.current) {
        saveMessage(conversationIdRef.current, "user", "Use best defaults").catch(() => {});
      }

      setIsLoading(true);

      if (source === "plan_action") {
        allowPlacementFallbackRef.current = true;
        setThinkingSteps([{ text: "Applying with default placement...", status: "active", ts: Date.now() }]);
        try {
          const diagram = canvasRef?.current?.getDiagram?.() ?? canvasRef?.current;
          const currentCanvasType = getWorkflowContext?.()?.canvasType ?? canvasType ?? null;
          const adapter = getCanvasAdapter(currentCanvasType) || defaultCanvasAdapter;
          const nodeIndex = diagram?.model ? adapter.buildNodeIndex(diagram) : [];
          const skipPrompt =
            (nodeIndex?.length ?? 0) === 0
              ? `${originalRequest}\n\nThe user chose to skip clarification. The canvas is empty—append the nodes.`
              : `${originalRequest}\n\nThe user chose to skip the clarification questions. If placement is unclear, insert before the end/terminal node.`;
          const workflowContext = getWorkflowContext?.() || {};
          const userCtx = {
            conversationId: conversationIdRef.current,
            assetId,
            userId: getUserContext?.()?.userId,
            accessToken: getUserContext?.()?.accessToken,
            workspaceId: getUserContext?.()?.workspaceId,
          };
          const plan = await planAction({
            canvasType: currentCanvasType,
            userMessage: skipPrompt,
            nodeIndex,
            workflowContext,
            userContext: userCtx,
          });

          if (plan.needsClarification && (!Array.isArray(plan.steps) || plan.steps.length === 0)) {
            setThinkingSteps((prev) => prev.map((s) => ({ ...s, status: "done" })));
            setClarificationData({
              source: "plan_action",
              questions: plan.clarificationQuestions ?? [],
              originalRequest,
              nodeIndex,
              canvasType: currentCanvasType ?? canvasType ?? null,
            });
            setIsLoading(false);
            setThinkingSteps([]);
            allowPlacementFallbackRef.current = false;
            return;
          }

          setThinkingSteps((prev) => prev.map((s) => ({ ...s, status: "done" })));
          const execResult = await executeActionPlanSteps({
            plan,
            diagram,
            canvasType: currentCanvasType,
            getWorkflowContext,
            saveNodeDataHandler,
            applyGeneratedNodesNow,
            userMessage: skipPrompt,
            allowPlacementFallback: true,
          });
          if (execResult.ok) {
            return;
          } else {
            const errText = execResult.error || "I couldn't apply that. Please try again.";
            setMessages((prev) => [
              ...prev,
              { id: (Date.now() + 1).toString(), role: "assistant", content: errText },
            ]);
          }
        } catch (err) {
          setThinkingSteps((prev) => prev.map((s) => ({ ...s, status: "done" })));
          setMessages((prev) => [
            ...prev,
            { id: (Date.now() + 1).toString(), role: "assistant", content: "Something went wrong. Please try again." },
          ]);
        } finally {
          setIsLoading(false);
          setThinkingSteps([]);
          allowPlacementFallbackRef.current = false;
        }
        return;
      }

      const skipPrompt = `${originalRequest}\n\nThe user chose to skip the clarification questions. Please use the best default options and generate the ${isFormCanvas ? "form" : "workflow"} now.`;
      setThinkingSteps([{ text: isFormCanvas ? "Building your form with best defaults..." : "Building your workflow with best defaults...", status: "active", ts: Date.now() }]);

      try {
        const workflowContext = getWorkflowContext?.() || {};
        workflowContext.canvasType = workflowContext.canvasType ?? canvasType ?? null;
        const userContext = {
          conversationId: conversationIdRef.current,
          assetId,
          userId: getUserContext?.()?.userId,
          accessToken: getUserContext?.()?.accessToken,
          workspaceId: getUserContext?.()?.workspaceId,
        };

        const result = await generateFlow(skipPrompt, workflowContext, userContext);

        setThinkingSteps((prev) => prev.map((s) => ({ ...s, status: "done" })));

        if (result.nodes && result.nodes.length > 0) {
          pendingIntentRef.current = inferAssistantIntent({
            canvasType: workflowContext.canvasType ?? canvasType ?? null,
            text: originalRequest,
            workflowContext,
          });
          setPendingFlow(result.nodes);
          const planKind = workflowContext.canvasType === "WORKFLOW_CANVAS" ? "form" : "workflow";
          const ctaLabel = planKind === "form" ? "Build this form" : "Build this flow";
          const nodeList = result.nodes
            .map(
              (n, i) =>
                `${i + 1}. **${n.name}** (${FRIENDLY_TYPE_NAMES[n.type] || n.type})${n.description ? ` — ${n.description}` : ""}`
            )
            .join("\n");
          const flowContent = `Here's what I'll build using best defaults:\n\n${nodeList}\n\nClick "${ctaLabel}" to add these nodes to your canvas.`;
          setMessages((prev) => [
            ...prev,
            {
              id: (Date.now() + 1).toString(),
              role: "assistant",
              content: flowContent,
              hasFlowPreview: true,
              planKind,
            },
          ]);
          if (conversationIdRef.current) {
            saveMessage(conversationIdRef.current, "assistant", flowContent).catch(() => {});
          }
        } else {
          const fallbackContent =
            workflowContext.canvasType === "WORKFLOW_CANVAS"
              ? "I wasn't able to generate a form plan with defaults. Could you provide more details?"
              : "I wasn't able to generate a workflow with defaults. Could you provide more details?";
          setMessages((prev) => [
            ...prev,
            {
              id: (Date.now() + 1).toString(),
              role: "assistant",
              content: fallbackContent,
            },
          ]);
        }
      } catch (error) {
        const isForm = canvasType === "WORKFLOW_CANVAS";
        console.error(isForm ? "Error generating form from skip:" : "Error generating workflow from skip:", error);
        setMessages((prev) => [
          ...prev,
          {
            id: (Date.now() + 1).toString(),
            role: "assistant",
            content: isForm ? "Sorry, I had trouble generating the form. Please try again." : "Sorry, I had trouble generating the workflow. Please try again.",
          },
        ]);
      } finally {
        setIsLoading(false);
        setThinkingSteps([]);
      }
    },
    [
      clarificationData,
      getWorkflowContext,
      getUserContext,
      assetId,
      canvasType,
      canvasRef,
      getCanvasAdapter,
      defaultCanvasAdapter,
      planAction,
      executeActionPlanSteps,
      applyGeneratedNodesNow,
      saveNodeDataHandler,
    ]
  );

  const sendSyntheticMessage = useCallback(
    async (content, mode = null) => {
      const userMsg = {
        id: Date.now().toString(),
        role: "user",
        content,
      };
      const assistantMsgId = (Date.now() + 1).toString();
      const currentMessages = [...messages];
      setMessages((prev) => [...prev, userMsg, { id: assistantMsgId, role: "assistant", content: "" }]);
      setInput("");
      setIsLoading(true);
      streamingId.current = assistantMsgId;
      if (abortRef.current) abortRef.current.abort();
      abortRef.current = new AbortController();
      const workflowContext = {
        ...(getWorkflowContext?.() || {}),
        macroJourney: inferredMacroJourneyRef.current || undefined,
        canvasType: getWorkflowContext?.()?.canvasType ?? canvasType ?? null,
      };
      const userContext = {
        conversationId: conversationIdRef.current,
        assetId,
        userId: getUserContext?.()?.userId,
        accessToken: getUserContext?.()?.accessToken,
        workspaceId: getUserContext?.()?.workspaceId,
      };
      try {
        await sendAssistantMessageStream(
          content,
          [...currentMessages, userMsg],
          workflowContext,
          mode,
          (chunk, isFull) => {
            setMessages((prev) =>
              prev.map((m) =>
                m.id === assistantMsgId
                  ? { ...m, content: isFull ? chunk : m.content + chunk }
                  : m
              )
            );
          },
          abortRef.current?.signal,
          userContext
        );
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantMsgId && !m.content
              ? { ...m, content: "I wasn't able to generate a response. Please try again." }
              : m
          )
        );
      } catch {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantMsgId && !m.content
              ? { ...m, content: "Sorry, something went wrong. Please try again." }
              : m
          )
        );
      } finally {
        streamingId.current = null;
        abortRef.current = null;
        setIsLoading(false);
      }
    },
    [messages, getWorkflowContext, getUserContext, assetId, canvasType]
  );

  return {
    messages,
    setMessages,
    input,
    setInput,
    isLoading,
    handleSend,
    handleKeyDown,
    handleBuildFlow,
    handleAction,
    handleCopy,
    handleAnswerClarification,
    handleSkipClarification,
    clarificationData,
    pendingFlow,
    setPendingFlow,
    consumedReplaceMessageIds,
    copiedId,
    showOnboarding,
    setShowOnboarding,
    messagesEndRef,
    inputRef,
    quickActions,
    streamingId,
    sendSyntheticMessage,
    thinkingSteps,
  };
}
