import { forwardRef, useCallback, useEffect, useRef } from "react";
import AGENT_WORKFLOW_NODE from "./constant";
import AgentWorkflow from "./AgentWorkflow";
import CommonDrawer from "../common-components/CommonDrawer";

const AgentWorkflowDialog = forwardRef(
  (
    {
      data: savedData = {},
      workspaceId,
      projectId,
      titleProps = {
        label: AGENT_WORKFLOW_NODE.name,
        icon: AGENT_WORKFLOW_NODE._src,
        foreground: AGENT_WORKFLOW_NODE.foreground,
        background: AGENT_WORKFLOW_NODE.background,
      },
      onSave = () => {},
      autoSave = () => {},
      onDiscard = () => {},
      variables,
      onAddNode = () => {},
      onUpdateTitle = () => {},
      nodeData,
      sidebarActions = [],
      onSidebarActionClick = () => {},
    },
    ref
  ) => {
    const drawerRef = useRef();

    const data = JSON.parse(JSON.stringify(savedData));
    const saveHandler = useCallback(
      async (openNodeAfterCreate = true) => {
        const data = ref?.current?.getData();
        await autoSave(data, {}, {}, openNodeAfterCreate);
      },
      [autoSave, ref]
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
          }}
          title={{
            name: nodeData?.name,
            ...titleProps,
            hoverDescription: nodeData?.hoverDescription,
            icon: nodeData?._src,
          }}
          node={AGENT_WORKFLOW_NODE}
          onAddNode={onAddNode}
          onTitleChanged={onUpdateTitle}
          sidebarActions={sidebarActions}
          onSidebarActionClick={onSidebarActionClick}
        >
          <AgentWorkflow
            ref={ref}
            variables={variables}
            onSave={saveHandler}
            nodeData={nodeData}
          />
        </CommonDrawer>
      </>
    );
  }
);

export default AgentWorkflowDialog;
