import React, { forwardRef, useImperativeHandle, useRef, useState, useCallback, useMemo } from "react";
import { Sparkles, SlidersHorizontal, Settings, Play } from "lucide-react";
import WizardDrawer from "@src/module/drawer/WizardDrawer";
import CommonTestModuleV3 from "../common-components/CommonTestModuleV3";
import UnsavedChangesPrompt from "../common-components/UnsavedChangesPrompt";
import { TINYGPT_NODE, TABS, THEME } from "./constants";
import { useGPTState } from "./hooks/useGPTState";
import InitialiseTab from "./components/InitialiseTab";
import ConfigureTab from "./components/ConfigureTab";
import { getWorkflowPreferences } from "@src/hooks/useWorkflowPreferences";

const TinyGPTV3 = forwardRef(
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
    const state = useGPTState(data);
    const [showUnsavedPrompt, setShowUnsavedPrompt] = useState(false);
    const [isTestProcessing, setIsTestProcessing] = useState(false);
    const initialDataRef = useRef(JSON.stringify(data));

    const [activeTab, setActiveTab] = useState(
      state.hasInitialised ? TABS.CONFIGURE : TABS.INITIALISE
    );

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
      [state.hasInitialised, state.validation.isValid]
    );

    const handleTemplateSelect = useCallback((templateId) => {
      state.selectTemplate(templateId);
    }, [state]);

    const handleStartFromScratch = useCallback(() => {
      state.startFromScratch();
      setActiveTab(TABS.CONFIGURE);
    }, [state]);

    const handleContinueFromTemplate = useCallback(() => {
      state.applySelectedTemplate();
      setActiveTab(TABS.CONFIGURE);
    }, [state]);

    const handlePrimaryAction = useCallback(() => {
      if (activeTab === TABS.INITIALISE) {
        if (state.selectedTemplateId) {
          handleContinueFromTemplate();
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
    }, [activeTab, state, handleContinueFromTemplate, onSave, onClose]);

    const handleSecondaryAction = useCallback(() => {
      if (activeTab === TABS.CONFIGURE) {
        setActiveTab(TABS.INITIALISE);
      } else if (activeTab === TABS.TEST) {
        setActiveTab(TABS.CONFIGURE);
      }
    }, [activeTab]);

    const handleTestAction = useCallback(() => {
      testModuleRef.current?.beginTest();
    }, []);

    const handleSaveAndCloseAction = useCallback(() => {
      const saveData = state.getData();
      onSave(saveData, {}, false);
      initialDataRef.current = JSON.stringify(saveData);
      onClose();
    }, [onSave, onClose, state]);

    const handleTestComplete = useCallback((output_schema) => {
      if (output_schema && output_schema.length > 0) {
        state.updateOutputSchema(output_schema);
      }
    }, [state]);

    const tabs = [
      { id: TABS.INITIALISE, label: "Initialise", icon: SlidersHorizontal },
      { id: TABS.CONFIGURE, label: "Configure", icon: Settings },
      { id: TABS.TEST, label: "Test", icon: Play },
    ];

    const getPrimaryActionLabel = () => {
      if (activeTab === TABS.INITIALISE) return "Continue";
      if (activeTab === TABS.CONFIGURE) return "Test AI";
      return "Save & Close";
    };

    const getPrimaryDisabled = () => {
      if (activeTab === TABS.INITIALISE) return !state.selectedTemplateId;
      if (activeTab === TABS.CONFIGURE) return !state.validation.isValid;
      return false;
    };

    const getFooterGuidance = () => {
      if (activeTab === TABS.INITIALISE) {
        if (!state.selectedTemplateId) {
          return "Select a template or start from scratch to define your AI task";
        }
        return "Click Continue to configure your selected template";
      }
      if (activeTab === TABS.CONFIGURE) {
        if (!state.validation.isValid) {
          const errors = state.validation.errors;
          if (errors.systemPrompt) return errors.systemPrompt;
          if (errors.query) return errors.query;
          if (errors.output) return errors.output;
          return "Fill in all required fields to continue";
        }
        return "Configure your AI prompt and output format, then test it";
      }
      if (activeTab === TABS.TEST) {
        return "Run a test to validate the AI response before saving";
      }
      return null;
    };

    const renderContent = () => {
      switch (activeTab) {
        case TABS.INITIALISE:
          return (
            <InitialiseTab
              selectedTemplateId={state.selectedTemplateId}
              onSelectTemplate={handleTemplateSelect}
              onStartFromScratch={handleStartFromScratch}
            />
          );
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
              node={nodeData || TINYGPT_NODE}
              onTestComplete={handleTestComplete}
              onProcessingChange={setIsTestProcessing}
            />
          );
        default:
          return null;
      }
    };

    return (
      <>
        <WizardDrawer
          ref={drawerRef}
          open={open}
          icon={<Sparkles className="w-5 h-5" />}
          title={data.name || "TinyGPT"}
          subtitle="The most flexible AI node for any task"
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
          footerGuidance={getFooterGuidance()}
          footerVariant={activeTab === TABS.TEST ? "test" : "default"}
          tertiaryActionLabel={activeTab === TABS.TEST ? "Save & Test" : null}
          onTertiaryAction={activeTab === TABS.TEST ? handleTestAction : null}
          onSaveAndClose={activeTab === TABS.TEST ? handleSaveAndCloseAction : null}
          saveAndCloseLabel="Save & Close"
          theme={THEME}
          showEditTitle={true}
          onTitleChange={(newTitle) => {
            onUpdateTitle({ name: newTitle });
          }}
        >
          {renderContent()}
        </WizardDrawer>
        
        <UnsavedChangesPrompt
          open={showUnsavedPrompt}
          onSave={handleSaveAndClose}
          onDiscard={handleDiscardAndClose}
          onCancel={handleCancelClose}
        />
      </>
    );
  }
);

TinyGPTV3.displayName = "TinyGPTV3";

export default TinyGPTV3;
