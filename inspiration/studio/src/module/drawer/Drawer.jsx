import React, {
  forwardRef,
  useCallback,
  useImperativeHandle,
  useRef,
  useState,
  useId,
} from "react";
import { motion, AnimatePresence } from "framer-motion";
import DrawerTitle from "./DrawerTitle";
import DrawerSidebar from "./DrawerSidebar";
import DrawerContent from "./DrawerContent";
import DrawerActions from "./DrawerActions";
import useClickOutside from "./hooks/useClickOutside";
import useEscapeLayer from "@src/hooks/useEscapeLayer";
import "./drawer.css";

const Drawer = forwardRef(
  (
    {
      open,
      expanded = false,
      dividers = false,
      showCloseIcon = true,
      showFullscreenIcon = true,
      showSidebar = true,
      title,
      children, //content
      actions,
      titleProps = {},
      headerColor = "#1C3693",
      headerTextColor = "#FFFFFF",
      headerGap = 8,
      actionProps = {},
      sliderProps = {},
      sidebarProps = {
        style: {},
        actions: [],
      },
      drawerWidth = "var(--canvas-drawer-width, clamp(400px, 45vw, 52.5rem))",
      drawerHeight = "60rem",
      removeContentPadding = false,
      allowContentOverflow = false,
      anchor = "right",
      onClose = () => {},
      onExpand = () => {},
      onSidebarToggle = () => {},
      onSidebarPanelClose = () => {},
      onSidebarActionClick = () => {},
      beforeClose,
      loading = false,

      ...props
    },
    ref,
  ) => {
    const drawerRef = useRef();
    const sidebarRef = useRef();
    const doesDraweHasChildren = Boolean(children);
    const escapeLayerId = useId();

    const [drawerTitle, setDrawerTitle] = useState(title);
    const [action, setAction] = useState(null);

    const handleEscapeClose = useCallback(
      (event) => {
        if (action) {
          const currentActiveActionId = action.id;
          sidebarRef.current?.closeSidebar();
          onSidebarPanelClose(title);
          setAction(null);
          setDrawerTitle(title);
          onSidebarToggle(false, currentActiveActionId, "escape");
          return;
        }
        onClose(event, "escape");
      },
      [action, onClose, onSidebarPanelClose, onSidebarToggle, title],
    );

    useEscapeLayer({
      id: `drawer-${escapeLayerId}`,
      onEscape: handleEscapeClose,
      enabled: open && doesDraweHasChildren,
      priority: 0,
    });

    const closeSidebarHandler = useCallback(
      async (event, reason) => {
        if (beforeClose) await beforeClose?.(event, reason);

        // If X button is clicked, always close the entire drawer
        if (reason === "close-clicked") {
          if (action) {
            const currentActiveActionId = action.id;
            sidebarRef.current?.closeSidebar();
            onSidebarPanelClose(title);
            setAction(null);
            setDrawerTitle(title);
            onSidebarToggle(false, currentActiveActionId, reason);
          }
          onClose(event, reason);
          return;
        }

        // For clickaway and other reasons, use two-step close (sidebar first, then drawer)
        if (action) {
          const currentActiveActionId = action.id;
          sidebarRef.current?.closeSidebar();
          onSidebarPanelClose(title);
          setAction(null);
          setDrawerTitle(title);
          onSidebarToggle(false, currentActiveActionId, reason);
          return;
        }
        onClose(event, reason);
      },
      [
        action,
        beforeClose,
        onClose,
        onSidebarPanelClose,
        onSidebarToggle,
        title,
      ],
    );
    useClickOutside(
      drawerRef,
      (event) => {
        closeSidebarHandler(event, "clickaway");
      },
      200,
      true,
    );
    const openSidebarHandler = useCallback(
      (action) => {
        sidebarRef.current.updateIndexById(action?.id);
        setDrawerTitle(action.name);
        setAction({ ...action });
        onSidebarToggle(true, action?.id);
      },
      [onSidebarToggle],
    );

    // Calculate the current width based on sidebar state
    // Use responsive drawer width if not explicitly provided
    const responsiveDrawerWidth =
      drawerWidth || "var(--canvas-drawer-width, clamp(400px, 45vw, 52.5rem))";
    const totalWidth =
      anchor === "top" || anchor === "bottom" ? "100%" : responsiveDrawerWidth;

    const willContentOverflow = useCallback(() => {
      if (allowContentOverflow) return allowContentOverflow;

      return action?.panel ? false : allowContentOverflow;
    }, [allowContentOverflow, action?.panel]);

    const hasActions = Boolean(actions);

    const hasContent = Boolean(children) || Boolean(action?.panel);

    useImperativeHandle(
      ref,
      () => ({
        clickAction: (id) => sidebarRef.current.clickAction(id),
        openSidebarPanel: openSidebarHandler,
        closeSidebarPanel: closeSidebarHandler,
        updateTitle: (title) => {
          setDrawerTitle(title);
        },
        isActionOpen: () => {
          return action?.panel ? true : false;
        },
      }),
      [openSidebarHandler, closeSidebarHandler, action?.panel],
    );

    return (
      <AnimatePresence mode="wait">
        {open && (
          <motion.div
            ref={drawerRef}
            key={anchor}
            className="flex flex-1 transition-all gap-4 duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]"
            // {...sliderProps}
            style={{
              height:
                anchor === "left" || anchor === "right" ? "100%" : drawerHeight,
              position: "relative",

              margin:
                anchor === "right"
                  ? "0 0 0 var(--canvas-layout-gap, clamp(0.5rem, 1vw, 0.75rem))"
                  : anchor === "bottom"
                    ? "var(--canvas-layout-gap, clamp(0.5rem, 1vw, 0.75rem)) 0 0 0"
                    : 0,
              "--drawer-header-gap": `${headerGap}px`,
              // ...(sliderProps.sx || sliderProps.style || {}),
              // Only default to transparent when no background is provided (lets theme background from sliderProps apply)
              // ...((sliderProps.sx?.background ?? sliderProps.style?.background) == null
              //   ? { background: "transparent" }
              //   : {}),
            }}
            onClick={(e) => e.stopPropagation()}
            data-testid="drawer-root"
            data-drawer-has-content={hasContent ? "true" : "false"}
          >
            <div
              className="flex flex-1 p-px"
              data-testid="drawer-container"
              {...(props || {})}
              style={{
                width: hasContent ? totalWidth : 0,
              }}
            >
              <div
                className="flex flex-1 flex-col min-h-0 justify-start rounded-island shadow-island-sm border border-black/[0.04] overflow-hidden bg-surface-base"
                data-testid="drawer-left-content"
              >
                {drawerTitle && (
                  <DrawerTitle
                    dividers={dividers}
                    showCloseIcon={showCloseIcon}
                    showFullscreenIcon={showFullscreenIcon}
                    title={drawerTitle}
                    titleProps={titleProps}
                    onExpand={onExpand}
                    onClose={closeSidebarHandler}
                    expanded={expanded}
                    loading={loading}
                    headerColor={headerColor}
                    headerTextColor={headerTextColor}
                    headerGap={headerGap}
                  />
                )}
                {hasContent && (
                  <DrawerContent
                    allowContentOverflow={willContentOverflow()}
                    removeContentPadding={removeContentPadding}
                    sidebarContent={action?.panel}
                    style={{
                      height:
                        hasActions && !action?.panel
                          ? "var(--drawer-content-height)"
                          : "calc(var(--drawer-content-height) + var(--drawer-footer-height))",
                    }}
                  >
                    {children}
                  </DrawerContent>
                )}
                {hasActions && !action?.panel && (
                  <DrawerActions
                    dividers={dividers}
                    actions={actions}
                    actionProps={actionProps}
                  />
                )}
              </div>
            </div>
            <DrawerSidebar
              show={showSidebar}
              ref={sidebarRef}
              onSidebarActionClick={(action, index, e) =>
                onSidebarActionClick({ action, index, e }, ref)
              }
              {...sidebarProps}
            />
          </motion.div>
        )}
      </AnimatePresence>
    );
  },
);

export default Drawer;
