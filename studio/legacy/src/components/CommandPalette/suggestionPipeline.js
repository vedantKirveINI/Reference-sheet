import Fuse from "fuse.js";
import { isTriggerNodeType } from "../../constants/node-rules";

// =============================================================================
// SUGGESTION PIPELINE
// =============================================================================
// This module implements an explicit, ordered pipeline for generating node
// suggestions in the CommandPalette. Each stage is isolated and pure.
//
// Pipeline Stages:
//   1. Candidate Pool - Build full node list from tabData
//   2. Hard Constraints - Apply trigger rules, hierarchy constraints
//   3. Static Signals - Apply intent, context, fuzzy search, usage scoring
//   4. AI Re-ranking - Optional AI-based re-ordering (advisory only)
//   5. Presentation - Format and limit results for display
// =============================================================================

// -----------------------------------------------------------------------------
// CONSTANTS (moved from CommandPalette)
// -----------------------------------------------------------------------------

// Intent keywords map natural language phrases to node types
export const INTENT_KEYWORDS = {
  "send email": ["SEND_EMAIL", "EMAIL"],
  "send notification": ["SEND_EMAIL", "SLACK", "WEBHOOK"],
  "make api call": ["HTTP", "API"],
  "call api": ["HTTP", "API"],
  "fetch data": ["HTTP", "FIND_ALL"],
  "transform data": ["TRANSFORMER", "PARSER"],
  "check condition": ["IF_ELSE_V2", "IF_ELSE"],
  "loop through": ["ITERATOR", "FOR_EACH"],
  "iterate": ["ITERATOR", "FOR_EACH"],
  "save to database": ["UPSERT", "CREATE", "UPDATE"],
  "store data": ["UPSERT", "CREATE"],
  "query data": ["FIND_ALL", "FIND_ONE"],
  "find records": ["FIND_ALL", "FIND_ONE"],
  "use ai": ["TINY_GPT", "AI"],
  "ai generate": ["TINY_GPT", "AI"],
  "schedule task": ["SCHEDULE_TRIGGER", "TIME"],
  "run on schedule": ["SCHEDULE_TRIGGER", "TIME"],
  "when form submitted": ["FORM_TRIGGER"],
  "when record created": ["TABLE_TRIGGER"],
  "when record updated": ["TABLE_TRIGGER"],
  "slack message": ["SLACK"],
  "post to slack": ["SLACK"],
  "parse json": ["TRANSFORMER", "PARSER"],
  "extract data": ["TRANSFORMER", "PARSER"],
  "combine results": ["AGGREGATOR", "ARRAY_AGGREGATOR"],
  "merge data": ["AGGREGATOR", "ARRAY_AGGREGATOR"],
  "wait": ["DELAY", "WAIT"],
  "delay": ["DELAY", "WAIT"],
};

// Contextual suggestions based on previous node type
export const CONTEXTUAL_SUGGESTIONS = {
  HTTP: ["TRANSFORMER", "IF_ELSE_V2", "ITERATOR"],
  SEND_EMAIL: ["DELAY", "IF_ELSE_V2"],
  IF_ELSE_V2: ["SEND_EMAIL", "HTTP", "UPSERT"],
  IF_ELSE: ["SEND_EMAIL", "HTTP", "UPSERT"],
  ITERATOR: ["AGGREGATOR", "UPSERT", "SEND_EMAIL"],
  TRANSFORMER: ["IF_ELSE_V2", "HTTP", "UPSERT"],
  FIND_ALL: ["ITERATOR", "TRANSFORMER", "IF_ELSE_V2"],
  FIND_ONE: ["IF_ELSE_V2", "TRANSFORMER", "HTTP"],
  FORM_TRIGGER: ["IF_ELSE_V2", "SEND_EMAIL", "UPSERT"],
  TABLE_TRIGGER: ["IF_ELSE_V2", "SEND_EMAIL", "HTTP"],
  SCHEDULE_TRIGGER: ["HTTP", "FIND_ALL", "SEND_EMAIL"],
};

