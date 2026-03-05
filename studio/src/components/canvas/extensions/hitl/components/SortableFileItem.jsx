import React from "react";

import { ODSFormulaBar as FormulaBar } from "@src/module/ods";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  FileText,
  FileImage,
  FileVideo,
  Volume2,
  FileArchive,
  X,
  GripVertical,
  Loader2,
} from "lucide-react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { cn } from "@/lib/utils";
import { FILE_TYPES } from "../constant";
const SortableFileItem = ({
  id,
  source,
  // File-specific props
  filename,
  fileSize,
  fileType,
  // Link-specific props
  linkData,
  linkType,
  // Common props
  error,
  onRemove,
  onTypeChange,
  onLinkContentChanged,
  isRemoving,
  variables,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0 || !bytes) return "";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + sizes[i];
  };

  const isLink = source === "link";
  const isFile = source === "file";

  const getFileIcon = (fileType) => {
    const iconMap = {
      image: FileImage,
      document: FileText,
      pdf: FileText,
      video: FileVideo,
      audio: Volume2,
      compressed: FileArchive,
      other: FileText,
    };

    const IconComponent = iconMap[fileType] || FileText;
    return <IconComponent className="w-5 h-5 text-gray-600" data-testid="document-icon" />;
  };

  return (
    <div className="space-y-1">
      <div
        ref={setNodeRef}
        style={style}
        className={cn(
          "group border rounded-lg bg-white transition-all duration-200",
          error
            ? "border-red-300 bg-red-50/50"
            : "border-gray-200 hover:border-gray-300 hover:shadow-sm",
          isDragging && "opacity-50"
        )}
        data-testid="uploaded-file-content"
      >
        {isFile && (
          <div className="flex items-center gap-3 px-4 py-3">
            <div className="flex items-center gap-3 flex-1 min-w-0" data-testid="uploaded-file">
              <div className="flex-shrink-0">
                {getFileIcon(fileType)}
              </div>
              <span
                className="text-sm text-gray-900 font-medium truncate flex-1"
                data-testid="file-info"
              >
                {filename}
              </span>
              {fileSize && (
                <span
                  className="text-xs text-gray-500 flex-shrink-0 ml-2"
                  data-testid="file-size"
                >
                  {formatFileSize(fileSize)}
                </span>
              )}
            </div>

            <div className={cn(
              "flex items-center gap-1 flex-shrink-0",
              isRemoving === id && "opacity-50 pointer-events-none"
            )}>
              {isRemoving !== id && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => onRemove(id)}
                  className="h-7 w-7 p-0 text-gray-400 hover:text-red-600 hover:bg-red-50"
                  data-testid="remove-file"
                >
                  <X className="w-3.5 h-3.5" />
                </Button>
              )}
              {isRemoving === id && (
                <Loader2 className="w-4 h-4 text-gray-500 animate-spin" />
              )}

              <div
                ref={setActivatorNodeRef}
                {...attributes}
                {...listeners}
                className="cursor-grab active:cursor-grabbing p-1 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
                data-testid="drag-file"
              >
                <GripVertical className="w-4 h-4" />
              </div>
            </div>
          </div>
        )}

        {isLink && (
          <div className="flex items-center gap-3 px-4 py-2.5" data-testid="config-file-content">
            <div className="flex-shrink-0">
              <Select
                value={linkType}
                onValueChange={(value) => onTypeChange(id, value)}
                data-testid="config-link-type"
              >
                <SelectTrigger className="h-8 w-28 text-xs border-gray-300">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {FILE_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex-1 min-w-0 border-l border-gray-200 pl-3">
              <FormulaBar
                variables={variables}
                defaultInputContent={linkData}
                onInputContentChanged={(content) => {
                  onLinkContentChanged(id, content);
                }}
                hideBorders
                slotProps={{
                  container: {
                    "data-testid": "config-file-link",
                    className: "min-h-[32px] rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm",
                  },
                }}
              />
            </div>

            <div className="flex items-center gap-1 flex-shrink-0">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => onRemove(id)}
                className="h-7 w-7 p-0 text-gray-400 hover:text-red-600 hover:bg-red-50"
                data-testid="remove-link"
              >
                <X className="w-3.5 h-3.5" />
              </Button>
              <div
                ref={setActivatorNodeRef}
                {...attributes}
                {...listeners}
                className="cursor-grab active:cursor-grabbing p-1 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
                data-testid="drag-link"
              >
                <GripVertical className="w-4 h-4" />
              </div>
            </div>
          </div>
        )}
      </div>
      {error && (
        <Label className="text-xs text-red-600 ml-1" data-testid="config-error">
          {error}
        </Label>
      )}
    </div>
  );
};

export default SortableFileItem;
