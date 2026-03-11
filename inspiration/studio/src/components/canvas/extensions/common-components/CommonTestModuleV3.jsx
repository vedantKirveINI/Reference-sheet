import React, {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useState,
  useMemo,
} from "react";
import utility from "oute-services-utility-sdk";
import cloneDeep from "lodash/cloneDeep";
import { debounce } from "lodash";

import { componentSDKServices } from "../../services/componentSDKServices";
import { variableSDKServices } from "../../services/variableSDKServices";
import { canvasSDKServices } from "../../services/canvasSDKServices";
import SDK from "oute-services-socket-client-handler-sdk";
import { serverConfig } from "@src/module/ods";
import { toast } from "sonner";
import { SOCKET_EVENTS } from "../constants/socket-events";

import CommonTestInputV3 from "./CommonTestInputV3";
import CommonTestInputV2 from "./CommonTestInputV2";
import CommonTestInputV4 from "./CommonTestInputV4";
import TestProcessingLoader from "./TestProcessingLoader";
import EmptyTestScreen from "./EmptyTestScreen";
import ContextualTestScreen from "./ContextualTestScreen";
import ExecutionResultV2 from "./ExecutionResultV2";
import ExecutionResultV3 from "./ExecutionResultV3";
import ExecutionResultV4 from "./ExecutionResultV4";
import DryRunPreview from "./DryRunPreview";
import { TestModuleProvider } from "./TestModuleContext";
import { getContextualContentByNodeType } from "./contextualContentDefaults";
import { saveTestData, loadTestData } from "./testDataPersistence";
import {
  SheetTestResult,
  GPTTestResult,
  IntegrationTestResult,
  AgentTestResult,
  ConnectionTestResult,
  ScoutTestResult,
  IfElseTestResult,
} from "./TestResultVariants";

import classes from "./CommonTestModule.module.css";

const V2_TO_LEGACY_TYPE_MAP = {
  PERSON_ENRICHMENT_V2: "PERSON_ENRICHMENT",
  EMAIL_ENRICHMENT_V2: "EMAIL_ENRICHMENT",
  COMPANY_ENRICHMENT_V2: "COMPANY_ENRICHMENT",
  TINY_SEARCH_V3: "TINY_SEARCH_V2",
};

const getSdkNodeType = (type) => {
  return V2_TO_LEGACY_TYPE_MAP[type] || type;
};

export let testOutputCache = new Map();

