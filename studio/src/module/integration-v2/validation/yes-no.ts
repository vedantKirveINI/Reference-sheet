import { isEmpty } from "lodash";
import { VALIDATION_MESSAGE } from "../utils/constants";

export const yesNoValidation = (answer, node): string => {
  let error = "";
  const answerObj = answer[node?._id];

  if (answerObj === undefined || isEmpty(answerObj["response"])) {
    if (node?.config?.settings?.required) {
      error = VALIDATION_MESSAGE.COMMON.REQUIRED;
    }
  }

  return error;
};
