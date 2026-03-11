import React, { forwardRef, useCallback, useEffect, useRef } from "react";
// import ExtensionDialog from "../common-components/ExtensionDialog";
import TRANSFORMER_NODE from "./constant";
import Transformer from "./Transformer";
import CommonDrawer from "../common-components/CommonDrawer";
import cloneDeep from "lodash/cloneDeep";

const TransformerDialog = forwardRef(
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
    // JSON.parse(JSON.stringify(data)) is done to take deep copy for deep object comparison
    const data = cloneDeep(savedData);
    const drawerRef = useRef();

    const saveHandler = useCallback(
      (openNodeAfterCreate = true) => {
        let fxData = ref.current?.getData();
        // fxData = validateData(fxData);
        onSave(
          fxData,
          {
            errors: fxData?.errors,
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
          name: nodeData?.name || TRANSFORMER_NODE.name,
          icon: nodeData?._src || TRANSFORMER_NODE._src,
          foreground: nodeData?.foreground || TRANSFORMER_NODE.foreground,
          background: nodeData?.background || TRANSFORMER_NODE.background,
          hoverDescription: nodeData?.hoverDescription,
        }}
        node={TRANSFORMER_NODE}
        onAddNode={onAddNode}
        onTitleChanged={onUpdateTitle}
        sidebarActions={sidebarActions}
        onSidebarActionClick={onSidebarActionClick}
      >
        <Transformer
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

export default TransformerDialog;
