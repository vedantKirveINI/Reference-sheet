import { useState, useEffect, useRef, useCallback } from "react";
import { getSuggestNextBar, getOrCreateConversation } from "@/components/canvas-assistant/assistantService";
import {
  canShowSuggestion,
  recordSuggestionShown,
  recordSuggestionDismissed,
  muteForAsset,
} from "@/components/canvas-assistant/suggestionThrottle";
import {
  recordDismissed,
  formatDecisionHistoryForAI,
} from "@/components/canvas-assistant/decisionMemory";

const DEBOUNCE_MS = 1500;

const getWorkflowSignature = (context) => {
  const nodes = context?.nodes || [];
  const links = context?.links || [];
  
  return JSON.stringify({
    nodeCount: nodes.length,
    nodeTypes: nodes.map(n => n.type).sort(),
    linkCount: links.length,
    hasTrigger: nodes.some(n => 
      n.type?.includes("TRIGGER") || n.type?.includes("WEBHOOK")
    ),
    hasAction: nodes.some(n => 
      !n.type?.includes("TRIGGER") && !n.type?.includes("WEBHOOK")
    ),
    hasLinks: links.length > 0,
  });
};

const fuzzyMatchNode = (type, allNodes) => {
  if (!type) return null;
  const upper = (type || "").toUpperCase().replace(/[_\-\s]/g, "");
  const normalize = (str) => (str || "").toUpperCase().replace(/[_\-\s]/g, "");

  return allNodes.find((n) => {
    if (n.isChildAction) return false;
    const nType = normalize(n.type);
    const nSubType = normalize(n.subType);
    const nName = normalize(n.name);

    return (
      nType === upper ||
      nSubType === upper ||
      nType.includes(upper) ||
      nSubType.includes(upper) ||
      upper.includes(nType) ||
      nName.includes(upper) ||
      upper.includes(nName)
    );
  });
};

export function useSuggestionFetcher({ getWorkflowContext, assetId, allNodes = [], nodeCount = 0 }) {
  const [suggestion, setSuggestion] = useState(null);
  const [goalState, setGoalState] = useState({ inferredGoal: "", goalMet: false });
  const [hasPending, setHasPending] = useState(false);
  const debounceRef = useRef(null);
  const prevSignatureRef = useRef(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);

  const fetchSuggestion = useCallback(async () => {
    console.log("[useSuggestionFetcher] fetchSuggestion called", { hasGetWorkflowContext: !!getWorkflowContext, assetId });
    if (!getWorkflowContext || !assetId) {
      console.log("[useSuggestionFetcher] Skipping - missing context or assetId");
      return;
    }
    if (!canShowSuggestion(assetId)) {
      console.log("[useSuggestionFetcher] Skipping - suggestion throttled");
      return;
    }

    try {
      const context = getWorkflowContext();
      const nodes = context?.nodes || [];
      console.log("[useSuggestionFetcher] Workflow context", { nodeCount: nodes.length, nodeTypes: nodes.map(n => n.type) });
      if (nodes.length === 0) {
        console.log("[useSuggestionFetcher] Skipping - no nodes");
        return;
      }

      const decisionHistory = formatDecisionHistoryForAI(assetId);
      let conversationId = null;
      try {
        const conv = await getOrCreateConversation(assetId);
        conversationId = conv.conversationId;
        console.log("[useSuggestionFetcher] Got conversation", { conversationId });
      } catch (err) {
        console.warn("[useSuggestionFetcher] Failed to get conversation", err);
      }
      console.log("[useSuggestionFetcher] Calling getSuggestNextBar", { hasContext: !!context, hasDecisionHistory: !!decisionHistory, conversationId });
      const result = await getSuggestNextBar(context, decisionHistory, conversationId);
      console.log("[useSuggestionFetcher] getSuggestNextBar result", { 
        hasIntentSummary: !!result.intentSummary, 
        suggestedNodeTypes: result.suggestedNodeTypes, 
        goalMet: result.goalMet 
      });
      if (!mountedRef.current) {
        console.log("[useSuggestionFetcher] Component unmounted, skipping");
        return;
      }

      if (result.goalMet) {
        setGoalState({ inferredGoal: result.inferredGoal, goalMet: true });
        setSuggestion(null);
        setHasPending(false);
        return;
      }

      setGoalState({
        inferredGoal: result.inferredGoal || "",
        goalMet: false,
      });

      if (result.suggestedNodeTypes?.length > 0) {
        const suggestedNodes = result.suggestedNodeTypes
          .map((type) => fuzzyMatchNode(type, allNodes))
          .filter(Boolean);

        if (suggestedNodes.length > 0) {
          const newSuggestion = {
            summary: result.intentSummary || "",
            nodes: suggestedNodes,
            suggestedConfig: result.suggestedConfig || {},
            connectionHints: result.connectionHints || [],
          };
          setSuggestion(newSuggestion);
          setHasPending(true);
          recordSuggestionShown();
        }
      }
    } catch (err) {
      console.error("[useSuggestionFetcher] fetch error:", { 
        message: err?.message, 
        stack: err?.stack,
        error: err 
      });
    }
  }, [getWorkflowContext, assetId, allNodes]);

  // Initialize signature on mount
  useEffect(() => {
    if (!getWorkflowContext) return;
    const context = getWorkflowContext();
    prevSignatureRef.current = getWorkflowSignature(context);
  }, [getWorkflowContext]);

  // Track workflow signature changes
  useEffect(() => {
    if (!getWorkflowContext) return;
    
    const context = getWorkflowContext();
    const currentSignature = getWorkflowSignature(context);
    
    // Skip if signature hasn't changed
    if (currentSignature === prevSignatureRef.current) return;
    
    const prevSignature = prevSignatureRef.current;
    prevSignatureRef.current = currentSignature;
    
    // If signature changed significantly (e.g., node count decreased), reset goalMet
    if (prevSignature) {
      const prev = JSON.parse(prevSignature);
      const curr = JSON.parse(currentSignature);
      
      // Reset goalMet if workflow structure degraded
      if (curr.nodeCount < prev.nodeCount || 
          (prev.hasTrigger && prev.hasAction && prev.hasLinks && 
           (!curr.hasTrigger || !curr.hasAction || !curr.hasLinks))) {
        setGoalState(prev => ({ ...prev, goalMet: false }));
      }
    }
    
    // Debounce fetch
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      fetchSuggestion();
    }, DEBOUNCE_MS);
    
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [getWorkflowContext, fetchSuggestion]);

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  const dismissSuggestion = useCallback(() => {
    if (suggestion && assetId) {
      recordDismissed(assetId, suggestion.summary, suggestion.nodes);
    }
    recordSuggestionDismissed();
    setSuggestion(null);
    setHasPending(false);
  }, [suggestion, assetId]);

  const markSeen = useCallback(() => {
    setHasPending(false);
  }, []);

  const clearSuggestion = useCallback(() => {
    setSuggestion(null);
    setHasPending(false);
  }, []);

  const muteSuggestions = useCallback(() => {
    muteForAsset(assetId);
    setSuggestion(null);
    setHasPending(false);
  }, [assetId]);

  return {
    suggestion,
    hasPending,
    goalState,
    dismissSuggestion,
    markSeen,
    clearSuggestion,
    muteSuggestions,
  };
}
