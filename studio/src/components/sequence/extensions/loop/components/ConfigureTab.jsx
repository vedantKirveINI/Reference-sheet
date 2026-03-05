import React from "react";
import { Hash, RefreshCw, Infinity, Clock, AlertCircle, FileText, Route } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  LOOP_TYPES,
  INTERVAL_UNITS,
  CONDITION_OPERATORS,
  THEME,
} from "../constants";

const LoopTypeCard = ({ type, icon: Icon, title, description, isSelected, onClick }) => (
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

const ExcludeWeekendsToggle = ({ excludeWeekends, onToggle }) => (
  <div className="flex items-center justify-between p-3 bg-amber-50/50 rounded-lg border border-amber-200/50">
    <div className="flex flex-col gap-0.5">
      <span className="text-sm font-medium text-zinc-700">Business days only</span>
      <span className="text-xs text-zinc-500">Exclude weekends between iterations</span>
    </div>
    <Switch
      checked={excludeWeekends}
      onCheckedChange={onToggle}
      className="data-[state=checked]:bg-orange-500"
    />
  </div>
);


const ConfigureTab = ({ state, nodeType }) => {
  const {
    loopType,
    iterationCount,
    conditionField,
    conditionOperator,
    conditionValue,
    intervalValue,
    intervalUnit,
    excludeWeekends,
    maxIterations,
    timeoutValue,
    timeoutUnit,
    breakConditionField,
    breakConditionOperator,
    breakConditionValue,
    containerNote,
    updateState,
  } = state;

  const isLoopStart = nodeType === "SEQUENCE_LOOP_START";

  const getIntervalLabel = (value, unit) => {
    const unitInfo = INTERVAL_UNITS[unit?.toUpperCase()];
    if (!unitInfo) return unit;
    return value === 1 ? unitInfo.singular : unitInfo.label.toLowerCase();
  };

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="p-3 bg-orange-50/50 rounded-lg border border-orange-200/50">
        <p className="text-sm text-orange-700">
          <strong>Loop nodes work in pairs.</strong> Configure how many times to repeat and the interval between iterations. All nodes between Loop Start and Loop End will be repeated.
        </p>
      </div>

      <div className="flex flex-col gap-3">
        <Label className="text-sm font-medium text-zinc-700">Repeat Mode</Label>
        <div className="grid grid-cols-1 gap-3">
          <LoopTypeCard
            type={LOOP_TYPES.COUNT}
            icon={Hash}
            title="Fixed Count"
            description="Repeat a specific number of times"
            isSelected={loopType === LOOP_TYPES.COUNT}
            onClick={() => updateState({ loopType: LOOP_TYPES.COUNT })}
          />
          <LoopTypeCard
            type={LOOP_TYPES.CONDITION}
            icon={RefreshCw}
            title="Until Condition"
            description="Repeat until a condition becomes true"
            isSelected={loopType === LOOP_TYPES.CONDITION}
            onClick={() => updateState({ loopType: LOOP_TYPES.CONDITION })}
          />
          <LoopTypeCard
            type={LOOP_TYPES.INDEFINITE}
            icon={Infinity}
            title="Indefinite"
            description="Repeat forever (use Exit node to stop)"
            isSelected={loopType === LOOP_TYPES.INDEFINITE}
            onClick={() => updateState({ loopType: LOOP_TYPES.INDEFINITE })}
          />
        </div>
      </div>

      {loopType === LOOP_TYPES.COUNT && (
        <div className="flex flex-col gap-4 p-4 bg-zinc-50 rounded-xl border border-zinc-200">
          <div className="flex items-center gap-2 text-sm text-zinc-600">
            <Hash className="w-4 h-4" style={{ color: THEME.iconColor }} />
            <span>Configure iterations</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <Label className="text-xs text-zinc-500 mb-1.5 block">Repeat</Label>
              <Input
                type="number"
                min={1}
                max={maxIterations}
                value={iterationCount}
                onChange={(e) => updateState({ iterationCount: parseInt(e.target.value) || 1 })}
                className="h-10"
              />
            </div>
            <div className="flex items-end h-10 pb-2">
              <span className="text-sm text-zinc-600">times</span>
            </div>
          </div>
        </div>
      )}

      {loopType === LOOP_TYPES.CONDITION && (
        <div className="flex flex-col gap-4 p-4 bg-zinc-50 rounded-xl border border-zinc-200">
          <div className="flex items-center gap-2 text-sm text-zinc-600">
            <RefreshCw className="w-4 h-4" style={{ color: THEME.iconColor }} />
            <span>Configure exit condition</span>
          </div>
          <div>
            <Label className="text-xs text-zinc-500 mb-1.5 block">Field</Label>
            <Input
              type="text"
              placeholder="e.g., {{user.hasResponded}} or {{data.status}}"
              value={conditionField}
              onChange={(e) => updateState({ conditionField: e.target.value })}
              className="h-10 font-mono text-sm"
            />
          </div>
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <Label className="text-xs text-zinc-500 mb-1.5 block">Operator</Label>
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
            <Label className="text-xs text-zinc-500 mb-1.5 block">Max Iterations (safety limit)</Label>
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
            Loop will exit when the condition becomes true, or after {maxIterations} iterations.
          </p>
        </div>
      )}

      {loopType === LOOP_TYPES.INDEFINITE && (
        <div className="flex flex-col gap-4 p-4 bg-amber-50 rounded-xl border border-amber-200">
          <div className="flex items-center gap-2 text-sm text-amber-700">
            <Infinity className="w-4 h-4" />
            <span>Indefinite loop</span>
          </div>
          <div>
            <Label className="text-xs text-zinc-500 mb-1.5 block">Max Iterations (safety limit)</Label>
            <Input
              type="number"
              min={1}
              max={1000}
              value={maxIterations}
              onChange={(e) => updateState({ maxIterations: parseInt(e.target.value) || 100 })}
              className="h-10"
            />
          </div>
          <p className="text-xs text-amber-600">
            This loop runs indefinitely. Use an Exit node inside the loop to stop it based on conditions. Safety limit: {maxIterations} iterations.
          </p>
        </div>
      )}

      <div className="flex flex-col gap-4 p-4 bg-zinc-50 rounded-xl border border-zinc-200">
        <div className="flex items-center gap-2 text-sm text-zinc-600">
          <RefreshCw className="w-4 h-4" style={{ color: THEME.iconColor }} />
          <span>Interval between iterations</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex-1">
            <Label className="text-xs text-zinc-500 mb-1.5 block">Wait</Label>
            <Input
              type="number"
              min={1}
              value={intervalValue}
              onChange={(e) => updateState({ intervalValue: parseInt(e.target.value) || 1 })}
              className="h-10"
            />
          </div>
          <div className="flex-1">
            <Label className="text-xs text-zinc-500 mb-1.5 block">Unit</Label>
            <Select
              value={intervalUnit}
              onValueChange={(value) => updateState({ intervalUnit: value })}
            >
              <SelectTrigger className="h-10">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.values(INTERVAL_UNITS).map((unit) => (
                  <SelectItem key={unit.id} value={unit.id}>
                    {unit.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <ExcludeWeekendsToggle
          excludeWeekends={excludeWeekends}
          onToggle={(checked) => updateState({ excludeWeekends: checked })}
        />
        <p className="text-xs text-zinc-500">
          Wait {intervalValue} {getIntervalLabel(intervalValue, intervalUnit)}
          {excludeWeekends ? " (business days)" : ""} between each iteration.
        </p>
      </div>

      <div className="flex flex-col gap-4 p-4 bg-zinc-50 rounded-xl border border-zinc-200">
        <div className="flex items-center gap-2 text-sm text-zinc-600">
          <Clock className="w-4 h-4" style={{ color: THEME.iconColor }} />
          <span>Timeout (optional)</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex-1">
            <Label className="text-xs text-zinc-500 mb-1.5 block">Stop after</Label>
            <Input
              type="number"
              min={0}
              placeholder="No limit"
              value={timeoutValue || ""}
              onChange={(e) => updateState({ timeoutValue: e.target.value ? parseInt(e.target.value) : null })}
              className="h-10"
            />
          </div>
          <div className="flex-1">
            <Label className="text-xs text-zinc-500 mb-1.5 block">Unit</Label>
            <Select
              value={timeoutUnit}
              onValueChange={(value) => updateState({ timeoutUnit: value })}
            >
              <SelectTrigger className="h-10">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.values(INTERVAL_UNITS).map((unit) => (
                  <SelectItem key={unit.id} value={unit.id}>
                    {unit.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <p className="text-xs text-zinc-500">
          {timeoutValue ? `Loop will timeout after ${timeoutValue} ${getIntervalLabel(timeoutValue, timeoutUnit)}.` : "No timeout set - loop runs until complete or max iterations."}
        </p>
      </div>

      <div className="flex flex-col gap-4 p-4 bg-zinc-50 rounded-xl border border-zinc-200">
        <div className="flex items-center gap-2 text-sm text-zinc-600">
          <AlertCircle className="w-4 h-4" style={{ color: THEME.iconColor }} />
          <span>Break condition (optional)</span>
        </div>
        <div>
          <Label className="text-xs text-zinc-500 mb-1.5 block">Field</Label>
          <Input
            type="text"
            placeholder="e.g., {{error.occurred}} or {{data.done}}"
            value={breakConditionField}
            onChange={(e) => updateState({ breakConditionField: e.target.value })}
            className="h-10 font-mono text-sm"
          />
        </div>
        {breakConditionField && (
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <Label className="text-xs text-zinc-500 mb-1.5 block">Operator</Label>
              <Select
                value={breakConditionOperator}
                onValueChange={(value) => updateState({ breakConditionOperator: value })}
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
            {!["is_true", "is_false", "exists", "not_exists"].includes(breakConditionOperator) && (
              <div className="flex-1">
                <Label className="text-xs text-zinc-500 mb-1.5 block">Value</Label>
                <Input
                  type="text"
                  placeholder="Value"
                  value={breakConditionValue}
                  onChange={(e) => updateState({ breakConditionValue: e.target.value })}
                  className="h-10"
                />
              </div>
            )}
          </div>
        )}
        <p className="text-xs text-zinc-500">
          {breakConditionField ? "Loop will exit immediately when this condition is true." : "No break condition - loop runs normally."}
        </p>
      </div>

      <div className="flex flex-col gap-4 p-4 bg-zinc-50 rounded-xl border border-zinc-200">
        <div className="flex items-center gap-2 text-sm text-zinc-600">
          <FileText className="w-4 h-4" style={{ color: THEME.iconColor }} />
          <span>Note (optional)</span>
        </div>
        <Textarea
          placeholder="Add a note or annotation for this loop..."
          value={containerNote}
          onChange={(e) => updateState({ containerNote: e.target.value })}
          className="min-h-[80px] resize-none"
        />
        <p className="text-xs text-zinc-500">
          Notes appear on the loop container header.
        </p>
      </div>
    </div>
  );
};

export default ConfigureTab;
