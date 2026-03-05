import React, { forwardRef, useImperativeHandle, useRef, useState, useCallback, useMemo, useEffect } from "react";
import { Rocket, Settings, Play } from "lucide-react";
import WizardDrawer from "@src/module/drawer/WizardDrawer";
import CommonTestModuleV3 from "../../common-components/CommonTestModuleV3";
import CommonTestResponseModule from "../../common-components/CommonTestResponseModule";
import UnsavedChangesPrompt from "../../common-components/UnsavedChangesPrompt";
import { UPDATE_RECORD_V2_NODE, MYSQL_UPDATE_RECORD_NODE, POSTGRES_UPDATE_RECORD_NODE, TABS, THEME } from "./constants";
import { useUpdateRecordV2State } from "./hooks/useUpdateRecordV2State";
import InitialiseTab from "./components/InitialiseTab";
import ConfigureTab from "./components/ConfigureTab";
import { DATABASE_TYPES } from "../utils/databaseConfig";
import { getWorkflowPreferences } from "@src/hooks/useWorkflowPreferences";
import cloneDeep from "lodash/cloneDeep";

const UpdateRecordV2 = forwardRef(
  (
    {
      canvasRef,
      annotation,
      data: initialData = {},
      variables,
      onSave = () => { },
      nodeData,
      workspaceId,
      assetId,
      projectId,
      parentId,
      databaseType,
      open = true,
      onClose = () => { },
      onUpdateTitle = () => { },
    },
    ref
  ) => {
    const data = useMemo(() => cloneDeep(initialData), [initialData]);

    const testModuleRef = useRef();
    const drawerRef = useRef();
    const state = useUpdateRecordV2State(data, workspaceId, projectId);
    const [showUnsavedPrompt, setShowUnsavedPrompt] = useState(false);
    const [isTestProcessing, setIsTestProcessing] = useState(false);
    const initialDataRef = useRef(JSON.stringify(data));

    const [activeTab, setActiveTab] = useState(
      state.hasInitialised ? TABS.CONFIGURE : TABS.INITIALISE
    );

    const effectiveDatabaseType =
      nodeData?.databaseType ||
      databaseType ||
      data?.connection?.databaseType;

    const selectedNode = useMemo(() => {
      if (effectiveDatabaseType === DATABASE_TYPES.MYSQL) {
        return MYSQL_UPDATE_RECORD_NODE;
      }
      if (effectiveDatabaseType === DATABASE_TYPES.POSTGRESQL) {
        return POSTGRES_UPDATE_RECORD_NODE;
      }
      return UPDATE_RECORD_V2_NODE; // fallback
    }, [effectiveDatabaseType]);

    const hasUnsavedChanges = useMemo(() => {
      const currentData = state.getData();
      return JSON.stringify(currentData) !== initialDataRef.current;
    }, [state]);

    const handleClose = useCallback((event, reason) => {
      const prefs = getWorkflowPreferences();

      if (hasUnsavedChanges) {
        if (prefs.autoSaveOnClose) {
          const saveData = state.getData();
          onSave(saveData, {}, false);
          onClose();
        } else {
          setShowUnsavedPrompt(true);
        }
      } else {
        onClose();
      }
    }, [hasUnsavedChanges, onSave, onClose, state]);

    const handleSaveAndClose = useCallback(() => {
      setShowUnsavedPrompt(false);
      const saveData = state.getData();
      onSave(saveData, {}, false);
      initialDataRef.current = JSON.stringify(saveData);
      onClose();
    }, [onSave, onClose, state]);

    const handleDiscardAndClose = useCallback(() => {
      setShowUnsavedPrompt(false);
      onClose();
    }, [onClose]);

    const handleCancelClose = useCallback(() => {
      setShowUnsavedPrompt(false);
    }, []);

    useImperativeHandle(
      ref,
      () => ({
        getData: state.getData,
        getError: state.getError,
      }),
      [state]
    );

    const handleTabChange = useCallback(
      (tabId) => {
        if (tabId === TABS.CONFIGURE && !state.hasInitialised) {
          return;
        }
        if (tabId === TABS.TEST && !state.validation.isValid) {
          return;
        }
        setActiveTab(tabId);
      },
      [state]
    );

    const handlePrimaryAction = useCallback(() => {
      if (activeTab === TABS.INITIALISE) {
        if (state.hasInitialised) {
          setActiveTab(TABS.CONFIGURE);
        }
      } else if (activeTab === TABS.CONFIGURE) {
        if (state.validation.isValid) {
          setActiveTab(TABS.TEST);
          setTimeout(() => {
            testModuleRef.current?.beginTest();
          }, 100);
        }
      } else if (activeTab === TABS.TEST) {
        const saveData = state.getData();
        onSave(saveData, {}, false);
        onClose();
      }
    }, [activeTab, onSave, onClose, state]);

    const handleSecondaryAction = useCallback(() => {
      if (activeTab === TABS.CONFIGURE) {
        setActiveTab(TABS.INITIALISE);
      } else if (activeTab === TABS.TEST) {
        setActiveTab(TABS.CONFIGURE);
      }
    }, [activeTab]);

    const handleEditDataSource = useCallback(() => {
      setActiveTab(TABS.INITIALISE);
    }, []);

    const handleTestComplete = useCallback(
      (output_schema) => {
        state.setOutputSchema(output_schema);
      },
      [state]
    );

    const handleProcessingChange = useCallback((processing) => {
      setIsTestProcessing(processing);
    }, []);

    const handleTestAction = useCallback(() => {
      testModuleRef.current?.beginTest();
    }, []);

    const handleSaveAndCloseAction = useCallback(() => {
      const saveData = state.getData();
      onSave(saveData, {}, false);
      onClose();
    }, [onSave, onClose, state]);

    const tabs = [
      { id: TABS.INITIALISE, label: "Initialise", icon: Rocket },
      { id: TABS.CONFIGURE, label: "Configure", icon: Settings },
      { id: TABS.TEST, label: "Test", icon: Play },
    ];

    const getPrimaryActionLabel = () => {
      if (activeTab === TABS.INITIALISE) return "Continue";
      if (activeTab === TABS.CONFIGURE) return "Test";
      return "Save & Close";
    };

    const getPrimaryDisabled = () => {
      if (activeTab === TABS.INITIALISE) return !state.hasInitialised;
      if (activeTab === TABS.CONFIGURE) return !state.validation.isValid;
      return false;
    };

    const getFooterGuidance = () => {
      if (activeTab === TABS.INITIALISE && !state.hasInitialised) {
        return "Select a connection and table to continue";
      }
      if (activeTab === TABS.CONFIGURE && !state.validation.isValid) {
        return "Configure WHERE clause and select fields to update";
      }
      if (activeTab === TABS.TEST) {
        return "Run a test to validate the configuration";
      }
      return null;
    };

    const renderContent = () => {
      switch (activeTab) {
        case TABS.INITIALISE:
          return (
            <InitialiseTab
              state={state}
              workspaceId={workspaceId}
              databaseType={effectiveDatabaseType || DATABASE_TYPES.POSTGRESQL}
              projectId={projectId}
            />
          );
        case TABS.CONFIGURE:
          return (
            <ConfigureTab
              state={state}
              variables={variables}
              onEditDataSource={handleEditDataSource}
            />
          );
        case TABS.TEST:
          return (
            <CommonTestModuleV3
              ref={testModuleRef}
              canvasRef={canvasRef}
              annotation={annotation}
              go_data={state.getData()}
              workspaceId={workspaceId}
              assetId={assetId}
              projectId={projectId}
              parentId={parentId}
              variables={variables}
              node={nodeData || UPDATE_RECORD_V2_NODE}
              onTestComplete={handleTestComplete}
              onProcessingChange={handleProcessingChange}
              theme={THEME}
              resultRenderer={(output) => {
                return <CommonTestResponseModule data={output} />;
              }}
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
        icon={<img src={selectedNode._src} alt={selectedNode.name} className="w-5 h-5" />}
        title={nodeData?.name || selectedNode.name}
        showEditTitle={true}
        onTitleChange={(newTitle) => { onUpdateTitle({ name: newTitle }); }}
        subtitle={UPDATE_RECORD_V2_NODE.description}
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={handleTabChange}
        onClose={handleClose}
        primaryActionLabel={getPrimaryActionLabel()}
        primaryActionDisabled={getPrimaryDisabled()}
        onPrimaryAction={activeTab !== TABS.TEST ? handlePrimaryAction : null}
        secondaryActionLabel="Back"
        showSecondaryAction={activeTab !== TABS.INITIALISE}
        onSecondaryAction={handleSecondaryAction}
        footerGuidance={!showUnsavedPrompt ? getFooterGuidance() : null}
        footerVariant={activeTab === TABS.TEST ? "test" : "default"}
        tertiaryActionLabel={activeTab === TABS.TEST ? "Save & Test" : null}
        onTertiaryAction={activeTab === TABS.TEST ? handleTestAction : null}
        tertiaryActionDisabled={isTestProcessing}
        tertiaryActionLoading={isTestProcessing}
        onSaveAndClose={activeTab === TABS.TEST ? handleSaveAndCloseAction : null}
        saveAndCloseLabel="Save & Close"
        footerContent={
          <UnsavedChangesPrompt
            show={showUnsavedPrompt}
            onSave={handleSaveAndClose}
            onDiscard={handleDiscardAndClose}
            onCancel={handleCancelClose}
          />
        }
        theme={THEME}
        loading={state.isLoadingConnections}
      >
        {renderContent()}
      </WizardDrawer>
    );
  }
);

UpdateRecordV2.displayName = "UpdateRecordV2";

export default UpdateRecordV2;
