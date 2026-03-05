import {
  QuestionType,
  removeTagsFromString,
} from "../../../../../module/constants";
import {
  INDEPENDENT_QUESTIONS_TYPE,
  QUESTION_ID_SEPERATOR,
  UNMAPPABLE_QUESTIONS_TYPE,
} from "../constants";

export const getInitialNodeMapping = ({ questions }) => {
  const mappings = questions.map((node) => {
    return {
      name: removeTagsFromString(node?.question),
      columnType: "question",
      value: node?.key,
      type: node?.type,
    };
  });

  return mappings;
};

const validateColumnName = (name, existingNames, currentIndex) => {
  if (!name || name.trim() === "") return "Column name is required";
  if (existingNames.some((n, i) => i !== currentIndex && n === name.trim())) {
    return "Column name must be unique";
  }
  return null;
};

const validateColumnValue = (value, columnType, questions) => {
  if (columnType === "question") {
    if (!value) return "Please select a question";
    const questionExists = questions.some((q) => q.key === value);
    if (!questionExists) return "Selected question is invalid";
  } else if (columnType === "static") {
    if (!value || value.trim() === "") return "Static value is required";
  }
  return null;
};

export const validateFormResponsesMapping = ({ mappings, questions }) => {
  return mappings.some((row) => {
    const nameError = validateColumnName(row.name, questions);
    const valueError = validateColumnValue(
      row.value,
      row.columnType,
      questions
    );
    return nameError || valueError;
  });
};

export const getTransformedNodeData = (nodeDataArray) => {
  const transformedNodeData = [];

  for (const node of nodeDataArray) {
    const go_data = node?.go_data;

    const canSkip =
      !INDEPENDENT_QUESTIONS_TYPE.includes(go_data?.type) ||
      UNMAPPABLE_QUESTIONS_TYPE.includes(go_data?.type);

    if (canSkip) continue;

    let title = removeTagsFromString(go_data?.question);
    title = title?.trim();

    if (!title) {
      continue;
    }
    if (go_data?.type === QuestionType.MULTI_QUESTION_PAGE) {
      const questions = go_data?.questions;

      for (const questionId of Object.keys(questions)) {
        const question = questions[questionId];

        let subQuestionTitle = removeTagsFromString(question?.question);
        subQuestionTitle = subQuestionTitle?.trim();
        if (!subQuestionTitle) {
          continue;
        }
        transformedNodeData.push({
          ...question,
          question: `${title}-${subQuestionTitle}`,
          key: `${node?.key}${QUESTION_ID_SEPERATOR}${questionId}`,
        });
      }
      continue;
    }

    transformedNodeData.push({
      ...go_data,
      question: title,
      key: node?.key,
    });
  }

  return transformedNodeData;
};

export const getAutoUpdatedMappingData = ({
  nodeDataArray,
  initialMappedData,
}) => {
  const unmappedData = nodeDataArray.filter((nodeData) => {
    // if nodeData is not in mappedData, then it is unmapped and some return false
    // we make it true by !mappedData.some
    return !initialMappedData.some((mappedDataItem) => {
      return (
        mappedDataItem.value === nodeData?.combinedQuestionId ||
        mappedDataItem.value === nodeData?.key
      );
    });
  });
  const autoUpdatedData = [];

  unmappedData?.forEach((item) => {
    const shouldNotInclude = initialMappedData.some((mappedDataItem) => {
      return mappedDataItem.name === removeTagsFromString?.(item?.question);
    });

    if (shouldNotInclude) return;

    autoUpdatedData.push({
      name: item?.question,
      type: item?.type,
      value: item?.key,
      columnType: "question",
    });
  });
  return [...initialMappedData, ...autoUpdatedData];
};
