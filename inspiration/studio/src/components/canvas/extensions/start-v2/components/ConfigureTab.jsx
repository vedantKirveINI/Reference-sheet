import React, { useState } from "react";
import { Play, Clock, Webhook, Plus, Trash2, ChevronDown, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ODSFormulaBar as FormulaBar } from "@src/module/ods";
import { START_TYPES, START_TEMPLATES } from "../constants";

const getStartIcon = (startType) => {
  const icons = {
    manual: Play,
    scheduled: Clock,
    webhook: Webhook,
  };
  return icons[startType] || Play;
};

const getTemplateIcon = (iconName) => {
  const icons = {
    Play: Play,
    Clock: Clock,
    Webhook: Webhook,
  };
  return icons[iconName] || Play;
};

const ConfigureTab = ({ state, variables: contextVariables }) => {
  const {
    startType,
    setStartType,
    variables,
    addVariable,
    updateVariable,
    removeVariable,
    inputSchema,
    setInputSchema,
    selectedTemplateId,
    selectTemplate,
  } = state;

  const [showTemplates, setShowTemplates] = useState(false);

  const currentType = START_TYPES.find((t) => t.id === startType) || START_TYPES[0];
  const selectedTemplate = START_TEMPLATES.find((t) => t.id === selectedTemplateId);

  const handleAddVariable = () => {
    addVariable({
      name: "",
      value: { type: "fx", blocks: [{ type: "PRIMITIVES", value: "" }] },
    });
  };

  const handleTemplateSelect = (templateId) => {
    selectTemplate(templateId);
    setShowTemplates(false);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="space-y-3">
        <button
          onClick={() => setShowTemplates(!showTemplates)}
          className="w-full flex items-center justify-between p-3 rounded-xl border border-gray-200 hover:border-gray-300 bg-white transition-all"
        >
          <div className="flex items-center gap-3">
            {selectedTemplate ? (
              <>
                {React.createElement(getTemplateIcon(selectedTemplate.icon), {
                  className: "w-5 h-5 text-[#22C55E]",
                })}
                <div className="text-left">
                  <div className="font-medium text-gray-900 text-sm">{selectedTemplate.name}</div>
                  <div className="text-xs text-gray-500">{selectedTemplate.description}</div>
                </div>
              </>
            ) : (
              <>
                <Play className="w-5 h-5 text-gray-400" />
                <span className="text-sm text-gray-500">Choose a template (optional)</span>
              </>
            )}
          </div>
          {showTemplates ? (
            <ChevronDown className="w-4 h-4 text-gray-400" />
          ) : (
            <ChevronRight className="w-4 h-4 text-gray-400" />
          )}
        </button>

        {showTemplates && (
          <div className="border border-gray-200 rounded-xl overflow-hidden bg-white">
            {START_TEMPLATES.map((template) => {
              const TemplateIcon = getTemplateIcon(template.icon);
              const isSelected = selectedTemplateId === template.id;

              return (
                <button
                  key={template.id}
                  onClick={() => handleTemplateSelect(template.id)}
                  className={cn(
                    "w-full flex items-center gap-3 p-3 text-left transition-all border-b border-gray-100 last:border-b-0",
                    isSelected
                      ? "bg-[#22C55E]/5"
                      : "hover:bg-gray-50"
                  )}
                >
                  <div
                    className={cn(
                      "w-8 h-8 rounded-lg flex items-center justify-center",
                      isSelected ? "bg-[#22C55E] text-white" : "bg-gray-100 text-gray-600"
                    )}
                  >
                    <TemplateIcon className="w-4 h-4" />
                  </div>
                  <div className="flex-1">
                    <div className={cn("font-medium text-sm", isSelected ? "text-[#22C55E]" : "text-gray-900")}>
                      {template.name}
                    </div>
                    <div className="text-xs text-gray-500">{template.description}</div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      <div className="space-y-3">
        <Label className="text-sm font-medium text-gray-900">Start Type</Label>
        <div className="grid grid-cols-3 gap-2">
          {START_TYPES.map((type) => {
            const IconComponent = getStartIcon(type.id);
            const isSelected = startType === type.id;

            return (
              <button
                key={type.id}
                onClick={() => setStartType(type.id)}
                className={cn(
                  "p-3 rounded-xl border-2 transition-all flex flex-col items-center gap-2",
                  isSelected
                    ? "border-[#22C55E] bg-[#22C55E]/5"
                    : "border-gray-200 hover:border-gray-300 bg-white"
                )}
              >
                <IconComponent
                  className="w-5 h-5"
                  style={{ color: type.color }}
                />
                <span
                  className={cn(
                    "text-sm font-medium",
                    isSelected ? "text-[#22C55E]" : "text-gray-700"
                  )}
                >
                  {type.label}
                </span>
              </button>
            );
          })}
        </div>
        <p className="text-sm text-gray-500">{currentType.description}</p>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label className="text-sm font-medium text-gray-900">Initial Variables</Label>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleAddVariable}
            className="h-8 text-[#22C55E] hover:text-[#16a34a] hover:bg-[#22C55E]/10"
          >
            <Plus className="w-4 h-4 mr-1" />
            Add Variable
          </Button>
        </div>

        {variables.length === 0 ? (
          <div className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center">
            <p className="text-sm text-gray-500">
              No variables defined. Add variables to pass initial data into your workflow.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {variables.map((variable, index) => (
              <div
                key={index}
                className="p-4 border border-gray-200 rounded-xl space-y-3"
              >
                <div className="flex items-center gap-2">
                  <Input
                    value={variable.name}
                    onChange={(e) =>
                      updateVariable(index, { ...variable, name: e.target.value })
                    }
                    placeholder="Variable name"
                    className="flex-1"
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeVariable(index)}
                    className="h-9 w-9 p-0 text-gray-400 hover:text-red-500 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
                <FormulaBar
                  variables={contextVariables}
                  wrapContent
                  placeholder="Default value"
                  defaultInputContent={variable.value?.blocks || []}
                  onInputContentChanged={(blocks) =>
                    updateVariable(index, {
                      ...variable,
                      value: { type: "fx", blocks },
                    })
                  }
                  slotProps={{
                    container: {
                      className: "min-h-[60px] rounded-lg border border-gray-300 bg-white",
                    },
                  }}
                />
              </div>
            ))}
          </div>
        )}
        <p className="text-sm text-gray-400">
          Define variables that will be available at the start of your workflow
        </p>
      </div>

      <div className="space-y-3">
        <Label className="text-sm font-medium text-gray-900">
          Input Schema <span className="text-gray-400 font-normal">(optional)</span>
        </Label>
        <FormulaBar
          variables={contextVariables}
          wrapContent
          placeholder="Define the expected input structure, e.g., {name: string, email: string}"
          defaultInputContent={inputSchema?.blocks || []}
          onInputContentChanged={(blocks) => setInputSchema({ type: "fx", blocks })}
          slotProps={{
            container: {
              className: "min-h-[80px] rounded-xl border border-gray-300 bg-white",
            },
          }}
        />
        <p className="text-sm text-gray-400">
          Describe the shape of data this workflow expects to receive
        </p>
      </div>

      <div className="bg-[#22C55E]/10 rounded-xl p-4 space-y-3">
        <h4 className="font-medium text-gray-900 text-sm">Quick Tips</h4>
        <ul className="space-y-2 text-sm text-gray-600">
          <li className="flex items-start gap-2">
            <span className="text-[#22C55E] mt-0.5">•</span>
            <span>Variables defined here are accessible throughout the workflow</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-[#22C55E] mt-0.5">•</span>
            <span>Use input schema to validate incoming webhook data</span>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default ConfigureTab;
