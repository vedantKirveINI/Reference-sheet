import { VALIDATION_MESSAGE } from "../constant/validationMessages";

export const collectPaymentsValidation = (answer, node) => {
  let error = "";
  const answerObj = answer[node?._id];
  if (!answerObj?.response?.paymentId) {
    if (node?.config?.settings?.required) {
      error = VALIDATION_MESSAGE.COMMON.REQUIRED;
    }
  }
  return error;
};
