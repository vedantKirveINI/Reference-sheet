import React, { forwardRef, useImperativeHandle, useState, useCallback, useRef, useMemo } from "react";
import { UserCheck, Settings, Play, Sparkles } from "lucide-react";
import WizardDrawer from "@src/module/drawer/WizardDrawer";
import CommonTestModuleV3 from "../common-components/CommonTestModuleV3";
import UnsavedChangesPrompt from "../common-components/UnsavedChangesPrompt";
import { icons } from "@/components/icons";
import { HITL_V2_NODE, THEME, TABS } from "./constants";
import { useHitlState } from "./hooks/useHitlState";
import ConfigureTab from "./components/ConfigureTab";
import InitialiseTab from "./components/InitialiseTab";
import { getWorkflowPreferences } from "@src/hooks/useWorkflowPreferences";

const HITLV2 = forwardRef(
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
    const state = useHitlState(data);
    // Check if template_type is set (legacy way) or if there's existing data
    const hasExistingData = data && (
      data.template_type || 
      data.title?.blocks?.length > 0 || 
      data.instructions?.blocks?.length > 0 ||
      data._templateId
    );
    const [activeTab, setActiveTab] = useState(hasExistingData ? TABS.CONFIGURE : TABS.INITIALISE);
    const [isTestProcessing, setIsTestProcessing] = useState(false);
    const [hasTestCompleted, setHasTestCompleted] = useState(false);
    const [showUnsavedPrompt, setShowUnsavedPrompt] = useState(false);
    const initialDataRef = useRef(JSON.stringify(data));

    const hasUnsavedChanges = useMemo(() => {
      return JSON.stringify(state.getData()) !== initialDataRef.current;
    }, [state]);

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

    const handleSaveAndClose = useCallback(() => {
      setShowUnsavedPrompt(false);
      const saveData = state.getData();
      onSave(saveData, { errors: state.getError() }, false);
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

    const HITL_CONTEXTUAL_CONTENT = {
      title: "Test Human-in-the-Loop",
      description: "Simulate the approval workflow to see how the pause point works in your automation.",
      tips: [
        "The workflow will pause at this node during execution",
        "An assignee will receive a notification to take action",
        "Test to verify the approval flow before going live"
      ],
      icon: UserCheck
    };

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
      // Can only go to CONFIGURE if template_type is selected (legacy behavior)
      if (tabId === TABS.CONFIGURE && activeTab === TABS.INITIALISE && !state.templateType) {
        return;
      }
      setActiveTab(tabId);
    }, [state.validation.isValid, state.templateType, activeTab]);

    const handlePrimaryAction = useCallback(() => {
      if (activeTab === TABS.INITIALISE) {
        // Only allow proceeding if template_type is selected
        if (state.templateType) {
          setActiveTab(TABS.CONFIGURE);
        }
      } else if (activeTab === TABS.CONFIGURE) {
        if (state.validation.isValid) {
          setActiveTab(TABS.TEST);
        }
      } else if (activeTab === TABS.TEST) {
        const saveData = state.getData();
        onSave(saveData, { errors: state.getError() }, true);
        initialDataRef.current = JSON.stringify(saveData);
      }
    }, [activeTab, state.validation.isValid, state.templateType, onSave, state]);

    const handleSecondaryAction = useCallback(() => {
      if (activeTab === TABS.TEST) {
        setActiveTab(TABS.CONFIGURE);
      } else if (activeTab === TABS.CONFIGURE) {
        setActiveTab(TABS.INITIALISE);
      }
    }, [activeTab]);

    const handleTestComplete = useCallback((output_schema) => {
      state.setOutputSchema(output_schema);
      setHasTestCompleted(true);
    }, [state]);

    const handleTestStart = useCallback(() => {
      setHasTestCompleted(false);
    }, []);

    const handleProcessingChange = useCallback((processing) => {
      setIsTestProcessing(processing);
    }, []);

    const handleTestAction = useCallback(() => {
      testModuleRef.current?.beginTest();
    }, []);

    const handleSaveAndCloseAction = useCallback(() => {
      const saveData = state.getData();
      onSave(saveData, { errors: state.getError() }, false);
      initialDataRef.current = JSON.stringify(saveData);
      onClose();
    }, [onSave, onClose, state]);

    const tabs = [
      { id: TABS.INITIALISE, label: "Get Started", icon: Sparkles },
      { id: TABS.CONFIGURE, label: "Configure", icon: Settings },
      { id: TABS.TEST, label: "Test", icon: Play },
    ];

    const getPrimaryActionLabel = () => {
      if (activeTab === TABS.INITIALISE) return "Continue";
      if (activeTab === TABS.CONFIGURE) return "Test";
      return "Save & Close";
    };

    const getPrimaryDisabled = () => {
      if (activeTab === TABS.INITIALISE) return !state.templateType;
      if (activeTab === TABS.CONFIGURE) return !state.validation.isValid;
      return false;
    };

    const hasConfigureErrors = activeTab === TABS.CONFIGURE && !state.validation.isValid && state.validation.errors?.length > 0;
    const hasInitialiseError = activeTab === TABS.INITIALISE && !state.templateType && state.validation.errors?.length > 0;
    const footerErrorMessages = hasConfigureErrors
      ? state.validation.errors[0]
      : hasInitialiseError
        ? "Please select a template type to continue"
        : null;
    const footerErrorBlock = footerErrorMessages && (
      <div
        className="inline-flex items-center gap-2 px-3 py-2 bg-red-50 border border-red-200 rounded-lg max-w-[320px] flex-shrink-0"
        data-testid="hitl-footer-error"
      >
        {icons.alertTriangle && (() => {
          const Icon = icons.alertTriangle;
          return <Icon className="w-4 h-4 text-red-600 flex-shrink-0" />;
        })()}
        <span className="text-sm font-semibold text-red-600 min-w-0 break-words">
          {footerErrorMessages}
        </span>
      </div>
    );

    const renderContent = () => {
      switch (activeTab) {
        case TABS.INITIALISE:
          return (
            <InitialiseTab
              templateType={state.templateType}
              onTemplateTypeChange={(value) => {
                state.handleTemplateTypeChange(value);
              }}
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
              node={nodeData || HITL_V2_NODE}
              onTestComplete={handleTestComplete}
              onProcessingChange={handleProcessingChange}
              onTestStart={handleTestStart}
              theme={THEME}
              contextualContent={HITL_CONTEXTUAL_CONTENT}
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
        icon={<UserCheck className="w-5 h-5" />}
        title={state.name || "Human-in-the-Loop"}
        subtitle="Pause workflow for human input or approval"
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
        footerVariant={activeTab === TABS.TEST ? "test" : "default"}
        tertiaryActionLabel={activeTab === TABS.TEST ? "Save & Test" : null}
        onTertiaryAction={activeTab === TABS.TEST ? handleTestAction : null}
        tertiaryActionDisabled={isTestProcessing}
        tertiaryActionLoading={isTestProcessing}
        onSaveAndClose={activeTab === TABS.TEST ? handleSaveAndCloseAction : null}
        saveAndCloseLabel="Save & Close"
        theme={THEME}
        showEditTitle={true}
        onTitleChange={(newTitle) => { state.updateState({ name: newTitle }); onUpdateTitle({ name: newTitle }); }}
        footerContent={
          <div className="flex flex-1 items-center justify-end min-w-0 gap-3 mr-4">
            {footerErrorBlock}
            <UnsavedChangesPrompt
              show={showUnsavedPrompt}
              onSave={handleSaveAndClose}
              onDiscard={handleDiscardAndClose}
              onCancel={handleCancelClose}
            />
          </div>
        }
      >
        {renderContent()}
      </WizardDrawer>
    );
  }
);

HITLV2.displayName = "HITLV2";

export default HITLV2;
