import { VALIDATION_MESSAGE } from "../constant/validationMessages";

export const legalTermsValidation = (answer, node): string => {
  let error = "";
  const answerObj = answer[node?._id];
  if (
    answerObj === undefined ||
    answerObj?.response === null ||
    answerObj?.response === undefined ||
    answerObj?.response === ""
  ) {
    if (node?.config?.settings?.required) {
      error = VALIDATION_MESSAGE.COMMON.REQUIRED;
    }
  }
  return error;
};
