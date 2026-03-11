import React, { forwardRef, useCallback, useEffect, useRef } from "react";
import Break from "./Break";
import BREAK_NODE from "./constant";
import CommonDrawer from "../common-components/CommonDrawer";

const BreakDialog = forwardRef(
  (
    {
      data: savedData = {},
      variables,
      nodeData = {},
      onAddNode = () => {},
      onUpdateTitle = () => {},
      onSave = () => {},
      onDiscard = () => {},
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
        let breakData = ref.current?.getData();
        onSave(
          breakData,
          {
            // name: breakData?.label || BREAK_NODE.name,
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
          name: nodeData?.name || BREAK_NODE.name,
          icon: nodeData?._src || BREAK_NODE._src,
          foreground: nodeData?.foreground || BREAK_NODE.foreground,
          background: nodeData?.background || BREAK_NODE.background,
          hoverDescription: nodeData?.hoverDescription,
        }}
        onClose={(e) => {
          saveHandler(false);
          onDiscard(e);
        }}
        onSave={saveHandler}
        onAddNode={onAddNode}
        onTitleChanged={onUpdateTitle}
        node={BREAK_NODE}
        sidebarActions={sidebarActions}
        onSidebarActionClick={onSidebarActionClick}
      >
        <Break
          ref={ref}
          data={data}
          variables={variables}
          onSave={saveHandler}
        />
      </CommonDrawer>
    );
  }
);

export default BreakDialog;
