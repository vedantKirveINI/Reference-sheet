import React, { forwardRef, useCallback, useEffect, useRef } from "react";

import AGENT_OUTPUT_NODE from "./constant";
import AgentReply from "./AgentReply";
import CommonDrawer from "../common-components/CommonDrawer";

const AgentReplyDialog = forwardRef(
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

    // JSON.parse(JSON.stringify(data)) is done to take deep copy for deep object comparison
    const data = JSON.parse(JSON.stringify(savedData));

    const saveHandler = useCallback(
      (openNodeAfterCreate) => {
        let endNodeData = ref.current?.getData();
        onSave(
          endNodeData,
          {
            errors: endNodeData?.errors,
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
        onSave={saveHandler}
        onClose={(e) => {
          saveHandler(false);
          onDiscard(e);
        }}
        title={{
          name: nodeData?.name || AGENT_OUTPUT_NODE.name,
          icon: nodeData?._src || AGENT_OUTPUT_NODE._src,
          foreground: nodeData?.foreground || AGENT_OUTPUT_NODE.foreground,
          background: nodeData?.background || AGENT_OUTPUT_NODE.background,
          hoverDescription: nodeData?.hoverDescription,
        }}
        node={AGENT_OUTPUT_NODE}
        onAddNode={onAddNode}
        onTitleChanged={onUpdateTitle}
        sidebarActions={sidebarActions}
        onSidebarActionClick={onSidebarActionClick}
      >
        <AgentReply
          ref={ref}
          data={data}
          variables={variables}
          onSave={saveHandler}
        />
      </CommonDrawer>
    );
  }
);

export default AgentReplyDialog;
