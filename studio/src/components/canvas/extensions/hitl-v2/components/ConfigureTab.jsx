import React, { useState, useCallback } from "react";
import { Plus, Trash2, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ODSFormulaBar as FormulaBar } from "@src/module/ods";
import { BUTTON_COLORS } from "../constants";
import FallbackSection from "./FallbackSection";
import BrandingSection from "./BrandingSection";
import AddFiles from "./AddFiles";
import AddFilesTab from "./AddFilesTab";

const ConfigureTab = ({ state, variables }) => {
  const {
    instructions,
    setInstructions,
    summaryContent,
    setSummaryContent,
    buttons,
    addButton,
    updateButton,
    removeButton,
    fallback,
    setFallback,
    branding,
    setBranding,
    files,
    setFiles,
    validation,
  } = state;

  const [showFilesView, setShowFilesView] = useState(false);

  const handleFilesSave = useCallback((savedFiles) => {
    setFiles(savedFiles);
    setShowFilesView(false);
  }, [setFiles]);

  const handleFilesCancel = useCallback(() => {
    setShowFilesView(false);
  }, []);

  const handleFileReorder = useCallback((reorderedFiles) => {
    setFiles(reorderedFiles);
  }, [setFiles]);

  const handleFileRemove = useCallback((id) => {
    setFiles((prev) => prev.filter((file) => file.id !== id));
  }, [setFiles]);

  const handleLinkTypeChange = useCallback((id, type) => {
    setFiles((prev) =>
      prev.map((file) => (file.id === id ? { ...file, type } : file))
    );
  }, [setFiles]);

  const handleLinkContentChanged = useCallback((id, content) => {
    setFiles((prev) =>
      prev.map((file) =>
        file.id === id ? { ...file, url: { type: "fx", blocks: content } } : file
      )
    );
  }, [setFiles]);

  if (showFilesView) {
    return (
      <div className="h-full flex flex-col">
        <AddFilesTab
          files={files}
          variables={variables}
          onCancel={handleFilesCancel}
          onSave={handleFilesSave}
        />
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="space-y-1.5">
        <div className="flex items-center gap-2">
          <Label className="text-sm font-medium text-gray-900">
            Instructions<span className="text-red-500 ml-0.5">*</span>
          </Label>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Info className="w-4 h-4 text-gray-400" />
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-xs max-w-xs">
                  Detailed guidance for the reviewer on what they need to evaluate and how to make a decision.
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <FormulaBar
          variables={variables}
          wrapContent
          placeholder="Please review and take action."
          defaultInputContent={instructions?.blocks || []}
          onInputContentChanged={(blocks) => setInstructions({ type: "fx", blocks })}
          slotProps={{
            container: {
              className: cn(
                "min-h-[40px] rounded-lg border bg-white px-3 py-2 text-sm",
                !validation.isValid && !instructions?.blocks?.some((b) => b.value?.trim())
                  ? "border-red-400"
                  : "border-gray-300 focus-within:ring-2 focus-within:ring-blue-200 focus-within:border-blue-400"
              ),
            },
          }}
        />
      </div>

      <div className="space-y-1.5">
        <div className="flex items-center gap-2">
          <Label className="text-sm font-medium text-gray-900">
            Select Content Type<span className="text-red-500 ml-0.5">*</span>
          </Label>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Info className="w-4 h-4 text-gray-400" />
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-xs max-w-xs">
                  Choose the format for displaying summary content to the reviewer.
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <Select
          value={summaryContent?.type || "text"}
          onValueChange={(value) =>
            setSummaryContent({
              ...summaryContent,
              type: value,
            })
          }
        >
          <SelectTrigger className="h-9">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="text">Text</SelectItem>
            <SelectItem value="html">HTML</SelectItem>
          </SelectContent>
        </Select>
        <div className="flex items-center gap-2">
          <Label className="text-sm font-medium text-gray-900">
            Summary Content<span className="text-red-500 ml-0.5">*</span>
          </Label>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Info className="w-4 h-4 text-gray-400" />
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-xs max-w-xs">
                  A concise summary of what is being reviewed. This will be prominently displayed to the reviewer.
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <FormulaBar
          variables={variables}
          wrapContent
          placeholder="e.g., Budget request for Q2 – ₹12L"
          defaultInputContent={summaryContent?.value?.blocks || []}
          onInputContentChanged={(blocks) =>
            setSummaryContent({
              ...summaryContent,
              value: { type: "fx", blocks },
            })
          }
          slotProps={{
            container: {
              className: cn(
                "min-h-[40px] rounded-lg border bg-white px-3 py-2 text-sm",
                !validation.isValid && !summaryContent?.value?.blocks?.some((b) => b.value?.trim())
                  ? "border-red-400"
                  : "border-gray-300 focus-within:ring-2 focus-within:ring-blue-200 focus-within:border-blue-400"
              ),
            },
          }}
        />
        <div className="flex items-center gap-2">
          <Switch
            checked={summaryContent?.editable || false}
            onCheckedChange={(checked) =>
              setSummaryContent({
                ...summaryContent,
                editable: checked,
              })
            }
          />
          <Label className="text-xs text-gray-600">
            Allow reviewer to edit summary content
          </Label>
        </div>
      </div>

      <div className="space-y-1.5">
        <AddFiles
          files={files}
          onAddFiles={() => setShowFilesView(true)}
          onFileReorder={handleFileReorder}
          onFileRemove={handleFileRemove}
          onLinkTypeChange={handleLinkTypeChange}
          onLinkContentChanged={handleLinkContentChanged}
          variables={variables}
        />
      </div>

      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Label className="text-sm font-medium text-gray-900">
              Button Configuration
            </Label>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="w-4 h-4 text-gray-400" />
                </TooltipTrigger>
                <TooltipContent>
                  <p className="text-xs max-w-xs">
                    Define the action buttons that will be shown to the reviewer.
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addButton}
            className="h-8 px-3 text-xs font-medium text-gray-900 bg-white border-gray-300 hover:bg-gray-100 hover:border-gray-400 shadow-sm transition-all"
          >
            <Plus className="w-3.5 h-3.5 mr-1.5" />
            Add Button
          </Button>
        </div>
        <div className="space-y-1.5">
          {buttons.map((button, index) => (
            <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
              <Input
                value={button.label}
                onChange={(e) => updateButton(index, "label", e.target.value)}
                placeholder="Text shown on the button to the reviewer"
                className="flex-1 h-8 text-sm"
              />
              <Select
                value={button.color}
                onValueChange={(value) => updateButton(index, "color", value)}
              >
                <SelectTrigger className="h-8 w-[120px] text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {BUTTON_COLORS.map((color) => (
                    <SelectItem key={color.id} value={color.id}>
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full border border-gray-300"
                          style={{ backgroundColor: color.hex }}
                        />
                        {color.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div
                className="w-5 h-5 rounded-full border border-gray-200 shrink-0"
                style={{ backgroundColor: BUTTON_COLORS.find((c) => c.id === button.color)?.hex || "#6b7280" }}
              />
              {buttons.length > 2 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeButton(index)}
                  className="h-8 w-8 p-0 text-gray-400 hover:text-red-500 hover:bg-transparent"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              )}
            </div>
          ))}
        </div>
        {buttons.length <= 2 && (
          <p className="text-xs text-gray-500">Minimum 2 buttons required</p>
        )}
      </div>


      {/* Fallback Section */}
      <FallbackSection
        fallback={fallback}
        buttons={buttons}
        onFallbackChange={setFallback}
        errors={validation.errors.includes("Fallback button is required") ? { fallback_value: true } : {}}
      />

      {/* Branding Section */}
      <BrandingSection
        branding={branding}
        onBrandingChange={setBranding}
        errors={validation.errors}
      />

    </div>
  );
};

export default ConfigureTab;
