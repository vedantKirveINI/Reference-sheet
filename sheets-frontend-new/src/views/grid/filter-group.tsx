// Recursive FilterGroup component for nested condition groups.
// Adapted from studio_v2_copy ConditionGroup.tsx, using sheets-frontend-new UI style.

import React from "react";
import { Plus, Trash2, ListPlus, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { IColumn } from "@/types";
import type { FilterNode } from "./filter-tree-utils";
import { isGroupNode } from "./filter-tree-utils";
import type { FilterAction } from "./filter-reducer";

interface FilterGroupProps {
  node: FilterNode;
  path: string;
  nestedLevel: number;
  columns: IColumn[];
  columnMap: Map<string, IColumn>;
  dispatch: React.Dispatch<FilterAction>;
  firstColumnId: string;
  defaultOperator: string;
  renderLeafRow: (child: FilterNode, childPath: string, index: number, parentConjunction: "and" | "or", onToggleParentConjunction: () => void) => React.ReactNode;
}

export function FilterGroup({
  node,
  path,
  nestedLevel,
  columns,
  columnMap,
  dispatch,
  firstColumnId,
  defaultOperator,
  renderLeafRow,
}: FilterGroupProps) {
  const { children = [], conjunction } = node;
  const isRoot = nestedLevel === 0;

  const getChildPath = (index: number) => {
    return path ? `${path}.children[${index}]` : `children[${index}]`;
  };

  const handleAddCondition = (isGroup: boolean) => {
    dispatch({
      type: "ADD_CONDITION",
      payload: { path, isGroup, firstColumnId, defaultOperator },
    });
  };

  const handleToggleConjunction = () => {
    dispatch({
      type: "CHANGE_CONJUNCTION",
      payload: { path, conjunction: conjunction === "and" ? "or" : "and" },
    });
  };

  if (isRoot && children.length === 0) {
    return null;
  }

  return (
    <div
      className={cn(
        "flex flex-col gap-2",
        nestedLevel > 0 &&
          "border border-border rounded-lg bg-muted/30 p-3 ml-2"
      )}
    >
      {/* Group header for nested groups */}
      {nestedLevel > 0 && (
        <div className="flex items-center justify-between pb-1 mb-1 border-b border-border/50">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="xs"
              className="min-w-[52px] text-xs font-normal"
              onClick={handleToggleConjunction}
            >
              {conjunction === "and" ? "And" : "Or"}
            </Button>
            <span className="text-xs text-muted-foreground">Group</span>
          </div>
          <div className="flex items-center gap-0.5">
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-muted-foreground hover:text-foreground"
              onClick={() =>
                dispatch({ type: "CLONE_CONDITION", payload: { path } })
              }
              title="Clone group"
            >
              <Copy className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-muted-foreground hover:text-destructive"
              onClick={() =>
                dispatch({ type: "DELETE_CONDITION", payload: { path } })
              }
              title="Delete group"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      )}

      {/* Children */}
      <div className="flex flex-col gap-2">
        {children.map((child, index) => {
          const childPath = getChildPath(index);

          if (isGroupNode(child)) {
            return (
              <div key={child.id} className="flex flex-col gap-2">
                {/* Conjunction label between sibling items */}
                {index > 0 && (
                  <div className="flex items-center py-0.5">
                    <button
                      type="button"
                      onClick={handleToggleConjunction}
                      className="text-xs font-medium uppercase tracking-wider px-2 py-0.5 bg-muted/50 text-muted-foreground hover:bg-primary/10 hover:text-primary rounded cursor-pointer transition-colors"
                      title={`Click to switch to ${conjunction === "and" ? "OR" : "AND"}`}
                    >
                      {conjunction}
                    </button>
                  </div>
                )}
                <FilterGroup
                  node={child}
                  path={childPath}
                  nestedLevel={nestedLevel + 1}
                  columns={columns}
                  columnMap={columnMap}
                  dispatch={dispatch}
                  firstColumnId={firstColumnId}
                  defaultOperator={defaultOperator}
                  renderLeafRow={renderLeafRow}
                />
              </div>
            );
          }

          // Leaf node - pass parent group's conjunction info
          return (
            <React.Fragment key={child.id}>
              {renderLeafRow(child, childPath, index, conjunction, handleToggleConjunction)}
            </React.Fragment>
          );
        })}
      </div>

      {/* Add buttons inside nested groups */}
      {nestedLevel > 0 && (
        <div className="flex items-center gap-2 pt-1 border-t border-border/50">
          <Button
            variant="ghost"
            size="sm"
            className="h-7 text-xs gap-1"
            onClick={() => handleAddCondition(false)}
          >
            <Plus className="h-3.5 w-3.5" />
            Add condition
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 text-xs gap-1"
            onClick={() => handleAddCondition(true)}
          >
            <ListPlus className="h-3.5 w-3.5" />
            Add group
          </Button>
        </div>
      )}
    </div>
  );
}
