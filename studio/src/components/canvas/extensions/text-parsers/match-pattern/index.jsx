import React, {
  forwardRef,
  useImperativeHandle,
  useState,
  useCallback,
  useRef,
  useEffect,
  useMemo,
} from "react";
import WizardDrawer from "@src/module/drawer/WizardDrawer";
import CommonTestModuleV3 from "../../common-components/CommonTestModuleV3";
import UnsavedChangesPrompt from "../../common-components/UnsavedChangesPrompt";
import MATCH_PATTERN_NODE, { THEME, TABS } from "./constant";
import { useMatchPatternState } from "./hooks/useMatchPatternState";
import Configure from "./tabs/configure/Configure";
import { getWorkflowPreferences } from "@src/hooks/useWorkflowPreferences";
import { icons } from "@/components/icons";

const MATCH_PATTERN_CONTEXTUAL_CONTENT = {
  title: "Test Your Match Pattern",
  description:
    "Run a test to see how your regex pattern matches against the text. The result will show matches and captured groups.",
  tips: [
    "Ensure your pattern is a valid regular expression",
    "Use the Text field to provide sample input or variables",
    "Review the result to verify which branch will run in the workflow",
  ],
  icon: icons.braces,
};

const MATCH_PATTERN_TEST_PRESETS = [];

const MATCH_PATTERN_RESULT_ACTIONS = [
  {
    id: "copy_result",
    label: "Copy Result",
    icon: <icons.copy className="w-3.5 h-3.5" />,
    onClick: (result) => {
      if (result) {
        navigator.clipboard.writeText(JSON.stringify(result, null, 2));
      }
    },
  },
];

