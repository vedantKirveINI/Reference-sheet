import React from "react";
import { cn } from "@/lib/utils";
import { WRITER_TEMPLATE_PRESETS } from "../templates/presets";

const TemplateCard = ({ template, isSelected, onSelect }) => {
  const IconComponent = template.icon;
  
  return (
    <button
      type="button"
      onClick={() => onSelect(template.id)}
      className={cn(
        "flex flex-col items-start p-4 rounded-xl transition-all duration-200 text-left",
        "bg-white shadow-[0_1px_3px_rgba(0,0,0,0.08)]",
        "border-2",
        isSelected
          ? "border-gray-700 shadow-[0_2px_12px_rgba(0,0,0,0.15)]"
          : "border-transparent hover:shadow-[0_2px_8px_rgba(0,0,0,0.12)] hover:border-gray-200"
      )}
    >
      <div
        className="w-12 h-12 rounded-xl flex items-center justify-center mb-3"
        style={{ backgroundColor: template.iconBg }}
      >
        <IconComponent size={24} className="text-white" strokeWidth={2} />
      </div>
      <h3 className="text-sm font-semibold text-gray-900 mb-1">
        {template.name}
      </h3>
      <p className="text-xs text-gray-500 leading-relaxed">
        {template.description}
      </p>
    </button>
  );
};

const InitialiseTab = ({
  selectedTemplateId,
  isFromScratch,
  onSelectTemplate,
  onStartFromScratch,
}) => {
  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-5">
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">
            What would you like to write?
          </h2>
          <p className="text-sm text-gray-500">
            Choose a content template to get started quickly, or start from scratch for full customization.
          </p>
        </div>

        <button
          type="button"
          onClick={onStartFromScratch}
          className={cn(
            "w-full p-4 rounded-xl border-2 transition-all duration-200 mb-5",
            "flex items-center justify-center gap-2",
            isFromScratch
              ? "border-gray-700 bg-gray-50 shadow-[0_2px_12px_rgba(0,0,0,0.15)]"
              : "border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50"
          )}
        >
          <span className="text-sm font-semibold text-gray-900">START FROM SCRATCH</span>
        </button>

        <div className="flex items-center justify-center mb-5">
          <div className="flex-1 h-px bg-gray-200" />
          <span className="px-4 text-sm font-medium text-gray-400">or choose a template</span>
          <div className="flex-1 h-px bg-gray-200" />
        </div>

        <div className="grid grid-cols-2 gap-3">
          {WRITER_TEMPLATE_PRESETS.map((template) => (
            <TemplateCard
              key={template.id}
              template={template}
              isSelected={selectedTemplateId === template.id}
              onSelect={onSelectTemplate}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default InitialiseTab;
