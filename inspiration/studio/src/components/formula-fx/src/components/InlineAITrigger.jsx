import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Spinner } from "@/components/ui/spinner";
import { getLucideIcon } from "@/components/icons";
import { cn } from "@/lib/utils";

const InlineAITrigger = ({
  variables = {},
  functions = [],
  onFormulaGenerated = () => {},
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

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
    if (!query.trim() || isLoading) return;

    setError(null);
    setIsLoading(true);

    try {
      const variableContext = buildVariableContext();
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
      if (data.formula) {
        onFormulaGenerated(data.formula, data);
        setQuery("");
        setIsOpen(false);
      }
    } catch (err) {
      setError(err.message || "Failed to generate formula");
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Escape") {
      setIsOpen(false);
    }
  };

  const SparkleIcon = getLucideIcon("SparkleIcon", { size: 16 });
  const SendIcon = getLucideIcon("SendIcon", { size: 14 });

  return (
    <div>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            className={cn(
              "bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-500 hover:to-purple-600 text-white border-0",
              isOpen && "ring-2 ring-primary ring-offset-2"
            )}
            size="icon"
            title="Generate formula with AI"
          >
            {SparkleIcon}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[320px] p-0 border border-border" align="end" sideOffset={8}>
          <form onSubmit={handleSubmit} className="flex items-center gap-2 p-2">
            <Input
              ref={inputRef}
              type="text"
              className="flex-1 border border-border focus:border-primary text-sm bg-transparent min-w-0"
              placeholder="Describe what you want to calculate..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isLoading}
            />
            <Button
              type="submit"
              className="bg-primary hover:bg-primary/90 text-primary-foreground border-0"
              size="icon"
              disabled={!query.trim() || isLoading}
            >
              {isLoading ? <Spinner className="size-3.5" /> : SendIcon}
            </Button>
          </form>
          {error && <div className="px-2 pb-2 text-sm text-destructive">{error}</div>}
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default InlineAITrigger;
