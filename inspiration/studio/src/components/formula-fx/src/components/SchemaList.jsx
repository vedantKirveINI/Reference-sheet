import React, { useState, useRef, useEffect } from "react";
import { getLucideIcon } from "@/components/icons";
import { cn } from "@/lib/utils";
import { NODE_VARIABLES } from "../constants/types.js";
import { checkTypeCompatibility } from "../utils/type-inference.js";

const CONVERSION_SUGGESTIONS = {
  "array→string": "Wrap with join() to convert to text",
  "object→string": "Wrap with tostring() to convert to text",
  "number→string": "Wrap with tostring() to convert to text",
  "string→number": "Wrap with tonumber() to convert",
  "array→number": "Use count() to get the count",
};

const ARRAY_HELPERS = [
  { label: "first()", fn: "first", desc: "Get first item" },
  { label: "count()", fn: "count", desc: "Count items" },
  { label: "join()", fn: "join", desc: "Join as text" },
];

export function SchemaList({
  node,
  depth = 0,
  parentKey = "",
  nodeId = "",
  parentContext = null,
  isChildOfArray = false,
  onClick = () => { },
  onHover = () => { },
  onInsertFormula = null,
  selectedBlockId = null,
  isVerbose = false,
  defaultExpanded = false,
  showArrayStructure = false,
  expectedType = "any",
}) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const [conversionHint, setConversionHint] = useState(null);
  const hintTimeoutRef = useRef(null);
  const childrenRef = useRef(null);
  // Question nodes: label → description → name → key; other nodes: label → name → description → key
  const nodeName =
    node.module === "Question"
      ? node.label || node.description || node.name || node.key
      : node.label || node.name || node.description || node.key;

  const typeCompat =
    expectedType && expectedType !== "any" && node.type
      ? checkTypeCompatibility(expectedType, node.type)
      : { compatible: true, severity: "none" };
  const isTypeIncompatible = !typeCompat.compatible;

  const extractPath = (node, { withArrayBrackets = false } = {}) => {
    let nodePath = node.path || [];
    if (nodePath[0] === "response") {
      nodePath = nodePath.slice(1);
    }
    if (node.label) {
      nodePath = [...nodePath];
      nodePath.splice(nodePath.length - 1, 1, node.label);
    }

    // Check if path already contains "0" (from child path adjustment)
    const pathHasIndex = nodePath.includes("0");

    // Check if we're inside array-of-objects
    const isInsideArrayOfObjects = parentContext?.isArrayOfObjects;

    // If withArrayBrackets is true, convert "0" and "[]" in path to "[0]" and "[]" in string
    if (withArrayBrackets && nodePath.length > 0) {
      const parts = nodePath.map((seg) => {
        if (seg === "[]") return "[]";
        if (seg === "0") return "[0]"; // Handle numeric index for array-of-objects
        return seg;
      });
      return `.${parts.join(".")}`.replace(/\.\[\]/g, "[]");
    }

    // If not using array brackets but inside array-of-objects and path doesn't have index yet,
    // only add an index for non-array nodes (i.e. fields inside the array), so that selecting
    // the root array itself never gains an implicit [0].
    if (
      isInsideArrayOfObjects &&
      node.type !== "array" &&
      nodePath.length > 0 &&
      !pathHasIndex
    ) {
      return `.[0].${nodePath.join(".")}`;
    }

    // Default: just join the path
    return nodePath.length > 0 ? `.${nodePath.join(".")}` : "";
  };

  const getBlockId = () => {
    const name = parentContext?.nodeName || nodeName;
    return `${name}${extractPath(node)}`;
  };

  const isCurrentlySelected = selectedBlockId === getBlockId();

  // Check if node has displayable children
  const hasDisplayableChildren =
    node.schema?.length > 0 &&
    (node.type !== "array" ||
      node.schema[0]?.type === "object" ||
      node.schema[0]?.type === "array") &&
    (showArrayStructure || node.type !== "array");

  const isClickable =
    Array.isArray(node.path) && node.path.length > 0 && !isTypeIncompatible;

  // Handle the schema structure from the data
  const schemaData = node.schema || [];

  const buildBlockData = (isRawData = false) => {
    const nodeNameForData = parentContext?.nodeName || nodeName;

    // Check if we're inside an array-of-objects
    const isInsideArrayOfObjects = parentContext?.isArrayOfObjects;

    // Build path string
    const pathStr = isChildOfArray
      ? extractPath(node, { withArrayBrackets: true })
      : extractPath(node);

    // Update path arrays
    let updatedPath = [...(node.path || [])];
    let updatedPathStr = node.pathStr || "";
    let originalPath = undefined;

    // Check if path already contains "0" (from child path adjustment)
    const pathAlreadyHasIndex = updatedPath.includes("0");

    // Only add an index to paths for non-array nodes (fields inside the array). Root array
    // variables should keep their original path so they don't serialize as array[0].
    if (isInsideArrayOfObjects && node.type !== "array" && updatedPath.length > 0) {
      if (!pathAlreadyHasIndex) {
        // Store original path for reference (before adding "0")
        originalPath = [...updatedPath];

        // Insert "0" before the last element (key name)
        const insertIndex = updatedPath.length - 1;
        updatedPath = [
          ...updatedPath.slice(0, insertIndex),
          "0",
          ...updatedPath.slice(insertIndex),
        ];
      } else {
        // Path already has "0" from child path adjustment
        // Store original path by removing "0" elements
        originalPath = updatedPath.filter((seg) => seg !== "0" && seg !== "[]");
      }

      // Update pathStr to include [0] if not already present
      if (updatedPathStr && !updatedPathStr.includes("[0]")) {
        const pathParts = updatedPathStr.split(".");
        // Find the position to insert [0] - should be before the last segment
        const lastIndex = pathParts.length - 1;
        if (lastIndex >= 0) {
          pathParts.splice(lastIndex, 0, "[0]");
          updatedPathStr = pathParts.join(".");
        }
      }
    }

    return {
      subCategory: NODE_VARIABLES,
      type: NODE_VARIABLES,
      subType: `${nodeNameForData}${pathStr}`,
      value: `${nodeNameForData}${pathStr}`,
      description: node.description || `Variable: ${nodeName}`,
      returnType: isRawData ? "json" : node.type || "any",
      background: node.background || parentContext?.background,
      foreground: node.foreground || parentContext?.foreground,
      nodeNumber: node.nodeNumber || parentContext?.nodeNumber,
      isInsideArray: isChildOfArray,
      variableData: {
        schema: node.schema,
        key: node.key,
        label: node.label,
        module: node.module,
        type: node.type,
        sample_value: node.default,
        default: node.default,
        path: updatedPath,
        pathStr: updatedPathStr,
        nodeName: nodeNameForData,
        nodeId: `${parentContext?.nodeId || node.nodeId}`,
        nodeType: node.nodeType,
        ...(originalPath && { originalPath }), // Store original for validation
      },
    };
  };

  const handleHover = () => {
    onHover(buildBlockData(false));
  };

  const handleClick = (e, isRawData = false) => {
    e.preventDefault();
    if (isTypeIncompatible && !isRawData) {
      const suggestionKey = `${node.type}→${expectedType}`;
      const suggestion = CONVERSION_SUGGESTIONS[suggestionKey];
      if (suggestion) {
        if (hintTimeoutRef.current) clearTimeout(hintTimeoutRef.current);
        setConversionHint(suggestion);
        hintTimeoutRef.current = setTimeout(
          () => setConversionHint(null),
          3000,
        );
      }
      return;
    }
    if (isClickable) e.stopPropagation();
    if (!isClickable && !isRawData) {
      if (hasDisplayableChildren) {
        setIsExpanded(!isExpanded);
      } else {
        // Leaf node (no expandable schema): select it
        onClick(buildBlockData(false));
      }
      return;
    }
    if (
      hasDisplayableChildren &&
      (node.type === "object" || node.type === "array")
    ) {
      setIsExpanded(!isExpanded);
    }
    onClick(buildBlockData(isRawData));
  };

  useEffect(() => {
    return () => {
      if (hintTimeoutRef.current) clearTimeout(hintTimeoutRef.current);
    };
  }, []);

  useEffect(() => {
    let timeoutId = null;
    if (isExpanded && childrenRef.current) {
      timeoutId = setTimeout(() => {
        childrenRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "nearest",
        });
      }, 100);
    }
    return () => clearTimeout(timeoutId);
  }, [isExpanded]);


  return (
    <div className="w-full">
      <div className="mb-1 flex items-center gap-0.5">
        <div
          className={cn(
            "text-sm rounded-md flex items-center gap-1.5 w-full box-border overflow-hidden py-1.5 px-2 bg-transparent text-foreground",
            isTypeIncompatible
              ? "opacity-40 cursor-not-allowed"
              : isClickable
                ? "cursor-pointer hover:bg-muted"
                : "cursor-default hover:bg-black/[0.02]",
            isCurrentlySelected && "bg-muted",
          )}
          onClick={handleClick}
          onMouseEnter={handleHover}
          role={isClickable ? "button" : undefined}
          tabIndex={isClickable ? 0 : undefined}
          title={isTypeIncompatible ? typeCompat.message : undefined}
        >
          <span
            className="flex-1 truncate text-sm font-medium text-foreground"
            title={nodeName}
          >
            {node.nodeNumber ? `${node.nodeNumber}. ${nodeName}` : nodeName}
          </span>
          {node.module !== "Question" && (
            <span
              className={cn(
                "text-[10px] py-0.5 px-1.5 rounded-full flex-shrink-0 font-medium leading-tight",
                node.type === "object"
                  ? "text-violet-600 bg-violet-100"
                  : node.type === "array"
                    ? "text-blue-600 bg-blue-100"
                    : expectedType === "any" || !expectedType
                      ? "text-muted-foreground bg-muted"
                      : isTypeIncompatible
                        ? "bg-red-100 text-red-500 line-through"
                        : typeCompat.severity === "warning"
                          ? "bg-amber-100 text-amber-700"
                          : "bg-green-100 text-green-700",
              )}
            >
              {node.type === "object"
                ? "{ }"
                : node.type === "array"
                  ? "[ ]"
                  : node.type}
            </span>
          )}
        </div>
        {hasDisplayableChildren && (
          <div
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setIsExpanded(!isExpanded);
            }}
            className="flex size-4 cursor-pointer items-center justify-center rounded text-muted-foreground hover:bg-muted"
          >
            {getLucideIcon("OUTEChevronRightIcon", {
              className: cn("w-3 h-3", isExpanded ? "rotate-90" : "rotate-0"),
            })}
          </div>
        )}
      </div>
      {node.type === "array" && isExpanded && onInsertFormula && (
        <div className="mb-1 ml-3 mt-0.5 flex items-center gap-1">
          {ARRAY_HELPERS.map((helper) => {
            const blockData = buildBlockData(false);
            const varRef = blockData.value;
            return (
              <button
                key={helper.fn}
                type="button"
                className="rounded border border-blue-200 bg-blue-50 px-1.5 py-0.5 text-[10px] font-medium text-blue-700 transition-colors hover:border-blue-300 hover:bg-blue-100"
                title={helper.desc}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  const formula =
                    helper.fn === "join"
                      ? `join({{${varRef}}}, ", ")`
                      : `${helper.fn}({{${varRef}}})`;
                  onInsertFormula(formula);
                }}
              >
                {helper.label}
              </button>
            );
          })}
        </div>
      )}
      <div
        ref={childrenRef}
        className={cn(
          "border-l border-border ml-2.5 overflow-hidden scroll-mt-2",
          isExpanded
            ? "visible max-h-[100rem] opacity-100"
            : "invisible max-h-0 opacity-0",
        )}
      >
        {/* Raw Data child for objects when isVerbose is true */}
        {isVerbose &&
          node.type === "object" &&
          node.path &&
          node.path.length > 0 && (
            <div key={`${parentKey}_raw_data`} className="ml-2 mt-1">
              <div className="mb-1 flex items-center gap-0.5">
                <div
                  className="ml-2.5 flex w-full cursor-pointer items-center gap-1.5 rounded-md bg-transparent px-2 py-1.5 text-sm text-foreground hover:bg-muted"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleClick(e, true);
                  }}
                  role="button"
                  tabIndex={0}
                >
                  <span
                    className="flex-1 truncate text-xs font-medium text-foreground"
                    title="Raw Data"
                  >
                    {node.pathStr || `{Raw Data}`}
                  </span>
                  <span className="shrink-0 rounded-full bg-muted px-1.5 py-0.5 text-[10px] font-medium leading-tight text-muted-foreground">
                    json
                  </span>
                </div>
              </div>
            </div>
          )}
        {conversionHint && (
          <div className="mb-1 ml-2.5 rounded border border-amber-200 bg-amber-50 px-2 py-1 text-[10px] text-amber-700 duration-200 animate-in fade-in">
            {getLucideIcon("Lightbulb", { size: 12 })} {conversionHint}
          </div>
        )}
        {schemaData.map((child) => {
          if (
            node.type === "array" &&
            child.type !== "object" &&
            child.type !== "array"
          ) {
            return null;
          }
          const schemaToShow =
            node.type === "array" && child.type === "object"
              ? child.schema
              : [child];

          return schemaToShow.map((schemaItem, schemaIndex) => {
            const childKey = `${parentKey}_${schemaItem.key || `child_${schemaIndex}`
              }`;
            const childIsInsideArray = isChildOfArray || node.type === "array";
            const childPath = schemaItem.path || [];
            // Check if current node is array-of-objects
            const isCurrentNodeArrayOfObjects =
              node.type === "array" && node.schema?.[0]?.type === "object";
            const adjustedPath =
              node.type === "array" &&
                childPath.length > 0 &&
                !childPath.includes("[]") &&
                !childPath.includes("0")
                ? (() => {
                  const parentPathLen = (node.path || []).length;
                  const insertIdx = parentPathLen > 0 ? parentPathLen : 0;
                  const p = [...childPath];
                  // Insert "0" for array-of-objects, "[]" for regular arrays
                  p.splice(insertIdx, 0, isCurrentNodeArrayOfObjects ? "0" : "[]");
                  return p;
                })()
                : childPath;
            return (
              <div key={childKey} className="ml-2 mt-1">
                <SchemaList
                  node={{
                    ...schemaItem,
                    path: adjustedPath,
                    background: node.background,
                    foreground: node.foreground,
                    nodeId: node.nodeId,
                    module: node.module,
                    nodeType: node.nodeType,
                  }}
                  depth={depth + 1}
                  parentKey={childKey}
                  nodeId={nodeId}
                  parentContext={{
                    ...parentContext,
                    nodeName: parentContext?.nodeName || nodeName,
                    background: node.background,
                    foreground: node.foreground,
                    nodeId: node.nodeId,
                    nodeNumber: parentContext?.nodeNumber || node.nodeNumber,
                    isArrayOfObjects:
                      node.type === "array" && node.schema?.[0]?.type === "object",
                  }}
                  isChildOfArray={childIsInsideArray}
                  onClick={onClick}
                  onHover={onHover}
                  onInsertFormula={onInsertFormula}
                  selectedBlockId={selectedBlockId}
                  isVerbose={isVerbose}
                  showArrayStructure={showArrayStructure}
                  expectedType={expectedType}
                />
              </div>
            );
          });
        })}
      </div>
    </div>
  );
}
