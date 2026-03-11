import React, { forwardRef, useImperativeHandle, useState, useCallback, useRef, useMemo } from "react";
import { Wand2, Settings, Play } from "lucide-react";
import WizardDrawer from "@src/module/drawer/WizardDrawer";
import CommonTestModuleV3 from "../common-components/CommonTestModuleV3";
import { TRANSFORMER_NODE, THEME, TABS } from "./constants";
import { useTransformerState } from "./hooks/useTransformerState";
import ConfigureTab from "./components/ConfigureTab";
import { getWorkflowPreferences } from "@src/hooks/useWorkflowPreferences";

const TransformerV3 = forwardRef(
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
    const state = useTransformerState(data);
    const [activeTab, setActiveTab] = useState(TABS.CONFIGURE);
    const [showUnsavedPrompt, setShowUnsavedPrompt] = useState(false);
    const initialDataRef = useRef(JSON.stringify(data));

    const hasUnsavedChanges = useMemo(() => {
      return JSON.stringify(state.getData()) !== initialDataRef.current;
    }, [state.name, state.content, state.testValues, state.outputSchema, state]);

    const handleClose = useCallback(
      (event, reason) => {
        const prefs = getWorkflowPreferences();
        if (hasUnsavedChanges) {
          if (prefs.autoSaveOnClose) {
            const saveData = state.getData();
            onSave(saveData, { errors: state.getError() }, false);
            initialDataRef.current = JSON.stringify(saveData);
            onClose();
          } else {
            setShowUnsavedPrompt(true);
          }
        } else {
          onClose();
        }
      },
      [hasUnsavedChanges, onSave, onClose, state]
    );


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
        const transformerData = state.getData();
        onSave(transformerData, { errors: state.getError() }, false);
        initialDataRef.current = JSON.stringify(transformerData);
      }
    }, [activeTab, state.validation.isValid, onSave, state]);

    const handleSecondaryAction = useCallback(() => {
      if (activeTab === TABS.TEST) {
        setActiveTab(TABS.CONFIGURE);
      }
    }, [activeTab]);

    const handleTestAction = useCallback(() => {
      testModuleRef.current?.beginTest();
    }, []);

    const handleSaveAndCloseAction = useCallback(() => {
      const transformerData = state.getData();
      onSave(transformerData, { errors: state.getError() }, false);
      initialDataRef.current = JSON.stringify(transformerData);
      onClose();
    }, [onSave, onClose, state]);

    const handleTestComplete = useCallback((output_schema) => {
      state.updateOutputSchema(output_schema);
    }, [state]);

    const tabs = [
      { id: TABS.CONFIGURE, label: "Configure", icon: Settings },
      { id: TABS.TEST, label: "Test", icon: Play },
    ];

    const getPrimaryActionLabel = () => {
      if (activeTab === TABS.CONFIGURE) return "Test Transformation";
      return "Save & Close";
    };

    const getPrimaryDisabled = () => {
      if (activeTab === TABS.CONFIGURE) return !state.validation.isValid;
      return false;
    };

    const getFooterGuidance = () => {
      if (activeTab === TABS.CONFIGURE && !state.validation.isValid) {
        return state.validation.errors[0] || "Enter a transformation expression to continue";
      }
      if (activeTab === TABS.TEST) {
        return "Run a test to validate the transformation output";
      }
      return null;
    };

    const footerGuidanceValue = getFooterGuidance();

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
              node={nodeData || TRANSFORMER_NODE}
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
        icon={<Wand2 className="w-5 h-5" />}
        title={state.name || "Transformer"}
        subtitle="Transform and reshape your data"
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={handleTabChange}
        onClose={handleClose}
        footerVariant={activeTab === TABS.TEST ? "test" : "default"}
        primaryActionLabel={getPrimaryActionLabel()}
        primaryActionDisabled={getPrimaryDisabled()}
        onPrimaryAction={activeTab !== TABS.TEST ? handlePrimaryAction : null}
        secondaryActionLabel="Back"
        showSecondaryAction={activeTab === TABS.TEST}
        onSecondaryAction={handleSecondaryAction}
        footerGuidance={!showUnsavedPrompt ? footerGuidanceValue : null}
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

TransformerV3.displayName = "TransformerV3";

export default TransformerV3;
