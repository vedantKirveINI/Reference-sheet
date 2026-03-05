import React, { useState } from "react";
import { Layers, Repeat, ArrowRight, ChevronDown, ChevronUp, Merge, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import { ODSFormulaBar as FormulaBar } from "@src/module/ods";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getAggregatorSources } from "../utils";
import { AGGREGATOR_TEMPLATES } from "../constants";

const getIconComponent = (iconName) => {
  const icons = {
    Layers: Layers,
    Merge: Merge,
  };
  return icons[iconName] || Layers;
};

const ConfigureTab = ({ state, variables }) => {
  const { source, setSource, mapping, setMapping, validation, selectedTemplateId, isFromScratch, selectTemplate, startFromScratch } = state;
  const sources = getAggregatorSources(variables);
  const [templateSelectorOpen, setTemplateSelectorOpen] = useState(false);

  const currentTemplateName = selectedTemplateId 
    ? AGGREGATOR_TEMPLATES.find(t => t.id === selectedTemplateId)?.name 
    : isFromScratch 
      ? "Custom configuration" 
      : "Choose a template";

  return (
    <div className="space-y-6">
      <div 
        className={cn(
          "rounded-xl border transition-all",
          templateSelectorOpen ? "border-[#14B8A6] bg-[#14B8A6]/5" : "border-gray-200 bg-white"
        )}
      >
        <button
          onClick={() => setTemplateSelectorOpen(!templateSelectorOpen)}
          className="w-full p-4 flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#14B8A6]/10 rounded-lg flex items-center justify-center">
              <Zap className="w-5 h-5 text-[#14B8A6]" />
            </div>
            <div className="text-left">
              <div className="font-medium text-gray-900">Quick Start Template</div>
              <div className="text-sm text-gray-500">{currentTemplateName}</div>
            </div>
          </div>
          {templateSelectorOpen ? (
            <ChevronUp className="w-5 h-5 text-gray-400" />
          ) : (
            <ChevronDown className="w-5 h-5 text-gray-400" />
          )}
        </button>

        {templateSelectorOpen && (
          <div className="px-4 pb-4 space-y-3">
            <div className="border-t border-gray-100 pt-3" />
            <button
              onClick={() => {
                startFromScratch();
                setTemplateSelectorOpen(false);
              }}
              className={cn(
                "w-full p-3 rounded-lg border text-left transition-all",
                "hover:border-gray-400",
                isFromScratch
                  ? "border-gray-900 bg-gray-50"
                  : "border-gray-200 bg-white"
              )}
            >
              <span className="font-medium text-gray-900 text-sm">Start from scratch</span>
              <p className="text-xs text-gray-500 mt-0.5">Configure your own aggregator settings</p>
            </button>

            <div className="grid gap-2">
              {AGGREGATOR_TEMPLATES.map((template) => {
                const IconComponent = getIconComponent(template.icon);
                const isSelected = selectedTemplateId === template.id;
                
                return (
                  <button
                    key={template.id}
                    onClick={() => {
                      selectTemplate(template.id);
                      setTemplateSelectorOpen(false);
                    }}
                    className={cn(
                      "w-full p-3 rounded-lg border text-left transition-all",
                      "hover:border-[#14B8A6] hover:bg-[#14B8A6]/5",
                      isSelected
                        ? "border-[#14B8A6] bg-[#14B8A6]/5"
                        : "border-gray-200 bg-white"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "w-8 h-8 rounded-lg flex items-center justify-center",
                        isSelected ? "bg-[#14B8A6] text-white" : "bg-gray-100 text-gray-600"
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
          </div>
        )}
      </div>

      <div className="flex items-center gap-3 pb-4 border-b border-gray-200">
        <div className="w-10 h-10 bg-[#14B8A6]/10 rounded-lg flex items-center justify-center">
          <Layers className="w-5 h-5 text-[#14B8A6]" />
        </div>
        <div>
          <h3 className="font-medium text-gray-900">Array Aggregator Configuration</h3>
          <p className="text-sm text-gray-500">Select source iterator and configure mapping</p>
        </div>
      </div>

      <div className="space-y-3">
        <Label className="text-sm font-medium text-gray-900">
          Source Iterator<span className="text-red-500">*</span>
        </Label>
        <Select
          value={source?.key || ""}
          onValueChange={(value) => {
            const selectedSource = sources.find((s) => s.key === value);
            setSource(selectedSource || null);
          }}
        >
          <SelectTrigger 
            className={cn(
              "w-full h-12 rounded-xl border bg-white",
              !validation.isValid && !source ? "border-red-400" : "border-gray-300"
            )}
          >
            <SelectValue placeholder="Select an Iterator node">
              {source ? (
                <div className="flex items-center gap-2">
                  <Repeat className="w-4 h-4 text-[#10B981]" />
                  <span>{source.name}</span>
                </div>
              ) : null}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {sources.length === 0 ? (
              <div className="p-4 text-center text-sm text-gray-500">
                No Iterator nodes found. Add an Iterator before this node.
              </div>
            ) : (
              sources.map((iteratorSource) => (
                <SelectItem key={iteratorSource.key} value={iteratorSource.key}>
                  <div className="flex items-center gap-2">
                    <Repeat className="w-4 h-4 text-[#10B981]" />
                    <span>{iteratorSource.name}</span>
                  </div>
                </SelectItem>
              ))
            )}
          </SelectContent>
        </Select>
        <p className={cn(
          "text-sm",
          !validation.isValid && !source ? "text-red-500" : "text-gray-400"
        )}>
          {!validation.isValid && !source
            ? validation.errors[0]
            : "Choose which Iterator's results to collect"
          }
        </p>
      </div>

      <div className="space-y-3">
        <Label className="text-sm font-medium text-gray-900">
          Mapping (Optional)
        </Label>
        <FormulaBar
          variables={variables}
          wrapContent
          placeholder="Optional: Transform each item before aggregating, e.g., {{item.result}}"
          defaultInputContent={mapping?.blocks || []}
          onInputContentChanged={(blocks) => setMapping({ type: "fx", blocks })}
          slotProps={{
            container: {
              className: "min-h-[100px] rounded-xl border border-gray-300 bg-white",
            },
          }}
        />
        <p className="text-sm text-gray-400">
          Leave empty to collect items as-is, or specify a transformation
        </p>
      </div>

      <div className="bg-teal-50 rounded-xl p-4 space-y-3">
        <h4 className="font-medium text-teal-900 text-sm flex items-center gap-2">
          <Layers className="w-4 h-4" />
          How Iterator & Aggregator Work Together
        </h4>
        <div className="flex items-center gap-3 text-sm text-teal-800">
          <div className="flex items-center gap-2 bg-white rounded-lg px-3 py-2 border border-teal-200">
            <Repeat className="w-4 h-4 text-[#10B981]" />
            <span>Iterator</span>
          </div>
          <ArrowRight className="w-4 h-4 text-teal-600" />
          <div className="bg-white rounded-lg px-3 py-2 border border-teal-200 text-gray-600">
            Process each item
          </div>
          <ArrowRight className="w-4 h-4 text-teal-600" />
          <div className="flex items-center gap-2 bg-white rounded-lg px-3 py-2 border border-teal-200">
            <Layers className="w-4 h-4 text-[#14B8A6]" />
            <span>Aggregator</span>
          </div>
        </div>
        <p className="text-xs text-teal-700 mt-2">
          The Aggregator collects all results from the Iterator loop into a single array
        </p>
      </div>
    </div>
  );
};

export default ConfigureTab;
