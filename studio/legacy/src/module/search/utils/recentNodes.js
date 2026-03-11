import { CANVAS_MODE, CANVAS_MODES } from "@oute/oute-ds.core.constants";

const RECENT_NODES_KEY = "oute_recent_nodes";
const MAX_RECENT_NODES = 4;
const MAX_AGE_DAYS = 30;

/**
 * Get recent nodes from localStorage
 * @returns {Array} Array of recent node objects with timestamp
 */
export const getRecentNodes = () => {
  try {
    const stored = localStorage.getItem(RECENT_NODES_KEY);
    if (!stored) return [];

    const nodes = JSON.parse(stored);
    const mode = CANVAS_MODE();
    const now = Date.now();

    const maxAge = MAX_AGE_DAYS * 24 * 60 * 60 * 1000;

    // Filter out old entries
    const validNodes = nodes.filter((node) => {
      const age = now - node.timestamp;
      return age < maxAge && node?.mode === mode;
    });

    // Save cleaned up list if any were removed
    if (validNodes.length !== nodes.length) {
      localStorage.setItem(RECENT_NODES_KEY, JSON.stringify(validNodes));
    }

    // Sort by most recent and limit
    return validNodes
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, MAX_RECENT_NODES)
      .map((node) => node.node);
  } catch (error) {
    console.error("Error getting recent nodes:", error);
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

    // Remove if already exists
    const filtered = existing.filter(
      (n) => n.type !== node.type || n.name !== node.name
    );

    // Add new node at the beginning
    const updated = [
      { node, timestamp: now },
      ...filtered.map((n) => ({
        node: n,
        timestamp: now, // Keep existing timestamp for non-duplicates
      })),
    ]
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, MAX_RECENT_NODES);

    // Reconstruct with timestamps
    const nodesWithTimestamps = updated.map((item) => ({
      node: item.node,
      timestamp: item.timestamp,
      mode,
    }));

    localStorage.setItem(RECENT_NODES_KEY, JSON.stringify(nodesWithTimestamps));
  } catch (error) {
    console.error("Error adding recent node:", error);
  }
};

/**
 * Clear all recent nodes
 */
export const clearRecentNodes = () => {
  try {
    localStorage.removeItem(RECENT_NODES_KEY);
  } catch (error) {
    console.error("Error clearing recent nodes:", error);
  }
};
