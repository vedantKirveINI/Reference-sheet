import { VALIDATION_MESSAGE } from "../constant/validationMessages";

export const pictureValidation = (answer, node) => {
  const answerObj = answer?.[node?._id];

  const answerCount = answerObj?.response?.length;

  if (
    (!answerObj || !answerObj.response || answerCount === 0) &&
    node?.config?.settings?.required
  ) {
    return VALIDATION_MESSAGE.COMMON.REQUIRED;
  }

  const { config } = node;

  if (config.settings.selection?.type === "Exact Number") {
    const exactNumber = config.settings.selection.exactNumber;

    if (answerCount !== exactNumber) {
      return VALIDATION_MESSAGE.PICTURE.EXACT_NUMBER(exactNumber);
    }
  }

  return "";
};
