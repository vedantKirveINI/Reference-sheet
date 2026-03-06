import React, { forwardRef, useCallback, useEffect, useRef } from "react";
import JUMP_TO_NODE from "./constant";
import JumpToNode from "./JumpToNode";
import _ from "lodash";
import { ExtensionShell } from "../components/shell";

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
    const shellRef = useRef();
    const currentSavedData = _.cloneDeep(data);

    const saveHandler = useCallback(
      (openNodeAfterCreate) => {
        let nodeDataResult = ref.current?.getData();
        onSave(
          nodeDataResult,
          {
            errors: nodeDataResult?.errors,
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
      <ExtensionShell
        ref={shellRef}
        title={{
          name: nodeData?.name || JUMP_TO_NODE.name,
          icon: nodeData?._src || JUMP_TO_NODE._src,
          foreground: nodeData?.foreground || JUMP_TO_NODE.foreground,
          background: nodeData?.background || JUMP_TO_NODE.background,
          hoverDescription: nodeData?.hoverDescription,
        }}
        node={JUMP_TO_NODE}
        showSidebar={sidebarActions.length > 0}
        sidebarActions={sidebarActions}
        onSidebarActionClick={onSidebarActionClick}
        onClose={(e) => {
          saveHandler(false);
          onDiscard(e);
        }}
        onSave={saveHandler}
        onTitleChanged={onUpdateTitle}
      >
        <JumpToNode
          ref={ref}
          data={currentSavedData}
          variables={variables}
          onSave={saveHandler}
          getNodes={getNodes}
          nodeData={nodeData}
        />
      </ExtensionShell>
    );
  }
);

export default JumpToNodeDrawer;
