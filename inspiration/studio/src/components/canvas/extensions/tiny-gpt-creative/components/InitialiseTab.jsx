import React from "react";
import { cn } from "@/lib/utils";
import { Sparkles } from "lucide-react";
import { CREATIVE_TEMPLATE_PRESETS } from "../templates/presets";
import extensionIcons from "../../../assets/extensions";

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
          ? "border-[#DB2777] shadow-[0_2px_12px_rgba(219,39,119,0.25)]"
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
    <div className="space-y-8 p-6">
      <div className="text-center space-y-4">
        <div className="mx-auto w-16 h-16 bg-gradient-to-br from-pink-500 to-pink-600 rounded-2xl flex items-center justify-center shadow-lg">
          <img src={extensionIcons.tinyGptCreative} alt="GPT Creative" className="w-10 h-10" />
        </div>
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">GPT Creative</h2>
          <p className="text-gray-500 mt-2 max-w-md mx-auto">
            Generate creative content like stories, poetry, and marketing copy
          </p>
        </div>
      </div>

      <button
        type="button"
        onClick={onStartFromScratch}
        className={cn(
          "w-full p-4 rounded-xl border-2 transition-all duration-200",
          "flex items-center justify-center gap-2",
          isFromScratch
            ? "border-[#DB2777] bg-pink-50 shadow-[0_2px_12px_rgba(219,39,119,0.25)]"
            : "border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50"
        )}
      >
        <Sparkles size={18} className={isFromScratch ? "text-[#DB2777]" : "text-gray-500"} />
        <span className={cn("text-sm font-semibold", isFromScratch ? "text-[#DB2777]" : "text-gray-900")}>
          START FROM SCRATCH
        </span>
      </button>

      <div className="flex items-center justify-center">
        <div className="flex-1 h-px bg-gray-200" />
        <span className="px-4 text-sm font-medium text-gray-400">or choose a template</span>
        <div className="flex-1 h-px bg-gray-200" />
      </div>

      <div className="grid grid-cols-2 gap-3">
        {CREATIVE_TEMPLATE_PRESETS.map((template) => (
          <TemplateCard
            key={template.id}
            template={template}
            isSelected={selectedTemplateId === template.id}
            onSelect={onSelectTemplate}
          />
        ))}
      </div>
    </div>
  );
};

export default InitialiseTab;
