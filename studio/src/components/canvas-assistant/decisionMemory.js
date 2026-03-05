const STORAGE_KEY = "tinyai_decision_memory";
const MAX_DECISIONS = 30;

function getStore(assetId) {
  try {
    const raw = sessionStorage.getItem(`${STORAGE_KEY}_${assetId}`);
    if (raw) return JSON.parse(raw);
  } catch {}
  return { accepted: [], declined: [], manualAdds: [], dismissed: [] };
}

function saveStore(assetId, store) {
  try {
    const trimmed = {
      accepted: store.accepted.slice(-MAX_DECISIONS),
      declined: store.declined.slice(-MAX_DECISIONS),
      manualAdds: store.manualAdds.slice(-MAX_DECISIONS),
      dismissed: store.dismissed.slice(-MAX_DECISIONS),
    };
    sessionStorage.setItem(`${STORAGE_KEY}_${assetId}`, JSON.stringify(trimmed));
  } catch {}
}

export function recordAccepted(assetId, nodeType, nodeName, suggestionSummary) {
  const store = getStore(assetId);
  store.accepted.push({
    nodeType,
    nodeName,
    suggestionSummary,
    ts: Date.now(),
  });
  saveStore(assetId, store);
}

export function recordDeclined(assetId, suggestionSummary, suggestedNodes) {
  const store = getStore(assetId);
  store.declined.push({
    suggestionSummary,
    suggestedNodes: suggestedNodes.map((n) => n.type || n.name).filter(Boolean),
    ts: Date.now(),
  });
  saveStore(assetId, store);
}

export function recordManualAdd(assetId, nodeType, nodeName) {
  const store = getStore(assetId);
  const isDuplicate = store.manualAdds.some(
    (m) => m.nodeType === nodeType && Date.now() - m.ts < 2000
  );
  if (!isDuplicate) {
    store.manualAdds.push({ nodeType, nodeName, ts: Date.now() });
    saveStore(assetId, store);
  }
}

export function recordDismissed(assetId, suggestionSummary, suggestedNodes) {
  const store = getStore(assetId);
  store.dismissed.push({
    suggestionSummary,
    suggestedNodes: suggestedNodes.map((n) => n.type || n.name).filter(Boolean),
    ts: Date.now(),
  });
  saveStore(assetId, store);
}

export function getDecisionHistory(assetId) {
  const store = getStore(assetId);
  return {
    accepted: store.accepted,
    declined: store.declined,
    manualAdds: store.manualAdds,
    dismissed: store.dismissed,
  };
}

export function formatDecisionHistoryForAI(assetId) {
  const history = getDecisionHistory(assetId);
  const parts = [];

  if (history.accepted.length > 0) {
    parts.push("Accepted suggestions: " + history.accepted.map((a) => a.nodeName || a.nodeType).join(", "));
  }

  const allDeclined = [...history.declined, ...history.dismissed];
  if (allDeclined.length > 0) {
    const declinedTypes = [...new Set(allDeclined.flatMap((d) => d.suggestedNodes))];
    parts.push("Declined/ignored suggestions: " + declinedTypes.join(", "));
  }

  if (history.manualAdds.length > 0) {
    parts.push("Manually added nodes: " + history.manualAdds.map((m) => m.nodeName || m.nodeType).join(", "));
  }

  return parts.length > 0 ? parts.join(". ") : "";
}

export function clearDecisionMemory(assetId) {
  try {
    sessionStorage.removeItem(`${STORAGE_KEY}_${assetId}`);
  } catch {}
}
