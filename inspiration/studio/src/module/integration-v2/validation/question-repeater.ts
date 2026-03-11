import { questionsValidation } from "./questions-validation";

export const questionRepeaterValidation = (
  answer: any,
  node: any
  // onNestedErrors: (errors: Record<string, string>[]) => void
): string => {
  const nodeId = node?._id || node?.id;
  const response = answer[nodeId]?.response || [];
  const questions = node?.config?.questions || {};
  const QUESTION_KEYS = Object.keys(questions);
  const errors = [];

  for (const value of response) {
    const valueError = {};
    for (const key of QUESTION_KEYS) {
      const transformedNode = {
        _id: key,
        id: key,
        type: questions[key]?.type,
        config: questions[key],
      };

      let answers = {
        [key]: value?.[key],
      };

      if (!answers?.[key]) {
        answers = {
          [key]: {},
        };
      }

      const error = questionsValidation({
        answer: answers,
        node: transformedNode,
        ref: null,
      });

      if (error) {
        valueError[key] = error;
      }
    }
    if (Object.keys(valueError).length > 0) {
      errors.push(valueError);
    }
  }

  // if (errors?.length > 0) {
  //   onNestedErrors(errors);
  // }

  return errors?.length > 0 ? "Please fill all the required fields" : "";
};
