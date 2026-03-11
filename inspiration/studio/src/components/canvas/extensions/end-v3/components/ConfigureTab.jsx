import React, { useState, useRef, useCallback } from "react";
import { CheckCircle, XCircle, ChevronDown, ChevronUp, Flag, GitBranch, Code } from "lucide-react";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ODSFormulaBar as FormulaBar } from "@src/module/ods";
import InputGridV3 from "@src/module/input-grid-v3";
import { END_TYPES, END_TEMPLATES } from "../constants";

const getEndIcon = (endType) => {
  const icons = {
    success: CheckCircle,
    failure: XCircle,
  };
  return icons[endType] || CheckCircle;
};

const getTemplateIcon = (iconName) => {
  const icons = {
    CheckCircle: CheckCircle,
    XCircle: XCircle,
    GitBranch: GitBranch,
    Code: Code,
  };
  return icons[iconName] || Flag;
};

const STATUS_CODES = [
  { value: 200, label: "200 - OK" },
  { value: 201, label: "201 - Created" },
  { value: 400, label: "400 - Bad Request" },
  { value: 401, label: "401 - Unauthorized" },
  { value: 403, label: "403 - Forbidden" },
  { value: 404, label: "404 - Not Found" },
  { value: 500, label: "500 - Server Error" },
];

