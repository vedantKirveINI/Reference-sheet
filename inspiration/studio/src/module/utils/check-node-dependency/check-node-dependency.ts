import _ from "lodash";

import { QuestionConfig, TCheckNodeDependencyProps } from "./types";

export const checkNodeDependency = ({
  answers,
  node,
  executedNodesHashSet = new Set(),
}: TCheckNodeDependencyProps): boolean => {
  const config = node?.config as QuestionConfig;
  const usedRefNodes = config?.used_ref_src_ids || [];

  if (usedRefNodes.length === 0) return false;

  for (const refNodeId of usedRefNodes) {
    if (!executedNodesHashSet.has(refNodeId)) continue;
    if (!answers[refNodeId]) return true;
  }

  return false;
};
