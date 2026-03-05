import React, { forwardRef, useCallback, useEffect, useRef } from "react";
import ITERATOR_NODE from "./constant";
import Iterator from "./Iterator";
import CommonDrawer from "../common-components/CommonDrawer";

const IteratorDialog = forwardRef(
  (
    {
      data: savedData = {},
      variables = {},
      onSave = () => {},
      onDiscard = () => {},
      onAddNode = () => {},
      onUpdateTitle = () => {},
      nodeData,
      workspaceId,
      projectId,
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
        let iteratorData = ref.current?.getData();
        // iteratorData = validateData(iteratorData);
        onSave(
          iteratorData,
          {
            // errors: iteratorData?.errors,
            // name: iteratorData?.label || ITERATOR_TYPE,
          },
          openNodeAfterCreate
        );
      },
      [onSave, ref]
    );

    // const discardHandler = useCallback(
    //   (e) => {
    //     const iteratorData = ref.current?.getData();
    //     onDiscard(e, iteratorData?.content, data?.content);
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
          name: nodeData?.name || ITERATOR_NODE.name,
          icon: nodeData?._src || ITERATOR_NODE._src,
          foreground: nodeData?.foreground || ITERATOR_NODE.foreground,
          background: nodeData?.background || ITERATOR_NODE.background,
          hoverDescription: nodeData?.hoverDescription,
        }}
        onClose={(e) => {
          saveHandler(false);
          onDiscard(e);
        }}
        onSave={saveHandler}
        onAddNode={onAddNode}
        onTitleChanged={onUpdateTitle}
        node={ITERATOR_NODE}
        sidebarActions={sidebarActions}
        onSidebarActionClick={onSidebarActionClick}
      >
        <Iterator
          ref={ref}
          data={data}
          variables={variables}
          onSave={saveHandler}
        />
      </CommonDrawer>
    );
  }
);

export default IteratorDialog;
