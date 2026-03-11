import React from "react";

import { Loader2, FileText } from "lucide-react";

const FileProgressBar = ({ file }) => {
  const formatFileSize = (bytes) => {
    if (bytes === 0 || !bytes) return "";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + sizes[i];
  };

  return (
    <div className="border border-gray-200 rounded-lg bg-white px-4 py-3">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <FileText className="w-5 h-5 text-gray-600 flex-shrink-0" />
          <span className="text-sm text-gray-900 font-medium truncate flex-1">
            {file.name}
          </span>
          {file.size && (
            <span className="text-xs text-gray-500 flex-shrink-0 ml-2">
              {formatFileSize(file.size)}
            </span>
          )}
        </div>
        <div className="flex-shrink-0">
          <Loader2 className="w-4 h-4 text-gray-500 animate-spin" />
        </div>
      </div>
    </div>
  );
};

export default FileProgressBar;
