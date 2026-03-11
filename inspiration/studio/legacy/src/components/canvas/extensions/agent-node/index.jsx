import React, { forwardRef, useCallback, useEffect, useRef } from "react";
import AGENT_NODE from "./constant";
import AgentNode from "./AgentNode";
import CommonDrawer from "../common-components/CommonDrawer";

const AgentNodeDrawer = forwardRef(
  (
    {
      canvasRef,
      annotation,
      data: savedData = {},
      workspaceId,
      projectId,
      assetId,
      parentId,
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
    // JSON.parse(JSON.stringify(data)) is done to take deep copy for deep object comparison
    const data = JSON.parse(JSON.stringify(savedData));
    const drawerRef = useRef();
    const saveHandler = useCallback(
      (openNodeAfterCreate = true) => {
        let scoutData = ref?.current?.getData?.() || {};

        let error = ref?.current?.getError?.() || {};
        const messages = Object.values(error).find((arr) => arr.length) || [];
        onSave(
          {
            ...(scoutData || {}),
            credits: AGENT_NODE.credits,
          },
          { errors: messages },
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
          name: nodeData?.name || AGENT_NODE.name,
          icon: nodeData?._src || AGENT_NODE._src,
          foreground: nodeData?.foreground || AGENT_NODE.foreground,
          background: nodeData?.background || AGENT_NODE.background,
          hoverDescription: nodeData?.hoverDescription,
        }}
        node={AGENT_NODE}
        onAddNode={onAddNode}
        // PaperProps={{ "data-testid": "http-content" }}
        onTitleChanged={onUpdateTitle}
        sidebarActions={sidebarActions}
        onSidebarActionClick={onSidebarActionClick}
      >
        <AgentNode
          canvasRef={canvasRef}
          annotation={annotation}
          data={data}
          nodeData={nodeData}
          variables={variables}
          workspaceId={workspaceId}
          projectId={projectId}
          assetId={assetId}
          parentId={parentId}
          onSave={saveHandler}
          ref={ref}
        />
      </CommonDrawer>
    );
  }
);

export default AgentNodeDrawer;
