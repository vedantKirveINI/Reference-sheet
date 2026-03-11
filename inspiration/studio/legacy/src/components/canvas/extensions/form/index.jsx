import { forwardRef, useCallback, useEffect, useRef } from "react";
import CommonDrawer from "../common-components/CommonDrawer";
import { CONNECTION_NODE_THEME } from "./constant/theme";
import { BaseFormNode } from "./base-form-node";

const FormNodeDrawer = forwardRef(
  (
    {
      canvasRef,
      annotation,
      // data: savedData, // not sure if this will be used here. Harsh to check and get back.
      nodeData,
      assetDetails,
      parentId,
      projectId,
      workspaceId,
      assetId,
      variables,
      autoSave = () => {},
      sidebarActions = [],
      onSidebarActionClick = () => {},
      onUpdateTitle = () => {},
      onSidebarToggle = () => {},
    },
    ref
  ) => {
    const formNodeRef = useRef();
    const drawerRef = useRef();

    const getFormNodeData = useCallback(() => {
      const { configureData = {}, selectedConnection = {} } =
        (formNodeRef.current && formNodeRef.current.getFormNodeData()) || {};
      return { configureData, selectedConnection };
    }, []);

    const autoSaveHandler = useCallback(
      async (openNodeAfterCreate = false) => {
        const { configureData = {}, selectedConnection = {} } =
          getFormNodeData();
        const isConnectionSelected = Boolean(
          selectedConnection?.id || selectedConnection?._id
        );
        await autoSave(
          {
            ...(isConnectionSelected
              ? {
                  connection: {
                    ...selectedConnection,
                    id: selectedConnection._id,
                  },
                }
              : {
                  connection: null,
                }),
            ...configureData,
          },
          {},
          {},
          openNodeAfterCreate
        );
      },
      [getFormNodeData, autoSave]
    );

    const discardHandler = useCallback(async () => {
      const { configureData, selectedConnection } = getFormNodeData();
      const isConnectionSelected = Boolean(
        selectedConnection?.id || selectedConnection?._id
      );
      await autoSave(
        {
          ...configureData,
          ...(isConnectionSelected
            ? {
                connection: {
                  ...selectedConnection,
                  id: selectedConnection._id,
                },
              }
            : {
                connection: null,
              }),
        },
        {},
        true
      );
    }, [getFormNodeData, autoSave]);

    useEffect(() => {
      if (!nodeData?.go_data?.last_updated) {
        setTimeout(() => {
          autoSaveHandler(true);
        }, 100);
      }
    }, [autoSaveHandler, nodeData?.go_data?.last_updated]);

    return (
      <CommonDrawer
        ref={drawerRef}
        onClose={discardHandler}
        node={nodeData}
        title={{
          name: nodeData?.name,
          hoverDescription: nodeData?.hoverDescription,
          label: nodeData?.description,
          icon: nodeData?._src,
          foreground: CONNECTION_NODE_THEME.foreground,
          background: CONNECTION_NODE_THEME.background,
          light: CONNECTION_NODE_THEME.light,
          dark: CONNECTION_NODE_THEME.dark,
        }}
        onSave={autoSaveHandler}
        saveOnClose={true}
        sidebarActions={sidebarActions}
        onSidebarActionClick={onSidebarActionClick}
        onSidebarToggle={onSidebarToggle}
        onTitleChanged={onUpdateTitle}
      >
        <BaseFormNode
          canvasRef={canvasRef}
          canvasAnnotation={annotation}
          ref={formNodeRef}
          nodeData={nodeData}
          parentId={parentId}
          assetId={assetId}
          projectId={projectId}
          workspaceId={workspaceId}
          variables={variables}
          assetDetails={assetDetails}
        />
      </CommonDrawer>
    );
  }
);

export default FormNodeDrawer;
