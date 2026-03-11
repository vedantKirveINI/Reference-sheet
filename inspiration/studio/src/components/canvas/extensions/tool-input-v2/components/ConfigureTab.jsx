import React from "react";
import { Plus, Trash2, Type, Hash, ToggleLeft, Braces, List } from "lucide-react";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { ODSFormulaBar as FormulaBar } from "@src/module/ods";
import { PARAM_TYPES } from "../constants";

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
    parameters,
    addParameter,
    removeParameter,
    updateParameter,
    validation,
  } = state;

  return (
    <div className="p-6 space-y-6">
      <div className="space-y-2">
        <Label className="text-sm font-medium text-gray-900">Tool Parameters</Label>
        <p className="text-sm text-gray-500">
          Define the input parameters that your AI tool accepts
        </p>
      </div>

      <div className="space-y-4">
        {parameters.map((param, index) => (
          <div
            key={index}
            className="p-4 rounded-xl border border-gray-200 bg-white space-y-4"
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">
                Parameter {index + 1}
              </span>
              {parameters.length > 1 && (
                <button
                  onClick={() => removeParameter(index)}
                  className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs text-gray-600">
                  Parameter Name<span className="text-red-500">*</span>
                </Label>
                <Input
                  value={param.name}
                  onChange={(e) => updateParameter(index, "name", e.target.value)}
                  placeholder="e.g., user_query"
                  className="h-10"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-xs text-gray-600">Type</Label>
                <div className="grid grid-cols-5 gap-1">
                  {PARAM_TYPES.map((type) => {
                    const IconComponent = getTypeIcon(type.id);
                    const isSelected = param.type === type.id;

                    return (
                      <button
                        key={type.id}
                        onClick={() => updateParameter(index, "type", type.id)}
                        className={cn(
                          "p-2 rounded-lg border transition-all flex flex-col items-center gap-1",
                          isSelected
                            ? "border-[#6366F1] bg-[#6366F1]/5"
                            : "border-gray-200 hover:border-gray-300"
                        )}
                        title={type.label}
                      >
                        <IconComponent
                          className="w-4 h-4"
                          style={{ color: isSelected ? "#6366F1" : type.color }}
                        />
                        <span className={cn(
                          "text-[10px]",
                          isSelected ? "text-[#6366F1] font-medium" : "text-gray-500"
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
              <Label className="text-xs text-gray-600">Description</Label>
              <Input
                value={param.description}
                onChange={(e) => updateParameter(index, "description", e.target.value)}
                placeholder="Describe what this parameter is used for"
                className="h-10"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs text-gray-600">Example Value</Label>
                <FormulaBar
                  variables={variables}
                  wrapContent
                  placeholder="Enter an example value"
                  defaultInputContent={param.example?.blocks || []}
                  onInputContentChanged={(blocks) =>
                    updateParameter(index, "example", { type: "fx", blocks })
                  }
                  slotProps={{
                    container: {
                      className: "min-h-[2.5rem] rounded-lg border border-gray-300 bg-white",
                    },
                  }}
                />
              </div>

              <div className="space-y-2">
                <Label className="text-xs text-gray-600">Required</Label>
                <div className="flex items-center gap-3 h-10">
                  <Switch
                    checked={param.required}
                    onCheckedChange={(checked) =>
                      updateParameter(index, "required", checked)
                    }
                  />
                  <span className="text-sm text-gray-600">
                    {param.required ? "Required" : "Optional"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <Button
        variant="outline"
        onClick={addParameter}
        className="w-full border-dashed border-gray-300 text-gray-600 hover:border-[#6366F1] hover:text-[#6366F1]"
      >
        <Plus className="w-4 h-4 mr-2" />
        Add Parameter
      </Button>

      {!validation.isValid && (
        <div className="p-3 rounded-lg bg-red-50 border border-red-200">
          <p className="text-sm text-red-600">{validation.errors[0]}</p>
        </div>
      )}

      <div className="bg-gray-50 rounded-xl p-4 space-y-3">
        <h4 className="font-medium text-gray-900 text-sm">Example Schema</h4>
        <div className="bg-white rounded-lg p-3 border border-gray-200">
          <code className="text-sm text-gray-700 whitespace-pre">
            {`{
  "name": "string",
  "type": "STRING | NUMBER | BOOLEAN | OBJECT | ARRAY",
  "description": "What this parameter does",
  "required": true
}`}
          </code>
        </div>
      </div>
    </div>
  );
};

export default ConfigureTab;
