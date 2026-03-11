import React, { forwardRef, useCallback, useEffect, useRef } from "react";
import Skip from "./Skip";
import SKIP_NODE from "./constant";
import CommonDrawer from "../common-components/CommonDrawer";

const SkipDialog = forwardRef(
  (
    {
      data: savedData = {},
      variables,
      onSave = () => {},
      onDiscard = () => {},
      nodeData = {},
      onAddNode = () => {},
      onUpdateTitle = () => {},
      sidebarActions = [],
      onSidebarActionClick = () => {},
    },
    ref
  ) => {
    // JSON.parse(JSON.stringify(data)) is done to take deep copy for deep object comparison
    const data = JSON.parse(JSON.stringify(savedData));

    const drawerRef = useRef();

    const saveHandler = useCallback(
      (openNodeAfterCreate = true) => {
        let skipData = ref.current?.getData();
        onSave(
          skipData,
          {
            // name: skipData?.label || SKIP_NODE.name,
          },
          openNodeAfterCreate
        );
      },
      [onSave, ref]
    );
    useEffect(() => {
      if (!data?.last_updated) {
        setTimeout(saveHandler, 100);
      }
    }, [data?.last_updated, saveHandler]);

    return (
      <CommonDrawer
        ref={drawerRef}
        title={{
          name: nodeData?.name || SKIP_NODE.name,
          icon: nodeData?._src || SKIP_NODE._src,
          foreground: nodeData?.foreground || SKIP_NODE.foreground,
          background: nodeData?.background || SKIP_NODE.background,
          hoverDescription: nodeData?.hoverDescription,
        }}
        onClose={(e) => {
          saveHandler(false);
          onDiscard(e);
        }}
        onSave={saveHandler}
        onAddNode={onAddNode}
        onTitleChanged={onUpdateTitle}
        node={SKIP_NODE}
        sidebarActions={sidebarActions}
        onSidebarActionClick={onSidebarActionClick}
      >
        <Skip
          ref={ref}
          data={data}
          variables={variables}
          onSave={saveHandler}
        />
      </CommonDrawer>
    );
  }
);

export default SkipDialog;
