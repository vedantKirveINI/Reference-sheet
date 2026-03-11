import React from "react";

// import Autocomplete from "oute-ds-autocomplete";
// import { FormulaBar } from "oute-ds-formula-bar";
// import Icon from "oute-ds-icon";
// import Label from "oute-ds-label";
// import CircularProgress from "oute-ds-circular-progress";
import { ODSAutocomplete as Autocomplete, ODSFormulaBar as FormulaBar, ODSIcon as Icon, ODSLabel as Label, ODSCircularProgress as CircularProgress } from "@src/module/ods";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

import styles from "./SortableFileItem.module.css";
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
      image: "ImageIcon",
      document: "DocIcon",
      pdf: "PdfIcon",
      video: "VideoIcon",
      audio: "AudioIcon",
      compressed: "ZipIcon",
      other: "OUTEDocumentIcon",
    };

    // Return the corresponding icon name based on fileType, default to "OUTEDocumentIcon" if not found
    return (
      <Icon
        outeIconName={iconMap[fileType] || "OUTEDocumentIcon"}
        buttonProps={{ "data-testid": "document-icon" }}
      />
    );
  };

  return (
    <>
      <div
        ref={setNodeRef}
        style={style}
        className={`${styles.fileItem} ${error ? styles.error : ""}`}
        data-testid="uploaded-file-content"
      >
        {isFile && (
          <div className={`${styles.fileContent}`}>
            <div className={styles.fileInfo} data-testid="uploaded-file">
              {getFileIcon(fileType)}
              <span className={styles.fileName} data-testid="file-info">
                {filename}
              </span>
              {fileSize && (
                <span className={styles.fileSize} data-testid="file-size">
                  {formatFileSize(fileSize)}
                </span>
              )}
            </div>

            <div
              className={`${styles.actions} ${isRemoving === id ? "disabled" : ""}`}
            >
              {isRemoving !== id && (
                <Icon
                  outeIconName="OUTECloseIcon"
                  buttonProps={{
                    "data-testid": "remove-file",
                  }}
                  onClick={() => onRemove(id)}
                />
              )}
              {isRemoving === id && (
                <CircularProgress
                  sx={{
                    color: "#212121",
                    width: "1.5rem !important",
                    height: "1.5rem !important",
                  }}
                />
              )}

              <div
                ref={setActivatorNodeRef}
                {...attributes}
                {...listeners}
                className={styles.dragHandle}
                data-testid="drag-file"
              >
                <Icon outeIconName="OUTEDragIcon" />
              </div>
            </div>
          </div>
        )}

        {isLink && (
          <div
            className={`${styles.fileContent} ${styles.isLink}`}
            data-testid="config-file-content"
          >
            <div className={styles.typeSection}>
              <Autocomplete
                size="small"
                data-testid="config-link-type"
                value={
                  FILE_TYPES.find((option) => option.value === linkType) || null
                }
                onChange={(event, newValue) => {
                  if (newValue) {
                    onTypeChange(id, newValue.value);
                  }
                }}
                options={FILE_TYPES}
                getOptionLabel={(option) => option.label}
                isOptionEqualToValue={(option, value) =>
                  option.value === value.value
                }
                variant="black"
                sx={{
                  width: "8rem",
                  "& .MuiAutocomplete-inputRoot": {
                    padding: 0,
                    border: "none",
                  },
                  "& .MuiOutlinedInput-notchedOutline": {
                    border: "none",
                  },
                  "& .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline":
                    {
                      border: "none",
                    },
                  "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline":
                    {
                      border: "none",
                    },
                }}
                disableClearable
                selectOnFocus={false}
              />
            </div>

            <div className={styles.fileInfo}>
              <div style={{ borderLeft: "1px solid #e0e0e0", width: "100%" }}>
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
                    },
                  }}
                />
              </div>
            </div>

            <div className={`${styles.actions}`}>
              <Icon
                outeIconName="OUTECloseIcon"
                buttonProps={{ "data-testid": "remove-link" }}
                onClick={() => onRemove(id)}
              />
              <div
                ref={setActivatorNodeRef}
                {...attributes}
                {...listeners}
                className={styles.dragHandle}
                data-testid="drag-link"
              >
                <Icon outeIconName="OUTEDragIcon" />
              </div>
            </div>
          </div>
        )}
      </div>
      {error && (
        <Label color="error" variant="subtitle1" data-testid="config-error">
          {error}
        </Label>
      )}
    </>
  );
};

export default SortableFileItem;
