import React, { forwardRef, useImperativeHandle, useState, useCallback, useRef } from "react";
import { Layers, Settings, Play } from "lucide-react";
import WizardDrawer from "@src/module/drawer/WizardDrawer";
import CommonTestModuleV3 from "../common-components/CommonTestModuleV3";
import { ARRAY_AGGREGATOR_V2_NODE, THEME, TABS } from "./constants";
import { useArrayAggregatorState } from "./hooks/useArrayAggregatorState";
import ConfigureTab from "./components/ConfigureTab";

const ArrayAggregatorV2 = forwardRef(
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
    const testModuleRef = useRef();
    const drawerRef = useRef();
    const state = useArrayAggregatorState(data);
    const [activeTab, setActiveTab] = useState(TABS.CONFIGURE);

    useImperativeHandle(
      ref,
      () => ({
        getData: state.getData,
        getError: state.getError,
      }),
      [state]
    );

    const handleTabChange = useCallback((tabId) => {
      if (tabId === TABS.TEST && !state.validation.isValid) {
        return;
      }
      setActiveTab(tabId);
    }, [state.validation.isValid]);

    const handlePrimaryAction = useCallback(() => {
      if (activeTab === TABS.CONFIGURE) {
        if (state.validation.isValid) {
          setActiveTab(TABS.TEST);
          setTimeout(() => {
            testModuleRef.current?.beginTest();
          }, 100);
        }
      } else if (activeTab === TABS.TEST) {
        onSave();
      }
    }, [activeTab, state.validation.isValid, onSave]);

    const handleSecondaryAction = useCallback(() => {
      if (activeTab === TABS.TEST) {
        setActiveTab(TABS.CONFIGURE);
      }
    }, [activeTab]);

    const handleTestAction = useCallback(() => {
      testModuleRef.current?.beginTest();
    }, []);

    const handleSaveAndCloseAction = useCallback(() => {
      onSave();
      onClose();
    }, [onSave, onClose]);

    const handleTestComplete = useCallback((output_schema) => {
      state.setOutputSchema(output_schema);
    }, [state]);

    const tabs = [
      { id: TABS.CONFIGURE, label: "Configure", icon: Settings },
      { id: TABS.TEST, label: "Test", icon: Play },
    ];

    const getPrimaryActionLabel = () => {
      if (activeTab === TABS.CONFIGURE) return "Test";
      return "Save & Close";
    };

    const getPrimaryDisabled = () => {
      if (activeTab === TABS.CONFIGURE) return !state.validation.isValid;
      return false;
    };

    const getFooterGuidance = () => {
      if (activeTab === TABS.CONFIGURE && !state.source) {
        return "Select a source iterator to continue";
      }
      if (activeTab === TABS.TEST) {
        return "Run a test to validate the output schema";
      }
      return null;
    };

    const renderContent = () => {
      switch (activeTab) {
        case TABS.CONFIGURE:
          return (
            <ConfigureTab
              state={state}
              variables={variables}
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
              node={nodeData || ARRAY_AGGREGATOR_V2_NODE}
              onTestComplete={handleTestComplete}
              resultType="json"
              persistTestData={true}
              inputMode="auto"
              useV3Input={true}
              useV4Result={true}
              autoContextualContent={true}
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
        icon={<Layers className="w-5 h-5" />}
        title={state.name || "Array Aggregator"}
        subtitle="Collect results from Iterator back into a single array"
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={handleTabChange}
        onClose={onClose}
        footerVariant={activeTab === TABS.TEST ? "test" : "default"}
        primaryActionLabel={getPrimaryActionLabel()}
        primaryActionDisabled={getPrimaryDisabled()}
        onPrimaryAction={activeTab !== TABS.TEST ? handlePrimaryAction : null}
        secondaryActionLabel="Back"
        showSecondaryAction={activeTab === TABS.TEST}
        onSecondaryAction={handleSecondaryAction}
        footerGuidance={getFooterGuidance()}
        tertiaryActionLabel={activeTab === TABS.TEST ? "Save & Test" : null}
        onTertiaryAction={activeTab === TABS.TEST ? handleTestAction : null}
        onSaveAndClose={activeTab === TABS.TEST ? handleSaveAndCloseAction : null}
        saveAndCloseLabel="Save & Close"
        theme={THEME}
        showEditTitle={true}
        onTitleChange={(newTitle) => { state.updateState({ name: newTitle }); onUpdateTitle({ name: newTitle }); }}
      >
        {renderContent()}
      </WizardDrawer>
    );
  }
);

ArrayAggregatorV2.displayName = "ArrayAggregatorV2";

export default ArrayAggregatorV2;
