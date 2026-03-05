import React from "react";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  MessageSquare,
  Mail,
  Megaphone,
  Bell,
  UserCheck,
  CheckCircle2,
} from "lucide-react";
import { COMPOSER_TEMPLATES } from "../constants";

const iconMap = {
  Mail,
  Megaphone,
  Bell,
  UserCheck,
};

const FeatureItem = ({ icon: Icon, title, description }) => (
  <div className="flex items-start gap-3">
    <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center flex-shrink-0">
      <Icon size={16} className="text-purple-600" />
    </div>
    <div>
      <h4 className="text-sm font-medium text-gray-900">{title}</h4>
      <p className="text-xs text-gray-500">{description}</p>
    </div>
  </div>
);

const TemplateCard = ({ template, isSelected, onSelect }) => {
  const Icon = iconMap[template.icon] || Mail;

  return (
    <button
      type="button"
      onClick={() => onSelect(template.id)}
      className={cn(
        "flex items-start gap-3 p-3 rounded-xl border transition-all text-left w-full",
        isSelected
          ? "border-purple-600 bg-purple-50"
          : "border-gray-200 bg-white hover:border-gray-300"
      )}
    >
      <div
        className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
        style={{ backgroundColor: template.iconBg }}
      >
        <Icon size={18} className="text-white" />
      </div>
      <div>
        <span className="text-sm font-medium text-gray-900">
          {template.label}
        </span>
        <p className="text-xs text-gray-500">{template.description}</p>
      </div>
      {isSelected && (
        <CheckCircle2
          size={18}
          className="text-purple-600 ml-auto flex-shrink-0"
        />
      )}
    </button>
  );
};

const InitialiseTab = ({ state }) => {
  const { name, setName, selectedTemplateId, setSelectedTemplateId, validation } =
    state;

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-5">
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Composer</h2>
          <p className="text-sm text-gray-500">
            Build personalized messages and emails with dynamic content.
          </p>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-violet-50 rounded-xl p-5 mb-6 border border-purple-100">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-purple-600 flex items-center justify-center">
              <MessageSquare size={20} className="text-white" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-900">
                When to use Composer
              </h3>
              <p className="text-xs text-gray-500">Perfect for these scenarios</p>
            </div>
          </div>

          <div className="space-y-3">
            <FeatureItem
              icon={Megaphone}
              title="Sales Outreach"
              description="Create compelling sales and marketing messages"
            />
            <FeatureItem
              icon={Mail}
              title="Customer Communication"
              description="Personalized emails for customer engagement"
            />
            <FeatureItem
              icon={Bell}
              title="Notifications"
              description="System alerts and automated notifications"
            />
          </div>
        </div>

        <div className="space-y-4 mb-6">
          <div>
            <Label className="text-sm font-medium text-gray-900">
              Select Template
              <span className="text-red-500 ml-0.5">*</span>
            </Label>
            <p className="text-xs text-gray-400 mb-3">
              Choose a template that best fits your message type.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-2">
            {COMPOSER_TEMPLATES.map((template) => (
              <TemplateCard
                key={template.id}
                template={template}
                isSelected={selectedTemplateId === template.id}
                onSelect={setSelectedTemplateId}
              />
            ))}
          </div>
          {validation.errors.selectedTemplateId && (
            <p className="text-xs text-red-500">
              {validation.errors.selectedTemplateId}
            </p>
          )}
        </div>

        <div className="pt-5 border-t border-gray-100">
          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-900">
              Name this Composer
              <span className="text-red-500 ml-0.5">*</span>
            </Label>
            <p className="text-xs text-gray-400">
              A descriptive name helps identify this node on the canvas.
            </p>
            <Input
              data-testid="composer-name"
              value={name}
              placeholder="e.g., Welcome Email, Sales Outreach..."
              autoFocus
              onFocus={(e) => e.target.select()}
              onChange={(e) => setName(e.target.value)}
              className={cn(
                "h-11 rounded-xl border-gray-300",
                validation.errors.name && "border-red-300"
              )}
            />
            {validation.errors.name && (
              <p className="text-xs text-red-500">{validation.errors.name}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default InitialiseTab;
