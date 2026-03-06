import { QuestionType } from "@oute/oute-ds.core.constants";
import {
  CONTROL_FLOW_NODES,
  LOCALLY_EXECUTABLE_NODES,
  QUESTION_NODES,
  REFRESHABLE_QUESTION_TYPES,
} from "./constants";
import { cloneDeep } from "lodash";

const isControlFlowNode = (node) => {
  return CONTROL_FLOW_NODES.includes(node.type);
};

const isQuestionNode = (node) => {
  return QUESTION_NODES.includes(node.type);
};

const isLocallyExecutableNode = (type) => {
  if (!type) return false;
  return LOCALLY_EXECUTABLE_NODES.includes(type);
};

const scrollToNode = (nodeId: string | null, triedOnce = false) => {
  if (!nodeId) return;

  requestAnimationFrame(() => {
    const el = document.getElementById(nodeId);

    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    } else if (!triedOnce) {
      setTimeout(() => scrollToNode(nodeId, true), 300);
    }
  });
};

const getInitialPipeline = (initalPipeline, allNodes) => {
  if (typeof initalPipeline === "object") {
    return Object.values(initalPipeline);
  }
  return initalPipeline;
  // if (Array.isArray(initalPipeline)) {
  //   const pipelineHashMap = {};
  //   initalPipeline.forEach((node) => {
  //     if (allNodes[node.qId])
  //       pipelineHashMap[node.qId] = {
  //         qId: node.qId,
  //         index: node.index,
  //       };
  //   });

  //   return pipelineHashMap;
  // }
  // return initalPipeline || {};
};

const getAncestorNodeValue = (answers, ancestorNode) => {
  switch (ancestorNode?.type) {
    case QuestionType.DROP_DOWN_STATIC:
      return answers?.[ancestorNode?.id]?.response;
    default:
      return answers?.[ancestorNode?.id];
  }
};

const shouldBreak = ({ answers, node, executedNodes, allNodes }) => {
  const config = node?.config;
  // used_ref_src_ids -> prev nodes that are being used in this node
  const ancestorNodes = config?.used_ref_src_ids || [];

  if (ancestorNodes.length === 0) return false;

  for (const ancestor of ancestorNodes) {
    if (!executedNodes.includes(ancestor)) continue;
    const ancestorNodeValue = getAncestorNodeValue(answers, allNodes[ancestor]);
    if (!ancestorNodeValue) return true;
  }

  return false;
};

const checkFurtherNodeDependency = ({ node, allNodes, pipeline }) => {
  const nextNodeIds = node?.next_node_ids;
  if (nextNodeIds.length === 0) {
    return pipeline;
  }

  // Picking 0th index because this will run only on question types and they will ony have 1 node as next node
  const next_node_type = allNodes[nextNodeIds[0]]?.type;
  if (next_node_type === "IC_WORKFLOW") {
    return pipeline;
  }

  const pipelineKeys = pipeline?.map((node) => node?.qId);

  // Find that this node is used in which node at first
  const indexOfFirstUsageOccurence = pipelineKeys.findIndex((key) => {
    const currentNode = allNodes[key];
    const usedRefSrcIds = currentNode?.config?.used_ref_src_ids || [];
    if (usedRefSrcIds?.includes(node?.id)) {
      return true;
    }
  });

  // If the node is being used in any other node then remove all the nodes in pipeline following it
  if (indexOfFirstUsageOccurence !== -1) {
    const slicedPipeline = pipeline?.slice(0, indexOfFirstUsageOccurence);

    return cloneDeep(slicedPipeline);
  }

  return pipeline;
};

const canRefreshQuestion = (question: any, allNodes: any = {}) => {
  const type = question?.type;
  if (REFRESHABLE_QUESTION_TYPES.includes(type)) {
    switch (type) {
      case QuestionType.DROP_DOWN:
        const triggerNodeId = question?.used_ref_src_ids?.find(
          (refNodeId: string) => {
            const refNode = allNodes[refNodeId];
            if (["HTTP"].includes(refNode?.type)) return true;
          }
        );

        if (triggerNodeId) {
          return true;
        }

        return question?.settings?.optionsType === "Dynamic";
      default:
        return false;
    }
  }

  return false;
};

export {
  scrollToNode,
  getInitialPipeline,
  shouldBreak,
  isControlFlowNode,
  isQuestionNode,
  isLocallyExecutableNode,
  checkFurtherNodeDependency,
  canRefreshQuestion,
};
