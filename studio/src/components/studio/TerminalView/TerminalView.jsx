import React, { useState, useRef, useEffect, useCallback } from "react";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from "@/components/ui/tooltip";
import { Search, Copy, Download, Trash2 } from "lucide-react";
import { LogEntry } from "./LogEntry";

export function TerminalView({
  logs = [],
  title = "Logs",
  maxHeight = 400,
  autoScroll = true,
  showSearch = true,
  showCopy = true,
  showClear = true,
  onClear,
  className,
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const scrollRef = useRef(null);
  const endRef = useRef(null);

  const filteredLogs = searchQuery
    ? logs.filter((log) =>
        log.message.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : logs;

  useEffect(() => {
    if (autoScroll && endRef.current) {
      endRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [logs, autoScroll]);

  const handleCopyAll = useCallback(() => {
    const text = filteredLogs
      .map((log) => {
        const time = new Date(log.timestamp).toLocaleTimeString("en-US", {
          hour12: false,
        });
        let line = `[${time}] [${log.level.toUpperCase()}] ${log.message}`;
        if (log.data) {
          line += `\n${JSON.stringify(log.data, null, 2)}`;
        }
        return line;
      })
      .join("\n");
    navigator.clipboard.writeText(text);
  }, [filteredLogs]);

  const handleDownload = useCallback(() => {
    const text = filteredLogs
      .map((log) => {
        const time = new Date(log.timestamp).toLocaleTimeString("en-US", {
          hour12: false,
        });
        let line = `[${time}] [${log.level.toUpperCase()}] ${log.message}`;
        if (log.data) {
          line += `\n${JSON.stringify(log.data, null, 2)}`;
        }
        return line;
      })
      .join("\n");

    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `logs-${new Date().toISOString().split("T")[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [filteredLogs]);

  const handleClear = useCallback(() => {
    onClear?.();
  }, [onClear]);

  return (
    <TooltipProvider>
      <div
        className={cn(
          "rounded-xl overflow-hidden border border-gray-700 shadow-lg",
          className
        )}
        style={{ fontFamily: "Archivo, sans-serif" }}
      >
        <div className="relative bg-gray-800 px-4 py-3 rounded-t-xl">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: "#FF5F56" }}
            />
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: "#FFBD2E" }}
            />
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: "#27C93F" }}
            />
          </div>

          <h3 className="text-sm font-medium text-gray-300 text-center">
            {title}
          </h3>

          <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-1">
            {showCopy && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-gray-400 hover:text-white hover:bg-gray-700"
                    onClick={handleCopyAll}
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Copy all logs</TooltipContent>
              </Tooltip>
            )}

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-gray-400 hover:text-white hover:bg-gray-700"
                  onClick={handleDownload}
                >
                  <Download className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Download logs</TooltipContent>
            </Tooltip>

            {showClear && onClear && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-gray-400 hover:text-red-400 hover:bg-gray-700"
                    onClick={handleClear}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Clear logs</TooltipContent>
              </Tooltip>
            )}
          </div>
        </div>

        {showSearch && (
          <div className="bg-gray-850 px-4 py-2 border-b border-gray-700" style={{ backgroundColor: "rgb(30 33 40)" }}>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <Input
                type="text"
                placeholder="Filter logs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 bg-gray-800 border-gray-700 text-gray-200 placeholder:text-gray-500 focus:border-gray-600 focus:ring-0"
              />
            </div>
          </div>
        )}

        <div className="bg-gray-900" style={{ maxHeight }}>
          <ScrollArea className="h-full" style={{ maxHeight }}>
            <div ref={scrollRef}>
              {filteredLogs.length === 0 ? (
                <div className="flex items-center justify-center py-12 text-gray-500 text-sm font-mono">
                  {logs.length === 0
                    ? "No logs yet..."
                    : "No logs match your filter"}
                </div>
              ) : (
                filteredLogs.map((log) => <LogEntry key={log.id} log={log} />)
              )}
              <div ref={endRef} />
            </div>
          </ScrollArea>
        </div>
      </div>
    </TooltipProvider>
  );
}
