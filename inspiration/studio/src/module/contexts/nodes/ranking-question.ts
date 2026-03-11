import { NODE_ERROR_MESSAGES } from "@oute/oute-ds.core.constants";

export const getRankingQuestionErrors = (question: Record<string, any>) => {
  let errors: string[] = Object.values(question?.settings?.errors || {}).filter(
    (error: unknown) => typeof error === "string" && error?.trim?.() !== ""
  ) as string[];
  let settingsErrors: Record<string, string> = {
    ...(question?.settings?.errors || {}),
  };

  const options = question?.options;
  if (options?.length <= 0) {
    errors.push(NODE_ERROR_MESSAGES.RANKING.optionsError);
    settingsErrors.optionsError = NODE_ERROR_MESSAGES.RANKING.optionsError;
  } else {
    if (settingsErrors.optionsError) {
      settingsErrors.optionsError = "";
      errors = errors.filter(
        (error) => error !== NODE_ERROR_MESSAGES.RANKING.optionsError
      );
    }
  }

  return { errors, settingsErrors };
};