const ConfigureTab = ({ state, variables }) => {
  const { 
    endType, setEndType, 
    output, setOutput, 
    message, setMessage, 
    selectedTemplateId, selectTemplate, 
    validation,
    enableJsonResponse, setEnableJsonResponse,
    statusCode, setStatusCode,
    outputs, setOutputs,
  } = state;
  const [showTemplates, setShowTemplates] = useState(false);
  const inputGridRef = useRef(null);
  const currentType = END_TYPES.find((t) => t.id === endType) || END_TYPES[0];
  const accentColor = currentType.color;
  const selectedTemplate = END_TEMPLATES.find((t) => t.id === selectedTemplateId);

  const handleOutputGridChange = useCallback((data) => {
    const schema = data?.schema || data?.value || data || [];
    setOutputs(schema);
  }, [setOutputs]);

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <button
          onClick={() => setShowTemplates(!showTemplates)}
          className="w-full flex items-center justify-between p-3 rounded-xl border border-gray-200 bg-gray-50 hover:bg-gray-100 transition-colors"
        >
          <div className="flex items-center gap-2">
            <Flag className="w-4 h-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">
              {selectedTemplate ? `Template: ${selectedTemplate.name}` : "Choose a template (optional)"}
            </span>
          </div>
          {showTemplates ? (
            <ChevronUp className="w-4 h-4 text-gray-500" />
          ) : (
            <ChevronDown className="w-4 h-4 text-gray-500" />
          )}
        </button>

        {showTemplates && (
          <div className="grid gap-2 p-3 rounded-xl border border-gray-200 bg-white">
            {END_TEMPLATES.map((template) => {
              const IconComponent = getTemplateIcon(template.icon);
              const isSelected = selectedTemplateId === template.id;
              const isFailure = template.id === "failure";
              const templateColor = isFailure ? "#EF4444" : "#22C55E";

              return (
                <button
                  key={template.id}
                  onClick={() => {
                    selectTemplate(template.id);
                    setShowTemplates(false);
                  }}
                  className={cn(
                    "w-full p-3 rounded-lg border text-left transition-all flex items-center gap-3",
                    isSelected
                      ? "bg-opacity-10"
                      : "border-gray-200 bg-white hover:bg-gray-50"
                  )}
                  style={{
                    borderColor: isSelected ? templateColor : undefined,
                    backgroundColor: isSelected ? `${templateColor}10` : undefined,
                  }}
                >
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center"
                    style={{
                      backgroundColor: isSelected ? templateColor : "#f3f4f6",
                      color: isSelected ? "#fff" : "#4b5563",
                    }}
                  >
                    <IconComponent className="w-4 h-4" />
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-medium text-gray-900">{template.name}</div>
                    <div className="text-xs text-gray-500">{template.description}</div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      <div className="space-y-3">
        <Label className="text-sm font-medium text-gray-900">End Type</Label>
        <div className="grid grid-cols-2 gap-3">
          {END_TYPES.map((type) => {
            const IconComponent = getEndIcon(type.id);
            const isSelected = endType === type.id;

            return (
              <button
                key={type.id}
                onClick={() => setEndType(type.id)}
                className={cn(
                  "p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2",
                  isSelected
                    ? "bg-opacity-5"
                    : "border-gray-200 hover:border-gray-300 bg-white"
                )}
                style={{
                  borderColor: isSelected ? type.color : undefined,
                  backgroundColor: isSelected ? `${type.color}10` : undefined,
                }}
              >
                <IconComponent
                  className="w-6 h-6"
                  style={{ color: type.color }}
                />
                <span
                  className={cn(
                    "text-sm font-medium",
                    isSelected ? "text-gray-900" : "text-gray-700"
                  )}
                >
                  {type.label}
                </span>
              </button>
            );
          })}
        </div>
        <p className="text-sm text-gray-500">{currentType.description}</p>
      </div>

      <div className="space-y-3">
        <Label className="text-sm font-medium text-gray-900">Final Output</Label>
        <FormulaBar
          variables={variables}
          wrapContent
          placeholder="Enter the final output value, e.g., {{result}} or 'Workflow completed'"
          defaultInputContent={output?.blocks || []}
          onInputContentChanged={(blocks) => setOutput({ type: "fx", blocks })}
          slotProps={{
            container: {
              className: cn(
                "min-h-[100px] rounded-xl border border-gray-300 bg-white"
              ),
            },
          }}
        />
        <p className="text-sm text-gray-400">
          Use {"{{data}}"} to insert values from previous steps in your workflow
        </p>
      </div>

      <div className="space-y-3">
        <Label className="text-sm font-medium text-gray-900">
          Message <span className="text-gray-400 font-normal">(optional)</span>
        </Label>
        <Textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder={
            endType === "success"
              ? "e.g., Order processed successfully"
              : "e.g., Failed to process order due to validation error"
          }
          className="min-h-[80px] rounded-xl border-gray-300 resize-none"
        />
        <p className="text-sm text-gray-400">
          Add a descriptive message for this end state
        </p>
      </div>

      <div className="space-y-4 p-4 rounded-xl border border-gray-200 bg-gray-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: enableJsonResponse ? accentColor : "#e5e7eb" }}
            >
              <Code className="w-4 h-4" style={{ color: enableJsonResponse ? "#fff" : "#6b7280" }} />
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-900">JSON Response</Label>
              <p className="text-xs text-gray-500">Return a structured JSON response</p>
            </div>
          </div>
          <Switch
            checked={enableJsonResponse}
            onCheckedChange={setEnableJsonResponse}
          />
        </div>

        {enableJsonResponse && (
          <div className="space-y-4 pt-4 border-t border-gray-200">
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-900">Status Code</Label>
              <Select
                value={String(statusCode)}
                onValueChange={(val) => setStatusCode(Number(val))}
              >
                <SelectTrigger className="w-full bg-white">
                  <SelectValue placeholder="Select status code" />
                </SelectTrigger>
                <SelectContent>
                  {STATUS_CODES.map((code) => (
                    <SelectItem key={code.value} value={String(code.value)}>
                      {code.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-3">
              <Label className="text-sm font-medium text-gray-900">Output Fields</Label>
              <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                <InputGridV3
                  ref={inputGridRef}
                  initialValue={outputs}
                  variables={variables}
                  onGridDataChange={handleOutputGridChange}
                  isValueMode={true}
                />
              </div>
              <p className="text-xs text-gray-400">
                Define the structure of your JSON response. Each field will be included in the output.
              </p>
            </div>
          </div>
        )}
      </div>

      <div
        className="rounded-xl p-4 space-y-3"
        style={{ backgroundColor: `${accentColor}10` }}
      >
        <h4 className="font-medium text-gray-900 text-sm">
          {endType === "success" ? "Success Preview" : "Failure Preview"}
        </h4>
        <div className="bg-white rounded-lg p-3 border border-gray-200">
          <div className="flex items-center gap-2">
            {endType === "success" ? (
              <CheckCircle className="w-5 h-5 text-[#22C55E]" />
            ) : (
              <XCircle className="w-5 h-5 text-[#EF4444]" />
            )}
            <span className="text-sm text-gray-700">
              {message || (endType === "success" ? "Workflow completed successfully" : "Workflow ended with error")}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfigureTab;