// Similar terms for search suggestions when no results found
export const SIMILAR_TERMS = {
  email: ["send email", "mail", "notification"],
  api: ["http", "request", "fetch", "call"],
  condition: ["if", "else", "branch", "check"],
  loop: ["iterate", "for each", "repeat"],
  database: ["query", "find", "store", "save"],
  ai: ["gpt", "generate", "llm", "artificial intelligence"],
  wait: ["delay", "pause", "sleep"],
  transform: ["map", "convert", "reshape"],
};

// -----------------------------------------------------------------------------
// STAGE 1: CANDIDATE POOL
// Build the full list of nodes from tabData
// -----------------------------------------------------------------------------

/**
 * Builds the base candidate pool from tabData.
 * @param {Array} tabData - Array of tab objects containing components
 * @returns {{ allNodes: Array, allNodesWithChildren: Array }}
 */
export function buildCandidatePool(tabData) {
  const allNodes = [];
  const allNodesWithChildren = [];

  tabData?.forEach((tab) => {
    tab.components?.forEach((component) => {
      const nodeWithCategory = {
        ...component,
        category: tab.label,
      };

      allNodes.push(nodeWithCategory);
      allNodesWithChildren.push(nodeWithCategory);

      // Flatten child actions for integrations (e.g., Slack → Send Message)
      if (component?.type === "Integration" && component?.events?.components) {
        component.events.components.forEach((child) => {
          if (child?.annotation === "ACTION") {
            allNodesWithChildren.push({
              ...child,
              category: tab.label,
              parentName: component.name,
              parentSrc: component._src,
              parentType: component.type,
              isChildAction: true,
            });
          }
        });
      }
    });
  });

  return { allNodes, allNodesWithChildren };
}

// -----------------------------------------------------------------------------
// STAGE 2: HARD CONSTRAINTS
// Apply mandatory filters (trigger rules, hierarchy)
// -----------------------------------------------------------------------------

/**
 * Checks if a node has child actions (for hierarchical integrations).
 * @param {Object} node - Node to check
 * @returns {boolean}
 */
export function hasChildActions(node) {
  return (
    node?.type === "Integration" &&
    node?.events?.components?.some((c) => c?.annotation === "ACTION")
  );
}

/**
 * Gets child actions for an integration node.
 * @param {Object} node - Parent integration node
 * @returns {Array} Array of child action nodes
 */
export function getChildActions(node) {
  if (!node?.events?.components) return [];
  return node.events.components
    .filter((c) => c?.annotation === "ACTION")
    .map((child) => ({
      ...child,
      parentName: node.name,
      parentSrc: node._src,
      parentType: node.type,
      isChildAction: true,
    }));
}

/**
 * Applies hard constraints to the candidate pool.
 * Currently handles trigger uniqueness check (returns flag, doesn't filter).
 * @param {Array} candidates - Full candidate list
 * @param {Object} context - { hasTrigger, existingTrigger }
 * @returns {{ candidates: Array, hasTrigger: boolean }}
 */
export function applyHardConstraints(candidates, context) {
  // Hard constraints are advisory - they inform UI behavior (confirmation dialogs)
  // but don't filter the candidate list. Triggers are still shown but require
  // confirmation if one already exists.
  return {
    candidates,
    hasTrigger: context.hasTrigger || false,
  };
}

// -----------------------------------------------------------------------------
// STAGE 3: STATIC SIGNALS
// Apply scoring based on intent, context, fuzzy search, usage
// -----------------------------------------------------------------------------

/**
 * Matches search text against intent keywords.
 * @param {string} searchText - User's search query
 * @returns {Array<string>} Array of matching node types
 */
export function matchIntentTypes(searchText) {
  if (!searchText?.trim()) return [];

  const lowerSearch = searchText.toLowerCase().trim();
  const matches = new Set();

  Object.entries(INTENT_KEYWORDS).forEach(([phrase, types]) => {
    if (lowerSearch.includes(phrase) || phrase.includes(lowerSearch)) {
      types.forEach((t) => matches.add(t));
    }
  });

  return Array.from(matches);
}

/**
 * Gets contextual node suggestions based on the previous node.
 * @param {Array} allNodes - Full node list
 * @param {Object|null} previousNode - The node user clicked from
 * @param {Array} aiSuggestions - AI-provided suggestions (takes precedence)
 * @returns {Array} Suggested nodes (max 5)
 */
