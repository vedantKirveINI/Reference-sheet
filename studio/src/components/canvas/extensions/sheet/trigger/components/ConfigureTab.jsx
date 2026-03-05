import React from "react";
import { Plus, RefreshCw, Trash2, Check, Table, Pencil } from "lucide-react";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import { ODSFormulaBar as FormulaBar } from "@src/module/ods";
import { TRIGGER_EVENT_TYPES } from "../constants";

const getEventIcon = (eventId) => {
  const icons = {
    new_row: Plus,
    row_updated: RefreshCw,
    row_deleted: Trash2,
  };
  return icons[eventId] || Plus;
};

const ConfigureTab = ({
  state,
  variables,
  loading,
  onEditDataSource,
}) => {
  const {
    sheet,
    table,
    eventTypes,
    toggleEventType,
    filterConditions,
    setFilterConditions,
    validation,
  } = state;

  return (
    <div className="p-6 space-y-6">
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Table className="w-5 h-5 text-[#F59E0B]" />
          <Label className="text-sm font-medium text-gray-900">Data Source</Label>
        </div>
        
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-[#F59E0B]/10 rounded-lg flex items-center justify-center">
              <Table className="w-4 h-4 text-[#F59E0B]" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">{sheet?.name || 'Sheet'}</p>
              <p className="text-xs text-gray-500">{table?.name || 'Table'}</p>
            </div>
          </div>
          <button 
            onClick={onEditDataSource}
            className="flex items-center gap-1.5 text-sm text-[#F59E0B] hover:underline font-medium"
          >
            <Pencil className="w-3.5 h-3.5" />
            Edit
          </button>
        </div>
      </div>

      <div className="space-y-3">
        <Label className="text-sm font-medium text-gray-900">
          Trigger Events<span className="text-red-500">*</span>
        </Label>
        <p className="text-sm text-gray-500">
          Select which events should trigger your workflow.
        </p>
        
        <div className="grid gap-2">
          {TRIGGER_EVENT_TYPES.map((event) => {
            const IconComponent = getEventIcon(event.id);
            const isSelected = eventTypes.includes(event.id);
            
            return (
              <button
                key={event.id}
                onClick={() => toggleEventType(event.id)}
                className={cn(
                  "w-full p-4 rounded-xl border-2 text-left transition-all flex items-center gap-3",
                  isSelected
                    ? "border-[#F59E0B] bg-[#F59E0B]/5"
                    : "border-gray-200 hover:border-gray-300 bg-white"
                )}
              >
                <div className={cn(
                  "w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0",
                  isSelected ? "bg-[#F59E0B] text-white" : "bg-gray-100 text-gray-600"
                )}>
                  <IconComponent className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <div className="font-medium text-gray-900">{event.label}</div>
                  <div className="text-sm text-gray-500">{event.description}</div>
                </div>
                {isSelected && (
                  <div className="w-6 h-6 rounded-full bg-[#F59E0B] flex items-center justify-center">
                    <Check className="w-4 h-4 text-white" />
                  </div>
                )}
              </button>
            );
          })}
        </div>
        
        {!validation.isValid && validation.errors.includes("Please select at least one event type") && (
          <p className="text-sm text-red-500">Please select at least one event type</p>
        )}
      </div>

      <div className="space-y-3">
        <Label className="text-sm font-medium text-gray-900">
          Filter Conditions <span className="text-gray-400">(Optional)</span>
        </Label>
        <p className="text-sm text-gray-500">
          Add conditions to filter which changes trigger your workflow.
        </p>
        <FormulaBar
          variables={variables}
          wrapContent
          placeholder="e.g., status='active' or category='important'"
          defaultInputContent={filterConditions?.blocks || []}
          onInputContentChanged={(blocks) => setFilterConditions({ type: "fx", blocks })}
          slotProps={{
            container: {
              className: "min-h-[100px] rounded-xl border border-gray-300 bg-white",
            },
          }}
        />
        <p className="text-xs text-gray-400">
          Leave empty to trigger on all matching events
        </p>
      </div>

      <div className="bg-gray-50 rounded-xl p-4 space-y-3">
        <h4 className="font-medium text-gray-900 text-sm">How it works</h4>
        <div className="space-y-2 text-sm text-gray-600">
          <p>1. When a change occurs in your selected table</p>
          <p>2. The system checks if it matches your selected event types</p>
          <p>3. If filter conditions are set, they are evaluated</p>
          <p>4. If all conditions pass, your workflow is triggered</p>
        </div>
      </div>
    </div>
  );
};

export default ConfigureTab;
