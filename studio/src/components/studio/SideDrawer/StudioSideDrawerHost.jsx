import React, { forwardRef, useImperativeHandle, useState, useCallback } from "react";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

/**
 * StudioSideDrawerHost - A host component for sidebar panels using the studio SideDrawer system.
 * 
 * This replaces the legacy drawer's openSidebarPanel pattern with a state-driven approach.
 * Panels are expected to be full compositions with their own DrawerHeader.
 * 
 * Usage:
 * ```jsx
 * const sideDrawerRef = useRef();
 * 
 * // Open a panel
 * sideDrawerRef.current?.openPanel({
 *   id: "global-params",
 *   component: <GlobalVariablesPanel onClose={() => sideDrawerRef.current?.closePanel()} />,
 * });
 * 
 * // Close
 * sideDrawerRef.current?.closePanel();
 * ```
 */
const StudioSideDrawerHost = forwardRef(({ 
  className,
  width = "28rem",
  onPanelChange,
}, ref) => {
  const [activePanel, setActivePanel] = useState(null);

  const openPanel = useCallback((panelConfig) => {
    setActivePanel(panelConfig);
    onPanelChange?.(true, panelConfig?.id);
  }, [onPanelChange]);

  const closePanel = useCallback(() => {
    const panelId = activePanel?.id;
    setActivePanel(null);
    onPanelChange?.(false, panelId);
  }, [activePanel?.id, onPanelChange]);

  const isOpen = useCallback(() => {
    return activePanel !== null;
  }, [activePanel]);

  const getActivePanelId = useCallback(() => {
    return activePanel?.id ?? null;
  }, [activePanel]);

  useImperativeHandle(ref, () => ({
    openPanel,
    closePanel,
    isOpen,
    getActivePanelId,
  }), [openPanel, closePanel, isOpen, getActivePanelId]);

  return (
    <Sheet open={activePanel !== null} onOpenChange={(open) => !open && closePanel()}>
      <SheetContent
        side="right"
        className={cn(
          "p-0 border-l-0 bg-white",
          "rounded-l-2xl",
          "shadow-[-8px_0_24px_rgba(0,0,0,0.12)]",
          "flex flex-col",
          className
        )}
        style={{ 
          width,
          maxWidth: "90vw",
        }}
      >
        <SheetTitle className="sr-only">{activePanel?.title || "Panel"}</SheetTitle>
        
        {activePanel?.component}
      </SheetContent>
    </Sheet>
  );
});

StudioSideDrawerHost.displayName = "StudioSideDrawerHost";

export default StudioSideDrawerHost;
