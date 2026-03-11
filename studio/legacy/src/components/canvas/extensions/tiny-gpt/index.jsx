import React, { forwardRef, useCallback, useEffect, useRef } from "react";
import TINYGPT_NODE from "./constant";
import TinyGPT from "./TinyGPT";
import CommonDrawer from "../common-components/CommonDrawer";

const TinyGPTDialog = forwardRef(
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
    // JSON.parse(JSON.stringify(data)) is done to take deep copy for deep object comparison
    const data = JSON.parse(JSON.stringify(savedData));

    const drawerRef = useRef();

    const saveHandler = useCallback(
      (openNodeAfterCreate = true) => {
        let tinyGPTData = ref?.current?.getData?.() || {};
        let error = ref?.current?.getError?.() || {};
        let errorMessages = Object.values(error).reduce((acc, curr) => {
          if (curr?.length > 0) {
            acc.push(...curr);
          }
          return acc;
        }, []);

        onSave(
          {
            ...(tinyGPTData || {}),
            credits: TINYGPT_NODE.credits,
          },
          {
            // name: tinyGPTData?.label || TINY_GPT_TYPE,
            errors: errorMessages,
          },
          openNodeAfterCreate
        );
      },
      [onSave, ref]
    );

    // const discardHandler = useCallback(
    //   (e) => {
    //     const fxData = ref.current?.getData();
    //     onDiscard(e, fxData?.content, data?.content);
    //   },
    //   [data?.content, onDiscard, ref]
    // );
    useEffect(() => {
      if (!data?.last_updated) {
        setTimeout(saveHandler, 100);
      }
    }, [data?.last_updated, saveHandler]);
    return (
      <CommonDrawer
        ref={drawerRef}
        title={{
          name: nodeData?.name || TINYGPT_NODE.name,
          icon: nodeData?._src || TINYGPT_NODE._src,
          foreground: nodeData?.foreground || TINYGPT_NODE.foreground,
          background: nodeData?.background || TINYGPT_NODE.background,
          hoverDescription: nodeData?.hoverDescription,
        }}
        onClose={(e) => {
          saveHandler(false);
          onDiscard(e);
        }}
        onSave={saveHandler}
        node={TINYGPT_NODE}
        onAddNode={onAddNode}
        onTitleChanged={onUpdateTitle}
        sidebarActions={sidebarActions}
        onSidebarActionClick={onSidebarActionClick}
      >
        <TinyGPT
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

export default TinyGPTDialog;
