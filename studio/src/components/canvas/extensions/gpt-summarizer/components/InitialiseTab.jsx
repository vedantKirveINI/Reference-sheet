import React from "react";
import { Newspaper, Users, Mail, FileText } from "lucide-react";
import { SUMMARIZER_TEMPLATES } from "../constants";
import { GPTTemplateCard } from "../../gpt-common";
import extensionIcons from "../../../assets/extensions";

const UseCaseItem = ({ icon: Icon, text }) => (
  <div className="flex items-center gap-2 text-sm text-gray-600">
    <Icon size={16} className="text-cyan-500 flex-shrink-0" />
    <span>{text}</span>
  </div>
);

const InitialiseTab = ({
  selectedTemplateId,
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
            Condense long content into key points
          </p>
        </div>
      </div>

      <div className="bg-cyan-50 rounded-xl p-4">
        <h3 className="text-sm font-medium text-cyan-900 mb-3">When to use</h3>
        <div className="grid grid-cols-2 gap-2">
          <UseCaseItem icon={Newspaper} text="Summarize articles" />
          <UseCaseItem icon={Users} text="Meeting notes" />
          <UseCaseItem icon={Mail} text="Email digests" />
          <UseCaseItem icon={FileText} text="Document briefings" />
        </div>
      </div>

      <div className="flex justify-center">
        <button
          type="button"
          onClick={onStartFromScratch}
          className="px-8 py-3 bg-gray-800 text-white text-sm font-semibold tracking-wider rounded-xl hover:bg-gray-900 transition-colors shadow-[0_2px_8px_rgba(0,0,0,0.15)]"
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
        {SUMMARIZER_TEMPLATES.map((template) => (
          <GPTTemplateCard
            key={template.id}
            template={template}
            isSelected={selectedTemplateId === template.id}
            onSelect={onSelectTemplate}
            themeColor="#06B6D4"
          />
        ))}
      </div>
    </div>
  );
};

export default InitialiseTab;