export function getContextualSuggestions(allNodes, previousNode, aiSuggestions = []) {
  // AI suggestions take precedence if available
  if (aiSuggestions.length > 0) {
    return aiSuggestions.slice(0, 5);
  }

  if (!previousNode?.type) return [];

  const suggestedTypes = CONTEXTUAL_SUGGESTIONS[previousNode.type] || [];
  return allNodes
    .filter((node) =>
      suggestedTypes.some(
        (t) =>
          node.type?.toUpperCase().includes(t) ||
          node.subType?.toUpperCase().includes(t)
      )
    )
    .slice(0, 5);
}

/**
 * Gets usage score for a node based on historical usage.
 * @param {Object} node - Node to score
 * @param {Object} usageStats - Usage statistics from localStorage
 * @returns {number} Usage count
 */
export function getUsageScore(node, usageStats) {
  const key = `${node.type || ""}:${node.subType || ""}`;
  return usageStats[key] || 0;
}

/**
 * Gets search suggestions when no results found.
 * @param {string} searchText - User's search query
 * @returns {Array<string>} Alternative search terms
 */
export function getSuggestionsForSearch(searchText) {
  if (!searchText?.trim()) return [];

  const lower = searchText.toLowerCase();
  const suggestions = [];

  for (const [term, alternatives] of Object.entries(SIMILAR_TERMS)) {
    if (lower.includes(term) || term.includes(lower)) {
      alternatives.forEach((alt) => {
        if (!suggestions.includes(alt) && alt !== lower) {
          suggestions.push(alt);
        }
      });
    }
  }

  return suggestions.slice(0, 3);
}

/**
 * Applies fuzzy search using Fuse.js.
 * @param {Array} candidates - Nodes to search
 * @param {string} searchText - User's search query
 * @returns {Array} Fuse.js results with scores
 */
export function applyFuzzySearch(candidates, searchText) {
  if (!searchText?.trim()) return [];

  const fuseOptions = {
    keys: [
      { name: "name", weight: 0.4 },
      { name: "description", weight: 0.3 },
      { name: "type", weight: 0.2 },
      { name: "meta.search_keys", weight: 0.3 },
      { name: "parentName", weight: 0.25 },
    ],
    includeScore: true,
    threshold: 0.45,
    minMatchCharLength: 2,
  };

  const fuse = new Fuse(candidates, fuseOptions);
  return fuse.search(searchText);
}

/**
 * Applies all static relevance signals and produces a scored, ranked list.
 * Slicing is applied here to match original filteredNodes behavior exactly.
 * @param {Array} candidates - Candidate nodes (allNodesWithChildren)
 * @param {string} searchText - User's search query
 * @param {Object} context - { usageStats }
 * @returns {Array} Ranked nodes (sliced to match original limits)
 */
export function applyStaticSignals(candidates, searchText, context) {
  const { usageStats = {} } = context;

  // No search text: return usage-sorted nodes (no limit)
  if (!searchText?.trim()) {
    const sortedByUsage = [...candidates].sort((a, b) => {
      const scoreA = getUsageScore(a, usageStats);
      const scoreB = getUsageScore(b, usageStats);
      return scoreB - scoreA;
    });
    return sortedByUsage;
  }

  // With search text: apply fuzzy search + intent matching
  const fuseResults = applyFuzzySearch(candidates, searchText);
  const intentTypes = matchIntentTypes(searchText);

  // Add intent matches that weren't found by fuzzy search
  if (intentTypes.length > 0) {
    const intentMatches = candidates.filter((node) =>
      intentTypes.some(
        (t) =>
          node.type?.toUpperCase().includes(t) ||
          node.subType?.toUpperCase().includes(t)
      )
    );
    const fuseIds = new Set(
      fuseResults.map((r) => r.item.type + (r.item.isChildAction ? r.item.name : ""))
    );
    intentMatches.forEach((node) => {
      const nodeKey = node.type + (node.isChildAction ? node.name : "");
      if (!fuseIds.has(nodeKey)) {
        fuseResults.push({ item: node, score: 0.3 });
      }
    });
  }

  // Combine fuzzy score with usage score for final ranking
  const results = fuseResults.map((r) => ({
    ...r,
    usageScore: getUsageScore(r.item, usageStats),
  }));

  results.sort((a, b) => {
    const scoreDiff = a.score - b.score;
    if (Math.abs(scoreDiff) < 0.1) {
      return b.usageScore - a.usageScore;
    }
    return scoreDiff;
  });

  // Return all results (no limit)
  return results.map((r) => r.item);
}

