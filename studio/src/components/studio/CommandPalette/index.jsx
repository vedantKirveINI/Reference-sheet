import React, {
  useCallback,
  useState,
  useEffect,
  useRef,
  useMemo,
} from "react";
import { createPortal } from "react-dom";
import {
  Command,
  ArrowUp,
  ArrowDown,
  CornerDownLeft,
  Search,
  X,
  ArrowLeft,
  ChevronRight,
  Info,
  Check,
  Box,
  Sparkles,
  Wand2,
  History,
  HelpCircle,
  AlertTriangle,
  Link,
  Mail,
  RefreshCw,
  FileText,
  Webhook,
  Repeat,
  ClipboardList,
  Circle,
  User,
  Building2,
  Briefcase,
  AtSign,
  MessageSquare,
  Lightbulb,
  BookOpen,
  Lock,
  Send,
  Gift,
  Smartphone,
  Phone,
  ShieldCheck,
  Truck,
  ShoppingCart,
  DollarSign,
  BarChart3,
  Star,
  Calendar,
  Clock,
  Package,
  Target,
  PieChart,
  CheckSquare,
  Globe,
  Users,
  CreditCard,
  CheckCircle,
  Bell,
  Smile,
  GraduationCap,
  Trophy,
  BarChart,
  Image,
  Database,
  Zap,
  Play,
  Filter,
  Layers,
  Download,
  Upload,
  Settings,
  ArrowRightLeft,
  GitBranch,
  Merge,
  Route,
  Network,
  Bot,
  Plug,
  Hash,
  Navigation,
} from "lucide-react";

const ICON_MAP = {
  User,
  Building2,
  Briefcase,
  AtSign,
  MessageSquare,
  Lightbulb,
  BookOpen,
  Mail,
  Lock,
  Send,
  Gift,
  Smartphone,
  Phone,
  ShieldCheck,
  Truck,
  ShoppingCart,
  DollarSign,
  BarChart3,
  Star,
  Calendar,
  Clock,
  Package,
  Target,
  PieChart,
  CheckSquare,
  Globe,
  Users,
  CreditCard,
  CheckCircle,
  Bell,
  Smile,
  GraduationCap,
  Trophy,
  BarChart,
  Image,
  Database,
  Zap,
  Play,
  Filter,
  Layers,
  Download,
  Upload,
  FileText,
  AlertTriangle,
  Info,
  Check,
  Box,
  Sparkles,
  Wand2,
  History,
  HelpCircle,
  Link,
  RefreshCw,
  Webhook,
  Repeat,
  ClipboardList,
  Circle,
  ArrowRightLeft,
  GitBranch,
  Merge,
  Route,
  Network,
  Bot,
  Plug,
  Hash,
  Search,
  ChevronRight,
  Navigation,
};
import {
  getRecentNodes,
  addRecentNode,
} from "../../../module/search/utils/recentNodes";
import { useWorkflowPreferences } from "@src/hooks/useWorkflowPreferences";
import {
  isTriggerNodeType,
  getTriggerType,
} from "../../../constants/node-rules";
import {
  runSuggestionPipeline,
  hasChildActions,
  getChildActions,
  buildCandidatePool,
  groupNodesByCategory,
  flattenForGrid,
  applyStaticSignals,
  formatForDisplay,
  getSuggestionsForSearch,
} from "./suggestionPipeline";
import { getNodeDescription } from "./nodeDescriptions";
import { getNodeDescriptionText } from "@/components/canvas/extensions";
import { cn } from "@/lib/utils";
import useScrollLock from "@src/hooks/useScrollLock";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Kbd } from "@/components/ui/kbd";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { toast } from "sonner";
import * as VisuallyHidden from "@radix-ui/react-visually-hidden";

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
  "Type > to jump to a node on canvas",
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

