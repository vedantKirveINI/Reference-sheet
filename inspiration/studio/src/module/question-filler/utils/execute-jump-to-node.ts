import { isEmpty } from "lodash";
import { VALIDATION_MESSAGE } from "../constant/validationMessages";
import { resolveFXContent } from "./resolve-fx-content";

export const executeJumpToNode = ({
  node,
  stagedPipeline,
  stagedAnswers,
  answeredIds,
}) => {
  const nodeIdToJumpOn = node?.config?.jump_to_id;
  const indexInPipeline = stagedPipeline.findIndex((item) => {
    return item.qId === nodeIdToJumpOn;
  });
  const messageContent = isEmpty(node?.config?.message_content)
    ? VALIDATION_MESSAGE.JUMP_TO_NODE.GENERIC_MESSAGE
    : node?.config?.message_content;
  const resolvedMessageContent = resolveFXContent({
    answers: stagedAnswers,
    content: messageContent,
  });
  if (indexInPipeline === -1) {
    return {
      hasError: true,
      pipeline: stagedPipeline,
      answers: stagedAnswers,
    };
  }

  const pipelineTemp = structuredClone(stagedPipeline);
  const answersTemp = structuredClone(stagedAnswers);
  const qIdsToRemove = pipelineTemp
    .splice(indexInPipeline + 1)
    .map((item) => item.qId);
  qIdsToRemove.forEach((qId) => {
    delete answersTemp[qId];
    answeredIds.delete(qId);
  });
  delete answersTemp[nodeIdToJumpOn];
  answeredIds.delete(nodeIdToJumpOn);

  return {
    hasError: false,
    pipeline: pipelineTemp,
    answers: answersTemp,
    jumpToNodeId: nodeIdToJumpOn,
    message:
      resolvedMessageContent ?? VALIDATION_MESSAGE.JUMP_TO_NODE.GENERIC_MESSAGE,
  };
};
