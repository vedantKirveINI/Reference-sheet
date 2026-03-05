import React, { useMemo } from "react";
import { Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import { TRIGGER_TYPES } from "../constants";
import { INTEGRATION_TYPE } from "../../constants/types";

const PreviewSentence = ({ state, className }) => {
  const {
    triggerType,
    formConnection,
    formEvent,
    sheetConnection,
    sheetEventTypes = [],
    columnFilter,
    selectedColumns,
    integration,
    integrationEvent,
    integrationConnection,
    scheduleType,
    interval,
    time,
    weekdays,
    timezone,
  } = state;

  const sentence = useMemo(() => {
    if (!triggerType) {
      return null;
    }

    switch (triggerType) {
      case TRIGGER_TYPES.MANUAL:
        return "This workflow runs when you manually trigger it";

      case TRIGGER_TYPES.TIME_BASED: {
        if (!scheduleType) {
          return "This workflow runs on a schedule";
        }
        
        const formatTime = (t) => {
          if (!t) return "";
          const [h, m] = t.split(":");
          const hour = parseInt(h, 10);
          const ampm = hour >= 12 ? "PM" : "AM";
          const displayHour = hour % 12 || 12;
          return `${displayHour}:${m} ${ampm}`;
        };

        const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

        switch (scheduleType) {
          case "interval":
            const unit = interval?.unit === "hours" ? "hour" : "minute";
            const plural = interval?.value !== 1 ? "s" : "";
            return `This workflow runs every ${interval?.value || 15} ${unit}${plural}`;
          case "daily":
            return `This workflow runs daily at ${formatTime(time)}`;
          case "weekly":
            if (!weekdays || weekdays.length === 0) {
              return "This workflow runs weekly";
            }
            if (weekdays.length === 7) {
              return `This workflow runs every day at ${formatTime(time)}`;
            }
            if (weekdays.length === 5 && !weekdays.includes(0) && !weekdays.includes(6)) {
              return `This workflow runs on weekdays at ${formatTime(time)}`;
            }
            const selectedDays = weekdays.map(d => dayNames[d]).join(", ");
            return `This workflow runs on ${selectedDays} at ${formatTime(time)}`;
          case "monthly":
            return `This workflow runs monthly at ${formatTime(time)}`;
          case "once":
            return "This workflow runs once at a specific date and time";
          case "custom":
            return "This workflow runs on specific dates you choose";
          default:
            return "This workflow runs on a schedule";
        }
      }

      case TRIGGER_TYPES.WEBHOOK:
        return "This workflow runs when it receives an HTTP request";

      case TRIGGER_TYPES.FORM: {
        if (!formConnection) {
          return "This workflow runs when someone interacts with a form";
        }
        const formName = formConnection.name || "your form";
        const eventText = formEvent === "abandoned" ? "abandons" : "submits";
        return `This workflow runs when someone ${eventText} "${formName}"`;
      }

      case TRIGGER_TYPES.SHEET: {
        if (!sheetConnection?.table) {
          return "This workflow runs when data changes in a spreadsheet";
        }
        
        const sheetName = sheetConnection.name || "your spreadsheet";
        const tableName = sheetConnection.table?.name || "";
        const types = Array.isArray(sheetEventTypes) ? sheetEventTypes : [];
        
        let eventText = "changes";
        if (types.length === 1) {
          if (types[0] === "row_created") eventText = "a record is created in";
          else if (types[0] === "row_updated") eventText = "a record is updated in";
          else if (types[0] === "row_deleted") eventText = "a record is deleted from";
        } else if (types.length > 1) {
          const parts = [];
          if (types.includes("row_created")) parts.push("created");
          if (types.includes("row_updated")) parts.push("updated");
          if (types.includes("row_deleted")) parts.push("deleted");
          const phrase = parts.length === 1 ? parts[0] : `${parts.slice(0, -1).join(", ")} or ${parts[parts.length - 1]}`;
          eventText = parts.length > 0 ? `a record is ${phrase} in` : eventText;
        }
        
        let columnText = "";
        if (types.includes("row_updated") && columnFilter === "specific" && selectedColumns?.length > 0) {
          const colNames = selectedColumns.slice(0, 3).map((c) => (typeof c === "string" ? c : c?.name ?? c?.id ?? "")).filter(Boolean);
          const remaining = selectedColumns.length - colNames.length;
          columnText = ` (${colNames.join(", ")}${remaining > 0 ? ` +${remaining} more` : ""})`;
        }
        
        return `This workflow runs when ${eventText} "${sheetName}${tableName ? ` > ${tableName}` : ""}"${columnText}`;
      }


      case TRIGGER_TYPES.APP_BASED:
      case INTEGRATION_TYPE: {
        if (!integration) {
          return "This workflow runs when something happens in a connected app";
        }
        if (!integrationEvent) {
          return `This workflow runs when something happens in ${integration.name}`;
        }
        if (!integrationConnection) {
          return `This workflow will run on "${integrationEvent.name}" in ${integration.name} (connection required)`;
        }
        return `This workflow runs on "${integrationEvent.name}" in ${integration.name}`;
      }

      default:
        return null;
    }
  }, [
    triggerType,
    formConnection,
    formEvent,
    sheetConnection,
    sheetEventTypes,
    columnFilter,
    selectedColumns,
    integration,
    integrationEvent,
    integrationConnection,
    scheduleType,
    interval,
    time,
    weekdays,
  ]);

  if (!sentence) {
    return null;
  }

  return (
    <div
      className={cn(
        "flex items-center gap-2 px-4 py-3 bg-muted/50 border-t border-border",
        className
      )}
    >
      <Zap className="w-4 h-4 text-primary shrink-0" />
      <p className="text-sm text-foreground">{sentence}</p>
    </div>
  );
};

export default PreviewSentence;
