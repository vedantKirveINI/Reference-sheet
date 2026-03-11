import { VALIDATION_MESSAGE } from "../constant/validationMessages";

/**
 * Validates multiple-choice questions based on the user's answers and question configuration settings.
 * @param {Object} answer - An object containing the user's answers to the multiple-choice questions.
 * @param {Object} node - An object representing the current multiple-choice question.
 * @returns {string} The error message indicating whether the user's answer is valid or not.
 */
export const mcqValidation = (answer, node) => {
  const answerObj = answer?.[node?._id];

  const answerCount = answerObj?.response?.value?.length;

  if (
    (!answerObj || !answerObj.response?.value || answerCount === 0) &&
    node.config.settings.required
  ) {
    return VALIDATION_MESSAGE.COMMON.REQUIRED;
  }

  if (
    !node.config.settings.required &&
    (!answerObj.response?.value || answerCount === 0)
  ) {
    return "";
  }

  const { config } = node;

  if (config.settings.selection?.type === "Exact Number") {
    const exactNumber = config.settings.selection.exactNumber;

    if (answerCount != exactNumber) {
      return VALIDATION_MESSAGE.MCQ.EXACT_NUMBER(exactNumber);
    }
  }

  if (config.settings.selection?.type === "Range") {
    const { start, end } = config.settings.selection.range;
    if (answerCount < start || answerCount > end) {
      return VALIDATION_MESSAGE.MCQ.RANGE(start, end);
    }
  }

  return "";
};
