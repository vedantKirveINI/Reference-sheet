import React, { useCallback } from "react";
import { ODSIcon } from "@src/module/ods";
import UploadIcon from "../../assets/upload-icon.svg";
import { styles } from "./styles";
import { useDropzone } from "react-dropzone";
import { FILE_SIZE_LIMIT } from "../../utils/constants";
export type CreatorFilesViewProps = {
  isCreator?: boolean;
  viewPort?: string;
  settings?: any;
  onChange?: any;
  style?: any;
  disabled?: boolean;
  error?: boolean;
  length?: number;
};

const FilesDropZone = ({
  isCreator,
  onChange,
  settings,
  style,
  disabled,
  error,
  length,
}: CreatorFilesViewProps) => {
  const onFileChange = async (event) => {
    const files = event.target.files;
    if (!isCreator) {
      onChange(files);
    }
  };
  const onDropFile = useCallback((acceptedFiles: any) => {
    onFileChange({ target: { files: acceptedFiles } });
  }, []);

  const { getRootProps, getInputProps } = useDropzone({
    onDrop: onDropFile,
  });

  const allowedFileTypes = settings?.allowedFileTypes?.map(
    (file) => `.${file?.extension}`
  );

  return (
    <div
      style={{
        ...styles.container({ style, error, length }),
        ...(isCreator || disabled ? { pointerEvents: "none" } : {}),
      }}
      id="imageDropZone"
      {...getRootProps()}
      data-testid="file-picker-drop-zone"
    >
      <ODSIcon
        imageProps={{
          src: UploadIcon,
        }}
      />
      <div
        style={{ ...styles.fileUpload, ...styles.text }}
        data-testid="file-picker-placeholder-text"
      >
        <span>Drag & Drop</span>
        <span style={styles.orText}>or</span>
        <span style={styles.fileInput(isCreator)}>Choose File</span>
      </div>

      <div
        style={{ ...styles.orText, fontSize: "1em" }}
        data-testid="file-picker-size-limit"
      >
        Size Limit: {FILE_SIZE_LIMIT}MB
      </div>
      <input
        data-testid="file-picker-file-input"
        {...getInputProps()}
        accept={allowedFileTypes?.join(", ")}
        style={{ display: "none" }}
      />
    </div>
  );
};

export default FilesDropZone;
