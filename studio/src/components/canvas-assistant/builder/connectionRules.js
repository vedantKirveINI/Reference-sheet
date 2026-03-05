/**
 * Connection/flow validation rules - Single-journey rule
 * Mirrors server/canvas-assistant/common/connection-rules.js
 * Most nodes can have only ONE outgoing route; only IF-ELSE and HITL can branch.
 * Terminal/start rules are enforced via type-only registry (typeLinkPolicy).
 */

import { getTypeLinkPolicy } from "./typeLinkPolicy.js";

export const NODES_WITH_MULTIPLE_OUTGOING_ROUTES = [
  "IFELSE_V2",
  "IF_ELSE",
  "HITL_V2",
  "HITL",
];

export function canNodeHaveMultipleOutgoingRoutes(nodeType) {
  return NODES_WITH_MULTIPLE_OUTGOING_ROUTES.includes(nodeType);
}

/**
 * Find the last node in the chain (terminal node with no outgoing links).
 * @param {Array} nodes - Array of node objects with key property
 * @param {Array} links - Array of link objects with from/to properties
 * @returns {object|null}
 */
export function findLastNodeInChain(nodes, links) {
  if (!nodes || nodes.length === 0) return null;
  if (!links || links.length === 0) {
    return nodes[nodes.length - 1];
  }

  const outgoingLinks = new Map();
  links.forEach((link) => {
    const from = link.from || link.fromKey;
    if (!outgoingLinks.has(from)) {
      outgoingLinks.set(from, []);
    }
    outgoingLinks.get(from).push(link);
  });

  const terminalNodes = nodes.filter((node) => {
    const key = node.key || node.id;
    return !outgoingLinks.has(key) || outgoingLinks.get(key).length === 0;
  });

  const nonBranchingTerminals = terminalNodes.filter((node) => {
    const type = node.type || node.subType;
    return !canNodeHaveMultipleOutgoingRoutes(type);
  });

  if (nonBranchingTerminals.length > 0) {
    return nonBranchingTerminals[0];
  }
  if (terminalNodes.length > 0) {
    return terminalNodes[0];
  }
  return nodes[nodes.length - 1];
}

/**
 * Validate entire flow structure follows single-journey rule and terminal/start link rules.
 * Terminal/start is determined by type-only registry (getTypeLinkPolicy); not per-node flags.
 * @param {Array} nodes - Node objects with key, type/subType, name
 * @param {Array} links - Link objects with from, to
 * @returns {{ valid: boolean, errors: string[] }}
 */
export function validateFlowStructure(nodes, links) {
  const errors = [];

  if (!nodes || nodes.length === 0) {
    return { valid: true, errors: [] };
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
          `Node "${node.name || type}" has ${outgoingLinks.length} outgoing connections; only IF-ELSE and HITL nodes can have multiple outgoing routes.`
        );
      }
    }
  });

  return {
    valid: errors.length === 0,
    errors,
  };
}
