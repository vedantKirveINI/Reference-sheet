import ClassicFooter from "../components/classic-footer";
import { VALIDATION_MESSAGE } from "../constant/validationMessages";

/**
 * Validates single-choice questions based on the user's answers and question configuration settings.
 * @param {Object} answer - An object containing the user's answers to the single-choice questions.
 * @param {Object} node - An object representing the current single-choice question.
 * @returns {string} The error message indicating whether the user's answer is valid or not.
 */
export const ratingValidation = (answer, node) => {
  const answerObj = answer?.[node?._id];

  const answerCount = answerObj?.response?.length;

  if (
    (!answerObj || !answerObj.response || answerCount === 0) &&
    node.config.settings.required
  ) {
    return VALIDATION_MESSAGE.COMMON.REQUIRED;
  }

  return "";
};
