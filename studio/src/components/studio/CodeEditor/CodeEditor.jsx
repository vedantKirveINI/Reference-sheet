import React, { useState, useCallback, useMemo, useRef, useEffect } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from "@/components/ui/tooltip";
import { Copy, Check, Code, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export function CodeEditor({
  value = "",
  onChange,
  language = "json",
  readOnly = false,
  placeholder = "",
  maxHeight = 300,
  showLineNumbers = true,
  showFormatButton = true,
  showCopyButton = true,
  className,
  "data-testid": testId = "code-editor",
}) {
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState(null);
  const textareaRef = useRef(null);
  const lineNumbersRef = useRef(null);

  const lineCount = useMemo(() => {
    if (!value) return 1;
    return value.split("\n").length;
  }, [value]);

  const validateJson = useCallback((text) => {
    if (language !== "json" || !text.trim()) {
      setError(null);
      return true;
    }
    try {
      JSON.parse(text);
      setError(null);
      return true;
    } catch (e) {
      const errorMessage = e.message || "Invalid JSON";
      setError(errorMessage);
      return false;
    }
  }, [language]);

  useEffect(() => {
    validateJson(value);
  }, [value, validateJson]);

  const handleChange = useCallback((e) => {
    const newValue = e.target.value;
    onChange?.(newValue);
  }, [onChange]);

  const handleFormat = useCallback(() => {
    if (language !== "json" || !value.trim()) return;
    try {
      const parsed = JSON.parse(value);
      const formatted = JSON.stringify(parsed, null, 2);
      onChange?.(formatted);
    } catch (e) {
      // Don't format if invalid JSON
    }
  }, [value, onChange, language]);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
    }
  }, [value]);

  const handleScroll = useCallback((e) => {
    if (lineNumbersRef.current) {
      lineNumbersRef.current.scrollTop = e.target.scrollTop;
    }
  }, []);

  const hasError = Boolean(error);

  return (
    <TooltipProvider>
      <div
        className={cn(
          "rounded-xl border overflow-hidden shadow-sm",
          readOnly ? "bg-gray-50" : "bg-white",
          hasError ? "border-red-500" : "border-gray-200",
          className
        )}
        data-testid={testId}
      >
        {/* Toolbar */}
        <div className="flex items-center justify-between px-3 py-2 border-b border-gray-100 bg-gray-50/50">
          <div className="flex items-center gap-2">
            <span
              className="text-xs font-medium text-gray-500 uppercase tracking-wide"
              style={{ fontFamily: "Archivo, sans-serif" }}
            >
              {language}
            </span>
            {readOnly && (
              <span
                className="text-[10px] font-medium text-gray-400 bg-gray-200 px-1.5 py-0.5 rounded"
                style={{ fontFamily: "Archivo, sans-serif" }}
              >
                Read Only
              </span>
            )}
          </div>

          <div className="flex items-center gap-1">
            {showFormatButton && language === "json" && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-gray-400 hover:text-[#1C3693]"
                    onClick={handleFormat}
                    disabled={readOnly || !value.trim()}
                  >
                    <Code className="w-4 h-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Format JSON</TooltipContent>
              </Tooltip>
            )}

            {showCopyButton && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className={cn(
                      "h-7 w-7",
                      copied
                        ? "text-green-500"
                        : "text-gray-400 hover:text-[#1C3693]"
                    )}
                    onClick={handleCopy}
                    disabled={!value}
                  >
                    {copied ? (
                      <Check className="w-4 h-4" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>{copied ? "Copied!" : "Copy"}</TooltipContent>
              </Tooltip>
            )}
          </div>
        </div>

        {/* Editor */}
        <div className="relative flex" style={{ maxHeight }}>
          {/* Line Numbers */}
          {showLineNumbers && (
            <div
              ref={lineNumbersRef}
              className="flex-shrink-0 bg-gray-50 border-r border-gray-100 text-right overflow-hidden select-none"
              style={{
                width: "3rem",
                maxHeight,
              }}
            >
              <div className="p-2 pr-3">
                {Array.from({ length: lineCount }, (_, i) => (
                  <div
                    key={i}
                    className="text-xs text-gray-400 font-mono leading-5"
                  >
                    {i + 1}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Textarea */}
          <Textarea
            ref={textareaRef}
            value={value}
            onChange={handleChange}
            onScroll={handleScroll}
            placeholder={placeholder}
            readOnly={readOnly}
            className={cn(
              "flex-1 resize-none border-0 rounded-none shadow-none",
              "font-mono text-sm leading-5 p-2",
              "focus-visible:ring-0 focus-visible:ring-offset-0",
              "focus:outline-none focus:border-[#1C3693]",
              readOnly && "bg-gray-50 cursor-default"
            )}
            style={{
              minHeight: 80,
              maxHeight,
              overflowY: "auto",
            }}
          />
        </div>

        {/* Error Message */}
        {hasError && (
          <div className="flex items-center gap-2 px-3 py-2 bg-red-50 border-t border-red-100">
            <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
            <span
              className="text-xs text-red-600 truncate"
              style={{ fontFamily: "Archivo, sans-serif" }}
            >
              {error}
            </span>
          </div>
        )}
      </div>
    </TooltipProvider>
  );
}
