import React, { useState } from "react";
import { Repeat, Database, Globe, Layers, ChevronDown, ChevronUp, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import { ODSFormulaBar as FormulaBar } from "@src/module/ods";
import { ITERATOR_TEMPLATES } from "../constants";

const getIconComponent = (iconName) => {
  const icons = {
    Database: Database,
    Globe: Globe,
    Layers: Layers,
  };
  return icons[iconName] || Repeat;
};

const ConfigureTab = ({ state, variables }) => {
  const { content, setContent, validation, selectedTemplateId, selectTemplate } = state;
  const [templatesExpanded, setTemplatesExpanded] = useState(!selectedTemplateId);

  return (
    <div className="space-y-6">
      <div className="border border-gray-200 rounded-xl overflow-hidden">
        <button
          onClick={() => setTemplatesExpanded(!templatesExpanded)}
          className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-[#10B981]/10 rounded-lg flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-[#10B981]" />
            </div>
            <div className="text-left">
              <span className="font-medium text-gray-900 text-sm">Quick Start Templates</span>
              {selectedTemplateId && (
                <p className="text-xs text-gray-500">
                  Using: {ITERATOR_TEMPLATES.find(t => t.id === selectedTemplateId)?.name}
                </p>
              )}
            </div>
          </div>
          {templatesExpanded ? (
            <ChevronUp className="w-5 h-5 text-gray-400" />
          ) : (
            <ChevronDown className="w-5 h-5 text-gray-400" />
          )}
        </button>
        
        {templatesExpanded && (
          <div className="p-4 space-y-2 bg-white">
            {ITERATOR_TEMPLATES.map((template) => {
              const IconComponent = getIconComponent(template.icon);
              const isSelected = selectedTemplateId === template.id;
              
              return (
                <button
                  key={template.id}
                  onClick={() => {
                    selectTemplate(template.id);
                    setTemplatesExpanded(false);
                  }}
                  className={cn(
                    "w-full p-3 rounded-lg border text-left transition-all",
                    "hover:border-[#10B981] hover:bg-[#10B981]/5",
                    isSelected
                      ? "border-[#10B981] bg-[#10B981]/5"
                      : "border-gray-200 bg-white"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "w-8 h-8 rounded-lg flex items-center justify-center",
                      isSelected ? "bg-[#10B981] text-white" : "bg-gray-100 text-gray-600"
                    )}>
                      <IconComponent className="w-4 h-4" />
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-gray-900 text-sm">{template.name}</div>
                      <div className="text-xs text-gray-500">{template.description}</div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      <div className="space-y-3">
        <Label className="text-sm font-medium text-gray-900">
          Array to iterate<span className="text-red-500">*</span>
        </Label>
        <FormulaBar
          variables={variables}
          wrapContent
          placeholder="Choose an array to iterate over, e.g., {{customers}} or {{api_response.items}}"
          defaultInputContent={content?.blocks || []}
          onInputContentChanged={(blocks) => setContent({ type: "fx", blocks })}
          slotProps={{
            container: {
              className: cn(
                "min-h-[120px] rounded-xl border border-gray-300 bg-white",
                !validation.isValid && "border-red-400"
              ),
            },
          }}
        />
        <p className={cn(
          "text-sm",
          !validation.isValid ? "text-red-500" : "text-gray-400"
        )}>
          {!validation.isValid 
            ? validation.errors[0] 
            : "Select an array variable from previous steps to loop through each item"
          }
        </p>
      </div>

      <div className="bg-gray-50 rounded-xl p-4 space-y-3">
        <h4 className="font-medium text-gray-900 text-sm">Example</h4>
        <div className="bg-white rounded-lg p-3 border border-gray-200">
          <code className="text-sm text-gray-700">
            Iterate over {"{{customers}}"} to send individual emails
          </code>
        </div>
        <p className="text-xs text-gray-500">
          Each iteration will have access to the current item via the Iterator node's output
        </p>
      </div>

      <div className="bg-emerald-50 rounded-xl p-4 space-y-3">
        <h4 className="font-medium text-emerald-900 text-sm flex items-center gap-2">
          <Repeat className="w-4 h-4" />
          How Iterator Works
        </h4>
        <div className="text-sm text-emerald-800 space-y-2">
          <p>1. Iterator receives an array of items</p>
          <p>2. For each item, it executes all nodes connected after it</p>
          <p>3. Use Array Aggregator to collect results back into an array</p>
        </div>
      </div>
    </div>
  );
};

export default ConfigureTab;
