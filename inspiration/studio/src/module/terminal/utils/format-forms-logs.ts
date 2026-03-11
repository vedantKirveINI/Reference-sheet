import { getCurrentTime } from ".";
import { FormLogEventData, TerminalLogData } from "../types";

function formatType(type: string): string {
  if (!type) return "";
  return type
    ?.toLowerCase()
    ?.split("_")
    ?.map((word) => word?.charAt(0)?.toUpperCase() + word?.slice(1))
    ?.join(" ");
}

export const MESSAGE_MAPPING = {
  success: "Node has successfully processed the input",
  error: "Node has not successfully processed the input",
};

export const formatSingleFormLog = (
  eventData: FormLogEventData
): TerminalLogData => {
  const message = MESSAGE_MAPPING[eventData?.type] || "";

  return {
    type: eventData?.type,
    timestamp: getCurrentTime(new Date().toISOString()),
    message: message,
    logEventName: `${formatType(eventData?.node?.type)} - ${eventData?.node?.config?.name}`,
    data: {
      response: eventData?.response,
    },
    executionTime: null,
  };
};

export const formatFormsLogs = (
  formEventsData: FormLogEventData[]
): TerminalLogData[] => {
  return formEventsData.map((eventData) => {
    return formatSingleFormLog(eventData);
  });
};
