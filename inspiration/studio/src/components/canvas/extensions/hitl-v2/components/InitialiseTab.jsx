import React from "react";
import { UserCheck, CheckCircle, Layers, ArrowUpCircle, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

const TEMPLATE_OPTIONS = [
  { 
    value: "approval", 
    name: "Approval", 
    icon: CheckCircle,
    description: "Request approval or rejection for a workflow step"
  },
  { 
    value: "categorization", 
    name: "Categorization", 
    icon: Layers,
    description: "Have a human categorize items into stages"
  },
  { 
    value: "escalation", 
    name: "Escalation", 
    icon: ArrowUpCircle,
    description: "Pause for escalation decisions"
  },
];

const getIconComponent = (iconName) => {
  const icons = {
    CheckCircle: CheckCircle,
    Layers: Layers,
    ArrowUpCircle: ArrowUpCircle,
  };
  return icons[iconName] || CheckCircle;
};

const InitialiseTab = ({
  templateType,
  onTemplateTypeChange,
}) => {
  return (
    <div className="p-4 space-y-5">
      <div className="text-center space-y-3">
        <div className="mx-auto w-14 h-14 bg-[#8B5CF6]/10 rounded-xl flex items-center justify-center">
          <UserCheck className="w-7 h-7 text-[#8B5CF6]" />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Human-in-the-Loop</h2>
          <p className="text-sm text-gray-500 mt-1.5 max-w-md mx-auto">
            Pause workflow for human input or approval
          </p>
        </div>
      </div>

      <div className="bg-gray-50 rounded-lg p-3 space-y-2">
        <h3 className="text-sm font-medium text-gray-900 flex items-center gap-2">
          <Zap className="w-4 h-4 text-[#8B5CF6]" />
          When to use Human-in-the-Loop
        </h3>
        <ul className="space-y-1.5 text-sm text-gray-600">
          <li className="flex items-start gap-2">
            <span className="text-[#8B5CF6] mt-0.5">•</span>
            <span><strong>Approval workflows</strong> — Require human approval before critical actions</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-[#8B5CF6] mt-0.5">•</span>
            <span><strong>Data validation</strong> — Have humans verify data accuracy before proceeding</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-[#8B5CF6] mt-0.5">•</span>
            <span><strong>Manual decisions</strong> — Pause for human judgment on complex decisions</span>
          </li>
        </ul>
      </div>

      <div className="space-y-3">
        <div className="grid gap-2">
          {TEMPLATE_OPTIONS.map((template) => {
            const IconComponent = getIconComponent(template.icon);
            const isSelected = templateType === template.value;

            return (
              <button
                key={template.value}
                onClick={() => onTemplateTypeChange(template.value)}
                className={cn(
                  "w-full p-3 rounded-lg border-2 text-left transition-all",
                  "hover:border-[#8B5CF6] hover:bg-[#8B5CF6]/5",
                  isSelected
                    ? "border-[#8B5CF6] bg-[#8B5CF6]/5"
                    : "border-gray-200 bg-white"
                )}
              >
                <div className="flex items-start gap-2.5">
                  <div
                    className={cn(
                      "w-9 h-9 rounded-lg flex items-center justify-center",
                      isSelected
                        ? "bg-[#8B5CF6] text-white"
                        : "bg-gray-100 text-gray-600"
                    )}
                  >
                    <IconComponent className="w-4 h-4" />
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-medium text-gray-900">{template.name}</div>
                    <div className="text-xs text-gray-500 mt-0.5">
                      {template.description}
                    </div>
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
