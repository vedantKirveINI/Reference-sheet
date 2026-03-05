import { VALIDATION_MESSAGE } from "../constant/validationMessages";

/**
 * Validates ranking questions based on the user's answers and question configuration settings.
 * @param {Object} answer - An object containing the user's answers to the ranking questions.
 * @param {Object} node - An object representing the current ranking question.
 * @returns {string} The error message indicating whether the user's answer is valid or not.
 */
export const rankingValidation = (answer, node) => {
  const answerObj = answer?.[node?._id];

  const hasNotCompletedRanking = answerObj?.response?.value?.find(
    (ans) => ans?.rank === null
  );

  if (
    (!answerObj || !answerObj.response || hasNotCompletedRanking) &&
    node.config.settings.required
  ) {
    return VALIDATION_MESSAGE.COMMON.REQUIRED;
  }

  return "";
};
