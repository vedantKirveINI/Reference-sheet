import React from "react";
import { styles } from "./styles";
import File from "./file";
export type FilesViewerProps = {
  files?: any;
  onChange?: any;
  value?: any;
  onRemoveFile?: any;
  onRemoveFromValue?: any;
  isLengthExceeded?: boolean;
  error?: boolean;
};

const FilesViewer = ({
  files,
  onRemoveFile,
  onRemoveFromValue,
  value = [],
  isLengthExceeded,
  error,
}: FilesViewerProps) => {
  return (
    <div
      style={styles.container(isLengthExceeded, error)}
      data-testid="file-picker-files-viewer"
    >
      {value?.map((file: any, index: number) => {
        return (
          <File
            file={file}
            onRemoveFile={onRemoveFromValue}
            key={index}
            index={index}
          />
        );
      })}
      {files?.map((file: any, index: number) => {
        return (
          <File
            file={file}
            onRemoveFile={onRemoveFile}
            key={index}
            index={index}
          />
        );
      })}
    </div>
  );
};

export default FilesViewer;
