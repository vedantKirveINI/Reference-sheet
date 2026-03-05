import React, { useMemo, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Clock, Timer, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import { ODSFormulaBar as FormulaBar } from "@src/module/ods";
import { THEME } from "../constants";

const formatDuration = (ms) => {
  if (ms === null || ms === undefined || isNaN(ms) || ms < 0) {
    return null;
  }
  
  if (ms < 1000) {
    return `${ms} millisecond${ms !== 1 ? 's' : ''}`;
  }
  
  const seconds = ms / 1000;
  if (seconds < 60) {
    const displaySeconds = Number.isInteger(seconds) ? seconds : seconds.toFixed(1);
    return `${displaySeconds} second${seconds !== 1 ? 's' : ''}`;
  }
  
  const minutes = seconds / 60;
  if (minutes < 60) {
    const displayMinutes = Number.isInteger(minutes) ? minutes : minutes.toFixed(1);
    return `${displayMinutes} minute${minutes !== 1 ? 's' : ''}`;
  }
  
  const hours = minutes / 60;
  const displayHours = Number.isInteger(hours) ? hours : hours.toFixed(1);
  return `${displayHours} hour${hours !== 1 ? 's' : ''}`;
};

const DURATION_PRESETS = [
  { label: "1 sec", value: 1000 },
  { label: "5 sec", value: 5000 },
  { label: "30 sec", value: 30000 },
  { label: "1 min", value: 60000 },
  { label: "5 min", value: 300000 },
  { label: "15 min", value: 900000 },
];

const ConfigureTab = ({ state, variables, initialDataKey = 0 }) => {
  const { delayTime, setDelayTime, validation } = state;
  const [presetClickCount, setPresetClickCount] = useState(0);

  const currentValue = useMemo(() => {
    const primitiveBlock = delayTime?.blocks?.find(
      (block) => block.type === "PRIMITIVES" && block.value
    );
    return primitiveBlock ? parseFloat(primitiveBlock.value) : null;
  }, [delayTime]);

  const humanReadableDuration = useMemo(() => {
    if (currentValue !== null && !isNaN(currentValue)) {
      return formatDuration(currentValue);
    }
    
    const hasVariable = delayTime?.blocks?.some(
      (block) => block.type !== "PRIMITIVES" && block.value
    );
    if (hasVariable) {
      return "Duration determined at runtime";
    }
    return null;
  }, [delayTime, currentValue]);

  const formulaBarKey = `${initialDataKey}-${presetClickCount}`;

  const handlePresetClick = useCallback((value) => {
    setDelayTime({ 
      type: "fx", 
      blocks: [{ type: "PRIMITIVES", value: value.toString() }] 
    });
    setPresetClickCount((prev) => prev + 1);
  }, [setDelayTime]);

  const isPresetSelected = (presetValue) => {
    return currentValue === presetValue;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl border border-gray-200">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ backgroundColor: THEME.iconBg }}
        >
          <Timer className="w-5 h-5" style={{ color: THEME.iconColor }} />
        </div>
        <div>
          <h3 className="font-medium text-gray-900">Pause Workflow</h3>
          <p className="text-sm text-gray-500 mt-0.5">
            Add a delay before the next step executes. Use presets or enter a custom duration.
          </p>
        </div>
      </div>

      <div className="space-y-3">
        <Label className="text-sm font-medium text-gray-900">Quick Presets</Label>
        <div className="grid grid-cols-3 gap-2">
          {DURATION_PRESETS.map((preset) => {
            const isSelected = isPresetSelected(preset.value);
            return (
              <motion.button
                key={preset.value}
                onClick={() => handlePresetClick(preset.value)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={cn(
                  "p-3 rounded-xl border-2 transition-all text-center",
                  isSelected
                    ? "border-[#D97706] bg-[#D97706]/5"
                    : "border-gray-200 hover:border-gray-300 bg-white"
                )}
              >
                <span className={cn(
                  "text-sm font-medium",
                  isSelected ? "text-[#D97706]" : "text-gray-700"
                )}>
                  {preset.label}
                </span>
              </motion.button>
            );
          })}
        </div>
      </div>

      <div className="space-y-3">
        <Label className="text-sm font-medium text-gray-900">
          Custom Duration (milliseconds)<span className="text-red-500 ml-0.5">*</span>
        </Label>
        <FormulaBar
          key={formulaBarKey}
          variables={variables}
          wrapContent
          placeholder="Enter delay in milliseconds, e.g., 1000 for 1 second"
          defaultInputContent={delayTime?.blocks || []}
          onInputContentChanged={(blocks) => setDelayTime({ type: "fx", blocks })}
          slotProps={{
            container: {
              className: cn(
                "min-h-[56px] rounded-xl border bg-white px-3 py-2",
                !validation.isValid 
                  ? "border-red-400 focus-within:ring-2 focus-within:ring-red-200" 
                  : "border-gray-300 focus-within:ring-2 focus-within:ring-gray-200 focus-within:border-gray-400"
              ),
            },
          }}
        />
        
        {!validation.isValid && (
          <p className="text-sm text-red-500 flex items-center gap-1.5">
            <Info className="w-4 h-4" />
            {validation.errors[0]}
          </p>
        )}

        {humanReadableDuration && validation.isValid && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Clock className="w-4 h-4 text-gray-400" />
            <span>
              Will wait for <span className="font-medium text-gray-900">{humanReadableDuration}</span>
            </span>
          </div>
        )}
      </div>

      <div className="bg-gray-50 rounded-xl p-4 space-y-3">
        <h4 className="font-medium text-gray-900 text-sm flex items-center gap-2">
          <Info className="w-4 h-4 text-gray-500" />
          Tips
        </h4>
        <ul className="text-sm text-gray-600 space-y-1.5">
          <li className="flex items-start gap-2">
            <span className="text-gray-400 mt-0.5">•</span>
            <span>Use <code className="px-1.5 py-0.5 bg-white rounded border border-gray-200 text-xs font-mono">{"{{variable}}"}</code> to set delay dynamically from previous steps</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-gray-400 mt-0.5">•</span>
            <span>1 second = 1,000 milliseconds</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-gray-400 mt-0.5">•</span>
            <span>1 minute = 60,000 milliseconds</span>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default ConfigureTab;
