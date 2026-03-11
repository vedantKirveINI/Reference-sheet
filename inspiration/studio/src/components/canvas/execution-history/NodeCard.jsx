import { useState, useMemo } from "react";
import dayjs from "dayjs";
import BreadcrumbDataViewer from "./BreadcrumbDataViewer";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { icons } from "@/components/icons";
import { cn } from "@/lib/utils";

const ChevronDownIcon = icons.chevronDown;

function formatDuration(ms) {
  if (ms == null) return null;
  if (ms < 1000) return `${ms}ms`;
  if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
  return `${Math.floor(ms / 60000)}m ${Math.floor((ms % 60000) / 1000)}s`;
}

function getErrorMessage(error) {
  if (!error) return "";
  if (typeof error === "string") return error;
  if (error.message) return error.message;
  try {
    return JSON.stringify(error);
  } catch {
    return "Unknown error";
  }
}

function getSubtitle(node) {
  const isFailed = node.status === "error" || node.status === "failed";
  if (isFailed) {
    return getErrorMessage(node.error) || "Error occurred";
  }

  if (node.output && typeof node.output === "object" && !Array.isArray(node.output)) {
    const keys = Object.keys(node.output);
    if (keys.length > 0) {
      return `Returned ${keys.length} ${keys.length === 1 ? "field" : "fields"}`;
    }
  }

  if (node.output && Array.isArray(node.output)) {
    return `Returned ${node.output.length} ${node.output.length === 1 ? "item" : "items"}`;
  }

  const nodeType = (node.nodeType || "").toLowerCase();
  if (nodeType.includes("condition") || nodeType.includes("ifelse") || nodeType.includes("filter")) {
    return "Condition evaluated";
  }
  if (nodeType.includes("trigger")) {
    return "Trigger fired";
  }

  return "Completed";
}

function getIconInfo(node) {
  const isFailed = node.status === "error" || node.status === "failed";
  if (isFailed) {
    return { className: "bg-destructive/10 text-destructive", icon: "error" };
  }

  const nodeType = (node.nodeType || "").toLowerCase();
  if (nodeType.includes("trigger") || nodeType.includes("webhook") || nodeType.includes("schedule") || nodeType.includes("form")) {
    return { className: "bg-primary/10 text-primary", icon: "trigger" };
  }
  if (nodeType.includes("condition") || nodeType.includes("ifelse") || nodeType.includes("if_else") || nodeType.includes("filter")) {
    return { className: "bg-purple-500/10 text-purple-700", icon: "condition" };
  }
  return { className: "bg-emerald-500/10 text-emerald-700", icon: "action" };
}

function NodeIcon({ type }) {
  if (type === "trigger") {
    return (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
      </svg>
    );
  }
  if (type === "condition") {
    return (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="16 3 21 3 21 8" />
        <line x1="4" y1="20" x2="21" y2="3" />
        <polyline points="21 16 21 21 16 21" />
        <line x1="15" y1="15" x2="21" y2="21" />
        <line x1="4" y1="4" x2="9" y2="9" />
      </svg>
    );
  }
  if (type === "error") {
    return (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <line x1="15" y1="9" x2="9" y2="15" />
        <line x1="9" y1="9" x2="15" y2="15" />
      </svg>
    );
  }
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
      <polyline points="9 11 12 14 22 4" />
    </svg>
  );
}

