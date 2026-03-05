import React from "react";
import { Plus, Trash2, Type, Hash, ToggleLeft, Braces, List } from "lucide-react";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ODSFormulaBar as FormulaBar } from "@src/module/ods";
import { OUTPUT_TYPES, FORMAT_OPTIONS } from "../constants";

const getTypeIcon = (type) => {
  const icons = {
    STRING: Type,
    NUMBER: Hash,
    BOOLEAN: ToggleLeft,
    OBJECT: Braces,
    ARRAY: List,
  };
  return icons[type] || Type;
};

const ConfigureTab = ({ state, variables }) => {
  const {
    outputs,
    addOutput,
    removeOutput,
    updateOutput,
    validation,
  } = state;

  return (
    <div className="p-6 space-y-6">
      <div className="space-y-2">
        <Label className="text-sm font-medium text-gray-900">Tool Outputs</Label>
        <p className="text-sm text-gray-500">
          Define the response schema that your AI tool returns
        </p>
      </div>

      <div className="space-y-4">
        {outputs.map((output, index) => (
          <div
            key={index}
            className="p-4 rounded-xl border border-gray-200 bg-white space-y-4"
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">
                Output {index + 1}
              </span>
              {outputs.length > 1 && (
                <button
                  onClick={() => removeOutput(index)}
                  className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs text-gray-600">
                  Output Name<span className="text-red-500">*</span>
                </Label>
                <Input
                  value={output.name}
                  onChange={(e) => updateOutput(index, "name", e.target.value)}
                  placeholder="e.g., result"
                  className="h-10"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-xs text-gray-600">Type</Label>
                <div className="grid grid-cols-5 gap-1">
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
                            ? "border-[#10B981] bg-[#10B981]/5"
                            : "border-gray-200 hover:border-gray-300"
                        )}
                        title={type.label}
                      >
                        <IconComponent
                          className="w-4 h-4"
                          style={{ color: isSelected ? "#10B981" : type.color }}
                        />
                        <span className={cn(
                          "text-[10px]",
                          isSelected ? "text-[#10B981] font-medium" : "text-gray-500"
                        )}>
                          {type.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-xs text-gray-600">
                Output Value<span className="text-red-500">*</span>
              </Label>
              <FormulaBar
                variables={variables}
                wrapContent
                placeholder="Map the output value from workflow data"
                defaultInputContent={output.value?.blocks || []}
                onInputContentChanged={(blocks) =>
                  updateOutput(index, "value", { type: "fx", blocks })
                }
                slotProps={{
                  container: {
                    className: "min-h-[5rem] rounded-lg border border-gray-300 bg-white",
                  },
                }}
              />
              <p className="text-xs text-gray-400">
                Use {"{{data}}"} to map values from previous workflow steps
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs text-gray-600">Description</Label>
                <Input
                  value={output.description}
                  onChange={(e) => updateOutput(index, "description", e.target.value)}
                  placeholder="Describe this output"
                  className="h-10"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-xs text-gray-600">Format</Label>
                <div className="grid grid-cols-4 gap-1">
                  {FORMAT_OPTIONS.map((format) => {
                    const isSelected = output.format === format.id;

                    return (
                      <button
                        key={format.id}
                        onClick={() => updateOutput(index, "format", format.id)}
                        className={cn(
                          "py-2 px-3 rounded-lg border transition-all text-center",
                          isSelected
                            ? "border-[#10B981] bg-[#10B981]/5 text-[#10B981]"
                            : "border-gray-200 hover:border-gray-300 text-gray-600"
                        )}
                        title={format.description}
                      >
                        <span className="text-xs font-medium">{format.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <Button
        variant="outline"
        onClick={addOutput}
        className="w-full border-dashed border-gray-300 text-gray-600 hover:border-[#10B981] hover:text-[#10B981]"
      >
        <Plus className="w-4 h-4 mr-2" />
        Add Output
      </Button>

      {!validation.isValid && (
        <div className="p-3 rounded-lg bg-red-50 border border-red-200">
          <p className="text-sm text-red-600">{validation.errors[0]}</p>
        </div>
      )}

      <div className="bg-gray-50 rounded-xl p-4 space-y-3">
        <h4 className="font-medium text-gray-900 text-sm">Example Response Schema</h4>
        <div className="bg-white rounded-lg p-3 border border-gray-200">
          <code className="text-sm text-gray-700 whitespace-pre">
            {`{
  "name": "result",
  "type": "STRING | OBJECT | ARRAY",
  "value": "mapped from workflow",
  "format": "json | raw | text | markdown"
}`}
          </code>
        </div>
      </div>
    </div>
  );
};

export default ConfigureTab;
