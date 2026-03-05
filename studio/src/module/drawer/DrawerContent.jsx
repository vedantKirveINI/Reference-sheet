import React from "react";
import { cn } from "@/lib/utils";

const DrawerContent = ({
  removeContentPadding = false,
  allowContentOverflow = false,
  sidebarContent,
  children,
  style = {},
}) => {
  return (
    <div
      className={cn(
        "flex flex-1 flex-col box-border bg-surface-base relative rounded-island",
        removeContentPadding && "p-0",
        !allowContentOverflow && "overflow-hidden",
      )}
      data-testid="drawer-content"
      style={{
        paddingTop: removeContentPadding
          ? 0
          : "var(--drawer-content-padding-top)",
        paddingBottom: removeContentPadding
          ? 0
          : "var(--drawer-content-padding-bottom)",
        paddingLeft: removeContentPadding
          ? 0
          : "var(--drawer-content-padding-x)",
        paddingRight: removeContentPadding
          ? 0
          : "var(--drawer-content-padding-x)",
        ...style,
      }}
    >
      {children}
      {sidebarContent && (
        <div className="absolute w-full h-full bg-surface-base rounded-island overflow-y-auto overflow-x-hidden px-2 py-2 z-[10]">
          {sidebarContent}
        </div>
      )}
    </div>
  );
};

export default DrawerContent;
