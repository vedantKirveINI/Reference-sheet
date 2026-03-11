import React, { useMemo, useState, useCallback } from "react";
import {
  Bot,
  Settings2,
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
  Zap,
  ListChecks,
  Brain,
  Lightbulb,
  Target,
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

const extractFxValue = (fxObj) => {
  if (!fxObj) return null;
  if (typeof fxObj === "string") return fxObj;
  if (fxObj?.blocks?.length > 0) {
    return fxObj.blocks
      .map((block) => {
        if (block?.type === "PRIMITIVES") return block?.value || "";
        if (block?.type === "VARIABLE") return `{{${block?.label || block?.value || "variable"}}}`;
        return block?.value || block?.text || "";
      })
      .join("");
  }
  if (fxObj?.blockStr) return fxObj.blockStr;
  return null;
};

/** Ensures a value is safe to render as text (never a raw object, especially { type, blocks }). */
const toDisplayString = (value) => {
  if (value == null) return "";
  if (typeof value === "string" || typeof value === "number") return String(value);
  if (typeof value === "object") {
    const fxStr = extractFxValue(value);
    if (fxStr != null) return fxStr;
    return JSON.stringify(value, null, 2);
  }
  return String(value);
};

const COMPOSER_INPUT_KEYS = [
  "messageSubject",
  "messageBody",
  "emailObjective",
  "description",
  "senderName",
  "senderEmail",
  "senderCompany",
  "companyName",
  "recipientName",
  "recipientEmail",
  "recipientCompany",
  "recipientDescription",
];

const AgentTestResult = ({
  inputs,
  outputs,
  node,
  theme = {},
  executedAt,
  onRerun = null,
  goData = null,
}) => {
  const [copiedAll, setCopiedAll] = useState(false);
  const [copiedOutput, setCopiedOutput] = useState(false);
  const [copiedThreadId, setCopiedThreadId] = useState(false);
  const [copiedMessage, setCopiedMessage] = useState(false);
  const [copiedMessageId, setCopiedMessageId] = useState(false);
  
  const accentColor = theme.accentColor || "#ec4899";
  const hasError = outputs?.error || outputs?.status === "error";
  const timestamp = executedAt || outputs?.executedAt || outputs?.timestamp || new Date().toISOString();

  const normalizedInputs = useMemo(() => {
    const fromInputs = inputs?.response || inputs || {};
    const hasGenericAgentInput =
      Object.keys(fromInputs).length > 0 &&
      (fromInputs.message || fromInputs.agent || fromInputs.task || fromInputs.asset_id);
    const hasComposerInput =
      Object.keys(fromInputs).length > 0 &&
      COMPOSER_INPUT_KEYS.some((k) => fromInputs[k] != null && fromInputs[k] !== "");

    if (hasGenericAgentInput || hasComposerInput) {
      return fromInputs;
    }

    return goData || fromInputs;
  }, [inputs, goData]);

  const normalizedOutputs = useMemo(() => {
    return outputs?.response || outputs || {};
  }, [outputs]);

  const agentConfig = useMemo(() => {
    const agent = normalizedInputs.agent || {};
    const rawDescription = agent.description || normalizedInputs.description;
    const description =
      typeof rawDescription === "string" || typeof rawDescription === "number"
        ? String(rawDescription)
        : rawDescription != null && typeof rawDescription === "object"
          ? (extractFxValue(rawDescription) ?? JSON.stringify(rawDescription))
          : undefined;
    return {
      agentId: agent._id || agent.id || normalizedInputs.asset_id || normalizedInputs.agentId || normalizedInputs.agent_id,
      agentName: agent.name || normalizedInputs.agentName || normalizedInputs.agent_name || normalizedInputs.asset_name || normalizedInputs.name || goData?.agent?.name || goData?.asset_name || "Agent",
      description,
      capabilities: agent.capabilities || normalizedInputs.capabilities || [],
      model: agent.model || normalizedInputs.model || normalizedInputs.modelId,
      tools: agent.tools || normalizedInputs.tools || normalizedInputs.functions || [],
    };
  }, [normalizedInputs, goData]);

  const taskData = useMemo(() => {
    const messageValue = extractFxValue(normalizedInputs.message);
    const threadIdValue = extractFxValue(normalizedInputs.threadId);
    const messageIdValue = extractFxValue(normalizedInputs.messageId);
    const taskValue =
      extractFxValue(normalizedInputs.task) ||
      extractFxValue(normalizedInputs.instruction) ||
      extractFxValue(normalizedInputs.prompt);
    const goalValue =
      extractFxValue(normalizedInputs.goal) || extractFxValue(normalizedInputs.objective);

    const subjectValue =
      extractFxValue(normalizedInputs.messageSubject ?? normalizedInputs.emailObjective) ?? null;
    const bodyValue =
      extractFxValue(normalizedInputs.messageBody ?? normalizedInputs.description) ?? null;
    const toneValue =
      typeof normalizedInputs.selectedTone === "string"
        ? normalizedInputs.selectedTone
        : extractFxValue(normalizedInputs.tone ?? normalizedInputs.selectedTone) ?? null;

    return {
      message: messageValue,
      threadId: threadIdValue,
      messageId: messageIdValue,
      task: taskValue,
      context: normalizedInputs.context,
      constraints: normalizedInputs.constraints || [],
      goal: goalValue,
      messageSubject: subjectValue,
      messageBody: bodyValue,
      senderName: extractFxValue(normalizedInputs.senderName) ?? null,
      senderEmail: extractFxValue(normalizedInputs.senderEmail) ?? null,
      senderCompany:
        extractFxValue(normalizedInputs.senderCompany ?? normalizedInputs.companyName) ?? null,
      recipientName: extractFxValue(normalizedInputs.recipientName) ?? null,
      recipientEmail: extractFxValue(normalizedInputs.recipientEmail) ?? null,
      recipientCompany:
        extractFxValue(normalizedInputs.recipientCompany ?? normalizedInputs.recipientDescription) ??
        null,
      tone: toneValue,
      additionalContext:
        normalizedInputs.additionalContext != null && normalizedInputs.additionalContext !== ""
          ? normalizedInputs.additionalContext
          : null,
    };
  }, [normalizedInputs]);

  const errorMessage = useMemo(() => {
    if (!hasError) return null;
    return outputs?.error?.message || outputs?.message || outputs?.error || "Agent execution failed";
  }, [hasError, outputs]);

  const outputData = useMemo(() => {
    if (hasError) return null;

    const result = normalizedOutputs;
    if (!result) return null;

    // Composer-style output: subject, body, formatted_message
    const composerSubject = result.subject ?? result.email_subject;
    const composerBody = result.body ?? result.email_body ?? result.message_body;
    const composerFormatted = result.formatted_message ?? result.formattedMessage;
    const hasComposerOutput =
      composerSubject != null || composerBody != null || composerFormatted != null;
    const composerResponse =
      hasComposerOutput && composerFormatted != null
        ? composerFormatted
        : hasComposerOutput
          ? [composerSubject, composerBody].filter(Boolean).join("\n\n")
          : null;

    // Generic agent: message.content > response.message.content > direct content fields
    const responseContent =
      composerResponse ??
      (result.message?.content ||
        result.response?.message?.content ||
        result.content ||
        result.response ||
        result.output ||
        result.result);

    return {
      response: responseContent,
      reasoning: result.reasoning || result.thought || result.thinking,
      steps: result.steps || result.actions || [],
      toolCalls: result.tool_calls || result.toolCalls || result.function_calls || [],
      metadata: result.metadata || {},
      success: result.success,
      threadId: result.thread_id || result.threadId,
      subject: composerSubject,
      body: composerBody,
      formattedMessage: composerFormatted,
    };
  }, [normalizedOutputs, hasError]);

  const handleCopyAll = useCallback(async () => {
    try {
      const data = {
        agent: agentConfig,
        task: taskData,
        output: outputData,
        executedAt: timestamp,
      };
      await navigator.clipboard.writeText(JSON.stringify(data, null, 2));
      setCopiedAll(true);
      setTimeout(() => setCopiedAll(false), 2000);
    } catch (e) {
      console.error("Failed to copy:", e);
    }
  }, [agentConfig, taskData, outputData, timestamp]);

  const handleCopyOutput = useCallback(async () => {
    try {
      const textValue = typeof outputData?.response === "object" 
        ? JSON.stringify(outputData.response, null, 2) 
        : (outputData?.response || JSON.stringify(outputData, null, 2));
      await navigator.clipboard.writeText(textValue);
      setCopiedOutput(true);
      setTimeout(() => setCopiedOutput(false), 2000);
    } catch (e) {
      console.error("Failed to copy output:", e);
    }
  }, [outputData]);

  const handleCopyThreadId = useCallback(async (threadIdValue) => {
    if (!threadIdValue) return;
    try {
      await navigator.clipboard.writeText(threadIdValue);
      setCopiedThreadId(true);
      setTimeout(() => setCopiedThreadId(false), 2000);
    } catch (e) {
      console.error("Failed to copy:", e);
    }
  }, []);

  const handleCopyMessage = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(taskData.message || "");
      setCopiedMessage(true);
      setTimeout(() => setCopiedMessage(false), 2000);
    } catch (e) {
      console.error("Failed to copy:", e);
    }
  }, [taskData.message]);

  const handleCopyMessageId = useCallback(async (messageIdValue) => {
    if (!messageIdValue) return;
    try {
      await navigator.clipboard.writeText(messageIdValue);
      setCopiedMessageId(true);
      setTimeout(() => setCopiedMessageId(false), 2000);
    } catch (e) {
      console.error("Failed to copy:", e);
    }
  }, []);

  const handleDownload = useCallback(() => {
    try {
      const data = {
        agent: agentConfig,
        task: taskData,
        output: outputData,
        executedAt: timestamp,
      };
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `agent-result-${Date.now()}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error("Failed to download:", e);
    }
  }, [agentConfig, taskData, outputData, timestamp]);

  return (
    <div className="flex flex-col gap-4 w-full">
      <div
        className={cn(
          "flex items-center justify-between p-4 rounded-xl border",
          "shadow-[0_2px_8px_rgba(0,0,0,0.04)]",
          hasError 
            ? "bg-red-50/50 border-red-200/50" 
            : "bg-[#8F40FF]/5 border-[#8F40FF]/20"
        )}
      >
        <div className="flex items-center gap-3">
          <div
            className={cn(
              "w-10 h-10 rounded-xl flex items-center justify-center",
              hasError ? "bg-red-100" : "bg-[#8F40FF]/10"
            )}
          >
            {hasError ? (
              <XCircle className="w-5 h-5 text-red-600" />
            ) : (
              <Bot className="w-5 h-5 text-[#8F40FF]" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className={cn(
                "text-sm font-semibold",
                hasError ? "text-red-700" : "text-[#8F40FF]"
              )}>
                {hasError ? "Agent Failed" : "Agent Completed"}
              </span>
              <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-white/60 text-muted-foreground">
                {agentConfig.agentName}
              </span>
            </div>
            <div className="flex items-center gap-3 mt-1">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Clock className="w-3 h-3" />
                <span>{formatTimestamp(timestamp)}</span>
              </div>
              {outputData?.steps?.length > 0 && (
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <ListChecks className="w-3 h-3" />
                  <span>{outputData.steps.length} steps</span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
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
        icon={Bot}
        title={agentConfig.agentName || "Agent"}
        subtitle={agentConfig.description}
        accentColor="#8F40FF"
        defaultExpanded={false}
      >
        <div className="space-y-3">
          <FieldValueRow
            icon={Bot}
            label="Agent Name"
            value={agentConfig.agentName}
          />
          {agentConfig.agentId && (
            <FieldValueRow
              icon={Settings2}
              label="Agent ID"
              value={agentConfig.agentId}
            />
          )}
          {agentConfig.model && (
            <FieldValueRow
              icon={Brain}
              label="Model"
              value={agentConfig.model}
            />
          )}
          {agentConfig.capabilities.length > 0 && (
            <div className="pt-2">
              <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">
                Capabilities
              </p>
              <div className="flex flex-wrap gap-2">
                {agentConfig.capabilities.map((cap, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 text-xs bg-[#8F40FF]/10 text-[#8F40FF] rounded-md"
                  >
                    {cap}
                  </span>
                ))}
              </div>
            </div>
          )}
          {agentConfig.tools.length > 0 && (
            <div className="pt-2">
              <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">
                Available Tools
              </p>
              <div className="flex flex-wrap gap-2">
                {agentConfig.tools.map((tool, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 text-xs bg-[#8F40FF]/10 text-[#8F40FF] rounded-md"
                  >
                    {typeof tool === "string" ? tool : tool.name || tool.function?.name}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </ResultSection>

      <ResultSection
        icon={MessageSquare}
        title="User Message"
        accentColor="#8F40FF"
        defaultExpanded={true}
      >
        <div className="space-y-4">
          {taskData.message && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-[#8F40FF]" />
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Message
                </span>
              </div>
              <div className="group relative p-3 bg-[#8F40FF]/5 rounded-lg border border-[#8F40FF]/20">
                <button
                  onClick={handleCopyMessage}
                  className={cn(
                    "absolute top-2 right-2 w-7 h-7 rounded-md flex items-center justify-center",
                    "opacity-0 group-hover:opacity-100 transition-opacity",
                    "hover:bg-[#8F40FF]/10 text-muted-foreground hover:text-foreground"
                  )}
                  title="Copy message"
                >
                  {copiedMessage ? (
                    <Check className="w-3.5 h-3.5 text-[#8F40FF]" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
                <p className="text-sm text-foreground whitespace-pre-wrap pr-8">
                  {taskData.message}
                </p>
              </div>
            </div>
          )}

          {(taskData.threadId || taskData.messageId) && (
            <div className="grid grid-cols-2 gap-3">
              {taskData.threadId && (
                <div className="group relative p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <p className="text-xs text-gray-500 font-medium mb-1">Thread ID</p>
                  <div className="flex items-center gap-2">
                    <p className="text-sm text-foreground truncate flex-1" title={taskData.threadId}>
                      {taskData.threadId}
                    </p>
                    <button
                      onClick={() => handleCopyThreadId(taskData.threadId)}
                      className={cn(
                        "w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0",
                        "opacity-0 group-hover:opacity-100 transition-opacity",
                        "hover:bg-gray-200 text-muted-foreground hover:text-foreground"
                      )}
                      title="Copy thread ID"
                    >
                      {copiedThreadId ? (
                        <Check className="w-3 h-3 text-green-500" />
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                    </button>
                  </div>
                </div>
              )}
              {taskData.messageId && (
                <div className="group relative p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <p className="text-xs text-gray-500 font-medium mb-1">Message ID</p>
                  <div className="flex items-center gap-2">
                    <p className="text-sm text-foreground truncate flex-1" title={taskData.messageId}>
                      {taskData.messageId}
                    </p>
                    <button
                      onClick={() => handleCopyMessageId(taskData.messageId)}
                      className={cn(
                        "w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0",
                        "opacity-0 group-hover:opacity-100 transition-opacity",
                        "hover:bg-gray-200 text-muted-foreground hover:text-foreground"
                      )}
                      title="Copy message ID"
                    >
                      {copiedMessageId ? (
                        <Check className="w-3 h-3 text-green-500" />
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {taskData.goal && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4 text-muted-foreground" />
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Goal
                </span>
              </div>
              <div className="p-3 bg-amber-50/50 rounded-lg border border-amber-100/50">
                <p className="text-sm text-foreground whitespace-pre-wrap">
                  {toDisplayString(taskData.goal)}
                </p>
              </div>
            </div>
          )}
          
          {taskData.task && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-muted-foreground" />
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Instructions
                </span>
              </div>
              <div className="p-3 bg-muted/30 rounded-lg border border-border/30">
                <p className="text-sm text-foreground whitespace-pre-wrap">
                  {toDisplayString(taskData.task)}
                </p>
              </div>
            </div>
          )}

          {taskData.context && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Lightbulb className="w-4 h-4 text-muted-foreground" />
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Context
                </span>
              </div>
              <div className="p-3 bg-blue-50/50 rounded-lg border border-blue-100/50">
                <p className="text-sm text-foreground whitespace-pre-wrap">
                  {typeof taskData.context === "object"
                    ? JSON.stringify(taskData.context, null, 2)
                    : taskData.context}
                </p>
              </div>
            </div>
          )}

          {(taskData.messageSubject ||
            taskData.messageBody ||
            taskData.senderName ||
            taskData.senderCompany ||
            taskData.recipientName ||
            taskData.recipientEmail ||
            taskData.recipientCompany ||
            taskData.tone ||
            taskData.additionalContext) && (
            <div className="space-y-3 pt-2 border-t border-border/50">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Composer details
              </p>
              {taskData.messageSubject && (
                <div className="space-y-1">
                  <span className="text-xs text-muted-foreground">Subject</span>
                  <div className="p-3 bg-muted/30 rounded-lg border border-border/30">
                    <p className="text-sm text-foreground whitespace-pre-wrap">
                      {toDisplayString(taskData.messageSubject)}
                    </p>
                  </div>
                </div>
              )}
              {taskData.messageBody && (
                <div className="space-y-1">
                  <span className="text-xs text-muted-foreground">Body</span>
                  <div className="p-3 bg-muted/30 rounded-lg border border-border/30">
                    <p className="text-sm text-foreground whitespace-pre-wrap">
                      {toDisplayString(taskData.messageBody)}
                    </p>
                  </div>
                </div>
              )}
              {(taskData.senderName || taskData.senderEmail || taskData.senderCompany) && (
                <div className="space-y-1">
                  <span className="text-xs text-muted-foreground">Sender</span>
                  <div className="p-3 bg-muted/30 rounded-lg border border-border/30 text-sm text-foreground">
                    {[taskData.senderName, taskData.senderEmail, taskData.senderCompany]
                      .filter(Boolean)
                      .join(" · ")}
                  </div>
                </div>
              )}
              {(taskData.recipientName || taskData.recipientEmail || taskData.recipientCompany) && (
                <div className="space-y-1">
                  <span className="text-xs text-muted-foreground">Recipient</span>
                  <div className="p-3 bg-muted/30 rounded-lg border border-border/30 text-sm text-foreground">
                    {[taskData.recipientName, taskData.recipientEmail, taskData.recipientCompany]
                      .filter(Boolean)
                      .join(" · ")}
                  </div>
                </div>
              )}
              {taskData.tone && (
                <div className="space-y-1">
                  <span className="text-xs text-muted-foreground">Tone</span>
                  <div className="p-3 bg-muted/30 rounded-lg border border-border/30">
                    <p className="text-sm text-foreground">{toDisplayString(taskData.tone)}</p>
                  </div>
                </div>
              )}
              {taskData.additionalContext && (
                <div className="space-y-1">
                  <span className="text-xs text-muted-foreground">Additional context</span>
                  <div className="p-3 bg-muted/30 rounded-lg border border-border/30">
                    <p className="text-sm text-foreground whitespace-pre-wrap">
                      {toDisplayString(taskData.additionalContext)}
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {!taskData.message &&
            !taskData.goal &&
            !taskData.task &&
            !taskData.context &&
            !taskData.messageSubject &&
            !taskData.messageBody &&
            !taskData.senderName &&
            !taskData.senderCompany &&
            !taskData.recipientName &&
            !taskData.recipientEmail &&
            !taskData.recipientCompany && (
            <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
              <Inbox className="w-4 h-4 text-gray-400" />
              <p className="text-sm text-gray-500">No input message configured</p>
            </div>
          )}
        </div>
      </ResultSection>

      {hasError ? (
        <ResultSection
          icon={AlertCircle}
          title="Error Details"
          accentColor="#ef4444"
          variant="error"
          defaultExpanded={true}
          collapsible={false}
        >
          <div className="flex items-start gap-3 p-4 bg-red-50 rounded-lg border border-red-100">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-red-700 mb-1">
                Agent Execution Failed
              </p>
              <p className="text-sm text-red-600 break-words">
                {toDisplayString(errorMessage)}
              </p>
            </div>
          </div>
        </ResultSection>
      ) : outputData ? (
        <>
          {outputData.reasoning && (
            <ResultSection
              icon={Brain}
              title="Reasoning"
              accentColor="#f59e0b"
              defaultExpanded={true}
            >
              <div className="p-4 bg-amber-50/50 rounded-lg border border-amber-100/50">
                <p className="text-sm text-foreground whitespace-pre-wrap leading-relaxed">
                  {toDisplayString(outputData.reasoning)}
                </p>
              </div>
            </ResultSection>
          )}

          {outputData.steps.length > 0 && (
            <ResultSection
              icon={ListChecks}
              title="Steps Taken"
              badge={`${outputData.steps.length} steps`}
              accentColor="#8F40FF"
              defaultExpanded={true}
            >
              <div className="space-y-3">
                {outputData.steps.map((step, index) => (
                  <div
                    key={index}
                    className="flex gap-3 p-3 bg-muted/30 rounded-lg"
                  >
                    <div className="w-6 h-6 rounded-full bg-[#8F40FF]/10 flex items-center justify-center flex-shrink-0">
                      <span className="text-xs font-semibold text-[#8F40FF]">
                        {index + 1}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-foreground">
                        {typeof step === "string" ? step : step.action || step.description || JSON.stringify(step)}
                      </p>
                      {step.result && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Result: {typeof step.result === "object" ? JSON.stringify(step.result) : step.result}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </ResultSection>
          )}

          <ResultSection
            icon={CheckCircle2}
            title="Result"
            accentColor="#10b981"
            variant="success"
            defaultExpanded={true}
          >
            <div className="space-y-3">
              {(outputData.success !== undefined || outputData.threadId) && (
                <div className="grid grid-cols-2 gap-3">
                  {outputData.success !== undefined && (
                    <div className="p-3 bg-green-50/50 rounded-lg border border-green-100/50">
                      <p className="text-xs text-green-600 font-medium mb-1">Status</p>
                      <p className="text-sm text-foreground">
                        {outputData.success ? "✓ Success" : "✗ Failed"}
                      </p>
                    </div>
                  )}
                  {outputData.threadId && (
                    <div className="group relative p-3 bg-blue-50/50 rounded-lg border border-blue-100/50">
                      <p className="text-xs text-blue-600 font-medium mb-1">Thread ID</p>
                      <div className="flex items-center gap-2">
                        <p className="text-sm text-foreground truncate flex-1" title={outputData.threadId}>
                          {outputData.threadId}
                        </p>
                        <button
                          onClick={() => handleCopyThreadId(outputData.threadId)}
                          className={cn(
                            "w-7 h-7 rounded-md flex items-center justify-center flex-shrink-0",
                            "opacity-0 group-hover:opacity-100 transition-opacity",
                            "hover:bg-blue-100 text-muted-foreground hover:text-foreground"
                          )}
                          title="Copy thread ID"
                        >
                          {copiedThreadId ? (
                            <Check className="w-3.5 h-3.5 text-blue-500" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
              <div className="group relative p-4 bg-emerald-50/50 rounded-lg border border-emerald-100/50">
                <button
                  onClick={handleCopyOutput}
                  className={cn(
                    "absolute top-2 right-2 w-7 h-7 rounded-md flex items-center justify-center",
                    "opacity-0 group-hover:opacity-100 transition-opacity",
                    "hover:bg-emerald-100 text-muted-foreground hover:text-foreground"
                  )}
                  title="Copy output"
                >
                  {copiedOutput ? (
                    <Check className="w-3.5 h-3.5 text-emerald-500" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
                <p className="text-sm text-foreground whitespace-pre-wrap leading-relaxed pr-8">
                  {outputData.response != null
                    ? toDisplayString(outputData.response)
                    : JSON.stringify(outputData, null, 2)}
                </p>
              </div>
            </div>
          </ResultSection>
        </>
      ) : (
        <div className="flex flex-col items-center justify-center gap-3 py-8 px-4 bg-muted/30 rounded-xl border border-dashed border-border">
          <Inbox className="w-10 h-10 text-muted-foreground/50" />
          <div className="text-center">
            <p className="text-sm font-medium text-muted-foreground">
              No Response
            </p>
            <p className="text-xs text-muted-foreground/70 mt-1">
              The agent did not return a response
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default AgentTestResult;
