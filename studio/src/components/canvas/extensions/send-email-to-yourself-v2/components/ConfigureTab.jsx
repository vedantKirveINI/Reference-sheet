import React from "react";
import { Bell, BellOff, AlertCircle, Flame, Pencil } from "lucide-react";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ODSFormulaBar as FormulaBar } from "@src/module/ods";
import { EMAIL_PRIORITIES, getEmailTemplateById } from "../constants";

const getPriorityIcon = (priority) => {
  const icons = {
    LOW: BellOff,
    NORMAL: Bell,
    HIGH: AlertCircle,
    URGENT: Flame,
  };
  return icons[priority] || Bell;
};

const ConfigureTab = ({ state, variables, onEditTemplate }) => {
  const {
    priority,
    setPriority,
    subject,
    updateSubject,
    body,
    updateBody,
    user,
    validation,
    selectedTemplateId,
    isFromScratch,
    touchField,
  } = state;

  const selectedTemplate = selectedTemplateId ? getEmailTemplateById(selectedTemplateId) : null;

  return (
    <div className="p-6 space-y-6">
      {(selectedTemplate || isFromScratch) && onEditTemplate && (
        <div className="flex items-center justify-between p-3 bg-cyan-50 border border-cyan-200 rounded-xl">
          <div className="flex items-center gap-2">
            <span className="text-sm text-cyan-700">
              {isFromScratch ? "Starting from scratch" : `Using: ${selectedTemplate?.name}`}
            </span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onEditTemplate}
            className="text-cyan-600 hover:text-cyan-700 hover:bg-cyan-100"
          >
            <Pencil className="w-4 h-4 mr-1" />
            Change
          </Button>
        </div>
      )}

      {user?.email_id && (
        <div className="bg-[#06B6D4]/5 border border-[#06B6D4]/20 rounded-xl p-4">
          <div className="text-sm text-gray-600">
            Sending to: <span className="font-medium text-gray-900">{user.email_id}</span>
          </div>
        </div>
      )}

      <div className="space-y-3">
        <Label className="text-sm font-medium text-gray-900">Priority</Label>
        <div className="grid grid-cols-4 gap-2">
          {EMAIL_PRIORITIES.map((level) => {
            const IconComponent = getPriorityIcon(level.id);
            const isSelected = priority === level.id;

            return (
              <button
                key={level.id}
                onClick={() => {
                  setPriority(level.id);
                  touchField("priority");
                }}
                className={cn(
                  "p-3 rounded-xl border-2 transition-all flex flex-col items-center gap-2",
                  isSelected
                    ? "border-[#06B6D4] bg-[#06B6D4]/5"
                    : "border-gray-200 hover:border-gray-300 bg-white"
                )}
              >
                <IconComponent
                  className="w-5 h-5"
                  style={{ color: level.color }}
                />
                <span className={cn(
                  "text-sm font-medium",
                  isSelected ? "text-[#06B6D4]" : "text-gray-700"
                )}>
                  {level.label}
                </span>
              </button>
            );
          })}
        </div>
        <p className="text-sm text-gray-500">
          {EMAIL_PRIORITIES.find((l) => l.id === priority)?.description}
        </p>
      </div>

      <div className="space-y-3">
        <Label className="text-sm font-medium text-gray-900">
          Subject<span className="text-red-500">*</span>
        </Label>
        <FormulaBar
          variables={variables}
          wrapContent
          placeholder="Enter email subject, e.g., 'Error in {{workflow.name}}'"
          defaultInputContent={subject?.blocks || []}
          onInputContentChanged={(blocks) => updateSubject(blocks)}
          onBlur={() => touchField("subject")}
          slotProps={{
            container: {
              className: cn(
                "min-h-[48px] rounded-xl border border-gray-300 bg-white",
                validation.touchedErrors?.subject && "border-red-400"
              ),
            },
          }}
        />
        <p className={cn(
          "text-sm",
          validation.touchedErrors?.subject ? "text-red-500" : "text-gray-400"
        )}>
          {validation.touchedErrors?.subject
            ? validation.touchedErrors.subject
            : "Use {{data}} to include dynamic values from your workflow"
          }
        </p>
      </div>

      <div className="space-y-3">
        <Label className="text-sm font-medium text-gray-900">Body</Label>
        <FormulaBar
          variables={variables}
          wrapContent
          placeholder="Enter email body content..."
          defaultInputContent={body?.blocks || []}
          onInputContentChanged={(blocks) => updateBody(blocks)}
          onBlur={() => touchField("body")}
          slotProps={{
            container: {
              className: "min-h-[120px] rounded-xl border border-gray-300 bg-white",
            },
          }}
        />
        <p className="text-sm text-gray-400">
          Include details about the event you want to be notified about
        </p>
      </div>

      <div className="bg-gray-50 rounded-xl p-4 space-y-3">
        <h4 className="font-medium text-gray-900 text-sm">Example</h4>
        <div className="bg-white rounded-lg p-3 border border-gray-200">
          <div className="text-sm text-gray-700 space-y-1">
            <div><strong>Subject:</strong> [Error] Failed to process order {"{{order.id}}"}</div>
            <div><strong>Body:</strong> Order processing failed for customer {"{{customer.email}}"}. Error: {"{{error.message}}"}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfigureTab;
