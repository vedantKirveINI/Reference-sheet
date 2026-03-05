import React, { useMemo, useState, useCallback } from "react";
import {
  Search,
  Building2,
  Target,
  Users,
  TrendingUp,
  MessageSquare,
  CheckCircle2,
  XCircle,
  Clock,
  Copy,
  Check,
  Download,
  RotateCcw,
  AlertCircle,
  Inbox,
  Globe,
  DollarSign,
  Briefcase,
  Zap,
  FileText,
  Star,
  Link2,
  Code,
  Eye,
  ChevronUp,
  ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import ResultSection from "./ResultSection";
import FieldValueRow from "./FieldValueRow";

const formatTimestamp = (timestamp) => {
  try {
    const date = new Date(timestamp);
    return date.toLocaleString(undefined, {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  } catch {
    return timestamp;
  }
};

const OUTPUT_TITLE_CONFIG = {
  hero_marketing_campaign: {
    label: "Marketing Campaign",
    icon: Zap,
    color: "#f59e0b",
    bgColor: "bg-amber-50",
    borderColor: "border-amber-100",
  },
  key_people: {
    label: "Key People",
    icon: Users,
    color: "#8b5cf6",
    bgColor: "bg-violet-50",
    borderColor: "border-violet-100",
  },
  company_overview: {
    label: "Company Overview",
    icon: Building2,
    color: "#3b82f6",
    bgColor: "bg-blue-50",
    borderColor: "border-blue-100",
  },
  value_proposition: {
    label: "Value Proposition",
    icon: Star,
    color: "#10b981",
    bgColor: "bg-emerald-50",
    borderColor: "border-emerald-100",
  },
  conversation_levers: {
    label: "Conversation Starters",
    icon: MessageSquare,
    color: "#ec4899",
    bgColor: "bg-pink-50",
    borderColor: "border-pink-100",
  },
  full_research_report: {
    label: "Full Research Report",
    icon: FileText,
    color: "#6366f1",
    bgColor: "bg-indigo-50",
    borderColor: "border-indigo-100",
  },
  growth_indicators: {
    label: "Growth Indicators",
    icon: TrendingUp,
    color: "#14b8a6",
    bgColor: "bg-teal-50",
    borderColor: "border-teal-100",
  },
  qualification_score: {
    label: "Qualification Score",
    icon: Target,
    color: "#f97316",
    bgColor: "bg-orange-50",
    borderColor: "border-orange-100",
  },
  references: {
    label: "References & Sources",
    icon: Link2,
    color: "#64748b",
    bgColor: "bg-slate-50",
    borderColor: "border-slate-100",
  },
};

const RESEARCH_POINT_LABELS = {
  search_website: "Company Website",
  search_pricing: "Pricing Info",
  search_revenue: "Revenue Data",
  search_key_people: "Key People",
  search_linkedin: "LinkedIn Profiles",
  search_funding: "Funding History",
  search_news: "Recent News",
  search_pain_points: "Pain Points",
  search_user_growth: "User Growth",
  search_customer_reviews: "Customer Reviews",
  search_conversation_levers: "Conversation Topics",
  search_fit_score: "Fit Score",
  search_marketing_campaigns: "Marketing Campaigns",
};

const extractFxValue = (fxObj) => {
  if (!fxObj) return null;
  if (typeof fxObj === "string") return fxObj;
  if (fxObj?.blocks?.[0]?.value) return fxObj.blocks[0].value;
  if (fxObj?.blockStr) return fxObj.blockStr;
  return null;
};

const ResearchOutputCard = ({ title, data, config, defaultExpanded = true }) => {
  const [copied, setCopied] = useState(false);
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const Icon = config?.icon || FileText;
  
  const handleCopy = async (e) => {
    e.stopPropagation();
    try {
      const text = typeof data === "object" ? JSON.stringify(data, null, 2) : String(data);
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      console.error("Failed to copy:", e);
    }
  };

  const handleToggle = () => {
    setIsExpanded(!isExpanded);
  };

  const renderContent = () => {
    if (data === null || data === undefined || data === "N/A") {
      return (
        <p className="text-sm text-muted-foreground italic">No data available</p>
      );
    }

    if (Array.isArray(data)) {
      if (data.length === 0) {
        return <p className="text-sm text-muted-foreground italic">No items found</p>;
      }
      return (
        <ul className="space-y-2">
          {data.map((item, index) => (
            <li key={index} className="flex items-start gap-2">
              <span className="w-5 h-5 rounded-full bg-muted flex items-center justify-center flex-shrink-0 mt-0.5 text-xs font-medium text-muted-foreground">
                {index + 1}
              </span>
              <span className="text-sm text-foreground">
                {typeof item === "object" ? JSON.stringify(item) : String(item)}
              </span>
            </li>
          ))}
        </ul>
      );
    }

    if (typeof data === "object") {
      const entries = Object.entries(data);
      if (entries.length === 0) {
        return <p className="text-sm text-muted-foreground italic">No data available</p>;
      }
      return (
        <div className="space-y-2">
          {entries.map(([key, value]) => (
            <div key={key} className="p-2 bg-muted/30 rounded-lg">
              <p className="text-xs text-muted-foreground mb-1">{key}</p>
              <p className="text-sm text-foreground">
                {typeof value === "object" ? JSON.stringify(value) : String(value)}
              </p>
            </div>
          ))}
        </div>
      );
    }

    return (
      <p className="text-sm text-foreground whitespace-pre-wrap leading-relaxed">
        {String(data)}
      </p>
    );
  };

  return (
    <div className={cn(
      "rounded-xl border overflow-hidden",
      config?.bgColor || "bg-muted/30",
      config?.borderColor || "border-border/50"
    )}>
      <div 
        className="flex items-center justify-between p-4 cursor-pointer select-none hover:bg-muted/20 transition-colors"
        onClick={handleToggle}
      >
        <div className="flex items-center gap-2">
          <div 
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ backgroundColor: `${config?.color || "#6366f1"}15` }}
          >
            <Icon 
              className="w-4 h-4" 
              style={{ color: config?.color || "#6366f1" }}
            />
          </div>
          <span className="text-sm font-medium text-foreground">
            {config?.label || title}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={handleCopy}
            className={cn(
              "w-7 h-7 rounded-md flex items-center justify-center",
              "hover:bg-muted/50 text-muted-foreground hover:text-foreground transition-colors"
            )}
            title="Copy to clipboard"
          >
            {copied ? (
              <Check className="w-3.5 h-3.5 text-emerald-500" />
            ) : (
              <Copy className="w-3.5 h-3.5" />
            )}
          </button>
          <div className="w-6 h-6 rounded-md flex items-center justify-center text-muted-foreground">
            {isExpanded ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </div>
        </div>
      </div>
      {isExpanded && (
        <div className="px-4 pb-4">
          {renderContent()}
        </div>
      )}
    </div>
  );
};

const ScoutTestResult = ({
  inputs,
  outputs,
  node,
  theme = {},
  executedAt,
  onRerun = null,
  goData = null,
  resolvedState = {},
}) => {
  const [copiedAll, setCopiedAll] = useState(false);
  const [showJsonView, setShowJsonView] = useState(false);
  
  const accentColor = theme.accentColor || "#8b5cf6";
  const timestamp = executedAt || outputs?.executedAt || outputs?.timestamp || new Date().toISOString();

  const normalizedOutputs = useMemo(() => {
    return outputs?.response || outputs || {};
  }, [outputs]);

  const { hasError, errorMessage } = useMemo(() => {
    if (outputs?.error) {
      return {
        hasError: true,
        errorMessage: outputs.error?.message || (typeof outputs.error === "string" ? outputs.error : JSON.stringify(outputs.error))
      };
    }
    if (outputs?.status === "error" || outputs?.status === "failed" || outputs?.status === "failure") {
      return {
        hasError: true,
        errorMessage: outputs.message || outputs.errorMessage || "Research execution failed"
      };
    }
    return { hasError: false, errorMessage: null };
  }, [outputs]);

  const inputData = useMemo(() => {
    const data = goData || inputs || {};
    
    const resolveValue = (fxObj) => {
      if (!fxObj) return null;
      
      if (fxObj?.type === "fx" && Array.isArray(fxObj.blocks)) {
        const nodeBlock = fxObj.blocks.find(block => block.type === "NODE");
        if (nodeBlock && nodeBlock.variableData?.nodeId) {
          const nodeId = nodeBlock.variableData.nodeId;
          const nodeData = resolvedState?.[nodeId];
          if (nodeData?.response !== undefined && nodeData.response !== "") {
            return nodeData.response;
          }
          return nodeBlock.variableData?.nodeName || nodeBlock.value || null;
        }
      }
      
      return extractFxValue(fxObj);
    };
    
    return {
      yourCompany: {
        name: resolveValue(data.companyName) || resolveValue(data.yourCompany?.name),
        description: resolveValue(data.description) || resolveValue(data.yourCompany?.description),
        industry: resolveValue(data.industry) || resolveValue(data.yourCompany?.industry),
      },
      targetCompany: {
        name: resolveValue(data.researchCompanyName) || resolveValue(data.targetCompany?.name),
        website: resolveValue(data.researchCompanyWebsite) || resolveValue(data.targetCompany?.website),
      },
      researchPoints: data.researchPoints || data.selectedResearchPoints || {},
      outputTitles: data.outputTitle || {},
      templateId: data.templateId,
    };
  }, [goData, inputs, node, resolvedState]);

  const selectedResearchPoints = useMemo(() => {
    const points = inputData.researchPoints || {};
    return Object.entries(points)
      .filter(([_, value]) => value === true)
      .map(([key]) => ({
        key,
        label: RESEARCH_POINT_LABELS[key] || key.replace(/^search_/, "").replace(/_/g, " "),
      }));
  }, [inputData.researchPoints]);

  const researchResults = useMemo(() => {
    if (hasError) return [];
    
    const results = [];
    const output = normalizedOutputs;
    
    Object.keys(OUTPUT_TITLE_CONFIG).forEach((key) => {
      if (output[key] !== undefined) {
        results.push({
          key,
          data: output[key],
          config: OUTPUT_TITLE_CONFIG[key],
        });
      }
    });

    Object.keys(output).forEach((key) => {
      if (!OUTPUT_TITLE_CONFIG[key] && !["error", "status", "message", "timestamp", "executedAt", "metadata", "steps", "tool_calls", "toolCalls"].includes(key)) {
        results.push({
          key,
          data: output[key],
          config: {
            label: key.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase()),
            icon: FileText,
            color: "#6366f1",
            bgColor: "bg-indigo-50/50",
            borderColor: "border-indigo-100/50",
          },
        });
      }
    });

    return results;
  }, [normalizedOutputs, hasError]);

  const handleCopyAll = useCallback(async () => {
    try {
      const data = {
        inputs: inputData,
        outputs: normalizedOutputs,
        executedAt: timestamp,
      };
      await navigator.clipboard.writeText(JSON.stringify(data, null, 2));
      setCopiedAll(true);
      setTimeout(() => setCopiedAll(false), 2000);
    } catch (e) {
      console.error("Failed to copy:", e);
    }
  }, [inputData, normalizedOutputs, timestamp]);

  const handleDownload = useCallback(() => {
    try {
      const data = {
        inputs: inputData,
        outputs: normalizedOutputs,
        executedAt: timestamp,
      };
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `scout-research-${Date.now()}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error("Failed to download:", e);
    }
  }, [inputData, normalizedOutputs, timestamp]);

  return (
    <div className="flex flex-col gap-4 w-full">
      <div
        className={cn(
          "flex items-center justify-between p-4 rounded-xl border",
          "shadow-[0_2px_8px_rgba(0,0,0,0.04)]",
          hasError 
            ? "bg-red-50/50 border-red-200/50" 
            : "bg-violet-50/50 border-violet-200/50"
        )}
      >
        <div className="flex items-center gap-3">
          <div
            className={cn(
              "w-10 h-10 rounded-xl flex items-center justify-center",
              hasError ? "bg-red-100" : "bg-violet-100"
            )}
          >
            {hasError ? (
              <XCircle className="w-5 h-5 text-red-600" />
            ) : (
              <Search className="w-5 h-5 text-violet-600" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className={cn(
                "text-sm font-semibold",
                hasError ? "text-red-700" : "text-violet-700"
              )}>
                {hasError ? "Research Failed" : "Research Complete"}
              </span>
              <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-white/60 text-muted-foreground">
                Tiny Scout
              </span>
            </div>
            <div className="flex items-center gap-3 mt-1">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Clock className="w-3 h-3" />
                <span>{formatTimestamp(timestamp)}</span>
              </div>
              {researchResults.length > 0 && (
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <FileText className="w-3 h-3" />
                  <span>{researchResults.length} sections</span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className={cn(
              "h-8 text-xs gap-1.5",
              showJsonView && "bg-muted"
            )}
            onClick={() => setShowJsonView(!showJsonView)}
          >
            {showJsonView ? (
              <Eye className="w-3.5 h-3.5" />
            ) : (
              <Code className="w-3.5 h-3.5" />
            )}
            {showJsonView ? "Cards" : "JSON"}
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="h-8 text-xs gap-1.5"
            onClick={handleCopyAll}
          >
            {copiedAll ? (
              <Check className="w-3.5 h-3.5" />
            ) : (
              <Copy className="w-3.5 h-3.5" />
            )}
            Copy All
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="h-8 text-xs gap-1.5"
            onClick={handleDownload}
          >
            <Download className="w-3.5 h-3.5" />
            Download
          </Button>
          {onRerun && (
            <Button
              variant="outline"
              size="sm"
              className="h-8 text-xs gap-1.5"
              onClick={onRerun}
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Re-run
            </Button>
          )}
        </div>
      </div>

      <ResultSection
        icon={Building2}
        title="Your Company"
        subtitle={inputData.yourCompany.name || "Company details"}
        accentColor="#3b82f6"
        defaultExpanded={false}
      >
        <div className="space-y-1">
          <FieldValueRow
            icon={Building2}
            label="Company Name"
            value={inputData.yourCompany.name}
          />
          <FieldValueRow
            icon={Briefcase}
            label="Industry"
            value={inputData.yourCompany.industry}
          />
          <FieldValueRow
            icon={FileText}
            label="Description"
            value={inputData.yourCompany.description}
            truncate={false}
          />
        </div>
      </ResultSection>

      <ResultSection
        icon={Target}
        title="Target Company"
        subtitle={inputData.targetCompany.name || "Research target"}
        accentColor="#8b5cf6"
        defaultExpanded={false}
      >
        <div className="space-y-1">
          <FieldValueRow
            icon={Building2}
            label="Company Name"
            value={inputData.targetCompany.name}
          />
          <FieldValueRow
            icon={Globe}
            label="Website"
            value={inputData.targetCompany.website}
          />
        </div>
      </ResultSection>

      {selectedResearchPoints.length > 0 && (
        <ResultSection
          icon={Search}
          title="Research Categories"
          badge={`${selectedResearchPoints.length} selected`}
          accentColor="#10b981"
          defaultExpanded={false}
        >
          <div className="flex flex-wrap gap-2">
            {selectedResearchPoints.map((point) => (
              <span
                key={point.key}
                className="px-3 py-1.5 text-xs font-medium bg-emerald-50 text-emerald-700 rounded-full border border-emerald-100"
              >
                {point.label}
              </span>
            ))}
          </div>
        </ResultSection>
      )}

      {hasError ? (
        <ResultSection
          icon={AlertCircle}
          title="Error"
          subtitle={errorMessage ? errorMessage.substring(0, 50) + (errorMessage.length > 50 ? "..." : "") : "Research failed"}
          accentColor="#ef4444"
          variant="error"
          defaultExpanded={true}
          collapsible={false}
        >
          <div className="flex items-start gap-3 p-4 bg-red-50 rounded-lg border border-red-100">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-red-700 mb-1">
                Research Failed
              </p>
              <p className="text-sm text-red-600 break-words whitespace-pre-wrap">
                {errorMessage || "An unexpected error occurred during research. Please check the configuration and try again."}
              </p>
            </div>
          </div>
        </ResultSection>
      ) : showJsonView ? (
        <ResultSection
          icon={Code}
          title="Raw JSON Output"
          accentColor="#6366f1"
          defaultExpanded={true}
          actions={
            <button
              onClick={(e) => {
                e.stopPropagation();
                navigator.clipboard.writeText(JSON.stringify(normalizedOutputs, null, 2));
              }}
              className={cn(
                "w-7 h-7 rounded-md flex items-center justify-center",
                "hover:bg-muted/50 text-muted-foreground hover:text-foreground transition-colors"
              )}
              title="Copy JSON"
            >
              <Copy className="w-3.5 h-3.5" />
            </button>
          }
        >
          <div className="relative">
            <pre className="p-4 bg-zinc-900 text-zinc-100 rounded-lg text-xs font-mono overflow-x-auto max-h-[500px] overflow-y-auto">
              {JSON.stringify(normalizedOutputs, null, 2)}
            </pre>
          </div>
        </ResultSection>
      ) : researchResults.length > 0 ? (
        <ResultSection
          icon={CheckCircle2}
          title="Research Results"
          subtitle={`${researchResults.length} sections generated`}
          accentColor="#10b981"
          variant="success"
          defaultExpanded={true}
        >
          <div className="space-y-4">
            {researchResults.map((result) => (
              <ResearchOutputCard
                key={result.key}
                title={result.key}
                data={result.data}
                config={result.config}
              />
            ))}
          </div>
        </ResultSection>
      ) : (
        <div className="flex flex-col items-center justify-center gap-3 py-8 px-4 bg-muted/30 rounded-xl border border-dashed border-border">
          <Inbox className="w-10 h-10 text-muted-foreground/50" />
          <div className="text-center">
            <p className="text-sm font-medium text-muted-foreground">
              No Research Results
            </p>
            <p className="text-xs text-muted-foreground/70 mt-1">
              The research completed but returned no data
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ScoutTestResult;
