import React, {
  forwardRef,
  useImperativeHandle,
  useState,
  useCallback,
  useRef,
} from "react";
import { Settings, Play } from "lucide-react";
import WizardDrawer from "@src/module/drawer/WizardDrawer";
import CommonTestModuleV3 from "../common-components/CommonTestModuleV3";
import { LOOP_END_NODE, THEME as DEFAULT_THEME, TABS } from "./constants";
import { useLoopEndState } from "./hooks/useLoopEndState";
import ConfigureTab from "./components/ConfigureTab";

const LoopEnd = forwardRef(
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
    ref,
  ) => {
    console.log("nodeData loop end", nodeData);

    const testModuleRef = useRef();
    const drawerRef = useRef();
    const state = useLoopEndState(data);
    const [activeTab, setActiveTab] = useState(TABS.CONFIGURE);

    const dynamicTheme = React.useMemo(() => {
      const color = nodeData?.dark || nodeData?.background;
      if (!color || color === DEFAULT_THEME.primaryButtonBg)
        return DEFAULT_THEME;
      return {
        primaryButtonBg: color,
        primaryButtonText: "#ffffff",
        iconBg: `${color}14`,
        iconBorder: `${color}26`,
        iconColor: nodeData?.background || color,
      };
    }, [nodeData?.dark, nodeData?.background]);

    const getGoDataWithPairing = useCallback(
      () => ({
        ...state.getData(),
        pairedNodeKey: nodeData?.pairedNodeKey,
        loopPairId: nodeData?.loopPairId,
      }),
      [state, nodeData],
    );

    useImperativeHandle(
      ref,
      () => ({
        getData: state.getData,
        getError: state.getError,
      }),
      [state],
    );

    const handleTabChange = useCallback((tabId) => {
      setActiveTab(tabId);
    }, []);

    const handlePrimaryAction = useCallback(() => {
      if (activeTab === TABS.CONFIGURE) {
        if (state.validation.isValid) {
          setActiveTab(TABS.TEST);
          setTimeout(() => {
            testModuleRef.current?.beginTest();
          }, 100);
        }
      } else if (activeTab === TABS.TEST) {
        onSave(getGoDataWithPairing(), {}, false);
      }
    }, [activeTab, state.validation.isValid, onSave, getGoDataWithPairing]);

    const handleSecondaryAction = useCallback(() => {
      if (activeTab === TABS.TEST) {
        setActiveTab(TABS.CONFIGURE);
      }
    }, [activeTab]);

    const handleTestAction = useCallback(() => {
      testModuleRef.current?.beginTest();
    }, []);

    const handleConfigureTestAction = useCallback(() => {
      if (activeTab === TABS.CONFIGURE) {
        setActiveTab(TABS.TEST);
        setTimeout(() => {
          testModuleRef.current?.beginTest();
        }, 100);
      }
    }, [activeTab]);

    const handleSaveAndCloseAction = useCallback(() => {
      onSave(getGoDataWithPairing(), {}, false);
      onClose();
    }, [onSave, onClose, getGoDataWithPairing]);

    const handleTestComplete = useCallback(
      (output_schema) => {
        state.setOutputSchema(output_schema);
      },
      [state],
    );

    const tabs = [
      { id: TABS.CONFIGURE, label: "Configure", icon: Settings },
      { id: TABS.TEST, label: "Test", icon: Play },
    ];

    const getPrimaryActionLabel = () => {
      if (activeTab === TABS.CONFIGURE) return "Test";
      return "Save & Close";
    };

    const getPrimaryDisabled = () => {
      if (activeTab === TABS.CONFIGURE) return !state.validation.isValid;
      return false;
    };

    const getFooterGuidance = () => {
      if (activeTab === TABS.CONFIGURE && !state.source) {
        return "This Loop End will be paired with its Loop Start automatically";
      }
      if (activeTab === TABS.TEST) {
        return "Run a test to see the collected results";
      }
      return null;
    };

    const renderContent = () => {
      switch (activeTab) {
        case TABS.CONFIGURE:
          return (
            <ConfigureTab
              state={state}
              variables={variables}
              nodeData={nodeData}
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
              node={nodeData || LOOP_END_NODE}
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
        icon={
          <img
            src={LOOP_END_NODE._src}
            alt={nodeData?.name || "Loop End"}
            className="w-5 h-5"
          />
        }
        title={state.name || "Loop End"}
        subtitle={
          nodeData?.description || "Collect results from each loop cycle"
        }
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={handleTabChange}
        onClose={onClose}
        footerVariant="test"
        primaryActionLabel={getPrimaryActionLabel()}
        primaryActionDisabled={getPrimaryDisabled()}
        onPrimaryAction={activeTab !== TABS.TEST ? handlePrimaryAction : null}
        secondaryActionLabel="Back"
        showSecondaryAction={activeTab === TABS.TEST}
        onSecondaryAction={handleSecondaryAction}
        footerGuidance={getFooterGuidance()}
        tertiaryActionLabel={
          activeTab === TABS.CONFIGURE ? "Test" : "Save & Test"
        }
        onTertiaryAction={
          activeTab === TABS.CONFIGURE
            ? handleConfigureTestAction
            : activeTab === TABS.TEST
              ? handleTestAction
              : null
        }
        tertiaryActionDisabled={false}
        onSaveAndClose={handleSaveAndCloseAction}
        saveAndCloseLabel="Save & Close"
        theme={dynamicTheme}
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

LoopEnd.displayName = "LoopEnd";

export default LoopEnd;
