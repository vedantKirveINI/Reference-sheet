import { VALIDATION_MESSAGE } from "../constant/validationMessages";

export const sliderValidation = (answer, node, ref) => {
  let error = "";
  const answerObj = answer[node?._id];

  if (
    answerObj === undefined ||
    answerObj?.response === null ||
    isNaN(answerObj?.response)
  ) {
    if (node?.config?.settings?.required) {
      error = VALIDATION_MESSAGE.COMMON.REQUIRED;
    }
  }

  return error;
};
