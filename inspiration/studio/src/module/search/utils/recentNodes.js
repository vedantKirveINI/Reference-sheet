import { CANVAS_MODE, CANVAS_MODES } from "@oute/oute-ds.core.constants";

const RECENT_NODES_KEY = "oute_recent_nodes";
const MAX_RECENT_NODES = 4;
const MAX_AGE_DAYS = 30;

let recentNodesCache = null;
let cachedMode = null;

const processStoredNodes = (nodes, mode) => {
  const now = Date.now();
  const maxAge = MAX_AGE_DAYS * 24 * 60 * 60 * 1000;

  const validNodes = nodes.filter((node) => {
    const age = now - node.timestamp;
    return age < maxAge && node?.mode === mode;
  });

  return validNodes
    .sort((a, b) => b.timestamp - a.timestamp)
    .slice(0, MAX_RECENT_NODES)
    .map((node) => node.node);
};

/**
 * Get recent nodes from cache or localStorage
 * @returns {Array} Array of recent node objects with timestamp
 */
export const getRecentNodes = () => {
  try {
    const mode = CANVAS_MODE();
    
    if (recentNodesCache !== null && cachedMode === mode) {
      return recentNodesCache;
    }

    const stored = localStorage.getItem(RECENT_NODES_KEY);
    if (!stored) {
      recentNodesCache = [];
      cachedMode = mode;
      return [];
    }

    const nodes = JSON.parse(stored);
    const now = Date.now();
    const maxAge = MAX_AGE_DAYS * 24 * 60 * 60 * 1000;

    const validNodes = nodes.filter((node) => {
      const age = now - node.timestamp;
      return age < maxAge && node?.mode === mode;
    });

    if (validNodes.length !== nodes.length) {
      localStorage.setItem(RECENT_NODES_KEY, JSON.stringify(validNodes));
    }

    recentNodesCache = validNodes
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, MAX_RECENT_NODES)
      .map((node) => node.node);
    cachedMode = mode;

    return recentNodesCache;
  } catch (error) {
    return [];
  }
};

/**
 * Add a node to recent nodes
 * @param {Object} node - Node object to add
 */
export const addRecentNode = (node) => {
  try {
    if (!node || !node.type) return;

    const mode = CANVAS_MODE();

    const existing = getRecentNodes();
    const now = Date.now();

    const filtered = existing.filter(
      (n) => n.type !== node.type || n.name !== node.name
    );

    const updated = [
      { node, timestamp: now },
      ...filtered.map((n) => ({
        node: n,
        timestamp: now,
      })),
    ]
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, MAX_RECENT_NODES);

    const nodesWithTimestamps = updated.map((item) => ({
      node: item.node,
      timestamp: item.timestamp,
      mode,
    }));

    localStorage.setItem(RECENT_NODES_KEY, JSON.stringify(nodesWithTimestamps));

    recentNodesCache = updated.map((item) => item.node);
    cachedMode = mode;
  } catch (error) {
  }
};

/**
 * Clear all recent nodes
 */
export const clearRecentNodes = () => {
  try {
    localStorage.removeItem(RECENT_NODES_KEY);
    recentNodesCache = null;
    cachedMode = null;
  } catch (error) {
  }
};
