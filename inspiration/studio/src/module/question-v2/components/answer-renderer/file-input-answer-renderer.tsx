
import React from "react";
import { fileInputStyles } from "./styles";
import { FILE_TYPES, calculateFileSize } from "@oute/oute-ds.core.constants";

export const FileUploadAnswerRender = ({ type, value }) => {
  return (
    <div style={fileInputStyles.fileUploadContainer}>
      {value?.response?.map((item, index) => {
        const fileName = item?.url;
        const fileType = item?.url.split(".").pop();
        return (
          <div style={fileInputStyles.fileItemContainer} key={`file-${index}`}>
            <img
              style={{ width: "2em", height: "2em" }}
              src={FILE_TYPES[fileType] || FILE_TYPES["default"]}
              alt="File icons"
            />
            <span
              style={fileInputStyles.fileNameText}
              data-testid={`chat-response-file-name-${index}`}
            >
              {fileName}
            </span>
            <span
              style={{ ...(fileInputStyles.fileNameText), minWidth: "0.5em", maxWidth: "4em", textAlign: "right" }}
            >
              {calculateFileSize(item)}
            </span>
          </div>
        );
      })}
    </div>
  );
};
