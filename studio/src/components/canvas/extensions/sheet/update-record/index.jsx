import React, { forwardRef, useImperativeHandle, useRef, useState, useCallback, useMemo } from "react";
import { Rocket, Settings, Play } from "lucide-react";
import WizardDrawer from "@src/module/drawer/WizardDrawer";
import CommonTestModuleV3 from "../../common-components/CommonTestModuleV3";
import CommonTestResponseModule from "../../common-components/CommonTestResponseModule";
import UnsavedChangesPrompt from "../../common-components/UnsavedChangesPrompt";
import { UPDATE_SHEET_RECORD_NODE, TABS, THEME } from "./constants";
import { useUpdateRecordState } from "./hooks/useUpdateRecordState";
import InitialiseTab from "./components/InitialiseTab";
import ConfigureTab from "./components/ConfigureTab";
import useSheet from "../../common-hooks/useSheet";
import { convertFieldIdToName, buildFieldConfig } from "../utils";
import { getWorkflowPreferences } from "@src/hooks/useWorkflowPreferences";

const UpdateRecord = forwardRef(
  (
    {
      canvasRef,
      annotation,
      data = {},
      variables,
      onSave = () => { },
      nodeData,
      workspaceId,
      assetId,
      projectId,
      parentId,
      open = true,
      onClose = () => { },
      onUpdateTitle = () => { },
    },
    ref
  ) => {
    const testModuleRef = useRef();
    const drawerRef = useRef();
    const state = useUpdateRecordState(data);
    const [showUnsavedPrompt, setShowUnsavedPrompt] = useState(false);
    const [isTestProcessing, setIsTestProcessing] = useState(false);
    const initialDataRef = useRef(JSON.stringify(data));

    const {
      sheet,
      table,
      sheetList,
      tableList,
      view,
      sortedFields,
      onSheetChangeHandler: baseOnSheetChangeHandler,
      onTableChangeHandler: baseOnTableChangeHandler,
      getSheetList,
      createSheet,
      loading,
      tableLoading,
      sheetLoading,
    } = useSheet({
      data,
      parentId,
      workspaceId,
      onSheetChange: state.onSheetChange,
      onTableChange: state.onTableChange,
      onViewChange: state.onViewChange,
    });

    // Wrap handlers to sync both useSheet and useUpdateRecordState
    const onSheetChangeHandler = useCallback((event, sheetValue) => {
      state.setSheet(sheetValue);
      state.setTable(null);
      baseOnSheetChangeHandler(event, sheetValue);
    }, [state, baseOnSheetChangeHandler]);

    const onTableChangeHandler = useCallback((event, tableValue) => {
      state.setTable(tableValue);
      baseOnTableChangeHandler(event, tableValue, state.sheet?._id);
    }, [state, baseOnTableChangeHandler]);

    const [activeTab, setActiveTab] = useState(
      state.hasInitialised ? TABS.CONFIGURE : TABS.INITIALISE
    );

    const hasUnsavedChanges = useMemo(() => {
      const currentData = {
        ...state.getData(),
        asset: sheet || state.sheet,
        subSheet: table || state.table,
        view: view || state.view,
      };
      return JSON.stringify(currentData) !== initialDataRef.current;
    }, [state, sheet, table, view]);

    const handleClose = useCallback((event, reason) => {
      const prefs = getWorkflowPreferences();
      if (hasUnsavedChanges) {
        if (prefs.autoSaveOnClose) {
          const saveData = {
            ...state.getData(),
            asset: sheet || state.sheet,
            subSheet: table || state.table,
            view: view || state.view,
          };
          onSave(saveData, { errors: state.getError() }, false);
          onClose();
        } else {
          setShowUnsavedPrompt(true);
        }
      } else {
        onClose();
      }
    }, [hasUnsavedChanges, onSave, onClose, state, sheet, table, view]);

    const handleSaveAndClose = useCallback(() => {
      setShowUnsavedPrompt(false);
      const saveData = {
        ...state.getData(),
        asset: sheet || state.sheet,
        subSheet: table || state.table,
        view: view || state.view,
      };
      onSave(saveData, { errors: state.getError() }, false);
      initialDataRef.current = JSON.stringify(saveData);
      onClose();
    }, [onSave, onClose, state, sheet, table, view]);

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
        getData: () => ({
          ...state.getData(),
          asset: sheet || state.sheet,
          subSheet: table || state.table,
          view: view || state.view,
        }),
        getError: state.getError,
      }),
      [state, sheet, table, view]
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
      [state.hasInitialised, state.validation.isValid]
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
        const saveData = {
          ...state.getData(),
          asset: sheet || state.sheet,
          subSheet: table || state.table,
          view: view || state.view,
        };
        onSave(saveData, { errors: state.getError() }, false);
        onClose();
      }
    }, [activeTab, state.hasInitialised, state.validation.isValid, onSave, onClose, state, sheet, table, view]);

    const handleSecondaryAction = useCallback(() => {
      if (activeTab === TABS.CONFIGURE) {
        setActiveTab(TABS.INITIALISE);
      } else if (activeTab === TABS.TEST) {
        setActiveTab(TABS.CONFIGURE);
      }
    }, [activeTab]);

    const handleTemplateSelect = useCallback(
      (templateId) => {
        state.selectTemplate(templateId);
        setActiveTab(TABS.CONFIGURE);
      },
      [state]
    );

    const handleStartFromScratch = useCallback(() => {
      state.startFromScratch();
      setActiveTab(TABS.CONFIGURE);
    }, [state]);

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
      const saveData = {
        ...state.getData(),
        asset: sheet || state.sheet,
        subSheet: table || state.table,
        view: view || state.view,
      };
      onSave(saveData, { errors: state.getError() }, false);
      onClose();
    }, [onSave, onClose, state, sheet, table, view]);

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
        return "Select a sheet and table to continue";
      }
      if (activeTab === TABS.CONFIGURE && !state.validation.isValid) {
        return "Add filter conditions and select fields to update";
      }
      if (activeTab === TABS.TEST) {
        return "Run a test to validate the configuration";
      }
      return null;
    };

    // Build fieldConfig from sortedFields to map field IDs to human-readable names
    const fieldConfig = useMemo(() => buildFieldConfig({ sortedFields, nodeName: 'UpdateRecord' }), [sortedFields]);

    const renderContent = () => {
      switch (activeTab) {
        case TABS.INITIALISE:
          return (
            <InitialiseTab
              selectedTemplateId={state.selectedTemplateId}
              isFromScratch={state.isFromScratch}
              onSelectTemplate={handleTemplateSelect}
              onStartFromScratch={handleStartFromScratch}
              sheet={sheet}
              table={table}
              sheetList={sheetList}
              tableList={tableList}
              onSheetChange={onSheetChangeHandler}
              onTableChange={onTableChangeHandler}
              getSheetList={getSheetList}
              createSheet={createSheet}
              sheetLoading={sheetLoading}
              tableLoading={tableLoading}
              sortedFields={sortedFields}
            />
          );
        case TABS.CONFIGURE:
          return (
            <ConfigureTab
              state={state}
              variables={variables}
              sortedFields={sortedFields}
              loading={loading}
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
              node={nodeData || UPDATE_SHEET_RECORD_NODE}
              onTestComplete={handleTestComplete}
              onProcessingChange={handleProcessingChange}
              fieldConfig={fieldConfig}
              theme={THEME}
              resultRenderer={(output) => {
                const updatedOutput = convertFieldIdToName({
                  fields: sortedFields,
                  output,
                });
                return <CommonTestResponseModule data={updatedOutput} />;
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
        icon={<img src={UPDATE_SHEET_RECORD_NODE._src} alt="Update Record" className="w-5 h-5" />}
        title={nodeData?.name || UPDATE_SHEET_RECORD_NODE.name}
        showEditTitle={true}
        onTitleChange={(newTitle) => { state.updateState({ name: newTitle }); onUpdateTitle({ name: newTitle }); }}
        subtitle={UPDATE_SHEET_RECORD_NODE.description}
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
        loading={loading}
      >
        {renderContent()}
      </WizardDrawer>
    );
  }
);

UpdateRecord.displayName = "UpdateRecord";

export default UpdateRecord;
export { UPDATE_SHEET_RECORD_NODE } from "./constants";
