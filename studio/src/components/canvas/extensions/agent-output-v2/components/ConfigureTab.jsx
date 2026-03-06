import React from "react";
import { Plus, Trash2, Type, Hash, Braces, List } from "lucide-react";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { ODSFormulaBar as FormulaBar } from "@src/module/ods";
import { OUTPUT_TYPES, FORMAT_OPTIONS } from "../constants";

const getTypeIcon = (type) => {
  const icons = {
    text: Type,
    number: Hash,
    object: Braces,
    array: List,
  };
  return icons[type] || Type;
};

const ConfigureTab = ({ state, variables }) => {
  const { outputs, addOutput, updateOutput, removeOutput, validation } = state;

  return (
    <div className="p-6 space-y-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label className="text-sm font-medium text-gray-900">Output Parameters</Label>
          <button
            onClick={addOutput}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-[#3B82F6] hover:bg-[#3B82F6]/10 rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Output
          </button>
        </div>

        {outputs.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>No outputs defined. Click "Add Output" to get started.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {outputs.map((output, index) => (
              <div
                key={index}
                className="p-4 rounded-xl border border-gray-200 bg-white space-y-4"
              >
                <div className="flex items-start gap-4">
                  <div className="flex-1 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-xs text-gray-600">Name<span className="text-red-500">*</span></Label>
                        <Input
                          value={output.name || ""}
                          onChange={(e) => updateOutput(index, "name", e.target.value)}
                          placeholder="e.g., response"
                          className={cn(
                            "h-9",
                            !output.name && !validation.isValid && "border-red-400"
                          )}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs text-gray-600">Type</Label>
                        <div className="grid grid-cols-4 gap-1">
                          {OUTPUT_TYPES.map((type) => {
                            const IconComponent = getTypeIcon(type.id);
                            const isSelected = output.type === type.id;
                            return (
                              <button
                                key={type.id}
                                onClick={() => updateOutput(index, "type", type.id)}
                                className={cn(
                                  "p-2 rounded-lg border transition-all flex flex-col items-center gap-1",
                                  isSelected
                                    ? "border-[#3B82F6] bg-[#3B82F6]/10 text-[#3B82F6]"
                                    : "border-gray-200 hover:border-gray-300 text-gray-600"
                                )}
                                title={type.description}
                              >
                                <IconComponent className="w-4 h-4" />
                                <span className="text-xs">{type.label}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-xs text-gray-600">Output Value</Label>
                      <FormulaBar
                        variables={variables}
                        wrapContent
                        placeholder="Enter the output value, e.g., {{result.data}} or a static value"
                        defaultInputContent={output.value?.blocks || []}
                        onInputContentChanged={(blocks) => 
                          updateOutput(index, "value", { type: "fx", blocks })
                        }
                        slotProps={{
                          container: {
                            className: cn(
                              "min-h-[80px] rounded-xl border border-gray-300 bg-white"
                            ),
                          },
                        }}
                      />
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                      <div className="space-y-2">
                        <Label className="text-xs text-gray-600">Format</Label>
                        <div className="flex gap-1">
                          {FORMAT_OPTIONS.map((format) => {
                            const isSelected = output.format === format.id;
                            return (
                              <button
                                key={format.id}
                                onClick={() => updateOutput(index, "format", format.id)}
                                className={cn(
                                  "px-3 py-1.5 text-xs rounded-lg border transition-all",
                                  isSelected
                                    ? "border-[#3B82F6] bg-[#3B82F6]/10 text-[#3B82F6]"
                                    : "border-gray-200 hover:border-gray-300 text-gray-600"
                                )}
                                title={format.description}
                              >
                                {format.label}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                      <button
                        onClick={() => removeOutput(index)}
                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        disabled={outputs.length === 1}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {!validation.isValid && (
          <div className="p-3 bg-red-50 rounded-lg">
            <ul className="text-sm text-red-600 space-y-1">
              {validation.errors.map((error, i) => (
                <li key={i}>• {error}</li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <div className="bg-gray-50 rounded-xl p-4 space-y-3">
        <h4 className="font-medium text-gray-900 text-sm">Tips</h4>
        <ul className="text-sm text-gray-600 space-y-1">
          <li>• Use {"{{data}}"} syntax to reference values from previous steps</li>
          <li>• Choose JSON format for structured data responses</li>
          <li>• Use Markdown format for rich text output</li>
        </ul>
      </div>
    </div>
  );
};

export default ConfigureTab;
