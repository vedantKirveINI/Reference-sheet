import React, { useEffect, useState } from "react";
import {
  Tooltip,
  TooltipProvider,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
import { getLucideIcon } from "@/components/icons";
import { cn } from "@/lib/utils";
import DataBlockTooltip from "./DataBlockTooltip.jsx";
import { truncateMiddle } from "../../utils/fx-utils.jsx";
import classes from "./DataBlock.module.css";

const isOperatorBlock = (block) => {
  return (
    block.subCategory === "OPERATORS" ||
    (block.category === "OTHER" && [",", "(", ")"].includes(block.value))
  );
};

const isFunctionBlock = (block) => {
  return block.subCategory === "FUNCTIONS" || block.type === "FUNCTIONS";
};

const DataBlock = ({ block, startChars, endChars, onClick = () => {}, isIncompatible = false }) => {
  const [showTooltip, setShowTooltip] = useState(false);

  useEffect(() => {
    const listener = () => {
      setShowTooltip(false);
    };
    window.addEventListener("keydown", listener);
    return () => {
      window.removeEventListener("keydown", listener);
    };
  }, []);

  if (isOperatorBlock(block)) {
    return (
      <span
        className={classes["operator-text"]}
        style={{ color: "var(--depth-text, #9e9e9e)" }}
        data-testid={`data-block-${block.value}`}
        onClick={(e) => !isIncompatible && onClick(e, block)}
      >
        {block.value}
      </span>
    );
  }

  const isFunction = isFunctionBlock(block);

  const truncatedLabel = truncateMiddle(
    `${block.nodeNumber ? `${block.nodeNumber}. ` : ""}${
      block.displayValue || block.name || block.value
    }`,
    startChars,
    endChars,
  );

  return (
    <div
      style={{
        display: "flex",
        position: "relative",
        alignItems: "center",
        borderRadius: "6px",
        minHeight: "1.75rem",
        opacity: isIncompatible ? 0.4 : 1,
        cursor: isIncompatible ? "not-allowed" : undefined,
        border: block.error ? "2px solid" : "1px solid",
        borderColor: block.error 
          ? "var(--fx-error-border, #dc2626)" 
          : "transparent",
      }}
    >
      <div
        className={cn(
          classes["data-block"],
          isFunction && classes["function-block"],
        )}
        style={{
          background: block.error
            ? "rgba(220, 38, 38, 0.08)"
            : isFunction
              ? "var(--depth-bg, rgba(28, 54, 147, 0.06))"
              : block.background || "#E5EAF1",
          color: block.error
            ? "var(--fx-error-text, #dc2626)"
            : isFunction
              ? "var(--depth-text, #1C3693)"
              : block.foreground || "#000",
          opacity: block.error ? 0.9 : 1,
          paddingRight: block.error ? "1.719rem" : "0.219rem",
        }}
        data-testid={`data-block-${block.displayValue || block.name || block.value}`}
        data-has-error={block.error ? "true" : "false"}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        onKeyDown={() => setShowTooltip(false)}
        onMouseDown={() => setShowTooltip(false)}
        onClick={(e) => !isIncompatible && onClick(e, block)}
      >
        <div className={cn("font-medium leading-[1.5] text-ellipsis overflow-hidden whitespace-nowrap", classes["data-block-name"])}>
          <TooltipProvider>
            <Tooltip open={showTooltip}>
              <TooltipTrigger asChild>
                <span className="inline-block">{truncatedLabel}</span>
              </TooltipTrigger>
              <TooltipContent
                className={cn(
                  "max-w-[42rem]",
                  block.error
                    ? "bg-destructive text-destructive-foreground"
                    : "bg-card text-card-foreground shadow-lg border border-border",
                )}
              >
                {block.error ? (
                  block.errorMessage || "Error"
                ) : (
                  <DataBlockTooltip block={block} />
                )}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>
      {block.error && (
        <div
          className="flex items-center absolute top-0 right-0 w-full h-full justify-end pointer-events-none py-0 px-1"
          data-testid={`data-block-error-${block.blockId}`}
        >
          {getLucideIcon("OUTEWarningIcon", {
            size: 20,
            className: "text-destructive",
          })}
        </div>
      )}
      {isIncompatible && !block.error && (
        <div className="absolute top-0 right-0 w-2 h-2 -mt-0.5 -mr-0.5 rounded-full bg-red-400 pointer-events-none" />
      )}
    </div>
  );
};

export default DataBlock;
