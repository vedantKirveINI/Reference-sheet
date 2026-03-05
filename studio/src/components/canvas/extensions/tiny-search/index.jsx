import { forwardRef, useCallback, useEffect, useRef } from "react";

import CommonDrawer from "../common-components/CommonDrawer";
import TINY_SEARCH_NODE from "./constant";
import TinySearch from "./TinySearch";

const TinySearchNodeDrawer = forwardRef(
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
        let error = ref?.current?.getError?.() || {};
        const errorMessages = Object.values(error).reduce((acc, curr) => {
          if (curr?.length > 0) {
            acc.push(...curr);
          }
          return acc;
        }, []);
        let tinySearchData = ref?.current?.getData?.() || {};
        onSave(
          {
            ...(tinySearchData || {}),
            credits: TINY_SEARCH_NODE.credits,
          },
          {
            errors: errorMessages,
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
          name: nodeData?.name || TINY_SEARCH_NODE.name,
          icon: nodeData?._src || TINY_SEARCH_NODE._src,
          foreground: nodeData?.foreground || TINY_SEARCH_NODE.foreground,
          background: nodeData?.background || TINY_SEARCH_NODE.background,
          hoverDescription: nodeData?.hoverDescription,
        }}
        node={TINY_SEARCH_NODE}
        onAddNode={onAddNode}
        onTitleChanged={onUpdateTitle}
        sidebarActions={sidebarActions}
        onSidebarActionClick={onSidebarActionClick}
      >
        <TinySearch
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

export default TinySearchNodeDrawer;
