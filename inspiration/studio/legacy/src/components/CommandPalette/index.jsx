import React, {
  useCallback,
  useState,
  useEffect,
  useRef,
  useMemo,
} from "react";
import { createPortal } from "react-dom";
// import Icon from "oute-ds-icon";
import { ODSIcon as Icon } from "@src/module/ods";
import { motion, AnimatePresence } from "framer-motion";
import {
  getRecentNodes,
  addRecentNode,
} from "../../module/search/utils/recentNodes";
import { isTriggerNodeType, getTriggerType } from "../../constants/node-rules";
import {
  getAISuggestions,
  logAISuggestionContext,
} from "../../services/aiSuggestions";
import {
  runSuggestionPipeline,
  hasChildActions,
  getChildActions,
} from "./suggestionPipeline";
import {
  detectImplicitRecipe,
  getMatchingImplicitRecipes,
} from "./recipePatterns";
import styles from "./styles.module.css";

const FAVORITES_STORAGE_KEY = "command-palette-favorites";
const USAGE_STATS_KEY = "command-palette-usage-stats";
const CARDS_PER_ROW = parseInt(import.meta.env.VITE_CARDS_PER_ROW, 10) || 2;

const TRIGGER_DISPLAY_NAMES = {
  "Input Setup": "Manual Trigger",
  CUSTOM_WEBHOOK: "Webhook Trigger",
  TIME_BASED_TRIGGER: "Time-Based Trigger",
  SHEET_TRIGGER: "Table Trigger",
  SHEET_DATE_FIELD_TRIGGER: "Date Field Trigger",
  FORM_TRIGGER: "Form Trigger",
  TRIGGER_SETUP: "Trigger Setup",
};

const getTriggerDisplayName = (node) => {
  const triggerType = getTriggerType(node);
  if (triggerType && TRIGGER_DISPLAY_NAMES[triggerType]) {
    return TRIGGER_DISPLAY_NAMES[triggerType];
  }
  const nodeName = node?.name || node?.data?.name || "";
  const nodeType = node?.type || node?.data?.type || "";
  return nodeName || nodeType || "Trigger";
};

