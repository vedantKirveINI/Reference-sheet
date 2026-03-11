import React, { forwardRef, useCallback, useEffect, useRef } from "react";
import TRANSFORMER_V2_NODE from "./constant";
import TransformerV2 from "./TransformerV2";
import CommonDrawer from "../common-components/CommonDrawer";
import cloneDeep from "lodash/cloneDeep";

const TransformerV2Dialog = forwardRef(
  (
    {
      data: savedData = {},
      workspaceId,
      projectId,
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
    const data = cloneDeep(savedData);
    const drawerRef = useRef();

    const saveHandler = useCallback(
      (openNodeAfterCreate = true) => {
        let fxData = ref.current?.getData();
        onSave(
          fxData,
          {
            errors: fxData?.errors || fxData?.content?.errors || [],
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
          name: nodeData?.name || TRANSFORMER_V2_NODE.name,
          icon: nodeData?._src || TRANSFORMER_V2_NODE._src,
          foreground: nodeData?.foreground || TRANSFORMER_V2_NODE.foreground,
          background: nodeData?.background || TRANSFORMER_V2_NODE.background,
          hoverDescription: nodeData?.hoverDescription,
        }}
        node={TRANSFORMER_V2_NODE}
        onAddNode={onAddNode}
        onTitleChanged={onUpdateTitle}
        sidebarActions={sidebarActions}
        onSidebarActionClick={onSidebarActionClick}
      >
        <TransformerV2
          ref={ref}
          data={data}
          workspaceId={workspaceId}
          projectId={projectId}
          variables={variables}
          onSave={saveHandler}
        />
      </CommonDrawer>
    );
  }
);

export default TransformerV2Dialog;
