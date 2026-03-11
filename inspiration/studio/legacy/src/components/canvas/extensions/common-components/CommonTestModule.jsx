import React, {
  forwardRef,
  useCallback,
  // useContext,
  useEffect,
  useImperativeHandle,
  useState,
} from "react";
// import { showAlert } from "oute-ds-alert";

// // import Label from "oute-ds-label";
import utility from "oute-services-utility-sdk";

// import Lottie from "lottie-react";
import cloneDeep from "lodash/cloneDeep";
import classes from "./CommonTestModule.module.css";

import { componentSDKServices } from "../../services/componentSDKServices";
import { variableSDKServices } from "../../services/variableSDKServices";
// import animationData from "../../assets/lotties/await-response.json";
import CommonTestInput from "./CommonTestInputV2";
import TestProcessingLoader from "./TestProcessingLoader";
// import CommonTestOutput from "./CommonTestOutput";
import { canvasSDKServices } from "../../services/canvasSDKServices";

import SDK from "oute-services-socket-client-handler-sdk";
// import { serverConfig } from "oute-ds-utils";
import { showAlert, serverConfig } from "@src/module/ods";
import { SOCKET_EVENTS } from "../constants/socket-events";
// import CommonExecutionResult from "./CommonExecutionResult";
import ExecutionResultV2 from "./ExecutionResultV2";
import EmptyTestScreen from "./EmptyTestScreen";
import { debounce } from "lodash";
// import DataRenderer from "./data-renderer/DataRenderer";

let testOutputCache = new Map();

