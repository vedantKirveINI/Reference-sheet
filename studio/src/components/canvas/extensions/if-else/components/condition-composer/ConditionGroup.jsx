import React, { useCallback } from "react";
import { Plus, FolderPlus, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import ConditionRow from "./ConditionRow";
import { uniqueId } from "lodash";

const createEmptyCondition = () => ({
  id: uniqueId("cond_"),
  operator: undefined,
  value: { type: "fx", blocks: [] },
  valueStr: "",
});

const ConditionGroup = ({
  group,
  schema = [],
  variables = {},
  nestedLevel = 0,
  onUpdate,
  onDelete,
  dataTestId = "condition-group",
}) => {
  const { conjunction = "and", conditions = [], groups = [] } = group;

  const handleConjunctionChange = useCallback((newConjunction) => {
    onUpdate({ ...group, conjunction: newConjunction });
  }, [group, onUpdate]);

  const handleConditionUpdate = useCallback((index, updatedCondition) => {
    const newConditions = [...conditions];
    newConditions[index] = updatedCondition;
    onUpdate({ ...group, conditions: newConditions });
  }, [conditions, group, onUpdate]);

  const handleConditionDelete = useCallback((index) => {
    const newConditions = conditions.filter((_, i) => i !== index);
    onUpdate({ ...group, conditions: newConditions });
  }, [conditions, group, onUpdate]);

  const handleConditionClone = useCallback((index) => {
    const cloned = { ...conditions[index], id: uniqueId("cond_") };
    const newConditions = [...conditions];
    newConditions.splice(index + 1, 0, cloned);
    onUpdate({ ...group, conditions: newConditions });
  }, [conditions, group, onUpdate]);

  const handleAddCondition = useCallback(() => {
    onUpdate({ 
      ...group, 
      conditions: [...conditions, createEmptyCondition()] 
    });
  }, [conditions, group, onUpdate]);

  const handleNestedGroupUpdate = useCallback((index, updatedGroup) => {
    const newGroups = [...groups];
    newGroups[index] = updatedGroup;
    onUpdate({ ...group, groups: newGroups });
  }, [groups, group, onUpdate]);

  const handleNestedGroupDelete = useCallback((index) => {
    const newGroups = groups.filter((_, i) => i !== index);
    onUpdate({ ...group, groups: newGroups });
  }, [groups, group, onUpdate]);

  const handleAddGroup = useCallback(() => {
    const newGroup = {
      id: uniqueId("group_"),
      conjunction: "and",
      conditions: [createEmptyCondition()],
      groups: [],
    };
    onUpdate({ ...group, groups: [...groups, newGroup] });
  }, [groups, group, onUpdate]);

  const isNested = nestedLevel > 0;
  const hasContent = conditions.length > 0 || groups.length > 0;

  return (
    <div
      className={cn(
        "rounded-lg",
        isNested && "border border-gray-200 bg-gray-50/50 p-3 ml-4"
      )}
      data-testid={dataTestId}
    >
      {isNested && (
        <div className="flex items-center justify-between mb-3 pb-2 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <Select
              value={conjunction}
              onValueChange={handleConjunctionChange}
            >
              <SelectTrigger className="h-7 w-20 text-xs font-medium bg-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="and">AND</SelectItem>
                <SelectItem value="or">OR</SelectItem>
              </SelectContent>
            </Select>
            <span className="text-xs text-gray-500">Group</span>
          </div>
          {onDelete && (
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
        </div>
      )}

      <div className="space-y-0">
        {conditions.map((condition, index) => (
          <ConditionRow
            key={condition.id}
            condition={condition}
            schema={schema}
            variables={variables}
            isFirst={index === 0 && !isNested}
            conjunction={conjunction}
            onUpdate={(updated) => handleConditionUpdate(index, updated)}
            onDelete={() => handleConditionDelete(index)}
            onClone={() => handleConditionClone(index)}
            dataTestId={`${dataTestId}-row-${index}`}
          />
        ))}

        {groups.map((nestedGroup, index) => (
          <div key={nestedGroup.id} className="mt-2">
            {(conditions.length > 0 || index > 0) && (
              <div className="flex items-center justify-center py-1">
                <span className={cn(
                  "text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded",
                  conjunction === "and" ? "bg-blue-100 text-blue-700" : "bg-purple-100 text-purple-700"
                )}>
                  {conjunction}
                </span>
              </div>
            )}
            <ConditionGroup
              group={nestedGroup}
              schema={schema}
              variables={variables}
              nestedLevel={nestedLevel + 1}
              onUpdate={(updated) => handleNestedGroupUpdate(index, updated)}
              onDelete={() => handleNestedGroupDelete(index)}
              dataTestId={`${dataTestId}-nested-${index}`}
            />
          </div>
        ))}
      </div>

      <div className="flex items-center gap-2 mt-3 pt-2 border-t border-dashed border-gray-200">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={handleAddCondition}
          className="h-8 text-xs text-gray-600 hover:text-blue-600 hover:bg-blue-50"
        >
          <Plus className="h-3.5 w-3.5 mr-1" />
          Add condition
        </Button>
        {nestedLevel < 2 && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleAddGroup}
            className="h-8 text-xs text-gray-600 hover:text-purple-600 hover:bg-purple-50"
          >
            <FolderPlus className="h-3.5 w-3.5 mr-1" />
            Add group
          </Button>
        )}
      </div>
    </div>
  );
};

export { createEmptyCondition };
export default ConditionGroup;
