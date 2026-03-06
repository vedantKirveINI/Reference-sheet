/**
 * Recipe Patterns Module
 *
 * This module handles multi-node workflow composition patterns.
 * These are conceptually distinct from single-node intent biasing (handled in suggestionPipeline.js).
 *
 * Key distinction:
 * - Intent Biasing: Ranks/surfaces INDIVIDUAL nodes based on search text
 * - Workflow Composition: Suggests SETS of nodes that form a workflow (recipes)
 *
 * NL_ACTION_PATTERNS are treated as "implicit recipes" - they trigger only in the
 * Recipes tab or as a "Suggested Recipe" indicator, never affecting single-node ranking.
 */

/**
 * Natural language action patterns for multi-step workflow detection.
 * These patterns detect when a user is describing a workflow rather than searching for a single node.
 */
export const NL_ACTION_PATTERNS = [
  {
    pattern: /send (an? )?email when (a )?(new )?record (is )?(created|added)/i,
    nodes: ["TABLE_TRIGGER", "SEND_EMAIL"],
    description: "Trigger on new record → Send email",
    name: "New Record Email Notification",
  },
  {
    pattern: /send (an? )?email when (a )?(new )?row (is )?(created|added)/i,
    nodes: ["TABLE_TRIGGER", "SEND_EMAIL"],
    description: "Trigger on new record → Send email",
    name: "New Row Email Notification",
  },
  {
    pattern: /fetch (data|records) (from )?(an? )?api (and )?(then )?(save|store)/i,
    nodes: ["HTTP", "UPSERT"],
    description: "Call API → Save to database",
    name: "API Data Sync",
  },
  {
    pattern: /call (an? )?api (and )?(then )?(transform|convert)/i,
    nodes: ["HTTP", "TRANSFORMER"],
    description: "Call API → Transform data",
    name: "API Response Transformation",
  },
  {
    pattern: /check (a )?condition (and|then) send (an? )?email/i,
    nodes: ["IFELSE_V2", "SEND_EMAIL"],
    description: "Check condition → Send email",
    name: "Conditional Email",
  },
  {
    pattern: /loop through (records|items|data) (and )?(then )?(send|email)/i,
    nodes: ["ITERATOR", "SEND_EMAIL"],
    description: "Loop through items → Send email for each",
    name: "Bulk Email Sender",
  },
  {
    pattern: /query (the )?(database|table|records) (and )?(then )?(loop|iterate)/i,
    nodes: ["FIND_ALL", "ITERATOR"],
    description: "Query records → Loop through each",
    name: "Database Query Loop",
  },
  {
    pattern: /when form (is )?submitted (then )?(send|email)/i,
    nodes: ["FORM_TRIGGER", "SEND_EMAIL"],
    description: "Form submission → Send email",
    name: "Form Submission Notification",
  },
  {
    pattern: /(use )?ai (to )?(generate|create|write) (and )?(then )?(send|email)/i,
    nodes: ["TINY_GPT", "SEND_EMAIL"],
    description: "Generate with AI → Send email",
    name: "AI-Generated Email",
  },
  {
    pattern: /(every|each) (day|hour|week|month) (run|execute|do)/i,
    nodes: ["SCHEDULE_TRIGGER"],
    description: "Schedule trigger",
    name: "Scheduled Automation",
  },
];

/**
 * Parses natural language to detect multi-step workflow patterns.
 * This is used to detect "implicit recipes" from user search text.
 *
 * @param {string} searchText - User's search query
 * @returns {Object|null} { nodes: Array, description: string, name: string } or null
 */
export function parseNaturalLanguageAction(searchText) {
  if (!searchText?.trim()) return null;

  for (const pattern of NL_ACTION_PATTERNS) {
    if (pattern.pattern.test(searchText)) {
      return {
        nodes: pattern.nodes,
        description: pattern.description,
        name: pattern.name,
      };
    }
  }
  return null;
}

/**
 * Detects if the search text matches an implicit recipe pattern.
 * Returns a recipe-like object that can be displayed alongside explicit recipes.
 *
 * This function is the primary entry point for detecting implicit recipes.
 * It should only be used in the Recipes tab or for "Suggested Recipe" indicators.
 *
 * @param {string} searchText - User's search query
 * @returns {Object|null} Recipe object or null
 */
export function detectImplicitRecipe(searchText) {
  const match = parseNaturalLanguageAction(searchText);

  if (!match) return null;

  return {
    id: `implicit-${match.nodes.join("-").toLowerCase()}`,
    name: match.name,
    description: match.description,
    steps: match.nodes.map((nodeType, index) => ({
      type: nodeType,
      order: index + 1,
    })),
    isImplicit: true,
    searchMatch: searchText,
  };
}

/**
 * Filters implicit recipes based on search text.
 * Returns all matching implicit recipes for display in the Recipes tab.
 *
 * @param {string} searchText - User's search query
 * @returns {Array} Array of implicit recipe objects
 */
export function getMatchingImplicitRecipes(searchText) {
  if (!searchText?.trim() || searchText.trim().length < 4) {
    return [];
  }

  const matches = [];
  const lowerSearch = searchText.toLowerCase();

  for (const pattern of NL_ACTION_PATTERNS) {
    if (pattern.pattern.test(searchText)) {
      matches.push({
        id: `implicit-${pattern.nodes.join("-").toLowerCase()}`,
        name: pattern.name,
        description: pattern.description,
        steps: pattern.nodes.map((nodeType, index) => ({
          type: nodeType,
          order: index + 1,
        })),
        isImplicit: true,
        searchMatch: searchText,
      });
    } else if (
      pattern.description.toLowerCase().includes(lowerSearch) ||
      pattern.name.toLowerCase().includes(lowerSearch)
    ) {
      matches.push({
        id: `implicit-${pattern.nodes.join("-").toLowerCase()}`,
        name: pattern.name,
        description: pattern.description,
        steps: pattern.nodes.map((nodeType, index) => ({
          type: nodeType,
          order: index + 1,
        })),
        isImplicit: true,
        searchMatch: searchText,
      });
    }
  }

  return matches;
}