const getUsageStats = () => {
  try {
    const stored = localStorage.getItem(USAGE_STATS_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch {
    return {};
  }
};

const incrementUsage = (node) => {
  const stats = getUsageStats();
  const key = `${node.type || ""}:${node.subType || ""}`;
  stats[key] = (stats[key] || 0) + 1;
  localStorage.setItem(USAGE_STATS_KEY, JSON.stringify(stats));
};

const getFavoriteNodes = () => {
  try {
    const stored = localStorage.getItem(FAVORITES_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

const getNodeKey = (node) => {
  return (
    node.id || `${node.type || ""}:${node.subType || ""}:${node.name || ""}`
  );
};

const addFavoriteNode = (node) => {
  const favorites = getFavoriteNodes();
  const nodeKey = getNodeKey(node);
  const exists = favorites.some((f) => f.nodeKey === nodeKey);
  if (!exists) {
    favorites.unshift({
      nodeKey,
      type: node.type,
      subType: node.subType,
      name: node.name,
      id: node.id,
    });
    localStorage.setItem(
      FAVORITES_STORAGE_KEY,
      JSON.stringify(favorites.slice(0, 10))
    );
  }
};

const removeFavoriteNode = (node) => {
  const favorites = getFavoriteNodes();
  const nodeKey = getNodeKey(node);
  const filtered = favorites.filter((f) => f.nodeKey !== nodeKey);
  localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(filtered));
};

const isFavoriteNode = (node, favorites) => {
  const nodeKey = getNodeKey(node);
  return favorites.some((f) => f.nodeKey === nodeKey);
};

const PLACEHOLDER_EXAMPLES = [
  "Search nodes or describe what you want...",
  "e.g., 'send email'",
  "e.g., 'call api'",
  "e.g., 'check condition'",
  "e.g., 'loop through records'",
];

const AI_NODE_TYPES = [
  "tiny_gpt",
  "ai",
  "tiny",
  "gpt",
  "openai",
  "claude",
  "gemini",
];
const DATA_NODE_TYPES = [
  "find_all",
  "find_one",
  "upsert",
  "create",
  "update",
  "delete",
  "query",
  "database",
  "table",
  "sheet",
];
const LOGIC_NODE_TYPES = [
  "if_else",
  "if_else_v2",
  "switch",
  "iterator",
  "for_each",
  "loop",
  "delay",
  "wait",
  "transformer",
  "parser",
  "aggregator",
  "array_aggregator",
  "filter",
  "map",
  "reduce",
];
const TRIGGER_NODE_TYPES = [
  "form_trigger",
  "table_trigger",
  "schedule_trigger",
  "webhook_trigger",
  "time_trigger",
  "event_trigger",
  "manual_trigger",
];
const INTEGRATION_NODE_TYPES = [
  "http",
  "api",
  "slack",
  "gmail",
  "send_email",
  "email",
  "sms",
  "webhook",
  "twilio",
  "stripe",
  "airtable",
  "google_sheets",
  "notion",
  "hubspot",
  "salesforce",
  "zapier",
  "mailchimp",
  "discord",
  "telegram",
  "whatsapp",
  "asana",
  "jira",
  "trello",
  "github",
  "gitlab",
  "dropbox",
  "box",
  "onedrive",
  "s3",
  "firebase",
  "mongodb",
  "mysql",
  "postgres",
  "redis",
  "elasticsearch",
];

const getNodeCategoryClass = (node, categoryStyles) => {
  const type = (node.type || "").toLowerCase();
  const subType = (node.subType || "").toLowerCase();
  const name = (node.name || "").toLowerCase();
  const category = (node.category || "").toLowerCase();
  const nodeModule = (node.module || "").toLowerCase();

  // Check AI nodes
  if (
    type.includes("ai") ||
    type.includes("tiny") ||
    name.includes("ai ") ||
    AI_NODE_TYPES.some((t) => type.includes(t) || subType.includes(t))
  ) {
    return categoryStyles.ai;
  }

  // Check question nodes
  if (type.includes("question") || category.includes("question")) {
    return categoryStyles.question;
  }

  // Check trigger nodes
  if (
    type.includes("trigger") ||
    category.includes("trigger") ||
    TRIGGER_NODE_TYPES.some((t) => type.includes(t) || subType.includes(t))
  ) {
    return categoryStyles.trigger;
  }

  // Check logic nodes
  if (
    type.includes("logic") ||
    type.includes("condition") ||
    category.includes("logic") ||
    LOGIC_NODE_TYPES.some((t) => type.includes(t) || subType.includes(t))
  ) {
    return categoryStyles.logic;
  }

  // Check data nodes
  if (
    type.includes("data") ||
    type.includes("database") ||
    category.includes("data") ||
    DATA_NODE_TYPES.some((t) => type.includes(t) || subType.includes(t))
  ) {
    return categoryStyles.data;
  }

  // Check integration nodes (HTTP, Slack, Gmail, etc.)
  if (
    type.includes("integration") ||
    category.includes("integration") ||
    nodeModule.includes("integration") ||
    INTEGRATION_NODE_TYPES.some(
      (t) =>
        type === t ||
        subType === t ||
        type.includes(t) ||
        subType.includes(t) ||
        name.includes(t)
    )
  ) {
    return categoryStyles.integration;
  }

  return categoryStyles.other;
};

const RECIPES = [
  {
    id: "api-pipeline",
    name: "API Data Pipeline",
    description: "Fetch, transform, and store data",
    iconName: "OUTELinkIcon",
    nodes: ["HTTP", "TRANSFORMER", "UPSERT"],
    steps: [
      {
        type: "HTTP",
        label: "Fetch Data",
        hint: "Configure your API endpoint",
      },
      {
        type: "TRANSFORMER",
        label: "Transform Response",
        hint: "Map fields to your format",
      },
      {
        type: "UPSERT",
        label: "Save to Database",
        hint: "Choose table and fields",
      },
    ],
  },
  {
    id: "email-notification",
    name: "Email Notification",
    description: "Send email based on condition",
    iconName: "OUTEEmailOutlinedIcon",
    nodes: ["IF_ELSE_V2", "SEND_EMAIL"],
    steps: [
      {
        type: "IF_ELSE_V2",
        label: "Check Condition",
        hint: "Define when to send",
      },
      {
        type: "SEND_EMAIL",
        label: "Send Email",
        hint: "Configure recipient and message",
      },
    ],
  },
  {
    id: "batch-processor",
    name: "Batch Processor",
    description: "Loop through records and process",
    iconName: "OUTELoopIcon",
    nodes: ["FIND_ALL", "ITERATOR", "TRANSFORMER"],
    steps: [
      {
        type: "FIND_ALL",
        label: "Query Records",
        hint: "Select table and filters",
      },
      { type: "ITERATOR", label: "Loop Through", hint: "Process each item" },
      {
        type: "TRANSFORMER",
        label: "Transform Data",
        hint: "Map and format output",
      },
    ],
  },
  {
    id: "scheduled-report",
    name: "Scheduled Report",
    description: "Generate and email a report on schedule",
    iconName: "OUTEAssessmentOutlinedIcon",
    nodes: ["FIND_ALL", "TRANSFORMER", "SEND_EMAIL"],
    steps: [
      {
        type: "FIND_ALL",
        label: "Gather Data",
        hint: "Query your data source",
      },
      {
        type: "TRANSFORMER",
        label: "Format Report",
        hint: "Structure the report data",
      },
      { type: "SEND_EMAIL", label: "Email Report", hint: "Send to recipients" },
    ],
  },
  {
    id: "webhook-handler",
    name: "Webhook Handler",
    description: "Process incoming webhook data",
    iconName: "OUTEWebhookIcon",
    nodes: ["TRANSFORMER", "IF_ELSE_V2", "HTTP"],
    steps: [
      {
        type: "TRANSFORMER",
        label: "Parse Payload",
        hint: "Extract relevant fields",
      },
      {
        type: "IF_ELSE_V2",
        label: "Route by Type",
        hint: "Handle different events",
      },
      { type: "HTTP", label: "Call External API", hint: "Forward or respond" },
    ],
  },
];

const NODE_PREVIEWS = {
  HTTP: {
    description: "Make HTTP requests to external APIs and services",
    inputs: ["URL", "Method", "Headers", "Body"],
    outputs: ["Response Body", "Status Code", "Headers"],
    example: "GET https://api.example.com/users",
  },
  SEND_EMAIL: {
    description: "Send emails to one or more recipients",
    inputs: ["To", "Subject", "Body", "Attachments"],
    outputs: ["Message ID", "Status"],
    example: "Send welcome email to new users",
  },
  IF_ELSE_V2: {
    description: "Branch your workflow based on conditions",
    inputs: ["Condition", "Value A", "Value B"],
    outputs: ["True Branch", "False Branch"],
    example: "If status === 'active' then...",
  },
  IF_ELSE: {
    description: "Simple conditional branching",
    inputs: ["Condition"],
    outputs: ["True", "False"],
    example: "Check if value exists",
  },
  TRANSFORMER: {
    description: "Transform and reshape data between nodes",
    inputs: ["Input Data", "Transform Rules"],
    outputs: ["Transformed Data"],
    example: "Map array to new format",
  },
  ITERATOR: {
    description: "Loop through arrays and process each item",
    inputs: ["Array", "Item Variable"],
    outputs: ["Current Item", "Index"],
    example: "For each user in users[]",
  },
  FIND_ALL: {
    description: "Query multiple records from a database table",
    inputs: ["Table", "Filters", "Sort", "Limit"],
    outputs: ["Records Array", "Count"],
    example: "Find all orders where status = 'pending'",
  },
  FIND_ONE: {
    description: "Query a single record from a database table",
    inputs: ["Table", "Filter"],
    outputs: ["Record", "Found"],
    example: "Find user by email",
  },
  UPSERT: {
    description: "Create or update a record in the database",
    inputs: ["Table", "Data", "Match Key"],
    outputs: ["Record", "Created/Updated"],
    example: "Upsert user profile by user_id",
  },
  DELAY: {
    description: "Pause workflow execution for a specified time",
    inputs: ["Duration", "Unit"],
    outputs: ["Completed"],
    example: "Wait 5 minutes before next step",
  },
  TINY_GPT: {
    description: "Generate AI responses using GPT models",
    inputs: ["Prompt", "Model", "Temperature"],
    outputs: ["Response", "Tokens Used"],
    example: "Summarize customer feedback",
  },
  SLACK: {
    description: "Send messages to Slack channels",
    inputs: ["Channel", "Message", "Attachments"],
    outputs: ["Message ID", "Timestamp"],
    example: "Post alert to #notifications",
  },
  WEBHOOK: {
    description: "Send data to external webhook URLs",
    inputs: ["URL", "Payload", "Headers"],
    outputs: ["Response", "Status"],
    example: "Notify external system",
  },
  AGGREGATOR: {
    description: "Combine multiple items into a single array",
    inputs: ["Items"],
    outputs: ["Aggregated Array"],
    example: "Collect all processed results",
  },
};

const HELP_CONTENT = {
  shortcuts: [
    { key: "⌘K / Ctrl+K", description: "Open command palette" },
    { key: "↑ / ↓", description: "Navigate results" },
    { key: "Enter", description: "Add selected node" },
    { key: "Escape", description: "Close palette" },
    { key: "Tab", description: "Switch between sections" },
  ],
  tips: [
    "Use natural language: 'send email when record created'",
    "Star frequently used nodes for quick access",
    "Use recipes for common workflow patterns",
    "Search by node type or description",
  ],
  sections: [
    { name: "All Nodes", description: "Browse all available nodes" },
    { name: "Favorites", description: "Your starred nodes" },
    { name: "Recent", description: "Recently used nodes" },
    {
      name: "Suggested",
      description: "Recommendations based on your workflow",
    },
    { name: "Recipes", description: "Pre-built workflow templates" },
  ],
};

const getPreviewForNode = (node) => {
  if (!node) return null;
  const nodeType = node.type?.toUpperCase() || node.subType?.toUpperCase();
  for (const [key, preview] of Object.entries(NODE_PREVIEWS)) {
    if (nodeType?.includes(key)) {
      return preview;
    }
  }
  return null;
};

/**
 * CommandPalette - Node discovery and insertion interface
 *
 * ARCHITECTURAL RULE: Single-Node vs Multi-Node Insertion
 * ========================================================
 *
 * onNodeSelect MUST always insert exactly ONE node.
 * - Search results, intent biasing, and AI suggestions all route through onNodeSelect
 * - onNodeSelect is the ONLY direct canvas insertion point from this component
 *
 * Multi-node insertion is ONLY allowed via the Recipe Wizard:
 * - Explicit recipes (user-defined templates)
 * - Implicit recipes (NL-detected patterns, require user confirmation)
 * - Future: AI-composed workflows MUST also route through Recipe Wizard
 *
 * The Recipe Wizard (wizardRecipe state) is the SOLE multi-node insertion boundary.
 * Any code path that needs to insert multiple nodes must:
 * 1. Set wizardRecipe to trigger the wizard UI
 * 2. Require explicit user confirmation for each step
 * 3. Never directly call onNodeSelect with multiple nodes
 *
 * @param {Object} props
 * @param {boolean} props.isOpen - Whether the palette is visible
 * @param {Function} props.onClose - Called when palette closes
 * @param {Function} props.onNodeSelect - Inserts EXACTLY ONE node to canvas. Never call with multiple nodes.
 * @param {Function} props.onTriggerReplace - Optional handler for replacing existing triggers
 * @param {Array} props.tabData - Available node categories/tabs
 * @param {Object} props.previousNode - Context: the node before insertion point
 * @param {Object} props.canvasRef - Reference to canvas for trigger detection
 */
const CommandPalette = ({
  isOpen = false,
  onClose = () => {},
  onNodeSelect = () => {},
  onTriggerReplace = null,
  tabData = [],
  previousNode = null,
  canvasRef = null,
}) => {
  const [searchText, setSearchText] = useState("");
  const [focusedIndex, setFocusedIndex] = useState(0);
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const [activeSection, setActiveSection] = useState("nodes");
  const [showPreview, setShowPreview] = useState(true);
  const [favorites, setFavorites] = useState([]);
  const [usageStats, setUsageStats] = useState({});

  /**
   * MULTI-NODE INSERTION BOUNDARY
   * =============================
   * wizardRecipe is the ONLY entry point for multi-node insertion.
   * When set, the Recipe Wizard UI guides users through step-by-step node addition.
   *
   * All multi-node workflows MUST route through this state:
   * - Explicit recipes: setWizardRecipe(recipe)
   * - Implicit recipes: pendingImplicitRecipe → confirmation → setWizardRecipe
   * - Future AI workflows: MUST also use setWizardRecipe, never direct insertion
   *
   * This ensures:
   * 1. User awareness of what will be added
   * 2. Explicit confirmation for each node
   * 3. Ability to cancel mid-way
   * 4. Analytics tracking for multi-node patterns
   */
  const [wizardRecipe, setWizardRecipe] = useState(null);
  const [wizardStep, setWizardStep] = useState(0);
  const [triggerConfirmation, setTriggerConfirmation] = useState(null);
  const [pendingImplicitRecipe, setPendingImplicitRecipe] = useState(null);
  const [childActionsView, setChildActionsView] = useState(null);
  const [aiSuggestions, setAiSuggestions] = useState([]);
  const [aiSuggestionsLoading, setAiSuggestionsLoading] = useState(false);
  const [aiSuggestionsSource, setAiSuggestionsSource] = useState("default");
  const searchInputRef = useRef(null);
  const listRef = useRef(null);
  const aiSuggestionsLoadedRef = useRef(false);
  const hoverTimeoutRef = useRef(null);

  const handleCardMouseEnter = useCallback((index) => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }
    setFocusedIndex(index);
  }, []);

  const handleCardMouseLeave = useCallback(() => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
    hoverTimeoutRef.current = setTimeout(() => {
      setFocusedIndex(-1);
      hoverTimeoutRef.current = null;
    }, 100);
  }, []);

  const handlePreviewMouseEnter = useCallback(() => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => {
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
      }
    };
  }, []);

  const getExistingTrigger = useCallback(() => {
    if (!canvasRef?.current) return null;
    try {
      const allCanvasNodes = canvasRef.current.getAllNodes?.() || [];
      const triggerNode = allCanvasNodes.find((node) => {
        const nodeData = node?.data || node;
        return isTriggerNodeType(nodeData);
      });
      return triggerNode || null;
    } catch {
      return null;
    }
  }, [canvasRef]);

  useEffect(() => {
    if (isOpen) {
      setFavorites(getFavoriteNodes());
      setUsageStats(getUsageStats());
      setWizardRecipe(null);
      setWizardStep(0);
      setTriggerConfirmation(null);
      setChildActionsView(null);
      setPendingImplicitRecipe(null);
      setAiSuggestions([]);
      setAiSuggestionsSource("default");
      aiSuggestionsLoadedRef.current = false;
    }
  }, [isOpen]);

  const getCanvasContext = useCallback(() => {
    const existingTrigger = getExistingTrigger();
    const hasTrigger = !!existingTrigger;

    let workflowShape = [];
    if (canvasRef?.current?.getAllNodes) {
      try {
        const allCanvasNodes = canvasRef.current.getAllNodes() || [];
        workflowShape = allCanvasNodes
          .filter((n) => n && (n.type || n.data?.type))
          .slice(0, 10)
          .map((n) => n.name || n.data?.name || n.type || n.data?.type);
      } catch {
        workflowShape = [];
      }
    }

    return {
      selectedNode: previousNode
        ? {
            id: previousNode.id,
            type: previousNode.type,
            name: previousNode.name || previousNode.type,
            integrationName:
              previousNode.integrationName || previousNode.integration,
          }
        : null,
      hasTrigger,
      workflowShape,
      searchText: "",
    };
  }, [canvasRef, previousNode, getExistingTrigger]);

  // Memoize recent nodes separately (has localStorage side effect dependency)
  const recentNodes = useMemo(() => {
    const recent = getRecentNodes();
    return recent.slice(0, 5);
  }, [isOpen]);

  // Run the suggestion pipeline - single entry point for all suggestion logic
  // hasTrigger is computed inline to stay reactive to canvas changes
  const pipelineResult = useMemo(() => {
    return runSuggestionPipeline({
      tabData,
      searchText,
      context: {
        previousNode,
        hasTrigger: !!getExistingTrigger(),
        usageStats,
        aiSuggestions,
        recentNodes,
        favorites,
        activeSection,
        childActionsView,
        recipes: RECIPES,
      },
      options: {
        aiEnabled: aiSuggestions.length > 0,
      },
    });
  }, [
    tabData,
    searchText,
    previousNode,
    getExistingTrigger,
    usageStats,
    aiSuggestions,
    recentNodes,
    favorites,
    activeSection,
    childActionsView,
  ]);

  // Extract pipeline results
  const {
    allNodes,
    allNodesWithChildren,
    filteredNodes,
    groupedNodes,
    flatGridNodes,
    contextualNodes,
    currentItems,
    searchSuggestions,
  } = pipelineResult;

  // Detect implicit recipes from search text (for Recipes tab only)
  const implicitRecipes = useMemo(() => {
    if (activeSection !== "recipes" || !searchText?.trim()) {
      return [];
    }
    return getMatchingImplicitRecipes(searchText);
  }, [searchText, activeSection]);

  // Detect a single implicit recipe for "Suggested Recipe" indicator
  const suggestedImplicitRecipe = useMemo(() => {
    if (!searchText?.trim() || searchText.trim().length < 6) {
      return null;
    }
    return detectImplicitRecipe(searchText);
  }, [searchText]);

  useEffect(() => {
    if (!isOpen || allNodes.length === 0) return;
    if (aiSuggestionsLoadedRef.current) return;

    const loadAISuggestions = async () => {
      aiSuggestionsLoadedRef.current = true;
      setAiSuggestionsLoading(true);
      try {
        const context = getCanvasContext();
        const result = await getAISuggestions(context, allNodes);
        logAISuggestionContext(context, result);

        if (result.suggestions.length > 0) {
          setAiSuggestions(result.suggestions);
          setAiSuggestionsSource(result.source);
        }
      } catch (error) {
      } finally {
        setAiSuggestionsLoading(false);
      }
    };

    loadAISuggestions();
  }, [isOpen, allNodes, getCanvasContext]);

  const handleBackFromChildren = useCallback(() => {
    setChildActionsView(null);
    setFocusedIndex(0);
  }, []);

  const favoriteNodes = useMemo(() => {
    return favorites
      .map((fav) => allNodes.find((n) => getNodeKey(n) === fav.nodeKey))
      .filter(Boolean);
  }, [favorites, allNodes]);

  const toggleFavorite = useCallback(
    (node, e) => {
      e.stopPropagation();
      if (isFavoriteNode(node, favorites)) {
        removeFavoriteNode(node);
        setFavorites((prev) =>
          prev.filter(
            (f) => !(f.type === node.type && f.subType === node.subType)
          )
        );
      } else {
        addFavoriteNode(node);
        setFavorites(getFavoriteNodes());
      }
    },
    [favorites]
  );

  const focusedNode = useMemo(() => {
    if (focusedIndex >= 0 && currentItems[focusedIndex]) {
      return currentItems[focusedIndex];
    }
    return null;
  }, [focusedIndex, currentItems]);

  const focusedNodePreview = useMemo(() => {
    return getPreviewForNode(focusedNode);
  }, [focusedNode]);

  const isPreviewVisible = useMemo(() => {
    return (
      focusedNode &&
      currentItems.length > 0 &&
      activeSection !== "help" &&
      activeSection !== "recipes" &&
      !wizardRecipe
    );
  }, [focusedNode, currentItems.length, activeSection, wizardRecipe]);

  useEffect(() => {
    const interval = setInterval(() => {
      setPlaceholderIndex((prev) => (prev + 1) % PLACEHOLDER_EXAMPLES.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (isOpen) {
      setSearchText("");
      setFocusedIndex(0);
      setActiveSection("nodes");
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
    }
  }, [isOpen]);

  useEffect(() => {
    setFocusedIndex(0);
  }, [searchText, activeSection]);

  useEffect(() => {
    if (listRef.current && focusedIndex >= 0) {
      const focusedEl = listRef.current.querySelector(
        `[data-index="${focusedIndex}"]`
      );
      if (focusedEl) {
        focusedEl.scrollIntoView({ block: "nearest", behavior: "smooth" });
      }
    }
  }, [focusedIndex]);

  /**
   * handleNodeClick - Main handler for node/recipe selection
   *
   * SINGLE-NODE INSERTION RULE:
   * This function routes items to their appropriate handlers:
   * - Recipes (node.steps) → Recipe Wizard (multi-node boundary)
   * - Child action parents → Expansion view
   * - Triggers with conflicts → Confirmation dialog
   * - Single nodes → onNodeSelect (ONE node only)
   *
   * DEV NOTE: The node.nodes legacy path is deprecated.
   * New multi-node patterns MUST use the Recipe Wizard.
   */
  const handleNodeClick = useCallback(
    (node) => {
      if (node.steps) {
        setWizardRecipe(node);
        setWizardStep(0);
        return;
      }
      if (hasChildActions(node) && !node.isChildAction) {
        const children = getChildActions(node);
        setChildActionsView({
          parentNode: node,
          children: children,
        });
        setFocusedIndex(0);
        return;
      }
      if (isTriggerNodeType(node)) {
        const existingTriggerNode = getExistingTrigger();
        if (existingTriggerNode) {
          const existingData = existingTriggerNode?.data || existingTriggerNode;
          setTriggerConfirmation({
            newTrigger: node,
            existingTriggerNode: existingTriggerNode,
            existingTriggerData: existingData,
          });
          return;
        }
      }
      if (node.nodes && node.nodes.length > 1) {
        const convertedRecipe = {
          id: node.id || `legacy-recipe-${Date.now()}`,
          name: node.name || node.label || "Multi-Node Recipe",
          description: node.description || "Insert multiple nodes",
          nodes: node.nodes,
          steps: node.nodes.map((type, idx) => ({
            type: type,
            label: `Add ${type}`,
            hint: `Step ${idx + 1} of ${node.nodes.length}`,
          })),
          iconName: node.iconName || "OUTEAutoAwesomeIcon",
          isFromLegacy: true,
        };
        if (process.env.NODE_ENV === "development") {
          console.info(
            "[CommandPalette] Converted legacy node.nodes to Recipe Wizard format.",
            { nodeId: node.id, nodesCount: node.nodes.length }
          );
        }
        setWizardRecipe(convertedRecipe);
        setWizardStep(0);
        return;
      }
      if (node.nodes && node.nodes.length === 1) {
        const matchedNode = allNodes.find(
          (n) =>
            n.type?.toUpperCase().includes(node.nodes[0]) ||
            n.subType?.toUpperCase().includes(node.nodes[0])
        );
        if (matchedNode) {
          addRecentNode(matchedNode);
          incrementUsage(matchedNode);
          onNodeSelect(matchedNode);
          onClose();
        }
        return;
      }
      {
        addRecentNode(node);
        incrementUsage(node);
        onNodeSelect(node);
      }
      onClose();
    },
    [
      onNodeSelect,
      onClose,
      allNodes,
      getExistingTrigger,
      hasChildActions,
      getChildActions,
    ]
  );

  const handleTriggerReplace = useCallback(() => {
    if (!triggerConfirmation) return;
    const { newTrigger, existingTriggerNode } = triggerConfirmation;
    if (onTriggerReplace) {
      onTriggerReplace(existingTriggerNode, newTrigger);
    } else {
      addRecentNode(newTrigger);
      incrementUsage(newTrigger);
      onNodeSelect(newTrigger);
    }
    setTriggerConfirmation(null);
    onClose();
  }, [triggerConfirmation, onTriggerReplace, onNodeSelect, onClose]);

  const handleTriggerCancel = useCallback(() => {
    setTriggerConfirmation(null);
  }, []);

  const handleWizardAddStep = useCallback(() => {
    if (!wizardRecipe || !wizardRecipe.steps) return;
    const step = wizardRecipe.steps[wizardStep];
    const matchedNode = allNodes.find(
      (n) =>
        n.type?.toUpperCase().includes(step.type) ||
        n.subType?.toUpperCase().includes(step.type)
    );
    if (matchedNode) {
      addRecentNode(matchedNode);
      incrementUsage(matchedNode);
      onNodeSelect(matchedNode);
      if (wizardStep < wizardRecipe.steps.length - 1) {
        setWizardStep((prev) => prev + 1);
      } else {
        onClose();
      }
    }
  }, [wizardRecipe, wizardStep, allNodes, onNodeSelect, onClose]);

  const handleWizardBack = useCallback(() => {
    if (wizardStep > 0) {
      setWizardStep((prev) => prev - 1);
    } else {
      setWizardRecipe(null);
    }
  }, [wizardStep]);

  const handleWizardSkip = useCallback(() => {
    if (wizardStep < wizardRecipe.steps.length - 1) {
      setWizardStep((prev) => prev + 1);
    } else {
      onClose();
    }
  }, [wizardRecipe, wizardStep, onClose]);

  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setFocusedIndex((prev) => Math.min(prev + 1, currentItems.length - 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setFocusedIndex((prev) => Math.max(prev - 1, 0));
      } else if (e.key === "Enter") {
        e.preventDefault();
        if (focusedIndex >= 0 && currentItems[focusedIndex]) {
          handleNodeClick(currentItems[focusedIndex]);
        }
      } else if (e.key === "Escape") {
        e.preventDefault();
        if (childActionsView) {
          handleBackFromChildren();
        } else {
          onClose();
        }
      } else if (e.key === "Backspace" && !searchText && childActionsView) {
        e.preventDefault();
        handleBackFromChildren();
      } else if (e.key === "Tab") {
        e.preventDefault();
        const sections = ["nodes", "recent", "recipes", "help"];
        const currentIdx = sections.indexOf(activeSection);
        const nextIdx = e.shiftKey
          ? (currentIdx - 1 + sections.length) % sections.length
          : (currentIdx + 1) % sections.length;
        setActiveSection(sections[nextIdx]);
      }
    },
    [
      currentItems,
      focusedIndex,
      handleNodeClick,
      onClose,
      activeSection,
      childActionsView,
      searchText,
      handleBackFromChildren,
    ]
  );

  const handleBackdropClick = useCallback(
    (e) => {
      if (e.target === e.currentTarget) {
        onClose();
      }
    },
    [onClose]
  );

  const highlightMatch = useCallback((text, search) => {
    if (!search.trim() || !text) return text;
    const regex = new RegExp(
      `(${search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`,
      "gi"
    );
    const parts = text.split(regex);
    return parts.map((part, i) =>
      regex.test(part) ? (
        <mark key={i} className={styles.highlight}>
          {part}
        </mark>
      ) : (
        part
      )
    );
  }, []);

  if (!isOpen) return null;

  const content = (
    <AnimatePresence>
      <motion.div
        className={styles.backdrop}
        onClick={handleBackdropClick}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.15 }}
      >
        <motion.div
          className={styles.palette}
          initial={{ opacity: 0, scale: 0.95, y: -20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -20 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          onKeyDown={handleKeyDown}
          tabIndex={-1}
          role="dialog"
          aria-modal="true"
          aria-label="Command palette"
        >
          {/* Search Header - Floating Box (fixed width, does not expand with preview) */}
          <div className={styles.searchContainer}>
            <div className={styles.searchIcon}>
              <Icon
                outeIconName="OUTESearchIcon"
                sx={{ fontSize: "1.25rem", color: "#607d8b" }}
              />
            </div>
            <input
              ref={searchInputRef}
              type="text"
              className={styles.searchInput}
              placeholder={PLACEHOLDER_EXAMPLES[placeholderIndex]}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              autoComplete="off"
            />
            {searchText ? (
              <button
                className={styles.clearButton}
                onClick={() => setSearchText("")}
                type="button"
                aria-label="Clear search"
              >
                <Icon
                  outeIconName="OUTECloseIcon"
                  sx={{ fontSize: "1rem", color: "#607d8b" }}
                />
              </button>
            ) : (
              <div className={styles.shortcutBadge}>
                <div className={styles.shortcutIcon}>
                  <Icon
                    imageProps={{
                      src: "https://cdn-v1.tinycommand.com/1234567890/1766995047876/cmd_K.svg",
                      alt: "",
                      className: styles.shortcutIconImage,
                    }}
                  />
                </div>
                <span className={styles.shortcutText}>+ K</span>
              </div>
            )}
          </div>

          {/* Content Row - mainContainer and previewPanel as flex siblings with 1.25rem gap */}
          <div className={styles.paletteContentRow}>
            {wizardRecipe ? (
              <div className={styles.wizardContainer}>
                <div className={styles.wizardHeader}>
                  <button
                    className={styles.wizardBack}
                    onClick={handleWizardBack}
                  >
                    <Icon
                      outeIconName="OUTEArrowBackIcon"
                      sx={{ fontSize: "1rem" }}
                    />
                    {wizardStep === 0 ? "Back" : "Previous"}
                  </button>
                  <div className={styles.wizardTitle}>
                    <Icon
                      outeIconName={
                        wizardRecipe.iconName || "OUTEAutoFixHighIcon"
                      }
                      sx={{ fontSize: "1.25rem", color: "#0066FF" }}
                    />
                    <span>{wizardRecipe.name}</span>
                  </div>
                  <div className={styles.wizardProgress}>
                    Step {wizardStep + 1} of {wizardRecipe.steps.length}
                  </div>
                </div>

                <div className={styles.wizardSteps}>
                  {wizardRecipe.steps.map((step, idx) => (
                    <div
                      key={idx}
                      className={`${styles.wizardStepIndicator} ${
                        idx < wizardStep ? styles.completed : ""
                      } ${idx === wizardStep ? styles.current : ""}`}
                    >
                      <div className={styles.stepDot}>
                        {idx < wizardStep ? (
                          <Icon
                            outeIconName="OUTECheckIcon"
                            sx={{ fontSize: "0.875rem" }}
                          />
                        ) : (
                          idx + 1
                        )}
                      </div>
                      <span className={styles.stepLabel}>{step.label}</span>
                    </div>
                  ))}
                </div>

                <div className={styles.wizardContent}>
                  <div className={styles.wizardStepCard}>
                    <h3 className={styles.wizardStepTitle}>
                      {wizardRecipe.steps[wizardStep]?.label}
                    </h3>
                    <p className={styles.wizardStepHint}>
                      {wizardRecipe.steps[wizardStep]?.hint}
                    </p>
                    <div className={styles.wizardStepType}>
                      Node: {wizardRecipe.steps[wizardStep]?.type}
                    </div>
                  </div>
                </div>

                <div className={styles.wizardFooter}>
                  <button
                    className={styles.wizardSkip}
                    onClick={handleWizardSkip}
                  >
                    Skip
                  </button>
                  <button
                    className={styles.wizardAdd}
                    onClick={handleWizardAddStep}
                  >
                    {wizardStep === wizardRecipe.steps.length - 1
                      ? "Add & Finish"
                      : "Add Node →"}
                  </button>
                </div>
              </div>
            ) : (
              <div className={styles.mainContainer}>
                {/* Tab Bar */}
                {!searchText.trim() && !childActionsView && (
                  <div className={styles.tabBar}>
                    <button
                      className={`${styles.tab} ${
                        activeSection === "nodes" ? styles.active : ""
                      }`}
                      onClick={() => setActiveSection("nodes")}
                    >
                      Nodes
                    </button>
                    <button
                      className={`${styles.tab} ${
                        activeSection === "recent" ? styles.active : ""
                      }`}
                      onClick={() => setActiveSection("recent")}
                    >
                      Recent
                    </button>
                    <button
                      className={`${styles.tab} ${
                        activeSection === "recipes" ? styles.active : ""
                      }`}
                      onClick={() => setActiveSection("recipes")}
                    >
                      Recipes
                    </button>
                    <button
                      className={`${styles.tab} ${
                        activeSection === "help" ? styles.active : ""
                      }`}
                      onClick={() => setActiveSection("help")}
                    >
                      Help
                    </button>
                  </div>
                )}

                {/* Child Actions Header - Figma Design */}
                {childActionsView && (
                  <div className={styles.childActionsHeader}>
                    <button
                      className={styles.backButton}
                      onClick={handleBackFromChildren}
                    >
                      <Icon
                        outeIconName="OUTEArrowBackIcon"
                        sx={{ fontSize: "1.25rem" }}
                      />
                      <span>Back</span>
                    </button>
                  </div>
                )}

                {/* Content Wrapper - contains contentArea and previewPanel side by side */}
                <div className={styles.contentWrapper}>
                  {/* Child Actions Content */}
                  {childActionsView && (
                    <div className={styles.childActionsContent}>
                      <h4 className={styles.childActionsTitle}>
                        {childActionsView.parentNode.name} Integrations
                      </h4>
                      <div className={styles.childActionsGrid}>
                        {currentItems.map((item, index) => (
                          <div
                            key={`child-${
                              item.id || item.type || "item"
                            }-${index}`}
                            className={`${styles.childActionCard} ${
                              focusedIndex === index
                                ? styles.childActionFocused
                                : ""
                            }`}
                            onClick={() => handleNodeClick(item)}
                            onMouseEnter={() => handleCardMouseEnter(index)}
                            onMouseLeave={handleCardMouseLeave}
                            data-index={index}
                          >
                            <div className={styles.childActionIcon}>
                              {childActionsView.parentNode._src ? (
                                <img
                                  src={childActionsView.parentNode._src}
                                  alt=""
                                />
                              ) : (
                                <Icon
                                  outeIconName={
                                    item.iconName || "OUTECubeOutlineIcon"
                                  }
                                  sx={{ fontSize: "1.5rem" }}
                                />
                              )}
                            </div>
                            <div className={styles.childActionInfo}>
                              <span className={styles.childActionName}>
                                {item.name}
                              </span>
                              <span className={styles.childActionParent}>
                                {childActionsView.parentNode.name}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Content Area - Hidden when viewing child actions */}
                  {!childActionsView && (
                    <div className={styles.contentArea} ref={listRef}>
                      {activeSection === "help" ? (
                        <div className={styles.helpContent}>
                          <div className={styles.helpSection}>
                            <h3 className={styles.helpSectionTitle}>
                              Keyboard Shortcuts
                            </h3>
                            <div className={styles.helpList}>
                              {HELP_CONTENT.shortcuts.map((shortcut, idx) => (
                                <div key={idx} className={styles.helpItem}>
                                  <span className={styles.helpKey}>
                                    {shortcut.key}
                                  </span>
                                  <span className={styles.helpDesc}>
                                    {shortcut.description}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                          <div className={styles.helpSection}>
                            <h3 className={styles.helpSectionTitle}>
                              Pro Tips
                            </h3>
                            <ul className={styles.helpTips}>
                              {HELP_CONTENT.tips.map((tip, idx) => (
                                <li key={idx} className={styles.helpTip}>
                                  {tip}
                                </li>
                              ))}
                            </ul>
                          </div>
                          <div className={styles.helpSection}>
                            <h3 className={styles.helpSectionTitle}>
                              Sections
                            </h3>
                            <div className={styles.helpList}>
                              {HELP_CONTENT.sections.map((section, idx) => (
                                <div key={idx} className={styles.helpItem}>
                                  <span className={styles.helpSectionName}>
                                    {section.name}
                                  </span>
                                  <span className={styles.helpDesc}>
                                    {section.description}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      ) : (
                        <>
                          {searchText.trim() ? (
                            <>
                              {currentItems.length === 0 ? (
                                <div className={styles.emptyState}>
                                  <div className={styles.emptyIcon}>
                                    <Icon
                                      outeIconName="OUTESearchIcon"
                                      sx={{
                                        fontSize: "2rem",
                                        color: "#78909c",
                                      }}
                                    />
                                  </div>
                                  <p className={styles.emptyText}>
                                    No nodes found for "{searchText}"
                                  </p>
                                  <p className={styles.emptyHint}>
                                    Try a different search term or browse
                                    categories
                                  </p>
                                </div>
                              ) : (
                                <>
                                  {/* Search Results Section */}
                                  <div className={styles.searchResultsSection}>
                                    <h4 className={styles.searchResultsHeader}>
                                      Search Results
                                    </h4>
                                    <div className={styles.searchResultsList}>
                                      {currentItems.map((item, index) => (
                                        <motion.div
                                          key={`search-${
                                            item.id || item.type || "item"
                                          }-${index}`}
                                          data-index={index}
                                          className={`${
                                            styles.searchResultItem
                                          } ${
                                            focusedIndex === index
                                              ? styles.focused
                                              : ""
                                          }`}
                                          onClick={() => handleNodeClick(item)}
                                          onMouseEnter={() =>
                                            handleCardMouseEnter(index)
                                          }
                                          onMouseLeave={handleCardMouseLeave}
                                          initial={{ opacity: 0, y: 4 }}
                                          animate={{ opacity: 1, y: 0 }}
                                          transition={{
                                            delay: index * 0.02,
                                            duration: 0.1,
                                          }}
                                        >
                                          <div
                                            className={`${
                                              styles.nodeIcon
                                            } ${getNodeCategoryClass(
                                              item,
                                              styles
                                            )}`}
                                          >
                                            {item._src ? (
                                              <img src={item._src} alt="" />
                                            ) : (
                                              <Icon
                                                outeIconName={
                                                  item.iconName ||
                                                  item.meta?.icon ||
                                                  "OUTECubeOutlineIcon"
                                                }
                                                sx={{ fontSize: "1.25rem" }}
                                              />
                                            )}
                                          </div>
                                          <span className={styles.nodeName}>
                                            {highlightMatch(
                                              item.name,
                                              searchText
                                            )}
                                          </span>
                                          {hasChildActions(item) &&
                                            !item.isChildAction && (
                                              <span
                                                className={
                                                  styles.hasChildrenBadge
                                                }
                                              >
                                                {
                                                  item.events?.components?.filter(
                                                    (c) =>
                                                      c?.annotation === "ACTION"
                                                  ).length
                                                }{" "}
                                                actions
                                              </span>
                                            )}
                                        </motion.div>
                                      ))}
                                    </div>
                                  </div>

                                  {/* Smart Suggestions Box */}
                                  {contextualNodes.length > 0 && (
                                    <div className={styles.smartSuggestionsBox}>
                                      <h4
                                        className={
                                          styles.smartSuggestionsHeader
                                        }
                                      >
                                        Smart Suggestions
                                      </h4>
                                      <div
                                        className={
                                          styles.smartSuggestionsContent
                                        }
                                      >
                                        <p className={styles.suggestedNextStep}>
                                          Suggested next step
                                        </p>
                                        {contextualNodes
                                          .slice(0, 2)
                                          .map((item, idx) => (
                                            <div
                                              key={`suggestion-${
                                                item.id || item.type || "item"
                                              }-${idx}`}
                                              className={`${
                                                styles.suggestionItem
                                              } ${
                                                focusedIndex ===
                                                currentItems.length + idx
                                                  ? styles.focused
                                                  : ""
                                              }`}
                                              onClick={() =>
                                                handleNodeClick(item)
                                              }
                                              onMouseEnter={() =>
                                                handleCardMouseEnter(
                                                  currentItems.length + idx
                                                )
                                              }
                                              onMouseLeave={
                                                handleCardMouseLeave
                                              }
                                            >
                                              <div
                                                className={`${
                                                  styles.nodeIcon
                                                } ${getNodeCategoryClass(
                                                  item,
                                                  styles
                                                )}`}
                                              >
                                                {item._src ? (
                                                  <img src={item._src} alt="" />
                                                ) : (
                                                  <Icon
                                                    outeIconName={
                                                      item.iconName ||
                                                      "OUTECubeOutlineIcon"
                                                    }
                                                    sx={{ fontSize: "1rem" }}
                                                  />
                                                )}
                                              </div>
                                              <span className={styles.nodeName}>
                                                {item.name}
                                              </span>
                                            </div>
                                          ))}
                                      </div>
                                    </div>
                                  )}

                                  {/* Build with AI Box */}
                                  <div className={styles.buildWithAIBox}>
                                    <h4 className={styles.buildWithAIHeader}>
                                      Build with AI
                                    </h4>
                                    <div className={styles.buildWithAIContent}>
                                      <div className={styles.buildWithAILeft}>
                                        <div className={styles.buildWithAIIcon}>
                                          <Icon
                                            outeIconName="OUTEAutoAwesomeIcon"
                                            sx={{
                                              fontSize: "2rem",
                                              color: "#892be1",
                                            }}
                                          />
                                        </div>
                                        <span
                                          className={styles.buildWithAIText}
                                        >
                                          Describe your logic and let AI
                                          generate the entire decision branch
                                          automatically.
                                        </span>
                                      </div>
                                      <button
                                        className={styles.buildWithAIButton}
                                      >
                                        Build with AI
                                      </button>
                                    </div>
                                  </div>
                                </>
                              )}
                            </>
                          ) : activeSection === "nodes" ? (
                            <>
                              {(() => {
                                let globalIdx = 0;
                                const getCategoryIconClass = (category) => {
                                  const cat = category?.toLowerCase() || "";
                                  if (
                                    cat.includes("ai") ||
                                    cat.includes("tiny")
                                  )
                                    return styles.ai;
                                  if (cat.includes("question"))
                                    return styles.question;
                                  if (
                                    cat.includes("data") ||
                                    cat.includes("database")
                                  )
                                    return styles.data;
                                  if (
                                    cat.includes("logic") ||
                                    cat.includes("condition")
                                  )
                                    return styles.logic;
                                  if (cat.includes("trigger"))
                                    return styles.trigger;
                                  if (cat.includes("integration"))
                                    return styles.integration;
                                  return styles.other;
                                };
                                return groupedNodes.map(([category, nodes]) => {
                                  const displayNodes = nodes;
                                  return (
                                    <div
                                      key={category}
                                      className={styles.categorySection}
                                    >
                                      <h4 className={styles.categoryHeader}>
                                        {category}
                                      </h4>
                                      <div
                                        className={styles.nodesGrid}
                                        style={{
                                          "--cards-per-row": CARDS_PER_ROW,
                                        }}
                                      >
                                        {displayNodes.map((item, idx) => {
                                          const currentIndex = globalIdx++;
                                          return (
                                            <div
                                              key={`node-${
                                                item.id || item.type || "item"
                                              }-${idx}`}
                                              data-index={currentIndex}
                                              className={`${styles.nodeCard} ${
                                                focusedIndex === currentIndex
                                                  ? styles.focused
                                                  : ""
                                              }`}
                                              onClick={() =>
                                                handleNodeClick(item)
                                              }
                                              onMouseEnter={() =>
                                                handleCardMouseEnter(
                                                  currentIndex
                                                )
                                              }
                                              onMouseLeave={
                                                handleCardMouseLeave
                                              }
                                            >
                                              <div
                                                className={`${
                                                  styles.nodeIcon
                                                } ${getCategoryIconClass(
                                                  category
                                                )}`}
                                              >
                                                {item._src ? (
                                                  <img src={item._src} alt="" />
                                                ) : (
                                                  <Icon
                                                    outeIconName={
                                                      item.iconName ||
                                                      item.meta?.icon ||
                                                      "OUTECubeOutlineIcon"
                                                    }
                                                    sx={{ fontSize: "1.25rem" }}
                                                  />
                                                )}
                                              </div>
                                              <span className={styles.nodeName}>
                                                {item.name}
                                              </span>
                                            </div>
                                          );
                                        })}
                                      </div>
                                    </div>
                                  );
                                });
                              })()}
                            </>
                          ) : activeSection === "recent" ? (
                            <>
                              {recentNodes.length > 0 ? (
                                <div className={styles.categorySection}>
                                  <h4 className={styles.categoryHeader}>
                                    Recently Used
                                  </h4>
                                  <div className={styles.recentList}>
                                    {recentNodes.map((item, index) => (
                                      <motion.div
                                        key={`recent-${
                                          item.id || item.type || "item"
                                        }-${index}`}
                                        data-index={index}
                                        className={`${styles.recentItem} ${
                                          focusedIndex === index
                                            ? styles.focused
                                            : ""
                                        }`}
                                        onClick={() => handleNodeClick(item)}
                                        onMouseEnter={() =>
                                          handleCardMouseEnter(index)
                                        }
                                        onMouseLeave={handleCardMouseLeave}
                                        initial={{ opacity: 0, y: 4 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{
                                          delay: index * 0.02,
                                          duration: 0.1,
                                        }}
                                      >
                                        <div
                                          className={`${
                                            styles.nodeIcon
                                          } ${getNodeCategoryClass(
                                            item,
                                            styles
                                          )}`}
                                        >
                                          {item._src ? (
                                            <img src={item._src} alt="" />
                                          ) : (
                                            <Icon
                                              outeIconName={
                                                item.iconName ||
                                                item.meta?.icon ||
                                                "OUTECubeOutlineIcon"
                                              }
                                              sx={{ fontSize: "1.25rem" }}
                                            />
                                          )}
                                        </div>
                                        <span className={styles.nodeName}>
                                          {item.name}
                                        </span>
                                      </motion.div>
                                    ))}
                                  </div>
                                </div>
                              ) : (
                                <div className={styles.emptyState}>
                                  <div className={styles.emptyIcon}>
                                    <Icon
                                      outeIconName="OUTEHistoryIcon"
                                      sx={{
                                        fontSize: "2rem",
                                        color: "#78909c",
                                      }}
                                    />
                                  </div>
                                  <p className={styles.emptyText}>
                                    No recent nodes
                                  </p>
                                  <p className={styles.emptyHint}>
                                    Nodes you use will appear here
                                  </p>
                                </div>
                              )}
                            </>
                          ) : activeSection === "recipes" ? (
                            <div className={styles.categorySection}>
                              {implicitRecipes.length > 0 && (
                                <>
                                  <h4 className={styles.categoryHeader}>
                                    Suggested Recipes
                                  </h4>
                                  <div className={styles.implicitRecipeHint}>
                                    <Icon
                                      outeIconName="OUTEInfoOutlinedIcon"
                                      sx={{
                                        fontSize: "0.875rem",
                                        color: "#78909c",
                                      }}
                                    />
                                    <span>
                                      Based on your search. Click "Use" to add
                                      this workflow.
                                    </span>
                                  </div>
                                  <div className={styles.recipesList}>
                                    {implicitRecipes.map((recipe, index) => (
                                      <motion.div
                                        key={recipe.id || `implicit-${index}`}
                                        className={`${styles.recipeCard} ${styles.implicitRecipe}`}
                                        initial={{ opacity: 0, y: 4 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{
                                          delay: index * 0.02,
                                          duration: 0.1,
                                        }}
                                      >
                                        <div className={styles.recipeIcon}>
                                          <Icon
                                            outeIconName="OUTEAutoAwesomeIcon"
                                            sx={{ fontSize: "1.5rem" }}
                                          />
                                        </div>
                                        <div className={styles.recipeInfo}>
                                          <h5 className={styles.recipeName}>
                                            {recipe.name}
                                            <span
                                              className={styles.suggestedBadge}
                                            >
                                              AI
                                            </span>
                                          </h5>
                                          <p
                                            className={styles.recipeDescription}
                                          >
                                            {recipe.description}
                                          </p>
                                        </div>
                                        <div className={styles.recipeNodes}>
                                          {recipe.steps.map((step, i) => (
                                            <span
                                              key={i}
                                              className={styles.recipeNode}
                                            >
                                              {step.type}
                                            </span>
                                          ))}
                                        </div>
                                        <button
                                          type="button"
                                          className={styles.useRecipeButton}
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            setPendingImplicitRecipe(recipe);
                                          }}
                                        >
                                          Use
                                        </button>
                                      </motion.div>
                                    ))}
                                  </div>
                                </>
                              )}
                              <h4 className={styles.categoryHeader}>
                                Workflow Templates
                              </h4>
                              <div className={styles.recipesList}>
                                {RECIPES.map((recipe, index) => {
                                  const adjustedIndex =
                                    implicitRecipes.length + index;
                                  return (
                                    <motion.div
                                      key={recipe.id || index}
                                      data-index={adjustedIndex}
                                      className={`${styles.recipeCard} ${
                                        focusedIndex === adjustedIndex
                                          ? styles.focused
                                          : ""
                                      }`}
                                      onClick={() => handleNodeClick(recipe)}
                                      onMouseEnter={() =>
                                        handleCardMouseEnter(adjustedIndex)
                                      }
                                      onMouseLeave={handleCardMouseLeave}
                                      initial={{ opacity: 0, y: 4 }}
                                      animate={{ opacity: 1, y: 0 }}
                                      transition={{
                                        delay: adjustedIndex * 0.02,
                                        duration: 0.1,
                                      }}
                                    >
                                      <div className={styles.recipeIcon}>
                                        <Icon
                                          outeIconName={
                                            recipe.iconName ||
                                            "OUTEAutoFixHighIcon"
                                          }
                                          sx={{ fontSize: "1.5rem" }}
                                        />
                                      </div>
                                      <div className={styles.recipeInfo}>
                                        <h5 className={styles.recipeName}>
                                          {recipe.name}
                                        </h5>
                                        <p className={styles.recipeDescription}>
                                          {recipe.description}
                                        </p>
                                      </div>
                                      <div className={styles.recipeNodes}>
                                        {recipe.nodes.map((n, i) => (
                                          <span
                                            key={i}
                                            className={styles.recipeNode}
                                          >
                                            {n}
                                          </span>
                                        ))}
                                      </div>
                                    </motion.div>
                                  );
                                })}
                              </div>
                            </div>
                          ) : null}
                        </>
                      )}
                    </div>
                  )}
                </div>

                {/* Footer */}
                <div className={styles.footer}>
                  <div className={styles.footerLeft}>
                    <div className={styles.footerGroup}>
                      <div className={styles.footerKeyIcon}>
                        <Icon
                          imageProps={{
                            src: "https://cdn-v1.tinycommand.com/1234567890/1766994940095/arrow_up.svg",
                            alt: "",
                            className: styles.footerKeyIconImage,
                          }}
                        />
                      </div>
                      <div
                        className={`${styles.footerKeyIcon} ${styles.footerKeyIconFlipped}`}
                      >
                        <Icon
                          imageProps={{
                            src: "https://cdn-v1.tinycommand.com/1234567890/1766994934640/arrow_down.svg",
                            alt: "",
                            className: styles.footerKeyIconImage,
                          }}
                        />
                      </div>
                      <span className={styles.footerLabel}>Navigate</span>
                    </div>
                    <div className={styles.footerGroup}>
                      <div className={styles.footerKeyIcon}>
                        <Icon
                          imageProps={{
                            src: "https://cdn-v1.tinycommand.com/1234567890/1766994945974/enter.svg",
                            alt: "",
                            className: styles.footerKeyIconImage,
                          }}
                        />
                      </div>
                      <span className={styles.footerLabel}>Select</span>
                    </div>
                  </div>
                  <div className={styles.footerGroup}>
                    <span className={styles.footerKeyText}>Esc</span>
                    <span className={styles.footerLabel}>Close</span>
                  </div>
                </div>
              </div>
            )}

            {/* Side Preview Panel - Always rendered for layout stability, visibility toggled via CSS */}
            <div
              className={`${styles.previewPanel} ${
                !isPreviewVisible ? styles.previewPanelHidden : ""
              }`}
              onMouseEnter={handlePreviewMouseEnter}
              onMouseLeave={handleCardMouseLeave}
              aria-hidden={!isPreviewVisible}
            >
              {focusedNode && (
                <>
                  <div className={styles.previewPanelHeader}>
                    <div
                      className={`${
                        styles.previewPanelIcon
                      } ${getNodeCategoryClass(focusedNode, styles)}`}
                    >
                      {focusedNode._src ? (
                        <img
                          src={focusedNode._src}
                          alt=""
                          style={{ width: "1.5rem", height: "1.5rem" }}
                        />
                      ) : (
                        <Icon
                          outeIconName={
                            focusedNode.iconName ||
                            focusedNode.meta?.icon ||
                            "OUTECubeOutlineIcon"
                          }
                          sx={{ fontSize: "1.5rem" }}
                        />
                      )}
                    </div>
                    <span className={styles.previewPanelTitle}>
                      {focusedNode.name}
                    </span>
                  </div>
                  <div className={styles.previewPanelContent}>
                    {focusedNode.description ||
                    focusedNodePreview?.description ||
                    focusedNodePreview?.inputs?.length > 0 ||
                    focusedNodePreview?.outputs?.length > 0 ? (
                      <>
                        {(focusedNode.description ||
                          focusedNodePreview?.description) && (
                          <div className={styles.previewPanelSection}>
                            <div className={styles.previewPanelLabel}>
                              Description
                            </div>
                            <p className={styles.previewPanelDescription}>
                              {focusedNode.description ||
                                focusedNodePreview?.description}
                            </p>
                          </div>
                        )}
                        {focusedNodePreview?.inputs &&
                          focusedNodePreview.inputs.length > 0 && (
                            <div className={styles.previewPanelSection}>
                              <div className={styles.previewPanelLabel}>
                                Inputs
                              </div>
                              <div className={styles.previewPanelTips}>
                                {focusedNodePreview.inputs.map((input, idx) => (
                                  <div
                                    key={idx}
                                    className={styles.previewPanelTip}
                                  >
                                    <span>{input}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        {focusedNodePreview?.outputs &&
                          focusedNodePreview.outputs.length > 0 && (
                            <div className={styles.previewPanelSection}>
                              <div className={styles.previewPanelLabel}>
                                Outputs
                              </div>
                              <div className={styles.previewPanelTips}>
                                {focusedNodePreview.outputs.map(
                                  (output, idx) => (
                                    <div
                                      key={idx}
                                      className={styles.previewPanelTip}
                                    >
                                      <span>{output}</span>
                                    </div>
                                  )
                                )}
                              </div>
                            </div>
                          )}
                      </>
                    ) : (
                      <div className={styles.previewPanelEmpty}>
                        <p className={styles.previewPanelEmptyText}>
                          No additional details available for this node.
                        </p>
                      </div>
                    )}
                  </div>
                  <div className={styles.previewPanelFooter}>
                    <button
                      className={styles.previewPanelAddButton}
                      onClick={() => handleNodeClick(focusedNode)}
                    >
                      Add to Canvas
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>

          {triggerConfirmation && (
            <div className={styles.triggerConfirmOverlay}>
              <div className={styles.triggerConfirmDialog}>
                <div className={styles.triggerConfirmHeader}>
                  <div className={styles.triggerConfirmIcon}>
                    <Icon
                      outeIconName="OUTEWarningAmberIcon"
                      sx={{ fontSize: "1.75rem", color: "#f59e0b" }}
                    />
                  </div>
                  <h3 className={styles.triggerConfirmTitle}>
                    Replace Existing Trigger?
                  </h3>
                </div>
                <p className={styles.triggerConfirmMessage}>
                  You already have a{" "}
                  <strong>
                    {getTriggerDisplayName(
                      triggerConfirmation.existingTriggerData
                    )}
                  </strong>{" "}
                  configured on this canvas.
                </p>
                <p className={styles.triggerConfirmWarning}>
                  Replacing it with{" "}
                  <strong>
                    {getTriggerDisplayName(triggerConfirmation.newTrigger)}
                  </strong>{" "}
                  will:
                </p>
                <ul className={styles.triggerConfirmList}>
                  <li>Remove the current trigger and its settings</li>
                  <li>Disconnect any nodes linked from the trigger</li>
                  <li>Require you to reconfigure the new trigger</li>
                </ul>
                <div className={styles.triggerConfirmActions}>
                  <button
                    className={styles.triggerConfirmCancel}
                    onClick={handleTriggerCancel}
                  >
                    Cancel
                  </button>
                  <button
                    className={styles.triggerConfirmReplace}
                    onClick={handleTriggerReplace}
                  >
                    Replace Trigger
                  </button>
                </div>
              </div>
            </div>
          )}

          {pendingImplicitRecipe && (
            <div className={styles.triggerConfirmOverlay}>
              <div className={styles.triggerConfirmDialog}>
                <div className={styles.triggerConfirmHeader}>
                  <div
                    className={styles.triggerConfirmIcon}
                    style={{
                      background:
                        "linear-gradient(135deg, #0066ff 0%, #3d8bfd 100%)",
                    }}
                  >
                    <Icon
                      outeIconName="OUTEAutoAwesomeIcon"
                      sx={{ fontSize: "1.75rem", color: "#ffffff" }}
                    />
                  </div>
                  <h3 className={styles.triggerConfirmTitle}>
                    Use Suggested Recipe?
                  </h3>
                </div>
                <p className={styles.triggerConfirmMessage}>
                  This recipe was detected from your search:{" "}
                  <strong>"{pendingImplicitRecipe.searchMatch}"</strong>
                </p>
                <p className={styles.triggerConfirmWarning}>
                  <strong>{pendingImplicitRecipe.name}</strong> will add the
                  following nodes:
                </p>
                <div className={styles.implicitRecipePreview}>
                  {pendingImplicitRecipe.steps.map((step, idx) => (
                    <div key={idx} className={styles.implicitRecipeStep}>
                      <span className={styles.implicitRecipeStepNumber}>
                        {idx + 1}
                      </span>
                      <span className={styles.implicitRecipeStepType}>
                        {step.type}
                      </span>
                    </div>
                  ))}
                </div>
                <p className={styles.implicitRecipeNote}>
                  {pendingImplicitRecipe.description}
                </p>
                <div className={styles.triggerConfirmActions}>
                  <button
                    className={styles.triggerConfirmCancel}
                    onClick={() => setPendingImplicitRecipe(null)}
                  >
                    Cancel
                  </button>
                  <button
                    className={styles.triggerConfirmReplace}
                    style={{
                      background:
                        "linear-gradient(135deg, #0066ff 0%, #3d8bfd 100%)",
                    }}
                    onClick={() => {
                      const convertedRecipe = {
                        id: pendingImplicitRecipe.id,
                        name: pendingImplicitRecipe.name,
                        description: pendingImplicitRecipe.description,
                        nodes: pendingImplicitRecipe.steps.map((s) => s.type),
                        steps: pendingImplicitRecipe.steps.map((s, idx) => ({
                          type: s.type,
                          label: `Add ${s.type}`,
                          hint: `Step ${idx + 1} of ${
                            pendingImplicitRecipe.steps.length
                          }`,
                        })),
                        iconName: "OUTEAutoAwesomeIcon",
                        isFromImplicit: true,
                      };
                      setPendingImplicitRecipe(null);
                      setWizardRecipe(convertedRecipe);
                      setWizardStep(0);
                    }}
                  >
                    Continue
                  </button>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );

  return createPortal(content, document.body);
};

export default CommandPalette;
