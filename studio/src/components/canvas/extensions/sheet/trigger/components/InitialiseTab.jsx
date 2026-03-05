import React, { useMemo } from "react";
import { Zap, Table } from "lucide-react";
import { cn } from "@/lib/utils";
import SheetSelector from "../../common-components/SheetSelector";
import TableSelector from "../../common-components/TableSelector";
import tinyTablesExecuteIcon from "@/components/canvas/assets/extensions/tiny-tables-execute.svg";

const getIconComponent = (iconName) => {
  // All template cards use the Tiny Tables brand icon
  return null; // Will use image instead
};

const InitialiseTab = ({
  selectedTemplateId,
  isFromScratch,
  onSelectTemplate,
  onStartFromScratch,
  sheet,
  table,
  sheetList,
  tableList,
  onSheetChange,
  onTableChange,
  getSheetList,
  createSheet,
  loading,
  sortedFields,
}) => {
  const getDynamicTemplates = useMemo(() => {
    const templates = [
      {
        id: "on-row-created",
        name: "On New Row Created",
        description: "Trigger when a new row is added to the table",
        icon: "Plus",
      },
      {
        id: "on-row-updated",
        name: "On Row Updated",
        description: "Trigger when any row is modified",
        icon: "RefreshCw",
      },
      {
        id: "on-row-deleted",
        name: "On Row Deleted",
        description: "Trigger when a row is removed from the table",
        icon: "Trash2",
      },
    ];

    if (!sortedFields?.length) return templates;

    const statusField = sortedFields.find(f => 
      ['status', 'state', 'stage', 'type'].some(kw => 
        f.name.toLowerCase().includes(kw)
      )
    );
    if (statusField) {
      templates.push({
        id: "on-field-change",
        name: `On ${statusField.name} Change`,
        description: `Trigger when ${statusField.name.toLowerCase()} field is modified`,
        icon: "Bell",
        fieldId: statusField.id,
      });
    }

    return templates;
  }, [sortedFields]);

  return (
    <div className="space-y-8">
      <div className="text-center space-y-4">
        <div className="mx-auto w-16 h-16 bg-[#F59E0B]/10 rounded-2xl flex items-center justify-center">
          <img src={tinyTablesExecuteIcon} alt="Table Trigger" className="w-8 h-8" />
        </div>
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">Table Trigger</h2>
          <p className="text-gray-500 mt-2 max-w-md mx-auto">
            Start your workflow when a sheet changes
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Table className="w-5 h-5 text-[#F59E0B]" />
          <h3 className="font-medium text-gray-900">Select Data Source</h3>
        </div>
        
        <div className="grid gap-4">
          <SheetSelector
            sheets={sheetList}
            value={sheet}
            onChange={onSheetChange}
            onRefresh={getSheetList}
            onCreate={createSheet}
            loading={loading}
            placeholder="Select a sheet..."
            themeColor="#F59E0B"
          />
          
          <TableSelector
            tables={tableList}
            value={table}
            onChange={onTableChange}
            disabled={!sheet}
            loading={loading && !!sheet}
            placeholder="Select a table..."
            themeColor="#F59E0B"
          />
        </div>
      </div>

      {(!sheet || !table) && (
        <div className="bg-gray-50 rounded-xl p-6 text-center">
          <Table className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 font-medium">Select a data source</p>
          <p className="text-sm text-gray-400 mt-1">Choose a sheet and table above to continue</p>
        </div>
      )}

      {sheet && table && (
        <>
          <div className="bg-gray-50 rounded-xl p-4 space-y-3">
            <h3 className="font-medium text-gray-900 flex items-center gap-2">
              <Zap className="w-4 h-4 text-[#F59E0B]" />
              When to use Table Trigger
            </h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-start gap-2">
                <span className="text-[#F59E0B] mt-0.5">•</span>
                <span><strong>New row added</strong> — React when new data is added to your sheet</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#F59E0B] mt-0.5">•</span>
                <span><strong>Row updated</strong> — Trigger actions when existing data changes</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#F59E0B] mt-0.5">•</span>
                <span><strong>Row deleted</strong> — Handle cleanup or notifications on deletion</span>
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
            <p className="text-sm text-gray-500 mt-1">Configure your own trigger settings</p>
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
              {getDynamicTemplates.map((template) => {
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
                        "w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0",
                        isSelected ? "bg-[#F59E0B]" : "bg-gray-100"
                      )}>
                        <img src={tinyTablesExecuteIcon} alt={template.name} className="w-5 h-5" />
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
        </>
      )}
    </div>
  );
};

export default InitialiseTab;
