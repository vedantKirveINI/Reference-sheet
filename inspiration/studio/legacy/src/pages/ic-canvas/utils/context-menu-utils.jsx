// import Icon from "oute-ds-icon";
// import { serverConfig } from "oute-ds-utils";
import { REDIRECT_PATHS } from "../constants/constants";
import linkContextMenuIcons from "../../../assets/icons/link-context-menu-icons";
import tools from "../../../assets/icons/tools";
import { Suspense } from "react";
import AddLogsPopover from "../../../components/popper/logs-popover";
// import Button from "oute-ds-button";
import { ODSIcon as Icon, serverConfig, ODSButton as Button } from "@src/module/ods";
import { CommonTestModule } from "../../../components/canvas/extensions";

// Account context menu items
export const getAccountContextMenuItems = () => [
  {
    id: "account",
    name: "My Account",
    leftAdornment: <Icon outeIconName="OUTEPersonIcon" />,
    onClick: () => {
      const targetUrl = `${serverConfig.WC_LANDING_URL}/redirect?r=${REDIRECT_PATHS.ACCOUNT}`;
      window.open(targetUrl, "_blank");
    },
  },
  {
    id: "referral",
    name: "Referral & Credits",
    leftAdornment: <Icon outeIconName="OUTEHandshakeIcon" />,
    onClick: () => {
      const targetUrl = `${serverConfig.WC_LANDING_URL}/redirect?r=${REDIRECT_PATHS.REFERRAL}`;
      window.open(targetUrl, "_blank");
    },
    divider: true,
  },
  {
    id: "logout",
    name: "Logout",
    leftAdornment: (
      <Icon
        outeIconName="OUTELogoutIcon"
        outeIconProps={{ sx: { color: "#d32f2f" } }}
      />
    ),
    onClick: () => {
      const targetUrl = `${serverConfig.WC_LANDING_URL}/redirect?r=${REDIRECT_PATHS.LOGOUT}`;
      window.location.href = targetUrl;
    },
    sx: {
      color: "#d32f2f",
      "&:hover": {
        backgroundColor: "#FFDBDB",
      },
      "&.Mui-disabled": {
        color: "black",
        backgroundColor: "white",
      },
    },
  },
];

// Link context menu items
export const getLinkContextMenuItems = (linkData, handlers) => {
  const {
    unlinkHandler,
    setSelectedLinkData,
    setDialogComponent,
    LINK_RENAME_DIALOG,
    linkedNodesRef,
    showAddNodeDrawer,
  } = handlers;

  return [
    {
      id: "unlink",
      name: "Unlink",
      leftAdornment: (
        <Icon imageProps={{ src: linkContextMenuIcons.unlinkIcon }} />
      ),
      onClick: () => {
        unlinkHandler(linkData);
      },
    },
    {
      id: "rename",
      name: "Rename",
      leftAdornment: <Icon outeIconName="OUTEEditIcon" />,
      onClick: () => {
        setSelectedLinkData(linkData);
        setDialogComponent(LINK_RENAME_DIALOG);
      },
      divider: true,
    },
    {
      id: "add-node",
      name: "Add Node",
      leftAdornment: <Icon outeIconName="OUTEAddIcon" />,
      onClick: () => {
        linkedNodesRef.current = linkData;
        showAddNodeDrawer({ via: "link-context-menu" });
      },
    },
  ];
};

// Canvas context menu items
export const getCanvasContextMenuItems = (handlers) => {
  const { showAddNodeDrawer, autoAlignHandler, canvasRef } = handlers;

  return [
    {
      id: "add_node",
      name: "Add Node",
      leftAdornment: (
        <Icon
          outeIconName="OUTEAddIcon"
          outeIconProps={{ sx: { width: "1.5rem", height: "1.5rem" } }}
        />
      ),
      onClick: () => {
        showAddNodeDrawer({ via: "canvas-context-menu" });
      },
      divider: true,
    },
    {
      id: "auto_align",
      name: "Auto Align",
      leftAdornment: (
        <Icon
          imageProps={{
            src: tools.autoAlign,
            style: { width: "1.5rem", height: "auto" },
          }}
        />
      ),
      onClick: () => {
        autoAlignHandler();
      },
    },
    {
      id: "sticky-note",
      name: "Add Sticky Note",
      leftAdornment: (
        <Icon
          outeIconName="OUTEDocumentIcon"
          outeIconProps={{
            sx: { color: "#90a4ae", width: "1.5rem", height: "1.5rem" },
          }}
        />
      ),
      onClick: () => {
        canvasRef.current.createStickyNote();
      },
    },
  ];
};

