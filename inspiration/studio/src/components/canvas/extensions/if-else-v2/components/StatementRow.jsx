import React, { Fragment, useCallback, useState } from "react";
import { Plus, Trash2, ChevronDown, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import Condition from "./Condition";
import GroupCondition from "./GroupCondition";
import Action from "./Action";
import InfoTooltip from "./InfoTooltip";
import { getDefaultCondition } from "../utils/utils";

const BLOCK_STYLES = {
  if: {
    accent: "#0038C8",
    accentLight: "rgba(0, 56, 200, 0.06)",
    accentBorder: "rgba(0, 56, 200, 0.15)",
    label: "If",
    badge: "bg-blue-100 text-blue-700",
  },
  "else-if": {
    accent: "#4338CA",
    accentLight: "rgba(67, 56, 202, 0.06)",
    accentBorder: "rgba(67, 56, 202, 0.15)",
    label: "Else If",
    badge: "bg-indigo-100 text-indigo-700",
  },
  else: {
    accent: "#6B7280",
    accentLight: "rgba(107, 114, 128, 0.06)",
    accentBorder: "rgba(107, 114, 128, 0.15)",
    label: "Else",
    badge: "bg-gray-100 text-gray-700",
  },
};

const StatementRow = ({
  statement,
  variables,
  availableNodes,
  isGroup = false,
  onChange = () => {},
  onDelete = () => {},
  onAddNode = () => {},
  index,
  addEndNodeInElse,
}) => {
  const [showCTAPopper, setShowCTAPopper] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const blockStyle = BLOCK_STYLES[statement?.type] || BLOCK_STYLES["else-if"];

  const getGroupHeader = (logicType) => {
    return logicType === "AND"
      ? "All of the following are true..."
      : "Any of the following is true...";
  };

  const addCondition = useCallback(() => {
    onChange({
      ...statement,
      conditions: [...statement.conditions, getDefaultCondition()],
    });
  }, [onChange, statement]);

  const addGroupCondition = useCallback(() => {
    onChange({
      ...statement,
      groups: [
        ...statement.groups,
        {
          id: Date.now(),
          conditions: [getDefaultCondition()],
          groups: [],
          logicType: statement?.logicType === "AND" ? "OR" : "AND",
        },
      ],
    });
  }, [onChange, statement]);

  const onConditionChange = useCallback(
    (condition, condIdx) => {
      const updated = { ...statement };
      updated.conditions = [...updated.conditions];
      updated.conditions[condIdx] = condition;
      onChange(updated);
    },
    [onChange, statement]
  );

  const onGroupConditionChange = useCallback(
    (group, groupIdx) => {
      const updated = { ...statement };
      updated.groups = [...updated.groups];
      updated.groups[groupIdx] = group;
      onChange(updated);
    },
    [onChange, statement]
  );

  const deleteCondition = useCallback(
    (condIdx) => {
      const updated = { ...statement };
      updated.conditions = [...updated.conditions];
      updated.conditions.splice(condIdx, 1);
      onChange(updated);
    },
    [onChange, statement]
  );

  const deleteGroupCondition = useCallback(
    (groupIdx) => {
      const updated = { ...statement };
      updated.groups = [...updated.groups];
      updated.groups.splice(groupIdx, 1);
      onChange(updated);
    },
    [onChange, statement]
  );

  const logicTypeChangeHandler = useCallback(
    (newValue) => onChange({ ...statement, logicType: newValue }),
    [onChange, statement]
  );

  const actionChangeHandler = useCallback(
    (action) => {
      onChange({ ...statement, action: action });
    },
    [onChange, statement]
  );

  if (isGroup) {
    return (
      <div className="flex flex-col gap-2 w-full p-4 rounded-lg bg-gray-100/80 border border-gray-200">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700">
            {getGroupHeader(statement?.logicType)}
          </span>
          <div className="flex items-center gap-1">
            <Popover open={showCTAPopper} onOpenChange={setShowCTAPopper}>
              <PopoverTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  data-testid="nested-add-button"
                  className="h-7 w-7 text-gray-500 hover:text-gray-700"
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent align="end" className="w-auto p-2">
                <div className="flex flex-col gap-1">
                  <Button
                    variant="ghost"
                    className="justify-start text-sm"
                    onClick={() => {
                      addCondition();
                      setShowCTAPopper(false);
                    }}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Condition
                  </Button>
                  <Button
                    variant="ghost"
                    className="justify-start text-sm"
                    onClick={() => {
                      addGroupCondition();
                      setShowCTAPopper(false);
                    }}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Group
                  </Button>
                </div>
              </PopoverContent>
            </Popover>
            <InfoTooltip
              content={
                <span className="text-xs text-white">
                  Add conditions or nested groups to build complex logic
                </span>
              }
            />
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-gray-400 hover:text-red-500"
              data-testid="delete-group-condition"
              onClick={onDelete}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {renderConditionsBody()}
      </div>
    );
  }

  function renderConditionsBody() {
    return (
      <div className="flex flex-col items-stretch gap-3 w-full">
        {statement?.conditions?.map((condition, condIdx) => {
          if (condIdx !== 0) {
            return (
              <Fragment key={condition.id}>
                <div className="flex items-center gap-3 w-full">
                  <div className="flex-1 h-px bg-gray-200" />
                  {condIdx === 1 ? (
                    <Select
                      value={statement?.logicType}
                      onValueChange={logicTypeChangeHandler}
                    >
                      <SelectTrigger
                        className="w-20 h-7 bg-gray-900 text-white border-none text-xs font-semibold rounded-full"
                        data-testid={`logic-operator-${condIdx}`}
                      >
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="AND">AND</SelectItem>
                        <SelectItem value="OR">OR</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <span className="inline-flex items-center justify-center min-w-[3.5rem] h-7 bg-gray-900 text-white text-xs font-semibold rounded-full px-3">
                      {statement?.logicType}
                    </span>
                  )}
                  <div className="flex-1 h-px bg-gray-200" />
                </div>
                <Condition
                  condition={condition}
                  index={condIdx}
                  variables={variables}
                  isAdvanced={statement?.isAdvanced}
                  onChange={(cond) => onConditionChange(cond, condIdx)}
                  onDelete={deleteCondition}
                />
              </Fragment>
            );
          }
          return (
            <Condition
              key={condition.id}
              condition={condition}
              index={condIdx}
              variables={variables}
              isAdvanced={statement?.isAdvanced}
              onChange={(cond) => onConditionChange(cond, condIdx)}
              onDelete={deleteCondition}
            />
          );
        })}

        {statement?.groups?.map((group, groupIdx) => (
          <Fragment key={group.id}>
            <div
              className="flex items-center gap-3 w-full"
              data-testid={`group-logic-type-container-${groupIdx}`}
            >
              <div className="flex-1 h-px bg-gray-200" />
              {statement?.conditions?.length === 1 && groupIdx === 0 ? (
                <Select
                  value={statement?.logicType}
                  onValueChange={logicTypeChangeHandler}
                >
                  <SelectTrigger
                    className="w-20 h-7 bg-gray-900 text-white border-none text-xs font-semibold rounded-full"
                    data-testid={`group-logic-operator-${groupIdx}`}
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="AND">AND</SelectItem>
                    <SelectItem value="OR">OR</SelectItem>
                  </SelectContent>
                </Select>
              ) : (
                <span className="inline-flex items-center justify-center min-w-[3.5rem] h-7 bg-gray-900 text-white text-xs font-semibold rounded-full px-3">
                  {statement?.logicType}
                </span>
              )}
              <div className="flex-1 h-px bg-gray-200" />
            </div>
            <GroupCondition
              group={group}
              index={groupIdx}
              parentStatement={statement}
              variables={variables}
              onChange={(grp) => onGroupConditionChange(grp, groupIdx)}
              onDelete={deleteGroupCondition}
            />
          </Fragment>
        ))}
      </div>
    );
  }

  const conditionCount =
    (statement?.conditions?.length || 0) + (statement?.groups?.length || 0);

  return (
    <div
      className="rounded-xl border bg-white shadow-sm overflow-hidden transition-shadow hover:shadow-md"
      style={{ borderColor: blockStyle.accentBorder }}
      data-testid={`statement-block-${index}`}
    >
      <div
        className="flex items-center justify-between px-4 py-3 cursor-pointer select-none"
        style={{ backgroundColor: blockStyle.accentLight }}
        onClick={() => setIsCollapsed(!isCollapsed)}
      >
        <div className="flex items-center gap-2.5">
          <div
            className="flex items-center justify-center"
          >
            {isCollapsed ? (
              <ChevronRight className="w-4 h-4 text-gray-500" />
            ) : (
              <ChevronDown className="w-4 h-4 text-gray-500" />
            )}
          </div>
          <span
            className={cn(
              "text-xs font-semibold uppercase tracking-wide px-2 py-0.5 rounded-md",
              blockStyle.badge
            )}
          >
            {blockStyle.label}
          </span>
          {statement.type !== "else" && (
            <span className="text-xs text-gray-500">
              {conditionCount} condition{conditionCount !== 1 ? "s" : ""}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1">
          {statement.type !== "if" && statement.type !== "else" && (
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-gray-400 hover:text-red-500"
              data-testid="delete-statement"
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>

      {!isCollapsed && (
        <div className="px-4 py-4">
          {statement.type === "else" ? (
            <div className="flex flex-col gap-3">
              <Action
                index={index}
                onAddNode={onAddNode}
                availableNodes={availableNodes}
                selectedAction={statement.action}
                statementType={statement.type}
                onChange={actionChangeHandler}
                addEndNodeInElse={addEndNodeInElse}
              />
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              <div className="rounded-lg bg-gray-50/80 border border-gray-100 p-4">
                {renderConditionsBody()}

                <div className="flex items-center gap-3 mt-4 pt-3 border-t border-gray-100">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs text-gray-600 hover:text-blue-600 hover:bg-blue-50"
                    data-testid="add-condition"
                    onClick={addCondition}
                  >
                    <Plus className="w-3.5 h-3.5 mr-1" />
                    Condition
                  </Button>
                  <div className="w-px h-4 bg-gray-200" />
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs text-gray-600 hover:text-indigo-600 hover:bg-indigo-50"
                    data-testid="add-group-condition"
                    onClick={addGroupCondition}
                  >
                    <Plus className="w-3.5 h-3.5 mr-1" />
                    Group
                  </Button>
                  <InfoTooltip
                    content={
                      <span className="text-xs text-white">
                        Create a nested group of conditions with its own AND/OR logic
                      </span>
                    }
                  />
                </div>
              </div>

              <div
                className="rounded-lg border border-gray-100 p-4"
                style={{ backgroundColor: "rgba(0, 56, 200, 0.02)" }}
              >
                <Action
                  index={index}
                  onAddNode={onAddNode}
                  availableNodes={availableNodes}
                  selectedAction={statement.action}
                  statementType={statement.type}
                  onChange={actionChangeHandler}
                  addEndNodeInElse={addEndNodeInElse}
                />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default StatementRow;
