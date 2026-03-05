import React, { useState } from "react";
import { ODSIcon as Icon } from "@src/module/ods";
import { cn } from "@/lib/utils";
import { X, Maximize2, Minimize2 } from "lucide-react";

const DrawerTitle = ({
  showFullscreenIcon = true,
  showCloseIcon = true,
  title,
  titleProps = {},
  dividers = false,
  expanded = false,
  onExpand = () => {},
  onClose = () => {},
  loading = false,
  headerColor = "#1C3693",
  headerTextColor = "#FFFFFF",
  headerGap = 8,
  useLucideIcons = true,
}) => {
  const [isExpanded, setIsExpanded] = useState(expanded);
  const isNoTitle = !title && !showFullscreenIcon && !showCloseIcon;
  return (
    <div
      className={cn(
        "min-h-[3.5rem] h-14 flex items-center justify-between px-4 w-full overflow-hidden relative z-20 flex-none",
        "bg-white border-b",
        isNoTitle && "h-0 p-0 border-none"
      )}
      {...(titleProps || {})}
      style={{
        borderColor: "rgba(0, 0, 0, 0.08)",
        ...(titleProps.style || {}),
      }}
      data-testid="drawer-title-root"
    >
      <div className="flex items-center gap-3">
        <span
          className="font-sans text-sm font-semibold text-foreground tracking-tight truncate"
          data-testid="drawer-title"
        >
          {title}
        </span>
      </div>
      {/* Right: Actions */}
      <div className="flex items-center gap-1">
        {showFullscreenIcon && (
          useLucideIcons ? (
            <button
              onClick={() => {
                const expandedValue = !isExpanded;
                setIsExpanded(expandedValue);
                onExpand(expandedValue);
              }}
              className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-black/5 transition-colors"
              disabled={loading}
              data-testid="drawer-fullscreen-icon"
            >
              {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
          ) : (
            <Icon
              outeIconName={`${
                isExpanded ? "OUTECloseFullscreenIcon" : "OUTEOpenFullscreenIcon"
              }`}
              outeIconProps={{
                sx: {
                  width: 24,
                  height: 24,
                  cursor: "pointer",
                  color: headerTextColor,
                },
                "data-testid": "drawer-fullscreen-icon",
              }}
              buttonProps={{
                sx: {
                  padding: 0,
                  visibility: showFullscreenIcon ? "visible" : "hidden",
                },
              }}
              onClick={() => {
                const expandedValue = !isExpanded;
                setIsExpanded(expandedValue);
                onExpand(expandedValue);
              }}
            />
          )
        )}
        {showCloseIcon && (
          useLucideIcons ? (
            <button
              onClick={(e) => onClose(e, "close-clicked")}
              className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-black/5 transition-colors"
              disabled={loading}
              data-testid="node-drawer-close"
            >
              <X className="w-4 h-4" />
            </button>
          ) : (
            <Icon
              outeIconName="OUTECloseIcon"
              outeIconProps={{
                sx: {
                  width: "2rem",
                  height: "2rem",
                  cursor: "pointer",
                  color: headerTextColor,
                },
                "data-testid": "node-drawer-close",
              }}
              buttonProps={{
                sx: {
                  padding: 0,
                  visibility: showCloseIcon ? "visible" : "hidden",
                },
                disabled: loading,
              }}
              onClick={(e) => onClose(e, "close-clicked")}
            />
          )
        )}
      </div>
    </div>
  );
};

export default DrawerTitle;
