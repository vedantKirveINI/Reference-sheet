import React, { forwardRef, useCallback, useEffect, useRef } from "react";
import JUMP_TO_NODE from "./constant";
import JumpToNode from "./JumpToNode";
import _ from "lodash";
import CommonDrawer from "../common-components/CommonDrawer";

const JumpToNodeDrawer = forwardRef(
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
      getNodes = () => {},
    },
    ref
  ) => {
    const drawerRef = useRef();

    const currentSavedData = _.cloneDeep(data);

    const saveHandler = useCallback(
      (openNodeAfterCreate) => {
        let nodeData = ref.current?.getData();
        onSave(
          nodeData,
          {
            errors: nodeData?.errors,
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
            name: nodeData?.name || JUMP_TO_NODE.name,
            icon: nodeData?._src || JUMP_TO_NODE._src,
            foreground: nodeData?.foreground || JUMP_TO_NODE.foreground,
            background: nodeData?.background || JUMP_TO_NODE.background,
            hoverDescription: nodeData?.hoverDescription,
          }}
          node={JUMP_TO_NODE}
          onAddNode={onAddNode}
          onTitleChanged={onUpdateTitle}
          sidebarActions={sidebarActions}
          onSidebarActionClick={onSidebarActionClick}
        >
          <JumpToNode
            ref={ref}
            data={currentSavedData}
            variables={variables}
            onSave={saveHandler}
            getNodes={getNodes}
            nodeData={nodeData}
          />
        </CommonDrawer>
      </>
    );
  }
);

export default JumpToNodeDrawer;
