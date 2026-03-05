import React, {
  forwardRef,
  useCallback,
  useContext,
  useEffect,
  useImperativeHandle,
  useRef,
} from "react";
import debounce from "lodash/debounce";
import variableSDKServices from "../../sdk-services/variable-sdk-services";
import componentSDKServices from "../../sdk-services/component-sdk-services";
import { ICStudioContext } from "../../ICStudioContext";
import {
  RUN_ALL_START_NODE_KEY,
  SOCKET_ABORT_FLOW_ERROR_KEY,
  SOCKET_ABORT_FLOW_RESULT_KEY,
  SOCKET_BEGIN_NODE_KEY,
  SOCKET_END_NODE_KEY,
  SOCKET_EXECUTE_FLOW_ERROR_KEY,
  SOCKET_EXECUTE_FLOW_INIT_KEY,
  SOCKET_EXECUTE_FLOW_RESULT_KEY,
  SOCKET_NODE_INPUT_KEY,
  SOCKET_NODE_LOG_KEY,
  SOCKET_NODE_ERROR_KEY,
  SOCKET_NODE_OUTPUT_KEY,
} from "../../constants/keys";
import canvasSDKServices from "../../sdk-services/canvas-sdk-services";

const ExecuteRun = forwardRef(
  (
    {
      params,
      variables,
      canvasRef,
      assetDetails,
      onEvent = () => {},
      onExecutionComplete = () => {},
    },
    ref,
  ) => {
    const { socket } = useContext(ICStudioContext);
    // const intervalRef = useRef(null);
    // const currentNodeRef = useRef(null);
    // const previousNodeRef = useRef(null);

    // const [queue, setQueue] = useState([]);
    // const [isAborted, setIsAborted] = useState(false);

    // const [executionResult, setExecutionResult] = useState({});
    const executionResult = useRef({});
    const updateExecutionResults = useCallback(() => {
      Object.keys(executionResult.current).forEach((key) => {
        canvasRef.current?.createNode({
          key,
          _executions: executionResult.current[key].executions,
          _state: "completed",
        });
      });
    }, [canvasRef]);

    const run = useCallback(
      async (inputSchema) => {
        console.log("[RUN_ENTRY] ExecuteRun run() called", { timestamp: Date.now() });
        canvasRef.current?.clearExecutionHalos?.();
        executionResult.current = {};
        canvasRef.current?.getAllNodes()?.forEach((node) => {
          if (node.key)
            canvasRef.current.createNode({
              key: node.key,
              _state: "pending",
              _executions: null,
            });
        });
        const transformedToStateResponse =
          await variableSDKServices.transformedToState({
            ...variables,
            ...params,
          });
        const formSchemaToStateResponse =
          await componentSDKServices.formSchemaToState({
            blocks: { [RUN_ALL_START_NODE_KEY]: { schema: inputSchema } },
            state: transformedToStateResponse.result || {},
          });
        let state = {
          start_node_data:
            formSchemaToStateResponse.result[RUN_ALL_START_NODE_KEY],
          ...(transformedToStateResponse.result || {}),
        };
        if (typeof state.start_node_data === "object") {
          state = { ...state, ...state.start_node_data };
        }
        const saveSnapshotResponse = await canvasSDKServices.saveSnapshot({
          _r: canvasRef.current.getModelJSON(),
          asset_id: assetDetails?.asset_id,
          workspace_id: assetDetails?.workspace_id,
          project_id: assetDetails?.project_id,
          annotation: assetDetails?.annotation,
        });
        const transformCanvasResponse = await canvasSDKServices.transformCanvas(
          {
            _r: canvasRef.current.getModelJSON(),
            _id: assetDetails?._id,
            annotation: assetDetails?.annotation,
            asset_id: assetDetails?.asset_id,
            workspace_id: assetDetails?.workspace_id,
            project_id: assetDetails?.project_id,
            snapshot_canvas_id: saveSnapshotResponse?.result?._id,
          },
        );
        const run_id = Date.now();
        console.log("[EXECUTE_FLOW_EMIT] runId:", run_id);
        socket?.emit("execute_flow", {
          run_id,
          state,
          flow: {
            ...transformCanvasResponse?.result,
            asset_id: assetDetails?.asset_id,
            workspace_id: assetDetails?.workspace_id,
            project_id: assetDetails?.project_id,
          },
        });
      },
      [
        assetDetails?._id,
        assetDetails?.annotation,
        assetDetails?.asset_id,
        assetDetails?.project_id,
        assetDetails?.workspace_id,
        canvasRef,
        params,
        socket,
        variables,
      ],
    );
    const abort = useCallback(() => {
      socket?.emit("abort_flow");
    }, [socket]);
    const goToNode = debounce((key) => {
      canvasRef.current?.goToNode(key, {
        openAfterScroll: false,
      });
    }, 500);

    const updateNode = useCallback(
      (data) => {
        onEvent(data);
        if (data.is_advance) return;
        switch (data.event) {
          case SOCKET_BEGIN_NODE_KEY:
            if (data.node_id) {
              canvasRef.current?.createNode({
                key: data.node_id,
                _state: "running",
              });
            }
            if (executionResult.current[data.node_id]) {
              executionResult.current[data.node_id].executionCount += 1;
              executionResult.current[data.node_id].executions.push({});
            } else {
              executionResult.current[data.node_id] = {
                executionCount: 1,
                executions: [{}],
              };
            }
            return;
          case SOCKET_END_NODE_KEY:
            if (data.node_id)
              canvasRef.current?.createNode({
                key: data.node_id,
                _state: "completed",
              });
            updateExecutionResults();
            goToNode(data.node_id); //IMPORTANT: needed here instead of begin_node for node spinning animation to run smoothly
            return;
          case SOCKET_NODE_INPUT_KEY:
            executionResult.current[data.node_id].executions[
              executionResult.current[data.node_id].executions.length - 1
            ].input = data.result;
            return;
          case SOCKET_NODE_OUTPUT_KEY:
            executionResult.current[data.node_id].executions[
              executionResult.current[data.node_id].executions.length - 1
            ].output = data.result;
            return;
          case SOCKET_NODE_ERROR_KEY:
            executionResult.current[data.node_id].executions[
              executionResult.current[data.node_id].executions.length - 1
            ].error = data.result;
            return;
          case SOCKET_EXECUTE_FLOW_RESULT_KEY:
            onExecutionComplete("success");
            updateExecutionResults();
            return;
          case SOCKET_EXECUTE_FLOW_ERROR_KEY:
            onExecutionComplete("error");
            updateExecutionResults();
            return;
          //   case SOCKET_ABORT_FLOW_KEY:
          case SOCKET_ABORT_FLOW_RESULT_KEY:
            onExecutionComplete("aborted");
            return;
          case SOCKET_ABORT_FLOW_ERROR_KEY:
            onExecutionComplete("aborted-error");
            return;
        }
      },
      [
        canvasRef,
        goToNode,
        onEvent,
        onExecutionComplete,
        updateExecutionResults,
      ],
    );

    const updateNodeRef = useRef(updateNode);
    updateNodeRef.current = updateNode;

    useImperativeHandle(ref, () => {
      return {
        execute: (schema) => {
          run(schema);
        },
        abort,
      };
    }, [run, abort]);
    useEffect(() => {
      if (!socket) return;
      const events = [
        SOCKET_EXECUTE_FLOW_INIT_KEY,
        SOCKET_EXECUTE_FLOW_ERROR_KEY,
        SOCKET_EXECUTE_FLOW_RESULT_KEY,
        SOCKET_BEGIN_NODE_KEY,
        SOCKET_NODE_INPUT_KEY,
        SOCKET_NODE_OUTPUT_KEY,
        SOCKET_NODE_ERROR_KEY,
        SOCKET_NODE_LOG_KEY,
        SOCKET_END_NODE_KEY,
        SOCKET_ABORT_FLOW_RESULT_KEY,
        SOCKET_ABORT_FLOW_ERROR_KEY,
      ];
      // keep references so we can off() them later
      const handlers = {};

      events.forEach((event) => {
        const handler = (data) => {
          console.log("[ExecuteRun socket]", event, {
            node_id: data?.node_id,
            node_name: data?.node_name,
            has_result: !!data?.result,
          });
          updateNodeRef.current({
            ...data,
            event,
            event_name: event,
            data: data?.result,
          });
        };
        handlers[event] = handler;
        socket.on(event, handler);
      });

      // cleanup on unmount or before re-running effect
      return () => {
        events.forEach((event) => {
          socket.off(event, handlers[event]);
        });
      };
    }, [socket]);
    // useEffect(() => {
    //   // console.log("useeffect called", queue?.length, isAborted);
    //   // Function to process the queue
    //   const processQueue = () => {
    //     // console.log("processQueue called", queue?.length, isAborted);
    //     if (queue.length) {
    //       const data = queue[0];
    //       updateNode(data);
    //       setQueue((prev) => prev.slice(1));
    //     }
    //   };
    //   // Set up the interval if the queue is not empty
    //   if (queue.length && !intervalRef.current) {
    //     // console.log("set interval called", queue?.length, isAborted);
    //     intervalRef.current = setInterval(
    //       () => {
    //         processQueue();
    //       },
    //       isAborted ? 50 : 350,
    //     );
    //   }
    //   // Clean up the interval when the queue is empty or component unmounts
    //   return () => {
    //     // console.log("cleanup called", queue?.length, isAborted);
    //     if (intervalRef.current) {
    //       clearInterval(intervalRef.current);
    //       intervalRef.current = null;
    //     }
    //   };
    // }, [queue, updateNode, setQueue, isAborted]);
    return <></>;
  },
);

export default ExecuteRun;
