import React, { useMemo } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Terminal } from "@src/module/terminal/terminal";

const mapLogToTerminalFormat = (log) => {
  const type =
    log.level === "error" ||
    log.level === "info" ||
    log.level === "success" ||
    log.level === "aborted"
      ? log.level
      : "info";
  return {
    type,
    timestamp: String(log.timestamp ?? ""),
    message: log.message ?? "",
    logEventName: "",
    data: log.data ?? null,
    executionTime: "",
  };
};

const LogsDialogPanel = ({
  isOpen = false,
  onClose = () => {},
  logs = [],
  onClear = () => {},
  title = "Logs",
  showVerbose = true,
  onToggleVerbose = () => {},
}) => {
  const terminalLogs = useMemo(
    () => logs.map(mapLogToTerminalFormat),
    [logs]
  );

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent side="right" className="flex flex-col w-full max-w-2xl">
        <SheetHeader>
          <SheetTitle>{title}</SheetTitle>
        </SheetHeader>
        <div className="flex-1 min-h-0 overflow-hidden mt-4">
          <Terminal
            logs={terminalLogs}
            onClearTerminal={onClear}
            verbose={showVerbose}
            onCollapseToggle={() => {}}
            title={title}
            showHeader={false}
            showClearTerminal
            hasStreaming={false}
          />
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default LogsDialogPanel;
