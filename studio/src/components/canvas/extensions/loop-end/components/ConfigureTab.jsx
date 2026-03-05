import React, { useMemo, useRef } from "react";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import { icons } from "@/components/icons";
import { Input } from "@/components/ui/input";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ODSFormulaBar as FormulaBar } from "@src/module/ods";
import InputGridV3 from "@src/module/input-grid-v3";
import { AGGREGATE_OPERATIONS } from "../constants";

const UseCaseItem = ({ icon: Icon, text, accentColor }) => (
  <div className="flex items-center gap-2 text-xs text-gray-600">
    <Icon size={14} className="flex-shrink-0" style={{ color: accentColor }} />
    <span>{text}</span>
  </div>
);

const AggregateBuilder = ({ state, variables }) => {
  const {
    aggregateFields,
    addAggregateField,
    removeAggregateField,
    updateAggregateFieldKey,
    updateAggregateFieldValue,
    updateAggregateFieldOperation,
  } = state;

  return (
    <div className="space-y-2">
      <div>
        <Label className="text-sm font-medium text-gray-900">Define your calculations</Label>
        <p className="text-xs text-gray-500 -mt-1">Set up one or more calculations to run across all loop runs</p>
      </div>
      <div className="overflow-hidden shadow-md border-border/60 rounded-lg">
        <div
          className="grid gap-2 items-center py-2 px-3 bg-muted/50 border-b border-border text-xs font-medium text-muted-foreground uppercase tracking-wide"
          style={{ gridTemplateColumns: '140px 1fr 130px 2rem' }}
        >
          <span>Name</span>
          <span>Value</span>
          <span>Operation</span>
          <span></span>
        </div>
        {aggregateFields.map((field, index) => (
          <div
            key={index}
            className="grid gap-2 items-center py-2 px-3 border-b border-border/50 last:border-b-0 hover:bg-muted/30 transition-colors"
            style={{ gridTemplateColumns: '140px 1fr 130px 2rem' }}
          >
            <Input
              value={field.key}
              onChange={(e) => updateAggregateFieldKey(index, e.target.value)}
              placeholder="e.g. total"
              className="h-9 text-sm rounded-lg"
            />
            <FormulaBar
              variables={variables}
              wrapContent
              placeholder="Pick a value..."
              defaultInputContent={field.value?.blocks || []}
              onInputContentChanged={(blocks) => updateAggregateFieldValue(index, blocks)}
              inputMode="formula"
              allowFormulaExpansion={false}
              singleSelect
              showAIFixInput={false}
              slotProps={{
                container: {
                  className: "h-9 rounded-lg border border-zinc-200 bg-white text-sm",
                },
              }}
            />
            <Select
              value={field.operation}
              onValueChange={(val) => updateAggregateFieldOperation(index, val)}
            >
              <SelectTrigger className="h-9 text-sm rounded-lg">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {AGGREGATE_OPERATIONS.map((op) => (
                  <SelectItem key={op.id} value={op.id} className="text-sm">
                    <div>
                      <span>{op.label}</span>
                      <span className="text-zinc-400 ml-1.5 text-xs">— {op.description}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <button
              onClick={() => removeAggregateField(index)}
              className={cn(
                "p-1 rounded-md transition-colors",
                aggregateFields.length <= 1
                  ? "text-zinc-200 cursor-not-allowed"
                  : "text-zinc-400 hover:text-red-500 hover:bg-red-50"
              )}
              disabled={aggregateFields.length <= 1}
            >
              <icons.x className="w-4 h-4" />
            </button>
          </div>
        ))}
        <button
          onClick={addAggregateField}
          className="flex items-center gap-1.5 w-full py-2 px-3 text-xs text-muted-foreground hover:bg-muted/30 transition-colors"
        >
          <icons.add className="w-3.5 h-3.5" />
          Add another calculation
        </button>
      </div>
      <p className="text-xs text-gray-500">You'll get one object with your calculated values</p>
    </div>
  );
};

const ObjectBuilder = ({ state, variables }) => {
  const { outputFields, handleOutputFieldsChange } = state;
  const inputGridRef = useRef();
  const initialGridValueRef = useRef(null);

  const initialGridValue = useMemo(() => {
    if (initialGridValueRef.current !== null) {
      return initialGridValueRef.current;
    }
    const value = (!outputFields || outputFields.length === 0) ? [] : outputFields;
    initialGridValueRef.current = value;
    return value;
  }, [outputFields]);

  return (
    <div className="space-y-2">
      <div>
        <Label className="text-sm font-medium text-gray-900">
          Build your result object<span className="text-red-500 ml-0.5">*</span>
        </Label>
        <p className="text-xs text-gray-500 -mt-1">Define the fields you want in each item of your list. Use the FX button to pick data from steps inside your loop.</p>
      </div>
      <div className="bg-white rounded-xl border border-zinc-200 shadow-sm overflow-hidden">
        <InputGridV3
          ref={inputGridRef}
          initialValue={initialGridValue}
          variables={variables}
          onGridDataChange={handleOutputFieldsChange}
          isValueMode={true}
          hideColumnType={true}
        />
      </div>
    </div>
  );
};

const ResultOptionTooltip = ({ children, content }) => (
  <Tooltip>
    <TooltipTrigger asChild>
      {children}
    </TooltipTrigger>
    <TooltipContent side="top" className="max-w-[260px] text-xs">
      {content}
    </TooltipContent>
  </Tooltip>
);

const ConfigureTab = ({ state, variables, nodeData }) => {
  const { resultMode, setResultMode } = state;

  const accentColor = nodeData?.background || "#EA580C";

  return (
    <div className="space-y-6">
      {/* What should happen with the results — primary */}
      <div className="space-y-2">
        <Label className="text-sm font-medium text-gray-900">What should happen with the results?</Label>
        <TooltipProvider delayDuration={200}>
          <div className="grid grid-cols-3 gap-2.5">
            <button
              type="button"
              onClick={() => setResultMode("collect_all")}
              className={cn(
                "relative flex items-center gap-2.5 p-2.5 pr-8 rounded-lg border-2 text-left transition-all",
                resultMode === "collect_all"
                  ? "bg-opacity-5"
                  : "border-gray-200 bg-white hover:border-gray-300"
              )}
              style={{
                borderColor: resultMode === "collect_all" ? accentColor : undefined,
                backgroundColor: resultMode === "collect_all" ? `${accentColor}10` : undefined,
              }}
            >
              <ResultOptionTooltip content="Saves the list in the given object format. Collect every result from each iteration.">
                <button
                  type="button"
                  onClick={(e) => e.stopPropagation()}
                  className="absolute top-1.5 right-1.5 p-0.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-black/5 focus:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  aria-label="More info"
                >
                  <icons.helpCircle className="w-3 h-3" />
                </button>
              </ResultOptionTooltip>
              <div
                className={cn(
                  "w-8 h-8 rounded-md flex items-center justify-center flex-shrink-0",
                )}
                style={{
                  backgroundColor: resultMode === "collect_all" ? accentColor : "#e5e7eb",
                }}
              >
                <icons.layers className="w-3.5 h-3.5" style={{ color: resultMode === "collect_all" ? "#fff" : "#6b7280" }} />
              </div>
              <div className="min-w-0 flex-1 overflow-hidden">
                <p className={cn(
                  "text-xs font-medium truncate whitespace-nowrap",
                  resultMode === "collect_all" ? "text-gray-900" : "text-gray-700"
                )}>
                  Save as a list
                </p>
                <p className="text-[11px] text-gray-500 truncate">Collect every result</p>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setResultMode("aggregate")}
              className={cn(
                "relative flex items-center gap-2.5 p-2.5 pr-8 rounded-lg border-2 text-left transition-all",
                resultMode === "aggregate"
                  ? "bg-opacity-5"
                  : "border-gray-200 bg-white hover:border-gray-300"
              )}
              style={{
                borderColor: resultMode === "aggregate" ? accentColor : undefined,
                backgroundColor: resultMode === "aggregate" ? `${accentColor}10` : undefined,
              }}
            >
              <ResultOptionTooltip content="Collects and formats into one object (totals, averages, etc.). Returns a single object with your calculated values.">
                <button
                  type="button"
                  onClick={(e) => e.stopPropagation()}
                  className="absolute top-1.5 right-1.5 p-0.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-black/5 focus:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  aria-label="More info"
                >
                  <icons.helpCircle className="w-3 h-3" />
                </button>
              </ResultOptionTooltip>
              <div
                className={cn(
                  "w-8 h-8 rounded-md flex items-center justify-center flex-shrink-0",
                )}
                style={{
                  backgroundColor: resultMode === "aggregate" ? accentColor : "#e5e7eb",
                }}
              >
                <icons.calculator className="w-3.5 h-3.5" style={{ color: resultMode === "aggregate" ? "#fff" : "#6b7280" }} />
              </div>
              <div className="min-w-0 flex-1 overflow-hidden">
                <p className={cn(
                  "text-xs font-medium truncate whitespace-nowrap",
                  resultMode === "aggregate" ? "text-gray-900" : "text-gray-700"
                )}>
                  Crunch the numbers
                </p>
                <p className="text-[11px] text-gray-500 truncate">Totals, averages & more</p>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setResultMode("no_output")}
              className={cn(
                "relative flex items-center gap-2.5 p-2.5 pr-8 rounded-lg border-2 text-left transition-all",
                resultMode === "no_output"
                  ? "bg-opacity-5"
                  : "border-gray-200 bg-white hover:border-gray-300"
              )}
              style={{
                borderColor: resultMode === "no_output" ? accentColor : undefined,
                backgroundColor: resultMode === "no_output" ? `${accentColor}10` : undefined,
              }}
            >
              <ResultOptionTooltip content="No output for this loop. Just run the loop for side effects (e.g. reduce-like behavior when you don't need the list).">
                <button
                  type="button"
                  onClick={(e) => e.stopPropagation()}
                  className="absolute top-1.5 right-1.5 p-0.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-black/5 focus:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  aria-label="More info"
                >
                  <icons.helpCircle className="w-3 h-3" />
                </button>
              </ResultOptionTooltip>
              <div
                className={cn(
                  "w-8 h-8 rounded-md flex items-center justify-center flex-shrink-0",
                )}
                style={{
                  backgroundColor: resultMode === "no_output" ? accentColor : "#e5e7eb",
                }}
              >
                <icons.eyeOff className="w-3.5 h-3.5" style={{ color: resultMode === "no_output" ? "#fff" : "#6b7280" }} />
              </div>
              <div className="min-w-0 flex-1 overflow-hidden">
                <p className={cn(
                  "text-xs font-medium truncate whitespace-nowrap",
                  resultMode === "no_output" ? "text-gray-900" : "text-gray-700"
                )}>
                  No output needed
                </p>
                <p className="text-[11px] text-gray-500 truncate">Just run the loop</p>
              </div>
            </button>
          </div>
        </TooltipProvider>
      </div>

      {resultMode === "collect_all" && (
        <ObjectBuilder state={state} variables={variables} />
      )}

      {resultMode === "aggregate" && (
        <AggregateBuilder state={state} variables={variables} />
      )}

      {resultMode === "no_output" && (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-gray-50 border border-gray-200">
          <icons.eyeOff className="w-5 h-5 text-gray-400 flex-shrink-0" />
          <div>
            <p className="text-sm font-medium text-gray-700">No output configuration needed</p>
            <p className="text-xs text-gray-500">This loop will run its steps without collecting results. Use this for loops that send emails, update records, or perform other actions where you don't need the output.</p>
          </div>
        </div>
      )}

      {/* When to use — learning, below main form */}
      <div
        className="rounded-xl p-3"
        style={{
          backgroundColor: `${accentColor}12`,
          border: `1px solid ${accentColor}30`,
        }}
      >
        <h3 className="text-xs font-medium text-gray-700 mb-2">When to use</h3>
        <div className="grid grid-cols-2 gap-1.5">
          <UseCaseItem icon={icons.layers} text="Collect API responses into a list" accentColor={accentColor} />
          <UseCaseItem icon={icons.barChart3} text="Sum or average across loop runs" accentColor={accentColor} />
          <UseCaseItem icon={icons.database} text="Build a result object from loop outputs" accentColor={accentColor} />
          <UseCaseItem icon={icons.eyeOff} text="Run loop for side effects only" accentColor={accentColor} />
        </div>
      </div>

      {/* Tip — simplified */}
      <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2">
        <p className="text-xs text-amber-800">
          For a list of objects, choose &quot;Save as a list&quot; and define fields; use the formula bar to pick data from steps inside the loop.
        </p>
      </div>
    </div>
  );
};

export default ConfigureTab;
