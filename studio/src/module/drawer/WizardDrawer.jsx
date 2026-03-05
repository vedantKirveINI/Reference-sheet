import React, {
  forwardRef,
  useState,
  useCallback,
  useImperativeHandle,
  useRef,
  useEffect,
  useId,
} from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Pencil,
  ArrowRight,
  ArrowLeft,
  Check,
  Play,
  Save,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import useClickOutside from "./hooks/useClickOutside";
import useEscapeLayer from "@src/hooks/useEscapeLayer";
import useScrollLock from "@src/hooks/useScrollLock";
import "./drawer.css";
import { ScrollArea } from "@/components/ui/scroll-area";

const MAX_TITLE_LENGTH = 40;
const TITLE_DISPLAY_MAX_WIDTH = "16rem";

const DEFAULT_THEME = {
  headerBg: "#ffffff",
  headerBorder: "rgba(0, 0, 0, 0.08)",
  activeTabBg: "#18181b",
  activeTabText: "#ffffff",
  activeTabBorder: "rgba(0, 0, 0, 0.1)",
  inactiveTabText: "#71717a",
  inactiveTabHoverBg: "rgba(0, 0, 0, 0.06)",
  tabContainerBg: "rgba(0, 0, 0, 0.04)",
  primaryButtonBg: "#18181b",
  primaryButtonText: "#ffffff",
  iconBg: "rgba(0, 0, 0, 0.04)",
  iconBorder: "rgba(0, 0, 0, 0.08)",
  iconColor: "#18181b",
};

