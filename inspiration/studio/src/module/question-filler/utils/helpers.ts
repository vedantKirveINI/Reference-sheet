import { QuestionType } from "@src/module/constants";
import { componentSDKServices } from "../services/componentSDKServices";
import _ from "lodash";
import {
  CONTENT_NODES,
  CONTROL_FLOW_NODES,
  LOCALLY_EXECUTABLE_NODES,
  NODES_WITH_ASYNC_TASK,
  QUESTION_NODES,
} from "../constant/nodesTypes";

const INDEPENDENT_NODE_TYPES = Object.values(QuestionType);

const isDependentNode = (node) => {
  return CONTROL_FLOW_NODES.includes(node.type);
};

const isControlFlowNode = (node) => {
  return CONTROL_FLOW_NODES.includes(node.type);
};

const isQuestionNode = (node) => {
  return QUESTION_NODES.includes(node.type);
};

const isAsyncTaskNode = (node) => {
  return NODES_WITH_ASYNC_TASK.includes(node.type);
};

const isLocallyExecutableNode = (type: string | undefined) => {
  if (!type) return false;

  return Object.values(LOCALLY_EXECUTABLE_NODES).includes(
    type as LOCALLY_EXECUTABLE_NODES
  );
};

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

const executeTransformedNode = async ({
  currentNode,
  type = "HTTP",
  answers,
  allNodes,
  taskGraph,
}) => {
  const formSchema =
    await componentSDKServices.variableAsFormSchema(currentNode);
  const { result: resultTemp }: any =
    (await componentSDKServices.formSchemaToState(formSchema?.result)) as any;

  let tempObj = {} as any;
  Object.keys(resultTemp).forEach((key) => {
    const ans = answers[key];
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
      flow: allNodes,
      task_graph: taskGraph,
    },

    state: tempObj, // answersTemp,
    type, // "HTTP", // IFELSE
    task_id: currentNode?._id,
  };
  const res = await componentSDKServices.executeTransformedNode(configData);
  // setAnswers((ans) => {
  //   return { ...ans, [currentNode?._id]: { response: res?.result } };
  // });
  return res;
};

const getIndependentNodes = (
  startNodeId,
  selectedNodes = [],
  initNodeType,
  allNodes
) => {
  // if any independent node already added then dont add other type of node
  // if 1st node is other type then break
  const question = allNodes[startNodeId];
  // eslint-disable-next-line no-param-reassign
  initNodeType = initNodeType ?? question.type; // short text
  if (INDEPENDENT_NODE_TYPES?.includes(question?.type)) {
    selectedNodes.push({ qId: question._id, index: selectedNodes?.length });
    if (question?.config?.settings?.isPhoneValidationEnabled) {
      return selectedNodes;
    }
    if (question.next_node_ids[0]) {
      getIndependentNodes(
        question.next_node_ids[0],
        selectedNodes,
        initNodeType,
        allNodes
      );
    }
  } else {
    if (INDEPENDENT_NODE_TYPES?.includes(initNodeType)) {
      return selectedNodes;
    }
    selectedNodes.push({ qId: question._id });
  }
  return selectedNodes;
};

const sanitizedAnswers = ({ answers, pipeline = [] }) => {
  if (_.isEmpty(answers) || !Array.isArray(pipeline)) return {};
  const filteredAnswers = {};
  pipeline.forEach((question) => {
    filteredAnswers[question?.qId] = {
      response: answers[question?.qId]?.response,
    };
  });
  return filteredAnswers;
};

const isContentNode = (node) => {
  return CONTENT_NODES.includes(node.type);
};

const getQuestionIndex = (pipeline, allNodes) => {
  let index = 0;
  pipeline.forEach((question) => {
    const shouldNotBeCounted =
      isContentNode(allNodes[question?.qId]) ||
      allNodes[question?.qId]?.type === QuestionType.LOADING;
    if (!shouldNotBeCounted) index = index + 1;
  });

  return index;
};

export {
  isLocallyExecutableNode,
  executeTransformedNode,
  getIndependentNodes,
  INDEPENDENT_NODE_TYPES,
  isDependentNode,
  sanitizedAnswers,
  getQuestionIndex,
  isContentNode,
  isControlFlowNode,
  isAsyncTaskNode,
  isQuestionNode,
};