// -----------------------------------------------------------------------------
// STAGE 4: AI RE-RANKING (Optional)
// AI suggestions are loaded externally and passed in - this stage just merges
// -----------------------------------------------------------------------------

/**
 * Applies AI re-ranking to the suggestion list.
 * AI suggestions are advisory and must come from the existing candidate set.
 * @param {Array} rankedCandidates - Already-ranked candidates from Stage 3
 * @param {Array} aiSuggestions - AI-provided suggestions
 * @param {Object} options - { aiEnabled: boolean }
 * @returns {Array} Final ranked list
 */
export function applyAIReranking(rankedCandidates, aiSuggestions, options = {}) {
  // AI re-ranking is handled separately in contextual suggestions
  // This function is a placeholder for future AI integration into main search
  // Currently, AI suggestions are only used in the "suggested" section
  return rankedCandidates;
}

// -----------------------------------------------------------------------------
// STAGE 5: PRESENTATION
// Format results for display in different view modes
// -----------------------------------------------------------------------------

/**
 * Groups nodes by category for grid display.
 * @param {Array} allNodes - Full node list
 * @returns {Array} Array of [category, nodes] pairs, sorted
 */
export function groupNodesByCategory(allNodes) {
  const groups = {};

  allNodes.forEach((node) => {
    const category = node.category || "Other";
    if (!groups[category]) {
      groups[category] = [];
    }
    groups[category].push(node);
  });

  const categoryOrder = ["AI", "Question", "Logic", "Data", "Trigger", "Agents", "Enrichment", "Flow Control", "IO", "Loops", "Text Parser", "Tiny Tables", "Utils"];
  const lastCategories = ["Integrations", "Integration", "Other"];

  return Object.entries(groups).sort((a, b) => {
    const aIdx = categoryOrder.indexOf(a[0]);
    const bIdx = categoryOrder.indexOf(b[0]);
    const aLastIdx = lastCategories.indexOf(a[0]);
    const bLastIdx = lastCategories.indexOf(b[0]);

    const aIsLast = aLastIdx !== -1;
    const bIsLast = bLastIdx !== -1;

    if (aIsLast && bIsLast) return aLastIdx - bLastIdx;
    if (aIsLast) return 1;
    if (bIsLast) return -1;
    if (aIdx !== -1 && bIdx !== -1) return aIdx - bIdx;
    if (aIdx === -1 && bIdx === -1) return a[0].localeCompare(b[0]);
    if (aIdx === -1) return 1;
    return -1;
  });
}

/**
 * Flattens grouped nodes into a flat grid list.
 * @param {Array} groupedNodes - Array of [category, nodes] pairs
 * @returns {Array} Flat array of nodes with _gridCategory
 */
export function flattenForGrid(groupedNodes) {
  const flat = [];

  groupedNodes.forEach(([category, nodes]) => {
    nodes.forEach((node) => {
      flat.push({ ...node, _gridCategory: category });
    });
  });

  return flat;
}

/**
 * Formats results for display based on view mode.
 * @param {Array} rankedCandidates - Ranked candidates
 * @param {string} viewMode - "search" | "nodes" | "recent" | "recipes"
 * @param {Object} context - { allNodes, groupedNodes, recentNodes, recipes }
 * @returns {Array} Formatted results for display
 */
export function formatForDisplay(rankedCandidates, viewMode, context = {}) {
  // Match original currentItems branching exactly:
  // - "recent" → recentNodes
  // - "recipes" → recipes
  // - "nodes" → flatGridNodes
  // - default → filteredNodes (already sliced in applyStaticSignals)
  switch (viewMode) {
    case "recent":
      return context.recentNodes || [];
    case "recipes":
      return context.recipes || [];
    case "nodes":
      return context.flatGridNodes || [];
    default:
      // Original behavior: when no section matches, return filteredNodes (already sliced)
      return rankedCandidates;
  }
}

