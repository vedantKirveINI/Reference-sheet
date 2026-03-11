import React from "react";
import { Info, Bug, AlertTriangle, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ODSFormulaBar as FormulaBar } from "@src/module/ods";
import { LOG_LEVELS } from "../constants";

const getLogIcon = (logType) => {
  const icons = {
    INFO: Info,
    DEBUG: Bug,
    WARN: AlertTriangle,
    ERROR: XCircle,
  };
  return icons[logType] || Info;
};

const ConfigureTab = ({ state, variables }) => {
  const { 
    logType, 
    setLogType, 
    content, 
    setContent, 
    validation 
  } = state;

  const currentLevel = LOG_LEVELS.find(l => l.id === logType);
  const IconComponent = getLogIcon(logType);

  return (
    <div className="p-4 space-y-5">
      <div className="space-y-2">
        <Label className="text-sm font-medium text-gray-900">
          What to log<span className="text-red-500 ml-0.5">*</span>
        </Label>
        <FormulaBar
          variables={variables}
          wrapContent
          placeholder="Enter value to log, e.g., {{customer.email}}"
          defaultInputContent={content?.blocks || []}
          onInputContentChanged={(blocks) => setContent({ type: "fx", blocks })}
          slotProps={{
            container: {
              className: cn(
                "min-h-[100px] rounded-xl border bg-white px-3 py-2",
                !validation.isValid 
                  ? "border-red-400 focus-within:ring-2 focus-within:ring-red-200" 
                  : "border-gray-300 focus-within:ring-2 focus-within:ring-blue-200 focus-within:border-blue-400"
              ),
            },
          }}
        />
        {!validation.isValid && (
          <p className="text-sm text-red-500">{validation.errors[0]}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label className="text-sm font-medium text-gray-900">Log Level</Label>
        <Select value={logType} onValueChange={setLogType}>
          <SelectTrigger className="w-full h-10 rounded-lg border-gray-300">
            <SelectValue>
              <div className="flex items-center gap-2">
                <IconComponent className="w-4 h-4" style={{ color: currentLevel?.color }} />
                <span>{currentLevel?.label}</span>
              </div>
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {LOG_LEVELS.map((level) => {
              const LevelIcon = getLogIcon(level.id);
              return (
                <SelectItem key={level.id} value={level.id}>
                  <div className="flex items-center gap-2">
                    <LevelIcon className="w-4 h-4" style={{ color: level.color }} />
                    <span>{level.label}</span>
                  </div>
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>
      </div>

      <p className="text-xs text-gray-400">
        Use {"{{variable}}"} to insert data from previous workflow steps.
      </p>
    </div>
  );
};

export default ConfigureTab;
