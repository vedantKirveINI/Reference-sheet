import { useState, ReactNode } from "react";
import { ODSLabel, ODSIcon } from "@src/module/ods";
import { SettingsCardType } from "../config";
import { cn } from "@/lib/utils";

interface SettingsCardProps {
  type: SettingsCardType;
  title: string;
  children: ReactNode;
  defaultExpanded?: boolean;
  summaryBadge?: string;
  disabled?: boolean;
  disabledMessage?: string;
  testId?: string;
}

export const SettingsCard = ({
  type,
  title,
  children,
  defaultExpanded = false,
  summaryBadge,
  disabled = false,
  disabledMessage,
  testId,
}: SettingsCardProps) => {
  const [expanded, setExpanded] = useState(defaultExpanded);

  const handleToggle = () => {
    if (!disabled) {
      setExpanded(!expanded);
    }
  };

  const hasBadgeContent = summaryBadge && summaryBadge.length > 0;
  const showBadge = !expanded && hasBadgeContent;

  return (
    <div className="rounded-lg mb-2 overflow-hidden bg-white" data-testid={testId || `settings-card-${type}`}>
      <div
        className={cn(
          "flex items-center justify-between py-3 px-4 cursor-pointer select-none transition-colors duration-200",
          disabled ? "cursor-default opacity-60 hover:bg-transparent" : "hover:bg-[#f5f5f5]"
        )}
        onClick={handleToggle}
        role="button"
        aria-expanded={expanded}
        tabIndex={disabled ? -1 : 0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            handleToggle();
          }
        }}
      >
        <div className="flex items-center gap-2">
          <ODSIcon
            outeIconName="OUTEChevronRightIcon"
            outeIconProps={{
              sx: {
                color: disabled ? "#bdbdbd" : "#607D8B",
                width: "1.25em",
                height: "1.25em",
                transition: "transform 0.2s ease",
                transform: expanded ? "rotate(90deg)" : "rotate(0deg)",
              },
            }}
          />
          <span className="font-semibold text-xs tracking-[1.25px] uppercase text-[#212121]">{title}</span>
        </div>
        <div className="flex items-center gap-3">
          {showBadge && (
            <span
              className={cn(
                "text-xs px-2 py-0.5 rounded whitespace-nowrap",
                summaryBadge !== "No rules set" && summaryBadge !== "Default"
                  ? "text-[#1976d2] bg-[#e3f2fd]"
                  : "text-[#757575] bg-[#f0f0f0]"
              )}
            >
              {summaryBadge}
            </span>
          )}
        </div>
      </div>

      {expanded && !disabled && (
        <>
          <div className="h-px bg-[#e0e0e0] mx-4" />
          <div className="px-4 pb-4 animate-in fade-in slide-in-from-top-2 duration-200">{children}</div>
        </>
      )}

      {disabled && disabledMessage && (
        <div className="py-3 px-4 text-[#757575] text-[13px] italic bg-[#fafafa] rounded mx-2 my-2 mb-4">
          {disabledMessage}
        </div>
      )}
    </div>
  );
};

export default SettingsCard;
