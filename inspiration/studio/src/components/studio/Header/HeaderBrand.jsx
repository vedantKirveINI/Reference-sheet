import React, { useState, useRef, useEffect, useCallback } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { icons } from "@/components/icons";
import { MODE_CONFIG } from "./config";
import { MODE } from "../../../constants/mode";
import { ODSIcon as Icon } from "@src/module/ods";

const PencilIcon = icons.pencil;
const MAX_TITLE_LENGTH = 75;
const WC_LANDING_URL = import.meta.env?.VITE_WC_LANDING_URL || process.env.REACT_APP_WC_LANDING_URL || "";

const HeaderBrand = ({ mode, title, subtitle, onTitleChange, compact, className }) => {
  const config = MODE_CONFIG[mode] || MODE_CONFIG[MODE.WORKFLOW_CANVAS];
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(title || "");
  const inputRef = useRef(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  useEffect(() => {
    setEditValue(title || "");
  }, [title]);

  const handleStartEdit = () => {
    setEditValue(title || "");
    setIsEditing(true);
  };

  const handleSave = () => {
    const trimmedValue = editValue.trim().slice(0, MAX_TITLE_LENGTH);
    if (trimmedValue && trimmedValue !== title) {
      onTitleChange?.(trimmedValue);
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditValue(title || "");
    setIsEditing(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSave();
    } else if (e.key === "Escape") {
      e.preventDefault();
      handleCancel();
    }
  };

  const handleTitleKeyDown = (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleStartEdit();
    }
  };

  const handleIconClick = useCallback(() => {
    if (WC_LANDING_URL) {
      window.open(WC_LANDING_URL, "_blank");
    }
  }, []);

  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <Button
        type="button"
        variant="ghost"
        size={compact ? "icon" : "icon"}
        onClick={handleIconClick}
        className={cn(
          "shrink-0 rounded-xl bg-[#1C3693]/8 hover:bg-[#1C3693]/12 hover:opacity-90",
          compact ? "h-8 w-8" : "h-10 w-10"
        )}
        title={WC_LANDING_URL ? "Open platform" : undefined}
        aria-label={WC_LANDING_URL ? "Open platform in new window" : undefined}
        data-testid="header-brand-icon"
      >
        <Icon
          outeIconName={config.icon}
          outeIconProps={{
            sx: {
              width: compact ? "2rem" : "2.5rem",
              height: compact ? "2rem" : "2.5rem",
              borderRadius: "0.75rem",
            },
          }}
        />
      </Button>

      <div className="flex min-w-0 flex-col">
        {isEditing ? (
          <div className="flex items-center gap-1.5">
            <Input
              ref={inputRef}
              type="text"
              value={editValue}
              maxLength={MAX_TITLE_LENGTH}
              onChange={(e) => setEditValue(e.target.value.slice(0, MAX_TITLE_LENGTH))}
              onKeyDown={handleKeyDown}
              onBlur={handleSave}
              className={cn(
                "h-auto font-semibold tracking-tight",
                compact ? "w-[200px] text-base" : "w-[320px] text-lg",
                editValue.length >= MAX_TITLE_LENGTH && "border-destructive ring-1 ring-destructive focus-visible:ring-destructive"
              )}
              data-testid="header-title-input"
            />
            <span
              className={cn(
                "shrink-0 text-muted-foreground tabular-nums",
                compact ? "text-[0.7rem]" : "text-[0.75rem]"
              )}
              data-testid="header-title-char-count"
            >
              {editValue.length}/{MAX_TITLE_LENGTH}
            </span>
          </div>
        ) : (
          <Button
            type="button"
            variant="ghost"
            className="group h-auto justify-start gap-1.5 p-0 font-semibold text-foreground hover:bg-transparent"
            onClick={handleStartEdit}
            onKeyDown={handleTitleKeyDown}
            data-testid="header-title-button"
          >
            <span
              className={cn(
                "truncate tracking-tight",
                compact ? "max-w-[200px] text-base" : "max-w-[320px] text-lg"
              )}
              data-testid="header-title"
            >
              {title || `Untitled ${config.label}`}
            </span>
            <PencilIcon className="h-3.5 w-3.5 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
          </Button>
        )}

        {subtitle && (
          <span
            className={cn(
              "truncate text-muted-foreground",
              compact ? "max-w-[180px] text-[10px]" : "max-w-[280px] text-xs"
            )}
            data-testid="header-subtitle"
          >
            {subtitle}
          </span>
        )}
      </div>
    </div>
  );
};

export default HeaderBrand;
