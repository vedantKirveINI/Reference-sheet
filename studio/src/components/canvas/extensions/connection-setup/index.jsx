import { forwardRef, useCallback, useEffect, useRef } from "react";
import ConnectionSetup from "./ConnectionSetup";
import CONNECTION_SETUP_NODE, { CONNECTION_SETUP_NODE_THEME } from "./constant";
import CommonDrawer from "../common-components/CommonDrawer";

const ConnectionSetupDialog = forwardRef(
  (
    {
      data: savedData = {},
      nodeData,
      workspaceId,
      projectId,
      titleProps = {
        label: CONNECTION_SETUP_NODE.name,
        icon: CONNECTION_SETUP_NODE._src,
        foreground: CONNECTION_SETUP_NODE.foreground,
        background: CONNECTION_SETUP_NODE.background,
      },
      onSave = () => {},
      onDiscard = () => {},
      autoSave = () => {},
      variables = {},
      eventType,
      sidebarActions = [],
      onSidebarActionClick = () => {},
      onUpdateTitle = () => {},
      onSidebarToggle = () => {},
      ...props
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
      <CommonDrawer
        ref={drawerRef}
        onClose={(e) => {
          saveHandler(false);
        }}
        onSave={saveHandler}
        node={CONNECTION_SETUP_NODE}
        title={{
          name: nodeData?.name,
          label: nodeData?.name,
          icon: nodeData?._src,
          foreground: CONNECTION_SETUP_NODE_THEME.foreground,
          background: CONNECTION_SETUP_NODE_THEME.background,
          light: CONNECTION_SETUP_NODE_THEME.light,
          hoverDescription: nodeData?.hoverDescription,
          dark: CONNECTION_SETUP_NODE_THEME.dark,
        }}
        saveOnClose={true}
        sidebarActions={sidebarActions}
        onSidebarActionClick={onSidebarActionClick}
        onTitleChanged={onUpdateTitle}
        onSidebarToggle={onSidebarToggle}
      >
        <ConnectionSetup
          ref={ref}
          variables={variables}
          data={data}
          workspaceId={workspaceId}
          projectId={projectId}
          autoSave={autoSave}
          eventType={eventType}
        />
      </CommonDrawer>
    );
  }
);

export default ConnectionSetupDialog;