const MatchPatternDialog = forwardRef(
  (
    {
      canvasRef,
      annotation,
      data = {},
      variables = {},
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
    ref,
  ) => {
    const testModuleRef = useRef();
    const drawerRef = useRef();
    const state = useMatchPatternState(data);
    const [activeTab, setActiveTab] = useState(TABS.CONFIGURE);
    const [isTestProcessing, setIsTestProcessing] = useState(false);
    const [hasTestCompleted, setHasTestCompleted] = useState(false);
    const [showUnsavedPrompt, setShowUnsavedPrompt] = useState(false);
    const initialDataRef = useRef(JSON.stringify(data));

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
        const matchData = ref.current?.getData?.() || {};
        const error = ref.current?.getError?.() || {};
        const errors = error && typeof error === "object" ? Object.values(error).flat() : [];
        onSave(
          matchData,
          { errors: errors.length > 0 ? errors : undefined },
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
            const matchData = ref.current?.getData?.() || {};
            const error = ref.current?.getError?.() || {};
            const errors = error && typeof error === "object" ? Object.values(error).flat() : [];
            onSave(
              matchData,
              { errors: errors.length > 0 ? errors : undefined },
              false,
            );
            initialDataRef.current = JSON.stringify(matchData);
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
      const matchData = ref.current?.getData?.() || {};
      const error = ref.current?.getError?.() || {};
      const errors = error && typeof error === "object" ? Object.values(error).flat() : [];
      onSave(
        matchData,
        { errors: errors.length > 0 ? errors : undefined },
        false,
      );
      initialDataRef.current = JSON.stringify(matchData);
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
      if (activeTab === TABS.CONFIGURE) {
        if (state.validation.isValid) {
          setActiveTab(TABS.TEST);
        }
      } else if (activeTab === TABS.TEST) {
        const matchData = ref.current?.getData?.() || {};
        const error = ref.current?.getError?.() || {};
        const errors = error && typeof error === "object" ? Object.values(error).flat() : [];
        onSave(
          matchData,
          { errors: errors.length > 0 ? errors : undefined },
          false,
        );
        initialDataRef.current = JSON.stringify(matchData);
        onClose();
      }
    }, [activeTab, state.validation.isValid, onSave, onClose, ref]);

    const handleSecondaryAction = useCallback(() => {
      if (activeTab === TABS.TEST) {
        setActiveTab(TABS.CONFIGURE);
      }
    }, [activeTab]);

    const handleTestComplete = useCallback(() => {
      setHasTestCompleted(true);
    }, []);

    const handleTestStart = useCallback(() => {
      setHasTestCompleted(false);
    }, []);

    const handleProcessingChange = useCallback((processing) => {
      setIsTestProcessing(processing);
    }, []);

    const handleTestAction = useCallback(() => {
      testModuleRef.current?.beginTest();
    }, []);

    const validateMatchPattern = useCallback(
      () => {
        if (!state.validation.isValid) {
          return { valid: false, errors: ["Pattern is required to run test"] };
        }
        return { valid: true };
      },
      [state.validation.isValid],
    );

    const tabs = useMemo(
      () => [
        { id: TABS.CONFIGURE, label: "Configure", icon: icons.settings },
        { id: TABS.TEST, label: "Test", icon: icons.play },
      ],
      [],
    );

    const getPrimaryActionLabel = () => {
      if (activeTab === TABS.CONFIGURE) return "Test";
      return "Save & Close";
    };

    const getPrimaryDisabled = () => {
      if (activeTab === TABS.CONFIGURE) return !state.validation.isValid;
      return false;
    };

    const getFooterGuidance = () => {
      if (activeTab === TABS.CONFIGURE && !state.validation.hasPattern) {
        return "Enter a pattern to test";
      }
      return null;
    };

    const renderContent = () => {
      switch (activeTab) {
        case TABS.CONFIGURE:
          return (
            <Configure
              globalMatch={state.globalMatch}
              caseSensitive={state.caseSensitive}
              multiline={state.multiline}
              singleline={state.singleline}
              continueExecutionIfNoMatch={state.continueExecutionIfNoMatch}
              variables={variables}
              pattern={state.pattern}
              setPattern={state.setPattern}
              text={state.text}
              setText={state.setText}
              selectedTemplateId={state.selectedTemplateId}
              setSelectedTemplateId={state.setSelectedTemplateId}
              setGlobalMatch={state.setGlobalMatch}
              setCaseSensitive={state.setCaseSensitive}
              setMultiline={state.setMultiline}
              setSingleline={state.setSingleline}
              setContinueExecutionIfNoMatch={
                state.setContinueExecutionIfNoMatch
              }
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
              node={nodeData || MATCH_PATTERN_NODE}
              onTestComplete={handleTestComplete}
              onProcessingChange={handleProcessingChange}
              onTestStart={handleTestStart}
              theme={THEME}
              contextualContent={MATCH_PATTERN_CONTEXTUAL_CONTENT}
              testPresets={MATCH_PATTERN_TEST_PRESETS}
              resultActions={MATCH_PATTERN_RESULT_ACTIONS}
              resultType="json"
              persistTestData={true}
              inputMode="auto"
              onValidateBeforeTest={validateMatchPattern}
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
        icon={
          <span className="flex w-full h-full overflow-hidden items-center justify-center">
            <img
              src={nodeData?._src || MATCH_PATTERN_NODE._src}
              alt=""
              className="max-w-full max-h-full w-full h-full object-contain"
            />
          </span>
        }
        title={nodeData?.name || data?.name || MATCH_PATTERN_NODE.name}
        subtitle="Route your workflow based on regex matches"
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
        footerGuidance={!showUnsavedPrompt ? getFooterGuidance() : null}
        tertiaryActionLabel={activeTab === TABS.TEST ? "Save & Test" : null}
        onTertiaryAction={activeTab === TABS.TEST ? handleTestAction : null}
        tertiaryActionDisabled={isTestProcessing}
        tertiaryActionLoading={isTestProcessing}
        onSaveAndClose={activeTab === TABS.TEST ? handlePrimaryAction : null}
        saveAndCloseLabel="Save & Close"
        contentClassName="p-0"
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
          onUpdateTitle({ name: newTitle });
        }}
      >
        <div className="w-full h-full box-border">
          {renderContent()}
        </div>
      </WizardDrawer>
    );
  },
);

MatchPatternDialog.displayName = "MatchPatternDialog";

export default MatchPatternDialog;
