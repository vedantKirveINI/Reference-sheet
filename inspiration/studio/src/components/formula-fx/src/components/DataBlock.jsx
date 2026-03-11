import React from "react";
import { cn } from "@/lib/utils";
import { getFriendlyTypeLabel } from "../utils/friendly-type-labels.js";
import { capitalize } from "../utils/fx-utils.jsx";

const DataBlock = ({ block, onClick, onHover, isSelected = false, categoryLabel }) => {
  const rawName = block.displayValue || block.name || block.value;
  const displayName = capitalize(rawName ?? "");

  const isFunction =
    block.subCategory === "FUNCTIONS" ||
    block.section === "functions" ||
    block.originalSection === "functions";

  const isOperator =
    block.subCategory === "OPERATORS" ||
    block.section === "operators" ||
    block.originalSection === "operators";

  const isKeyword =
    block.subCategory === "KEYWORDS" || block.section === "keywords";

  const handleClick = () => {
    onClick(block);
  };

  const handleMouseEnter = () => {
    if (onHover) onHover(block);
  };

  const blockBaseClass =
    "flex items-center gap-1.5 py-2.5 px-3 rounded-md cursor-pointer text-sm mb-0.5 hover:bg-muted transition-colors duration-150";
  const selectedClass = "bg-muted";
  const operatorClass = "bg-transparent";
  const functionClass = "";
  const keywordClass = "";

  if (isOperator) {
    return (
      <div
        className={cn(
          blockBaseClass,
          isSelected && selectedClass,
          operatorClass,
        )}
        onClick={handleClick}
        onMouseEnter={handleMouseEnter}
      >
        <span className="inline-flex items-center justify-center min-w-[20px] h-[18px] py-0 px-1 bg-muted border border-border rounded font-semibold text-xs text-muted-foreground shrink-0">
          {displayName}
        </span>
        <div className="flex flex-col flex-1 min-w-0">
          {block.description && (
            <span className="text-sm font-medium text-foreground">
              {block.description
                .replace(/<[^>]*>/g, "")
                .split(".")[0]
                .substring(0, 30)}
            </span>
          )}
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        blockBaseClass,
        isSelected && selectedClass,
        isFunction && functionClass,
        isKeyword && keywordClass,
      )}
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
    >
      <span
        className={cn(
          "text-foreground flex-1 font-medium text-sm shrink-0 leading-tight",
          isFunction && "text-primary font-semibold",
          isKeyword && "italic text-muted-foreground",
          isSelected && "font-semibold text-foreground",
        )}
      >
        {displayName}
      </span>
      {categoryLabel && (
        <span className="text-xs text-muted-foreground font-medium leading-tight shrink-0">
          {categoryLabel}
        </span>
      )}
      {block.returnType && (
        <span className="text-xs text-muted-foreground py-0.5 px-1.5 rounded-full font-normal lowercase bg-muted/80 leading-tight shrink-0">
          {getFriendlyTypeLabel(block.returnType)}
        </span>
      )}
    </div>
  );
};

export default DataBlock;
