import React, { useState, useMemo } from "react";
import LogsDialogPanel from "./LogsDialogPanel";

const convertLogFormat = (log, index) => {
  if (!log) return null;
  
  if (log.timestamp !== undefined && log.level !== undefined && log.message !== undefined) {
    return {
      id: log.id || `log-${index}-${Date.now()}`,
      ...log,
    };
  }
  
  return {
    id: log.id || `log-${index}-${Date.now()}`,
    timestamp: log.timestamp || log.time || log.createdAt || Date.now(),
    level: log.level || log.type || log.severity || "info",
    message: log.message || log.msg || log.text || log.content || String(log),
    data: log.data || log.metadata || log.payload || null,
  };
};

const LogsDialogPanelWrapper = ({
  open = false,
  onClose = () => {},
  data = [],
  onClearTerminal = () => {},
  title = "Logs",
}) => {
  const [showVerbose, setShowVerbose] = useState(false);

  const convertedLogs = useMemo(() => {
    if (!Array.isArray(data)) return [];
    return data.map((log, index) => convertLogFormat(log, index)).filter(Boolean);
  }, [data]);

  return (
    <LogsDialogPanel
      isOpen={open}
      onClose={onClose}
      logs={convertedLogs}
      onClear={onClearTerminal}
      title={title}
      showVerbose={showVerbose}
      onToggleVerbose={setShowVerbose}
    />
  );
};

export default LogsDialogPanelWrapper;
