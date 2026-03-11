import { VALIDATION_MESSAGE } from "../constant/validationMessages";

export const shortAndLongTextValidation = (answer, node) => {
  let error = "";
  const answerObj = answer[node?._id];

  if (!answerObj?.response?.trim()) {
    if (node?.config?.settings?.required) {
      error = VALIDATION_MESSAGE.COMMON.REQUIRED;
    }
  } else {
    if (answerObj["response"] === undefined) {
      answerObj["response"] = "";
    }
    const { config } = node;
    const minChar = config?.settings?.minChar;
    const maxChar = config?.settings?.maxChar;
    const answer = answerObj?.response;

    if (minChar && answer && answer?.length < minChar) {
      error =
        node.type === "SHORT_TEXT"
          ? VALIDATION_MESSAGE.SHORT_TEXT.MIN_CHAR(minChar)
          : VALIDATION_MESSAGE.LONG_TEXT.MIN_CHAR(minChar);
      return error;
    }

    if (maxChar && answer && answer?.length > maxChar) {
      error =
        node.type === "SHORT_TEXT"
          ? VALIDATION_MESSAGE.SHORT_TEXT.MAX_CHAR(maxChar)
          : VALIDATION_MESSAGE.LONG_TEXT.MAX_CHAR(maxChar);
      return error;
    }

    const regexValue = config?.settings?.regex?.value;
    const regexError = config?.settings?.regex?.error;

    if (regexValue) {
      let inputRegex = regexValue?.trim();
      const slashAtStart = inputRegex?.indexOf("/") === 0;
      const slashAtEnd =
        inputRegex?.lastIndexOf("/") === inputRegex?.length - 1;
      if (slashAtStart && slashAtEnd) {
        inputRegex = inputRegex?.substring(1, inputRegex?.length - 1);
      }
      const regex = new RegExp(inputRegex);
      if (regex && answer && !regex.test(answer?.trim())) {
        error = regexError
          ? regexError
          : VALIDATION_MESSAGE.COMMON.INVALID_INPUT;
      }
    }
  }
  return error;
};
