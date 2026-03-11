import React, { forwardRef, useCallback, useEffect, useRef } from "react";
import CommonDrawer from "../common-components/CommonDrawer";
import { TINYGPT_CONSULTANT_V2_NODE } from "./constants";
import TinyGPTConsultantV2 from "./TinyGPTConsultantV2";

const TinyGPTConsultantV2Dialog = forwardRef(
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
    const data = JSON.parse(JSON.stringify(savedData));
    const drawerRef = useRef();

    const saveHandler = useCallback(
      (openNodeAfterCreate = true) => {
        const consultantData = ref.current?.getData();
        onSave(consultantData, {}, openNodeAfterCreate);
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
          name: nodeData?.name || TINYGPT_CONSULTANT_V2_NODE.name,
          icon: nodeData?._src || TINYGPT_CONSULTANT_V2_NODE._src,
          foreground: nodeData?.foreground || TINYGPT_CONSULTANT_V2_NODE.foreground,
          background: nodeData?.background || TINYGPT_CONSULTANT_V2_NODE.background,
          hoverDescription: nodeData?.hoverDescription,
        }}
        onClose={(e) => {
          saveHandler(false);
          onDiscard(e);
        }}
        onSave={saveHandler}
        node={TINYGPT_CONSULTANT_V2_NODE}
        onAddNode={onAddNode}
        onTitleChanged={onUpdateTitle}
        sidebarActions={sidebarActions}
        onSidebarActionClick={onSidebarActionClick}
      >
        <TinyGPTConsultantV2
          ref={ref}
          canvasRef={canvasRef}
          annotation={annotation}
          data={data}
          variables={variables}
          nodeData={nodeData}
          workspaceId={workspaceId}
          assetId={assetId}
          projectId={projectId}
          parentId={parentId}
          onSave={saveHandler}
        />
      </CommonDrawer>
    );
  }
);

export default TinyGPTConsultantV2Dialog;
