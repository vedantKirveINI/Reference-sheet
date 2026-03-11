import { QuestionType } from "@src/module/constants";
import { componentSDKServices } from "../services/componentSDKServices";
import { variableSDKServices } from "../services/variableSDKServices";
import { isLocallyExecutableNode } from "./helpers";
import OuteServicesFlowUtility from "oute-services-flow-utility-sdk";

const sanitizeState = (state, flow) => {
  const sanitizedState = {};
  Object.keys(state).forEach((key) => {
    const node = flow[key];
    if (node?.type === QuestionType.CONNECTION) {
      sanitizedState[key] = {
        ...state[key]?.configs,
        authorized_data: { ...state[key], id: state[key]?._id },
      };
      return;
    }
    sanitizedState[key] = state[key];
  });
  return sanitizedState;
};

export const getNodeTypeToExecuteTransformedNode = (node: any): string => {
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
    case "GPT":
      return "GPT";
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
    case "CREATE_RECORD_V2":
      return "CREATE_RECORD_V2";
    case "UPDATE_RECORD_V2":
      return "UPDATE_RECORD_V2";
    case "DELETE_RECORD_V2":
      return "DELETE_RECORD_V2";
    case "DB_FIND_ALL_V2":
      return "DB_FIND_ALL_V2";
    case "DB_FIND_ONE_V2":
      return "DB_FIND_ONE_V2";
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
    case "SELF_EMAIL":
      return "SELF_EMAIL";
    case "AGENT_WORKFLOW":
      return "AGENT_WORKFLOW";
    case "PERSON_ENRICHMENT":
      return "PERSON_ENRICHMENT";
    case "EMAIL_ENRICHMENT":
      return "EMAIL_ENRICHMENT";
    case "COMPANY_ENRICHMENT":
      return "COMPANY_ENRICHMENT";
    case "UPDATE_ONE_SHEET_RECORD":
      return "UPDATE_ONE_SHEET_RECORD";
    default:
      return "";
  }
};

export const executeTransformedNode = async ({
  currentNode,
  type = "HTTP",
  answers,
  allNodes,
  taskGraph,
  variables = {},
  executeNodeDependencies,
}) => {
  const formSchema =
    await componentSDKServices.variableAsFormSchema(currentNode);

  const transformedVariablesState =
    await variableSDKServices.transformedToState(variables);

  const { result: resultTemp }: any =
    (await componentSDKServices.formSchemaToState({
      ...formSchema?.result,
      parse_with_defaults: true,
    })) as any;

  let tempObj = {} as any;
  Object.keys(resultTemp).forEach((key) => {
    const ans = answers[key];
    //checking if response is present in resultTemp
    if (Object.prototype.hasOwnProperty.call(resultTemp[key], "response")) {
      tempObj = {
        ...tempObj,
        [key]: { response: ans?.response },
      };
    } else {
      tempObj = {
        ...tempObj,
        [key]: ans?.response ?? ans,
      };
    }
  });

  tempObj = sanitizeState(tempObj, allNodes);
  const configData = {
    flow: {
      _id: executeNodeDependencies?._id,
      asset_id: executeNodeDependencies?.assetId,
      canvas_id: executeNodeDependencies?.canvasId,
      project_id: executeNodeDependencies?.projectId,
      workspace_id: executeNodeDependencies?.workspaceId,
      snapshot_canvas_id: executeNodeDependencies?.snapshotCanvasId,
      flow: allNodes,
      task_graph: taskGraph,
    },
    state: { ...tempObj, ...(transformedVariablesState?.result || {}) },
    type,
    task_id: currentNode?._id,
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
