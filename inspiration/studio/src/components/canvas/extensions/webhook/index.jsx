import React, { forwardRef, useCallback, useEffect, useRef } from "react";
import WEBHOOK_NODE from "./constant";
import CommonDrawer from "../common-components/CommonDrawer";
import Webhook from "../webhook-v2/WebhookV2";

const WebhookDialog = forwardRef(
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

    const saveHandler = useCallback(
      (openNodeAfterCreate = true) => {
        let webhookData = ref.current?.getData();
        onSave(
          webhookData,
          {
            name: webhookData?.label || WEBHOOK_NODE.name,
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
          name: nodeData?.name || WEBHOOK_NODE.name,
          icon: nodeData?._src || WEBHOOK_NODE._src,
          foreground: nodeData?.foreground || WEBHOOK_NODE.foreground,
          background: nodeData?.background || WEBHOOK_NODE.background,
          hoverDescription:
            nodeData?.hoverDescription || WEBHOOK_NODE.hoverDescription,
        }}
        sidebarActions={sidebarActions}
        node={WEBHOOK_NODE}
        onAddNode={onAddNode}
        onTitleChanged={onUpdateTitle}
        onSidebarActionClick={onSidebarActionClick}
      >
        <Webhook
          ref={ref}
          data={data}
          workspaceId={workspaceId}
          projectId={projectId}
          variables={variables}
          onSave={saveHandler}
          assetId={assetId}
        />
      </CommonDrawer>
    );
  }
);

export default WebhookDialog;
