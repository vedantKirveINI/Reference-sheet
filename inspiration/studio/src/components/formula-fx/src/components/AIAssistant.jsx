import React, { useState, useRef, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";
import { getLucideIcon } from "@/components/icons";
import { cn } from "@/lib/utils";

const AI_STATES = {
  IDLE: "idle",
  PROCESSING: "processing",
  READY: "ready",
  ERROR: "error",
};

const AIAssistant = ({
  variables = {},
  functions = [],
  onFormulaGenerated = () => {},
}) => {
  const [query, setQuery] = useState("");
  const [aiState, setAiState] = useState(AI_STATES.IDLE);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [progress, setProgress] = useState([]);
  const inputRef = useRef(null);

  const buildVariableContext = () => {
    const varList = [];
    Object.entries(variables).forEach(([category, items]) => {
      if (Array.isArray(items)) {
        items.forEach((item) => {
          varList.push({
            name: item.name || item.description || item.value,
            type: item.type || "any",
          });
        });
      }
    });
    return varList;
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    if (!query.trim() || aiState === AI_STATES.PROCESSING) return;

    setError(null);
    setResult(null);
    setProgress([]);
    setAiState(AI_STATES.PROCESSING);

    const steps = [
      { id: "understand", label: "Understanding request...", status: "active" },
      { id: "analyze", label: "Analyzing variables...", status: "pending" },
      { id: "generate", label: "Generating formula...", status: "pending" },
      { id: "validate", label: "Validating...", status: "pending" },
    ];
    setProgress(steps);

    try {
      const variableContext = buildVariableContext();

      await new Promise((r) => setTimeout(r, 400));
      setProgress((prev) =>
        prev.map((s) =>
          s.id === "understand"
            ? { ...s, status: "complete" }
            : s.id === "analyze"
            ? { ...s, status: "active" }
            : s
        )
      );

      await new Promise((r) => setTimeout(r, 300));
      setProgress((prev) =>
        prev.map((s) =>
          s.id === "analyze"
            ? { ...s, status: "complete" }
            : s.id === "generate"
            ? { ...s, status: "active" }
            : s
        )
      );

      const response = await fetch("/api/ai-formula-journey", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: query.trim(),
          variables: variableContext,
          functions: functions.map((f) => f.value || f.name),
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate formula");
      }

      const data = await response.json();

      setProgress((prev) =>
        prev.map((s) =>
          s.id === "generate"
            ? { ...s, status: "complete" }
            : s.id === "validate"
            ? { ...s, status: "active" }
            : s
        )
      );

      await new Promise((r) => setTimeout(r, 200));
      setProgress((prev) =>
        prev.map((s) => (s.id === "validate" ? { ...s, status: "complete" } : s))
      );

      setResult(data);
      setAiState(AI_STATES.READY);
    } catch (err) {
      setAiState(AI_STATES.ERROR);
      setError(err.message || "Failed to generate formula");
      setProgress((prev) =>
        prev.map((s) => (s.status === "active" ? { ...s, status: "error" } : s))
      );
    }
  };

  const handleInsert = () => {
    if (result?.formula) {
      onFormulaGenerated(result.formula, result);
      handleReset();
    }
  };

  const handleReset = () => {
    setQuery("");
    setAiState(AI_STATES.IDLE);
    setResult(null);
    setError(null);
    setProgress([]);
    inputRef.current?.focus();
  };

  const getStepIcon = (status) => {
    switch (status) {
      case "complete":
        return <span className="text-green-600">{getLucideIcon("Check", { size: 14 })}</span>;
      case "active":
        return <span className="text-purple-500 text-xs animate-pulse">●</span>;
      case "error":
        return <span className="text-destructive">{getLucideIcon("X", { size: 14 })}</span>;
      default:
        return <span className="text-muted-foreground text-xs">○</span>;
    }
  };

  return (
    <div className="p-3 px-4 bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-950/20 dark:to-blue-950/20 border-b border-border">
      <form className="w-full" onSubmit={handleSubmit}>
        <div className="flex items-center gap-2 py-2 px-3 bg-background border border-border rounded-md transition-all focus-within:border-purple-500 focus-within:ring-2 focus-within:ring-purple-500/20">
          <span className="text-purple-500">{getLucideIcon("Sparkles", { size: 18 })}</span>
          <Input
            ref={inputRef}
            type="text"
            className="flex-1 py-1 px-0 text-sm text-foreground bg-transparent border-none outline-none placeholder:text-muted-foreground disabled:opacity-60 border-0 shadow-none focus-visible:ring-0"
            placeholder="Describe what you want to calculate..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            disabled={aiState === AI_STATES.PROCESSING}
          />
          {aiState === AI_STATES.PROCESSING ? (
            <Button type="button" variant="ghost" className="text-sm font-medium text-muted-foreground bg-muted hover:bg-muted" onClick={handleReset}>
              Cancel
            </Button>
          ) : (
            <Button
              type="submit"
              variant="default"
              className="flex items-center justify-center w-8 h-8 p-0 bg-purple-600 hover:bg-purple-700 text-white rounded-md disabled:bg-muted disabled:text-muted-foreground disabled:cursor-not-allowed"
              disabled={!query.trim()}
              size="icon"
            >
              {getLucideIcon("SendIcon", { size: 16 })}
            </Button>
          )}
        </div>
      </form>

      {progress.length > 0 && aiState === AI_STATES.PROCESSING && (
        <div className="flex flex-wrap gap-2 mt-3">
          {progress.map((step) => (
            <div
              key={step.id}
              className={cn(
                "flex items-center gap-2 py-1 px-3 text-sm bg-background rounded-full border border-border",
                step.status === "active" && "border-purple-500 bg-purple-500/5",
                step.status === "complete" && "border-green-600 bg-green-100 dark:bg-green-900/20",
                step.status === "error" && "border-destructive bg-destructive/10"
              )}
            >
              {getStepIcon(step.status)}
              <span className="text-muted-foreground">{step.label}</span>
            </div>
          ))}
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 mt-3 p-3 bg-destructive/10 border border-destructive/30 rounded-md">
          <span className="text-destructive">{getLucideIcon("AlertTriangle", { size: 18 })}</span>
          <span className="flex-1 text-sm text-destructive">{error}</span>
          <Button variant="outline" className="text-sm font-medium text-destructive border-destructive/30 hover:bg-destructive/10" onClick={handleReset}>
            Try again
          </Button>
        </div>
      )}

      {result && aiState === AI_STATES.READY && (
        <Card className="mt-3 p-4 bg-background border border-border rounded-md">
          <CardContent className="p-0 space-y-4">
            <div className="mb-3">
              <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Generated Formula</div>
              <code className="block p-3 text-sm text-foreground bg-muted border border-border rounded-md break-all">
                {result.formula}
              </code>
            </div>

            {result.explanation && (
              <div className="mb-3 p-3 bg-muted rounded-md">
                <p className="m-0 text-sm leading-normal text-muted-foreground">{result.explanation}</p>
              </div>
            )}

            <div className="flex gap-2">
              <Button className="flex-1 bg-purple-600 hover:bg-purple-700 text-white font-semibold" onClick={handleInsert}>
                Insert formula
              </Button>
              <Button variant="outline" className="font-medium text-muted-foreground bg-muted hover:bg-muted/80" onClick={handleReset}>
                Try different prompt
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AIAssistant;