function NodeCard({ node, defaultExpanded }) {
  const isFailed = node.status === "error" || node.status === "failed";
  const initialExpanded = defaultExpanded !== undefined ? defaultExpanded : isFailed;
  const [expanded, setExpanded] = useState(initialExpanded);

  const availableTabs = useMemo(() => {
    const tabs = ["Input", "Output"];
    if (node.logs && node.logs.length > 0) tabs.push("Logs");
    return tabs;
  }, [node.logs]);

  const [activeTab, setActiveTab] = useState("Input");

  const iconInfo = getIconInfo(node);
  const subtitle = getSubtitle(node);
  const duration = formatDuration(node.durationMs);
  const errorMsg = isFailed ? getErrorMessage(node.error) : null;

  const currentTab = availableTabs.includes(activeTab) ? activeTab : availableTabs[0];

  return (
    <Card className={cn("overflow-hidden border border-border transition-shadow hover:shadow-md", isFailed && "border-destructive/50")}>
      <Collapsible open={expanded} onOpenChange={setExpanded}>
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer gap-2.5 rounded-t-xl border-b-0 py-3.5 pr-3.5 pl-3.5 transition-colors hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ">
            <div className="flex items-center gap-2.5">
              <div className={cn("flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-sm", iconInfo.className)}>
                <NodeIcon type={iconInfo.icon} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="truncate text-xs font-semibold text-foreground">{node.nodeName}</div>
                <div className={cn("truncate text-[0.625rem]", isFailed ? "text-destructive" : "text-muted-foreground")}>
                  {subtitle}
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                {duration && (
                  <span className="text-[0.625rem] tabular-nums text-muted-foreground">{duration}</span>
                )}
                <Badge variant={isFailed ? "destructive" : "default"} className="text-[0.625rem] font-semibold">
                  {isFailed ? "FAIL" : "OK"}
                </Badge>
                <ChevronDownIcon className={cn("h-3 w-3 text-muted-foreground transition-transform duration-200 ease-out", expanded && "rotate-180")} />
              </div>
            </div>
          </CardHeader>
        </CollapsibleTrigger>
        <CollapsibleContent
          className="grid transition-[grid-template-rows] duration-200 ease-out data-[state=closed]:grid-rows-[0fr] data-[state=open]:grid-rows-[1fr]"
        >
          <div className="min-h-0 overflow-hidden">
          <CardContent className="border-t-2 border-border bg-background p-3">
            {errorMsg && (
              <div className="mb-2 rounded-md bg-destructive/10 px-3 py-2 text-[0.6875rem] leading-snug text-destructive">
                {errorMsg}
              </div>
            )}

            <Tabs value={currentTab} onValueChange={setActiveTab} className="flex min-h-0 flex-1 flex-col">
              <TabsList className="h-8 w-full justify-start rounded-none border-b-2 border-border bg-muted/30 p-0">
                  {availableTabs.map((tab) => (
                    <TabsTrigger
                      key={tab}
                      value={tab}
                      className="rounded-none border-b-2 border-transparent px-3.5 py-2 text-[0.6875rem] font-medium text-muted-foreground data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:shadow-none"
                    >
                      {tab}
                    </TabsTrigger>
                  ))}
                </TabsList>
                <div className="min-h-0 flex-1 overflow-hidden">
                  <ScrollArea className="h-48 w-full">
                    <div className="p-2.5 pr-3.5">
                      {currentTab === "Input" && (
                        <BreadcrumbDataViewer data={node.input} label="Input Fields" />
                      )}
                      {currentTab === "Output" && (
                        <BreadcrumbDataViewer data={node.output} label="Output Fields" />
                      )}
                      {currentTab === "Logs" && node.logs && node.logs.length > 0 && (
                        <div className="flex flex-col gap-1">
                          {node.logs.map((logEntry, idx) => (
                            <div key={idx} className="flex gap-2 text-[0.6875rem] leading-snug">
                              {logEntry.timestamp && (
                                <span className="shrink-0 tabular-nums text-muted-foreground text-[0.625rem]">
                                  {dayjs(logEntry.timestamp).format("HH:mm:ss")}
                                </span>
                              )}
                              <span className="break-all text-foreground">
                                {typeof logEntry.message === "string"
                                  ? logEntry.message
                                  : typeof logEntry.message === "object" && logEntry.message !== null
                                  ? JSON.stringify(logEntry.message)
                                  : String(logEntry.message ?? "")}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </ScrollArea>
                </div>
              </Tabs>
          </CardContent>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}

export default NodeCard;
