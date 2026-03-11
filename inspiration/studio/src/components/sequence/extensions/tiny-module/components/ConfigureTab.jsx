import React, { useEffect } from "react";
import { Box, Trash2, Info, Search, Loader2, AlertCircle, Wrench } from "lucide-react";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { ODSFormulaBar as FormulaBar } from "@src/module/ods";
import { THEME } from "../constants";
import { useTinyTools } from "../hooks/useTinyTools";
import { useToolSchema } from "../hooks/useToolSchema";

const ConfigureTab = ({ state, variables, workspaceId }) => {
  const {
    moduleId,
    selectedTool,
    inputMapping,
    selectTool,
    clearTool,
    updateInputMapping,
    removeInputMapping,
    validation,
  } = state;

  const { tools, loading: toolsLoading, error: toolsError } = useTinyTools(workspaceId);
  const { schema, loading: schemaLoading, fetchSchema } = useToolSchema();

  const handleSelectTool = async (tool) => {
    if (tool._id === moduleId) {
      return;
    }
    
    const toolSchema = await fetchSchema(tool);
    selectTool(tool, toolSchema);
  };

  const handleChangeTool = () => {
    clearTool();
  };

  useEffect(() => {
    if (moduleId && tools.length > 0 && !selectedTool) {
      const tool = tools.find((t) => t._id === moduleId);
      if (tool) {
        fetchSchema(tool).then((toolSchema) => {
          state.setSelectedTool(tool);
          state.setToolSchema(toolSchema);
        });
      }
    }
  }, [moduleId, tools, selectedTool, fetchSchema, state]);

  return (
    <div className="space-y-6">
      <div className="flex items-start gap-3 p-3 bg-blue-50/50 rounded-lg border border-blue-100">
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ backgroundColor: THEME.iconBg }}
        >
          <Box className="w-4 h-4" style={{ color: THEME.iconColor }} />
        </div>
        <div>
          <h3 className="font-medium text-gray-900 text-sm">Tiny Module</h3>
          <p className="text-xs text-gray-600 mt-0.5">
            Execute a reusable TinyTool as part of this sequence.
          </p>
        </div>
      </div>

      {selectedTool ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium text-gray-900">Selected Tool</Label>
            <button
              onClick={handleChangeTool}
              className="text-sm text-blue-600 hover:text-blue-700 transition-colors"
            >
              Change
            </button>
          </div>
          
          <div className="p-4 rounded-xl border-2 border-blue-500 bg-blue-50">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-500 flex items-center justify-center flex-shrink-0">
                <Wrench className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-gray-900">{selectedTool.name}</div>
                {selectedTool.description && (
                  <div className="text-sm text-gray-500 mt-0.5">{selectedTool.description}</div>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <Label className="text-sm font-medium text-gray-900">
            Select TinyTool<span className="text-red-500 ml-0.5">*</span>
          </Label>

          {toolsLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
              <span className="ml-2 text-sm text-gray-500">Loading tools...</span>
            </div>
          ) : toolsError ? (
            <div className="flex items-center gap-2 p-4 bg-red-50 rounded-lg border border-red-200">
              <AlertCircle className="w-5 h-5 text-red-500" />
              <span className="text-sm text-red-600">{toolsError}</span>
            </div>
          ) : tools.length === 0 ? (
            <div className="p-6 bg-gray-50 rounded-xl border border-dashed border-gray-300 text-center">
              <Wrench className="w-10 h-10 text-gray-300 mx-auto mb-3" />
              <p className="text-sm font-medium text-gray-700">No TinyTools found</p>
              <p className="text-xs text-gray-500 mt-1">
                Create a TinyTool first using the Tool Canvas, then use it here.
              </p>
            </div>
          ) : (
            <>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Search tools..."
                  className="pl-9"
                  disabled
                />
              </div>

              <div className="space-y-2 max-h-64 overflow-y-auto">
                {tools.map((tool) => {
                  const isSelected = moduleId === tool._id;

                  return (
                    <button
                      key={tool._id}
                      onClick={() => handleSelectTool(tool)}
                      disabled={schemaLoading}
                      className={cn(
                        "w-full p-3 rounded-lg border text-left transition-all flex items-start gap-3",
                        isSelected
                          ? "border-blue-500 bg-blue-50"
                          : "border-gray-200 hover:border-gray-300 bg-white",
                        schemaLoading && "opacity-50 cursor-not-allowed"
                      )}
                    >
                      <div
                        className={cn(
                          "w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0",
                          isSelected ? "bg-blue-500 text-white" : "bg-gray-100 text-gray-600"
                        )}
                      >
                        <Wrench className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-gray-900">{tool.name}</div>
                        {tool.description && (
                          <div className="text-xs text-gray-500 truncate">{tool.description}</div>
                        )}
                      </div>
                      {schemaLoading && moduleId === tool._id && (
                        <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
                      )}
                    </button>
                  );
                })}
              </div>
            </>
          )}
        </div>
      )}

      {selectedTool && inputMapping.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium text-gray-900">Input Parameters</Label>
          </div>

          <div className="space-y-3">
            {inputMapping.map((mapping) => (
              <div
                key={mapping.id}
                className="p-4 bg-gray-50 rounded-xl border border-gray-200"
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <span className="text-sm font-medium text-gray-900">
                      {mapping.key}
                      {mapping.required && <span className="text-red-500 ml-0.5">*</span>}
                    </span>
                    {mapping.description && (
                      <p className="text-xs text-gray-500 mt-0.5">{mapping.description}</p>
                    )}
                  </div>
                  <span className="text-xs px-2 py-0.5 bg-gray-200 text-gray-600 rounded">
                    {mapping.type}
                  </span>
                </div>
                <FormulaBar
                  variables={variables}
                  wrapContent
                  placeholder={`Enter value for ${mapping.key}...`}
                  defaultInputContent={mapping.value?.blocks || []}
                  onInputContentChanged={(blocks) =>
                    updateInputMapping(mapping.id, "value", { type: "fx", blocks })
                  }
                  slotProps={{
                    container: {
                      className: "min-h-[40px] rounded-lg border border-gray-300 bg-white",
                    },
                  }}
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {selectedTool && inputMapping.length === 0 && (
        <div className="p-4 bg-gray-50 rounded-lg border border-dashed border-gray-300 text-center">
          <p className="text-sm text-gray-500">This tool has no input parameters</p>
        </div>
      )}

      {!validation.isValid && validation.errors.length > 0 && (
        <div className="flex items-start gap-2 p-3 bg-red-50 rounded-lg border border-red-200">
          <Info className="w-4 h-4 text-red-500 mt-0.5" />
          <div className="space-y-1">
            {validation.errors.map((error, index) => (
              <p key={index} className="text-sm text-red-600">
                {error}
              </p>
            ))}
          </div>
        </div>
      )}

      <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
        <h4 className="text-sm font-medium text-gray-900 mb-2">What are TinyTools?</h4>
        <p className="text-xs text-gray-600">
          TinyTools are reusable AI-powered tools created in the Tool Canvas. They define
          input parameters and output schemas, making them perfect for embedding in sequences.
          The tool's output becomes available to subsequent nodes.
        </p>
      </div>
    </div>
  );
};

export default ConfigureTab;
