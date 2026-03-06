import React, { forwardRef, useRef } from "react";
import ODSButton from "./index.jsx";

const FileUploadButton = forwardRef(
  (
    {
      onFileChanged = () => {},
      accept = "*",
      multiple = false,
      children,
      label,
      ...props
    },
    ref
  ) => {
    const uploadRef = useRef();

    const handleClick = (e) => {
      e.stopPropagation();
      uploadRef?.current?.click();
    };

    return (
      <>
        <ODSButton
          ref={ref}
          onClick={handleClick}
          {...props}
        >
          {label || children}
        </ODSButton>
        <input
          ref={uploadRef}
          hidden
          accept={accept}
          multiple={multiple}
          type="file"
          onChange={onFileChanged}
        />
      </>
    );
  }
);

FileUploadButton.displayName = "FileUploadButton";

export default FileUploadButton;
