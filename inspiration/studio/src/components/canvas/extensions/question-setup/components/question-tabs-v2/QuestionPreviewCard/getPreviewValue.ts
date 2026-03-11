import { QuestionType } from "@src/module/constants";

/**
 * Returns the value shape { response } that QuestionRenderer/AnswerSection expect
 * when rendering in preview (non-creator). Ensures all question types show their
 * default/initial state from settings correctly.
 */
export function getPreviewValue(question: Record<string, unknown> | null | undefined): {
  response: unknown;
} {
  if (!question) {
    return { response: "" };
  }

  const type = question.type as string | undefined;
  const settings = (question.settings ?? {}) as Record<string, unknown>;

  switch (type) {
    case QuestionType.DROP_DOWN:
    case QuestionType.DROP_DOWN_STATIC: {
      const dc = settings?.defaultChoice;
      const selectionType = settings?.selectionType as string | undefined;
      const isMulti =
        selectionType === "Unlimited" ||
        selectionType === "Exact Number" ||
        selectionType === "Range";
      if (isMulti) {
        const arr = Array.isArray(dc) ? dc : dc != null && dc !== "" ? [dc] : [];
        return { response: arr };
      }
      // Single selection - return single value, not array
      const single = Array.isArray(dc) ? dc?.[0] ?? "" : (dc ?? "");
      return { response: single };
    }
    case QuestionType.PHONE_NUMBER:
      return { response: settings?.defaultCountry ?? "" };
    case QuestionType.YES_NO:
      return { response: settings?.defaultChoice ?? undefined };
    case QuestionType.MCQ:
    case QuestionType.SCQ:
    case QuestionType.PICTURE:
    case QuestionType.RANKING:
      return { response: [] };
    case QuestionType.TIME:
      return { response: {} };
    case QuestionType.ADDRESS:
      return { response: {} };
    case QuestionType.FILE_PICKER:
    case QuestionType.CONNECTION:
    case QuestionType.SLIDER:
    case QuestionType.RATING:
    case QuestionType.OPINION_SCALE:
    case QuestionType.SIGNATURE:
      return { response: undefined };
    case QuestionType.DATE:
    case QuestionType.CURRENCY: {
      // Currency needs defaultCountry for the flag and symbol to render
      const defaultCountry = settings?.defaultCountry as Record<string, unknown> | undefined;
      if (defaultCountry) {
        return { response: { ...defaultCountry } };
      }
      return { response: "" };
    }
    case QuestionType.ZIP_CODE: {
      // Zip code needs defaultCountry for the flag to render in preview (e.g. Appearance tab)
      const defaultCountry = settings?.defaultCountry as Record<string, unknown> | undefined;
      if (defaultCountry) {
        return { response: { ...defaultCountry, zipCode: null } };
      }
      return { response: "" };
    }
    case QuestionType.NUMBER:
    case QuestionType.SHORT_TEXT:
    case QuestionType.LONG_TEXT:
    case QuestionType.EMAIL:
    case "SHORT_TEXT":
    case "LONG_TEXT":
      return { response: "" };
    case QuestionType.TERMS_OF_USE:
      return { response: false };
    case QuestionType.QUESTIONS_GRID:
    case QuestionType.QUESTION_REPEATER:
      return { response: question.value ?? {} };
    case QuestionType.KEY_VALUE_TABLE:
      return { response: question.value ?? {} };
    case QuestionType.FORMULA_BAR:
      return { response: { blocks: [] } };
    default:
      return { response: "" };
  }
}
