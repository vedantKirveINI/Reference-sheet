/**
 * CommonDrawer - Wrapper around the legacy drawer for canvas extensions.
 * Uses the legacy drawer from src/module/drawer with half-island header styling.
 */
import React, {
  forwardRef,
  useCallback,
  useImperativeHandle,
  useState,
} from "react";
import Drawer from "../../../../module/drawer";
import CommonDrawerTitle from "./CommonDrawerTitle";

const CommonDrawer = forwardRef(
  (
    {
      title,
      commonDrawerRef,
      children,
      node = "",
      removeContentPadding = true,
      showSidebar = true,
      sidebarActions = [],
      onClose = () => {},
      allowContentOverflow,
      showTitleEditButton = true,
      onSidebarActionClick = () => {},
      onSidebarToggle = () => {},
      onTitleChanged = () => {},
      onSave = () => {},
      beforeClose,
      loading = false,
    },
    ref
  ) => {
    const [t, setT] = useState(title);

    const handleTitleSave = useCallback(
      (data) => {
        onTitleChanged(data);
        const updatedTitle = { ...t, ...data };
        setT(updatedTitle);
        setTimeout(() => {
          ref.current?.updateTitle(
            <CommonDrawerTitle
              title={updatedTitle}
              node={node}
              showEditButton={showTitleEditButton}
              onTitleSave={handleTitleSave}
            />
          );
        }, 0);
      },
      [node, onTitleChanged, ref, t, showTitleEditButton]
    );

    useImperativeHandle(
      commonDrawerRef,
      () => ({
        updateTitle: (title) => {
          setT(title);
          ref?.current?.updateTitle(
            <CommonDrawerTitle
              title={title}
              node={node}
              showEditButton={showTitleEditButton}
              onTitleSave={handleTitleSave}
            />
          );
        },
      }),
      [t, node, handleTitleSave, showTitleEditButton]
    );

    return (
      <Drawer
        ref={ref}
        loading={loading}
        allowContentOverflow={allowContentOverflow}
        open={true}
        onClose={onClose}
        dividers={false}
        title={
          <CommonDrawerTitle
            title={t}
            node={node}
            showEditButton={showTitleEditButton}
            onTitleSave={handleTitleSave}
          />
        }
        sliderProps={{
          sx: { background: title.background },
        }}
        beforeClose={beforeClose}
        showSidebar={showSidebar}
        showFullscreenIcon={false}
        sidebarProps={{
          style: {
            color: title.foreground,
            background: title.background,
          },
          activeStyles: {
            background: "#fff",
            color: node.dark || "#000",
          },
          actions: sidebarActions,
        }}
        onSidebarActionClick={(...args) => {
          onSave(true);
          onSidebarActionClick(...args);
        }}
        onSidebarToggle={onSidebarToggle}
        removeContentPadding={removeContentPadding}
      >
        {children}
      </Drawer>
    );
  }
);

export default CommonDrawer;
