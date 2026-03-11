/**
 * Connection/flow validation rules - Single-journey rule
 * Applies to ALL canvas types (Form, Workflow, Sequence, etc.)
 * Terminal/start rules use type-only registry (type-link-policy.js).
 */

import { getTypeLinkPolicy } from "./type-link-policy.js";

/**
 * Node types that CAN have multiple outgoing routes (branching nodes)
 */
export const NODES_WITH_MULTIPLE_OUTGOING_ROUTES = [
  "IFELSE_V2",
  "IF_ELSE",
  "HITL_V2",
  "HITL",
];

/**
 * Check if a node type can have multiple outgoing routes
 * @param {string} nodeType - Node type string
 * @returns {boolean}
 */
export function canNodeHaveMultipleOutgoingRoutes(nodeType) {
  return NODES_WITH_MULTIPLE_OUTGOING_ROUTES.includes(nodeType);
}

/**
 * Find the last node in the chain (terminal node with no outgoing links)
 * This is where new nodes should be connected when adding to an existing flow
 * @param {Array} nodes - Array of node objects with key property
 * @param {Array} links - Array of link objects with from/to properties
 * @returns {object|null} - Last node in chain or null if no nodes
 */
export function findLastNodeInChain(nodes, links) {
  if (!nodes || nodes.length === 0) return null;
  if (!links || links.length === 0) {
    // If no links, return the last node in the array (assuming order matters)
    return nodes[nodes.length - 1];
  }
  
  // Build a map of outgoing links from each node
  const outgoingLinks = new Map();
  links.forEach((link) => {
    const from = link.from || link.fromKey;
    if (!outgoingLinks.has(from)) {
      outgoingLinks.set(from, []);
    }
    outgoingLinks.get(from).push(link);
  });
  
  // Find nodes with no outgoing links (terminal nodes)
  const terminalNodes = nodes.filter((node) => {
    const key = node.key || node.id;
    return !outgoingLinks.has(key) || outgoingLinks.get(key).length === 0;
  });
  
  // If multiple terminal nodes, prefer non-branching nodes
  // If all are branching, return the first one
  const nonBranchingTerminals = terminalNodes.filter((node) => {
    const type = node.type || node.subType;
    return !canNodeHaveMultipleOutgoingRoutes(type);
  });
  
  if (nonBranchingTerminals.length > 0) {
    return nonBranchingTerminals[0];
  }
  
  // If only branching terminals, return the first one
  if (terminalNodes.length > 0) {
    return terminalNodes[0];
  }
  
  // Fallback: return last node in array
  return nodes[nodes.length - 1];
}

/**
 * Validate that adding a node doesn't violate single-journey rule
 * @param {Array} nodes - Existing nodes
 * @param {Array} links - Existing links
 * @param {string} newNodeType - Type of node being added
 * @param {string} targetNodeKey - Key of node to connect to (optional)
 * @returns {object} - { valid: boolean, error?: string, suggestedTargetKey?: string }
 */
export function validateSingleJourneyRule(nodes, links, newNodeType, targetNodeKey = null) {
  if (!nodes || nodes.length === 0) {
    return { valid: true }; // Empty canvas, no validation needed
  }
  
  // If targetNodeKey is provided, check if that node can have multiple outgoing routes
  if (targetNodeKey) {
    const targetNode = nodes.find((n) => (n.key || n.id) === targetNodeKey);
    if (targetNode) {
      const targetType = targetNode.type || targetNode.subType;
      const canHaveMultiple = canNodeHaveMultipleOutgoingRoutes(targetType);
      
      // Check if target node already has outgoing links
      const existingOutgoing = (links || []).filter((l) => {
        const from = l.from || l.fromKey;
        return from === targetNodeKey;
      });
      
      // If target node already has outgoing links and is not a branching node, this violates the rule
      if (existingOutgoing.length > 0 && !canHaveMultiple) {
        const lastNode = findLastNodeInChain(nodes, links);
        return {
          valid: false,
          error: `Cannot connect to "${targetNode.name || targetType}" - it already has an outgoing connection. Connect to the last node in the chain instead.`,
          suggestedTargetKey: lastNode ? (lastNode.key || lastNode.id) : null,
        };
      }
    }
  }
  
  return { valid: true };
}

