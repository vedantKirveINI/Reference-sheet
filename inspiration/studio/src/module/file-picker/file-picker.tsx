import React, { useState, forwardRef, useImperativeHandle } from "react";
import FilesViewer from "./components/filesViewer";
import FilesDropZone from "./components/filesDropZone";
import { uploadFiles } from "./utils/apis";
import { styles } from "./styles";
import { validateFileUpload } from "./utils/validateFileUpload";
import { FILE_EVENT_REASON } from "./utils/file-event-reason";

export type FilePickerProps = {
  isCreator?: boolean;
  settings?: any;
  onChange?: any;
  value?: any;
  disabled?: boolean;
  style?: any;
  error?: string | undefined;
  onEvent?: (files: any[], reason: FILE_EVENT_REASON) => void;
};

export const FilePicker = forwardRef(
  (
    {
      isCreator,
      settings,
      onChange,
      value: valueFromProps = [],
      disabled = false,
      style = {},
      error,
      onEvent = () => {},
    }: FilePickerProps,
    ref
  ) => {
    const [files, setFiles] = useState([]);
    const [value, setValue] = useState(valueFromProps);
    const totalLengthOfFiles = files?.length + value?.length;
    const isLengthExceeded = totalLengthOfFiles >= settings?.noOfFilesAllowed;
    const handleFilesChange = (files: any) => {
      setFiles((prev) => {
        const lastesFiles = [...prev, ...files];
        onEvent?.(lastesFiles, FILE_EVENT_REASON.FILE_UPLOAD);
        return lastesFiles;
      });
    };

    const onRemoveFile = (file: any) => {
      const fileIndex = files?.findIndex((_file: any) => _file === file);

      let newFiles = files?.filter(
        (_file: any, index: number) => index !== fileIndex
      );
      onEvent?.(newFiles, FILE_EVENT_REASON.FILE_REMOVE);
      setFiles(newFiles);
    };
    const onRemoveFromValue = (file: any) => {
      let newUrls = value?.filter((_file: any) => _file !== file);
      onChange(newUrls);
      setValue(newUrls);
    };

    useImperativeHandle(
      ref,
      () => ({
        uploadFiles: async () => {
          const urls = await uploadFiles({
            files: files,
            onSuccess: (urls: any) => {
              setFiles([]);
              setValue((prev) => [...prev, ...urls]);
            },
          });
          return [...value, ...urls];
        },
        urls: [...value, ...files],
        validateFileUpload: () => {
          let error = validateFileUpload({
            files: [...value, ...files],
            settings,
          });
          return error;
        },
      }),
      [files, value]
    );

    return (
      <div data-testid="file-picker-root" style={{ ...style }}>
        {!isCreator && (files?.length > 0 || value?.length > 0) && (
          <FilesViewer
            value={value}
            files={files}
            onRemoveFile={onRemoveFile}
            onRemoveFromValue={onRemoveFromValue}
            isLengthExceeded={isLengthExceeded}
            error={!!error}
          />
        )}
        {!isLengthExceeded && (
          <FilesDropZone
            isCreator={isCreator}
            disabled={disabled}
            onChange={handleFilesChange}
            style={
              files?.length > 0 || value?.length > 0
                ? {
                    ...styles.creatorViewContainer,
                  }
                : {}
            }
            settings={settings}
            error={!!error}
            length={[...files, ...value].length}
          />
        )}
      </div>
    );
  }
);
