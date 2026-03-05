import React, { forwardRef, useCallback, useEffect, useRef } from "react";
import TOOL_OUTPUT_NODE from "./constant";
import CommonDrawer from "../common-components/CommonDrawer";
import Footer from "./Footer";
import ToolInputComp from "./ToolOutput";

const ToolOutputDialog = forwardRef(
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
    const toolInputRef = useRef();

    const saveHandler = useCallback(
      (openNodeAfterCreate = true) => {
        const data = toolInputRef.current?.getData();
        onSave(
          {
            outputs: data,
          },
          {
            name: TOOL_OUTPUT_NODE.name,
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
        ref={ref}
        onSave={saveHandler}
        onClose={(e) => {
          saveHandler(false);
          onDiscard(e);
        }}
        title={{
          name: nodeData?.name || TOOL_OUTPUT_NODE.name,
          icon: nodeData?._src || TOOL_OUTPUT_NODE._src,
          foreground: nodeData?.foreground || TOOL_OUTPUT_NODE.foreground,
          background: nodeData?.background || TOOL_OUTPUT_NODE.background,
          hoverDescription:
            nodeData?.hoverDescription || TOOL_OUTPUT_NODE.hoverDescription,
        }}
        sidebarActions={sidebarActions}
        node={TOOL_OUTPUT_NODE}
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
          <ToolInputComp data={data?.outputs} ref={toolInputRef} variables={variables} />

          <Footer saveHandler={saveHandler} />
        </div>
      </CommonDrawer>
    );
  }
);

export default ToolOutputDialog;
