import { LogType } from "../types";

export const getLogTypeColor = (type: LogType): `#${string}` => {
  // MUI palette main colors
  switch (type) {
    case "error":
      return "#d32f2f"; // MUI error.main
    case "aborted":
      return "#9c27b0"; // MUI purple[500] (closest to "aborted" status)
    case "success":
      return "#2e7d32"; // MUI success.main
    case "info":
      return "#0288d1"; // MUI info.main
    default:
      return "#6c757d"; // MUI grey[600] as a neutral default
  }
};

export const getCurrentTime = (created_at?: string): string => {
  const formatTime = (date: Date): string => {
    const hours = date.getHours().toString().padStart(2, "0");
    const minutes = date.getMinutes().toString().padStart(2, "0");
    const seconds = date.getSeconds().toString().padStart(2, "0");
    return `${hours}:${minutes}:${seconds}`;
  };

  if (created_at) {
    const date = new Date(created_at);
    return formatTime(date);
  } else {
    return formatTime(new Date());
  }
};

export const canJsonViewerRender = (data: any) => {
  if (data === null || data === undefined) return false;
  if (typeof data === "object") return true;
  if (typeof data === "string") {
    return false;
  }
  return false;
};

export {
  formatEventsDataInLogsData,
  formatSingleLog,
} from "./format-workflow-logs";

export { formatFormsLogs, formatSingleFormLog } from "./format-forms-logs";