const WizardDrawer = forwardRef(
  (
    {
      open,
      icon,
      title,
      subtitle,
      tabs = [],
      activeTab,
      onTabChange,
      children,
      footerGuidance,
      footerContent,
      primaryActionLabel = "Next",
      secondaryActionLabel = "Back",
      onPrimaryAction,
      onSecondaryAction,
      showSecondaryAction = true,
      primaryActionDisabled = false,
      tertiaryActionLabel = null,
      onTertiaryAction = null,
      tertiaryActionDisabled = false,
      tertiaryActionLoading = false,
      tertiaryActionIcon = null,
      onSaveAndClose = null,
      saveAndCloseLabel = "Save & Close",
      saveAndCloseDisabled = false,
      footerVariant = "default",
      onClose = () => { },
      drawerWidth = "clamp(45rem, calc(45rem + 2vw), 50rem)",
      showCloseIcon = true,
      showEditTitle = true,
      onTitleChange,
      compactTabs = false,
      loading = false,
      theme = {},
      sidebarActions = [],
      onSidebarActionClick,
      sidebarOffset,
      borderRadius,
      hideFooterBorder = false,
      footerBackground,
      hideShadow = false,
      scrollViewportRef,
      contentClassName,
      fullFooterComponent = null,
      ...props
    },
    ref,
  ) => {
    const drawerRef = useRef();
    const headerRef = useRef();
    const headerLeftRef = useRef();
    const tabContainerRef = useRef();
    const closeButtonRef = useRef();
    const escapeLayerId = useId();
    const [titleValue, setTitleValue] = useState(title || "");
    const [popoverOpen, setPopoverOpen] = useState(false);
    const [titleError, setTitleError] = useState("");
    const [autoCompactTabs, setAutoCompactTabs] = useState(false);

    const mergedTheme = { ...DEFAULT_THEME, ...theme };

    const hasFooter =
      fullFooterComponent != null ||
      footerContent ||
      onPrimaryAction ||
      onSecondaryAction ||
      footerGuidance ||
      onTertiaryAction ||
      onSaveAndClose;

    const handleEscapeClose = useCallback(
      (event) => {
        if (popoverOpen) {
          setTitleValue(title || "");
          setTitleError("");
          setPopoverOpen(false);
          return;
        }
        onClose(event, "escape");
      },
      [popoverOpen, title, onClose],
    );

    useEscapeLayer({
      id: `wizard-drawer-${escapeLayerId}`,
      onEscape: handleEscapeClose,
      enabled: open,
      priority: 0,
    });

    useScrollLock(open);

    useEffect(() => {
      setTitleValue(title || "");
    }, [title, open]);

    // Ref for hidden measurement container (always renders full-width tabs offscreen)
    const measurementRef = useRef(null);

    // Auto-compact tabs based on available header space
    // compactTabs prop serves as manual override - if true, always compact
    // autoCompactTabs kicks in only when compactTabs is false/undefined
    useEffect(() => {
      if (!open || tabs.length <= 1 || compactTabs) {
        setAutoCompactTabs(false);
        return;
      }

      const checkHeaderSpace = () => {
        if (!headerRef.current || !headerLeftRef.current) return;

        const headerWidth = headerRef.current.offsetWidth;
        const leftSectionWidth = headerLeftRef.current.offsetWidth;

        // Get computed padding from header
        const headerStyles = getComputedStyle(headerRef.current);
        const headerPaddingLeft = parseFloat(headerStyles.paddingLeft) || 24;
        const headerPaddingRight = parseFloat(headerStyles.paddingRight) || 24;

        // Measure actual close button width if visible
        const closeButtonWidth =
          closeButtonRef.current?.offsetWidth || (showCloseIcon ? 44 : 0);

        // Get actual actions gap from computed styles
        const rightSection = headerRef.current.querySelector(
          "[data-header-right]",
        );
        const actionsGap = rightSection
          ? parseFloat(getComputedStyle(rightSection).gap) || 12
          : 12;

        // Calculate available space for tabs
        const availableWidth =
          headerWidth -
          leftSectionWidth -
          headerPaddingLeft -
          headerPaddingRight -
          closeButtonWidth -
          actionsGap;

        // Use the hidden measurement container for accurate full-width measurement
        const fullTabsWidth = measurementRef.current?.scrollWidth || 0;

        // Switch to compact if full tabs don't fit with buffer
        const shouldBeCompact =
          fullTabsWidth > 0 && availableWidth < fullTabsWidth + 16;

        if (shouldBeCompact !== autoCompactTabs) {
          setAutoCompactTabs(shouldBeCompact);
        }
      };

      // Initial check after render settles
      const timer = setTimeout(checkHeaderSpace, 80);

      // Observe header, left section, and measurement container for size changes
      const resizeObserver = new ResizeObserver(() => {
        requestAnimationFrame(checkHeaderSpace);
      });
      if (headerRef.current) {
        resizeObserver.observe(headerRef.current);
      }
      if (headerLeftRef.current) {
        resizeObserver.observe(headerLeftRef.current);
      }
      if (measurementRef.current) {
        resizeObserver.observe(measurementRef.current);
      }

      return () => {
        clearTimeout(timer);
        resizeObserver.disconnect();
      };
    }, [
      open,
      tabs,
      compactTabs,
      showCloseIcon,
      titleValue,
      subtitle,
      autoCompactTabs,
      activeTab,
    ]);

    useEffect(() => {
      if (!open) {
        setPopoverOpen(false);
      }
    }, [open]);

    const handleClose = useCallback(
      (event, reason) => {
        onClose(event, reason);
      },
      [onClose],
    );

    useClickOutside(
      drawerRef,
      (event) => {
        handleClose(event, "clickaway");
      },
      200,
      true,
    );

    useImperativeHandle(
      ref,
      () => ({
        setTitle: (newTitle) => setTitleValue(newTitle),
        getTitle: () => titleValue,
      }),
      [titleValue],
    );

    const handleTabClick = (tabId) => {
      if (onTabChange) {
        onTabChange(tabId);
      }
    };

    const handleTitleSave = () => {
      const trimmedTitle = titleValue.trim();

      if (!trimmedTitle) {
        setTitleError("This field is mandatory");
        return;
      }

      if (trimmedTitle.length > MAX_TITLE_LENGTH) {
        setTitleError("Character limit reached");
        return;
      }

      setTitleError("");
      // Update local state immediately for instant UI feedback
      setTitleValue(trimmedTitle);
      if (onTitleChange) {
        onTitleChange(trimmedTitle);
      }
      setPopoverOpen(false);
    };

    const handleTitleKeyDown = (e) => {
      if (e.key === "Enter") {
        handleTitleSave();
      } else if (e.key === "Escape") {
        setTitleValue(title || "");
        setTitleError("");
        setPopoverOpen(false);
      }
    };

    return (
      <AnimatePresence mode="wait">
        {open && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black/20 z-40"
              onClick={(e) => handleClose(e, "backdrop-click")}
            />
            {/* Drawer Container */}
            <div
              className="fixed inset-y-0 z-50 flex items-center pointer-events-none"
              style={{
                right:
                  sidebarOffset ||
                  "var(--canvas-sidebar-offset, calc(4.5rem + 1.25rem + 0.75rem))",
                paddingRight: "0.75rem",
              }}
            >
              <motion.div
                ref={drawerRef}
                initial={{ opacity: 0, x: -40 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -40 }}
                transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
                className={cn(
                  "bg-background relative font-sans border border-border/20 overflow-hidden pointer-events-auto",
                  !borderRadius && "rounded-[var(--wizard-radius-lg)]",
                  !hideShadow && "shadow-2xl",
                )}
                style={{
                  width: drawerWidth,
                  height: "calc(var(--wizard-vh, 100vh) - 2.5rem)",
                  maxHeight: "var(--wizard-vh, 100vh)",
                  display: "grid",
                  gridTemplateRows: hasFooter ? "auto 1fr auto" : "auto 1fr",
                  ...(borderRadius && { borderRadius }),
                  ...(hideShadow && { boxShadow: "none" }),
                }}
                onClick={(e) => e.stopPropagation()}
                data-testid="wizard-drawer-root"
                {...props}
              >
                {/* Header */}
                <div className="flex-none sticky top-0 z-20 min-w-0">
                  <header
                    ref={headerRef}
                    className="border-b flex items-center justify-between"
                    style={{
                      backgroundColor: mergedTheme.headerBg,
                      borderColor: mergedTheme.headerBorder,
                      height: "var(--wizard-header-height)",
                      padding: "0 var(--wizard-header-padding)",
                    }}
                  >
                    {/* Left: Icon + Title */}
                    <div
                      ref={headerLeftRef}
                      className="flex items-center"
                      style={{ gap: "var(--wizard-icon-gap)" }}
                    >
                      {icon && (
                        <div
                          className="rounded-[var(--wizard-radius-md)] flex items-center justify-center"
                          style={{
                            backgroundColor: mergedTheme.iconBg,
                            color: mergedTheme.iconColor,
                            border: `1px solid ${mergedTheme.iconBorder}`,
                            width: "var(--wizard-icon-size)",
                            height: "var(--wizard-icon-size)",
                          }}
                        >
                          {icon}
                        </div>
                      )}
                      <div className="flex flex-col justify-center">
                        {showEditTitle && onTitleChange ? (
                          <Popover
                            open={popoverOpen}
                            onOpenChange={setPopoverOpen}
                          >
                            <PopoverTrigger asChild>
                              <button className="flex items-center gap-1.5 group hover:bg-black/5 px-1.5 py-0.5 rounded transition-colors -ml-1.5 min-w-0">
                                <TooltipProvider delayDuration={150}>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <h2
                                        className="font-semibold text-foreground tracking-tight truncate"
                                        style={{
                                          fontSize: "var(--wizard-title-size)",
                                          maxWidth: TITLE_DISPLAY_MAX_WIDTH,
                                        }}
                                      >
                                        {titleValue || "Untitled"}
                                      </h2>
                                    </TooltipTrigger>
                                    <TooltipContent side="bottom" align="start" className="max-w-sm">
                                      <p className="break-words">{titleValue || "Untitled"}</p>
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                                <Pencil
                                  className="text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                                  style={{
                                    width: "var(--wizard-pencil-size)",
                                    height: "var(--wizard-pencil-size)",
                                  }}
                                />
                              </button>
                            </PopoverTrigger>
                            <PopoverContent className="w-72 p-3" align="start">
                              <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                  <label className="text-xs font-medium text-muted-foreground">
                                    Edit Title
                                  </label>
                                  <span className="text-xs text-muted-foreground">
                                    {titleValue.length}/{MAX_TITLE_LENGTH}
                                  </span>
                                </div>
                                <div className="space-y-1.5">
                                  <div className="flex gap-2">
                                    <Input
                                      value={titleValue}
                                      onChange={(e) => {
                                        setTitleError("");
                                        const value = e.target.value;
                                        if (value.length <= MAX_TITLE_LENGTH) {
                                          setTitleValue(value);
                                        } else {
                                          setTitleError(
                                            "Character limit reached",
                                          );
                                        }
                                      }}
                                      onKeyDown={handleTitleKeyDown}
                                      placeholder="Enter title..."
                                      className={cn(
                                        "h-8 text-sm",
                                        titleError &&
                                        "border-red-400 focus-visible:ring-red-400",
                                      )}
                                      autoFocus
                                    />
                                    <Button
                                      size="sm"
                                      className="h-8 px-2"
                                      onClick={handleTitleSave}
                                      style={{
                                        backgroundColor:
                                          mergedTheme.primaryButtonBg,
                                        color: mergedTheme.primaryButtonText,
                                      }}
                                    >
                                      <Check className="w-4 h-4" />
                                    </Button>
                                  </div>
                                  {titleError && (
                                    <p className="text-xs text-red-500">
                                      {titleError}
                                    </p>
                                  )}
                                </div>
                              </div>
                            </PopoverContent>
                          </Popover>
                        ) : (
                          <TooltipProvider delayDuration={150}>
                            <Tooltip>
                              <TooltipTrigger asChild>
                              <h2
                                className="font-semibold text-foreground tracking-tight truncate cursor-default"
                                style={{
                                  fontSize: "var(--wizard-title-size)",
                                  maxWidth: TITLE_DISPLAY_MAX_WIDTH,
                                }}
                              >
                                {titleValue || "Untitled"}
                              </h2>
                              </TooltipTrigger>
                              <TooltipContent side="bottom" align="start" className="max-w-sm">
                                <p className="break-words">{titleValue || "Untitled"}</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        )}
                        {subtitle && (
                          <TooltipProvider delayDuration={150}>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <div
                                  className="flex items-center gap-1.5 text-muted-foreground max-w-[280px] cursor-default"
                                  style={{
                                    fontSize: "var(--wizard-subtitle-size)",
                                  }}
                                >
                                  <span className="truncate">{subtitle}</span>
                                </div>
                              </TooltipTrigger>
                              <TooltipContent side="bottom" align="start">
                                <p className="max-w-xs">{subtitle}</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        )}
                      </div>
                    </div>

                    {/* Right: Tabs + Actions */}
                    <div
                      className="flex items-center"
                      style={{ gap: "var(--wizard-actions-gap)" }}
                      data-header-right
                    >
                      {/* Hidden measurement container - always renders full-width tabs for accurate measurement */}
                      {tabs.length > 1 && (
                        <div
                          ref={measurementRef}
                          className="flex items-center rounded-[var(--wizard-radius-md)] border"
                          style={{
                            position: "absolute",
                            visibility: "hidden",
                            pointerEvents: "none",
                            whiteSpace: "nowrap",
                            backgroundColor: mergedTheme.tabContainerBg,
                            borderColor: mergedTheme.headerBorder,
                            padding: "var(--wizard-tab-container-padding)",
                          }}
                          aria-hidden="true"
                        >
                          {tabs.map((tab) => {
                            const TabIcon = tab.icon;
                            return (
                              <div
                                key={`measure-${tab.id}`}
                                className="flex items-center rounded-[var(--wizard-radius-md)] font-medium"
                                style={{
                                  gap: "var(--wizard-tab-gap)",
                                  padding:
                                    "var(--wizard-tab-padding-y) var(--wizard-tab-padding-x)",
                                  fontSize: "var(--wizard-tab-font-size)",
                                }}
                              >
                                {TabIcon && (
                                  <TabIcon
                                    style={{
                                      width: "var(--wizard-tab-icon-size)",
                                      height: "var(--wizard-tab-icon-size)",
                                    }}
                                  />
                                )}
                                <span>{tab.label}</span>
                              </div>
                            );
                          })}
                        </div>
                      )}

                      {/* Tabs - only show when there's more than one tab */}
                      {tabs.length > 1 && (
                        <div
                          ref={tabContainerRef}
                          className="flex items-center rounded-[var(--wizard-radius-md)] border"
                          style={{
                            backgroundColor: mergedTheme.tabContainerBg,
                            borderColor: mergedTheme.headerBorder,
                            padding: "var(--wizard-tab-container-padding)",
                          }}
                        >
                          {tabs.map((tab) => {
                            const isActive = activeTab === tab.id;
                            const TabIcon = tab.icon;
                            return (
                              <button
                                key={tab.id}
                                onClick={() => handleTabClick(tab.id)}
                                className={cn(
                                  "flex items-center rounded-[var(--wizard-radius-md)] font-medium transition-all relative",
                                  !isActive && "hover:bg-white/50",
                                )}
                                style={{
                                  gap: "var(--wizard-tab-gap)",
                                  padding:
                                    "var(--wizard-tab-padding-y) var(--wizard-tab-padding-x)",
                                  fontSize: "var(--wizard-tab-font-size)",
                                  ...(isActive
                                    ? {
                                      backgroundColor:
                                        mergedTheme.activeTabBg,
                                      color: mergedTheme.activeTabText,
                                      border: `1px solid ${mergedTheme.activeTabBorder}`,
                                      boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
                                    }
                                    : {
                                      color: mergedTheme.inactiveTabText,
                                    }),
                                }}
                              >
                                {TabIcon && (
                                  <TabIcon
                                    style={{
                                      width: "var(--wizard-tab-icon-size)",
                                      height: "var(--wizard-tab-icon-size)",
                                    }}
                                  />
                                )}
                                {(!(compactTabs || autoCompactTabs) ||
                                  isActive) && <span>{tab.label}</span>}
                              </button>
                            );
                          })}
                        </div>
                      )}

                      {/* Close Button */}
                      {showCloseIcon && (
                        <button
                          ref={closeButtonRef}
                          onClick={(e) => handleClose(e, "close-clicked")}
                          className="rounded-[var(--wizard-radius-md)] text-muted-foreground hover:text-foreground hover:bg-black/5 transition-colors"
                          style={{ padding: "var(--wizard-close-padding)" }}
                          disabled={loading}
                          data-testid="wizard-drawer-close"
                        >
                          <X
                            style={{
                              width: "var(--wizard-close-icon-size)",
                              height: "var(--wizard-close-icon-size)",
                            }}
                          />
                        </button>
                      )}
                    </div>
                  </header>
                </div>

                {/* Body / Content Area */}
                <div className="w-full overflow-hidden bg-background h-full min-w-0">
                  <ScrollArea
                    className="h-full w-full"
                    viewportRef={scrollViewportRef}
                  >

                    <div
                      className={cn("p-5 h-full w-full", contentClassName)}
                      style={{
                        display: "block",
                        minWidth: "100%",
                        height: "100%",
                      }}
                    >
                      <AnimatePresence mode="wait">
                        <motion.div
                          key={activeTab}
                          className="h-full w-full"
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            height: "100%",
                            minHeight: "100%",
                          }}
                          initial={{ opacity: 0, y: 12 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -12 }}
                          transition={{
                            duration: 0.25,
                            ease: [0.4, 0, 0.2, 1],
                          }}
                        >
                          {children}
                        </motion.div>
                      </AnimatePresence>
                    </div>
                  </ScrollArea>
                </div>

                {/* Footer */}
                {hasFooter && (
                  <>
                    {fullFooterComponent != null ? (
                      <div className="w-full min-w-0">{fullFooterComponent}</div>
                    ) : (
                      <div
                        className={cn(
                          "flex items-center justify-between min-w-0",
                          !hideFooterBorder && "border-t border-border/40",
                          !footerBackground && "bg-background",
                        )}
                        style={{
                          minHeight: "var(--wizard-footer-height)",
                          padding: "0 var(--wizard-header-padding)",
                          fontSize: "var(--wizard-footer-font-size)",
                          ...(footerBackground && {
                            backgroundColor: footerBackground,
                          }),
                        }}
                      >
                        {footerVariant === "test" ? (
                          <>
                            {/* Test Mode Footer Layout */}
                            {/* Left: Back button */}
                            <div
                              className="flex items-center flex-shrink-0"
                              style={{
                                gap: "var(--wizard-footer-gap)",
                                minWidth: "100px",
                              }}
                            >
                              {showSecondaryAction && onSecondaryAction && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={onSecondaryAction}
                                  className="rounded-[var(--wizard-radius-md)]"
                                  style={{
                                    height: "var(--wizard-button-height)",
                                    padding: "0 var(--wizard-button-padding)",
                                    fontSize: "var(--wizard-button-font-size)",
                                    gap: "var(--wizard-button-gap)",
                                  }}
                                >
                                  <ArrowLeft
                                    style={{
                                      width: "var(--wizard-button-icon-size)",
                                      height: "var(--wizard-button-icon-size)",
                                    }}
                                  />
                                  {secondaryActionLabel}
                                </Button>
                              )}
                            </div>

                            {/* Center: Footer guidance/remarks and footer content */}
                            <div className="flex-1 flex items-center justify-center">
                              {footerContent}
                              {footerGuidance && !footerContent && (
                                <div
                                  className="text-muted-foreground text-center text-sm"
                                  style={{
                                    fontSize: "var(--wizard-footer-font-size)",
                                  }}
                                >
                                  {footerGuidance}
                                </div>
                              )}
                            </div>

                            {/* Right: Save & Test + Save & Close */}
                            <div
                              className="flex flex-shrink-0"
                              style={{ gap: "var(--wizard-footer-gap)" }}
                            >
                              {onTertiaryAction && tertiaryActionLabel && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={onTertiaryAction}
                                  disabled={
                                    tertiaryActionDisabled ||
                                    tertiaryActionLoading
                                  }
                                  className="rounded-[var(--wizard-radius-md)] border-border/60 hover:bg-muted/50"
                                  style={{
                                    height: "var(--wizard-button-height)",
                                    padding: "0 var(--wizard-button-padding)",
                                    fontSize: "var(--wizard-button-font-size)",
                                    gap: "var(--wizard-button-gap)",
                                  }}
                                >
                                  {tertiaryActionIcon || (
                                    <Play
                                      style={{
                                        width: "var(--wizard-button-icon-size)",
                                        height:
                                          "var(--wizard-button-icon-size)",
                                      }}
                                    />
                                  )}
                                  {tertiaryActionLabel}
                                </Button>
                              )}
                              {onSaveAndClose && (
                                <Button
                                  size="sm"
                                  onClick={onSaveAndClose}
                                  disabled={saveAndCloseDisabled || loading}
                                  className="shadow-sm rounded-[var(--wizard-radius-md)]"
                                  style={{
                                    backgroundColor:
                                      mergedTheme.primaryButtonBg,
                                    color: mergedTheme.primaryButtonText,
                                    height: "var(--wizard-button-height)",
                                    padding: "0 var(--wizard-button-padding)",
                                    fontSize: "var(--wizard-button-font-size)",
                                    gap: "var(--wizard-button-gap)",
                                    minWidth: "var(--wizard-button-min-width)",
                                  }}
                                >
                                  {saveAndCloseLabel}
                                  <Check
                                    style={{
                                      width: "var(--wizard-button-icon-size)",
                                      height: "var(--wizard-button-icon-size)",
                                    }}
                                  />
                                </Button>
                              )}
                            </div>
                          </>
                        ) : (
                          <>
                            {/* Default Footer Layout */}
                            {/* Left: Back button */}
                            <div
                              className="flex items-center flex-shrink-0"
                              style={{
                                gap: "var(--wizard-footer-gap)",
                                minWidth: "100px",
                              }}
                            >
                              {showSecondaryAction && onSecondaryAction && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={onSecondaryAction}
                                  className="rounded-[var(--wizard-radius-md)]"
                                  style={{
                                    height: "var(--wizard-button-height)",
                                    padding: "0 var(--wizard-button-padding)",
                                    fontSize: "var(--wizard-button-font-size)",
                                    gap: "var(--wizard-button-gap)",
                                  }}
                                >
                                  <ArrowLeft
                                    style={{
                                      width: "var(--wizard-button-icon-size)",
                                      height: "var(--wizard-button-icon-size)",
                                    }}
                                  />
                                  {secondaryActionLabel}
                                </Button>
                              )}
                            </div>

                            {/* Center: Footer guidance/remarks and footer content */}
                            <div className="flex-1 flex items-center justify-center">
                              {footerContent}
                              {footerGuidance && !footerContent && (
                                <div
                                  className="text-muted-foreground text-center text-sm"
                                  style={{
                                    fontSize: "var(--wizard-footer-font-size)",
                                  }}
                                >
                                  {footerGuidance}
                                </div>
                              )}
                            </div>

                            {/* Right: Primary action (Next/Test) */}
                            <div
                              className="flex flex-shrink-0"
                              style={{ gap: "var(--wizard-footer-gap)" }}
                            >
                              {onPrimaryAction && (
                                <Button
                                  size="sm"
                                  onClick={onPrimaryAction}
                                  disabled={primaryActionDisabled || loading}
                                  className="shadow-sm rounded-[var(--wizard-radius-md)]"
                                  style={{
                                    backgroundColor:
                                      mergedTheme.primaryButtonBg,
                                    color: mergedTheme.primaryButtonText,
                                    height: "var(--wizard-button-height)",
                                    padding: "0 var(--wizard-button-padding)",
                                    fontSize: "var(--wizard-button-font-size)",
                                    gap: "var(--wizard-button-gap)",
                                    minWidth: "var(--wizard-button-min-width)",
                                  }}
                                >
                                  {primaryActionLabel}
                                  <ArrowRight
                                    style={{
                                      width: "var(--wizard-button-icon-size)",
                                      height: "var(--wizard-button-icon-size)",
                                    }}
                                  />
                                </Button>
                              )}
                            </div>
                          </>
                        )}
                      </div>
                    )}
                  </>
                )}
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>
    );
  },
);

WizardDrawer.displayName = "WizardDrawer";
export default WizardDrawer;
