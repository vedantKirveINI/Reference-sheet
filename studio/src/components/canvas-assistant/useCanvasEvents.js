import { useState, useEffect, useRef, useCallback } from "react";

const CONTEXTUAL_NEXT_NODES = {
  HTTP: ["Transformer", "If/Else", "Create Record"],
  INTEGRATION: ["Transformer", "If/Else", "Send Email"],
  IFELSE_V2: ["Send Email", "HTTP Request", "Create Record"],
  "If Else": ["Send Email", "HTTP Request", "Create Record"],
  TRANSFORMER: ["If/Else", "HTTP Request", "Create Record"],
  TRANSFORMER_V3: ["If/Else", "HTTP Request", "Create Record"],
  DB_FIND_ALL: ["Iterator", "Transformer", "If/Else"],
  DB_FIND_ONE: ["If/Else", "Transformer", "HTTP Request"],
  Iterator: ["Aggregator", "Create Record", "Send Email"],
  ITERATOR_V2: ["Aggregator", "Create Record", "Send Email"],
  GPT: ["Transformer", "If/Else", "Send Email"],
  GPT_RESEARCHER: ["GPT Summarizer", "Transformer", "Send Email"],
  GPT_WRITER: ["Send Email", "Create Record", "If/Else"],
  GPT_ANALYZER: ["If/Else", "Transformer", "Create Record"],
  GPT_SUMMARIZER: ["Send Email", "Create Record", "Transformer"],
  TRIGGER_SETUP: ["If/Else", "HTTP Request", "Transformer"],
  FORM_TRIGGER: ["If/Else", "Create Record", "Send Email"],
  "CUSTOM_WEBHOOK": ["Transformer", "If/Else", "Create Record"],
  TIME_BASED_TRIGGER: ["HTTP Request", "Find All", "Send Email"],
  SELF_EMAIL: ["Delay", "If/Else"],
  "Create Record": ["Send Email", "If/Else"],
  CREATE_RECORD_V2: ["Send Email", "If/Else"],
  "Update Record": ["Send Email", "If/Else"],
  UPDATE_RECORD_V2: ["Send Email", "If/Else"],
  PERSON_ENRICHMENT: ["If/Else", "Create Record", "Send Email"],
  PERSON_ENRICHMENT_V2: ["If/Else", "Create Record", "Send Email"],
  COMPANY_ENRICHMENT: ["If/Else", "Create Record", "Send Email"],
  COMPANY_ENRICHMENT_V2: ["If/Else", "Create Record", "Send Email"],
  Delay: ["Send Email", "HTTP Request"],
  DELAY_V2: ["Send Email", "HTTP Request"],
};

const FRUSTRATION_THRESHOLD = 5;
const FRUSTRATION_WINDOW_MS = 15000;
const CELEBRATION_COOLDOWN_MS = 30000;

export default function useCanvasEvents({ getWorkflowContext, onSuggestNext, onFrustration, onCelebration, enabled = true }) {
  const [lastNodeAdded, setLastNodeAdded] = useState(null);
  const prevNodeCountRef = useRef(0);
  const prevLinkCountRef = useRef(0);
  const actionTimestampsRef = useRef([]);
  const lastCelebrationRef = useRef(0);
  const prevErrorCountRef = useRef(0);
  const checkIntervalRef = useRef(null);

  const checkForEvents = useCallback(() => {
    if (!enabled) return;
    const context = getWorkflowContext?.();
    if (!context) return;

    const { nodes = [], links = [], flowIssues = [] } = context;
    const nodeCount = nodes.length;
    const linkCount = links.length;
    const errorCount = nodes.filter((n) => n.errors?.length > 0).length;

    if (nodeCount > prevNodeCountRef.current && nodeCount > 0) {
      const newestNode = nodes[nodes.length - 1];
      if (newestNode) {
        setLastNodeAdded(newestNode);
        const nodeType = newestNode.subType || newestNode.type || "";
        const suggestions = CONTEXTUAL_NEXT_NODES[nodeType];
        if (suggestions && onSuggestNext) {
          onSuggestNext({
            nodeName: newestNode.name || newestNode.type,
            nodeType,
            suggestions,
          });
        }
      }
    }

    const now = Date.now();
    if (nodeCount < prevNodeCountRef.current || linkCount < prevLinkCountRef.current) {
      actionTimestampsRef.current.push(now);
    }
    if (errorCount > prevErrorCountRef.current) {
      actionTimestampsRef.current.push(now);
      actionTimestampsRef.current.push(now);
    }

    const recentActions = actionTimestampsRef.current.filter((t) => now - t < FRUSTRATION_WINDOW_MS);
    actionTimestampsRef.current = recentActions;

    if (recentActions.length >= FRUSTRATION_THRESHOLD && onFrustration) {
      onFrustration();
      actionTimestampsRef.current = [];
    }

    if (errorCount < prevErrorCountRef.current && prevErrorCountRef.current > 0 && now - lastCelebrationRef.current > CELEBRATION_COOLDOWN_MS && onCelebration) {
      onCelebration("error_fixed");
      lastCelebrationRef.current = now;
    }

    prevNodeCountRef.current = nodeCount;
    prevLinkCountRef.current = linkCount;
    prevErrorCountRef.current = errorCount;
  }, [enabled, getWorkflowContext, onSuggestNext, onFrustration, onCelebration]);

  useEffect(() => {
    if (!enabled) return;
    checkIntervalRef.current = setInterval(checkForEvents, 3000);
    return () => clearInterval(checkIntervalRef.current);
  }, [enabled, checkForEvents]);

  return { lastNodeAdded };
}
