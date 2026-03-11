import React, { useState } from "react";
import { Database, Code, ChevronDown, ChevronUp, Pencil } from "lucide-react";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import { ODSFormulaBar as FormulaBar } from "@src/module/ods";

const ConfigureTab = ({ state, variables, onEditDataSource }) => {
  const {
    connection,
    queryContent,
    setQueryContent,
    validation,
  } = state;

  const [expandedSection, setExpandedSection] = useState("query");

  const renderSection = (id, title, icon, content, isComplete) => {
    const isExpanded = expandedSection === id;
    const Icon = icon;

    return (
      <div className="overflow-hidden rounded-xl border border-gray-200">
        <button
          onClick={() => setExpandedSection(isExpanded ? null : id)}
          className={cn(
            "w-full p-4 flex items-center justify-between text-left transition-colors",
            isExpanded ? "bg-gray-50" : "bg-white hover:bg-gray-50"
          )}
        >
          <div className="flex items-center gap-3">
            <div className={cn(
              "w-8 h-8 rounded-lg flex items-center justify-center",
              isComplete ? "bg-[#6366F1] text-white" : "bg-gray-100 text-gray-600"
            )}>
              <Icon className="size-4" />
            </div>
            <span className="font-medium text-gray-900">{title}</span>
          </div>
          {isExpanded ? (
            <ChevronUp className="size-5 text-gray-400" />
          ) : (
            <ChevronDown className="size-5 text-gray-400" />
          )}
        </button>
        {isExpanded && (
          <div className="border-t border-gray-200 bg-white p-4">
            {content}
          </div>
        )}
      </div>
    );
  };

  const dataSourceSummary = (
    <div className="rounded-xl border border-[#6366F1]/20 bg-[#6366F1]/5 p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-lg bg-[#6366F1] text-white">
            <Database className="size-5" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Database Connection</p>
            <p className="font-medium text-gray-900">
              {connection?.name || connection?.connection_name || "Connected"}
            </p>
          </div>
        </div>
        <button
          onClick={onEditDataSource}
          className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium text-[#6366F1] transition-colors hover:bg-[#6366F1]/10"
        >
          <Pencil className="size-4" />
          Edit
        </button>
      </div>
    </div>
  );

  const querySectionContent = (
    <div className="space-y-6">
      <div className="space-y-3">
        <Label className="flex items-center gap-2 text-sm font-medium text-gray-700">
          <Code className="size-4" />
          SQL Query<span className="text-red-500">*</span>
        </Label>
        <FormulaBar
          variables={variables}
          wrapContent
          placeholder="SELECT * FROM users WHERE status = 'active'"
          defaultInputContent={queryContent?.blocks ?? []}
          onInputContentChanged={(blocks) => setQueryContent({ type: "fx", blocks })}
          slotProps={{
            container: {
              className: "min-h-[150px] rounded-lg border border-gray-300 bg-white font-mono text-sm",
            },
          }}
        />
        <p className="text-xs text-gray-400">
          Write your SQL query.
        </p>
      </div>

      <div className="space-y-3 rounded-xl bg-gray-50 p-4">
        <h4 className="text-sm font-medium text-gray-900">SQL Tips</h4>
        <ul className="space-y-1 text-xs text-gray-600">
          <li>• Use parameterized queries when possible for security</li>
          <li>• Include LIMIT clauses to prevent large result sets</li>
          <li>• Test queries with small datasets first</li>
        </ul>
      </div>
    </div>
  );

  return (
    <div className="space-y-4">
      {dataSourceSummary}

      {renderSection(
        "query",
        "SQL Query",
        Code,
        querySectionContent,
        (queryContent?.blocks?.length ?? 0) > 0
      )}

      {!validation.isValid && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3">
          <p className="text-sm text-red-600">{validation.errors[0]}</p>
        </div>
      )}
    </div>
  );
};

export default ConfigureTab;
