import { useState, useRef, useEffect } from "react";

export const useTerminal = (
  data,
  showOnlyErrors,
  showVerbose,
  onClearTerminal
) => {
  const [history, setHistory] = useState([]);
  const [isAtBottom, setIsAtBottom] = useState(true);
  const terminalRef = useRef(null);

  useEffect(() => {
    if (data && data.length > 0) {
      const processedEntries = data
        .filter((entry) => {
          // Filter by error type if "Show only errors" is checked
          if (showOnlyErrors && entry.type !== "error") {
            return false;
          }

          // Filter by verbose if "Verbose" is unchecked
          if (!showVerbose && entry.isVerbose === true) {
            return false;
          }

          return true;
        })
        .map((entry, index) => {
          if (entry.type === "divider") {
            return {
              type: "divider",
              content: "─".repeat(80),
              id: `divider-${index}`,
            };
          }

          let content = "";
          const displayType = entry.type || "info";

          if (entry.created_at) {
            content += `[${entry.created_at}] `;
          }

          if (entry.message) {
            if (
              entry.messageType === "json" &&
              typeof entry.message === "object"
            ) {
              content = entry.message;
            } else {
              content += entry.message;
            }
          }

          return {
            type: displayType,
            content: content,
            messageType: entry.messageType,
            timestamp: entry.created_at,
            id: `entry-${index}`,
          };
        })
        .filter((entry) => entry.content || entry.type === "divider");

      setHistory(processedEntries);

      // Only auto-scroll if user is at bottom
      if (isAtBottom) {
        setTimeout(() => {
          if (terminalRef.current) {
            terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
          }
        }, 50);
      }
    }
  }, [data, isAtBottom, showOnlyErrors, showVerbose]);

  useEffect(() => {
    // Auto-scroll to bottom when new content is added (only if user is at bottom)
    if (isAtBottom && terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [history, isAtBottom]);

  const handleScroll = () => {
    if (terminalRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = terminalRef.current;
      const atBottom = scrollTop + clientHeight >= scrollHeight - 10;
      setIsAtBottom(atBottom);
    }
  };

  const clearTerminal = () => {
    setHistory([]);
    // Emit event to parent component to clear source data
    if (onClearTerminal && typeof onClearTerminal === "function") {
      onClearTerminal();
    }
  };

  return {
    history,
    terminalRef,
    handleScroll,
    clearTerminal,
  };
};
