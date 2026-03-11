import React from "react";
// import Button from "oute-ds-button";
// import Icon from "oute-ds-icon";
import { ODSButton as Button, ODSIcon as Icon } from "@src/module/ods";
import FileList from "./FileList";

const AddFiles = ({
  files = [],
  onAddFiles,
  onFileReorder,
  onFileRemove,
  onLinkTypeChange,
  onLinkContentChanged,
  previewOpen,
  isRemoving = false,
  variables,
}) => {
  return (
    <div style={{ marginTop: "0.5rem", height: "100%", width: "100%" }}>
      {files?.length > 0 && (
        <div style={{ height: "100%", width: "100%", overflow: "auto" }}>
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
      {!previewOpen && (
        <div style={{ display: "flex", justifyContent: "flex-start" }}>
          <Button
            label="ADD FILES"
            variant="black-text"
            data-testid="add-file-button"
            startIcon={
              <Icon
                outeIconName="OUTEAddIcon"
                outeIconProps={{ sx: { color: "#212121" } }}
              />
            }
            onClick={onAddFiles}
            sx={{ padding: "0.5rem 0.5rem 0.5rem 0.25rem" }}
          />
        </div>
      )}
    </div>
  );
};

export default AddFiles;
