import React, { forwardRef, useImperativeHandle, useRef, useState, useCallback, useMemo } from "react";
import { MessageSquare, SlidersHorizontal, Play } from "lucide-react";
import WizardDrawer from "@src/module/drawer/WizardDrawer";
import CommonTestModuleV3 from "../../common-components/CommonTestModuleV3";
import UnsavedChangesPrompt from "../../common-components/UnsavedChangesPrompt";
import { AGENT_COMPOSER_V3_NODE, TABS, THEME } from "./constants";
import { useComposerState } from "./hooks/useComposerState";
import InitialiseTab from "./components/InitialiseTab";
import ConfigureTab from "./components/ConfigureTab";
import { getWorkflowPreferences } from "@src/hooks/useWorkflowPreferences";

const AgentComposerV3 = forwardRef(
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
    const state = useComposerState(data);
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
      setActiveTab(TABS.CONFIGURE);
    }, [state]);

    const handleStartFromScratch = useCallback(() => {
      state.startFromScratch();
      setActiveTab(TABS.CONFIGURE);
    }, [state]);

    const handleEditTemplate = useCallback(() => {
      setActiveTab(TABS.INITIALISE);
    }, []);

    const handlePrimaryAction = useCallback(() => {
      if (activeTab === TABS.INITIALISE) {
        if (state.selectedTemplateId || state.isFromScratch) {
          setActiveTab(TABS.CONFIGURE);
        }
        return;
      } else if (activeTab === TABS.CONFIGURE) {
        state.markAllTouched();
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
    }, [activeTab, state, onSave, onClose]);

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
    }, [state, onSave, onClose]);

    const handleTitleChange = useCallback(
      (newTitle) => {
        state.setName(newTitle);
        // Keep node title on the canvas in sync with the drawer title
        onUpdateTitle({ name: newTitle });
      },
      [state, onUpdateTitle]
    );

    const getPrimaryActionLabel = () => {
      if (activeTab === TABS.INITIALISE) return "Continue";
      if (activeTab === TABS.CONFIGURE) return "Test";
      return "Save & Close";
    };

    const isPrimaryDisabled = () => {
      if (activeTab === TABS.INITIALISE) {
        return !state.selectedTemplateId && !state.isFromScratch;
      }
      if (activeTab === TABS.CONFIGURE) {
        return false;
      }
      return isTestProcessing;
    };

    const getFooterGuidance = () => {
      if (activeTab === TABS.INITIALISE) {
        if (!state.selectedTemplateId && !state.isFromScratch) {
          return "Select a template or start from scratch to begin";
        }
        return "Click Continue to configure your message";
      }
      if (activeTab === TABS.CONFIGURE) {
        if (!state.validation.isValid) {
          return state.validation.errors?.[0] || "Fill in required fields to continue";
        }
        return "Configure your message, then test the composer";
      }
      if (activeTab === TABS.TEST) {
        return "Run a test to validate the message before saving";
      }
      return null;
    };

    const tabs = [
      {
        id: TABS.INITIALISE,
        label: "Initialise",
        icon: MessageSquare,
      },
      {
        id: TABS.CONFIGURE,
        label: "Configure",
        icon: SlidersHorizontal,
      },
      {
        id: TABS.TEST,
        label: "Test",
        icon: Play,
      },
    ];

    const renderTabContent = () => {
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
              onEditTemplate={handleEditTemplate}
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
              node={nodeData || AGENT_COMPOSER_V3_NODE}
              onTestComplete={(output_schema) => {
                state.setOutputSchema(output_schema);
              }}
              onProcessingChange={setIsTestProcessing}
              theme={{
                accentColor: AGENT_COMPOSER_V3_NODE.light,
              }}
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
          onClose={handleClose}
          icon={
            <img
              src={AGENT_COMPOSER_V3_NODE._src}
              alt="Composer"
              className="w-5 h-5"
            />
          }
          title={state.name || "Tiny Composer"}
          subtitle="AI-powered message composition"
          tabs={tabs}
          activeTab={activeTab}
          onTabChange={handleTabChange}
          footerVariant={activeTab === TABS.TEST ? "test" : "default"}
          primaryActionLabel={getPrimaryActionLabel()}
          primaryActionDisabled={isPrimaryDisabled()}
          onPrimaryAction={activeTab !== TABS.TEST ? handlePrimaryAction : null}
          secondaryActionLabel="Back"
          showSecondaryAction={activeTab !== TABS.INITIALISE}
          onSecondaryAction={handleSecondaryAction}
          footerGuidance={getFooterGuidance()}
          tertiaryActionLabel={activeTab === TABS.TEST ? "Save & Test" : null}
          onTertiaryAction={activeTab === TABS.TEST ? handleTestAction : null}
          tertiaryActionDisabled={isTestProcessing}
          tertiaryActionLoading={isTestProcessing}
          onSaveAndClose={activeTab === TABS.TEST ? handleSaveAndCloseAction : null}
          saveAndCloseLabel="Save & Close"
          showEditTitle={true}
          onTitleChange={handleTitleChange}
          theme={THEME}
          footerContent={
            <UnsavedChangesPrompt
              show={showUnsavedPrompt}
              onSave={handleSaveAndClose}
              onDiscard={handleDiscardAndClose}
              onCancel={handleCancelClose}
            />
          }
        >
          {renderTabContent()}
        </WizardDrawer>
      </>
    );
  }
);

AgentComposerV3.displayName = "AgentComposerV3";

export default AgentComposerV3;
