import { NODE_ERROR_MESSAGES } from "@oute/oute-ds.core.constants";

export const getSingleChoiceQuestionErrors = (
  question: Record<string, any>
) => {
  let errors: string[] = Object.values(question?.settings?.errors || {}).filter(
    (error: unknown) => typeof error === "string" && error?.trim?.() !== ""
  ) as string[];
  let settingsErrors: Record<string, string> = {
    ...(question?.settings?.errors || {}),
  };

  const options = question?.options;
  const defaultValue = question?.settings?.defaultValue || "";
  const isDefaultValueInOptions = options?.includes(defaultValue);

  if (options?.length <= 0) {
    errors.push(NODE_ERROR_MESSAGES.SCQ.optionsError);
    settingsErrors.optionsError = NODE_ERROR_MESSAGES.SCQ.optionsError;
  } else {
    if (settingsErrors.optionsError) {
      settingsErrors.optionsError = "";
      errors = errors.filter(
        (error) => error !== NODE_ERROR_MESSAGES.SCQ.optionsError
      );
    }
  }

  if (!isDefaultValueInOptions && defaultValue) {
    errors.push(NODE_ERROR_MESSAGES.SCQ.defaultValueError);
    settingsErrors.defaultValueError =
      NODE_ERROR_MESSAGES.SCQ.defaultValueError;
  } else {
    // Clear the error if default value is valid or empty
    if (settingsErrors.defaultValueError) {
      delete settingsErrors.defaultValueError;
      errors = errors.filter(
        (error) => error !== NODE_ERROR_MESSAGES.SCQ.defaultValueError
      );
    }
  }

  return { errors, settingsErrors };
};