const getNodeCategoryClass = (node) => {
  const type = (node.type || "").toLowerCase();
  const subType = (node.subType || "").toLowerCase();
  const name = (node.name || "").toLowerCase();
  const category = (node.category || "").toLowerCase();
  const nodeModule = (node.module || "").toLowerCase();

  if (
    type.includes("ai") ||
    type.includes("tiny") ||
    name.includes("ai ") ||
    AI_NODE_TYPES.some((t) => type.includes(t) || subType.includes(t))
  ) {
    return "bg-[rgba(98,0,238,0.12)] text-[#6200ee]";
  }
  if (type.includes("question") || category.includes("question")) {
    return "bg-[#fff8e6] text-[#e8a907]";
  }
  if (
    type.includes("trigger") ||
    category.includes("trigger") ||
    TRIGGER_NODE_TYPES.some((t) => type.includes(t) || subType.includes(t))
  ) {
    return "bg-[#fff2ee] text-[#ff7b52]";
  }
  if (
    type.includes("logic") ||
    type.includes("condition") ||
    category.includes("logic") ||
    LOGIC_NODE_TYPES.some((t) => type.includes(t) || subType.includes(t))
  ) {
    return "bg-[#eef2fc] text-[#1c3693]";
  }
  if (
    type.includes("data") ||
    type.includes("database") ||
    category.includes("data") ||
    DATA_NODE_TYPES.some((t) => type.includes(t) || subType.includes(t))
  ) {
    return "bg-[#ebf5f2] text-[#369b7d]";
  }
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
    return "bg-[#f1f5f9] text-[#64748b]";
  }
  return "bg-[#f1f5f9] text-[#64748b]";
};

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
  IFELSE_V2: {
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

const getHelpContent = (isMac) => ({
  shortcuts: [
    { key: isMac ? "⌘K" : "Ctrl+K", description: "Open command palette" },
    { key: "↑ / ↓", description: "Navigate results" },
    { key: "Enter", description: "Add selected node" },
    { key: "Escape", description: "Close palette" },
    { key: "Tab", description: "Switch between sections" },
    { key: ">", description: "Jump to an existing canvas node" },
  ],
  tips: [
    "Use natural language: 'send email when record created'",
    "Star frequently used nodes for quick access",
    "Search by node type or description",
    "Type > to find and jump to any node on the canvas",
  ],
  sections: [
    { name: "All Nodes", description: "Browse all available nodes" },
    { name: "Favorites", description: "Your starred nodes" },
    { name: "Recent", description: "Recently used nodes" },
    { name: "Jump to", description: "Navigate to existing canvas nodes" },
  ],
});

const getIconComponent = (iconName) => {
  const iconMap = {
    OUTESearchIcon: Search,
    OUTECloseIcon: X,
    OUTEArrowBackIcon: ArrowLeft,
    OUTEChevronRightIcon: ChevronRight,
    OUTEInfoOutlineIcon: Info,
    OUTEInfoOutlinedIcon: Info,
    OUTECheckIcon: Check,
    OUTECubeOutlineIcon: Box,
    OUTEAutoAwesomeIcon: Sparkles,
    OUTEAutoFixHighIcon: Wand2,
    OUTEHistoryIcon: History,
    OUTEHelpOutlineIcon: HelpCircle,
    OUTEHelpOutlinedIcon: HelpCircle,
    OUTEWarningAmberIcon: AlertTriangle,
    OUTELinkIcon: Link,
    OUTEEmailOutlinedIcon: Mail,
    OUTELoopIcon: RefreshCw,
    OUTEAssessmentOutlinedIcon: FileText,
    OUTEWebhookIcon: Webhook,
  };
  return iconMap[iconName] || Box;
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

const NodeCard = React.memo(
  ({
    node,
    isSelected,
    onClick,
    onMouseEnter,
    onMouseLeave,
    index,
    nodeId,
    disabledReasons = [],
  }) => {
    const isDisabled = disabledReasons?.length > 0;
    const card = (
      <div
        id={nodeId}
        data-index={index}
        className={cn(
          "flex items-center gap-3 p-2.5 bg-white border border-[#e5e7eb] rounded-xl",
          "transition-[background-color,border-color,box-shadow,transform] duration-150 ease-out",
          !isDisabled && "cursor-pointer",
          !isDisabled &&
            "hover:bg-[#f8fafc] hover:border-[#cbd5e1] hover:shadow-[0_2px_8px_0_rgba(15,23,42,0.06)] hover:-translate-y-[1px]",
          !isDisabled && "active:scale-[0.99]",
          isDisabled && "opacity-60 cursor-not-allowed",
          isSelected &&
            "bg-[#f0f4ff] border-[#1c3693]/30 shadow-[0_0_0_2px_rgba(28,54,147,0.15),0_2px_8px_0_rgba(28,54,147,0.1)] ring-2 ring-[#1c3693] ring-offset-1"
        )}
        onClick={onClick}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        role="option"
        aria-selected={isSelected}
        aria-disabled={isDisabled}
        aria-label={`${node.name}${
          node.parentName ? `, from ${node.parentName}` : ""
        }`}
      >
        <div
          className={cn(
            "w-8 h-8 flex items-center justify-center rounded-md flex-shrink-0 p-1",
            getNodeCategoryClass(node)
          )}
        >
          {node._src ? (
            <img src={node._src} alt="" className="w-6 h-6 object-contain" />
          ) : (
            (() => {
              const IconComponent = getIconComponent(
                node.iconName || node.meta?.icon || "OUTECubeOutlineIcon"
              );
              return <IconComponent size={20} />;
            })()
          )}
        </div>
        <div className="flex flex-col gap-0.5 min-w-0 flex-1">
          <span className="font-['Inter',sans-serif] text-sm font-medium text-[#263238] leading-5 truncate">
            {node.name}
          </span>
          {node.parentName ? (
            <span className="font-['Inter',sans-serif] text-xs font-normal text-[#64748b] leading-4 truncate">
              {node.parentName}
            </span>
          ) : (getNodeDescriptionText(node.type) || node.description) ? (
            <span className="font-['Inter',sans-serif] text-xs font-normal text-[#94a3b8] leading-4 truncate">
              {getNodeDescriptionText(node.type) || node.description}
            </span>
          ) : null}
        </div>
        {hasChildActions(node) && !node.isChildAction && (
          <div className="flex-shrink-0 text-[#94a3b8]">
            <ChevronRight size={16} />
          </div>
        )}
      </div>
    );
    if (isDisabled && disabledReasons[0]) {
      return (
        <TooltipProvider delayDuration={300}>
          <Tooltip>
            <TooltipTrigger asChild>{card}</TooltipTrigger>
            <TooltipContent side="top" className="max-w-[16rem]">
              {disabledReasons[0]}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    }
    return card;
  }
);

NodeCard.displayName = "NodeCard";

const getUseCaseIcon = (iconName) => {
  // Use curated icon map for common icons, fallback to Circle
  const IconComponent = ICON_MAP[iconName];
  return IconComponent || Circle;
};

const UseCaseIcon = ({ iconName }) => {
  const IconComponent = getUseCaseIcon(iconName);
  return (
    <IconComponent className="w-4 h-4 text-[#64748b]" strokeWidth={1.75} />
  );
};

const UseCaseCarousel = React.memo(({ useCases }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (!useCases || useCases.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % useCases.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [useCases]);

  if (!useCases || useCases.length === 0) return null;

  const currentUseCase = useCases[currentIndex];

  return (
    <div className="mt-4 pt-4 border-t border-[#f1f5f9]">
      <div className="flex items-center justify-between mb-2">
        <span className="font-['Inter',sans-serif] text-[0.6875rem] font-medium text-[#94a3b8] uppercase tracking-wider">
          Use case
        </span>
        {useCases.length > 1 && (
          <div className="flex gap-1">
            {useCases.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                className={cn(
                  "w-1.5 h-1.5 rounded-full transition-all duration-200",
                  idx === currentIndex
                    ? "bg-[#1c3693] w-3"
                    : "bg-[#e2e8f0] hover:bg-[#cbd5e1]"
                )}
                aria-label={`View use case ${idx + 1}`}
              />
            ))}
          </div>
        )}
      </div>
      <div
        key={currentIndex}
        className="flex items-center gap-3 p-3 bg-gradient-to-br from-[#f8fafc] to-[#f1f5f9] rounded-lg border border-[#e2e8f0] transition-opacity duration-200"
      >
        <div className="w-8 h-8 flex items-center justify-center bg-white rounded-lg border border-[#e2e8f0] flex-shrink-0 shadow-sm">
          <UseCaseIcon iconName={currentUseCase.icon} />
        </div>
        <span className="font-['Inter',sans-serif] text-sm font-normal text-[#475569] leading-snug">
          {currentUseCase.text}
        </span>
      </div>
    </div>
  );
});

UseCaseCarousel.displayName = "UseCaseCarousel";

const parseDescription = (text) => {
  if (!text) return null;
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, idx) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={idx} className="font-semibold text-[#334155]">
          {part.slice(2, -2)}
        </strong>
      );
    }
    return part;
  });
};

