import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { motion, AnimatePresence } from "framer-motion";
import DrawerTitle from "./DrawerTitle";
import DrawerSidebar from "./DrawerSidebar";
import classes from "./Drawer.module.css";
import DrawerContent from "./DrawerContent";
import DrawerActions from "./DrawerActions";
import useClickOutside from "./hooks/useClickOutside";

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
      actionProps = {},
      sliderProps = {},
      sidebarProps = {
        style: {},
        actions: [],
      },
      drawerWidth = "52.5rem",
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

    const [drawerTitle, setDrawerTitle] = useState(title);
    const [action, setAction] = useState(null);
    const closeSidebarHandler = useCallback(
      async (event, reason) => {
        if (beforeClose) await beforeClose?.(event, reason);
        if (action) {
          const currentActiveActionId = action.id;
          sidebarRef.current.closeSidebar();
          onSidebarPanelClose(title);
          setAction(null);
          setDrawerTitle(title);
          onSidebarToggle(false, currentActiveActionId, reason);
          return;
        }
        // added this because when drawer closes, header items in right side re aligns resulting in false click
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
      !doesDraweHasChildren,
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
    const totalWidth =
      anchor === "top" || anchor === "bottom" ? "100%" : drawerWidth;

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
            className={classes["slider"]}
            // {...sliderProps}
            style={{
              height:
                anchor === "left" || anchor === "right" ? "100%" : drawerHeight,
              position: "relative",
              margin:
                anchor === "right"
                  ? "0 0 0 1.25rem"
                  : anchor === "bottom"
                    ? "1.25rem 0 0 0"
                    : 0,
              // ...(sliderProps.sx || sliderProps.style || {}),
            }}
            onClick={(e) => e.stopPropagation()}
            data-testid="drawer-root"
          >
            <div
              className={`${classes["drawer-container"]} drawer-container`}
              data-testid="drawer-container"
              {...(props || {})}
              style={{ width: hasContent ? totalWidth : 0 }}
            >
              <div
                className={classes["left-container"]}
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
                      borderBottomLeftRadius:
                        hasActions && !action?.panel ? "none" : "inherit",
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
