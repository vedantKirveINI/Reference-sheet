import { Mode, QuestionType } from "@oute/oute-ds.core.constants";

interface IShouldRenderCTA {
  mode: Mode;
  isError: boolean;
  questionType: QuestionType;
}
const shouldRenderCTA = ({
  mode,
  isError,
  questionType,
}: IShouldRenderCTA): boolean => {
  if (isError) return false;

  // if questionType is ENDING then we will not be showing CTA
  if (questionType === QuestionType.ENDING) return false;
  if (questionType === QuestionType.LOADING) return false;
  // if user is not a creator and the mode is classic then we are not rendering CTA because we will have form of scrollable questions
  if (mode === Mode.CLASSIC) return false;

  //if questions type is connection we will not be showing CTA
  if (questionType === QuestionType.CONNECTION) return false;

  return true;
};

export { shouldRenderCTA };
