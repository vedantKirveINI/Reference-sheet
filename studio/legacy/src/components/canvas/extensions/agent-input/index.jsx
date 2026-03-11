import React, { forwardRef, useCallback, useEffect, useRef } from "react";
import AGENT_INPUT_NODE from "./constant";
import AgentInputNode from "./AgentInputNode";
import _ from "lodash";
import CommonDrawer from "../common-components/CommonDrawer";

const AgentInputNodeDrawer = forwardRef(
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

    const currentSavedData = _.cloneDeep(data);

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
            name: nodeData?.name || AGENT_INPUT_NODE.name,
            icon: nodeData?._src || AGENT_INPUT_NODE._src,
            foreground: nodeData?.foreground || AGENT_INPUT_NODE.foreground,
            background: nodeData?.background || AGENT_INPUT_NODE.background,
            hoverDescription: nodeData?.hoverDescription,
          }}
          node={AGENT_INPUT_NODE}
          onAddNode={onAddNode}
          onTitleChanged={onUpdateTitle}
          sidebarActions={sidebarActions}
          onSidebarActionClick={onSidebarActionClick}
        >
          <AgentInputNode
            ref={ref}
            data={currentSavedData}
            variables={variables}
            onSave={saveHandler}
          />
        </CommonDrawer>
      </>
    );
  }
);

export default AgentInputNodeDrawer;
