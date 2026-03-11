import React, {
  forwardRef,
  useImperativeHandle,
  useRef,
  useState,
  useCallback,
  useMemo,
} from "react";
import { Mail, Settings, Play } from "lucide-react";
import WizardDrawer from "@src/module/drawer/WizardDrawer";
import CommonTestModuleV3 from "../common-components/CommonTestModuleV3";
import UnsavedChangesPrompt from "../common-components/UnsavedChangesPrompt";
import { SEND_EMAIL_TO_YOURSELF_V2_NODE, TABS, THEME } from "./constants";
import { useSendEmailState } from "./hooks/useSendEmailState";
import { getWorkflowPreferences } from "@src/hooks/useWorkflowPreferences";
import InitialiseTab from "./components/InitialiseTab";
import ConfigureTab from "./components/ConfigureTab";

const SendEmailToYourselfV2 = forwardRef(
  (
    {
      canvasRef,
      annotation,
      data = {},
      variables,
      onSave = () => {},
      onClose = () => {},
      onUpdateTitle,
      open = true,
      nodeData,
      workspaceId,
      assetId,
      projectId,
      parentId,
    },
    ref,
  ) => {
    const testModuleRef = useRef(null);
    const drawerRef = useRef(null);
    const initialDataRef = useRef(JSON.stringify(data));

    const [activeTab, setActiveTab] = useState(
      data._templateId || data._isFromScratch || data.subject
        ? TABS.CONFIGURE
        : TABS.INITIALISE,
    );
    const [showUnsavedPrompt, setShowUnsavedPrompt] = useState(false);
    const [isTestProcessing, setIsTestProcessing] = useState(false);

    const state = useSendEmailState(data);

    useImperativeHandle(
      ref,
      () => ({
        getData: state.getData,
        getError: state.getError,
      }),
      [state.getData, state.getError],
    );

    const hasUnsavedChanges = useMemo(() => {
      const currentData = JSON.stringify(state.getData());
      return currentData !== initialDataRef.current;
    }, [state.getData]);

    const handleClose = useCallback(
      (event, reason) => {
        const { autoSaveOnClose } = getWorkflowPreferences();
        if (hasUnsavedChanges && !autoSaveOnClose) {
          setShowUnsavedPrompt(true);
        } else if (hasUnsavedChanges && autoSaveOnClose) {
          const data = state.getData();
          onSave(data, {}, false);
          initialDataRef.current = JSON.stringify(data);
          onClose();
        } else {
          onClose();
        }
      },
      [hasUnsavedChanges, onSave, onClose, state],
    );

    const handleSaveAndClose = useCallback(() => {
      const data = state.getData();
      onSave(data, {}, false);
      initialDataRef.current = JSON.stringify(data);
      setShowUnsavedPrompt(false);
      onClose();
    }, [onSave, onClose, state]);

    const handleDiscardAndClose = useCallback(() => {
      setShowUnsavedPrompt(false);
      onClose();
    }, [onClose]);

    const handleCancelClose = useCallback(() => {
      setShowUnsavedPrompt(false);
    }, []);

    const handleTabChange = useCallback(
      (newTab) => {
        if (newTab === TABS.CONFIGURE && !state.hasInitialised) {
          return;
        }
        if (newTab === TABS.TEST && !state.validation.isValid) {
          state.markAllTouched();
          return;
        }
        setActiveTab(newTab);
      },
      [state],
    );

    const handleTemplateSelect = useCallback(
      (templateId) => {
        state.applySelectedTemplate(templateId);
        setActiveTab(TABS.CONFIGURE);
      },
      [state],
    );

    const handleStartFromScratch = useCallback(() => {
      state.startFromScratch();
      setActiveTab(TABS.CONFIGURE);
    }, [state]);

    const handleEditTemplate = useCallback(() => {
      setActiveTab(TABS.INITIALISE);
    }, []);

    const handlePrimaryAction = useCallback(() => {
      if (activeTab === TABS.INITIALISE) {
        if (state.hasInitialised) {
          setActiveTab(TABS.CONFIGURE);
        }
      } else if (activeTab === TABS.CONFIGURE) {
        if (!state.validation.isValid) {
          state.markAllTouched();
          return;
        }
        setActiveTab(TABS.TEST);
      } else if (activeTab === TABS.TEST) {
        const data = state.getData();
        onSave(data, {}, false);
        initialDataRef.current = JSON.stringify(data);
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

    const handleTestComplete = useCallback(
      (output_schema) => {
        state.updateOutputSchema(output_schema);
        setIsTestProcessing(false);
      },
      [state],
    );

    const handleNameChange = useCallback(
      (newName) => {
        state.setName(newName);
        onUpdateTitle?.(newName);
      },
      [state, onUpdateTitle],
    );

    const getPrimaryActionLabel = useCallback(() => {
      if (activeTab === TABS.INITIALISE) return "Continue";
      if (activeTab === TABS.CONFIGURE) return "Test Email";
      return "Save & Close";
    }, [activeTab]);

    const getFooterGuidance = useCallback(() => {
      if (activeTab === TABS.INITIALISE) {
        return state.hasInitialised
          ? "Template selected. Click Continue to configure."
          : "Select a template or start from scratch.";
      }
      if (activeTab === TABS.CONFIGURE) {
        return state.validation.isValid
          ? "Configuration complete. Click Test Email to proceed."
          : "Fill in the required subject field.";
      }
      return "Run a test to verify your email notification.";
    }, [activeTab, state]);

    const getPrimaryDisabled = useCallback(() => {
      if (activeTab === TABS.INITIALISE) return !state.hasInitialised;
      if (activeTab === TABS.CONFIGURE) return !state.validation.isValid;
      return isTestProcessing;
    }, [
      activeTab,
      state.hasInitialised,
      state.validation.isValid,
      isTestProcessing,
    ]);

    const handleTestAction = useCallback(() => {
      testModuleRef.current?.beginTest();
    }, []);

    const handleSaveAndCloseAction = useCallback(() => {
      const data = state.getData();
      onSave(data, {}, false);
      initialDataRef.current = JSON.stringify(data);
      onClose();
    }, [onSave, onClose, state]);

    const tabs = [
      { id: TABS.INITIALISE, label: "Initialise", icon: Mail },
      { id: TABS.CONFIGURE, label: "Configure", icon: Settings },
      { id: TABS.TEST, label: "Test", icon: Play },
    ];

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
              node={nodeData || SEND_EMAIL_TO_YOURSELF_V2_NODE}
              onTestComplete={handleTestComplete}
              onTestStart={() => setIsTestProcessing(true)}
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
        icon={<Mail className="w-5 h-5" />}
        title={state.name || "Send Email to Yourself"}
        subtitle="Send quick notification emails to yourself"
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
        showEditTitle={true}
        onTitleChange={(newTitle) => {
          state.setName(newTitle);
          onUpdateTitle?.(newTitle);
        }}
      >
        {renderContent()}
      </WizardDrawer>
    );
  },
);

SendEmailToYourselfV2.displayName = "SendEmailToYourselfV2";

export default SendEmailToYourselfV2;
