import React, { useState, useEffect, useCallback } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Pencil } from "lucide-react";
import { cn } from "@/lib/utils";

const MAX_NAME_LENGTH = 40;
const MAX_DESCRIPTION_LENGTH = 250;

const EditTitlePopover = ({
  data = {},
  onSave = () => {},
  triggerClassName = "",
  iconColor = "#fff",
}) => {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(data.name || "");
  const [description, setDescription] = useState(data.hoverDescription || "");
  const [errors, setErrors] = useState({ name: "" });

  useEffect(() => {
    if (open) {
      setName(data.name || "");
      setDescription(data.hoverDescription || "");
      setErrors({ name: "" });
    }
  }, [open, data.name, data.hoverDescription]);

  const handleNameChange = useCallback((e) => {
    const value = e.target.value;
    if (value.length <= MAX_NAME_LENGTH) {
      setName(value);
      setErrors((prev) => ({ ...prev, name: "" }));
    }
  }, []);

  const handleDescriptionChange = useCallback((e) => {
    const value = e.target.value;
    if (value.length <= MAX_DESCRIPTION_LENGTH) {
      setDescription(value);
    }
  }, []);

  const handleSave = useCallback(() => {
    const trimmedName = name.trim();
    if (!trimmedName) {
      setErrors({ name: "Name is required" });
      return;
    }
    onSave({ name: trimmedName, hoverDescription: description.trim() });
    setOpen(false);
  }, [name, description, onSave]);

  const handleCancel = useCallback(() => {
    setOpen(false);
  }, []);

  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === "Enter" && !e.shiftKey && e.target.tagName !== "TEXTAREA") {
        e.preventDefault();
        handleSave();
      }
      if (e.key === "Escape") {
        handleCancel();
      }
    },
    [handleSave, handleCancel]
  );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          className={cn(
            "p-1 rounded-md hover:bg-white/20 transition-colors focus:outline-none focus:ring-2 focus:ring-white/30",
            triggerClassName
          )}
          aria-label="Edit node title"
        >
          <Pencil size={14} color={iconColor} />
        </button>
      </PopoverTrigger>
      
      <PopoverContent
        align="start"
        side="bottom"
        sideOffset={8}
        className="w-[340px] p-0 rounded-2xl shadow-[0_4px_24px_rgba(0,0,0,0.12)] border-0 overflow-hidden"
      >
        <div className="bg-white rounded-2xl">
          <div className="px-4 pt-4 pb-3 border-b border-gray-100">
            <h3 className="text-sm font-semibold text-gray-900">Edit Node</h3>
          </div>

          <div className="px-4 py-4 space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="node-name" className="text-xs font-medium text-gray-600">
                  Name<span className="text-red-500 ml-0.5">*</span>
                </Label>
                <span className="text-xs text-gray-400">
                  {name.length}/{MAX_NAME_LENGTH}
                </span>
              </div>
              <Input
                id="node-name"
                placeholder="Enter node name"
                value={name}
                onChange={handleNameChange}
                onKeyDown={handleKeyDown}
                onFocus={(e) => e.target.select()}
                className={cn(
                  "h-9 rounded-xl border-gray-200 bg-gray-50 focus:bg-white focus:border-gray-300 focus:ring-0 text-sm",
                  errors.name && "border-red-400 focus:border-red-400"
                )}
                autoFocus
                data-testid="node-title-editor-input"
              />
              {errors.name && (
                <p className="text-xs text-red-500">{errors.name}</p>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="node-description" className="text-xs font-medium text-gray-600">
                  Description
                </Label>
                <span className="text-xs text-gray-400">
                  {description.length}/{MAX_DESCRIPTION_LENGTH}
                </span>
              </div>
              <Textarea
                id="node-description"
                placeholder="Add a description (optional)"
                value={description}
                onChange={handleDescriptionChange}
                onKeyDown={handleKeyDown}
                onFocus={(e) => e.target.select()}
                className="min-h-[80px] max-h-[120px] rounded-xl border-gray-200 bg-gray-50 focus:bg-white focus:border-gray-300 focus:ring-0 text-sm resize-none"
                rows={3}
                data-testid="node-description-editor-input"
              />
            </div>
          </div>

          <div className="px-4 py-3 bg-gray-50 border-t border-gray-100 flex justify-end gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCancel}
              className="h-8 px-3 text-xs rounded-lg text-gray-600 hover:text-gray-900"
            >
              Cancel
            </Button>
            <Button
              variant="black"
              size="sm"
              onClick={handleSave}
              className="h-8 px-4 text-xs rounded-lg"
              data-testid="node-meta-save-button"
            >
              Save
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default EditTitlePopover;
