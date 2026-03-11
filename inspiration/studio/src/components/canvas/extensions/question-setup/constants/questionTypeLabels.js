import { QuestionType } from "../../../../../module/constants";

export const QUESTION_TYPE_LABELS = {
  [QuestionType.SHORT_TEXT]: "Short Answer",
  [QuestionType.LONG_TEXT]: "Long Answer",
  [QuestionType.MCQ]: "Multiple Choice",
  [QuestionType.SCQ]: "Single Choice",
  [QuestionType.YES_NO]: "Yes or No",
  [QuestionType.EMAIL]: "Email Address",
  [QuestionType.PHONE_NUMBER]: "Phone Number",
  [QuestionType.NUMBER]: "Number",
  [QuestionType.CURRENCY]: "Currency Amount",
  [QuestionType.DATE]: "Date Picker",
  [QuestionType.TIME]: "Time Picker",
  [QuestionType.FILE_PICKER]: "File Upload",
  [QuestionType.SIGNATURE]: "Signature",
  [QuestionType.RATING]: "Star Rating",
  [QuestionType.OPINION_SCALE]: "Opinion Scale",
  [QuestionType.SLIDER]: "Slider",
  [QuestionType.RANKING]: "Ranking",
  [QuestionType.DROP_DOWN]: "Dropdown",
  [QuestionType.DROP_DOWN_STATIC]: "Static Dropdown",
  [QuestionType.ADDRESS]: "Address",
  [QuestionType.ZIP_CODE]: "Zip Code",
  [QuestionType.WELCOME]: "Welcome Screen",
  [QuestionType.ENDING]: "Thank You Screen",
  [QuestionType.QUOTE]: "Statement",
  [QuestionType.PICTURE]: "Picture Choice",
  [QuestionType.AUTOCOMPLETE]: "Search & Select",
  [QuestionType.FORMULA_BAR]: "Calculated Field",
  [QuestionType.KEY_VALUE_TABLE]: "Data Table",
  [QuestionType.COLLECT_PAYMENT]: "Payment",
  [QuestionType.STRIPE_PAYMENT]: "Stripe Payment",
  [QuestionType.TERMS_OF_USE]: "Terms & Conditions",
  [QuestionType.PDF_VIEWER]: "PDF Viewer",
  [QuestionType.TEXT_PREVIEW]: "Text Block",
  [QuestionType.LOADING]: "Loading Screen",
  [QuestionType.CONNECTION]: "Connection",
  [QuestionType.QUESTIONS_GRID]: "Matrix",
  [QuestionType.QUESTION_REPEATER]: "Repeating Section",
  [QuestionType.MULTI_QUESTION_PAGE]: "Question Group",
};

export function getQuestionTypeLabel(type) {
  if (!type) return "";
  return QUESTION_TYPE_LABELS[type] || formatFallbackLabel(type);
}

function formatFallbackLabel(type) {
  return type
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

export default QUESTION_TYPE_LABELS;
