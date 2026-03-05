import React from "react";
import { List, Hash, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { ODSFormulaBar as FormulaBar } from "@src/module/ods";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { LOOP_MODES, CONDITION_OPERATORS, THEME } from "../constants";

const ModeCard = ({ icon: Icon, title, description, isSelected, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className={cn(
      "flex items-start gap-3 p-4 rounded-xl border-2 transition-all text-left w-full",
      isSelected
        ? "border-orange-500 bg-orange-50/50"
        : "border-zinc-200 hover:border-zinc-300 bg-white"
    )}
  >
    <div
      className={cn(
        "flex items-center justify-center w-10 h-10 rounded-lg shrink-0",
        isSelected ? "bg-orange-100" : "bg-zinc-100"
      )}
    >
      <Icon
        className={cn(
          "w-5 h-5",
          isSelected ? "text-orange-600" : "text-zinc-500"
        )}
      />
    </div>
    <div className="flex flex-col gap-0.5">
      <span
        className={cn(
          "font-medium text-sm",
          isSelected ? "text-orange-700" : "text-zinc-700"
        )}
      >
        {title}
      </span>
      <span className="text-xs text-zinc-500">{description}</span>
    </div>
  </button>
);

const ConfigureTab = ({ state, variables }) => {
  const {
    loopMode,
    listSource,
    setListSource,
    repeatCount,
    conditionField,
    conditionOperator,
    conditionValue,
    maxIterations,
    validation,
    updateState,
  } = state;

  return (
    <div className="flex flex-col gap-6">
      <div className="p-3 bg-orange-50/50 rounded-lg border border-orange-200/50">
        <p className="text-sm text-orange-700">
          <strong>Choose how this loop runs.</strong> Everything between Loop Start and Loop End will repeat based on your selection.
        </p>
      </div>

      <div className="flex flex-col gap-3">
        <Label className="text-sm font-medium text-zinc-700">Loop Mode</Label>
        <div className="grid grid-cols-1 gap-3">
          <ModeCard
            icon={List}
            title="Loop over a list"
            description="Process each item in a list one by one — great for sending emails, updating records, or handling API results"
            isSelected={loopMode === LOOP_MODES.LIST}
            onClick={() => updateState({ loopMode: LOOP_MODES.LIST })}
          />
          <ModeCard
            icon={Hash}
            title="Repeat a fixed number of times"
            description="Run the same steps multiple times — useful for retries, polling, or generating content"
            isSelected={loopMode === LOOP_MODES.COUNT}
            onClick={() => updateState({ loopMode: LOOP_MODES.COUNT })}
          />
          <ModeCard
            icon={RefreshCw}
            title="Loop until a condition is met"
            description="Keep repeating until something changes — perfect for waiting on approvals or checking status"
            isSelected={loopMode === LOOP_MODES.CONDITION}
            onClick={() => updateState({ loopMode: LOOP_MODES.CONDITION })}
          />
        </div>
      </div>

      {loopMode === LOOP_MODES.LIST && (
        <div className="flex flex-col gap-3">
          <Label className="text-sm font-medium text-zinc-700">
            List to loop over<span className="text-red-500 ml-0.5">*</span>
          </Label>
          <FormulaBar
            variables={variables}
            wrapContent
            placeholder="Pick a list from a previous step, e.g. {{Get Customers.results}}"
            defaultInputContent={listSource?.blocks || []}
            onInputContentChanged={(blocks) => setListSource({ type: "fx", blocks })}
            slotProps={{
              container: {
                className: cn(
                  "min-h-[100px] rounded-xl border border-zinc-300 bg-white",
                  !validation.isValid && loopMode === LOOP_MODES.LIST && "border-red-400"
                ),
              },
            }}
          />
          <p className="text-xs text-zinc-500">
            Each time the loop runs, you'll get access to the current item from this list
          </p>
        </div>
      )}

      {loopMode === LOOP_MODES.COUNT && (
        <div className="flex flex-col gap-4 p-4 bg-zinc-50 rounded-xl border border-zinc-200">
          <div className="flex items-center gap-2 text-sm text-zinc-600">
            <Hash className="w-4 h-4" style={{ color: THEME.iconColor }} />
            <span>How many times?</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <Label className="text-xs text-zinc-500 mb-1.5 block">Repeat</Label>
              <Input
                type="number"
                min={1}
                max={1000}
                value={repeatCount}
                onChange={(e) => updateState({ repeatCount: parseInt(e.target.value) || 1 })}
                className="h-10"
              />
            </div>
            <div className="flex items-end h-10 pb-2">
              <span className="text-sm text-zinc-600">times</span>
            </div>
          </div>
          <p className="text-xs text-zinc-500">
            The loop will run exactly {repeatCount} {repeatCount === 1 ? "time" : "times"}, then continue to Loop End
          </p>
        </div>
      )}

      {loopMode === LOOP_MODES.CONDITION && (
        <div className="flex flex-col gap-4 p-4 bg-zinc-50 rounded-xl border border-zinc-200">
          <div className="flex items-center gap-2 text-sm text-zinc-600">
            <RefreshCw className="w-4 h-4" style={{ color: THEME.iconColor }} />
            <span>Keep looping until...</span>
          </div>
          <div>
            <Label className="text-xs text-zinc-500 mb-1.5 block">Field to check</Label>
            <Input
              type="text"
              placeholder="e.g. {{Check Status.response.status}}"
              value={conditionField}
              onChange={(e) => updateState({ conditionField: e.target.value })}
              className="h-10 font-mono text-sm"
            />
          </div>
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <Label className="text-xs text-zinc-500 mb-1.5 block">Condition</Label>
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
                <Label className="text-xs text-zinc-500 mb-1.5 block">Value</Label>
                <Input
                  type="text"
                  placeholder="Value to compare"
                  value={conditionValue}
                  onChange={(e) => updateState({ conditionValue: e.target.value })}
                  className="h-10"
                />
              </div>
            )}
          </div>
          <div>
            <Label className="text-xs text-zinc-500 mb-1.5 block">Safety limit (max loops)</Label>
            <Input
              type="number"
              min={1}
              max={1000}
              value={maxIterations}
              onChange={(e) => updateState({ maxIterations: parseInt(e.target.value) || 100 })}
              className="h-10"
            />
          </div>
          <p className="text-xs text-zinc-500">
            Loop exits when the condition is met, or after {maxIterations} loops (safety limit)
          </p>
        </div>
      )}

      <div className="bg-orange-50 rounded-xl p-4 space-y-3">
        <h4 className="font-medium text-orange-900 text-sm flex items-center gap-2">
          <RefreshCw className="w-4 h-4" />
          How Loops Work
        </h4>
        <div className="text-sm text-orange-800 space-y-2">
          <p>1. Loop Start kicks off the repeating process</p>
          <p>2. Every step between Loop Start and Loop End runs each time</p>
          <p>3. Loop End collects all the results into a single list</p>
          <p>4. Use "Stop Loop" if you need to exit early</p>
        </div>
      </div>
    </div>
  );
};

export default ConfigureTab;
