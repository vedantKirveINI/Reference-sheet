import React, {
  forwardRef,
  useImperativeHandle,
  useState,
  useCallback,
  useRef,
  useEffect,
  useMemo,
} from "react";
import { Globe, Rocket, Settings, Play, Copy, CheckCircle } from "lucide-react";
import WizardDrawer from "@src/module/drawer/WizardDrawer";
import CommonTestModuleV3 from "../common-components/CommonTestModuleV3";
import UnsavedChangesPrompt from "../common-components/UnsavedChangesPrompt";
import { HTTP_NODE, THEME, TABS } from "./constants";
import { useHttpState } from "./hooks/useHttpState";
import InitialiseTab from "./components/InitialiseTab";
import ConfigureTab from "./components/ConfigureTab";
import { getWorkflowPreferences } from "@src/hooks/useWorkflowPreferences";

const Http = forwardRef(
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
      onGuidedTabChange,
    },
    ref,
  ) => {
    console.log("[Http] DATA:", data);
    const testModuleRef = useRef();
    const drawerRef = useRef();
    const state = useHttpState(data);
    const hasPersistedInit = Boolean(
      data?._isFromScratch ||
      data?._templateId ||
      data?.url?.blocks?.length > 0 ||
      data?.url?.text ||
      (data?.method && data?.method !== "GET") ||
      data?.headers?.length > 0 ||
      data?.query_params?.length > 0 ||
      (data?.body?.type && data?.body?.type !== "none") ||
      (data?.authorization?.type && data?.authorization?.type !== "none"),
    );
    const initialTab = hasPersistedInit && state.hasInitialised
      ? TABS.CONFIGURE
      : TABS.INITIALISE;
    const [activeTab, setActiveTabRaw] = useState(initialTab);
    const setActiveTab = useCallback((tabId) => {
      setActiveTabRaw(tabId);
      onGuidedTabChange?.(tabId);
    }, [onGuidedTabChange]);

    useEffect(() => {
      onGuidedTabChange?.(initialTab);
    }, []);
    const [isTestProcessing, setIsTestProcessing] = useState(false);
    const [hasTestCompleted, setHasTestCompleted] = useState(false);
    const [showUnsavedPrompt, setShowUnsavedPrompt] = useState(false);
    const initialDataRef = useRef(JSON.stringify(data));

    const HTTP_CONTEXTUAL_CONTENT = {
      title: "Test Your HTTP Request",
      description:
        "Send a test request to validate your API configuration and see the response data.",
      tips: [
        "Ensure your URL is correct and accessible",
        "Check headers and authentication if required",
        "Review the response to map output data",
      ],
      icon: Globe,
    };

    const HTTP_TEST_PRESETS = [
      {
        id: "empty",
        label: "Empty Request",
        description: "Send request with no body",
        values: {},
        icon: <CheckCircle className="w-4 h-4 text-green-500" />,
      },
      {
        id: "sample_json",
        label: "Sample JSON Body",
        description: "Typical JSON payload",
        values: { body: '{"name": "Test", "value": 123}' },
        icon: <Globe className="w-4 h-4 text-blue-500" />,
      },
    ];

    const HTTP_RESULT_ACTIONS = [
      {
        id: "copy_response",
        label: "Copy Response",
        icon: <Copy className="w-3.5 h-3.5" />,
        onClick: (result) => {
          if (result?.outputs) {
            navigator.clipboard.writeText(
              JSON.stringify(result.outputs, null, 2),
            );
          }
        },
      },
    ];

    const validateHttpRequest = useCallback(
      (values) => {
        if (state.validation && !state.validation.hasUrl) {
          return { valid: false, errors: ["URL is required to run test"] };
        }
        return { valid: true };
      },
      [state.validation],
    );

    useImperativeHandle(
      ref,
      () => ({
        getData: state.getData,
        getError: state.getError,
      }),
      [state.getData, state.getError],
    );

    const saveHandler = useCallback(
      (openNodeAfterCreate = true) => {
        const httpData = ref.current?.getData?.() || {};
        const error = ref.current?.getError?.() || {};
        const errors = Object.values(error).flat();
        onSave(
          httpData,
          {
            errors: errors.length > 0 ? errors : undefined,
          },
          openNodeAfterCreate,
        );
      },
      [onSave, ref],
    );

    const hasUnsavedChanges = useMemo(() => {
      const currentData = state.getData();
      return JSON.stringify(currentData) !== initialDataRef.current;
    }, [state]);

    const handleClose = useCallback(
      (event, reason) => {
        const prefs = getWorkflowPreferences();

        if (hasUnsavedChanges) {
          if (prefs.autoSaveOnClose) {
            const httpData = ref.current?.getData?.() || {};
            const error = ref.current?.getError?.() || {};
            const errors = Object.values(error).flat();
            onSave(
              httpData,
              {
                errors: errors.length > 0 ? errors : undefined,
              },
              false,
            );
            initialDataRef.current = JSON.stringify(httpData);
            onClose();
          } else {
            setShowUnsavedPrompt(true);
          }
        } else {
          onClose();
        }
      },
      [hasUnsavedChanges, onSave, onClose, ref],
    );

    const handleSaveAndClose = useCallback(() => {
      setShowUnsavedPrompt(false);
      const httpData = ref.current?.getData?.() || {};
      const error = ref.current?.getError?.() || {};
      const errors = Object.values(error).flat();
      onSave(
        httpData,
        {
          errors: errors.length > 0 ? errors : undefined,
        },
        false,
      );
      initialDataRef.current = JSON.stringify(httpData);
      onClose();
    }, [onSave, onClose, ref]);

    const handleDiscardAndClose = useCallback(() => {
      setShowUnsavedPrompt(false);
      onClose();
    }, [onClose]);

    const handleCancelClose = useCallback(() => {
      setShowUnsavedPrompt(false);
    }, []);

    useEffect(() => {
      if (!data?.last_updated) {
        setTimeout(saveHandler, 100);
      }
    }, [data?.last_updated, saveHandler]);

    const handleTabChange = useCallback(
      (tabId) => {
        if (tabId === TABS.TEST && !state.validation.isValid) {
          return;
        }
        setActiveTab(tabId);
      },
      [state.validation.isValid],
    );

    const handlePrimaryAction = useCallback(() => {
      if (activeTab === TABS.INITIALISE) {
        if (state.hasInitialised) {
          setActiveTab(TABS.CONFIGURE);
        }
      } else if (activeTab === TABS.CONFIGURE) {
        if (state.validation.isValid) {
          setActiveTab(TABS.TEST);
        }
      } else if (activeTab === TABS.TEST) {
        const httpData = ref.current?.getData?.() || {};
        const error = ref.current?.getError?.() || {};
        const errors = Object.values(error).flat();
        onSave(
          httpData,
          {
            errors: errors.length > 0 ? errors : undefined,
          },
          false,
        );
        initialDataRef.current = JSON.stringify(httpData);
        onClose();
      }
    }, [
      activeTab,
      state.hasInitialised,
      state.validation.isValid,
      onSave,
      onClose,
      ref,
    ]);

    const handleSecondaryAction = useCallback(() => {
      if (activeTab === TABS.CONFIGURE) {
        setActiveTab(TABS.INITIALISE);
      } else if (activeTab === TABS.TEST) {
        setActiveTab(TABS.CONFIGURE);
      }
    }, [activeTab]);

    const handleTemplateSelect = useCallback(
      (templateId) => {
        state.selectTemplate(templateId);
        setActiveTab(TABS.CONFIGURE);
      },
      [state],
    );

    const handleStartFromScratch = useCallback(() => {
      state.startFromScratch();
      setActiveTab(TABS.CONFIGURE);
    }, [state]);

    const handleCurlImport = useCallback(
      (curlData) => {
        state.applyCurlData(curlData);
        setActiveTab(TABS.CONFIGURE);
      },
      [state],
    );

    const handleTestComplete = useCallback(
      (output_schema) => {
        state.setOutputSchema(output_schema);
        setHasTestCompleted(true);
      },
      [state],
    );

    const handleTestStart = useCallback(() => {
      setHasTestCompleted(false);
    }, []);

    const handleProcessingChange = useCallback((processing) => {
      setIsTestProcessing(processing);
    }, []);

    const handleTestAction = useCallback(() => {
      testModuleRef.current?.beginTest();
    }, []);

    const tabs = [
      { id: TABS.INITIALISE, label: "Initialise", icon: Rocket },
      { id: TABS.CONFIGURE, label: "Configure", icon: Settings },
      { id: TABS.TEST, label: "Test", icon: Play },
    ];

    const getPrimaryActionLabel = () => {
      if (activeTab === TABS.INITIALISE) return "Continue";
      if (activeTab === TABS.CONFIGURE) return "Test Request";
      return "Save & Close";
    };

    const getPrimaryDisabled = () => {
      if (activeTab === TABS.INITIALISE) return !state.hasInitialised;
      if (activeTab === TABS.CONFIGURE) return !state.validation.isValid;
      return false;
    };

    const getFooterGuidance = () => {
      if (activeTab === TABS.INITIALISE && !state.hasInitialised) {
        return "Select a template or start from scratch to continue";
      }
      if (activeTab === TABS.CONFIGURE && !state.validation.hasUrl) {
        return "Enter a URL to test the request";
      }
      return null;
    };

    const renderContent = () => {
      switch (activeTab) {
        case TABS.INITIALISE:
          return (
            <InitialiseTab
              selectedTemplateId={state._templateId}
              isFromScratch={state._isFromScratch}
              onSelectTemplate={handleTemplateSelect}
              onStartFromScratch={handleStartFromScratch}
              onCurlImport={handleCurlImport}
            />
          );
        case TABS.CONFIGURE:
          return <ConfigureTab state={state} variables={variables} />;
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
              node={nodeData || HTTP_NODE}
              onTestComplete={handleTestComplete}
              onProcessingChange={handleProcessingChange}
              onTestStart={handleTestStart}
              theme={THEME}
              contextualContent={HTTP_CONTEXTUAL_CONTENT}
              testPresets={HTTP_TEST_PRESETS}
              resultActions={HTTP_RESULT_ACTIONS}
              resultType="json"
              persistTestData={true}
              inputMode="auto"
              onValidateBeforeTest={validateHttpRequest}
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
        icon={<Globe className="w-5 h-5" />}
        title={data?.name || "HTTP Request"}
        subtitle="Make API calls to external services"
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
        footerGuidance={!showUnsavedPrompt ? getFooterGuidance() : null}
        tertiaryActionLabel={activeTab === TABS.TEST ? "Save & Test" : null}
        onTertiaryAction={activeTab === TABS.TEST ? handleTestAction : null}
        tertiaryActionDisabled={isTestProcessing}
        tertiaryActionLoading={isTestProcessing}
        onSaveAndClose={activeTab === TABS.TEST ? handlePrimaryAction : null}
        saveAndCloseLabel="Save & Close"
        footerContent={
          showUnsavedPrompt ? (
            <UnsavedChangesPrompt
              show={showUnsavedPrompt}
              onSave={handleSaveAndClose}
              onDiscard={handleDiscardAndClose}
              onCancel={handleCancelClose}
            />
          ) : null
        }
        theme={THEME}
        showEditTitle={true}
        onTitleChange={(newTitle) => {
          state.updateState({ name: newTitle });
          onUpdateTitle({ name: newTitle });
        }}
      >
        {renderContent()}
      </WizardDrawer>
    );
  },
);

Http.displayName = "Http";

export default Http;
