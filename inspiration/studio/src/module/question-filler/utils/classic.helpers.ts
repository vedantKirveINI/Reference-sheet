import { TNodes } from "../hooks/types";
import { TNode } from "../types";
import { isControlFlowNode } from "./helpers";

export const getQuestionIndex = (nodeIds: TNode["id"][], allNodes: TNodes) => {
  let index = 0;

  nodeIds.forEach((questionId) => {
    const currentNode = allNodes[questionId];
    const shouldNotBeCounted = isControlFlowNode(currentNode);

    if (!shouldNotBeCounted) index = index + 1;
  });

  return index;
};
