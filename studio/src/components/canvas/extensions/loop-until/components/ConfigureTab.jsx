import React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ODSFormulaBar as FormulaBar } from "@src/module/ods";
import { CONDITION_OPERATORS } from "../constants";

const ConfigureTab = ({ state, variables }) => {
  const {
    conditionField,
    conditionOperator,
    conditionValue,
    maxIterations,
    updateState,
  } = state;

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        <Label className="text-sm font-medium text-gray-900">Stop the loop when...</Label>

        <div className="space-y-3">
          <div>
            <Label className="text-xs text-gray-500 mb-1.5 block">What to check each time</Label>
            <FormulaBar
              variables={variables}
              wrapContent
              placeholder="Pick a value from inside your loop, e.g. {{Check Status.response.status}}"
              defaultInputContent={conditionField?.blocks || []}
              onInputContentChanged={(blocks) => updateState({ conditionField: { type: "fx", blocks } })}
              slotProps={{
                container: {
                  className: "min-h-[44px] rounded-lg border border-zinc-200 bg-white",
                },
              }}
            />
          </div>

          <div className="flex items-center gap-3">
            <div className="flex-1">
              <Label className="text-xs text-gray-500 mb-1.5 block">Condition</Label>
              <Select
                value={conditionOperator}
                onValueChange={(value) => updateState({ conditionOperator: value })}
              >
                <SelectTrigger className="h-10">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CONDITION_OPERATORS.map((op) => (
                    <SelectItem key={op.id} value={op.id}>
                      {op.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {!["is_true", "is_false", "exists", "not_exists"].includes(conditionOperator) && (
              <div className="flex-1">
                <Label className="text-xs text-gray-500 mb-1.5 block">Value</Label>
                <FormulaBar
                  variables={variables}
                  wrapContent
                  placeholder="Pick or type a value to compare"
                  defaultInputContent={conditionValue?.blocks || []}
                  onInputContentChanged={(blocks) => updateState({ conditionValue: { type: "fx", blocks } })}
                  slotProps={{
                    container: {
                      className: "min-h-[44px] rounded-lg border border-zinc-200 bg-white",
                    },
                  }}
                />
              </div>
            )}
          </div>

          <div>
            <Label className="text-xs text-gray-500 mb-1.5 block">Safety limit</Label>
            <Input
              type="number"
              min={1}
              max={1000}
              value={maxIterations}
              onChange={(e) => updateState({ maxIterations: parseInt(e.target.value) || 100 })}
              className="h-10"
            />
            <p className="text-xs text-gray-500 mt-1">
              Maximum number of loops to prevent runaway automations
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfigureTab;
