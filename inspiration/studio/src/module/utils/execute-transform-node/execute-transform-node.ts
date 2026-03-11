import { ExecuteTransformNodeOptions, TStateMap } from "./types";
import { componentSDKServices, variableSDKServices } from "../services";
import { QuestionType } from "@oute/oute-ds.core.constants";

export const executeTransformNode = async ({
  currentNode,
  allNodes,
  answers,
  taskGraph,
  type = "HTTP",
  variables = {},
}: ExecuteTransformNodeOptions): Promise<any> => {
  const formSchema =
    await componentSDKServices.variableAsFormSchema(currentNode);

  const transformedVariablesState =
    await variableSDKServices.transformedToState(variables);

  const stateMapResult = await componentSDKServices.formSchemaToState(
    formSchema?.result
  );

  const stateMap: TStateMap | undefined = stateMapResult?.result;

  let states = {};

  if (!stateMap) throw new Error("Form schema to state failed");

  Object.keys(stateMap).forEach((key) => {
    const ans = answers[key];
    const node = allNodes[key];
    if (Object.prototype.hasOwnProperty.call(stateMap[key], "response")) {
      states = {
        ...states,
        [key]: { response: ans?.response },
      };
    } else if (node.type === QuestionType.CONNECTION) {
      states = {
        ...states,
        [key]: ans,
      };
    } else {
      states = {
        ...states,
        [key]: ans?.response ?? ans,
      };
    }
  });

  const workflowConfig = {
    flow: {
      flow: allNodes,
      task_graph: taskGraph,
    },
    state: { ...states, ...(transformedVariablesState?.result || {}) },
    type: type,
    task_id: currentNode?._id,
  };

  const response =
    await componentSDKServices.executeTransformedNode(workflowConfig);

  return response;
};
