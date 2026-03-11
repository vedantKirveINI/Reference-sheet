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

// import Icon from "oute-ds-icon";
// import Label from "oute-ds-label";
import { ODSIcon as Icon, ODSLabel as Label } from "@src/module/ods";
import styles from "./FileList.module.css";
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
      <div className={styles.noFiles} data-testid="no-files-section">
        <Icon
          imageProps={{
            src: "https://cdn-v1.tinycommand.com/1234567890/1750249915245/empty-file-section.svg",
            style: {
              width: "6rem",
              height: "6rem",
            },
          }}
        />
        <Label>All your uploaded files will be visible here</Label>
      </div>
    );

  return (
    <div className={styles.fileListContainer} data-testid="file-list-container">
      <Label
        variant="caption"
        className={styles.title}
        data-testid="existing-files"
      >
        Existing Files({files?.length})
      </Label>
      {showUploadLink && (
        <AddLinkItem
          onLinkAdded={onLinkAdded}
          onCancel={onLinkCancel}
          variables={variables}
        />
      )}
      <div
        style={{
          width: "100%",
          height: "100%",
          overflow: "auto",
        }}
      >
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
          id={id}
          modifiers={[restrictToVerticalAxis]}
        >
          <SortableContext items={files} strategy={verticalListSortingStrategy}>
            <div
              style={{
                width: "100%",
                display: "flex",
                gap: "10px",
                flexDirection: "column",
              }}
              data-testid="file-list"
            >
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
      <div>{isUploading && <FileProgressBar file={isUploading} />}</div>
    </div>
  );
};

export default FileList;
