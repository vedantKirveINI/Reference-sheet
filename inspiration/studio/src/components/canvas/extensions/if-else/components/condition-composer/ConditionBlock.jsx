import React, { useCallback, useMemo, useRef } from "react";
import { Trash2, ChevronDown, ChevronUp, MessageSquare, Link2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ConditionComposerV2 } from "@src/module/condition-composer-v2";
import MoveToSelector from "./MoveToSelector";
import { uniqueId } from "lodash";

const BLOCK_TYPES = {
  IF: "if",
  ELSE_IF: "else_if",
  ELSE: "else",
};

const BLOCK_STYLES = {
  [BLOCK_TYPES.IF]: {
    label: "IF",
    badgeClass: "bg-blue-600 text-white",
    borderClass: "border-blue-200",
    headerClass: "bg-blue-50",
  },
  [BLOCK_TYPES.ELSE_IF]: {
    label: "ELSE IF",
    badgeClass: "bg-purple-600 text-white",
    borderClass: "border-purple-200",
    headerClass: "bg-purple-50",
  },
  [BLOCK_TYPES.ELSE]: {
    label: "ELSE",
    badgeClass: "bg-gray-600 text-white",
    borderClass: "border-gray-300",
    headerClass: "bg-gray-100",
  },
};

const createEmptyGroup = () => ({
  id: uniqueId("group_"),
  condition: "and",
  childs: [],
});

const variablesToSchema = (variables) => {
  if (!variables) return [];
  
  const schema = [];
  
  const extractOptions = (varItem) => {
    const opts = varItem.options || varItem.go_data?.options || varItem.choices || [];
    return opts;
  };
  
  const processNode = (varItem) => {
    if (!varItem || typeof varItem !== "object") return;
    const fieldOptions = extractOptions(varItem);
    const nodeKey = varItem.key || varItem.field;
    const nodeType = varItem.type || "TEXT";
    const nodeLabel = varItem.label || varItem.description || varItem.name || nodeKey;
    schema.push({
      name: nodeKey,
      field: nodeKey,
      type: nodeType,
      label: nodeLabel,
      options: fieldOptions,
      description: varItem.description || varItem.name || nodeLabel,
      nodeNumber: varItem.nodeNumber,
      background: varItem.background || "linear-gradient(196deg, #5C6BC0 2.15%, #7986CB 77.96%)",
      foreground: varItem.foreground || "#fff",
      _src: varItem._src,
    });
  };
  
  const nodes = variables?.NODE;
  if (Array.isArray(nodes)) {
    nodes.forEach(processNode);
  } else if (typeof variables === "object") {
    Object.entries(variables).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        value.forEach(processNode);
      }
    });
  }
  
  return schema;
};