/**
 * Determine if new node should connect to existing chain vs create new branch
 * @param {Array} nodes - Existing nodes
 * @param {Array} links - Existing links
 * @param {string} newNodeType - Type of node being added
 * @returns {object} - { shouldConnect: boolean, targetKey?: string }
 */
export function shouldConnectToExistingChain(nodes, links, newNodeType) {
  if (!nodes || nodes.length === 0) {
    return { shouldConnect: false }; // No existing chain
  }
  
  const lastNode = findLastNodeInChain(nodes, links);
  if (!lastNode) {
    return { shouldConnect: false };
  }
  
  // Always connect to the last node unless it's a branching node that's already fully connected
  const lastNodeType = lastNode.type || lastNode.subType;
  const canHaveMultiple = canNodeHaveMultipleOutgoingRoutes(lastNodeType);
  
  if (canHaveMultiple) {
    // For branching nodes, we can still connect (they can have multiple routes)
    return { shouldConnect: true, targetKey: lastNode.key || lastNode.id };
  }
  
  // For non-branching nodes, check if they already have an outgoing link
  const existingOutgoing = (links || []).filter((l) => {
    const from = l.from || l.fromKey;
    return from === (lastNode.key || lastNode.id);
  });
  
  if (existingOutgoing.length > 0) {
    // Last node already has outgoing link, cannot add another
    return { shouldConnect: false, error: "Last node already has an outgoing connection" };
  }
  
  return { shouldConnect: true, targetKey: lastNode.key || lastNode.id };
}

/**
 * Validate entire flow structure follows single-journey rule and terminal/start link rules.
 * Terminal/start is determined by type-only registry (getTypeLinkPolicy).
 * @param {Array} nodes - Array of node objects (key, type/subType, name)
 * @param {Array} links - Array of link objects
 * @returns {object} - { valid: boolean, errors: Array<string>, warnings: Array<string> }
 */
export function validateFlowStructure(nodes, links) {
  const errors = [];
  const warnings = [];

  if (!nodes || nodes.length === 0) {
    return { valid: true, errors: [], warnings: [] };
  }

  const outgoingLinksMap = new Map();
  const incomingLinksMap = new Map();
  (links || []).forEach((link) => {
    const from = link.from || link.fromKey;
    const to = link.to || link.toKey;
    if (!outgoingLinksMap.has(from)) {
      outgoingLinksMap.set(from, []);
    }
    outgoingLinksMap.get(from).push(link);
    if (!incomingLinksMap.has(to)) {
      incomingLinksMap.set(to, []);
    }
    incomingLinksMap.get(to).push(link);
  });

  nodes.forEach((node) => {
    const key = node.key || node.id;
    const type = node.type || node.subType;
    const outgoingLinks = outgoingLinksMap.get(key) || [];
    const incomingLinks = incomingLinksMap.get(key) || [];
    const policy = getTypeLinkPolicy(type);

    if (policy.denyToLink && outgoingLinks.length > 0) {
      errors.push(
        `Node "${node.name || type}" is a terminal node and cannot have any outgoing connections.`
      );
    }
    if (policy.denyFromLink && incomingLinks.length > 0) {
      errors.push(
        `Node "${node.name || type}" is a start node and cannot have any incoming connections.`
      );
    }

    if (outgoingLinks.length > 1) {
      if (!canNodeHaveMultipleOutgoingRoutes(type)) {
        errors.push(
          `Node "${node.name || type}" has ${outgoingLinks.length} outgoing connections, but this node type only allows one connection. Only IF-ELSE and HITL nodes can have multiple outgoing routes.`
        );
      }
    }
  });

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}
