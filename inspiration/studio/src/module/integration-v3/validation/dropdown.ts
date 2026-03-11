import { VALIDATION_MESSAGE } from "../utils/constants";

export const dropdownValidation = (answer, node) => {
  let error = "";
  const answerObj = answer[node?._id];
  if (
    !answerObj?.response ||
    answerObj === undefined ||
    answerObj?.response?.length === 0
  ) {
    if (node?.config?.settings?.required) {
      error = VALIDATION_MESSAGE.COMMON.REQUIRED;
    }
  } else {
    if (answerObj["response"] === undefined) {
      answerObj["response"] = "";
    }
    const selectionType = node?.config?.settings?.selectionType;
    const exactNumber = node?.config?.settings?.exactNumber;
    const minNumber = node?.config?.settings?.minNumber;
    const maxNumber = node?.config?.settings?.maxNumber;

    if (
      selectionType === "Single" &&
      Array.isArray(answerObj?.response) &&
      answerObj.response.length > 1
    ) {
      error = VALIDATION_MESSAGE.DROPDOWN.SINGLE_SELECTION;
    }

    if (selectionType === "Exact Number") {
      const responseLength = answerObj?.response?.length || 0;
      error =
        responseLength != exactNumber
          ? VALIDATION_MESSAGE.DROPDOWN.EXACT_NUMBER(exactNumber)
          : null;
    }

    if (selectionType === "Range") {
      const responseLength = answerObj?.response?.length || 0;
      if (responseLength < minNumber || responseLength > maxNumber) {
        error = VALIDATION_MESSAGE.DROPDOWN.RANGE(minNumber, maxNumber);
      }
    }
  }
  return error;
};
