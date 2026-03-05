import React, { useState, useEffect, useRef, memo, useCallback } from "react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { getLucideIcon } from "@/components/icons";
import { generateSampleDataForBlocks } from "../utils/sample-data-generator.js";
import utility from "oute-services-flow-utility-sdk";
import debounce from "lodash/debounce";
import { transformFormulaError } from "../utils/error-message-transformer.js";

const EVALUATION_DEBOUNCE_MS = 300;

const LivePreview = memo(({ 
  content = [], 
  isVisible = true,
  compact = false,
  expectedType = "any",
}) => {
  const [result, setResult] = useState(null);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [sampleData, setSampleData] = useState({});
  const lastContentRef = useRef(null);

  const evaluateFormula = useCallback(async (blocks) => {
    if (!blocks || blocks.length === 0) {
      setResult(null);
      return;
    }

    const blocksWithoutPrimitiveOnly = blocks.filter(
      b => b && b.type !== "PRIMITIVES"
    );
    
    if (blocksWithoutPrimitiveOnly.length === 0 && blocks.length === 1) {
      const primitiveValue = blocks[0]?.value;
      if (primitiveValue !== undefined && primitiveValue !== "") {
        setResult({
          success: true,
          value: primitiveValue,
          type: typeof primitiveValue,
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

  const hasVariables = content.some(block => 
    block?.type === "NODE" || 
    block?.subCategory === "NODE" ||
    block?.subCategory === "LOCAL" ||
    block?.subCategory === "GLOBAL" ||
    block?.variableData
  );

  const formatValue = (value) => {
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

  const getTypeBadgeColor = (type) => {
    switch (type) {
      case "string": return "bg-blue-100 text-blue-700";
      case "number": return "bg-emerald-100 text-emerald-700";
      case "boolean": return "bg-purple-100 text-purple-700";
      case "array": return "bg-orange-100 text-orange-700";
      case "object": return "bg-amber-100 text-amber-700";
      case "null": return "bg-gray-100 text-gray-500";
      default: return "bg-gray-100 text-gray-600";
    }
  };

  return (
    <div className={cn(
      "border-t border-gray-100 bg-gray-50/50",
      compact ? "px-2 py-1.5" : "px-3 py-2"
    )}>
      <div className="flex items-center justify-between gap-2 mb-1.5">
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] uppercase tracking-wide text-gray-400 font-medium">
            Live Preview
          </span>
          {isEvaluating && (
            <div className="flex items-center gap-1 text-gray-400">
              {getLucideIcon("OUTELoaderIcon", { 
                size: 10, 
                className: "animate-spin" 
              })}
            </div>
          )}
        </div>
        {result?.success && result.type && (
          <Badge 
            variant="secondary" 
            className={cn(
              "text-[9px] px-1.5 py-0 h-4 font-medium border-0",
              getTypeBadgeColor(result.type)
            )}
          >
            {result.type}
          </Badge>
        )}
      </div>

      <div className={cn(
        "rounded-md text-xs font-mono",
        compact ? "p-1.5" : "p-2",
        result?.success 
          ? "bg-white border border-gray-200" 
          : result?.error 
            ? "bg-red-50 border border-red-200"
            : "bg-white border border-gray-200"
      )}>
        {isEvaluating && !result ? (
          <span className="text-gray-400 italic">Evaluating...</span>
        ) : result?.success ? (
          <div className="break-all whitespace-pre-wrap text-gray-700">
            {formatValue(result.value)}
          </div>
        ) : result?.error ? (
          <div className="flex items-start gap-1.5 text-red-600">
            {getLucideIcon("AlertCircle", { size: 12, className: "mt-0.5 flex-shrink-0" })}
            <span>{result.error}</span>
          </div>
        ) : (
          <span className="text-gray-400 italic">
            {content.length === 0 
              ? "Enter a formula to see preview" 
              : "Type to see result..."}
          </span>
        )}
      </div>

      {hasVariables && Object.keys(sampleData).length > 0 && result?.success && (
        <div className="mt-1.5">
          <div className="flex items-center gap-1 text-[9px] text-gray-400 mb-1">
            {getLucideIcon("Sparkles", { size: 9 })}
            <span>Using sample data:</span>
          </div>
          <div className="flex flex-wrap gap-1">
            {Object.entries(sampleData).slice(0, 3).map(([key, value]) => (
              <span 
                key={key}
                className="inline-flex items-center gap-1 bg-gray-100 text-gray-600 text-[9px] px-1.5 py-0.5 rounded"
              >
                <span className="text-gray-400">{key}:</span>
                <span className="font-medium truncate max-w-[80px]">
                  {typeof value === "object" ? "..." : String(value)}
                </span>
              </span>
            ))}
            {Object.keys(sampleData).length > 3 && (
              <span className="text-[9px] text-gray-400">
                +{Object.keys(sampleData).length - 3} more
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
});

LivePreview.displayName = "LivePreview";

export default LivePreview;