const CommonTestModuleV3 = forwardRef(
  (
    {
      canvasRef,
      annotation,
      go_data,
      variables,
      node,
      workspaceId,
      assetId,
      projectId,
      parentId,
      onTestComplete = () => {},
      onProcessingChange = () => {},
      onTestStart = () => {},
      theme = {},
      contextualContent = null,
      inputRenderer = null,
      resultRenderer = null,
      testPresets = [],
      onValidateBeforeTest = null,
      supportsDryRun = false,
      onDryRun = null,
      resultActions = [],
      emptyStateContent = null,
      fieldConfig = {},
      resultType = "json",
      persistTestData = true,
      inputMode = "auto",
      useV3Input = false,
      useV4Input = true,
      useV4Result = true,
      autoContextualContent = true,
      configurationData = null,
      resultVariant = "auto",
    },
    ref,
  ) => {
    const cachedStates = testOutputCache.get(node?.key) || {};
    const [socket, setSocket] = useState(null);

    const [output, setOutput] = useState(cachedStates?.output || {});
    const [inputs, setInputs] = useState();
    const [executionInput, setExecutionInput] = useState(
      cachedStates?.executionInput || {},
    );
    const [executionOutput, setExecutionOutput] = useState(
      cachedStates?.executionOutput || null,
    );
    const [state, setState] = useState({});
    const [isProcessing, setIsProcessing] = useState(false);
    const [inputModeActive, setInputModeActive] = useState(false);
    const [isTestComplete, setIsTestComplete] = useState(
      cachedStates?.isTestComplete || false,
    );
    const [isInitialized, setIsInitialized] = useState(false);
    const [executedAt, setExecutedAt] = useState(null);
    const [hasRunOnce, setHasRunOnce] = useState(
      cachedStates?.isTestComplete || false,
    );

    const [isDryRunMode, setIsDryRunMode] = useState(false);
    const [dryRunLoading, setDryRunLoading] = useState(false);
    const [dryRunData, setDryRunData] = useState(null);
    const [dryRunError, setDryRunError] = useState(null);

    const resolvedContextualContent = useMemo(() => {
      if (contextualContent) return contextualContent;
      if (autoContextualContent && node?.type) {
        return getContextualContentByNodeType(node.type);
      }
      return null;
    }, [contextualContent, autoContextualContent, node?.type]);

    const getFilteredModelJson = useCallback(() => {
      try {
        const parsedModelJson = cloneDeep(
          JSON.parse(canvasRef?.current?.getModelJSON()),
        );
        parsedModelJson.linkDataArray = [];
        parsedModelJson.nodeDataArray = parsedModelJson?.nodeDataArray?.filter(
          (parsedNode) => parsedNode?.key === node?.key,
        );
        return JSON.stringify(parsedModelJson);
      } catch (error) {
        return canvasRef?.current?.getModelJSON();
      }
    }, [canvasRef, node?.key]);

    const runTest = useCallback(async () => {
      try {
        setIsProcessing(true);
        setExecutedAt(new Date().toISOString());

        let _state = state || {};
        let response = await variableSDKServices.transformedToState(variables);
        if (response.status === "success") {
          // SDK variable defaults first, then user's test input values take precedence
          _state = { ...response.result, ..._state };
        }
        const params = {
          blocks: cloneDeep(inputs?.blocks || {}),
          state: _state,
        };
        response = await componentSDKServices.formSchemaToState(params);
        if (response.status === "success") {
          // Merge form schema values, keeping user's test input values as override
          _state = { ...response.result, ..._state };
        }
        let cloned_go_data = cloneDeep(go_data);
        delete cloned_go_data?.output;
        delete cloned_go_data?._originalOutputFormat;

        if (cloned_go_data?.outputFormat === "text") {
          cloned_go_data.outputFormat = "json";
          cloned_go_data.format = [
            {
              id: "field-response",
              key: "response",
              type: "String",
              defaultValue: "",
              value: {
                type: "fx",
                blocks: [{ type: "PRIMITIVES", value: "" }],
              },
              valueStr: "",
            },
          ];
        }

        let filteredModelJson = getFilteredModelJson();
        const saveSnapshotResponse = await canvasSDKServices.saveSnapshot({
          _r: filteredModelJson,
          asset_id: assetId,
          workspace_id: workspaceId,
          project_id: projectId,
          annotation: annotation,
        });

        const assetConfig = {
          workspace_id: workspaceId,
          asset_id: assetId,
          project_id: projectId,
          parent_id: parentId,
          snapshot_canvas_id: saveSnapshotResponse?.result?._id,
        };

        const sdkNodeType = getSdkNodeType(node?.type);

        const flowResponse = await componentSDKServices.transformToFlow(
          sdkNodeType,
          cloned_go_data,
          _state,
          assetConfig,
        );

        if (
          flowResponse.status === "success" &&
          V2_TO_LEGACY_TYPE_MAP[node?.type]
        ) {
          const serverType = V2_TO_LEGACY_TYPE_MAP[node.type];
          if (flowResponse.result) {
            flowResponse.result.type = serverType;
          }
          const _fObj = flowResponse?.result?.flow?.flow;
          if (_fObj) {
            const _tId = Object.keys(_fObj)[0];
            if (_fObj[_tId]) {
              _fObj[_tId].type = serverType;
              if (_fObj[_tId].config) {
                _fObj[_tId].config.type = serverType;
              }
            }
          }
        }

        if (flowResponse.status === "success") {
          if (socket) {
            socket.emit("execute_node", flowResponse?.result);
          } else {
            setIsProcessing(false);
          }
        } else {
          setIsProcessing(false);
        }
      } catch (error) {
        setOutput(null);
        setIsProcessing(false);
        onTestComplete(null);
      } finally {
        setInputModeActive(false);
      }
    }, [
      annotation,
      assetId,
      getFilteredModelJson,
      go_data,
      inputs?.blocks,
      node?.type,
      onTestComplete,
      parentId,
      projectId,
      socket,
      state,
      variables,
      workspaceId,
    ]);

    const checkForInputs = useCallback(async () => {
      const response = await componentSDKServices.generateFormSchemaV2(
        go_data,
        {
          mark_as_ref: true,
          cleanup_keys: ["default"],
        },
      );
      if (response.status === "success") {
        if (response.result?.keys?.length > 0) {
          setInputs(response.result);
          return true;
        }
        return false;
      }
      throw new Error(
        "An error occurred while checking for inputs. Please check the input data.",
      );
    }, [go_data]);

    const handleDryRun = useCallback(async () => {
      if (!onDryRun) return;

      try {
        setDryRunLoading(true);
        setDryRunError(null);
        const result = await onDryRun(state);
        setDryRunData(result);
      } catch (error) {
        setDryRunError(error.message || "Failed to generate preview");
      } finally {
        setDryRunLoading(false);
      }
    }, [onDryRun, state]);

    const handleDryRunConfirm = useCallback(() => {
      setIsDryRunMode(false);
      setDryRunData(null);
      runTest();
    }, [runTest]);

    const handleDryRunCancel = useCallback(() => {
      setIsDryRunMode(false);
      setDryRunData(null);
      setDryRunError(null);
    }, []);

    const beginTest = useCallback(async () => {
      try {
        setOutput(null);
        setExecutionInput(null);
        setExecutionOutput(null);
        setIsTestComplete(false);
        onTestStart();

        if (onValidateBeforeTest) {
          const validationResult = onValidateBeforeTest(state);
          if (!validationResult.valid) {
            toast.error("Validation Error", {
              description: validationResult.errors?.[0] || "Validation failed",
            });
            return;
          }
        }

        setIsProcessing(true);
        if (!inputModeActive) {
          setInputs(null);
          const hasInputs = await checkForInputs();
          if (hasInputs) {
            setInputModeActive(true);
            setIsProcessing(false);
            return;
          }
        }

        if (supportsDryRun && onDryRun) {
          setIsProcessing(false);
          setIsDryRunMode(true);
          handleDryRun();
          return;
        }

        runTest();
      } catch (error) {
        setIsProcessing(false);
      }
    }, [
      checkForInputs,
      inputModeActive,
      runTest,
      onTestStart,
      onValidateBeforeTest,
      state,
      supportsDryRun,
      onDryRun,
      handleDryRun,
    ]);

    const handleEvent = useCallback(
      (data) => {
        switch (data?.type) {
          case SOCKET_EVENTS.SOCKET_NODE_INPUT_KEY:
            setExecutionInput(data?.result);
            break;
          case SOCKET_EVENTS.SOCKET_NODE_OUTPUT_KEY:
            setExecutionOutput(data?.result);
            break;
          case SOCKET_EVENTS.SOCKET_EXECUTE_NODE_RESULT_KEY: {
            setOutput(data?.result);
            const new_output_schema = utility.jsonToSchema(data?.result, {
              use_type_default: true,
            });
            setIsTestComplete(true);
            setHasRunOnce(true);
            onTestComplete(new_output_schema);
            setIsProcessing(false);
            break;
          }
          case SOCKET_EVENTS.SOCKET_EXECUTE_NODE_ERROR_KEY: {
            setOutput(data?.result);
            setExecutionOutput(data?.result);
            setIsTestComplete(true);
            setHasRunOnce(true);
            setIsProcessing(false);
            toast.error("Test Execution Error", {
              description:
                data?.result?.message ||
                "An error occurred during test execution",
            });
            break;
          }
          default:
            break;
        }
      },
      [onTestComplete],
    );

    const debouncedBeginTest = useCallback(
      debounce(
        () => {
          if (isProcessing) return;
          beginTest();
        },
        300,
        {
          leading: true,
          trailing: false,
        },
      ),
      [beginTest, isProcessing],
    );

    const handleRerun = useCallback(async () => {
      if (isProcessing) return;

      setIsTestComplete(false);
      setOutput(null);
      setExecutionInput(null);
      setExecutionOutput(null);
      setInputs(null);
      setIsProcessing(false);
      setInputModeActive(false);

      const hasInputs = await checkForInputs();
      if (hasInputs) {
        setInputModeActive(true);
      } else {
        beginTest();
      }
    }, [beginTest, checkForInputs, isProcessing]);

    useImperativeHandle(
      ref,
      () => ({
        beginTest: debouncedBeginTest,
        isProcessing,
        inputMode: inputModeActive,
      }),
      [debouncedBeginTest, isProcessing, inputModeActive],
    );

    useEffect(() => {
      onProcessingChange(isProcessing);
    }, [isProcessing, onProcessingChange]);

    useEffect(() => {
      if (isInitialized) return;
      setIsInitialized(true);
      (async () => {
        const cachedStates = testOutputCache.get(node?.key) || {};
        if (cachedStates?.output) return;
        if (!inputModeActive) {
          setInputs(null);
          const hasInputs = await checkForInputs();
          if (hasInputs) {
            setInputModeActive(true);
            setIsProcessing(false);
            return;
          }
        }
      })();
    }, [checkForInputs, inputModeActive, isInitialized, node?.key]);

    useEffect(() => {
      const initSocket = async () => {
        const sdkInstance = new SDK({
          url: serverConfig.SOCKET_URL,
          socket_opt: {
            reconnectionDelay: 5000,
            query: {
              token: window.accessToken,
              room_id: `IC_${Date.now()}`,
              room_type: "PROCESSOR",
            },
            transports: ["websocket", "webtransport", "polling"],
          },
        });
        try {
          const { result = {}, status } = await sdkInstance.init();

          if (status === "success") {
            Object.values(SOCKET_EVENTS).forEach((event) => {
              result.on(event, (data) => {
                handleEvent(data);
              });
            });
          }
          setSocket(result);
          console.log("[SOCKET_CREATED] CommonTestModuleV3 (node Run tab, execute_node)", {
            source: "CommonTestModuleV3.jsx",
            socket_id: result?.id,
            node_key: node?.key,
          });
        } catch (error) {
          // Socket initialization failed
        }
      };
      if (!socket) {
        initSocket();
      }
    }, [handleEvent, socket]);

    useEffect(() => {
      if (isTestComplete) {
        testOutputCache.set(node?.key, {
          executionInput: executionInput,
          executionOutput: executionOutput,
          output: output,
          isTestComplete: true,
        });

        if (canvasRef?.current) {
          const diagram = canvasRef.current.getDiagram?.();
          if (diagram) {
            const nodeObj = diagram.findNodeForKey(node?.key);
            if (nodeObj) {
              const testOutput = executionOutput || output;
              let fieldCount = 0;
              if (testOutput && typeof testOutput === "object") {
                fieldCount = Object.keys(testOutput).length;
              }
              diagram.startTransaction("markTestData");
              diagram.model.setDataProperty(nodeObj.data, "_hasTestData", true);
              diagram.model.setDataProperty(
                nodeObj.data,
                "_testDataFieldCount",
                fieldCount,
              );
              diagram.commitTransaction("markTestData");
            }
          }
        }
      }
    }, [
      executionInput,
      executionOutput,
      output,
      isTestComplete,
      node?.key,
      canvasRef,
    ]);

    const handleValuesChange = useCallback((values) => {
      setState(values);
    }, []);

    const resolvedConfigurationData = useMemo(() => {
      if (configurationData) return configurationData;
      if (!go_data) return null;

      const config = [];

      const getConnectionValue = (conn) => {
        return (
          conn?.name ||
          conn?.connection_name ||
          conn?.label ||
          conn?.title ||
          conn?.connection_id ||
          conn?._id ||
          null
        );
      };

      const getTableValue = (tbl) => {
        return (
          tbl?.name ||
          tbl?.table_name ||
          tbl?.label ||
          tbl?.title ||
          tbl?.table_id ||
          tbl?._id ||
          null
        );
      };

      const getSheetValue = (sht) => {
        return (
          sht?.name ||
          sht?.sheet_name ||
          sht?.label ||
          sht?.title ||
          sht?.sheet_id ||
          sht?._id ||
          null
        );
      };

      const getViewValue = (vw) => {
        return (
          vw?.name ||
          vw?.view_name ||
          vw?.label ||
          vw?.title ||
          vw?.view_id ||
          vw?._id ||
          null
        );
      };

      if (go_data.connection || go_data.datasource || go_data.database) {
        const conn =
          go_data.connection || go_data.datasource || go_data.database;
        const value = getConnectionValue(conn);
        if (value) {
          config.push({ label: "Connection", value, type: "connection" });
        }
      }

      if (go_data.table || go_data.base) {
        const tbl = go_data.table || go_data.base;
        const value = getTableValue(tbl);
        if (value) {
          config.push({ label: "Table", value, type: "table" });
        }
      }

      if (go_data.sheet) {
        const value = getSheetValue(go_data.sheet);
        if (value) {
          config.push({ label: "Sheet", value, type: "sheet" });
        }
      }

      if (go_data.view) {
        const value = getViewValue(go_data.view);
        if (value) {
          config.push({ label: "View", value, type: "view" });
        }
      }

      return config.length > 0 ? config : null;
    }, [configurationData, go_data]);

    const renderInputComponent = () => {
      if (useV4Input) {
        return (
          <CommonTestInputV4
            inputs={inputs}
            onValuesChange={handleValuesChange}
            inputMode={inputMode}
            fieldConfig={fieldConfig}
            testPresets={testPresets}
            persistTestData={persistTestData}
            nodeKey={node?.key}
            theme={theme}
            inputRenderer={inputRenderer}
            onValidate={onValidateBeforeTest}
            isRerun={hasRunOnce}
            configurationData={resolvedConfigurationData}
          />
        );
      }
      if (useV3Input) {
        return (
          <CommonTestInputV3
            inputs={inputs}
            onValuesChange={handleValuesChange}
            inputMode={inputMode}
            fieldConfig={fieldConfig}
            testPresets={testPresets}
            persistTestData={persistTestData}
            nodeKey={node?.key}
            theme={theme}
            inputRenderer={inputRenderer}
            onValidate={onValidateBeforeTest}
            isRerun={hasRunOnce}
            configurationData={resolvedConfigurationData}
          />
        );
      }
      return (
        <CommonTestInputV2
          inputs={inputs}
          onValuesChange={handleValuesChange}
        />
      );
    };

    const getResultVariant = useCallback(() => {
      const nodeType = node?.type?.toUpperCase() || "";
      if (resultVariant && resultVariant !== "auto") {
        return resultVariant;
      }

      if (
        nodeType.includes("SHEET") ||
        nodeType.includes("TINY_TABLE") ||
        nodeType.includes("CREATE_RECORD") ||
        nodeType.includes("READ_RECORD") ||
        nodeType.includes("UPDATE_RECORD") ||
        nodeType.includes("DELETE_RECORD")
      ) {
        return "sheet";
      }

      if (
        nodeType.includes("GPT") ||
        nodeType.includes("OPENAI") ||
        nodeType.includes("CLAUDE") ||
        nodeType.includes("LLM") ||
        nodeType.includes("COMPLETION") ||
        nodeType.includes("CHAT")
      ) {
        return "gpt";
      }

      if (nodeType.includes("AGENT_SCOUT") || nodeType === "AGENT_SCOUT") {
        return "scout";
      }

      if (nodeType.includes("AGENT")) {
        return "agent";
      }

      if (
        nodeType.includes("HTTP") ||
        nodeType.includes("WEBHOOK") ||
        nodeType.includes("API") ||
        nodeType.includes("REST") ||
        nodeType.includes("REQUEST")
      ) {
        return "integration";
      }

      if (
        nodeType.includes("CONNECTION") ||
        nodeType.includes("CONNECT") ||
        nodeType.includes("DATABASE") ||
        nodeType.includes("AUTH")
      ) {
        return "connection";
      }

      if (nodeType.includes("IFELSE") || nodeType.includes("IF_ELSE")) {
        return "ifelse";
      }

      return "default";
    }, [node?.type, resultVariant]);

    const renderResultComponent = () => {
      const variant = getResultVariant();

      const resolvedOutputs = executionOutput ?? output;
      const resolvedInputs = executionInput ?? undefined;

      if (variant === "sheet") {
        return (
          <SheetTestResult
            inputs={resolvedInputs}
            outputs={resolvedOutputs}
            node={node}
            theme={theme}
            executedAt={executedAt}
            onRerun={handleRerun}
            operationType={node?.type?.toUpperCase()}
            goData={go_data}
          />
        );
      }

      if (variant === "gpt") {
        return (
          <GPTTestResult
            inputs={resolvedInputs}
            outputs={resolvedOutputs}
            node={node}
            theme={theme}
            executedAt={executedAt}
            onRerun={handleRerun}
            goData={go_data}
          />
        );
      }

      if (variant === "scout") {
        return (
          <ScoutTestResult
            inputs={resolvedInputs}
            outputs={resolvedOutputs}
            node={node}
            theme={theme}
            executedAt={executedAt}
            onRerun={handleRerun}
            goData={go_data}
            resolvedState={state}
          />
        );
      }

      if (variant === "agent") {
        return (
          <AgentTestResult
            inputs={resolvedInputs}
            outputs={resolvedOutputs}
            node={node}
            theme={theme}
            executedAt={executedAt}
            onRerun={handleRerun}
            goData={go_data}
          />
        );
      }

      if (variant === "integration") {
        return (
          <IntegrationTestResult
            inputs={resolvedInputs}
            outputs={resolvedOutputs}
            node={node}
            theme={theme}
            executedAt={executedAt}
            onRerun={handleRerun}
          />
        );
      }

      if (variant === "connection") {
        return (
          <ConnectionTestResult
            inputs={resolvedInputs}
            outputs={resolvedOutputs}
            node={node}
            theme={theme}
            executedAt={executedAt}
            onRerun={handleRerun}
          />
        );
      }

      if (variant === "ifelse") {
        return (
          <IfElseTestResult
            inputs={resolvedInputs}
            outputs={resolvedOutputs}
            node={node}
            theme={theme}
            executedAt={executedAt}
            onRerun={handleRerun}
            canvasRef={canvasRef}
          />
        );
      }

      if (useV4Result) {
        return (
          <ExecutionResultV4
            inputs={resolvedInputs}
            outputs={resolvedOutputs}
            node={node}
            theme={theme}
            executedAt={executedAt}
            resultType={resultType}
            resultActions={resultActions}
            resultRenderer={resultRenderer}
            onRerun={handleRerun}
          />
        );
      }
      return (
        <ExecutionResultV3
          inputs={resolvedInputs}
          outputs={resolvedOutputs}
          node={node}
          theme={theme}
          executedAt={executedAt}
        />
      );
    };

    const renderEmptyState = () => {
      if (emptyStateContent) {
        return (
          <ContextualTestScreen
            title={hasRunOnce ? "Ready to Rerun" : emptyStateContent.title}
            description={emptyStateContent.description}
            tips={emptyStateContent.tips || []}
            icon={emptyStateContent.icon}
            theme={theme}
            onRunTest={() => debouncedBeginTest()}
            isProcessing={isProcessing}
            isRerun={hasRunOnce}
          />
        );
      }

      if (resolvedContextualContent) {
        const IconComponent = resolvedContextualContent.icon;
        return (
          <ContextualTestScreen
            title={
              hasRunOnce ? "Ready to Rerun" : resolvedContextualContent.title
            }
            description={resolvedContextualContent.description}
            tips={resolvedContextualContent.tips || []}
            icon={IconComponent}
            theme={theme}
            onRunTest={() => debouncedBeginTest()}
            isProcessing={isProcessing}
            isRerun={hasRunOnce}
          />
        );
      }

      return <EmptyTestScreen />;
    };

    return (
      <TestModuleProvider
        nodeKey={node?.key}
        onValidateBeforeTest={onValidateBeforeTest}
        persistTestData={persistTestData}
      >
        <div className={`${classes["common-test-module-container"]}`}>
          {isProcessing ? (
            <div className={classes["loader-container"]}>
              <TestProcessingLoader theme={theme} />
            </div>
          ) : isDryRunMode ? (
            <DryRunPreview
              isLoading={dryRunLoading}
              previewData={dryRunData}
              error={dryRunError}
              onConfirm={handleDryRunConfirm}
              onCancel={handleDryRunCancel}
              onRetry={handleDryRun}
              theme={theme}
              operationType={
                node?.type?.toLowerCase().includes("delete")
                  ? "delete"
                  : "update"
              }
            />
          ) : (
            <>
              {inputModeActive &&
                !!inputs?.keys?.length > 0 &&
                renderInputComponent()}
              {!inputModeActive && !isTestComplete && renderEmptyState()}
              {!inputModeActive && isTestComplete && renderResultComponent()}
            </>
          )}
        </div>
      </TestModuleProvider>
    );
  },
);

CommonTestModuleV3.displayName = "CommonTestModuleV3";

export default CommonTestModuleV3;
