import { NODE_ERROR_MESSAGES } from "@/module/constants/node-error-messages";
import { QuestionType } from "@/module/constants/questionType";

const DROP_DOWN_STATIC_MESSAGES = NODE_ERROR_MESSAGES[QuestionType.DROP_DOWN_STATIC];

function deriveSourceType(settings: Record<string, any>): string {
  if (settings?.sourceType) {
    return settings.sourceType;
  }
  const dynamicInputs = settings?.dynamicInputs || {};
  if (dynamicInputs?.sourceNode) {
    return "tinyTable";
  }
  if (dynamicInputs?.variable?.blocks?.length > 0) {
    return "dynamic";
  }
  return "static";
}

export const getDropdownQuestionErrors = (question: Record<string, any>) => {
  let errors: string[] = Object.values(
    question?.settings?.errors || {}
  ).filter(
    (error: unknown) => typeof error === "string" && error?.trim?.() !== ""
  ) as string[];
  const settingsErrors: Record<string, string> = {
    ...(question?.settings?.errors || {}),
  };

  const sourceType = deriveSourceType(question?.settings || {});
  const options = question?.options;

  if (sourceType === "static") {
    if (!options || options.length <= 0) {
      settingsErrors.optionsError = DROP_DOWN_STATIC_MESSAGES.optionsError;
      if (!errors.includes(DROP_DOWN_STATIC_MESSAGES.optionsError)) {
        errors.push(DROP_DOWN_STATIC_MESSAGES.optionsError);
      }
    } else {
      if (settingsErrors.optionsError) {
        settingsErrors.optionsError = "";
        errors = errors.filter(
          (error) => error !== DROP_DOWN_STATIC_MESSAGES.optionsError
        );
      }
    }
  }

  return { errors, settingsErrors };
};
