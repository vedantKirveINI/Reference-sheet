import React from "react";

// import CircularProgress from "oute-ds-circular-progress";
import { ODSCircularProgress as CircularProgress } from "@src/module/ods";
import styles from "./SortableFileItem.module.css";

const FileProgressBar = ({ file }) => {
  const formatFileSize = (bytes) => {
    if (bytes === 0 || !bytes) return "";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + sizes[i];
  };

  return (
    <div className={styles.fileItem}>
      <div className={`${styles.fileContent}`}>
        <div className={styles.fileInfo}>
          <span className={styles.fileName}>{file.name}</span>
          <span className={styles.fileSize}>{formatFileSize(file.size)}</span>
        </div>

        <div className={styles.actions}>
          <CircularProgress
            sx={{
              color: "#212121",
              width: "1.5rem !important",
              height: "1.5rem !important",
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default FileProgressBar;
