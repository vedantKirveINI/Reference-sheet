import { VALIDATION_MESSAGE } from "../constant/validationMessages";

export const currencyValidation = (answer, node) => {
  let error = "";
  const answerObj = answer[node?._id];

  if (answerObj === undefined || !answerObj?.response?.currencyValue) {
    if (node?.config?.settings?.required) {
      error = VALIDATION_MESSAGE.COMMON.REQUIRED;
      return error;
    }
  } else {
    if (answerObj["response"] === undefined) {
      answerObj["response"] = "";
    }

    const currencyValue = answerObj?.response?.currencyValue;

    if (currencyValue < 0) {
      error = VALIDATION_MESSAGE.CURRENCY.NEGATIVE_NOT_ALLOWED;
      return error;
    }

    let minRange = node?.config?.settings?.minRange;
    let maxRange = node?.config?.settings?.maxRange;

    if (minRange.endsWith(".")) {
      minRange = parseFloat(minRange);
    }

    if (maxRange.endsWith(".")) {
      maxRange = parseFloat(maxRange);
    }

    if (minRange && answerObj["response"]?.currencyValue < minRange) {
      error = VALIDATION_MESSAGE.CURRENCY.MIN_RANGE(minRange);
      return error;
    }

    if (maxRange && answerObj["response"]?.currencyValue > maxRange) {
      error = VALIDATION_MESSAGE.CURRENCY.MAX_RANGE(maxRange);
      return error;
    }
  }
  return error;
};