const CommonTestModule = forwardRef(
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
    },
    ref
  ) => {
    const cachedStates = testOutputCache.get(node?.key) || {};
    const [socket, setSocket] = useState(null);

    const [output, setOutput] = useState(cachedStates?.output || {});
    // const [outputSchema, setOutputSchema] = useState();
    const [inputs, setInputs] = useState();
    const [executionInput, setExecutionInput] = useState(
      cachedStates?.executionInput || {}
    );
    const [executionOutput, setExecutionOutput] = useState(
      cachedStates?.executionOutput || null
    );
    const [state, setState] = useState({});
    const [isProcessing, setIsProcessing] = useState(false);
    const [inputMode, setInputMode] = useState(false);
    const [isTestComplete, setIsTestComplete] = useState(
      cachedStates?.isTestComplete || false
    );
    const [isInitialized, setIsInitialized] = useState(false);
    // const [expanded, setExpanded] = useState("output");

    const getFilteredModelJson = useCallback(() => {
      try {
        const parsedModelJson = cloneDeep(
          JSON.parse(canvasRef?.current?.getModelJSON())
        );
        parsedModelJson.linkDataArray = [];
        parsedModelJson.nodeDataArray = parsedModelJson?.nodeDataArray?.filter(
          (parsedNode) => parsedNode?.key === node?.key
        );
        return JSON.stringify(parsedModelJson);
      } catch (error) {
        console.log(error, "error");
        return canvasRef?.current?.getModelJSON();
      }
    }, [canvasRef, node?.key]);

    const runTest = useCallback(async () => {
      try {
        // setInputMode(false);
        setIsProcessing(true);
        let _state = state || {};
        let response = await variableSDKServices.transformedToState(variables);
        if (response.status === "success") {
          _state = { ..._state, ...response.result };
        }
        const params = {
          blocks: cloneDeep(inputs?.blocks || {}),
          state: _state,
        };
        response = await componentSDKServices.formSchemaToState(params);
        if (response.status === "success") {
          _state = { ..._state, ...response.result };
        }
        let cloned_go_data = cloneDeep(go_data);
        delete cloned_go_data?.output;

        let filteredModelJson = getFilteredModelJson();
        const saveSnapshotResponse = await canvasSDKServices.saveSnapshot({
          _r: filteredModelJson,
          asset_id: assetId,
          workspace_id: workspaceId,
          project_id: projectId,
          annotation: annotation,
        });
        const flowResponse = await componentSDKServices.transformToFlow(
          node?.type,
          cloned_go_data,
          _state,
          {
            workspace_id: workspaceId,
            asset_id: assetId,
            project_id: projectId,
            parent_id: parentId,
            snapshot_canvas_id: saveSnapshotResponse?.result?._id,
          }
        );
        if (flowResponse.status === "success") {
          socket.emit("execute_node", flowResponse?.result);
        }
        // response = await componentSDKServices.executeNode(
        //   node?.type,
        //   cloned_go_data,
        //   _state,
        //   {
        //     workspace_id: workspaceId,
        //     asset_id: assetId,
        //     project_id: projectId,
        //     parent_id: parentId,
        //     snapshot_canvas_id: saveSnapshotResponse?.result?._id,
        //   }
        // );
        // if (response.status === "success") {
        //   const new_output_schema = utility.jsonToSchema(response?.result, {
        //     use_type_default: true,
        //   });
        //   setOutputSchema(new_output_schema?.schema || []);
        //   setOutput(response?.result);
        //   onTestComplete(new_output_schema);
        // }
      } catch {
        setOutput(null);
        // setOutputSchema([]);
        setIsProcessing(false);
        onTestComplete(null);
      } finally {
        // setExpanded("output");
        setInputMode(false);
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
          cleanup_keys: ["default"], // to skip the default key from the input schema
        }
      );
      if (response.status === "success") {
        if (response.result?.keys?.length > 0) {
          setInputs(response.result);
          // setExpanded("inputs");
          return true;
        }
        return false;
      }
      throw new Error(
        "An error occurred while checking for inputs. Please check the input data."
      );
    }, [go_data]);

    const beginTest = useCallback(async () => {
      try {
        setOutput(null);
        // setOutputSchema(null);
        setExecutionInput(null);
        setExecutionOutput(null);

        setIsProcessing(true);
        if (!inputMode) {
          setInputs(null);
          const hasInputs = await checkForInputs();
          if (hasInputs) {
            setInputMode(true);
            setIsProcessing(false);
            return;
          }
        }
        runTest();
      } catch (error) {
        console.error(error);
        setIsProcessing(false);
      }
    }, [checkForInputs, inputMode, runTest]);

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
            onTestComplete(new_output_schema);
            setIsProcessing(false);

            break;
          }
          case SOCKET_EVENTS.SOCKET_EXECUTE_NODE_ERROR_KEY: {
            setOutput(data?.result);
            setIsTestComplete(true);

            setIsProcessing(false);
            showAlert({
              type: "error",
              message: data?.result?.message,
            });
            break;
          }
          default:
            break;
        }
      },
      [onTestComplete]
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
        }
      ),
      [beginTest, isProcessing]
    );

    useImperativeHandle(
      ref,
      () => ({
        beginTest: debouncedBeginTest,
      }),
      [debouncedBeginTest]
    );

    useEffect(() => {
      if (isInitialized) return;
      setIsInitialized(true);
      (async () => {
        const cachedStates = testOutputCache.get(node?.key) || {};
        if (cachedStates?.output) return;
        if (!inputMode) {
          setInputs(null);
          const hasInputs = await checkForInputs();
          if (hasInputs) {
            setInputMode(true);
            setIsProcessing(false);
            return;
          }
        }
      })();
    }, [checkForInputs, inputMode, isInitialized, node.key]);

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
        } catch (error) {
          console.error(error);
        }
      };
      if (!socket) {
        initSocket();
      }
      // return () => {
      //   if (socket) {
      //     socket?.disconnect();
      //     setSocket(null);
      //   }
      // };
    }, [handleEvent, socket]);

    useEffect(() => {
      if (isTestComplete) {
        testOutputCache.set(node?.key, {
          executionInput: executionInput,
          executionOutput: executionOutput,
          output: output,
          isTestComplete: true,
        });
      }
    }, [executionInput, executionOutput, output, isTestComplete, node?.key]);

    return (
      <div className={`${classes["common-test-module-container"]}`}>
        {isProcessing ? (
          <div className={classes["loader-container"]}>
            {/* <Lottie
              animationData={animationData}
              loop={true}
              style={{
                height: "16rem",
              }}
            />
            <Label>Test results are being processed. Please wait...</Label> */}
            <TestProcessingLoader />
          </div>
        ) : (
          <>
            {inputMode && !!inputs?.keys?.length > 0 && (
              <CommonTestInput
                inputs={inputs}
                onValuesChange={(values) => {
                  setState(values);
                }}
              />
            )}
            {!inputMode && !isTestComplete && <EmptyTestScreen />}
            {!inputMode && isTestComplete && (
              // <CommonExecutionResult
              //   inputs={executionInput}
              //   outputs={executionOutput}
              //   node={node}
              // />
              <ExecutionResultV2
                inputs={executionInput}
                outputs={executionOutput}
                node={node}
              />
              // <DataRenderer
              //   data={executionOutput?.response || executionOutput}
              //   objectAsContainers={!node?.isRecord}
              //   isRecord={node?.isRecord}
              // />
            )}
          </>
        )}
      </div>
    );
  }
);

export default CommonTestModule;
