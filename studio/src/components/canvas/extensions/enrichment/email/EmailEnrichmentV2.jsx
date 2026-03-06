import React, { forwardRef, useImperativeHandle, useRef, useState, useCallback, useMemo, useEffect } from "react";
import { AtSign, SlidersHorizontal, Settings, Play } from "lucide-react";
import WizardDrawer from "@src/module/drawer/WizardDrawer";
import CommonTestModuleV3 from "../../common-components/CommonTestModuleV3";
import UnsavedChangesPrompt from "../../common-components/UnsavedChangesPrompt";
import { EMAIL_ENRICHMENT_V2_NODE, TABS, THEME } from "./constants";
import { useEmailEnrichmentState } from "./hooks/useEmailEnrichmentState";
import InitialiseTab from "./components/InitialiseTab";
import ConfigureTab from "./components/ConfigureTab";
import { getWorkflowPreferences } from "@src/hooks/useWorkflowPreferences";

const EmailEnrichmentV2 = forwardRef(
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
    const state = useEmailEnrichmentState(data);
    const [showUnsavedPrompt, setShowUnsavedPrompt] = useState(false);
    const [isTestProcessing, setIsTestProcessing] = useState(false);
    const initialDataRef = useRef(JSON.stringify(data));

    const isExistingNode = Boolean(data.domain || data._hasViewedInfo);

    const [activeTab, setActiveTab] = useState(
      isExistingNode ? TABS.CONFIGURE : TABS.INITIALISE
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

    const saveHandler = useCallback(() => {
      const saveData = state.getData();
      onSave(saveData, {}, true);
    }, [onSave, state]);

    useEffect(() => {
      if (!data?.last_updated) {
        setTimeout(saveHandler, 100);
      }
    }, [data?.last_updated, saveHandler]);

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
        if (tabId === TABS.TEST && !state.validation.isValid) {
          return;
        }
        setActiveTab(tabId);
      },
      [state.validation.isValid]
    );

    const handlePrimaryAction = useCallback(() => {
      if (activeTab === TABS.INITIALISE) {
        state.markAsViewedInfo();
        setActiveTab(TABS.CONFIGURE);
        return;
      }
      if (activeTab === TABS.CONFIGURE) {
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
      if (output_schema) {
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
      if (activeTab === TABS.CONFIGURE) return "Test Enrichment";
      return "Save & Close";
    };

    const getPrimaryDisabled = () => {
      return false;
    };

    const getFooterGuidance = () => {
      if (activeTab === TABS.INITIALISE) {
        return "Review the information above, then click Continue to configure";
      }
      if (activeTab === TABS.CONFIGURE) {
        const touchedErrors = state.validation.touchedErrors || {};
        const hasTouchedErrors = Object.keys(touchedErrors).length > 0;
        
        if (hasTouchedErrors) {
          if (touchedErrors.domain) return touchedErrors.domain;
          if (touchedErrors.fullName) return touchedErrors.fullName;
          return "Fill in all required fields to continue";
        }
        return "Enter company domain and person's name, then test the enrichment";
      }
      if (activeTab === TABS.TEST) {
        return "Run a test to validate the enrichment before saving";
      }
      return null;
    };

    const renderContent = () => {
      switch (activeTab) {
        case TABS.INITIALISE:
          return <InitialiseTab />;
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
              node={nodeData || EMAIL_ENRICHMENT_V2_NODE}
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
          icon={<AtSign className="w-5 h-5" />}
          title={data.name || state.name || "Email Enrichment"}
          subtitle="Find email addresses using name and company domain"
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
          showEditTitle={true}
          onTitleChange={handleNameChange}
          theme={THEME}
          footerGuidance={getFooterGuidance()}
          footerVariant={activeTab === TABS.TEST ? "test" : "default"}
          tertiaryActionLabel={activeTab === TABS.TEST ? "Save & Test" : null}
          onTertiaryAction={activeTab === TABS.TEST ? handleTestAction : null}
          tertiaryActionLoading={isTestProcessing}
          onSaveAndClose={activeTab === TABS.TEST ? handleSaveAndCloseAction : null}
          saveAndCloseLabel="Save & Close"
        >
          {renderContent()}
        </WizardDrawer>

        <UnsavedChangesPrompt
          show={showUnsavedPrompt}
          onSave={handleSaveAndClose}
          onDiscard={handleDiscardAndClose}
          onCancel={handleCancelClose}
        />
      </>
    );
  }
);

EmailEnrichmentV2.displayName = "EmailEnrichmentV2";

export default EmailEnrichmentV2;
