import React from "react";
import { cn } from "@/lib/utils";
import { FileText, Zap, List, Briefcase, GraduationCap } from "lucide-react";
import { SUMMARIZER_TEMPLATE_PRESETS } from "../templates/presets";
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
          ? "border-cyan-500 shadow-[0_2px_12px_rgba(6,182,212,0.25)]"
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

const UseCaseItem = ({ icon: Icon, text }) => (
  <div className="flex items-center gap-2 text-sm text-gray-600">
    <Icon size={16} className="text-cyan-500 flex-shrink-0" />
    <span>{text}</span>
  </div>
);

const InitialiseTab = ({
  selectedTemplateId,
  isFromScratch,
  onSelectTemplate,
  onStartFromScratch,
}) => {
  return (
    <div className="space-y-8 p-6">
      <div className="text-center space-y-4">
        <div className="mx-auto w-16 h-16 bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-2xl flex items-center justify-center shadow-lg">
          <img src={extensionIcons.tinyGptSummarizer} alt="GPT Summarizer" className="w-10 h-10" />
        </div>
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">GPT Summarizer</h2>
          <p className="text-gray-500 mt-2 max-w-md mx-auto">
            AI-powered content summarization
          </p>
        </div>
      </div>

      <div className="bg-cyan-50 rounded-xl p-4">
        <h3 className="text-sm font-medium text-cyan-900 mb-3">When to use</h3>
        <div className="grid grid-cols-2 gap-2">
          <UseCaseItem icon={Zap} text="TL;DR summaries" />
          <UseCaseItem icon={List} text="Key point extraction" />
          <UseCaseItem icon={Briefcase} text="Executive briefs" />
          <UseCaseItem icon={GraduationCap} text="Academic abstracts" />
        </div>
      </div>

      <div className="flex justify-center">
        <button
          type="button"
          onClick={onStartFromScratch}
          className={cn(
            "px-8 py-3 text-sm font-semibold tracking-wider rounded-lg transition-colors",
            isFromScratch
              ? "bg-cyan-600 text-white"
              : "bg-gray-800 text-white hover:bg-gray-900"
          )}
        >
          START FROM SCRATCH
        </button>
      </div>

      <div className="flex items-center justify-center">
        <div className="flex-1 h-px bg-gray-200" />
        <span className="px-4 text-sm font-medium text-gray-400">or choose a template</span>
        <div className="flex-1 h-px bg-gray-200" />
      </div>

      <div className="grid grid-cols-2 gap-3">
        {SUMMARIZER_TEMPLATE_PRESETS.map((template) => (
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
