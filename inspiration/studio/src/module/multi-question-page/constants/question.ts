import {
  QuestionType,
  DEFAULT_QUESTION_TITLE,
  DEFAULT_QUESTION_DESCRIPTION,
  QuestionAlignments,
  TextTransformations,
  QUESTION_RESPONSE_TYPES,
} from "@oute/oute-ds.core.constants";
import { generateUUID } from "@/lib/utils";

const DEFAULT_QUESTION_ID = generateUUID();

export const DEFAULT_QUESTON = {
  [DEFAULT_QUESTION_ID]: {
    _id: DEFAULT_QUESTION_ID,
    id: DEFAULT_QUESTION_ID,
    question: DEFAULT_QUESTION_TITLE,
    description: DEFAULT_QUESTION_DESCRIPTION,
    type: QuestionType.SHORT_TEXT,
    module: "Question",
    buttonLabel: "<strong>NEXT</strong>",
    value: "",
    placeholder: "Your answer here",
    errors: {
      charLimitError: "",
    },
    settings: {
      questionAlignment: QuestionAlignments.LEFT,
      required: false,
      maskResponse: false,
      textTransformation: {
        isActive: false,
        case: TextTransformations.NONE,
      },
      minChar: "",
      maxChar: "",
      regex: {
        value: "",
        error: "",
      },
      defaultValue: "",
      accessKey: "",
    },
    response_type: QUESTION_RESPONSE_TYPES.STRING,
  },
};
