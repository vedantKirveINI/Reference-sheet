import { questionsValidation } from "./questions-validation";

export const multiQuestionPageValidation = (answer, node, ref): any => {
  const questions = node?.config?.questions ?? {};
  const QUESTION_KEYS = Object.keys(questions);
  const errors = {};

  for (const key of QUESTION_KEYS) {
    const transformedNode = {
      _id: key,
      id: key,
      type: questions[key]?.type,
      config: questions[key],
    };
    let answers = answer[node?._id]?.response;
    if (!answers?.[key]) {
      answers = {
        ...answers,
        [key]: {},
      };
    }
    const error = questionsValidation({
      answer: answers,
      node: transformedNode,
      ref: null,
    });

    if (error) {
      errors[key] = error;
    }
  }

  return errors;
};
