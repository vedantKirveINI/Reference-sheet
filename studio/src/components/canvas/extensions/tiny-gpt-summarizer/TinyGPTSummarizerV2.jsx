import React, { forwardRef, useImperativeHandle, useRef, useState, useCallback, useMemo } from "react";
import { FileText, SlidersHorizontal, Settings, Play } from "lucide-react";
import WizardDrawer from "@src/module/drawer/WizardDrawer";
import CommonTestModuleV3 from "../common-components/CommonTestModuleV3";
import UnsavedChangesPrompt from "../common-components/UnsavedChangesPrompt";
import { TINYGPT_SUMMARIZER_V2_NODE, TABS, THEME } from "./constants";
import { useSummarizerState } from "./hooks/useSummarizerState";
import InitialiseTab from "./components/InitialiseTab";
import ConfigureTab from "./components/ConfigureTab";
import { getWorkflowPreferences } from "@src/hooks/useWorkflowPreferences";

const TinyGPTSummarizerV2 = forwardRef(
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
    const state = useSummarizerState(data);
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
      setActiveTab(TABS.CONFIGURE);
    }, []);

    const handlePrimaryAction = useCallback(() => {
      if (activeTab === TABS.INITIALISE) {
        if (state.selectedTemplateId || state.isFromScratch) {
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
        state.setOutputSchema(output_schema);
      }
    }, [state]);

    const tabs = [
      { id: TABS.INITIALISE, label: "Initialise", icon: SlidersHorizontal },
      { id: TABS.CONFIGURE, label: "Configure", icon: Settings },
      { id: TABS.TEST, label: "Test", icon: Play },
    ];

    const getPrimaryActionLabel = () => {
      if (activeTab === TABS.INITIALISE) return "Continue";
      if (activeTab === TABS.CONFIGURE) return "Test Summary";
      return "Save & Close";
    };

    const getPrimaryDisabled = () => {
      if (activeTab === TABS.INITIALISE) return !state.selectedTemplateId && !state.isFromScratch;
      if (activeTab === TABS.CONFIGURE) return !state.validation.isValid;
      return false;
    };

    const getFooterGuidance = () => {
      if (activeTab === TABS.INITIALISE) {
        if (!state.selectedTemplateId && !state.isFromScratch) {
          return "Choose a summary style or start from scratch";
        }
        return "Click Continue to configure your summary";
      }
      if (activeTab === TABS.CONFIGURE) {
        if (!state.validation.isValid) {
          const errors = state.validation.errors;
          if (errors.inputText) return errors.inputText;
          if (errors.output) return errors.output;
          return "Specify the content to summarize and desired length";
        }
        return "Specify the content to summarize and desired length";
      }
      if (activeTab === TABS.TEST) {
        return "Run a test to verify the summarization quality";
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
              node={nodeData || TINYGPT_SUMMARIZER_V2_NODE}
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
          icon={<FileText className="w-5 h-5" />}
          title={data.name || "GPT Summarizer"}
          subtitle="AI-powered content summarization"
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

TinyGPTSummarizerV2.displayName = "TinyGPTSummarizerV2";

export default TinyGPTSummarizerV2;
