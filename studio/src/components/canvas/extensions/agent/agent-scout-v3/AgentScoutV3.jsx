import React, { forwardRef, useImperativeHandle, useRef, useState, useCallback, useMemo } from "react";
import { SlidersHorizontal, Settings, Play } from "lucide-react";
import WizardDrawer from "@src/module/drawer/WizardDrawer";
import CommonTestModuleV3 from "../../common-components/CommonTestModuleV3";
import UnsavedChangesPrompt from "../../common-components/UnsavedChangesPrompt";
import { AGENT_SCOUT_V3_NODE, TABS, THEME } from "./constants";
import { useScoutState } from "./hooks/useScoutState";
import InitialiseTab from "./components/InitialiseTab";
import ConfigureTab from "./components/ConfigureTab";
import { getWorkflowPreferences } from "@src/hooks/useWorkflowPreferences";

const AgentScoutV3 = forwardRef(
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
    const state = useScoutState(data);
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
      state.applySelectedTemplate(templateId);
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
        if (state.selectedTemplateId) {
          state.applySelectedTemplate();
          setActiveTab(TABS.CONFIGURE);
        } else if (state.isFromScratch) {
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

    const handleTestComplete = useCallback((output_schema) => {
      if (output_schema && output_schema.length > 0) {
        state.updateOutputSchema(output_schema);
      }
    }, [state]);

    const handleNameChange = useCallback((newName) => {
      state.setName(newName);
      onUpdateTitle({ name: newName });
    }, [state, onUpdateTitle]);

    const tabs = [
      { id: TABS.INITIALISE, label: "Initialise", icon: SlidersHorizontal },
      { id: TABS.CONFIGURE, label: "Configure", icon: Settings },
      { id: TABS.TEST, label: "Test", icon: Play },
    ];

    const getPrimaryActionLabel = () => {
      if (activeTab === TABS.INITIALISE) return "Continue";
      if (activeTab === TABS.CONFIGURE) return "Test Scout";
      return "Save & Close";
    };

    const getPrimaryDisabled = () => {
      if (activeTab === TABS.INITIALISE) {
        return !state.selectedTemplateId && !state.isFromScratch;
      }
      if (activeTab === TABS.CONFIGURE) return false;
      return false;
    };

    const getFooterGuidance = () => {
      if (activeTab === TABS.INITIALISE) {
        if (!state.selectedTemplateId && !state.isFromScratch) {
          return "Select a template or start from scratch to begin";
        }
        return "Click Continue to configure your research parameters";
      }
      if (activeTab === TABS.CONFIGURE) {
        const touchedErrors = state.validation.touchedErrors || {};
        const hasTouchedErrors = Object.keys(touchedErrors).length > 0;
        
        if (hasTouchedErrors) {
          if (touchedErrors.yourCompanyName) return touchedErrors.yourCompanyName;
          if (touchedErrors.yourCompanyDescription) return touchedErrors.yourCompanyDescription;
          if (touchedErrors.yourCompanyIndustry) return touchedErrors.yourCompanyIndustry;
          if (touchedErrors.targetCompanyName) return touchedErrors.targetCompanyName;
          if (touchedErrors.researchFocus) return touchedErrors.researchFocus;
          return "Fill in all required fields to continue";
        }
        return "Configure your research parameters, then test the scout";
      }
      if (activeTab === TABS.TEST) {
        return "Run a test to validate the research results before saving";
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
              node={nodeData || AGENT_SCOUT_V3_NODE}
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
          icon={
            <img
              src={AGENT_SCOUT_V3_NODE._src}
              alt="Tiny Scout"
              className="w-5 h-5"
            />
          }
          title={data.name || state.name || "Tiny Scout"}
          subtitle="AI-powered prospect research"
          tabs={tabs}
          activeTab={activeTab}
          onTabChange={handleTabChange}
          onClose={handleClose}
          footerVariant={activeTab === TABS.TEST ? "test" : "default"}
          primaryActionLabel={getPrimaryActionLabel()}
          primaryActionDisabled={getPrimaryDisabled()}
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
          theme={THEME}
          showEditTitle={true}
          onTitleChange={(newTitle) => {
            handleNameChange(newTitle);
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

AgentScoutV3.displayName = "AgentScoutV3";

export default AgentScoutV3;
