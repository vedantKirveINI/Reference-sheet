import React from "react";
import { Plus, Trash2, Type, Hash, Braces, List } from "lucide-react";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { INPUT_TYPES } from "../constants";

const getTypeIcon = (type) => {
  const icons = {
    text: Type,
    number: Hash,
    object: Braces,
    array: List,
  };
  return icons[type] || Type;
};

const ConfigureTab = ({ state }) => {
  const { inputs, addInput, updateInput, removeInput, validation } = state;

  return (
    <div className="p-6 space-y-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label className="text-sm font-medium text-gray-900">Input Parameters</Label>
          <button
            onClick={addInput}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-[#22C55E] hover:bg-[#22C55E]/10 rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Input
          </button>
        </div>

        {inputs.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>No inputs defined. Click "Add Input" to get started.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {inputs.map((input, index) => (
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
                          value={input.name || ""}
                          onChange={(e) => updateInput(index, "name", e.target.value)}
                          placeholder="e.g., message"
                          className={cn(
                            "h-9",
                            !input.name && !validation.isValid && "border-red-400"
                          )}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs text-gray-600">Type</Label>
                        <div className="grid grid-cols-4 gap-1">
                          {INPUT_TYPES.map((type) => {
                            const IconComponent = getTypeIcon(type.id);
                            const isSelected = input.type === type.id;
                            return (
                              <button
                                key={type.id}
                                onClick={() => updateInput(index, "type", type.id)}
                                className={cn(
                                  "p-2 rounded-lg border transition-all flex flex-col items-center gap-1",
                                  isSelected
                                    ? "border-[#22C55E] bg-[#22C55E]/10 text-[#22C55E]"
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
                      <Label className="text-xs text-gray-600">Description</Label>
                      <Input
                        value={input.description || ""}
                        onChange={(e) => updateInput(index, "description", e.target.value)}
                        placeholder="Describe what this input is for..."
                        className="h-9"
                      />
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={input.required || false}
                          onCheckedChange={(checked) => updateInput(index, "required", checked)}
                        />
                        <Label className="text-sm text-gray-600">Required</Label>
                      </div>
                      <button
                        onClick={() => removeInput(index)}
                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        disabled={inputs.length === 1}
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
          <li>• Use descriptive names for better readability</li>
          <li>• Mark required inputs to ensure data validation</li>
          <li>• Choose the appropriate type for data integrity</li>
        </ul>
      </div>
    </div>
  );
};

export default ConfigureTab;
