import { forwardRef, useCallback, useEffect, useRef } from "react";
import WORKFLOW_SETUP_NODE from "./constant";
import WorkflowSetup from "./WorkflowSetup";
import CommonDrawer from "../common-components/CommonDrawer";

const WorkflowSetupDialog = forwardRef(
  (
    {
      data: savedData = {},
      workspaceId,
      projectId,
      titleProps = {
        label: WORKFLOW_SETUP_NODE.name,
        icon: WORKFLOW_SETUP_NODE._src,
        foreground: WORKFLOW_SETUP_NODE.foreground,
        background: WORKFLOW_SETUP_NODE.background,
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
          }}
          node={WORKFLOW_SETUP_NODE}
          onAddNode={onAddNode}
          onTitleChanged={onUpdateTitle}
          sidebarActions={sidebarActions}
          onSidebarActionClick={onSidebarActionClick}
        >
          <WorkflowSetup
            ref={ref}
            data={data}
            workspaceId={workspaceId}
            projectId={projectId}
            variables={variables}
            onSave={saveHandler}
          />
        </CommonDrawer>
      </>
    );
  }
);

export default WorkflowSetupDialog;