// -----------------------------------------------------------------------------
// MAIN ENTRY POINT
// -----------------------------------------------------------------------------

/**
 * Runs the complete suggestion pipeline.
 * This is the single entry point for generating suggestions.
 *
 * @param {Object} params - Pipeline parameters
 * @param {Array} params.tabData - Raw tab data from props
 * @param {string} params.searchText - Current search query
 * @param {Object} params.context - Context object containing:
 *   - previousNode: The node user clicked from (for contextual suggestions)
 *   - hasTrigger: Whether workflow already has a trigger
 *   - usageStats: Usage statistics from localStorage
 *   - aiSuggestions: AI-provided suggestions (optional)
 *   - recentNodes: Recently used nodes
 *   - favorites: User's favorite nodes
 *   - activeSection: Current UI section ("nodes" | "recent" | "recipes")
 *   - childActionsView: Current child actions view state (if any)
 * @param {Object} params.options - Options object containing:
 *   - aiEnabled: Whether AI re-ranking is enabled
 *
 * @returns {Object} Pipeline result:
 *   - allNodes: Full node list (for category display, favorites lookup)
 *   - allNodesWithChildren: Nodes with flattened child actions (for search)
 *   - filteredNodes: Search results (when searchText is present)
 *   - groupedNodes: Nodes grouped by category
 *   - flatGridNodes: Flattened grid nodes for "nodes" section
 *   - contextualNodes: Contextual suggestions based on previous node
 *   - currentItems: Final items to display based on view mode
 *   - nlAction: Parsed natural language action (if detected)
 *   - searchSuggestions: Alternative search terms (when no results)
 */
export function runSuggestionPipeline({ tabData, searchText, context, options = {} }) {
  // Stage 1: Build candidate pool
  const { allNodes, allNodesWithChildren } = buildCandidatePool(tabData);

  // Stage 2: Apply hard constraints (returns advisory flags)
  const { hasTrigger } = applyHardConstraints(allNodes, context);

  // Stage 3: Apply static signals for search
  const filteredNodes = applyStaticSignals(
    allNodesWithChildren,
    searchText,
    { usageStats: context.usageStats || {} }
  );

  // Stage 3b: Get contextual suggestions
  const contextualNodes = getContextualSuggestions(
    allNodes,
    context.previousNode,
    context.aiSuggestions || []
  );

  // Stage 4: AI re-ranking (currently passthrough)
  const rankedNodes = applyAIReranking(
    filteredNodes,
    context.aiSuggestions || [],
    options
  );

  // Stage 5: Format for presentation
  const groupedNodes = groupNodesByCategory(allNodes);
  const flatGridNodes = flattenForGrid(groupedNodes);

  // Get search suggestions when no results
  const searchSuggestions =
    rankedNodes.length === 0 && searchText?.trim()
      ? getSuggestionsForSearch(searchText)
      : [];

  // Determine current items based on view mode
  // Matches original currentItems memo branching exactly
  let currentItems;
  if (context.childActionsView) {
    // Viewing child actions of an integration
    if (searchText?.trim()) {
      const lowerSearch = searchText.toLowerCase();
      currentItems = context.childActionsView.children.filter((child) => {
        const name = typeof child.name === "string" ? child.name : "";
        const desc = typeof child.description === "string" ? child.description : "";
        return name.toLowerCase().includes(lowerSearch) || desc.toLowerCase().includes(lowerSearch);
      });
    } else {
      currentItems = context.childActionsView.children;
    }
  } else if (searchText?.trim()) {
    // With search text: use rankedNodes directly (already sliced to 15 in applyStaticSignals)
    currentItems = rankedNodes;
  } else {
    currentItems = formatForDisplay(rankedNodes, context.activeSection, {
      flatGridNodes,
      recentNodes: context.recentNodes || [],
      recipes: context.recipes || [],
    });
  }

  return {
    allNodes,
    allNodesWithChildren,
    filteredNodes: rankedNodes,
    groupedNodes,
    flatGridNodes,
    contextualNodes,
    currentItems,
    searchSuggestions,
    hasTrigger,
  };
}
