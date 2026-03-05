import React, { forwardRef, useCallback, useEffect, useRef } from "react";
import CommonDrawer from "../common-components/CommonDrawer";
import HITL from "./HITL";

import cloneDeep from "lodash/cloneDeep";
import HITL_NODE from "./constant";

const HITLDrawer = forwardRef(
  (
    {
      canvasRef,
      annotation,
      data,
      variables,
      nodeData,
      isPremiumUser = false,
      onUpdateTitle = () => {},
      onSave = () => {},
      onDiscard = () => {},
      onAddNode = () => {},
      sidebarActions = [],
      onSidebarActionClick = () => {},
      workspaceId,
      projectId,
      assetId,
      parentId,
    },
    ref
  ) => {
    const currentSavedData = cloneDeep(data);
    const drawerRef = useRef();
    const saveHandler = useCallback(
      (openNodeAfterCreate = true) => {
        let data = ref.current?.getData();
        onSave(data, {}, openNodeAfterCreate);
      },
      [onSave, ref]
    );
    useEffect(() => {
      if (!data?.last_updated) {
        setTimeout(saveHandler, 100);
      }
    }, [data?.last_updated, ref, saveHandler]);

    return (
      <CommonDrawer
        ref={drawerRef}
        allowContentOverflow={true}
        title={{
          name: nodeData?.name || HITL.name,
          icon: nodeData?._src || HITL._src,
          foreground: nodeData?.foreground || HITL.foreground,
          background: nodeData?.background || HITL.background,
          hoverDescription: nodeData?.hoverDescription,
          premium: !isPremiumUser && nodeData?.premium,
        }}
        onTitleChanged={onUpdateTitle}
        onSave={saveHandler}
        onClose={(e) => {
          saveHandler(false);
          onDiscard(e);
        }}
        node={HITL_NODE}
        onAddNode={onAddNode}
        PaperProps={{ "data-testid": "hitl-content" }}
        sidebarActions={sidebarActions}
        onSidebarActionClick={onSidebarActionClick}
      >
        <HITL
          canvasRef={canvasRef}
          annotation={annotation}
          ref={ref}
          data={currentSavedData}
          nodeData={nodeData}
          variables={variables}
          onSave={saveHandler}
          workspaceId={workspaceId}
          assetId={assetId}
          projectId={projectId}
          parentId={parentId}
        />
      </CommonDrawer>
    );
  }
);

export default HITLDrawer;
