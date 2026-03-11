import React, { useRef } from "react";
import { getPlaceholderStyles } from "./styles";
import { CONNECTION_DEFAULT_SETUP, CURRENCY_DEFAULT_SETUP, DATE_DEFAULT_SETUP, EMAIL_DEFAULT_SETUP, ENDING_DEFAULT_SETUP, KEY_VALUE_TABLE_DEFAULT_SETUP, LONG_TEXT_DEFAULT_SETUP, MCQ_DEFAULT_SETUP, Mode, PHONE_NUMBER_DEFAULT_SETUP, QuestionType, QUOTE_DEFAULT_SETUP, RANKING_DEFAULT_SETUP, SCQ_DEFAULT_SETUP, SHORT_TEXT_DEFAULT_SETUP, WELCOME_DEFAULT_SETUP, YES_NO_DEFAULT_SETUP, ZIP_CODE_DEFAULT_SETUP,  } from "@oute/oute-ds.core.constants";
// import { Question } from "@oute/oute-ds.skeleton.question/question";

export type PlaceholderProps = {
  mode: Mode;
  questionType: QuestionType;
  style?: React.CSSProperties;
  viewPort?: any;
};

const DEFAULT_QUESTION_CONFIG = {
  [QuestionType.SHORT_TEXT]: SHORT_TEXT_DEFAULT_SETUP,
  //to render with having values(answer) because placeholder is not shown as a creator view
  [QuestionType.MCQ]: {
    ...MCQ_DEFAULT_SETUP,
    value: {
      response: [
        {
          id: "R1eLci_7B9y3TzFY",
          value: "",
          isChecked: false,
        },
      ],
    },
  },
  [QuestionType.SCQ]: SCQ_DEFAULT_SETUP,
  [QuestionType.LONG_TEXT]: LONG_TEXT_DEFAULT_SETUP,
  [QuestionType.PHONE_NUMBER]: PHONE_NUMBER_DEFAULT_SETUP,
  [QuestionType.ZIP_CODE]: ZIP_CODE_DEFAULT_SETUP,
  // [QuestionType.DROP_DOWN]: DROP_DOWN_DEFAULT_SETUP,
  [QuestionType.YES_NO]: YES_NO_DEFAULT_SETUP,
  [QuestionType.EMAIL]: EMAIL_DEFAULT_SETUP,
  [QuestionType.RANKING]: RANKING_DEFAULT_SETUP,
  [QuestionType.CONNECTION]: CONNECTION_DEFAULT_SETUP,
  // [QuestionType.FORMULA_BAR]: FORMULA_BAR_DEFAULT_SETUP,
  [QuestionType.ENDING]: ENDING_DEFAULT_SETUP,
  [QuestionType.QUOTE]: QUOTE_DEFAULT_SETUP,
  [QuestionType.WELCOME]: WELCOME_DEFAULT_SETUP,
  [QuestionType.DATE]: DATE_DEFAULT_SETUP,
  [QuestionType.CURRENCY]: CURRENCY_DEFAULT_SETUP,
  [QuestionType.KEY_VALUE_TABLE]: KEY_VALUE_TABLE_DEFAULT_SETUP,
};

const Placeholder = ({
  mode,
  questionType,
  viewPort,
  style = {},
}: PlaceholderProps) => {
  const question = DEFAULT_QUESTION_CONFIG[questionType];
  const questionRef = useRef();

  return (
    <div
      // style={{ ...getPlaceholderStyles({ viewPort, questionType }), ...style }}
      data-testid="placeholder-component"
    >
      {/* <Question
        key={`placeholder-question-${questionType}`}
        ref={questionRef}
        questionIndex={1}
        mode={mode}
        viewPort={viewPort}
        theme={{}}
        question={question}
        isCreator={false}
        value={question?.value || question?.placeholder || question?.blocks}
        onChange={() => {}}
        variables={{}}
        styles={{}}
        error=""
        hideQuestionIndex={false}
        id="placeholder-question"
        onSubmit={() => {}}
        onRestart={() => {}}
      /> */}
    </div>
  );
};

export default Placeholder;
