import React, { useState, useRef, useCallback } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

const TRUNCATE_LENGTH = 80;
const TRUNCATE_LENGTH_LINK = 50;

const HOVER_DELAY_MS = 150;

export function TruncatedValueWithPopover({
  value,
  maxLength = TRUNCATE_LENGTH,
  className,
  asLink = false,
  label = "View full value",
  showQuotes = true,
}) {
  const [open, setOpen] = useState(false);
  const closeTimerRef = useRef(null);

  const clearCloseTimer = useCallback(() => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
  }, []);

  const handleOpen = useCallback(() => {
    clearCloseTimer();
    setOpen(true);
  }, [clearCloseTimer]);

  const handleClose = useCallback(() => {
    clearCloseTimer();
    closeTimerRef.current = setTimeout(() => setOpen(false), HOVER_DELAY_MS);
  }, [clearCloseTimer]);

  const isLong = value.length > maxLength;
  const displayText = isLong ? `${value.slice(0, maxLength)}...` : value;
  const wrap = showQuotes ? (t) => `"${t}"` : (t) => t;

  if (!isLong) {
    if (asLink && (value.startsWith("http://") || value.startsWith("https://"))) {
      return (
        <a
          href={value}
          target="_blank"
          rel="noopener noreferrer"
          className={cn("font-mono text-xs text-primary hover:underline", className)}
        >
          {wrap(value)}
        </a>
      );
    }
    return (
      <span className={cn("font-mono text-xs text-green-600 dark:text-green-400", className)}>
        {wrap(value)}
      </span>
    );
  }

  const triggerContent = (
    <span
      className={cn(
        asLink && "text-primary",
        "font-mono text-xs text-green-600 dark:text-green-400 break-all min-w-0 max-w-full inline-block overflow-hidden cursor-default hover:underline",
        className
      )}
    >
      {wrap(displayText)}
    </span>
  );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <span
          className="inline-block min-w-0 max-w-full cursor-default"
          onMouseEnter={handleOpen}
          onMouseLeave={handleClose}
        >
          {triggerContent}
        </span>
      </PopoverTrigger>
      <PopoverContent
        className="w-auto max-w-[min(90vw,28rem)] p-0 border rounded-md shadow-md bg-popover"
        align="start"
        side="bottom"
        onOpenAutoFocus={(e) => e.preventDefault()}
        onMouseEnter={handleOpen}
        onMouseLeave={handleClose}
      >
        <pre className="font-mono text-xs whitespace-pre-wrap break-all text-foreground p-3 max-h-64 overflow-auto m-0">
          {value}
        </pre>
      </PopoverContent>
    </Popover>
  );
}

export { TRUNCATE_LENGTH, TRUNCATE_LENGTH_LINK };
