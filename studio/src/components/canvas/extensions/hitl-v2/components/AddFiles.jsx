import React from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import FileList from "../../hitl/components/FileList";

const AddFiles = ({
  files = [],
  onAddFiles,
  onFileReorder,
  onFileRemove,
  onLinkTypeChange,
  onLinkContentChanged,
  variables,
  isRemoving = false,
}) => {
  return (
    <div className="w-full space-y-3">
      {files?.length > 0 && (
        <div className="w-full max-h-48 overflow-y-auto rounded-lg border border-gray-200 bg-gray-50/50 p-3">
          <FileList
            variables={variables}
            files={files}
            onReorder={onFileReorder}
            onRemove={onFileRemove}
            onTypeChange={onLinkTypeChange}
            isRemoving={isRemoving}
            onLinkContentChanged={onLinkContentChanged}
          />
        </div>
      )}
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={onAddFiles}
        className="h-9 px-4 text-sm font-medium text-gray-900 bg-white border-gray-300 hover:bg-gray-100 hover:border-gray-400 shadow-sm transition-all"
      >
        <Plus className="w-4 h-4 mr-2" />
        Add Files
      </Button>
    </div>
  );
};

export default AddFiles;
