import { TNode } from "../types";
import { QuestionType } from "@src/module/constants";
import { shortAndLongTextValidation } from "./short-and-long-text";
import { mcqValidation } from "./mcq";
import { phoneNumberValidation } from "./phone-number";
import { rankingValidation } from "./ranking";
import { yesNoValidation } from "./yes-no";
import { emailValidation } from "./email";
import { dateValidation } from "./date";
import { currencyValidation } from "./currency";
import { numberValidation } from "./numberValidation";
import { dropdownValidation } from "./dropdown";
import { scqValidation } from "./scq";
import { filePickerValidation } from "./file-picker";
import { timeValidation } from "./time";
import { signatureValidation } from "./signature";
import { addressValidation } from "./address";
import { autocompleteValidation } from "./autocomplete";
import { zipCodeValidation } from "./zipcode";
import { multiQuestionPageValidation } from "./multi-question-page-validation";
import { pictureValidation } from "./picture";
import { collectPaymentsValidation } from "./collectPayments";
import { ratingValidation } from "./rating";
import { sliderValidation } from "./slider";
import { opinionScaleValidation } from "./opinion-scale";
import { stripePaymentValidation } from "./stripe-payment";
import { legalTermsValidation } from "./legal-terms";

export const questionsValidation = ({
  node,
  answer,
  ref,
}: {
  node: TNode;
  answer: any;
  ref: any;
}): string => {
  let error = "";

  switch (node.type) {
    case QuestionType.MULTI_QUESTION_PAGE:
      error = multiQuestionPageValidation(answer, node, ref);
      break;
    case QuestionType.AUTOCOMPLETE:
      error = autocompleteValidation(answer, node);
      break;
    case QuestionType.SHORT_TEXT:
      error = shortAndLongTextValidation(answer, node);
      break;
    case QuestionType.LONG_TEXT:
      error = shortAndLongTextValidation(answer, node);
      break;
    case QuestionType.MCQ:
      error = mcqValidation(answer, node);
      break;
    case QuestionType.PHONE_NUMBER:
      error = phoneNumberValidation(answer, node);
      break;
    case QuestionType.RANKING:
      error = rankingValidation(answer, node);
      break;
    case QuestionType.YES_NO:
      error = yesNoValidation(answer, node);
      break;
    case QuestionType.EMAIL:
      error = emailValidation(answer, node);
      break;
    case QuestionType.SIGNATURE:
      error = signatureValidation(answer, node, ref);
      break;
    case QuestionType.DATE:
      error = dateValidation(answer, node);
      break;
    case QuestionType.TIME:
      error = timeValidation(answer, node);
      break;
    case QuestionType.CURRENCY:
      error = currencyValidation(answer, node);
      break;
    case QuestionType.NUMBER:
      error = numberValidation(answer, node);
      break;
    case QuestionType.DROP_DOWN:
      error = dropdownValidation(answer, node);
      break;
    case QuestionType.SCQ:
      error = scqValidation(answer, node);
      break;
    case QuestionType.FILE_PICKER:
      error = filePickerValidation(ref);
      break;
    case QuestionType.ADDRESS:
      error = addressValidation(answer, node);
      break;
    case QuestionType.ZIP_CODE:
      error = zipCodeValidation(answer, node);
      break;
    case QuestionType.PICTURE:
      error = pictureValidation(answer, node);
      break;
    case QuestionType.COLLECT_PAYMENT:
      error = collectPaymentsValidation(answer, node);
      break;
    case QuestionType.RATING:
      error = ratingValidation(answer, node);
      break;
    case QuestionType.SLIDER:
      error = sliderValidation(answer, node, ref);
      break;
    case QuestionType.OPINION_SCALE:
      error = opinionScaleValidation(answer, node);
      break;
    case QuestionType.STRIPE_PAYMENT:
      error = stripePaymentValidation(answer, node, ref);
      break;
    case QuestionType.TERMS_OF_USE:
      error = legalTermsValidation(answer, node);
      break;
    default:
      break;
  }

  return error;
};