const ConditionBlock = ({
  block,
  blockIndex = 0,
  variables = {},
  jumpToOptions = [],
  usedJumpToKeys = new Set(),
  canDelete = true,
  onUpdate,
  onDelete,
  onAddNode,
  conditionSummary = "",
  validationErrors = [],
  dataTestId = "condition-block",
}) => {
  const [isOpen, setIsOpen] = React.useState(true);
  const [showAnnotation, setShowAnnotation] = React.useState(false);
  const composerRef = useRef();
  const { type, conditionGroup, moveTo, annotation } = block;
  const styles = BLOCK_STYLES[type] || BLOCK_STYLES[BLOCK_TYPES.IF];
  const isElse = type === BLOCK_TYPES.ELSE;

  const schema = useMemo(() => variablesToSchema(variables), [variables]);
  
  const hasVariables = useMemo(() => {
    // Check schema length - this is what the composer actually uses
    // Schema is derived from variables, so if schema is empty, there's nothing to filter on
    return schema && schema.length > 0;
  }, [schema]);

  const handleConditionChange = useCallback((updatedCondition, whereClauseStr) => {
    onUpdate({ 
      ...block, 
      conditionGroup: updatedCondition,
      conditionStr: whereClauseStr,
    });
  }, [block, onUpdate]);

  const handleMoveToChange = useCallback((newMoveTo) => {
    onUpdate({ ...block, moveTo: newMoveTo });
  }, [block, onUpdate]);

  const handleAnnotationChange = useCallback((e) => {
    onUpdate({ ...block, annotation: e.target.value });
  }, [block, onUpdate]);

  const handleAddNode = useCallback(() => {
    if (onAddNode) {
      const blockContext = {
        blockId: block.id,
        blockType: type,
        blockIndex: blockIndex,
      };
      onAddNode(blockContext);
    }
  }, [onAddNode, block.id, blockIndex, type]);

  const conditionCount = conditionGroup?.childs?.length || 0;
  const needsAttention = validationErrors.length > 0;

  return (
    <div
      className={cn(
        "rounded-xl border overflow-hidden transition-colors duration-200",
        needsAttention ? "border-amber-300" : styles.borderClass
      )}
      data-testid={dataTestId}
    >
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <div className={cn(
          "px-4 py-3",
          styles.headerClass
        )}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className={cn(
                "text-xs font-bold px-2 py-1 rounded",
                styles.badgeClass
              )}>
                {styles.label}
              </span>
              {!isOpen && !isElse && (
                <span className="text-xs text-gray-500">
                  {conditionCount} condition{conditionCount !== 1 ? "s" : ""}
                </span>
              )}
              {isElse && !isOpen && (
                <span className="text-xs text-gray-500">
                  Fallback path
                </span>
              )}
            </div>

            <div className="flex items-center gap-1">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => setShowAnnotation(!showAnnotation)}
                className={cn(
                  "h-7 w-7",
                  annotation ? "text-blue-500" : "text-gray-400 hover:text-gray-600"
                )}
                title="Add annotation"
              >
                <MessageSquare className="h-3.5 w-3.5" />
              </Button>
              {canDelete && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={onDelete}
                  className="h-7 w-7 text-gray-400 hover:text-red-500 hover:bg-red-50"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              )}
              <CollapsibleTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-gray-500"
                >
                  {isOpen ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </Button>
              </CollapsibleTrigger>
            </div>
          </div>

          {!isOpen && annotation && (
            <div className="mt-2 text-xs text-gray-600 italic pl-1 flex items-start gap-1.5">
              <MessageSquare className="h-3 w-3 text-blue-400 mt-0.5 flex-shrink-0" />
              <span className="line-clamp-2">{annotation}</span>
            </div>
          )}

          {!isOpen && conditionSummary && !isElse && (
            <div className="mt-2 text-xs text-gray-500 pl-1 bg-white/50 rounded px-2 py-1.5 font-mono">
              {conditionSummary}
            </div>
          )}
        </div>

        <CollapsibleContent>
          <div className="p-4 space-y-4 bg-white">
            {showAnnotation && (
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-gray-600 flex items-center gap-1.5">
                  <MessageSquare className="h-3.5 w-3.5" />
                  Annotation (describe this condition in plain English)
                </label>
                <Input
                  value={annotation || ""}
                  onChange={handleAnnotationChange}
                  placeholder="e.g., Filter for premium customers with active subscriptions"
                  className="text-sm"
                />
              </div>
            )}

            {conditionSummary && !isElse && (
              <div className="bg-blue-50 border border-blue-100 rounded-lg px-3 py-2">
                <span className="text-xs font-medium text-blue-700">Summary: </span>
                <span className="text-xs text-blue-600">{conditionSummary}</span>
              </div>
            )}

            {!isElse && (
              <div className="space-y-2">
                <label className="text-xs font-medium text-gray-600">
                  When these conditions are met:
                </label>
                <div className="relative">
                  <div className={cn(
                    "transition-opacity duration-200",
                    !hasVariables && "opacity-40 pointer-events-none select-none"
                  )}>
                    <ConditionComposerV2
                      ref={composerRef}
                      initialValue={conditionGroup || createEmptyGroup()}
                      schema={schema}
                      variables={variables}
                      onChange={handleConditionChange}
                    />
                  </div>
                  {!hasVariables && (
                    <div className="absolute inset-0 flex items-center justify-center bg-white/60 backdrop-blur-[1px] rounded-lg">
                      <div className="flex flex-col items-center px-4 py-3 max-w-[220px]">
                        <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center mb-2">
                          <Link2 className="w-4 h-4 text-blue-600" />
                        </div>
                        <p className="text-sm font-medium text-gray-800 text-center mb-1">
                          Connect a parent node
                        </p>
                        <p className="text-xs text-gray-500 text-center leading-relaxed">
                          Conditions will unlock once this block receives input data from a connected node.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="space-y-2 pt-2 border-t border-gray-100">
              <label className="text-xs font-medium text-gray-600">
                Then move to:
              </label>
              <MoveToSelector
                value={moveTo}
                options={jumpToOptions}
                disabledKeys={usedJumpToKeys}
                onChange={handleMoveToChange}
                onAddNode={handleAddNode}
                placeholder="Select target node..."
              />
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
};

export { BLOCK_TYPES, createEmptyGroup };
export default ConditionBlock;
