import React from "react";
import { QuestionType } from "@src/module/constants";
import { CONTENT_NODES, QUESTION_NODES } from "../../constant/nodesTypes";

export const ProgressBar = ({ bgcolor, allNodes, pipeline, answers, qId }) => {
  const totalQuestionsCount = () => {
    let count = 0;
    const getNext = (quesId) => {
      const nextNodes = allNodes[quesId]?.next_node_ids;
      if (nextNodes?.length === 1) {
        if (
          QUESTION_NODES?.includes(allNodes[qId]?.type) &&
          !CONTENT_NODES?.includes(allNodes[qId]?.type) &&
          allNodes[qId]?.type !== QuestionType.LOADING
        ) {
          count = count + 1;
        }
        getNext(nextNodes[0]);
      }
    };
    getNext(qId);
    return count;
  };

  const getPercentage = () => {
    const isRequired = allNodes[qId]?.config?.settings?.required;
    if (isRequired) {
      if (answers[qId]) {
        return (
          (100 / (totalQuestionsCount() + pipeline?.length)) * pipeline?.length
        );
      } else {
        return (
          (100 / (totalQuestionsCount() + pipeline?.length)) *
          (pipeline?.length - 1)
        );
      }
    }
    return (
      (100 / (totalQuestionsCount() + pipeline?.length)) * pipeline?.length
    );
  };

  return (
    <div
      style={{
        height: 4,
        width: "100%",
        // backgroundColor: "whitesmoke",
        borderRadius: 40,
        position: "absolute",
        top: 0,
        zIndex: "1",
      }}
    >
      <div
        style={{
          height: "100%",
          width: `${getPercentage()}%`,
          backgroundColor: bgcolor,
          borderRadius: 40,
          textAlign: "right",
          transition: "width 0.5s ease-in-out",
        }}
      ></div>
    </div>
  );
};
