import _ from "lodash";
import { VALIDATION_MESSAGE } from "../constant/validationMessages";

export const timeValidation = (answer, node) => {
  let error = "";
  const answerObj = answer[node?._id];

  const isResponseEmpty = _.isEmpty(answerObj?.response);
  if (isResponseEmpty || answerObj?.response?.time === "") {
    if (node?.config?.settings?.required) {
      error = VALIDATION_MESSAGE.COMMON.REQUIRED;
    }
  } else {
    if (answerObj["response"] === undefined) {
      answerObj["response"] = "";
    }
    const { config } = node;
    const isTwentyFourHour = config?.settings?.isTwentyFourHour;
    const regexForTwelveHour = new RegExp(/^(0?[1-9]|1[0-2]):([0-5][0-9])$/);
    const regexForTwentyFourHour = new RegExp(
      /^(0?[0-9]|1[0-9]|2[0-3]):([0-5][0-9])$/
    );

    if (isTwentyFourHour) {
      if (!regexForTwentyFourHour.test(answerObj?.response?.time)) {
        error = VALIDATION_MESSAGE.TIME.INVALID_TIME;
      }
    }

    if (!isTwentyFourHour) {
      if (!regexForTwelveHour.test(answerObj?.response?.time)) {
        error = VALIDATION_MESSAGE.TIME.INVALID_TIME;
      }
    }
  }
  return error;
};
