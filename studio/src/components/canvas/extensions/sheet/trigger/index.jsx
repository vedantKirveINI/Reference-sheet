import React, { forwardRef, useImperativeHandle, useRef, useState, useCallback, useEffect } from "react";
import { Rocket, Settings } from "lucide-react";
import WizardDrawer from "@src/module/drawer/WizardDrawer";
import { SHEET_TRIGGER_NODE, TABS, THEME } from "./constants";
import { useTriggerState } from "./hooks/useTriggerState";
import InitialiseTab from "./components/InitialiseTab";
import ConfigureTab from "./components/ConfigureTab";
import useSheet from "../../common-hooks/useSheet";

const SheetTrigger = forwardRef(
  (
    {
      canvasRef,
      annotation,
      data = {},
      variables,
      onSave = () => {},
      nodeData,
      workspaceId,
      assetId,
      projectId,
      parentId,
      open = true,
      onClose = () => {},
      onUpdateTitle = () => {},
    },
    ref
  ) => {
    const drawerRef = useRef();
    const state = useTriggerState(data);

    const onTableChange = useCallback(async () => {
      state.setFilterConditions({ type: "fx", blocks: [{ type: "PRIMITIVES", value: "" }] });
    }, [state]);

    const {
      sheetList,
      tableList,
      sortedFields,
      onSheetChangeHandler,
      onTableChangeHandler,
      getSheetList,
      createSheet,
      loading,
    } = useSheet({
      data,
      parentId,
      workspaceId,
      onTableChange,
      isViewRequired: false,
      isFieldRequired: true,
    });

    const handleSheetChange = useCallback((_, newSheet) => {
      state.setSheet(newSheet);
      state.setTable(null);
      onSheetChangeHandler(_, newSheet);
    }, [state, onSheetChangeHandler]);

    const handleTableChange = useCallback((_, newTable) => {
      state.setTable(newTable);
      onTableChangeHandler(_, newTable);
    }, [state, onTableChangeHandler]);

    useEffect(() => {
      if (data.asset && !state.sheet) {
        state.setSheet(data.asset);
      }
      if (data.subSheet && !state.table) {
        state.setTable(data.subSheet);
      }
      if (data.eventType && state.eventTypes.length === 0) {
        state.setEventTypes(data.eventType);
      }
    }, [data.asset, data.subSheet, data.eventType, state]);

    const [activeTab, setActiveTab] = useState(
      state.hasInitialised ? TABS.CONFIGURE : TABS.INITIALISE
    );

    useImperativeHandle(
      ref,
      () => ({
        getData: state.getData,
        getError: state.getError,
        validateData: () => {
          return state.validation.errors.length > 0 ? state.validation.errors : null;
        },
      }),
      [state]
    );

    const handleTabChange = useCallback(
      (tabId) => {
        if (tabId === TABS.CONFIGURE && !state.hasInitialised) {
          return;
        }
        setActiveTab(tabId);
      },
      [state.hasInitialised]
    );

    const handlePrimaryAction = useCallback(() => {
      if (activeTab === TABS.INITIALISE) {
        if (state.hasInitialised) {
          setActiveTab(TABS.CONFIGURE);
        }
      } else if (activeTab === TABS.CONFIGURE) {
        if (state.validation.isValid) {
          onSave();
          onClose();
        }
      }
    }, [activeTab, state.hasInitialised, state.validation.isValid, onSave, onClose]);

    const handleSecondaryAction = useCallback(() => {
      if (activeTab === TABS.CONFIGURE) {
        setActiveTab(TABS.INITIALISE);
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

    const tabs = [
      { id: TABS.INITIALISE, label: "Initialise", icon: Rocket },
      { id: TABS.CONFIGURE, label: "Configure", icon: Settings },
    ];

    const getPrimaryActionLabel = () => {
      if (activeTab === TABS.INITIALISE) return "Continue";
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
        return "Select a sheet, table, and at least one event type";
      }
      return null;
    };

    const renderContent = () => {
      switch (activeTab) {
        case TABS.INITIALISE:
          return (
            <InitialiseTab
              selectedTemplateId={state.selectedTemplateId}
              isFromScratch={state.isFromScratch}
              onSelectTemplate={handleTemplateSelect}
              onStartFromScratch={handleStartFromScratch}
              sheet={state.sheet}
              table={state.table}
              sheetList={sheetList}
              tableList={tableList}
              onSheetChange={handleSheetChange}
              onTableChange={handleTableChange}
              getSheetList={getSheetList}
              createSheet={createSheet}
              loading={loading}
              sortedFields={sortedFields}
            />
          );
        case TABS.CONFIGURE:
          return (
            <ConfigureTab
              state={state}
              variables={variables}
              loading={loading}
              onEditDataSource={handleEditDataSource}
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
        icon={<img src={SHEET_TRIGGER_NODE._src} alt="Table Trigger" className="w-5 h-5" />}
        title={nodeData?.name || SHEET_TRIGGER_NODE.name}
        showEditTitle={true}
        onTitleChange={(newTitle) => { state.updateState({ name: newTitle }); onUpdateTitle({ name: newTitle }); }}
        subtitle={SHEET_TRIGGER_NODE.description}
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={handleTabChange}
        onClose={onClose}
        primaryActionLabel={getPrimaryActionLabel()}
        primaryActionDisabled={getPrimaryDisabled()}
        onPrimaryAction={handlePrimaryAction}
        secondaryActionLabel="Back"
        showSecondaryAction={activeTab !== TABS.INITIALISE}
        onSecondaryAction={handleSecondaryAction}
        footerGuidance={getFooterGuidance()}
        theme={THEME}
        loading={loading}
      >
        {renderContent()}
      </WizardDrawer>
    );
  }
);

SheetTrigger.displayName = "SheetTrigger";

export default SheetTrigger;
export { SHEET_TRIGGER_NODE } from "./constants";
