import React from "react";
import { ODSIcon } from "@src/module/ods";
import CancleIcon from "../../assets/cancle-icon.svg";
import { styles } from "./styles";
import { FILE_TYPES, calculateFileSize } from "@oute/oute-ds.core.constants";
const File = ({ file, onRemoveFile, index }) => {
  const fileSize = file?.size ? calculateFileSize(file) : "";
  const fileName = file?.name ? file?.name : file?.url;
  const fileType = file?.name
    ? file?.name.split(".").pop()
    : file?.url.split(".").pop();
  return (
    <div
      style={styles.file}
      key={file?.name}
      data-testid={`file-picker-file-${index}`}
    >
      <span style={styles.wrapper}>
        <ODSIcon
          imageProps={{
            src: FILE_TYPES[fileType] || FILE_TYPES["default"],
            draggable: false,
          }}
        />
        <div style={styles.fileName} data-testid="file-picker-file-name">
          {fileName}
        </div>
      </span>
      <span style={styles.endWrapper}>
        <div style={styles.size} data-testid="file-picker-file-size">
          {fileSize}
        </div>
        <ODSIcon
          imageProps={{
            src: CancleIcon,
            style: {
              cursor: "pointer",
            },
            "data-testid": "file-picker-remove-file",
          }}
          onClick={() => {
            onRemoveFile(file);
          }}
        />
      </span>
    </div>
  );
};

export default File;
