import React, { forwardRef, useCallback, useEffect, useRef } from "react";
import CommonDrawer from "../common-components/CommonDrawer";
import { TINYGPT_TRANSLATOR_V2_NODE } from "./constants";
import TinyGPTTranslatorV2 from "./TinyGPTTranslatorV2";

const TinyGPTTranslatorV2Dialog = forwardRef(
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
        const translatorData = ref.current?.getData();
        onSave(translatorData, {}, openNodeAfterCreate);
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
          name: nodeData?.name || TINYGPT_TRANSLATOR_V2_NODE.name,
          icon: nodeData?._src || TINYGPT_TRANSLATOR_V2_NODE._src,
          foreground: nodeData?.foreground || TINYGPT_TRANSLATOR_V2_NODE.foreground,
          background: nodeData?.background || TINYGPT_TRANSLATOR_V2_NODE.background,
          hoverDescription: nodeData?.hoverDescription,
        }}
        onClose={(e) => {
          saveHandler(false);
          onDiscard(e);
        }}
        onSave={saveHandler}
        node={TINYGPT_TRANSLATOR_V2_NODE}
        onAddNode={onAddNode}
        onTitleChanged={onUpdateTitle}
        sidebarActions={sidebarActions}
        onSidebarActionClick={onSidebarActionClick}
      >
        <TinyGPTTranslatorV2
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

export default TinyGPTTranslatorV2Dialog;
