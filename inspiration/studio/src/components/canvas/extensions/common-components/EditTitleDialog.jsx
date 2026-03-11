import React, { useState, useEffect, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

const MAX_NAME_LENGTH = 40;
const MAX_DESCRIPTION_LENGTH = 80;

const EditTitleDialog = ({
  open = false,
  onOpenChange = () => {},
  data = {},
  onSave = () => {},
  onDiscard = () => {},
}) => {
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
    onOpenChange(false);
  }, [name, description, onSave, onOpenChange]);

  const handleDiscard = useCallback(() => {
    onDiscard();
    onOpenChange(false);
  }, [onDiscard, onOpenChange]);

  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSave();
      }
    },
    [handleSave]
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px] rounded-2xl p-0 gap-0 overflow-hidden">
        <DialogHeader className="px-5 pt-5 pb-4">
          <DialogTitle className="text-base font-semibold text-gray-900">
            Edit Node Details
          </DialogTitle>
          <DialogDescription className="text-sm text-gray-500 mt-1">
            Update the name and description for this node.
          </DialogDescription>
        </DialogHeader>

        <div className="px-5 pb-5 space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="node-name" className="text-sm font-medium text-gray-700">
                Node Name<span className="text-red-500 ml-0.5">*</span>
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
                "h-10 rounded-xl border-gray-300 focus:border-gray-400 focus:ring-0",
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
              <Label htmlFor="node-description" className="text-sm font-medium text-gray-700">
                Description
              </Label>
              <span className="text-xs text-gray-400">
                {description.length}/{MAX_DESCRIPTION_LENGTH}
              </span>
            </div>
            <Input
              id="node-description"
              placeholder="Add a description (optional)"
              value={description}
              onChange={handleDescriptionChange}
              onKeyDown={handleKeyDown}
              onFocus={(e) => e.target.select()}
              className="h-10 rounded-xl border-gray-300 focus:border-gray-400 focus:ring-0"
              data-testid="node-description-editor-input"
            />
          </div>
        </div>

        <DialogFooter className="px-5 py-4 bg-gray-50 border-t border-gray-100">
          <div className="flex gap-3 w-full justify-end">
            <Button
              variant="black-outlined"
              size="medium"
              onClick={handleDiscard}
              className="rounded-xl"
              data-testid="node-meta-discard-button"
            >
              Cancel
            </Button>
            <Button
              variant="black"
              size="medium"
              onClick={handleSave}
              className="rounded-xl"
              data-testid="node-meta-save-button"
            >
              Save
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EditTitleDialog;
