import React, { forwardRef, useCallback, useEffect, useRef } from "react";
import START_NODE from "./constant";

import cloneDeep from "lodash/cloneDeep";
import CommonDrawer from "../common-components/CommonDrawer";
import StartNode from "../triggers/manual/StartNode";

const StartNodeDialog = forwardRef(
  (
    {
      data,
      variables = {},
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
    const drawerRef = useRef();

    const currentSavedData = cloneDeep(data);

    const saveHandler = useCallback(
      (openNodeAfterCreate) => {
        let startNodeData = ref.current?.getData();
        onSave(
          startNodeData,
          {
            errors: startNodeData?.errors,
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
      <>
        <CommonDrawer
          ref={drawerRef}
          onSave={saveHandler}
          onClose={(e) => {
            saveHandler(false);
            onDiscard(e);
          }}
          title={{
            name: nodeData?.name || START_NODE.name,
            icon: nodeData?._src || START_NODE._src,
            foreground: nodeData?.foreground || START_NODE.foreground,
            background: nodeData?.background || START_NODE.background,
            hoverDescription: nodeData?.hoverDescription,
          }}
          node={START_NODE}
          onAddNode={onAddNode}
          onTitleChanged={onUpdateTitle}
          sidebarActions={sidebarActions}
          onSidebarActionClick={onSidebarActionClick}
        >
          <StartNode ref={ref} data={currentSavedData} variables={variables} />
        </CommonDrawer>
      </>
    );
  }
);

export default StartNodeDialog;