const PreviewPanel = React.forwardRef(
  (
    {
      node,
      nodePreview,
      onAddClick,
      isVisible,
      onMouseEnter,
      onMouseLeave,
      positionLeft = false,
    },
    ref
  ) => {
    if (!node || !isVisible) return null;

    const richDescription = getNodeDescription(node);
    const hasRichDescription = !!richDescription;

    const positionClasses = positionLeft
      ? "right-[calc(100%+1rem)] left-auto"
      : "left-[calc(100%+1rem)]";

    return (
      <div
        ref={ref}
        className={cn(
          "absolute top-0 w-64 lg:w-72 xl:w-80 bg-white border border-[#e2e8f0] rounded-[1rem] flex-col overflow-hidden shadow-[0_0.25rem_0.75rem_0_rgba(15,23,42,0.08)] max-h-[70vh] z-10 transition-all duration-150 hidden lg:flex",
          positionClasses
        )}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        role="complementary"
        aria-label="Node details"
      >
        <div className="flex items-start gap-[0.75rem] px-[1.25rem] py-[1rem] border-b border-[#e5e7eb] bg-white rounded-t-[1rem] flex-shrink-0">
          <div
            className={cn(
              "w-10 h-10 flex items-center justify-center rounded-xl flex-shrink-0",
              getNodeCategoryClass(node)
            )}
          >
            {node._src ? (
              <img src={node._src} alt="" className="w-6 h-6" />
            ) : (
              (() => {
                const IconComponent = getIconComponent(
                  node.iconName || node.meta?.icon || "OUTECubeOutlineIcon"
                );
                return <IconComponent size={24} />;
              })()
            )}
          </div>
          <div className="flex flex-col gap-0.5 min-w-0">
            <span className="font-['Inter',sans-serif] text-base font-semibold text-[#1e293b] leading-6 tracking-[-0.01em]">
              {node.name}
            </span>
            {hasRichDescription && richDescription.tagline && (
              <span className="font-['Inter',sans-serif] text-sm font-normal text-[#64748b] leading-5">
                {richDescription.tagline}
              </span>
            )}
            {!hasRichDescription && node.parentName && (
              <span className="font-['Inter',sans-serif] text-sm font-normal text-[#64748b] leading-5">
                {node.parentName}
              </span>
            )}
          </div>
        </div>

        <ScrollArea className="flex-1 min-h-0">
          <div className="px-5 py-4 flex flex-col">
            {hasRichDescription ? (
              <>
                <p className="font-['Inter',sans-serif] text-[0.9375rem] font-normal text-[#475569] leading-relaxed m-0">
                  {parseDescription(richDescription.description)}
                </p>

                {richDescription.tips && (
                  <div className="mt-4 flex items-start gap-2 p-3 bg-[#fffbeb] border border-[#fef3c7] rounded-lg">
                    <span className="text-sm flex-shrink-0">💡</span>
                    <span className="font-['Inter',sans-serif] text-sm font-normal text-[#92400e] leading-snug">
                      {richDescription.tips}
                    </span>
                  </div>
                )}

                <UseCaseCarousel useCases={richDescription.useCases} />
              </>
            ) : (
              <>
                {(getNodeDescriptionText(node.type) || node.description || nodePreview?.description) && (
                  <p className="font-['Inter',sans-serif] text-[0.9375rem] font-normal text-[#475569] leading-relaxed m-0">
                    {getNodeDescriptionText(node.type) || node.description || nodePreview?.description}
                  </p>
                )}

                {nodePreview?.inputs && nodePreview.inputs.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-[#f1f5f9]">
                    <div className="font-['Inter',sans-serif] text-[0.6875rem] font-medium text-[#94a3b8] uppercase tracking-wider mb-2">
                      Inputs
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {nodePreview.inputs.map((input, idx) => (
                        <Badge
                          key={idx}
                          variant="secondary"
                          className="text-xs font-normal bg-[#f1f5f9] text-[#475569]"
                        >
                          {input}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {nodePreview?.outputs && nodePreview.outputs.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-[#f1f5f9]">
                    <div className="font-['Inter',sans-serif] text-[0.6875rem] font-medium text-[#94a3b8] uppercase tracking-wider mb-2">
                      Outputs
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {nodePreview.outputs.map((output, idx) => (
                        <Badge
                          key={idx}
                          variant="outline"
                          className="text-xs font-normal border-[#e2e8f0] text-[#475569]"
                        >
                          {output}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {!getNodeDescriptionText(node.type) &&
                  !node.description &&
                  !nodePreview?.description &&
                  (!nodePreview?.inputs || nodePreview.inputs.length === 0) &&
                  (!nodePreview?.outputs ||
                    nodePreview.outputs.length === 0) && (
                    <div className="flex flex-col items-center justify-center py-6 text-center">
                      <div className="w-12 h-12 flex items-center justify-center bg-[#f1f5f9] rounded-xl mb-3">
                        <Info size={24} color="#94a3b8" />
                      </div>
                      <p className="font-['Inter',sans-serif] text-sm text-[#64748b] leading-5 max-w-[200px]">
                        Add this node to your canvas to configure it
                      </p>
                    </div>
                  )}
              </>
            )}
          </div>
        </ScrollArea>

        <div className="px-[1.25rem] py-[0.75rem] border-t border-[#f1f5f9] bg-[#fafbfc] rounded-b-[1rem]">
          <div className="flex items-center justify-between">
            <span className="font-['Inter',sans-serif] text-xs text-[#94a3b8]">
              Press{" "}
              <Kbd className="mx-1 px-1.5 py-0.5 text-[0.6875rem]">Enter</Kbd>{" "}
              to add
            </span>
            {hasRichDescription && richDescription.category && (
              <Badge
                variant="secondary"
                className="text-[0.625rem] font-medium bg-[#f1f5f9] text-[#64748b] capitalize"
              >
                {richDescription.category}
              </Badge>
            )}
          </div>
        </div>
      </div>
    );
  }
);

PreviewPanel.displayName = "PreviewPanel";

const CanvasNodeCard = React.memo(
  ({ node, isSelected, onClick, onMouseEnter, onMouseLeave, index, nodeId }) => {
    return (
      <div
        id={nodeId}
        data-index={index}
        className={cn(
          "flex items-center gap-3 p-2.5 bg-white border border-[#e5e7eb] rounded-xl",
          "transition-[background-color,border-color,box-shadow,transform] duration-150 ease-out",
          "cursor-pointer",
          "hover:bg-[#f8fafc] hover:border-[#cbd5e1] hover:shadow-[0_2px_8px_0_rgba(15,23,42,0.06)] hover:-translate-y-[1px]",
          "active:scale-[0.99]",
          isSelected &&
            "bg-[#f0f4ff] border-[#1c3693]/30 shadow-[0_0_0_2px_rgba(28,54,147,0.15),0_2px_8px_0_rgba(28,54,147,0.1)] ring-2 ring-[#1c3693] ring-offset-1"
        )}
        onClick={onClick}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        role="option"
        aria-selected={isSelected}
        aria-label={`Jump to ${node.name || node.text || "node"}`}
      >
        <div className="w-8 h-8 flex items-center justify-center rounded-md flex-shrink-0 p-1 bg-[#eef2fc] text-[#1c3693]">
          <Navigation size={20} />
        </div>
        <div className="flex flex-col gap-0.5 min-w-0 flex-1">
          <span className="font-['Inter',sans-serif] text-sm font-medium text-[#263238] leading-5 truncate">
            {node.name || node.text || node.type || "Unnamed Node"}
          </span>
          <span className="font-['Inter',sans-serif] text-xs font-normal text-[#94a3b8] leading-4 truncate">
            {node.type || ""}{node.key != null ? ` · #${node.key}` : ""}
          </span>
        </div>
        <div className="flex-shrink-0 text-[#94a3b8]">
          <ChevronRight size={16} />
        </div>
      </div>
    );
  }
);

CanvasNodeCard.displayName = "CanvasNodeCard";

const CommandPalette = ({
  isOpen = false,
  onClose = () => {},
  onNodeSelect = () => {},
  onNavigateToNode = null,
  onTriggerReplace = null,
  tabData = [],
  previousNode = null,
  canvasRef = null,
  getDisabledNodes = null,
  getWorkflowContext = null,
}) => {
  const [searchText, setSearchText] = useState("");
  const [debouncedSearchText, setDebouncedSearchText] = useState("");
  const [focusedIndex, setFocusedIndex] = useState(0);
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const [activeSection, setActiveSection] = useState("nodes");
  const [favorites, setFavorites] = useState([]);
  const [usageStats, setUsageStats] = useState({});
  const [triggerConfirmation, setTriggerConfirmation] = useState(null);
  const [childActionsView, setChildActionsView] = useState(null);
  const [previewPositionLeft, setPreviewPositionLeft] = useState(false);

  const isNavigationMode = searchText.startsWith(">") || activeSection === "navigate";

  const canvasNodes = useMemo(() => {
    if (!isOpen || !canvasRef?.current) return [];
    try {
      const allCanvasNodes = canvasRef.current.getAllNodes?.() || [];
      return allCanvasNodes
        .filter((node) => node && node.key != null)
        .map((node) => ({
          key: node.key,
          name: node.name || node.text || node.description || "",
          type: node.type || "",
          subType: node.subType || "",
          _src: node._src || node.icon || "",
        }));
    } catch {
      return [];
    }
  }, [isOpen, canvasRef]);

  const filteredCanvasNodes = useMemo(() => {
    if (!isNavigationMode) return [];
    const query = searchText.startsWith(">")
      ? searchText.slice(1).trim().toLowerCase()
      : searchText.trim().toLowerCase();
    if (!query) return canvasNodes;
    return canvasNodes.filter((node) => {
      const name = (node.name || "").toLowerCase();
      const type = (node.type || "").toLowerCase();
      const key = String(node.key || "");
      return name.includes(query) || type.includes(query) || key.includes(query);
    });
  }, [isNavigationMode, searchText, canvasNodes]);
  const searchInputRef = useRef(null);
  const listRef = useRef(null);
  const containerRef = useRef(null);
  const tabsContainerRef = useRef(null);
  const previewPanelRef = useRef(null);
  const hoverTimeoutRef = useRef(null);
  const previouslyFocusedRef = useRef(null);

  const disabledNodesList = useMemo(() => {
    if (!isOpen || !getDisabledNodes) return [];
    return getDisabledNodes() ?? [];
  }, [isOpen, getDisabledNodes]);

  const getNodeDisabledReasons = useCallback(
    (node) => {
      if (!node || !disabledNodesList?.length) return [];
      return disabledNodesList
        .filter((d) => d.type === node.type || d.type === node.subType)
        .map((d) => d.reason);
    },
    [disabledNodesList]
  );

  useEffect(() => {
    if (!isOpen) return;

    const checkPreviewPosition = () => {
      if (!tabsContainerRef.current) return;

      const containerRect = tabsContainerRef.current.getBoundingClientRect();
      const viewportWidth = window.innerWidth;

      const previewWidth = previewPanelRef.current?.offsetWidth || 256;
      const gap = 16;

      const rightSpace = viewportWidth - containerRect.right;
      const leftSpace = containerRect.left;

      const needsRightSpace = previewWidth + gap;
      const needsLeftSpace = previewWidth + gap;

      if (rightSpace < needsRightSpace && leftSpace >= needsLeftSpace) {
        setPreviewPositionLeft(true);
      } else {
        setPreviewPositionLeft(false);
      }
    };

    const timeoutId = setTimeout(checkPreviewPosition, 50);
    window.addEventListener("resize", checkPreviewPosition);

    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener("resize", checkPreviewPosition);
    };
  }, [isOpen, focusedIndex]);

  const isMac = useMemo(() => {
    return (
      typeof navigator !== "undefined" &&
      (navigator.platform?.includes("Mac") ||
        navigator.userAgent.includes("Mac"))
    );
  }, []);

  useScrollLock(isOpen);

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

  const restoreFocus = useCallback(() => {
    if (
      previouslyFocusedRef.current &&
      typeof previouslyFocusedRef.current.focus === "function"
    ) {
      try {
        previouslyFocusedRef.current.focus();
      } catch {}
    }
    previouslyFocusedRef.current = null;
  }, []);

  const handleClose = useCallback(() => {
    onClose();
  }, [onClose]);

  useEffect(() => {
    if (isOpen) {
      previouslyFocusedRef.current = document.activeElement;
      setFavorites(getFavoriteNodes());
      setUsageStats(getUsageStats());
      setTriggerConfirmation(null);
      setChildActionsView(null);
    } else {
      restoreFocus();
    }
  }, [isOpen, restoreFocus]);

  const { preferences } = useWorkflowPreferences();

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchText(searchText);
    }, 150);
    return () => clearTimeout(handler);
  }, [searchText]);

  const recentNodes = useMemo(() => {
    if (!preferences.showRecentNodes) {
      return [];
    }
    const recent = getRecentNodes();
    return recent.slice(0, 5);
  }, [isOpen, preferences.showRecentNodes]);

  const candidatePool = useMemo(() => {
    return buildCandidatePool(tabData);
  }, [tabData]);

  const { allNodes, allNodesWithChildren } = candidatePool;


  const groupedData = useMemo(() => {
    const groupedNodes = groupNodesByCategory(candidatePool.allNodes);
    const flatGridNodes = flattenForGrid(groupedNodes);
    return { groupedNodes, flatGridNodes };
  }, [candidatePool]);

  const { groupedNodes, flatGridNodes } = groupedData;

  const searchResults = useMemo(() => {
    // Always compute for search - returns usage-sorted full list when no search
    return applyStaticSignals(
      candidatePool.allNodesWithChildren,
      debouncedSearchText,
      { usageStats }
    );
  }, [candidatePool.allNodesWithChildren, debouncedSearchText, usageStats]);

  const filteredNodes = searchResults;

  const searchSuggestions = useMemo(() => {
    if (filteredNodes.length === 0 && debouncedSearchText?.trim()) {
      return getSuggestionsForSearch(debouncedSearchText);
    }
    return [];
  }, [filteredNodes.length, debouncedSearchText]);

  const currentItems = useMemo(() => {
    if (childActionsView) {
      if (debouncedSearchText?.trim()) {
        const lowerSearch = debouncedSearchText.toLowerCase();
        return childActionsView.children.filter((child) => {
          const name = typeof child.name === "string" ? child.name : "";
          const desc =
            typeof child.description === "string" ? child.description : "";
          return (
            name.toLowerCase().includes(lowerSearch) ||
            desc.toLowerCase().includes(lowerSearch)
          );
        });
      }
      return childActionsView.children;
    }
    if (debouncedSearchText?.trim()) {
      return filteredNodes;
    }
    return formatForDisplay(filteredNodes, activeSection, {
      flatGridNodes,
      recentNodes,
      recipes: [],
    });
  }, [
    childActionsView,
    debouncedSearchText,
    filteredNodes,
    activeSection,
    flatGridNodes,
    recentNodes,
  ]);

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

  const availableCategories = useMemo(() => {
    const categories = new Set();
    groupedNodes.forEach(([category]) => {
      if (category) categories.add(category);
    });
    const categoryOrder = [
      "AI",
      "Question",
      "Logic",
      "Data",
      "Trigger",
      "Agents",
      "Enrichment",
      "Flow Control",
      "IO",
      "Loops",
      "Text Parser",
      "Tiny Tables",
      "Utils",
    ];
    const lastCategories = ["Integrations", "Integration", "Other"];

    return Array.from(categories).sort((a, b) => {
      const aIdx = categoryOrder.indexOf(a);
      const bIdx = categoryOrder.indexOf(b);
      const aLastIdx = lastCategories.indexOf(a);
      const bLastIdx = lastCategories.indexOf(b);

      const aIsLast = aLastIdx !== -1;
      const bIsLast = bLastIdx !== -1;

      if (aIsLast && bIsLast) return aLastIdx - bLastIdx;
      if (aIsLast) return 1;
      if (bIsLast) return -1;
      if (aIdx !== -1 && bIdx !== -1) return aIdx - bIdx;
      if (aIdx === -1 && bIdx === -1) return a.localeCompare(b);
      if (aIdx === -1) return 1;
      return -1;
    });
  }, [groupedNodes]);

  const { visualItems, groupedNodesWithIndices } = useMemo(() => {
    if (childActionsView) {
      return { visualItems: currentItems, groupedNodesWithIndices: [] };
    }
    if (searchText.trim()) {
      return { visualItems: currentItems, groupedNodesWithIndices: [] };
    }
    if (activeSection === "nodes") {
      const recentSlice = recentNodes.slice(0, 4);
      const favSlice = favoriteNodes.slice(0, 4);
      const baseOffset = recentSlice.length + favSlice.length;

      let runningIndex = baseOffset;
      const groupedWithIndices = groupedNodes.map(([category, nodes]) => ({
        category,
        nodesWithIndices: nodes.map((node) => ({
          node,
          visualIndex: runningIndex++,
        })),
      }));

      return {
        visualItems: [...recentSlice, ...favSlice, ...flatGridNodes],
        groupedNodesWithIndices: groupedWithIndices,
      };
    }
    if (activeSection === "recent") {
      return { visualItems: recentNodes, groupedNodesWithIndices: [] };
    }
    // Handle category-specific tabs (AI, Logic, Data, etc.)
    if (availableCategories.includes(activeSection)) {
      const categoryGroup = groupedNodes.find(([cat]) => cat === activeSection);
      if (categoryGroup) {
        return { visualItems: categoryGroup[1], groupedNodesWithIndices: [] };
      }
    }
    return { visualItems: [], groupedNodesWithIndices: [] };
  }, [
    childActionsView,
    currentItems,
    searchText,
    activeSection,
    recentNodes,
    favoriteNodes,
    flatGridNodes,
    groupedNodes,
    availableCategories,
  ]);

  const focusedNode = useMemo(() => {
    if (focusedIndex >= 0 && visualItems[focusedIndex]) {
      return visualItems[focusedIndex];
    }
    return null;
  }, [focusedIndex, visualItems]);

  const focusedNodePreview = useMemo(() => {
    return getPreviewForNode(focusedNode);
  }, [focusedNode]);

  const isPreviewVisible = useMemo(() => {
    return focusedNode && visualItems.length > 0 && activeSection !== "help" && !isNavigationMode;
  }, [focusedNode, visualItems.length, activeSection, isNavigationMode]);

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

  const handleNavigateClick = useCallback(
    (canvasNode) => {
      if (onNavigateToNode && canvasNode?.key != null) {
        onNavigateToNode(canvasNode.key);
        handleClose();
      }
    },
    [onNavigateToNode, handleClose]
  );

  const handleNodeClick = useCallback(
    (node) => {
      if (isNavigationMode) {
        handleNavigateClick(node);
        return;
      }
      const disabledReasons = getNodeDisabledReasons(node);
      if (disabledReasons?.length > 0) {
        toast.info(disabledReasons[0]);
        return;
      }
      if (hasChildActions(node) && !node.isChildAction) {
        const children = getChildActions(node);
        setChildActionsView({ parentNode: node, children: children });
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
      addRecentNode(node);
      incrementUsage(node);
      onNodeSelect(node);
      handleClose();
    },
    [isNavigationMode, handleNavigateClick, getNodeDisabledReasons, onNodeSelect, handleClose, getExistingTrigger]
  );

  const handleTriggerReplaceClick = useCallback(() => {
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
    handleClose();
  }, [triggerConfirmation, onTriggerReplace, onNodeSelect, handleClose]);

  const handleTriggerCancel = useCallback(() => {
    setTriggerConfirmation(null);
  }, []);

  const handleKeyDown = useCallback(
    (e) => {
      if (triggerConfirmation) return;

      const activeItems = isNavigationMode ? filteredCanvasNodes : visualItems;

      if (e.key === "ArrowDown") {
        e.preventDefault();
        setFocusedIndex((prev) => Math.min(prev + 1, activeItems.length - 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setFocusedIndex((prev) => Math.max(prev - 1, 0));
      } else if (e.key === "Enter") {
        e.preventDefault();
        if (isNavigationMode && focusedIndex >= 0 && filteredCanvasNodes[focusedIndex]) {
          handleNavigateClick(filteredCanvasNodes[focusedIndex]);
        } else if (focusedIndex >= 0 && visualItems[focusedIndex]) {
          handleNodeClick(visualItems[focusedIndex]);
        }
      } else if (e.key === "Escape") {
        e.preventDefault();
        if (childActionsView) {
          handleBackFromChildren();
        } else {
          handleClose();
        }
      } else if (e.key === "Backspace" && !searchText && childActionsView) {
        e.preventDefault();
        handleBackFromChildren();
      }
    },
    [
      visualItems,
      filteredCanvasNodes,
      isNavigationMode,
      focusedIndex,
      handleNodeClick,
      handleNavigateClick,
      handleClose,
      childActionsView,
      searchText,
      handleBackFromChildren,
      triggerConfirmation,
    ]
  );

  // Close on Escape even when focus has left the palette (e.g. user clicked outside)
  useEffect(() => {
    if (!isOpen) return;
    const onGlobalEscape = (e) => {
      if (e.key !== "Escape") return;
      if (triggerConfirmation) return;
      e.preventDefault();
      if (childActionsView) {
        handleBackFromChildren();
      } else {
        handleClose();
      }
    };
    document.addEventListener("keydown", onGlobalEscape, true);
    return () => document.removeEventListener("keydown", onGlobalEscape, true);
  }, [
    isOpen,
    triggerConfirmation,
    childActionsView,
    handleClose,
    handleBackFromChildren,
  ]);

  const isModalHidden = !!triggerConfirmation;

  const getStableNodeId = useCallback((node, prefix = "node") => {
    return `${prefix}-${getNodeKey(node).replace(/[^a-zA-Z0-9]/g, "-")}`;
  }, []);

  const getFocusedNodeId = useMemo(() => {
    if (!focusedNode || focusedIndex < 0) return undefined;

    if (childActionsView) {
      return getStableNodeId(focusedNode, "child");
    }

    if (searchText.trim()) {
      return getStableNodeId(focusedNode, "search");
    }

    if (activeSection === "nodes") {
      const recentCount = Math.min(recentNodes.length, 4);
      const favCount = Math.min(favoriteNodes.length, 4);

      if (focusedIndex < recentCount) {
        return getStableNodeId(focusedNode, "recent");
      } else if (focusedIndex < recentCount + favCount) {
        return getStableNodeId(focusedNode, "fav");
      } else {
        return getStableNodeId(focusedNode, "node");
      }
    }

    if (activeSection === "recent") {
      return getStableNodeId(focusedNode, "recent-tab");
    }

    return getStableNodeId(focusedNode);
  }, [
    focusedNode,
    focusedIndex,
    childActionsView,
    searchText,
    activeSection,
    recentNodes,
    favoriteNodes,
    getStableNodeId,
  ]);

  const handleBackdropClick = useCallback(
    (e) => {
      if (e.target === e.currentTarget && !triggerConfirmation) {
        handleClose();
      }
    },
    [handleClose, triggerConfirmation]
  );

  if (!isOpen) return null;

  const paletteContent = (
    <div
      className="fixed inset-0 flex items-start justify-center py-[8vh] px-[5vw] z-[9999] transition-opacity duration-150"
      style={{ backgroundColor: "rgba(0, 0, 0, 0.25)" }}
      onClick={handleBackdropClick}
      role="presentation"
    >
      <div
        ref={containerRef}
        className="flex flex-col items-center gap-[1rem] outline-none transition-all duration-200 w-full max-w-[60rem] lg:max-w-[calc(100vw-20rem)] xl:max-w-[50rem]"
        role="dialog"
        aria-modal={!isModalHidden}
        aria-hidden={isModalHidden}
        inert={isModalHidden ? "" : undefined}
        aria-label="Command palette"
        aria-describedby="command-palette-description"
      >
        <span id="command-palette-description" className="sr-only">
          Search and select nodes to add to your workflow. Use arrow keys to
          navigate, Enter to select, Escape to close.
        </span>

        <div
          className="w-full m-0 box-border bg-white border border-[#e2e8f0] rounded-[1rem] px-[1rem] py-[0.75rem] flex items-center gap-[0.625rem] shadow-[0_0.25rem_0.75rem_0_rgba(15,23,42,0.08)] cursor-text"
          onClick={() => searchInputRef.current?.focus()}
        >
          <div className="w-8 h-8 flex items-center justify-center flex-shrink-0 text-[#64748b]">
            <Search size={20} color="#64748b" />
          </div>
          <input
            ref={searchInputRef}
            type="text"
            className="flex-1 w-full border-none bg-transparent font-['Inter',sans-serif] text-base font-normal text-[#1e293b] outline-none leading-[1.1] tracking-[0.015625rem] placeholder:text-[#94a3b8]"
            placeholder={PLACEHOLDER_EXAMPLES[placeholderIndex]}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            onKeyDown={handleKeyDown}
            autoComplete="off"
            role="combobox"
            aria-label="Search nodes"
            aria-autocomplete="list"
            aria-expanded={visualItems.length > 0}
            aria-haspopup="listbox"
            aria-controls="command-palette-results"
            aria-activedescendant={getFocusedNodeId}
          />
          {searchText ? (
            <button
              className="w-8 h-8 flex items-center justify-center bg-[#f4f5f6] border-none rounded-lg cursor-pointer transition-all duration-150 flex-shrink-0 hover:bg-[#e5e7eb]"
              onClick={() => setSearchText("")}
              type="button"
              aria-label="Clear search"
            >
              <X size={16} color="#64748b" />
            </button>
          ) : (
            <div className="flex items-center gap-2.5 p-1.5 bg-white border-[0.75px] border-black/20 rounded-xl flex-shrink-0">
              {isMac ? (
                <>
                  <div className="w-6 h-6 flex items-center justify-center">
                    <Command className="w-full h-full text-[#64748b]" />
                  </div>
                  <span className="font-['Inter',sans-serif] text-sm font-normal text-black tracking-[0.015625rem] leading-5">
                    K
                  </span>
                </>
              ) : (
                <span className="font-['Inter',sans-serif] text-sm font-normal text-black tracking-[0.015625rem] leading-5">
                  Ctrl + K
                </span>
              )}
            </div>
          )}
        </div>

        <div ref={tabsContainerRef} className="relative w-full m-0 box-border">
          <Tabs
            value={activeSection}
            onValueChange={setActiveSection}
            className="relative w-full flex-shrink-0 box-border bg-white border border-[#e2e8f0] rounded-[1rem] overflow-hidden shadow-[0_0.25rem_0.75rem_0_rgba(15,23,42,0.08)] flex flex-col max-h-[70vh]"
          >
            {!searchText.trim() && !childActionsView && (
              <TabsList className="flex items-center gap-[0.5rem] px-[1.25rem] py-[0.75rem] bg-white border-b border-[#e5e7eb] rounded-t-[1rem] rounded-b-none h-[3.5rem] min-h-[3.5rem] w-full justify-start overflow-x-auto scroll-smooth [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                <TabsTrigger
                  value="nodes"
                  className="px-4 py-2 font-['Inter',sans-serif] text-sm font-medium flex-shrink-0"
                >
                  All nodes
                </TabsTrigger>
                {availableCategories.map((category) => (
                  <TabsTrigger
                    key={category}
                    value={category}
                    className="px-4 py-2 font-['Inter',sans-serif] text-sm font-medium flex-shrink-0"
                  >
                    {category}
                  </TabsTrigger>
                ))}
                <TabsTrigger
                  value="recent"
                  className="px-4 py-2 font-['Inter',sans-serif] text-sm font-medium flex-shrink-0"
                >
                  Recent
                </TabsTrigger>
                {onNavigateToNode && canvasNodes.length > 0 && (
                  <TabsTrigger
                    value="navigate"
                    className="px-4 py-2 font-['Inter',sans-serif] text-sm font-medium flex-shrink-0"
                  >
                    Jump to
                  </TabsTrigger>
                )}
                <TabsTrigger
                  value="help"
                  className="px-4 py-2 font-['Inter',sans-serif] text-sm font-medium flex-shrink-0"
                >
                  Help
                </TabsTrigger>
              </TabsList>
            )}

            {childActionsView && (
              <div className="flex items-center px-5 py-3 bg-white border-b border-[#e5e7eb]">
                <button
                  className="flex items-center gap-2 px-3 py-1.5 bg-[#f1f5f9] border-none rounded-lg font-['Inter',sans-serif] text-sm font-medium text-[#475569] cursor-pointer transition-all duration-200 hover:bg-[#e2e8f0] hover:text-[#1e293b]"
                  onClick={handleBackFromChildren}
                >
                  <ArrowLeft size={16} />
                  <span>Back</span>
                </button>
              </div>
            )}

            <div
              className="flex flex-1 min-h-0 overflow-hidden"
              id="command-palette-results"
              role="listbox"
              aria-label="Search results"
            >
              {childActionsView && (
                <div
                  className="p-5 overflow-y-auto flex-1 min-h-0"
                  ref={listRef}
                >
                  <h4 className="font-['Inter',sans-serif] text-sm font-medium text-[#475569] tracking-wide leading-6 m-0 mb-3">
                    {childActionsView.parentNode.name} Integrations
                  </h4>
                  <div className="grid grid-cols-2 gap-3">
                    {currentItems.map((item, index) => (
                      <NodeCard
                        key={`child-${item.id || item.type || "item"}-${index}`}
                        node={item}
                        nodeId={getStableNodeId(item, "child")}
                        isSelected={focusedIndex === index}
                        onClick={() => handleNodeClick(item)}
                        onMouseEnter={() => handleCardMouseEnter(index)}
                        onMouseLeave={handleCardMouseLeave}
                        index={index}
                        disabledReasons={[]}
                      />
                    ))}
                  </div>
                </div>
              )}

              {!childActionsView && isNavigationMode && (
                <ScrollArea className="flex-1 min-h-[18.75rem]">
                  <div className="px-5 py-4" ref={listRef}>
                    {searchText.startsWith(">") && (
                      <div className="flex items-center gap-2 mb-3 px-1">
                        <Navigation size={14} className="text-[#1c3693]" />
                        <span className="font-['Inter',sans-serif] text-xs font-medium text-[#1c3693] uppercase tracking-wider">
                          Jump to node
                        </span>
                      </div>
                    )}
                    {filteredCanvasNodes.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-10 px-8 text-center">
                        <div className="w-14 h-14 flex items-center justify-center bg-[#f1f5f9] rounded-2xl mb-4 text-[#64748b]">
                          <Navigation size={28} color="#64748b" />
                        </div>
                        <p className="font-['Inter',sans-serif] text-base font-semibold text-[#334155] m-0 mb-1">
                          No nodes found
                        </p>
                        <p className="font-['Inter',sans-serif] text-sm font-normal text-[#64748b] m-0">
                          {canvasNodes.length === 0
                            ? "Add some nodes to your canvas first"
                            : "No nodes match your search"}
                        </p>
                      </div>
                    ) : (
                      <div className="flex flex-col gap-2">
                        {filteredCanvasNodes.map((item, index) => (
                          <CanvasNodeCard
                            key={`nav-${item.key}`}
                            node={item}
                            nodeId={`nav-node-${item.key}`}
                            isSelected={focusedIndex === index}
                            onClick={() => handleNavigateClick(item)}
                            onMouseEnter={() => handleCardMouseEnter(index)}
                            onMouseLeave={handleCardMouseLeave}
                            index={index}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                </ScrollArea>
              )}

              {!childActionsView && !isNavigationMode && (
                <ScrollArea className="flex-1 min-h-[18.75rem]">
                  <div className="px-5 py-4" ref={listRef}>
                    <TabsContent value="help" className="py-2 mt-0">
                      <div
                        role="tabpanel"
                        id="panel-help"
                        aria-labelledby="tab-help"
                      >
                        <div className="mb-6">
                          <h3 className="font-['Inter',sans-serif] text-sm font-medium text-[#475569] tracking-wide leading-6 m-0 mb-3">
                            Keyboard shortcuts
                          </h3>
                          <div className="flex flex-col gap-2">
                            {getHelpContent(isMac).shortcuts.map(
                              (shortcut, idx) => (
                                <div
                                  key={idx}
                                  className="flex items-center gap-3 px-3 py-2 bg-[#fafbfc] rounded-lg"
                                >
                                  <Kbd className="min-w-[6.25rem] text-center px-2.5 py-1">
                                    {shortcut.key}
                                  </Kbd>
                                  <span className="font-['Inter',sans-serif] text-sm font-normal text-[#64748b] tracking-[0.015625rem] leading-5">
                                    {shortcut.description}
                                  </span>
                                </div>
                              )
                            )}
                          </div>
                        </div>
                        <div className="mb-6">
                          <h3 className="font-['Inter',sans-serif] text-sm font-medium text-[#475569] tracking-wide leading-6 m-0 mb-3">
                            Pro tips
                          </h3>
                          <ul className="m-0 pl-5">
                            {getHelpContent(isMac).tips.map((tip, idx) => (
                              <li
                                key={idx}
                                className="font-['Inter',sans-serif] text-sm font-normal text-[#64748b] tracking-[0.015625rem] leading-6"
                              >
                                {tip}
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div className="mb-6">
                          <h3 className="font-['Inter',sans-serif] text-sm font-medium text-[#475569] tracking-wide leading-6 m-0 mb-3">
                            Sections
                          </h3>
                          <div className="flex flex-col gap-2">
                            {getHelpContent(isMac).sections.map(
                              (section, idx) => (
                                <div
                                  key={idx}
                                  className="flex items-center gap-3 px-3 py-2 bg-[#fafbfc] rounded-lg"
                                >
                                  <span className="font-['Inter',sans-serif] text-sm font-semibold text-[#263238] min-w-[6.25rem]">
                                    {section.name}
                                  </span>
                                  <span className="font-['Inter',sans-serif] text-sm font-normal text-[#64748b] tracking-[0.015625rem] leading-5">
                                    {section.description}
                                  </span>
                                </div>
                              )
                            )}
                          </div>
                        </div>
                      </div>
                    </TabsContent>
                    {searchText.trim() ? (
                      currentItems.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-10 px-8 text-center">
                          <div className="w-14 h-14 flex items-center justify-center bg-[#f1f5f9] rounded-2xl mb-4 text-[#64748b]">
                            <Search size={28} color="#64748b" />
                          </div>
                          <p className="font-['Inter',sans-serif] text-base font-semibold text-[#334155] m-0 mb-1">
                            No matches for "{searchText}"
                          </p>
                          <p className="font-['Inter',sans-serif] text-sm font-normal text-[#64748b] m-0 mb-5 max-w-[20rem]">
                            We couldn't find any nodes matching your search. Try
                            one of these popular options:
                          </p>
                          <div className="flex flex-wrap gap-2 justify-center mb-4">
                            {[
                              "HTTP Request",
                              "Send Email",
                              "Google Sheets",
                              "Filter",
                              "AI Agent",
                            ].map((term) => (
                              <button
                                key={term}
                                className="px-3 py-1.5 bg-white border border-[#e2e8f0] rounded-lg font-['Inter',sans-serif] text-sm font-medium text-[#475569] cursor-pointer transition-all duration-200 hover:bg-[#f8fafc] hover:border-[#1c3693] hover:text-[#1c3693]"
                                onClick={() => setSearchText(term)}
                              >
                                {term}
                              </button>
                            ))}
                          </div>
                          {searchSuggestions.length > 0 && (
                            <div className="flex flex-wrap gap-2 justify-center items-center pt-3 border-t border-[#e5e7eb]">
                              <span className="text-xs text-[#94a3b8] font-medium">
                                Related:
                              </span>
                              {searchSuggestions.map((suggestion, idx) => (
                                <Badge
                                  key={idx}
                                  variant="secondary"
                                  className="cursor-pointer transition-all duration-200 hover:bg-[#e2e8f0]"
                                  onClick={() => setSearchText(suggestion)}
                                >
                                  {suggestion}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="mb-8">
                          <h4 className="font-['Inter',sans-serif] text-sm font-medium text-[#475569] tracking-wide leading-6 m-0 mb-3">
                            Search results
                          </h4>
                          <div className="flex flex-col gap-2">
                            {currentItems.map((item, index) => (
                              <NodeCard
                                key={`search-${
                                  item.id || item.type || "item"
                                }-${index}`}
                                node={item}
                                nodeId={getStableNodeId(item, "search")}
                                isSelected={focusedIndex === index}
                                onClick={() => handleNodeClick(item)}
                                onMouseEnter={() => handleCardMouseEnter(index)}
                                onMouseLeave={handleCardMouseLeave}
                                index={index}
                                disabledReasons={getNodeDisabledReasons(item)}
                              />
                            ))}
                          </div>
                        </div>
                      )
                    ) : (
                      <>
                        <TabsContent value="nodes" className="mt-0">
                          <div
                            role="tabpanel"
                            id="panel-nodes"
                            aria-labelledby="tab-nodes"
                          >
                            {recentNodes.length > 0 && (
                              <div className="mb-6">
                                <h4 className="font-['Inter',sans-serif] text-sm font-medium text-[#475569] tracking-wide leading-6 m-0 mb-3">
                                  Recent
                                </h4>
                                <div className="grid grid-cols-2 gap-3">
                                  {recentNodes
                                    .slice(0, 4)
                                    .map((item, index) => (
                                      <NodeCard
                                        key={`recent-${
                                          item.id || item.type || "item"
                                        }-${index}`}
                                        node={item}
                                        nodeId={getStableNodeId(item, "recent")}
                                        isSelected={focusedIndex === index}
                                        onClick={() => handleNodeClick(item)}
                                        onMouseEnter={() =>
                                          handleCardMouseEnter(index)
                                        }
                                        onMouseLeave={handleCardMouseLeave}
                                        index={index}
                                        disabledReasons={getNodeDisabledReasons(
                                          item
                                        )}
                                      />
                                    ))}
                                </div>
                              </div>
                            )}
                            {favoriteNodes.length > 0 && (
                              <div className="mb-6">
                                <h4 className="font-['Inter',sans-serif] text-sm font-medium text-[#475569] tracking-wide leading-6 m-0 mb-3">
                                  Favorites
                                </h4>
                                <div className="grid grid-cols-2 gap-3">
                                  {favoriteNodes
                                    .slice(0, 4)
                                    .map((item, index) => {
                                      const adjustedIndex =
                                        Math.min(recentNodes.length, 4) + index;
                                      return (
                                        <NodeCard
                                          key={`fav-${
                                            item.id || item.type || "item"
                                          }-${index}`}
                                          node={item}
                                          nodeId={getStableNodeId(item, "fav")}
                                          isSelected={
                                            focusedIndex === adjustedIndex
                                          }
                                          onClick={() => handleNodeClick(item)}
                                          onMouseEnter={() =>
                                            handleCardMouseEnter(adjustedIndex)
                                          }
                                          onMouseLeave={handleCardMouseLeave}
                                          index={adjustedIndex}
                                          disabledReasons={getNodeDisabledReasons(
                                            item
                                          )}
                                        />
                                      );
                                    })}
                                </div>
                              </div>
                            )}
                            {recentNodes.length === 0 &&
                              favoriteNodes.length === 0 && (
                                <div className="mb-6 p-4 bg-[#fafbfc] rounded-xl border border-[#f4f5f6]">
                                  <p className="font-['Inter',sans-serif] text-sm text-[#64748b] m-0 text-center">
                                    Start using nodes to see your recent and
                                    favorites here
                                  </p>
                                </div>
                              )}
                            {groupedNodesWithIndices.map(
                              ({ category, nodesWithIndices }) => (
                                <div key={category} className="mb-6">
                                  <h4 className="font-['Inter',sans-serif] text-sm font-medium text-[#475569] tracking-wide leading-6 m-0 mb-3">
                                    {category}
                                  </h4>
                                  <div className="grid grid-cols-2 gap-3">
                                    {nodesWithIndices.map(
                                      ({ node, visualIndex }, index) => (
                                        <NodeCard
                                          key={`node-${
                                            node.id || node.type || "item"
                                          }-${index}`}
                                          node={node}
                                          nodeId={getStableNodeId(node)}
                                          isSelected={
                                            focusedIndex === visualIndex
                                          }
                                          onClick={() => handleNodeClick(node)}
                                          onMouseEnter={() =>
                                            handleCardMouseEnter(visualIndex)
                                          }
                                          onMouseLeave={handleCardMouseLeave}
                                          index={visualIndex}
                                          disabledReasons={getNodeDisabledReasons(
                                            node
                                          )}
                                        />
                                      )
                                    )}
                                  </div>
                                </div>
                              )
                            )}
                          </div>
                        </TabsContent>
                        {availableCategories.map((category) => {
                          const categoryNodes = allNodes.filter(
                            (node) => (node.category || "Other") === category
                          );
                          return (
                            <TabsContent
                              key={category}
                              value={category}
                              className="mt-0"
                            >
                              <div
                                role="tabpanel"
                                id={`panel-${category}`}
                                aria-labelledby={`tab-${category}`}
                              >
                                {categoryNodes.length > 0 ? (
                                  <div className="mb-8">
                                    <h4 className="font-['Inter',sans-serif] text-sm font-medium text-[#475569] tracking-wide leading-6 m-0 mb-3">
                                      {category}
                                    </h4>
                                    <div className="grid grid-cols-2 gap-3">
                                      {categoryNodes.map((item, index) => (
                                        <NodeCard
                                          key={`${category}-${
                                            item.id || item.type || "item"
                                          }-${index}`}
                                          node={item}
                                          nodeId={getStableNodeId(
                                            item,
                                            category.toLowerCase()
                                          )}
                                          isSelected={focusedIndex === index}
                                          onClick={() => handleNodeClick(item)}
                                          onMouseEnter={() =>
                                            handleCardMouseEnter(index)
                                          }
                                          onMouseLeave={handleCardMouseLeave}
                                          index={index}
                                          disabledReasons={getNodeDisabledReasons(
                                            item
                                          )}
                                        />
                                      ))}
                                    </div>
                                  </div>
                                ) : (
                                  <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
                                    <div className="w-14 h-14 flex items-center justify-center bg-[#f1f5f9] rounded-2xl mb-4 text-[#64748b]">
                                      <Box size={28} color="#64748b" />
                                    </div>
                                    <p className="font-['Inter',sans-serif] text-base font-semibold text-[#334155] m-0 mb-1">
                                      No {category} nodes available
                                    </p>
                                    <p className="font-['Inter',sans-serif] text-sm font-normal text-[#64748b] m-0">
                                      {category} nodes will appear here when
                                      available
                                    </p>
                                  </div>
                                )}
                              </div>
                            </TabsContent>
                          );
                        })}
                        <TabsContent value="recent" className="mt-0">
                          <div
                            role="tabpanel"
                            id="panel-recent"
                            aria-labelledby="tab-recent"
                          >
                            {recentNodes.length > 0 ? (
                              <div className="mb-8">
                                <h4 className="font-['Inter',sans-serif] text-sm font-medium text-[#475569] tracking-wide leading-6 m-0 mb-3">
                                  Recently used
                                </h4>
                                <div className="flex flex-col gap-2">
                                  {recentNodes.map((item, index) => (
                                    <NodeCard
                                      key={`recent-${
                                        item.id || item.type || "item"
                                      }-${index}`}
                                      node={item}
                                      nodeId={getStableNodeId(
                                        item,
                                        "recent-tab"
                                      )}
                                      isSelected={focusedIndex === index}
                                      onClick={() => handleNodeClick(item)}
                                      onMouseEnter={() =>
                                        handleCardMouseEnter(index)
                                      }
                                      onMouseLeave={handleCardMouseLeave}
                                      index={index}
                                      disabledReasons={getNodeDisabledReasons(
                                        item
                                      )}
                                    />
                                  ))}
                                </div>
                              </div>
                            ) : (
                              <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
                                <div className="w-14 h-14 flex items-center justify-center bg-[#f1f5f9] rounded-2xl mb-4 text-[#64748b]">
                                  <History size={28} color="#64748b" />
                                </div>
                                <p className="font-['Inter',sans-serif] text-base font-semibold text-[#334155] m-0 mb-1">
                                  No recent nodes
                                </p>
                                <p className="font-['Inter',sans-serif] text-sm font-normal text-[#64748b] m-0">
                                  Nodes you use will appear here for quick
                                  access
                                </p>
                              </div>
                            )}
                          </div>
                        </TabsContent>
                      </>
                    )}
                  </div>
                </ScrollArea>
              )}
            </div>

            <div className="flex items-center gap-2.5 px-5 py-4 bg-[#f8fafc] border-t border-[#e5e7eb] rounded-b-[1.25rem]">
              <div className="flex items-center gap-2.5 flex-1">
                <div className="flex items-center gap-2">
                  <Kbd className="w-9 h-9 flex items-center justify-center">
                    <ArrowUp className="w-4 h-4" />
                  </Kbd>
                  <Kbd className="w-9 h-9 flex items-center justify-center">
                    <ArrowDown className="w-4 h-4" />
                  </Kbd>
                  <span className="font-['Inter',sans-serif] text-sm font-normal text-[#64748b] tracking-[0.015625rem] leading-5">
                    Navigate
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Kbd className="w-9 h-9 flex items-center justify-center">
                    <CornerDownLeft className="w-4 h-4" />
                  </Kbd>
                  <span className="font-['Inter',sans-serif] text-sm font-normal text-[#64748b] tracking-[0.015625rem] leading-5">
                    Select
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Kbd className="px-2">Esc</Kbd>
                <span className="font-['Inter',sans-serif] text-sm font-normal text-[#64748b] tracking-[0.015625rem] leading-5">
                  Close
                </span>
              </div>
            </div>
          </Tabs>

          {isPreviewVisible && (
            <PreviewPanel
              ref={previewPanelRef}
              node={focusedNode}
              nodePreview={focusedNodePreview}
              onAddClick={() => handleNodeClick(focusedNode)}
              isVisible={isPreviewVisible}
              onMouseEnter={handlePreviewMouseEnter}
              onMouseLeave={handleCardMouseLeave}
              positionLeft={previewPositionLeft}
            />
          )}
        </div>
      </div>
    </div>
  );

  return (
    <>
      {createPortal(paletteContent, document.body)}

      <Dialog
        open={!!triggerConfirmation}
        onOpenChange={(open) => !open && setTriggerConfirmation(null)}
      >
        <DialogContent className="sm:max-w-[26.25rem]" hideCloseButton>
          <VisuallyHidden.Root>
            <DialogTitle>Replace Existing Trigger</DialogTitle>
            <DialogDescription>Confirm trigger replacement</DialogDescription>
          </VisuallyHidden.Root>
          {triggerConfirmation && (
            <>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-11 h-11 flex items-center justify-center bg-[#fff8e6] rounded-full">
                  <AlertTriangle size={28} color="#f59e0b" />
                </div>
                <h3 className="font-['Inter',sans-serif] text-lg font-semibold text-[#263238] m-0">
                  Replace Existing Trigger?
                </h3>
              </div>
              <p className="font-['Inter',sans-serif] text-sm font-normal text-[#64748b] leading-6 m-0 mb-3">
                You already have a{" "}
                <strong>
                  {getTriggerDisplayName(
                    triggerConfirmation.existingTriggerData
                  )}
                </strong>{" "}
                configured on this canvas.
              </p>
              <p className="font-['Inter',sans-serif] text-sm font-medium text-[#263238] m-0 mb-2">
                Replacing it with{" "}
                <strong>
                  {getTriggerDisplayName(triggerConfirmation.newTrigger)}
                </strong>{" "}
                will:
              </p>
              <ul className="font-['Inter',sans-serif] text-[0.8125rem] text-[#64748b] m-0 mb-5 pl-5 leading-[1.6]">
                <li>Remove the current trigger and its settings</li>
                <li>Disconnect any nodes linked from the trigger</li>
                <li>Require you to reconfigure the new trigger</li>
              </ul>
              <div className="flex items-center justify-end gap-3">
                <button
                  className="px-5 py-2 bg-transparent border border-[#e2e8f0] rounded-lg font-['Inter',sans-serif] text-sm font-medium text-[#64748b] cursor-pointer transition-all duration-200 hover:bg-[#f1f5f9] hover:text-[#334155]"
                  onClick={handleTriggerCancel}
                >
                  Cancel
                </button>
                <button
                  className="px-5 py-2 bg-[#f59e0b] border-none rounded-lg font-['Inter',sans-serif] text-sm font-semibold text-white cursor-pointer transition-all duration-150 hover:bg-[#d97706]"
                  onClick={handleTriggerReplaceClick}
                >
                  Replace Trigger
                </button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default CommandPalette;
