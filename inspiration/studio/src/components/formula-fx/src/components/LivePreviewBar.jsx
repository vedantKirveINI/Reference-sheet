import React, { useState, useEffect, useRef, memo, useCallback, useMemo } from "react";
import { cn } from "@/lib/utils";
import { getLucideIcon } from "@/components/icons";
import { generateSampleDataForBlocks } from "../utils/sample-data-generator.js";
import { checkTypeCompatibility, inferFormulaResultType, SEVERITY_LEVELS } from "../utils/type-inference.js";
import utility from "oute-services-flow-utility-sdk";
import debounce from "lodash/debounce";
import { transformFormulaError } from "../utils/error-message-transformer.js";
import { validate } from "oute-services-fx-validator-sdk";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const EVALUATION_DEBOUNCE_MS = 300;

const LivePreviewBar = memo(({
  content = [],
  isVisible = true,
  expectedType = "any",
  selectedFunction = null,
}) => {
  const [result, setResult] = useState(null);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [sampleData, setSampleData] = useState({});
  const [isExpanded, setIsExpanded] = useState(false);
  const lastContentRef = useRef(null);


  const evaluateFormula = useCallback(async (blocks) => {
    if (!blocks || blocks.length === 0) {
      setResult(null);
      return;
    }

    const blocksWithoutPrimitiveOnly = blocks.filter(
      b => b && b.type !== "PRIMITIVES"
    );

    let actualType = "any";
    try {
      const validationResult = validate(blocks);
      // Convert SDK return_type to lowercase to match your type system
      actualType = (validationResult?.return_type || "ANY").toLowerCase();
    } catch (error) {
      // If validation fails, fall back to "any"
      console.warn("Validation error:", error);
      actualType = "any";
    }

    if (blocksWithoutPrimitiveOnly.length === 0 && blocks.length === 1) {
      const primitiveValue = blocks[0]?.value;
      if (primitiveValue !== undefined && primitiveValue !== "") {
        setResult({
          success: true,
          value: primitiveValue,
          type: actualType,
        });
      } else {
        setResult(null);
      }
      return;
    }

    setIsEvaluating(true);

    try {
      const samples = generateSampleDataForBlocks(blocks);
      setSampleData(samples);

      const blocksWithSamples = blocks.map(block => {
        if (!block) return block;

        const isVariable =
          block.type === "NODE" ||
          block.subCategory === "NODE" ||
          block.subCategory === "LOCAL" ||
          block.subCategory === "GLOBAL" ||
          block.variableData;

        if (isVariable) {
          const key = block.value || block.displayValue || block.name;
          if (key && samples[key] !== undefined) {
            return {
              ...block,
              testValue: samples[key],
            };
          }
        }
        return block;
      });

      const output = await utility.resolveValue(
        {},
        "evaluatedOutput",
        {
          type: "fx",
          blocks: blocksWithSamples,
        },
        undefined,
        undefined,
        undefined,
        { use_default: true }
      );

      const resultType = typeof output?.value;
      let displayType = resultType;
      if (Array.isArray(output?.value)) displayType = "array";
      else if (output?.value === null) displayType = "null";
      else if (resultType === "object") displayType = "object";

      setResult({
        success: true,
        value: output?.value,
        type: displayType,
      });
    } catch (error) {
      console.error('[LivePreviewBar] Evaluation error:', error);
      setResult({
        success: false,
        error: transformFormulaError(error),
        type: null,
      });
    } finally {
      setIsEvaluating(false);
    }
  }, []);


  const debouncedEvaluate = useRef(
    debounce((blocks) => {
      evaluateFormula(blocks);
    }, EVALUATION_DEBOUNCE_MS)
  ).current;

  useEffect(() => {
    return () => {
      debouncedEvaluate.cancel();
    };
  }, [debouncedEvaluate]);

  useEffect(() => {
    if (!isVisible || !content) {
      return;
    }

    const contentStr = JSON.stringify(content);
    if (contentStr === lastContentRef.current) {
      return;
    }
    lastContentRef.current = contentStr;

    if (content.length === 0) {
      setResult(null);
      return;
    }

    debouncedEvaluate(content);
  }, [content, isVisible, debouncedEvaluate]);

  if (!isVisible) {
    return null;
  }

  const formatValue = (value) => {
    if (value === undefined) return "undefined";
    if (value === null) return "null";
    if (typeof value === "boolean") return value ? "true" : "false";
    if (typeof value === "object") {
      try {
        const str = JSON.stringify(value);
        return str.length > 60 ? str.substring(0, 57) + "..." : str;
      } catch {
        return String(value);
      }
    }
    const str = String(value);
    return str.length > 80 ? str.substring(0, 77) + "..." : str;
  };

  const getFullValue = (value) => {
    if (value === undefined) return "undefined";
    if (value === null) return "null";
    if (typeof value === "boolean") return value ? "true" : "false";
    if (typeof value === "object") {
      try {
        return JSON.stringify(value, null, 2);
      } catch {
        return String(value);
      }
    }
    return String(value);
  };

  const getTypeLabel = (type) => {
    if (!type) return null;
    const labels = {
      string: "Text",
      number: "Number",
      boolean: "Boolean",
      array: "Array",
      object: "Object",
      null: "Null",
    };
    return labels[type] || type;
  };

  const hasSampleData = Object.keys(sampleData).length > 0;
  const sampleEntries = Object.entries(sampleData).slice(0, 6);
  const isLongResult = result?.success && getFullValue(result.value).length > 80;

  const contentStr = content.map(b => b?.value || b?.displayValue || "").join("");
  const isShortSearchString = contentStr.length < 20 && contentStr.length > 0;
  const showFunctionHint = selectedFunction && isShortSearchString && result?.success && result.type === "string" && String(result.value) === contentStr;
  const functionHintName = selectedFunction?.displayValue || selectedFunction?.value || selectedFunction?.name;
  const functionHintArgs = selectedFunction?.args;
  const functionHintTemplate = functionHintName
    ? `${functionHintName}(${(functionHintArgs || []).map(a => a.name || "value").join(", ")}${(!functionHintArgs || functionHintArgs.length === 0) ? "" : ""})`
    : null;

  const typeValidation = useMemo(() => {
    if (!result?.success || !expectedType || expectedType === "any") {
      return null;
    }

    const actualType = result.type;
    if (!actualType || actualType === "any") {
      return null;
    }

    const compatibility = checkTypeCompatibility(expectedType, actualType);

    if (compatibility.compatible && compatibility.severity === SEVERITY_LEVELS.NONE) {
      return null;
    }

    return {
      severity: compatibility.severity,
      message: compatibility.message,
      expectedType,
      actualType,
    };
  }, [result, expectedType]);

  const getStatusColor = () => {
    if (isEvaluating) return "text-blue-500";
    if (typeValidation?.severity === SEVERITY_LEVELS.ERROR) return "text-red-500";
    if (typeValidation?.severity === SEVERITY_LEVELS.WARNING) return "text-amber-500";
    if (result?.success) return "text-emerald-500";
    if (result?.error) return "text-red-500";
    return "text-gray-400";
  };

  const getStatusBg = () => {
    if (isEvaluating) return "bg-blue-50 border-blue-100";
    if (typeValidation?.severity === SEVERITY_LEVELS.ERROR) return "bg-red-50 border-red-100";
    if (typeValidation?.severity === SEVERITY_LEVELS.WARNING) return "bg-amber-50 border-amber-100";
    if (result?.success) return "bg-emerald-50 border-emerald-100";
    if (result?.error) return "bg-red-50 border-red-100";
    return "bg-gray-50 border-gray-100";
  };

  const getStatusIcon = () => {
    if (isEvaluating) {
      return getLucideIcon("OUTELoaderIcon", {
        size: 14,
        className: "animate-spin text-blue-500"
      });
    }
    if (typeValidation?.severity === SEVERITY_LEVELS.ERROR) {
      return getLucideIcon("AlertCircle", { size: 14, className: "text-red-500" });
    }
    if (typeValidation?.severity === SEVERITY_LEVELS.WARNING) {
      return getLucideIcon("AlertTriangle", { size: 14, className: "text-amber-500" });
    }
    if (result?.success) {
      return getLucideIcon("CheckCircle2", { size: 14, className: "text-emerald-500" });
    }
    if (result?.error) {
      return getLucideIcon("XCircle", { size: 14, className: "text-red-500" });
    }
    return getLucideIcon("MinusCircle", { size: 14, className: "text-gray-400" });
  };

  const getStatusText = () => {
    if (isEvaluating) return "Evaluating";
    if (result?.success) return "Result";
    if (result?.error) return "Error";
    return content.length === 0 ? "No formula" : "Pending";
  };

  if (showFunctionHint && functionHintTemplate) {
    return (
      <div className="mx-2 my-1.5 rounded-xl border overflow-hidden transition-all duration-200 bg-indigo-50 border-indigo-100">
        <div className="flex gap-2.5 px-3.5 py-2 items-center select-none">
          <span className="flex-shrink-0 text-indigo-500">
            {getLucideIcon("Lightbulb", { size: 14 })}
          </span>
          <span className="text-[12px] text-indigo-600 font-medium">
            Tip: Click to insert <span className="font-semibold">{functionHintTemplate}</span>
          </span>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "mx-2 my-1.5 rounded-xl border overflow-hidden transition-all duration-200",
        getStatusBg()
      )}
    >
      <div
        className={cn(
          "flex gap-2.5 px-3.5 py-2 cursor-pointer select-none",
          result?.error ? "items-start" : "items-center"
        )}
        onClick={() => {
          if (result?.success || result?.error || hasSampleData) {
            setIsExpanded(!isExpanded);
          }
        }}
      >
        <div className="flex items-center gap-2 flex-shrink-0 mt-px">
          {getStatusIcon()}
          <span className={cn("text-[11px] font-semibold uppercase tracking-wider", getStatusColor())}>
            {getStatusText()}
          </span>
        </div>

        <div className="w-px h-3.5 bg-current opacity-15 flex-shrink-0" />

        <div className="flex items-center gap-2 min-w-0 flex-1">
          {isEvaluating && !result ? (
            <span className="text-[12px] text-gray-500 italic">
              Computing preview...
            </span>
          ) : result?.success ? (
            <TooltipProvider delayDuration={300}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="text-gray-800 truncate text-[12px] font-medium leading-relaxed cursor-default whitespace-pre-wrap">
                    {formatValue(result.value)}
                  </span>
                </TooltipTrigger>
                <TooltipContent
                  side="bottom"
                  className="max-w-sm text-xs p-3 whitespace-pre-wrap bg-white border border-gray-200 shadow-lg rounded-lg"
                  style={{ fontFamily: "Inter, system-ui, sans-serif" }}
                >
                  {getFullValue(result.value)}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          ) : result?.error ? (
            <span className="text-red-600 text-[12px] break-words whitespace-normal">
              {result.error}
            </span>
          ) : (
            <span className="text-gray-400 text-[12px]">
              {content.length === 0
                ? "Enter a formula to see preview"
                : "Computing..."}
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5 flex-shrink-0">
          {result?.type && (
            <TooltipProvider delayDuration={200}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className={cn(
                    "text-[10px] px-2 py-0.5 rounded-full font-medium flex items-center gap-1 transition-colors",
                    typeValidation?.severity === SEVERITY_LEVELS.ERROR
                      ? "bg-red-100 text-red-600"
                      : typeValidation?.severity === SEVERITY_LEVELS.WARNING
                        ? "bg-amber-100 text-amber-600"
                        : "bg-emerald-100 text-emerald-700"
                  )}>
                    {typeValidation?.severity === SEVERITY_LEVELS.ERROR && getLucideIcon("AlertCircle", { size: 9 })}
                    {typeValidation?.severity === SEVERITY_LEVELS.WARNING && getLucideIcon("AlertTriangle", { size: 9 })}
                    {getTypeLabel(result.type)}
                  </span>
                </TooltipTrigger>
                {typeValidation && (
                  <TooltipContent
                    side="bottom"
                    className={cn(
                      "text-xs p-2.5 max-w-xs rounded-lg",
                      typeValidation.severity === SEVERITY_LEVELS.ERROR
                        ? "bg-red-50 border-red-200 text-red-700"
                        : "bg-amber-50 border-amber-200 text-amber-700"
                    )}
                  >
                    <div className="font-semibold mb-1">
                      {typeValidation.severity === SEVERITY_LEVELS.ERROR ? "Type Mismatch" : "Type Warning"}
                    </div>
                    <div className="leading-relaxed">{typeValidation.message}</div>
                    <div className="mt-1.5 text-[10px] opacity-75">
                      Expected: {getTypeLabel(typeValidation.expectedType)} | Got: {getTypeLabel(typeValidation.actualType)}
                    </div>
                  </TooltipContent>
                )}
              </Tooltip>
            </TooltipProvider>
          )}

          {hasSampleData && result?.success && (
            <TooltipProvider delayDuration={200}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-violet-100 text-violet-600 cursor-default hover:bg-violet-200 transition-colors">
                    {getLucideIcon("FlaskConical", { size: 10 })}
                    <span className="text-[9px] font-semibold">Sample</span>
                  </span>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="text-xs p-3 bg-white border border-gray-200 shadow-lg rounded-lg max-w-xs">
                  <div className="font-semibold text-gray-700 text-[11px] mb-2">Sample data used for preview</div>
                  <div className="space-y-1">
                    {sampleEntries.map(([key, value]) => (
                      <div key={key} className="flex gap-2 text-[11px]">
                        <span className="text-gray-500 flex-shrink-0">{key}:</span>
                        <span className="text-gray-700 truncate">
                          {typeof value === "object" ? JSON.stringify(value) : String(value)}
                        </span>
                      </div>
                    ))}
                  </div>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}

          {(isLongResult || result?.error || hasSampleData) && (
            <button
              className="flex items-center justify-center w-5 h-5 rounded-md hover:bg-black/5 transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                setIsExpanded(!isExpanded);
              }}
            >
              {getLucideIcon(isExpanded ? "ChevronUp" : "ChevronDown", {
                size: 12,
                className: "text-gray-400"
              })}
            </button>
          )}
        </div>
      </div>

      {isExpanded && (
        <div className="border-t border-current/5 bg-white/60">
          {result?.success && (
            <div className="px-3.5 py-2.5">
              <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Full Output</div>
              <div className="bg-gray-50 rounded-lg p-2.5 overflow-auto max-h-32 border border-gray-100">
                <pre className="text-[11px] text-gray-700 whitespace-pre-wrap break-words leading-relaxed" style={{ fontFamily: "Inter, system-ui, sans-serif" }}>
                  {getFullValue(result.value)}
                </pre>
              </div>
            </div>
          )}

          {result?.error && (
            <div className="px-3.5 py-2.5">
              <div className="text-[10px] font-semibold text-red-400 uppercase tracking-wider mb-1.5">Error Details</div>
              <div className="bg-red-50 rounded-lg p-2.5 border border-red-100">
                <p className="text-[11px] text-red-600 leading-relaxed">{result.error}</p>
              </div>
            </div>
          )}

          {hasSampleData && (
            <div className={cn("px-3.5 py-2.5", (result?.success || result?.error) && "border-t border-gray-100")}>
              <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Sample Data</div>
              <div className="grid gap-1">
                {sampleEntries.map(([key, value]) => (
                  <div key={key} className="flex items-center gap-2 text-[11px] px-2 py-1 rounded-md bg-gray-50">
                    <span className="text-violet-600 font-medium flex-shrink-0">{key}</span>
                    <span className="text-gray-400 flex-shrink-0">=</span>
                    <span className="text-gray-600 truncate">
                      {typeof value === "object" ? JSON.stringify(value) : String(value)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
});

LivePreviewBar.displayName = "LivePreviewBar";

export default LivePreviewBar;
