import React, { forwardRef, useCallback, useEffect, useRef } from "react";
import SEND_EMAIL_TO_YOURSELF_NODE from "./constant";
import CommonDrawer from "../common-components/CommonDrawer";
import SendEmailToYourself from "./SendEmailToYourself";

const SendEmailToYourselfDialog = forwardRef(
  (
    {
      canvasRef,
      annotation,
      data: savedData = {},
      variables = {},
      onSave = () => {},
      onDiscard = () => {},
      onAddNode = () => {},
      onUpdateTitle = () => {},
      nodeData,
      workspaceId,
      projectId,
      assetId,
      parentId,
      sidebarActions = [],
      onSidebarActionClick = () => {},
    },
    ref
  ) => {
    const data = JSON.parse(JSON.stringify(savedData));

    const drawerRef = useRef();

    const saveHandler = useCallback(
      (openNodeAfterCreate = true) => {
        let nodeData = ref.current?.getData();
        onSave(
          nodeData,
          {
            // name: tinyGPTData?.label || TINY_GPT_TYPE,
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
          name: nodeData?.name || SEND_EMAIL_TO_YOURSELF_NODE.name,
          icon: nodeData?._src || SEND_EMAIL_TO_YOURSELF_NODE._src,
          foreground:
            nodeData?.foreground || SEND_EMAIL_TO_YOURSELF_NODE.foreground,
          background:
            nodeData?.background || SEND_EMAIL_TO_YOURSELF_NODE.background,
          hoverDescription: nodeData?.hoverDescription,
        }}
        onClose={(e) => {
          saveHandler(false);
          onDiscard(e);
        }}
        onSave={saveHandler}
        node={SEND_EMAIL_TO_YOURSELF_NODE}
        onAddNode={onAddNode}
        onTitleChanged={onUpdateTitle}
        sidebarActions={sidebarActions}
        onSidebarActionClick={onSidebarActionClick}
      >
        <SendEmailToYourself
          ref={ref}
          canvasRef={canvasRef}
          annotation={annotation}
          data={data}
          workspaceId={workspaceId}
          projectId={projectId}
          assetId={assetId}
          parentId={parentId}
          variables={variables}
          onSave={saveHandler}
          nodeData={nodeData}
        />
      </CommonDrawer>
    );
  }
);

export default SendEmailToYourselfDialog;
