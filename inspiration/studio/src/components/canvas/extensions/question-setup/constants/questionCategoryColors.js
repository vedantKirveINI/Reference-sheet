import { QuestionType } from "../../../../../module/constants";

export const QUESTION_CATEGORIES = {
  TEXT_INPUT: "TEXT_INPUT",
  CONTACT: "CONTACT",
  NUMBERS_TIME: "NUMBERS_TIME",
  CHOICES: "CHOICES",
  MEDIA_FILES: "MEDIA_FILES",
  LAYOUT_SPECIAL: "LAYOUT_SPECIAL",
};

export const CATEGORY_COLORS = {
  [QUESTION_CATEGORIES.TEXT_INPUT]: {
    primary: "#6366F1",
    light: "#EEF2FF",
    dark: "#4338CA",
    name: "Indigo",
  },
  [QUESTION_CATEGORIES.CONTACT]: {
    primary: "#14B8A6",
    light: "#CCFBF1",
    dark: "#0D9488",
    name: "Teal",
  },
  [QUESTION_CATEGORIES.NUMBERS_TIME]: {
    primary: "#F59E0B",
    light: "#FEF3C7",
    dark: "#D97706",
    name: "Amber",
  },
  [QUESTION_CATEGORIES.CHOICES]: {
    primary: "#10B981",
    light: "#D1FAE5",
    dark: "#059669",
    name: "Emerald",
  },
  [QUESTION_CATEGORIES.MEDIA_FILES]: {
    primary: "#F43F5E",
    light: "#FFE4E6",
    dark: "#E11D48",
    name: "Rose",
  },
  [QUESTION_CATEGORIES.LAYOUT_SPECIAL]: {
    primary: "#64748B",
    light: "#F1F5F9",
    dark: "#475569",
    name: "Slate",
  },
};

export const QUESTION_TYPE_TO_CATEGORY = {
  [QuestionType.SHORT_TEXT]: QUESTION_CATEGORIES.TEXT_INPUT,
  [QuestionType.LONG_TEXT]: QUESTION_CATEGORIES.TEXT_INPUT,
  [QuestionType.FORMULA_BAR]: QUESTION_CATEGORIES.TEXT_INPUT,

  [QuestionType.EMAIL]: QUESTION_CATEGORIES.CONTACT,
  [QuestionType.PHONE_NUMBER]: QUESTION_CATEGORIES.CONTACT,
  [QuestionType.ADDRESS]: QUESTION_CATEGORIES.CONTACT,
  [QuestionType.ZIP_CODE]: QUESTION_CATEGORIES.CONTACT,

  [QuestionType.NUMBER]: QUESTION_CATEGORIES.NUMBERS_TIME,
  [QuestionType.CURRENCY]: QUESTION_CATEGORIES.NUMBERS_TIME,
  [QuestionType.DATE]: QUESTION_CATEGORIES.NUMBERS_TIME,
  [QuestionType.TIME]: QUESTION_CATEGORIES.NUMBERS_TIME,
  [QuestionType.SLIDER]: QUESTION_CATEGORIES.NUMBERS_TIME,
  [QuestionType.RATING]: QUESTION_CATEGORIES.NUMBERS_TIME,
  [QuestionType.OPINION_SCALE]: QUESTION_CATEGORIES.NUMBERS_TIME,

  [QuestionType.MCQ]: QUESTION_CATEGORIES.CHOICES,
  [QuestionType.SCQ]: QUESTION_CATEGORIES.CHOICES,
  [QuestionType.DROP_DOWN]: QUESTION_CATEGORIES.CHOICES,
  [QuestionType.DROP_DOWN_STATIC]: QUESTION_CATEGORIES.CHOICES,
  [QuestionType.YES_NO]: QUESTION_CATEGORIES.CHOICES,
  [QuestionType.RANKING]: QUESTION_CATEGORIES.CHOICES,
  [QuestionType.AUTOCOMPLETE]: QUESTION_CATEGORIES.CHOICES,

  [QuestionType.FILE_PICKER]: QUESTION_CATEGORIES.MEDIA_FILES,
  [QuestionType.SIGNATURE]: QUESTION_CATEGORIES.MEDIA_FILES,
  [QuestionType.PICTURE]: QUESTION_CATEGORIES.MEDIA_FILES,
  [QuestionType.PDF_VIEWER]: QUESTION_CATEGORIES.MEDIA_FILES,

  [QuestionType.WELCOME]: QUESTION_CATEGORIES.LAYOUT_SPECIAL,
  [QuestionType.ENDING]: QUESTION_CATEGORIES.LAYOUT_SPECIAL,
  [QuestionType.TEXT_PREVIEW]: QUESTION_CATEGORIES.LAYOUT_SPECIAL,
  [QuestionType.QUOTE]: QUESTION_CATEGORIES.LAYOUT_SPECIAL,
  [QuestionType.LOADING]: QUESTION_CATEGORIES.LAYOUT_SPECIAL,
  [QuestionType.LEGAL_TERMS]: QUESTION_CATEGORIES.LAYOUT_SPECIAL,
  [QuestionType.TERMS_OF_USE]: QUESTION_CATEGORIES.LAYOUT_SPECIAL,
  [QuestionType.QUESTIONS_GRID]: QUESTION_CATEGORIES.LAYOUT_SPECIAL,
  [QuestionType.KEY_VALUE_TABLE]: QUESTION_CATEGORIES.LAYOUT_SPECIAL,
  [QuestionType.MULTI_QUESTION_PAGE]: QUESTION_CATEGORIES.LAYOUT_SPECIAL,
  [QuestionType.QUESTION_REPEATER]: QUESTION_CATEGORIES.LAYOUT_SPECIAL,
  [QuestionType.COLLECT_PAYMENT]: QUESTION_CATEGORIES.LAYOUT_SPECIAL,
  [QuestionType.STRIPE_PAYMENT]: QUESTION_CATEGORIES.LAYOUT_SPECIAL,
  [QuestionType.CONNECTION]: QUESTION_CATEGORIES.LAYOUT_SPECIAL,
};

export function getQuestionCategory(questionType) {
  return QUESTION_TYPE_TO_CATEGORY[questionType] || QUESTION_CATEGORIES.LAYOUT_SPECIAL;
}

export function getQuestionCategoryColor(questionType) {
  const category = getQuestionCategory(questionType);
  return CATEGORY_COLORS[category] || CATEGORY_COLORS[QUESTION_CATEGORIES.LAYOUT_SPECIAL];
}

export function getWizardThemeForQuestionType(questionType) {
  const colors = getQuestionCategoryColor(questionType);
  
  return {
    accentColor: colors.primary,
    accentColorLight: colors.light,
    accentColorDark: colors.dark,
    iconBg: colors.light,
    iconBorder: `${colors.primary}30`,
    iconColor: colors.primary,
    activeTabBorder: colors.primary,
  };
}

export function getCategoryLabel(category) {
  const labels = {
    [QUESTION_CATEGORIES.TEXT_INPUT]: "Text Input",
    [QUESTION_CATEGORIES.CONTACT]: "Contact",
    [QUESTION_CATEGORIES.NUMBERS_TIME]: "Numbers & Time",
    [QUESTION_CATEGORIES.CHOICES]: "Choices",
    [QUESTION_CATEGORIES.MEDIA_FILES]: "Media & Files",
    [QUESTION_CATEGORIES.LAYOUT_SPECIAL]: "Layout & Special",
  };
  return labels[category] || "Other";
}
