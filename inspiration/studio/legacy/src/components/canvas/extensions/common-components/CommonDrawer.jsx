import React, {
  forwardRef,
  useCallback,
  useImperativeHandle,
  useState,
} from "react";
import Drawer from "../../../../module/drawer";
import CommonDrawerTitle from "./CommonDrawerTitle";
import EditTitle from "./EditTitle";

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
    const handleTitleChange = useCallback(
      (title) => {
        ref.current?.openSidebarPanel({
          id: "edit-title",
          name: (
            <CommonDrawerTitle
              title={title}
              showEditButton={false}
              node={node}
            />
          ),
          panel: (
            <EditTitle
              data={title}
              onSave={(data) => {
                onTitleChanged(data);
                setT((prev) => {
                  return { ...prev, ...data };
                });
                setTimeout(() => {
                  ref.current?.updateTitle(
                    <CommonDrawerTitle
                      title={{ ...title, ...data }}
                      node={node}
                      onEditTitleClicked={() =>
                        handleTitleChange({ ...title, ...data })
                      }
                    />
                  );
                }, 0);
                ref.current?.closeSidebarPanel();
              }}
              onDiscard={() => ref.current?.closeSidebarPanel()}
            />
          ),
        });
      },
      [node, onTitleChanged, ref, t]
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
              onEditTitleClicked={() => handleTitleChange(title)}
            />
          );
        },
      }),
      [t, node, handleTitleChange, showTitleEditButton]
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
            onEditTitleClicked={() => handleTitleChange(t)}
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
