import React, {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";
import { GitBranch, Settings, Play, Copy, CheckCircle } from "lucide-react";
import WizardDrawer from "@src/module/drawer/WizardDrawer";
import { getNodeSrc } from "../extension-utils";
import { cloneDeep } from "lodash";
import { IF_ELSE_NODE_V2, THEME, TABS } from "./constants";
import { INTEGRATION_TYPE } from "../constants/types";
import { useIfElseV2State } from "./hooks/useIfElseV2State";
import ConfigureTab from "./components/ConfigureTab";
import CommonTestModuleV3 from "../common-components/CommonTestModuleV3";
import { END_NODE } from "../end-v3/constants";

const IF_ELSE_CONTEXTUAL_CONTENT = {
  title: "Test Your Conditions",
  description:
    "Run a test to evaluate your If-Else conditions against live data. The result will show which branch matched and the corresponding output.",
  tips: [
    "Ensure all condition variables have values in your workflow",
    "Check that operators and comparison values are correct",
    "Review which branch gets triggered in the result",
  ],
  icon: GitBranch,
};

const IF_ELSE_TEST_PRESETS = [
  {
    id: "default",
    label: "Current Values",
    description: "Test with current variable values from the workflow",
    values: {},
    icon: <CheckCircle className="w-4 h-4 text-green-500" />,
  },
];

const IF_ELSE_RESULT_ACTIONS = [
  {
    id: "copy_result",
    label: "Copy Result",
    icon: <Copy className="w-3.5 h-3.5" />,
    onClick: (result) => {
      if (result) {
        navigator.clipboard.writeText(JSON.stringify(result, null, 2));
      }
    },
  },
];

const IfElseV2 = forwardRef(
  (
    {
      canvasRef,
      annotation,
      data = {},
      variables = {},
      schema,
      onSave = () => { },
      onDiscard = () => { },
      onAddNode = () => { },
      onUpdateTitle = () => { },
      getNodes = () => Promise.resolve([]),
      nodeData,
      workspaceId,
      assetId,
      projectId,
      parentId,
      open = true,
      onClose = () => { },
      sidebarActions = [],
      onSidebarActionClick = () => { },
      onAddJumpTo = () => { },
      getDisabledNodes = () => [],
      linkedNodeDataRef = {},
      searchConfig = [],
      integrationThumbnailMap = {},
    },
    ref,
  ) => {
    const drawerRef = useRef();
    const configureTabRef = useRef();
    const testModuleRef = useRef();
    const pendingAddNodeContextRef = useRef(null);
    const currentSavedData = cloneDeep(data);
    const [availableNodes, setAvailableNodes] = useState([]);
    const [activeTab, setActiveTab] = useState(TABS.CONFIGURE);
    const [isTestProcessing, setIsTestProcessing] = useState(false);
    const [hasTestCompleted, setHasTestCompleted] = useState(false);

    const state = useIfElseV2State(data);

    const fetchAvailableNodes = useCallback(async () => {
      const connectableNodes = await getNodes({
        fetchConnectableNodes: true,
      });

      for (const node in connectableNodes) {
        let nodeDataItem = connectableNodes[node];
        if (
          nodeDataItem.type === INTEGRATION_TYPE &&
          integrationThumbnailMap[nodeDataItem?.go_data?.flow?.project_id]
        ) {
          nodeDataItem._src =
            integrationThumbnailMap[
              nodeDataItem?.go_data?.flow?.project_id
            ]._src;
        } else {
          nodeDataItem._src = await getNodeSrc(nodeDataItem);
        }
      }
      setAvailableNodes(connectableNodes);
    }, [getNodes, integrationThumbnailMap]);

    const saveHandler = useCallback(
      (openNodeAfterCreate = true) => {
        const ifElseData = state.getData();
        const errors = state.getError();
        onSave(
          ifElseData,
          {
            errors,
          },
          openNodeAfterCreate,
        );
      },
      [onSave, state],
    );

    const handleNodeSelectedFromPalette = useCallback(
      async (newNode) => {
        const context = pendingAddNodeContextRef.current;
        if (!context) return;

        const nodeKey = newNode.key || newNode.data?.key;
        const nodeName = newNode.name || newNode.data?.name;
        const nodeSrc = await getNodeSrc({ key: nodeKey }, true);

        state.updateAction(context.statementIndex, nodeKey);

        setAvailableNodes((prev) => {
          if (prev.some((opt) => opt.key === nodeKey)) return prev;
          return [...prev, { key: nodeKey, name: nodeName, _src: nodeSrc }];
        });

        pendingAddNodeContextRef.current = null;

        setTimeout(() => saveHandler(true), 50);
      },
      [state, saveHandler],
    );

    const handleAddNodeWithCallback = useCallback(
      (statementIndex) => {
        const ifElseData = state.getData();
        onSave(ifElseData, { errors: state.getError() }, false);

        pendingAddNodeContextRef.current = { statementIndex };

        const blockContext = {
          blockId: `statement-${statementIndex}`,
          blockType: state.statements[statementIndex]?.type || "if",
          blockIndex: statementIndex,
        };

        onAddNode(blockContext, handleNodeSelectedFromPalette);
      },
      [onAddNode, handleNodeSelectedFromPalette, state, onSave],
    );

    const addEndNodeInElse = async (statementIndex) => {
      const newNodeKey = Date.now().toString();
      if (linkedNodeDataRef.current) {
        linkedNodeDataRef.current = { from: nodeData?.key };
      }
      onAddJumpTo({ ...END_NODE, key: newNodeKey }, []);
      state.updateAction(statementIndex, newNodeKey);
      saveHandler(true);
      await fetchAvailableNodes();
    };

    useEffect(() => {
      fetchAvailableNodes();
    }, [fetchAvailableNodes]);

    useEffect(() => {
      if (!currentSavedData?.last_updated) {
        setTimeout(saveHandler, 100);
      }
    }, [currentSavedData?.last_updated, saveHandler]);

    useImperativeHandle(
      ref,
      () => ({
        getData: state.getData,
        getError: state.getError,
        updateAction: (statementIndex, action) => {
          state.updateAction(statementIndex, action);
        },
      }),
      [state],
    );

    // Match HTTP node: switch tab only; do not call save. Test tab uses in-memory state.getData().
    const handleTabChange = useCallback(
      (tabId) => {
        if (tabId === TABS.TEST && !state.validation.isValid) {
          return;
        }
        setActiveTab(tabId);
      },
      [state.validation.isValid],
    );

    const handleTestComplete = useCallback(
      (output_schema) => {
        state.setOutputSchema(output_schema);
        setHasTestCompleted(true);
      },
      [state, nodeData],
    );

    const handleTestStart = useCallback(() => {
      setHasTestCompleted(false);

      const testGoData = state.getData();
    }, [state, variables]);

    const handleProcessingChange = useCallback((processing) => {
      setIsTestProcessing(processing);
    }, []);

    const handleTestAction = useCallback(() => {
      testModuleRef.current?.beginTest();
    }, []);

    const validateBeforeTest = useCallback(() => {
      if (!state.validation.isValid) {
        return {
          valid: false,
          errors: state.validation.errors,
        };
      }
      return { valid: true };
    }, [state.validation]);

    // Match HTTP node: Configure→Test only switches tab (no save). Save only on "Save & Close" or close.
    const handlePrimaryAction = useCallback(() => {
      if (activeTab === TABS.CONFIGURE) {
        if (state.validation.isValid) {
          setActiveTab(TABS.TEST);
        } else {
          saveHandler(false);
        }
      } else if (activeTab === TABS.TEST) {
        saveHandler(false);
        onClose();
      }
    }, [activeTab, state.validation.isValid, saveHandler, onClose]);

    const handleSecondaryAction = useCallback(() => {
      if (activeTab === TABS.TEST) {
        setActiveTab(TABS.CONFIGURE);
      }
    }, [activeTab]);

    const handleClose = useCallback(() => {
      if (linkedNodeDataRef.current) {
        linkedNodeDataRef.current = {};
      }
      saveHandler(false);
      onClose();
    }, [saveHandler, onClose, linkedNodeDataRef]);

    const getPrimaryActionLabel = useCallback(() => {
      if (activeTab === TABS.CONFIGURE) {
        return state.validation.isValid ? "Test Conditions" : "Save";
      }
      return "Save & Close";
    }, [activeTab, state.validation.isValid]);

    const getPrimaryDisabled = useCallback(() => {
      if (activeTab === TABS.CONFIGURE) return false;
      return false;
    }, [activeTab]);

    const tabs = [{ id: TABS.CONFIGURE, label: "Configure", icon: Settings }];

    if (IF_ELSE_NODE_V2.hasTestModule) {
      tabs.push({
        id: TABS.TEST,
        label: "Test",
        icon: Play,
        disabled: !state.validation.isValid,
      });
    }

    const renderContent = () => {
      switch (activeTab) {
        case TABS.CONFIGURE:
          return (
            <ConfigureTab
              ref={configureTabRef}
              statements={state.statements}
              setStatements={state.setStatements}
              addElseIf={state.addElseIf}
              updateStatement={state.updateStatement}
              deleteStatement={state.deleteStatement}
              updateAction={state.updateAction}
              variables={variables}
              availableNodes={availableNodes}
              onAddNode={handleAddNodeWithCallback}
              addEndNodeInElse={addEndNodeInElse}
            />
          );
        case TABS.TEST: {
          const testGoData = state.getData();

          return (
            <CommonTestModuleV3
              ref={testModuleRef}
              canvasRef={canvasRef}
              annotation={annotation}
              go_data={testGoData}
              workspaceId={workspaceId}
              assetId={assetId}
              projectId={projectId}
              parentId={parentId}
              variables={variables}
              node={nodeData || IF_ELSE_NODE_V2}
              onTestComplete={handleTestComplete}
              onProcessingChange={handleProcessingChange}
              onTestStart={handleTestStart}
              theme={THEME}
              contextualContent={IF_ELSE_CONTEXTUAL_CONTENT}
              testPresets={IF_ELSE_TEST_PRESETS}
              resultActions={IF_ELSE_RESULT_ACTIONS}
              resultType="json"
              persistTestData={true}
              inputMode="auto"
              onValidateBeforeTest={validateBeforeTest}
              useV3Input={true}
              useV4Result={true}
              autoContextualContent={true}
            />
          );
        }
        default:
          return null;
      }
    };

    return (
      <WizardDrawer
        ref={drawerRef}
        open={open}
        icon={<GitBranch className="w-5 h-5" />}
        title={nodeData?.name || IF_ELSE_NODE_V2.name}
        subtitle="Split your flow using conditional logic"
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
        tertiaryActionLabel={activeTab === TABS.TEST ? "Run Test" : null}
        onTertiaryAction={activeTab === TABS.TEST ? handleTestAction : null}
        tertiaryActionDisabled={isTestProcessing}
        tertiaryActionLoading={isTestProcessing}
        onSaveAndClose={activeTab === TABS.TEST ? handlePrimaryAction : null}
        saveAndCloseLabel="Save & Close"
        theme={THEME}
        showEditTitle={true}
        contentClassName={"![height:unset]"}
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

IfElseV2.displayName = "IfElseV2";

export default IfElseV2;
