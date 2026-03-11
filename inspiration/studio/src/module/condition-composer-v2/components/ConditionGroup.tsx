import React from 'react';
import { Copy, Trash2, Plus, FolderPlus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { ConditionNode, SchemaField } from '../types';
import ConditionRow from './ConditionRow';

interface ConditionGroupProps {
  node: ConditionNode;
  path: string;
  nestedLevel: number;
  schema: SchemaField[];
  variables?: Record<string, any>;
  effects?: any[];
  onUpdateField: (path: string, property: string, value: any) => void;
  onDelete: (path: string) => void;
  onClone: (path: string) => void;
  onAddCondition: (path: string, isGroup: boolean) => void;
  onChangeConjunction: (path: string, conjunction: 'and' | 'or') => void;
  dataTestId?: string;
}

export function ConditionGroup({
  node,
  path,
  nestedLevel,
  schema,
  variables,
  effects,
  onUpdateField,
  onDelete,
  onClone,
  onAddCondition,
  onChangeConjunction,
  dataTestId = 'condition-group',
}: ConditionGroupProps) {
  const { childs = [], condition = 'and' } = node;

  const getChildPath = (index: number) => {
    return path ? `${path}.childs[${index}]` : `childs[${index}]`;
  };

  const isRootLevel = nestedLevel === 0;
  const hasMultipleConditions = childs.length > 1;

  if (childs.length === 0 && isRootLevel) {
    return null;
  }

  return (
    <div
      className={cn(
        "flex flex-col gap-3 rounded-lg",
        nestedLevel > 0 && "border border-border bg-card shadow-sm",
        nestedLevel === 0 && "py-4"
      )}
      style={{
        padding: nestedLevel > 0 ? '1rem' : undefined,
        marginLeft: nestedLevel > 0 ? '0.5rem' : undefined,
      }}
      data-testid={dataTestId}
    >
      {isRootLevel && hasMultipleConditions && (
        <div className="flex items-center gap-2 pb-2">
          <span className="text-xs text-muted-foreground">Match</span>
          <Select
            value={condition}
            onValueChange={(value) => onChangeConjunction(path, value as 'and' | 'or')}
          >
            <SelectTrigger 
              className="h-7 w-24 text-xs font-medium"
              data-testid={`${dataTestId}-root-conjunction`}
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="and">ALL (AND)</SelectItem>
              <SelectItem value="or">ANY (OR)</SelectItem>
            </SelectContent>
          </Select>
          <span className="text-xs text-muted-foreground">of the following conditions</span>
        </div>
      )}

      {nestedLevel > 0 && (
        <div className="flex items-center justify-between pb-2 border-b border-border/50">
          <div className="flex items-center gap-2">
            <Select
              value={condition}
              onValueChange={(value) => onChangeConjunction(path, value as 'and' | 'or')}
            >
              <SelectTrigger 
                className="h-7 w-20 text-xs font-medium"
                data-testid={`${dataTestId}-conjunction`}
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="and">AND</SelectItem>
                <SelectItem value="or">OR</SelectItem>
              </SelectContent>
            </Select>
            <span className="text-xs text-muted-foreground">Group</span>
          </div>

          <div className="flex items-center gap-0.5">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => onClone(path)}
              className="h-7 w-7 text-muted-foreground hover:text-foreground"
              title="Clone group"
              data-testid={`${dataTestId}-clone`}
            >
              <Copy className="h-3.5 w-3.5" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => onDelete(path)}
              className="h-7 w-7 text-muted-foreground hover:text-destructive"
              title="Delete group"
              data-testid={`${dataTestId}-delete`}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      )}

      <div className="flex flex-col gap-3">
        {childs.map((child, index) => {
          const childPath = getChildPath(index);
          const isGroup = !!child.condition;

          if (isGroup) {
            return (
              <div key={child.id} className="flex flex-col gap-2">
                {index > 0 && (
                  <div className="flex items-center py-1">
                    <button
                      type="button"
                      onClick={() => onChangeConjunction(path, condition === 'and' ? 'or' : 'and')}
                      className="text-xs font-medium uppercase tracking-wider px-2 py-1 bg-muted/50 text-muted-foreground hover:bg-primary/10 hover:text-primary rounded cursor-pointer transition-colors"
                      title={`Click to switch to ${condition === 'and' ? 'OR' : 'AND'}`}
                      data-testid={`${dataTestId}-${index}-conjunction-toggle`}
                    >
                      {condition}
                    </button>
                  </div>
                )}
                <ConditionGroup
                  node={child}
                  path={childPath}
                  nestedLevel={nestedLevel + 1}
                  schema={schema}
                  variables={variables}
                  effects={effects}
                  onUpdateField={onUpdateField}
                  onDelete={onDelete}
                  onClone={onClone}
                  onAddCondition={onAddCondition}
                  onChangeConjunction={onChangeConjunction}
                  dataTestId={`${dataTestId}-${index}`}
                />
              </div>
            );
          }

          return (
            <ConditionRow
              key={child.id}
              node={child}
              path={childPath}
              schema={schema}
              variables={variables}
              effects={effects}
              onUpdateField={onUpdateField}
              onDelete={onDelete}
              onClone={onClone}
              onChangeConjunction={(newConjunction) => onChangeConjunction(path, newConjunction)}
              isFirst={index === 0}
              conjunction={condition}
              dataTestId={`${dataTestId}-row-${index}`}
            />
          );
        })}
      </div>

      {nestedLevel > 0 && (
        <div className="flex items-center gap-2 pt-2 border-t border-border/50">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => onAddCondition(path, false)}
            className="h-7 text-xs text-primary hover:text-primary"
            data-testid={`${dataTestId}-add-condition`}
          >
            <Plus className="h-3.5 w-3.5 mr-1" />
            Add condition
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => onAddCondition(path, true)}
            className="h-7 text-xs text-primary hover:text-primary"
            data-testid={`${dataTestId}-add-group`}
          >
            <FolderPlus className="h-3.5 w-3.5 mr-1" />
            Add group
          </Button>
        </div>
      )}
    </div>
  );
}

export default ConditionGroup;
