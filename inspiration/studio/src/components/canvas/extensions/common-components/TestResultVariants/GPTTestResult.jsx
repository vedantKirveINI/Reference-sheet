import React, { useMemo, useState, useCallback } from "react";
import {
  Sparkles,
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
  Hash,
  Thermometer,
  FileText,
  Bot,
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

const extractFxText = (fxValue) => {
  if (!fxValue) return null;
  if (typeof fxValue === "string") return fxValue;
  if (fxValue?.blocks) {
    return fxValue.blocks
      .map((block) => block?.value || "")
      .filter(Boolean)
      .join("");
  }
  return null;
};

const CopyInlineButton = ({ text, label = "Copy" }) => {
  const [copied, setCopied] = useState(false);
  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      console.error("Failed to copy:", e);
    }
  }, [text]);
  return (
    <button
      onClick={handleCopy}
      className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors px-1.5 py-0.5 rounded hover:bg-muted/50"
      title={label}
    >
      {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
      <span>{copied ? "Copied" : "Copy"}</span>
    </button>
  );
};

const GPTTestResult = ({
  inputs,
  outputs,
  node,
  theme = {},
  executedAt,
  onRerun = null,
  goData = {},
}) => {
  const [copiedAll, setCopiedAll] = useState(false);
  
  const accentColor = theme.accentColor || "#8b5cf6";
  const hasError = outputs?.error || outputs?.status === "error";
  const timestamp = executedAt || outputs?.executedAt || outputs?.timestamp || new Date().toISOString();

  const normalizedInputs = useMemo(() => {
    return inputs?.response || inputs || {};
  }, [inputs]);

  const normalizedOutputs = useMemo(() => {
    return outputs?.response || outputs || {};
  }, [outputs]);

  const modelSettings = useMemo(() => {
    return {
      temperature: normalizedInputs.temperature ?? goData?.temperature ?? 0.7,
      maxTokens: normalizedInputs.max_tokens || normalizedInputs.maxTokens || goData?.maxTokens || 1000,
    };
  }, [normalizedInputs, goData]);

  const promptData = useMemo(() => {
    const systemPrompt =
      normalizedInputs.persona ||
      normalizedInputs.systemPrompt ||
      normalizedInputs.system ||
      normalizedInputs.system_message ||
      extractFxText(goData?.persona);
    const userPrompt =
      normalizedInputs.query ||
      normalizedInputs.prompt ||
      normalizedInputs.userPrompt ||
      normalizedInputs.user_message ||
      extractFxText(goData?.query);
    const messages = normalizedInputs.messages || [];
    
    return {
      systemPrompt,
      userPrompt,
      messages,
    };
  }, [normalizedInputs, goData]);

  const errorMessage = useMemo(() => {
    if (!hasError) return null;
    return outputs?.error?.message || outputs?.message || outputs?.error || "An error occurred during execution";
  }, [hasError, outputs]);

  const isPlainTextMode = goData?._originalOutputFormat === "text" || goData?.outputFormat === "text";

  const outputData = useMemo(() => {
    if (hasError) return null;
    
    const result = normalizedOutputs;
    if (!result) return null;
    
    if (result.choices?.[0]?.message?.content) {
      return {
        content: result.choices[0].message.content,
        role: result.choices[0].message.role,
        finishReason: result.choices[0].finish_reason,
      };
    }

    if (isPlainTextMode) {
      const textValue = result.response || result.content || 
        (typeof result === "object" ? Object.values(result).find(v => typeof v === "string" && v.length > 0) : null);
      if (textValue) return { content: textValue };
    }
    
    if (result.content) {
      return { content: result.content };
    }
    
    if (result.response) {
      return { content: result.response };
    }
    
    if (typeof result === "string") {
      return { content: result };
    }
    
    return result;
  }, [normalizedOutputs, hasError, isPlainTextMode]);

  const tokenUsage = useMemo(() => {
    const usage = normalizedOutputs.usage || {};
    return {
      promptTokens: usage.prompt_tokens || usage.promptTokens,
      completionTokens: usage.completion_tokens || usage.completionTokens,
      totalTokens: usage.total_tokens || usage.totalTokens,
    };
  }, [normalizedOutputs]);

  const handleCopyAll = useCallback(async () => {
    try {
      const data = {
        modelSettings,
        prompt: promptData,
        output: outputData,
        tokenUsage,
        executedAt: timestamp,
      };
      await navigator.clipboard.writeText(JSON.stringify(data, null, 2));
      setCopiedAll(true);
      setTimeout(() => setCopiedAll(false), 2000);
    } catch (e) {
      console.error("Failed to copy:", e);
    }
  }, [modelSettings, promptData, outputData, tokenUsage, timestamp]);

  const handleDownload = useCallback(() => {
    try {
      const data = {
        modelSettings,
        prompt: promptData,
        output: outputData,
        tokenUsage,
        executedAt: timestamp,
      };
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `gpt-result-${Date.now()}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error("Failed to download:", e);
    }
  }, [modelSettings, promptData, outputData, tokenUsage, timestamp]);

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
              <Sparkles className="w-5 h-5 text-violet-600" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className={cn(
                "text-sm font-semibold",
                hasError ? "text-red-700" : "text-violet-700"
              )}>
                {hasError ? "Generation Failed" : "Response Generated"}
              </span>
            </div>
            <div className="flex items-center gap-3 mt-1">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Clock className="w-3 h-3" />
                <span>{formatTimestamp(timestamp)}</span>
              </div>
              {tokenUsage.totalTokens && (
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Zap className="w-3 h-3" />
                  <span>{tokenUsage.totalTokens} tokens</span>
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
        icon={Settings2}
        title="Model Settings"
        accentColor={accentColor}
        defaultExpanded={false}
      >
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 bg-muted/30 rounded-lg">
            <p className="text-xs text-muted-foreground mb-1">Temperature</p>
            <p className="text-sm font-mono text-foreground">{modelSettings.temperature}</p>
          </div>
          <div className="p-3 bg-muted/30 rounded-lg">
            <p className="text-xs text-muted-foreground mb-1">Max Tokens</p>
            <p className="text-sm font-mono text-foreground">{modelSettings.maxTokens}</p>
          </div>
        </div>
      </ResultSection>

      <ResultSection
        icon={MessageSquare}
        title="Prompt"
        accentColor={accentColor}
        defaultExpanded={true}
      >
        <div className="space-y-4">
          {promptData.systemPrompt && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Bot className="w-4 h-4 text-muted-foreground" />
                  <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    System Prompt
                  </span>
                </div>
                <CopyInlineButton text={promptData.systemPrompt} label="Copy system prompt" />
              </div>
              <div className="p-3 bg-muted/30 rounded-lg border border-border/30">
                <p className="text-sm text-foreground whitespace-pre-wrap">
                  {promptData.systemPrompt}
                </p>
              </div>
            </div>
          )}
          
          {promptData.userPrompt && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-muted-foreground" />
                  <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    User Prompt
                  </span>
                </div>
                <CopyInlineButton text={promptData.userPrompt} label="Copy user prompt" />
              </div>
              <div className="p-3 bg-blue-50/50 rounded-lg border border-blue-100/50">
                <p className="text-sm text-foreground whitespace-pre-wrap">
                  {promptData.userPrompt}
                </p>
              </div>
            </div>
          )}

          {!promptData.systemPrompt && !promptData.userPrompt && promptData.messages.length === 0 && (
            <div className="p-3 bg-muted/30 rounded-lg border border-border/30">
              <p className="text-sm text-muted-foreground italic">
                No prompt data available
              </p>
            </div>
          )}

          {promptData.messages.length > 0 && (
            <div className="space-y-2">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Messages ({promptData.messages.length})
              </span>
              <div className="space-y-2">
                {promptData.messages.map((msg, index) => (
                  <div
                    key={index}
                    className={cn(
                      "p-3 rounded-lg border",
                      msg.role === "system" && "bg-muted/30 border-border/30",
                      msg.role === "user" && "bg-blue-50/50 border-blue-100/50",
                      msg.role === "assistant" && "bg-violet-50/50 border-violet-100/50"
                    )}
                  >
                    <p className="text-xs font-medium text-muted-foreground mb-1 capitalize">
                      {msg.role}
                    </p>
                    <p className="text-sm text-foreground whitespace-pre-wrap">
                      {msg.content}
                    </p>
                  </div>
                ))}
              </div>
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
                Generation Failed
              </p>
              <p className="text-sm text-red-600 break-words">
                {errorMessage}
              </p>
            </div>
          </div>
        </ResultSection>
      ) : outputData ? (
        <ResultSection
          icon={Sparkles}
          title="Response"
          subtitle={tokenUsage.completionTokens ? `${tokenUsage.completionTokens} tokens` : undefined}
          accentColor="#8b5cf6"
          variant="success"
          defaultExpanded={true}
        >
          <div className="relative group p-4 bg-violet-50/50 rounded-lg border border-violet-100/50">
            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <CopyInlineButton
                text={outputData.content || JSON.stringify(outputData, null, 2)}
                label="Copy response"
              />
            </div>
            <p className="text-sm text-foreground whitespace-pre-wrap leading-relaxed">
              {outputData.content || JSON.stringify(outputData, null, 2)}
            </p>
          </div>
          
          {tokenUsage.totalTokens && (
            <div className="mt-4 flex items-center gap-4 text-xs text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <Hash className="w-3 h-3" />
                <span>Prompt: {tokenUsage.promptTokens || 0}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Hash className="w-3 h-3" />
                <span>Completion: {tokenUsage.completionTokens || 0}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Zap className="w-3 h-3" />
                <span>Total: {tokenUsage.totalTokens}</span>
              </div>
            </div>
          )}
        </ResultSection>
      ) : (
        <div className="flex flex-col items-center justify-center gap-3 py-8 px-4 bg-muted/30 rounded-xl border border-dashed border-border">
          <Inbox className="w-10 h-10 text-muted-foreground/50" />
          <div className="text-center">
            <p className="text-sm font-medium text-muted-foreground">
              No Response
            </p>
            <p className="text-xs text-muted-foreground/70 mt-1">
              The model did not return a response
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default GPTTestResult;
