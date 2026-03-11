import React, { forwardRef, useCallback, useEffect, useRef } from "react";
import TOOL_INPUT_NODE from "./constant";
import CommonDrawer from "../common-components/CommonDrawer";
import Footer from "./Footer";
import ToolInputComp from "./ToolInput";

const ToolInputDialog = forwardRef(
  (
    {
      data: savedData = {},
      workspaceId,
      projectId,
      assetId,
      variables,
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
    const data = JSON.parse(JSON.stringify(savedData));
    const drawerRef = useRef();
    const toolInputRef = useRef();

    const saveHandler = useCallback(
      (openNodeAfterCreate = true) => {
        const data = toolInputRef.current?.getData();
        onSave(
          {
            inputs: data,
          },
          {
            name: TOOL_INPUT_NODE.name,
          },
          openNodeAfterCreate
        );
      },
      [onSave, toolInputRef]
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
          name: nodeData?.name || TOOL_INPUT_NODE.name,
          icon: nodeData?._src || TOOL_INPUT_NODE._src,
          foreground: nodeData?.foreground || TOOL_INPUT_NODE.foreground,
          background: nodeData?.background || TOOL_INPUT_NODE.background,
          hoverDescription:
            nodeData?.hoverDescription || TOOL_INPUT_NODE.hoverDescription,
        }}
        sidebarActions={sidebarActions}
        node={TOOL_INPUT_NODE}
        onAddNode={onAddNode}
        onTitleChanged={onUpdateTitle}
        onSidebarActionClick={onSidebarActionClick}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            flex: 1,
          }}
        >
          <ToolInputComp data={data?.inputs} ref={toolInputRef} />

          <Footer saveHandler={saveHandler} />
        </div>
      </CommonDrawer>
    );
  }
);

export default ToolInputDialog;