// Node context menu items
export const getNodeContextMenuItems = (node, handlers) => {
  const {
    nodeDoubleClickedHandler,
    resetTriggerNode,
    TRIGGER_SETUP_TYPE,
    canvasRef,
    componentSDKServices,
    projectId,
    workspaceId,
    assetId,
    parentId,
    setShowAddLogsPopover,
    saveNodeDataHandler,
    defaultDrawerRef,
    variablesRef,
    paramsRef,
    testModuleRef,
    annotation,
  } = handlers;

  const hasTestModule = node.data?.hasTestModule;

  let menuItems = [
    {
      id: "open-node",
      name: "Edit Node",
      leftAdornment: <Icon outeIconName="OUTEEditIcon" />,
      onClick: () => {
        nodeDoubleClickedHandler(null, node);
      },
    },
    {
      id: "add-logs",
      name: "Add Logs",
      leftAdornment: <Icon outeIconName="OUTERuleIcon" />,
      onClick: async () => {
        const { result } = await componentSDKServices.getVariableList(
          canvasRef.current.getModelJSON(),
          node.data.key,
          projectId,
          assetId,
          {
            include_current_output: true,
          }
        );
        const coords = canvasRef.current
          .getDiagram()
          .transformDocToView(node.location);

        const addLogsPopover = (
          <Suspense fallback={<></>}>
            <AddLogsPopover
              nodeData={node.data}
              popoverCoordinates={{
                top: coords.y,
                left: coords.x + 220,
              }}
              variables={result}
              onClose={() => {
                setShowAddLogsPopover(null);
              }}
              onSave={(logData = { before: {}, after: {} }) => {
                saveNodeDataHandler(
                  node.data,
                  node.data?.go_data,
                  {
                    logs: logData,
                  },
                  false
                );
              }}
            />
          </Suspense>
        );
        setShowAddLogsPopover(addLogsPopover);
      },
      divider: hasTestModule ? false : true,
    },
  ];

  if (node.data?.hasTestModule) {
    menuItems = [
      ...menuItems,
      {
        id: "run",
        name: "Run This Node Only",
        leftAdornment: <Icon outeIconName="OUTEPlayIcon" />,
        onClick: async () => {
          let variables = {};
          try {
            const { result } = await componentSDKServices.getVariableList(
              canvasRef.current.getModelJSON(),
              node.key,
              projectId,
              assetId
            );
            variables = result;
          } catch {
            variables = {};
          }
          defaultDrawerRef.current?.openSidebarPanel({
            id: "run-node",
            name: `Run ${node?.data?.name || node?.data?.type}`,
            panel: (
              <div
                style={{
                  display: "grid",
                  overflow: "hidden",
                  gridTemplateRows: "1fr auto",
                  gap: "1rem",
                  height: "100%",
                  padding: "1rem",
                  boxSizing: "border-box",
                }}
              >
                <CommonTestModule
                  canvasRef={canvasRef}
                  annotation={annotation}
                  go_data={node?.data?.go_data}
                  variables={{
                    ...(variablesRef.current || {}),
                    ...(variables || {}),
                    ...(paramsRef.current.params || {}),
                  }}
                  node={node?.data}
                  ref={testModuleRef}
                  workspaceId={workspaceId}
                  assetId={assetId}
                  projectId={projectId}
                  parentId={parentId}
                />
                <div
                  style={{
                    display: "flex",
                    justifyContent: "flex-end",
                    width: "100%",
                  }}
                >
                  <Button
                    variant="black"
                    label="Run This Node"
                    onClick={() => testModuleRef.current?.beginTest()}
                  />
                </div>
              </div>
            ),
          });
        },
        divider: true,
      },
    ];
  }

  menuItems.push({
    id: "delete-node",
    name: "Delete Node",
    leftAdornment: (
      <Icon
        outeIconName="OUTETrashIcon"
        outeIconProps={{ sx: { color: "#d32f2f" } }}
      />
    ),
    onClick: () => {
      if (node?.data?.subType === TRIGGER_SETUP_TYPE) {
        resetTriggerNode(node);
        return;
      }
      canvasRef.current.deleteSelection();
    },
    sx: {
      color: "#d32f2f",
      "&:hover": {
        backgroundColor: "#FFDBDB",
      },
      "&.Mui-disabled": {
        color: "black",
        backgroundColor: "white",
      },
    },
  });

  return menuItems;
};
