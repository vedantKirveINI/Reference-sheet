import React, { useId } from "react";
import {
  DndContext,
  closestCenter,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";

import { Label } from "@/components/ui/label";
import AddLinkItem from "./AddLinkItem";
import SortableFileItem from "./SortableFileItem";
import FileProgressBar from "./FileProgressBar";

const FileList = ({
  files = [],
  variables,
  showUploadLink = false,
  isUploading = false,
  isRemoving = false,
  onReorder = () => {},
  onLinkAdded = () => {},
  onLinkCancel = () => {},
  onRemove = () => {},
  onTypeChange = () => {},
  onLinkContentChanged = () => {},
}) => {
  const sensors = useSensors(useSensor(MouseSensor), useSensor(TouchSensor));
  const id = useId();

  const handleDragEnd = (event) => {
    const { active, over } = event;

    if (active.id !== over.id) {
      const oldIndex = files.findIndex((item) => item.id === active.id);
      const newIndex = files.findIndex((item) => item.id === over.id);

      const reorderedItems = arrayMove(files, oldIndex, newIndex);

      // Update parent components with reordered data
      onReorder(reorderedItems);
    }
  };

  if (files.length === 0 && !showUploadLink && !isUploading)
    return (
      <div className="flex flex-col items-center justify-center gap-6 w-full h-full min-h-[200px] py-8" data-testid="no-files-section">
        <img
          src="https://cdn-v1.tinycommand.com/1234567890/1750249915245/empty-file-section.svg"
          alt="No files"
          className="w-24 h-24"
        />
        <Label className="text-sm text-gray-500">All your uploaded files will be visible here</Label>
      </div>
    );

  return (
    <div className="flex flex-col h-full gap-4" data-testid="file-list-container">
      <Label
        className="text-xs font-semibold text-gray-700 uppercase tracking-wide"
        data-testid="existing-files"
      >
        Existing Files ({files?.length})
      </Label>
      {showUploadLink && (
        <div className="mb-2">
          <AddLinkItem
            onLinkAdded={onLinkAdded}
            onCancel={onLinkCancel}
            variables={variables}
          />
        </div>
      )}
      <div className="flex-1 min-h-0 overflow-y-auto">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
          id={id}
          modifiers={[restrictToVerticalAxis]}
        >
          <SortableContext items={files} strategy={verticalListSortingStrategy}>
            <div className="flex flex-col gap-2 w-full" data-testid="file-list">
              {files.map((file) => (
                <SortableFileItem
                  key={file.id}
                  id={file.id}
                  onRemove={onRemove}
                  onTypeChange={onTypeChange}
                  source={file.source}
                  // File-specific props
                  filename={file?.name}
                  fileSize={file?.size}
                  fileType={file.type}
                  // Link-specific props
                  linkData={
                    file.source === "link" ? file?.url?.blocks || [] : []
                  }
                  linkType={file.source === "link" ? file?.type || "" : ""}
                  error={file?.error}
                  isRemoving={isRemoving}
                  onLinkContentChanged={onLinkContentChanged}
                  variables={variables}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      </div>
      {isUploading && (
        <div className="mt-2">
          <FileProgressBar file={isUploading} />
        </div>
      )}
    </div>
  );
};

export default FileList;
