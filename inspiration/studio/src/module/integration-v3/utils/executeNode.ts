import cloneDeep from "lodash/cloneDeep";
import { componentSDKServices } from "../services/componentSDKServices";
import { variableSDKServices } from "../services/variablesSDKServices";
import { QuestionType } from "@oute/oute-ds.core.constants";
import OuteServicesFlowUtility from "oute-services-flow-utility-sdk";
import { isLocallyExecutableNode } from "./helpers";
import { toast } from "sonner";

const determineNodeExecutionType = (node: any): string => {
  switch (node?.type) {
    case "HTTP":
      return "HTTP";
    case "INTEGRATION":
      return "Integration";
    case "TRANSFORMER":
      return "Transformer";
    case "IFELSE":
      return "IFELSE";
    case "IFELSE_V2":
      return "IFELSE_V2";
    case "IC_WORKFLOW":
      return "IC_WORKFLOW";
    case "CREATE_SHEET_RECORD":
      return "CREATE_SHEET_RECORD";
    case "UPDATE_SHEET_RECORD":
      return "UPDATE_SHEET_RECORD";
    case "DELETE_SHEET_RECORD":
      return "DELETE_SHEET_RECORD";
    case "FIND_ALL_SHEET_RECORD":
      return "FIND_ALL_SHEET_RECORD";
    case "FIND_ONE_SHEET_RECORD":
      return "FIND_ONE_SHEET_RECORD";
    case "CREATE_SHEET_RECORD_V2":
      return "CREATE_SHEET_RECORD_V2";
    case "UPDATE_SHEET_RECORD_V2":
      return "UPDATE_SHEET_RECORD_V2";
    case "DELETE_SHEET_RECORD_V2":
      return "DELETE_SHEET_RECORD_V2";
    case "FIND_ALL_SHEET_RECORD_V2":
      return "FIND_ALL_SHEET_RECORD_V2";
    case "FIND_ONE_SHEET_RECORD_V2":
      return "FIND_ONE_SHEET_RECORD_V2";
    case "DB_INSERT":
      return "DB_INSERT";
    case "DB_FIND":
      return "DB_FIND";
    case "DB_FIND_ONE":
      return "DB_FIND_ONE";
    case "DB_UPSERT":
      return "DB_UPSERT";
    case "DB_UPDATE_MANY":
      return "DB_UPDATE_MANY";
    case "DB_DELETE_MANY":
      return "DB_DELETE_MANY";
    case "DB_EXECUTE_QUERY":
      return "DB_EXECUTE_QUERY";
    case "MATCH_PATTERN":
      return "MATCH_PATTERN";
    default:
      return "";
  }
};

const resolveFxValue = ({ variableData, answers = {} }) => {
  if (variableData?.type !== "fx") return variableData;
  const response = OuteServicesFlowUtility?.resolveValue(
    answers,
    "",
    variableData,
    null
  );

  return response?.value;
};

const executeTransformedNode = async ({
  node,
  type,
  answers,
  allNodes,
  variables = {},
  _id,
  assetId,
  canvasId,
  projectId,
  workspaceId,
}) => {
  const formSchema = await componentSDKServices.variableAsFormSchema(node);

  const transformedVariablesState =
    await variableSDKServices.transformedToState(variables);

  const { result: schemaResult = {} } =
    await componentSDKServices.formSchemaToState(formSchema?.result);
  let stateCollection = {};

  Object.keys(schemaResult).forEach((key) => {
    let answer = cloneDeep(answers[key] || {});
    const node = allNodes[key];

    // check if answer is fx value that can be resolved
    if (answer?.response?.type === "fx") {
      const resolvedValue =
        resolveFxValue({
          variableData: answer?.response,
          answers,
        }) ?? answer?.response;

      answer = {
        response: resolvedValue,
      };
    }

    // checking if response is present in resultTemp
    if (Object.prototype.hasOwnProperty.call(schemaResult[key], "response")) {
      stateCollection = {
        ...stateCollection,
        [key]: { response: answer?.response },
      };
    } else if (node?.type === QuestionType.CONNECTION) {
      stateCollection = {
        ...stateCollection,
        [key]: answer,
      };
    } else {
      stateCollection = {
        ...stateCollection,
        [key]: answer?.response ?? answer,
      };
    }
  });

  // @todo
  const configData = {
    flow: {
      _id,
      asset_id: assetId,
      canvas_id: canvasId,
      project_id: projectId,
      workspace_id: workspaceId,
      flow: {
        [node?._id]: node,
      },
    },
    state: { ...stateCollection, ...(transformedVariablesState?.result || {}) },
    type,
    task_id: node?._id,
    options: {
      src: {
        type: "INTEGRATION", // To inform sattu this is integration node so don't debit credits
      },
      nested_logs: false, // To inform sattu that don't show logs in execution history
    },
  };

  if (isLocallyExecutableNode(type)) {
    try {
      const response = await OuteServicesFlowUtility?.taskRunner?.runTask(
        configData.flow,
        configData.task_id,
        configData.state
      );
      return response;
    } catch (error) {
      return error;
    }
  }

  const res = await componentSDKServices.executeTransformedNode(configData);

  return res;
};

const executeControlFlowNode = async ({
  node,
  answers,
  allNodes,
  variables = {},
  _id,
  assetId,
  canvasId,
  projectId,
  workspaceId,
}) => {
  // if (node.type === QuestionType.FILE_PICKER) {
  //   const questionRef = getNodeRef(node.id);
  //   if (questionRef) {
  //     try {
  //       const urls = await questionRef?.uploadFiles();
  //       return { errorMessage: null, nextNodeId: null, result: urls };
  //     } catch (e) {
  //       return { errorMessage: e?.message, nextNodeId: null, result: null };
  //     }
  //   }
  // }

  let nextNodeId = null;

  try {
    const transformedNodeType = determineNodeExecutionType(node);
    const res = await executeTransformedNode({
      node,
      type: transformedNodeType,
      answers,
      allNodes,
      variables,
      _id,
      assetId,
      canvasId,
      projectId,
      workspaceId,
    });

    if (res?.status !== "success") throw new Error(`Something went wrong`);

    const result = res?.result;

    nextNodeId =
      transformedNodeType === "IFELSE" || transformedNodeType === "IFELSE_V2"
        ? result?.id
        : node?.next_node_ids?.[0];

    return { nextNodeId, result };
  } catch (error) {
    const errorMessage = error?.message;
    toast.error("Execution Error", {
      description: "Something went wrong",
    });

    return { errorMessage, nextNodeId: null, result: null };
  }
};

export {
  executeControlFlowNode,
  determineNodeExecutionType,
  executeTransformedNode,
};
