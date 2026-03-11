import React, { forwardRef, useCallback, useEffect, useRef } from "react";
// import ExtensionDialog from "../common-components/ExtensionDialog";
import AGENT_COMPOSER_NODE from "./constant";
import CommonDrawer from "../../common-components/CommonDrawer";
import AgentComposer from "./AgentComposer";

const AgentComposerNodeDrawer = forwardRef(
  (
    {
      canvasRef,
      annotation,
      data: savedData = {},
      workspaceId,
      assetId,
      projectId,
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
        let composerData = ref?.current?.getData?.() || {};
        let error = ref?.current?.getError?.() || {};
        const messages = Object.values(error).find((arr) => arr.length) || [];

        onSave(
          {
            ...(composerData || {}),
            credits: AGENT_COMPOSER_NODE.credits,
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
          name: nodeData?.name || AGENT_COMPOSER_NODE.name,
          icon: nodeData?._src || AGENT_COMPOSER_NODE._src,
          foreground: nodeData?.foreground || AGENT_COMPOSER_NODE.foreground,
          background: nodeData?.background || AGENT_COMPOSER_NODE.background,
          hoverDescription: nodeData?.hoverDescription,
        }}
        node={AGENT_COMPOSER_NODE}
        onAddNode={onAddNode}
        // PaperProps={{ "data-testid": "http-content" }}
        onTitleChanged={onUpdateTitle}
        sidebarActions={sidebarActions}
        onSidebarActionClick={onSidebarActionClick}
      >
        <AgentComposer
          canvasRef={canvasRef}
          annotation={annotation}
          data={data}
          nodeData={nodeData}
          variables={variables}
          onSave={saveHandler}
          ref={ref}
          workspaceId={workspaceId}
          assetId={assetId}
          projectId={projectId}
          parentId={parentId}
        />
      </CommonDrawer>
    );
  }
);

export default AgentComposerNodeDrawer;
