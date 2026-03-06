import {
  forwardRef,
  useCallback,
  useEffect,
  useRef,
  useState,
  useImperativeHandle,
  memo,
} from "react";
import { Link, Settings, Play } from "lucide-react";
import WizardDrawer from "@src/module/drawer/WizardDrawer";
import { CONNECTION_NODE_THEME } from "./constant/theme";
import { TABS } from "./constant/tabs";
import { useIntegrationNodeState } from "./hooks/use-integration-node-state";
import ConnectionInitializationMode from "./tabs/initialize";
import ConnectionConfigurationMode from "./tabs/configure";
import { FormTestContent } from "./tabs/test";

const THEME = {
  headerBg: "#ffffff",
  primaryButtonBg: CONNECTION_NODE_THEME.dark,
  accentColor: CONNECTION_NODE_THEME.foreground,
};

const activeTabCache = new Map();

const IntegrationNodeDrawer = forwardRef(
  (
    {
      canvasRef,
      annotation,
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
      open = true,
      onClose = () => {},
      onGuidedTabChange,
    },
    ref,
  ) => {
    const testModuleRef = useRef();
    const drawerRef = useRef();

    const [integrationState, setIntegrationState] = useState({
      advancedFields: [],
      allNodes: {},
      answers: {},
      variables: {},
      configs: {},
      annotation: "",
      onContinue: null,
      setConfig: null,
      onAnswerChange: null,
    });

    const state = useIntegrationNodeState({
      nodeData,
      parentId,
      projectId,
      workspaceId,
      assetId,
    });

    const hasConnection = Boolean(
      state.selectedConnection?.id || state.selectedConnection?._id,
    );

    const initialTab = hasConnection ? TABS.CONFIGURE : TABS.CONNECT;
    const nodeDataId = nodeData?.id;

    const [activeTab, setActiveTabState] = useState(() => {
      const cachedTab = activeTabCache.get(nodeDataId);
      if (cachedTab !== undefined) {
        return cachedTab;
      }
      return initialTab;
    });

    const setActiveTab = useCallback(
      (tab) => {
        activeTabCache.set(nodeDataId, tab);
        setActiveTabState(tab);
        onGuidedTabChange?.(tab);
      },
      [nodeDataId, onGuidedTabChange],
    );

    useEffect(() => {
      onGuidedTabChange?.(activeTab);
    }, []);

    useEffect(() => {
      activeTabCache.set(nodeDataId, activeTab);
    }, [activeTab, nodeDataId]);

    const getIntegrationNodeData = useCallback(() => {
      const { configureData, selectedConnection } =
        state.getIntegrationNodeData();
      return { configureData, selectedConnection };
    }, [state]);

    const autoSaveHandler = useCallback(
      async (openNodeAfterCreate = false) => {
        const { configureData = {}, selectedConnection = {} } =
          getIntegrationNodeData();
        const isConnectionSelected = Boolean(
          selectedConnection?.id || selectedConnection?._id,
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
          openNodeAfterCreate,
        );
      },
      [getIntegrationNodeData, autoSave],
    );

    const discardHandler = useCallback(async () => {
      const { configureData, selectedConnection } = getIntegrationNodeData();
      const isConnectionSelected = Boolean(
        selectedConnection?.id || selectedConnection?._id,
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
        true,
      );
    }, [getIntegrationNodeData, autoSave]);

    const hasInitializedRef = useRef(false);

    useEffect(() => {
      if (hasInitializedRef.current) {
        return;
      }

      if (!nodeData?.go_data?.last_updated) {
        setTimeout(() => {
          autoSaveHandler(true);
        }, 100);
      }

      hasInitializedRef.current = true;
    }, [autoSaveHandler, nodeData?.id]);

    useImperativeHandle(
      ref,
      () => ({
        getIntegrationNodeData,
        getData: getIntegrationNodeData,
      }),
      [getIntegrationNodeData],
    );

    const handleTabChange = useCallback(
      (tabId) => {
        if (tabId === TABS.CONFIGURE && !hasConnection) {
          return;
        }
        if (tabId === TABS.TEST && !state.isConfigured) {
          return;
        }
        setActiveTab(tabId);
      },
      [hasConnection, state.isConfigured, setActiveTab],
    );

    const handlePrimaryAction = useCallback(async () => {
      if (activeTab === TABS.CONNECT) {
        if (hasConnection) {
          setActiveTab(TABS.CONFIGURE);
        }
      } else if (activeTab === TABS.CONFIGURE) {
        if (integrationState.onContinue) {
          integrationState.onContinue();
        }
      } else if (activeTab === TABS.TEST) {
        await autoSaveHandler();
        onClose();
      }
    }, [
      activeTab,
      hasConnection,
      autoSaveHandler,
      onClose,
      integrationState,
      setActiveTab,
    ]);

    const handleSecondaryAction = useCallback(() => {
      if (activeTab === TABS.CONFIGURE) {
        setActiveTab(TABS.CONNECT);
      } else if (activeTab === TABS.TEST) {
        setActiveTab(TABS.CONFIGURE);
      }
    }, [activeTab, setActiveTab]);

    const handleTestAction = useCallback(() => {
      testModuleRef.current?.beginTest();
    }, []);

    const handleSaveAndCloseAction = useCallback(async () => {
      await autoSaveHandler();
      onClose();
    }, [autoSaveHandler, onClose]);

    const handleClose = useCallback(
      async (event, reason) => {
        await discardHandler();
        onClose(event, reason);
      },
      [discardHandler, onClose],
    );

    const onInitializeDone = useCallback(() => {
      setActiveTab(TABS.CONFIGURE);
    }, [setActiveTab]);

    const onConfigureDone = useCallback(
      async (configuredData) => {
        state.setConfigureData(configuredData);
        state.setIsConfigured(true);
        await autoSave(
          {
            connection: {
              ...state.selectedConnection,
              id: state.selectedConnection?._id,
            },
            ...configuredData,
          },
          {},
          {},
          true,
        );
        setActiveTab(TABS.TEST);
      },
      [state, autoSave, setActiveTab],
    );

    const handleIntegrationStateChange = useCallback((newState) => {
      setIntegrationState(newState);
    }, []);

    const tabs = [
      { id: TABS.CONNECT, label: "Connect", icon: Link },
      { id: TABS.CONFIGURE, label: "Configure", icon: Settings },
      { id: TABS.TEST, label: "Test", icon: Play },
    ];

    const getPrimaryActionLabel = () => {
      if (activeTab === TABS.CONNECT) return "Continue";
      if (activeTab === TABS.CONFIGURE) return "Test";
      return "Save & Close";
    };

    const getPrimaryDisabled = () => {
      if (activeTab === TABS.CONNECT) return !hasConnection;
      if (activeTab === TABS.CONFIGURE) return false;
      return false;
    };

    const getFooterGuidance = () => {
      if (activeTab === TABS.CONNECT && !hasConnection) {
        return "Please add a connection to continue";
      }
      if (activeTab === TABS.CONFIGURE) {
        return "Fill in the required fields and click Test to proceed";
      }
      if (activeTab === TABS.TEST) {
        return "Run a test to validate the integration";
      }
      return null;
    };


    const renderContent = () => {
      if (state.loading) {
        return (
          <div className="w-full h-full flex justify-center items-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
          </div>
        );
      }

      switch (activeTab) {
        case TABS.CONNECT:
          return (
            <ConnectionInitializationMode
              connectionSrc={nodeData?._src}
              connectionNodeData={state.connectionNode}
              resourceIds={state.resourceIds}
              selectedConnection={state.selectedConnection}
              onConnectionChange={state.onConnectionChange}
              onInitializeDone={onInitializeDone}
              nodeData={nodeData}
              assetName={assetDetails?.name}
              hideFooter={true}
            />
          );
        case TABS.CONFIGURE:
          return (
            <ConnectionConfigurationMode
              variables={variables}
              flow={state.flowWithOutConnection}
              taskGraph={state.taskGraph}
              projectVariables={state.projectVariables}
              getInitialAnswers={state.getInitialAnswers}
              initialPipeline={state.configureData?.state?.pipeline}
              annotation={state.annotation}
              resourceIds={state.resourceIds}
              result={state.publishResult}
              onConfigureDone={onConfigureDone}
              nodeData={nodeData}
              node_configs={state.configureData?.configs}
              onAnswerChange={state.onAnswerChange}
              onIntegrationStateChange={handleIntegrationStateChange}
            />
          );
        case TABS.TEST:
          return (
            <FormTestContent
              ref={testModuleRef}
              canvasRef={canvasRef}
              annotation={annotation}
              node={nodeData}
              getGoData={state.getGoData}
              variables={variables}
              workspaceId={workspaceId}
              assetId={assetId}
              projectId={projectId}
              parentId={parentId}
            />
          );
        default:
          return null;
      }
    };

    return (
      <WizardDrawer
        ref={drawerRef}
        open={open}
        icon={
          nodeData?._src ? (
            <img src={nodeData._src} alt="" className="w-5 h-5" />
          ) : (
            <Link className="w-5 h-5" />
          )
        }
        title={nodeData?.name || "Form Integration"}
        subtitle={nodeData?.description || "Configure your integration"}
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={handleTabChange}
        onClose={handleClose}
        footerVariant={activeTab === TABS.TEST ? "test" : "default"}
        primaryActionLabel={getPrimaryActionLabel()}
        primaryActionDisabled={getPrimaryDisabled()}
        onPrimaryAction={activeTab !== TABS.TEST ? handlePrimaryAction : null}
        secondaryActionLabel="Back"
        showSecondaryAction={activeTab !== TABS.CONNECT}
        onSecondaryAction={handleSecondaryAction}
        footerGuidance={getFooterGuidance()}
        tertiaryActionLabel={activeTab === TABS.TEST ? "Save & Test" : null}
        onTertiaryAction={activeTab === TABS.TEST ? handleTestAction : null}
        tertiaryActionDisabled={false}
        tertiaryActionLoading={false}
        onSaveAndClose={activeTab === TABS.TEST ? handleSaveAndCloseAction : null}
        saveAndCloseLabel="Save & Close"
        theme={THEME}
        showEditTitle={true}
        onTitleChange={onUpdateTitle}
        sidebarActions={sidebarActions}
        onSidebarActionClick={onSidebarActionClick}
        contentClassName="p-0"
      >
        <div className="w-full h-full">{renderContent()}</div>
      </WizardDrawer>
    );
  },
);

IntegrationNodeDrawer.displayName = "IntegrationNodeDrawer";

const MemoizedIntegrationNodeDrawer = memo(
  IntegrationNodeDrawer,
  (prevProps, nextProps) => {
    const prevNodeId = prevProps.nodeData?.id;
    const nextNodeId = nextProps.nodeData?.id;

    if (prevNodeId !== nextNodeId) {
      return false;
    }

    return true;
  },
);

MemoizedIntegrationNodeDrawer.displayName = "MemoizedIntegrationNodeDrawer";

export default MemoizedIntegrationNodeDrawer;
