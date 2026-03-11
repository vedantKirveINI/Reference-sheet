import React, { useMemo } from "react";
import { Zap, Table } from "lucide-react";
import { cn } from "@/lib/utils";
import SheetSelector from "../../common-components/SheetSelector";
import TableSelector from "../../common-components/TableSelector";
import tinyTablesFindAllIcon from "@/components/canvas/assets/extensions/tiny-tables-find-all.svg";

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
  sheetLoading,
  tableLoading,
  sortedFields,
}) => {
  const getDynamicTemplates = useMemo(() => {
    const templates = [
      {
        id: "get-all-records",
        name: "Get All Records",
        description: "Retrieve all rows without filtering",
        icon: "Table",
      },
    ];

    if (!sortedFields?.length) return templates;

    const statusField = sortedFields.find(f => 
      ['status', 'state', 'type', 'category'].some(kw => 
        f.name.toLowerCase().includes(kw)
      )
    );
    if (statusField) {
      templates.push({
        id: "filter-by-status",
        name: `Filter by ${statusField.name}`,
        description: `Find records matching a specific ${statusField.name.toLowerCase()}`,
        icon: "Filter",
        fieldId: statusField.id,
      });
    }

    const dateField = sortedFields.find(f => 
      ['date', 'created', 'updated', 'time'].some(kw => 
        f.name.toLowerCase().includes(kw)
      ) || f.type === 'date' || f.type === 'datetime'
    );
    if (dateField) {
      templates.push({
        id: "search-by-date",
        name: `Search by ${dateField.name}`,
        description: `Query records within a date range`,
        icon: "Calendar",
        fieldId: dateField.id,
      });
    }

    return templates;
  }, [sortedFields]);

  return (
    <div className="space-y-8">
      <div className="text-center space-y-4">
        <div className="mx-auto w-16 h-16 bg-[#22C55E]/10 rounded-2xl flex items-center justify-center">
          <img src={tinyTablesFindAllIcon} alt="Find All Records" className="w-8 h-8" />
        </div>
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">Find All Records</h2>
          <p className="text-gray-500 mt-2 max-w-md mx-auto">
            Find multiple rows that match your criteria
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Table className="w-5 h-5 text-[#22C55E]" />
          <h3 className="font-medium text-gray-900">Select Data Source</h3>
        </div>
        
        <div className="grid gap-4">
          <SheetSelector
            sheets={sheetList}
            value={sheet}
            onChange={onSheetChange}
            onRefresh={getSheetList}
            onCreate={createSheet}
            loading={sheetLoading}
            placeholder="Select a sheet..."
            themeColor="#22C55E"
          />
          
          <TableSelector
            tables={tableList}
            value={table}
            onChange={onTableChange}
            disabled={!sheet}
            loading={tableLoading && !!sheet}
            placeholder="Select a table..."
            themeColor="#22C55E"
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
              <Zap className="w-4 h-4 text-[#22C55E]" />
              When to use Find All Records
            </h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-start gap-2">
                <span className="text-[#22C55E] mt-0.5">•</span>
                <span><strong>Get all customers</strong> — Retrieve all records from a customer sheet</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#22C55E] mt-0.5">•</span>
                <span><strong>Filter records</strong> — Find records matching specific criteria</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#22C55E] mt-0.5">•</span>
                <span><strong>Batch processing</strong> — Process multiple records in a loop</span>
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
            <p className="text-sm text-gray-500 mt-1">Configure your own search settings</p>
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
                      "hover:border-[#22C55E] hover:bg-[#22C55E]/5",
                      isSelected
                        ? "border-[#22C55E] bg-[#22C55E]/5"
                        : "border-gray-200 bg-white"
                    )}
                  >
                    <div className="flex items-start gap-3">
                      <div className={cn(
                        "w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0",
                        isSelected ? "bg-[#22C55E]" : "bg-gray-100"
                      )}>
                        <img src={tinyTablesFindAllIcon} alt={template.name} className="w-5 h-5" />
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
