import React from "react";
import { Link, Shield, Key, Database, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import { CONNECTION_TEMPLATES } from "../constants";

const getIconComponent = (iconName) => {
  const icons = {
    Shield: Shield,
    Key: Key,
    Database: Database,
  };
  return icons[iconName] || Link;
};

const InitialiseTab = ({
  selectedTemplateId,
  isFromScratch,
  onSelectTemplate,
  onStartFromScratch,
}) => {
  return (
    <div className="p-6 space-y-8">
      <div className="text-center space-y-4">
        <div className="mx-auto w-16 h-16 bg-[#F59E0B]/10 rounded-2xl flex items-center justify-center">
          <Link className="w-8 h-8 text-[#F59E0B]" />
        </div>
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">Connection Setup</h2>
          <p className="text-gray-500 mt-2 max-w-md mx-auto">
            Connect to external services and APIs to integrate with your workflow.
          </p>
        </div>
      </div>

      <div className="bg-gray-50 rounded-xl p-4 space-y-3">
        <h3 className="font-medium text-gray-900 flex items-center gap-2">
          <Zap className="w-4 h-4 text-[#F59E0B]" />
          When to use
        </h3>
        <ul className="space-y-2 text-sm text-gray-600">
          <li className="flex items-start gap-2">
            <span className="text-[#F59E0B] mt-0.5">•</span>
            <span><strong>Set up OAuth</strong> — Authenticate with services like Google, GitHub, Slack</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-[#F59E0B] mt-0.5">•</span>
            <span><strong>Configure API keys</strong> — Connect to REST APIs with key-based auth</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-[#F59E0B] mt-0.5">•</span>
            <span><strong>Establish integrations</strong> — Link databases and external services</span>
          </li>
        </ul>
      </div>

      <button
        onClick={onStartFromScratch}
        className={cn(
          "w-full p-4 rounded-xl border-2 text-center transition-all",
          "hover:border-gray-400",
          isFromScratch
            ? "border-gray-900 bg-gray-50"
            : "border-gray-200 bg-white"
        )}
      >
        <span className="font-medium text-gray-900">Start from scratch</span>
        <p className="text-sm text-gray-500 mt-1">Configure your own connection settings</p>
      </button>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-200" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-3 bg-white text-gray-500">or choose a template</span>
        </div>
      </div>

      <div className="space-y-4">
        <div className="grid gap-3">
          {CONNECTION_TEMPLATES.map((template) => {
            const IconComponent = getIconComponent(template.icon);
            const isSelected = selectedTemplateId === template.id;

            return (
              <button
                key={template.id}
                onClick={() => onSelectTemplate(template.id)}
                className={cn(
                  "w-full p-4 rounded-xl border-2 text-left transition-all",
                  "hover:border-[#F59E0B] hover:bg-[#F59E0B]/5",
                  isSelected
                    ? "border-[#F59E0B] bg-[#F59E0B]/5"
                    : "border-gray-200 bg-white"
                )}
              >
                <div className="flex items-start gap-3">
                  <div className={cn(
                    "w-10 h-10 rounded-lg flex items-center justify-center",
                    isSelected ? "bg-[#F59E0B] text-white" : "bg-gray-100 text-gray-600"
                  )}>
                    <IconComponent className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">{template.name}</div>
                    <div className="text-sm text-gray-500 mt-0.5">{template.description}</div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default InitialiseTab;
