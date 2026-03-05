import { QuestionType } from "@oute/oute-ds.core.constants";
import { dropdownValidation } from "./dropdown";
import { filePickerValidation } from "./file-picker";
import { formulaBarValidation } from "./formula-bar";
import { yesNoValidation } from "./yes-no";
import { questionRepeaterValidation } from "./question-repeater";
import { VALIDATION_MESSAGE } from "../utils/constants";
import { dateValidation } from "./date";

export const questionsValidation = ({
  node,
  answer,
  ref,
  onNestedErrors = () => {},
}: {
  node: any;
  answer: any;
  ref: any;
  onNestedErrors?: (errors: Record<string, string>[]) => void;
}): string => {
  let error: string = "";

  if (answer[node?._id]?.isMapped) {
    if (
      node?.config?.settings?.required &&
      !answer[node?._id]?.response?.blocks?.length
    ) {
      error = VALIDATION_MESSAGE.COMMON.REQUIRED;
    }
    return error;
  }

  switch (node.type) {
    case QuestionType.DROP_DOWN:
      error = dropdownValidation(answer, node);
      break;
    case QuestionType.QUESTION_REPEATER:
      error = questionRepeaterValidation(answer, node); //, onNestedErrors);
      break;
    case QuestionType.FILE_PICKER:
      error = filePickerValidation(ref);
      break;
    case QuestionType.FORMULA_BAR:
      error = formulaBarValidation(answer, node);
      break;
    case QuestionType.YES_NO:
      error = yesNoValidation(answer, node);
      break;
    case QuestionType.DATE:
      error = dateValidation(answer, node);
      break;
    default:
      break;
  }

  return error;
};
