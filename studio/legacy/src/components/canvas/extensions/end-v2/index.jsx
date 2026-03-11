import React, { forwardRef, useCallback, useEffect, useRef } from "react";
import CommonDrawer from "../common-components/CommonDrawer";
import END_NODE_V2 from "./constants";

const EndNodeV2Drawer = forwardRef(
  (
    {
      data: savedData = {},
      variables = {},
      onSave = () => {},
      onDiscard = () => {},
      onAddNode = () => {},
      onUpdateTitle = () => {},
      nodeData,
      sidebarActions = [],
      onSidebarActionClick = () => {},
    },
    ref
  ) => {
    const drawerRef = useRef();
    const data = JSON.parse(JSON.stringify(savedData));
    const saveHandler = useCallback(
      (openNodeAfterCreate) => {
        let endNodeData = {};
        onSave(
          endNodeData,
          {
            errors: endNodeData?.errors,
          },
          openNodeAfterCreate
        );
      },
      [onSave]
    );
    useEffect(() => {
      if (!data?.last_updated) {
        setTimeout(saveHandler, 100);
      }
    }, [data?.last_updated, saveHandler]);

    return (
      <CommonDrawer
        ref={drawerRef}
        onSave={saveHandler}
        onClose={(e) => {
          saveHandler(false);
          onDiscard(e);
        }}
        title={{
          name: nodeData?.name || END_NODE_V2.name,
          icon: nodeData?._src || END_NODE_V2._src,
          foreground: nodeData?.foreground || END_NODE_V2.foreground,
          background: nodeData?.background || END_NODE_V2.background,
          hoverDescription: nodeData?.hoverDescription,
        }}
        node={END_NODE_V2}
        onAddNode={onAddNode}
        onTitleChanged={onUpdateTitle}
        sidebarActions={sidebarActions}
        onSidebarActionClick={onSidebarActionClick}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "100%",
          }}
        >
          No Configuration Required
        </div>
      </CommonDrawer>
    );
  }
);

export default EndNodeV2Drawer;
