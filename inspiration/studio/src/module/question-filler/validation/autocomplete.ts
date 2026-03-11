import { VALIDATION_MESSAGE } from "../constant/validationMessages";

export const autocompleteValidation = (answer, node) => {
  let error = "";
  const answerObj = answer[node?._id];

  if (answerObj === undefined || !answerObj?.response?.id) {
    if (node?.config?.settings?.required) {
      error = VALIDATION_MESSAGE.AUTOCOMPLETE.REQUIRED;
    }
  }
  return error;
};
