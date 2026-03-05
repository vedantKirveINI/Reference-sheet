import { HTMLAttributes, useState } from "react";
import { styles } from "./styles";
import { Mode, ViewPort } from "@oute/oute-ds.core.constants";
import { AnswerSection } from "../../../answer-section";
import { QuestionSection } from "../../../question-section";

import { ODSChip } from "@src/module/ods";
import { ODSIcon } from "@src/module/ods";
import { ODSButton } from "@src/module/ods";
import { QuestionValue } from "../../types";
import { sanatizeQuestionTypeToText } from "../../../../utils";

interface QuestionRepeatorWrapperProps extends HTMLAttributes<HTMLDivElement> {
  viewPort: ViewPort;
  questionId: string;
  question: any;
  theme: any;
  isSelected: boolean;
  isNoQuestionSelected: boolean;
  onQuestionClick: () => void;
  onRemoveQuestion: any;
  onAddNewQuestionClick: () => void;
  onQuestionSectionChange: (key: string, value: any) => void;
  onAnswerSectionChange: ({
    key,
    _value,
    questionId,
  }: {
    key: string;
    _value: any;
    questionId: string;
  }) => void;
  variables: any;
  state: any;
  answers: any;
  node: any;
  value?: QuestionValue;
  questionAlignment?: any;
  showActionIcons: boolean;
}

export const QuestionRepeatorWrapper = ({
  isSelected,
  viewPort,
  theme,
  isNoQuestionSelected,
  onAnswerSectionChange,
  onQuestionSectionChange,
  onAddNewQuestionClick,
  onQuestionClick,
  questionId,
  question,
  onRemoveQuestion,
  answers = {},
  node = {},
  state = {},
  variables = {},
  value,
  questionAlignment,
  showActionIcons = true,
  ...props
}: QuestionRepeatorWrapperProps) => {
  const [isHover, setIsHover] = useState(false);
  const isRequired = question?.settings?.required;

  return (
    <div
      style={styles.getQuestionContainerStyles({
        isNoQuestionSelected,
        isSelected,
      })}
      onClick={() => {
        onQuestionClick();
      }}
      onMouseOver={() => setIsHover(true)}
      onMouseLeave={() => setIsHover(false)}
      aria-activedescendant={isHover ? "true" : "false"}
      aria-selected={isSelected}
      {...props}
    >
      <div
        style={styles.getChipsContainerStyles}
        data-testid="multi-question-chips-container"
      >
        <ODSChip
          size="small"
          label={sanatizeQuestionTypeToText(question?.type)}
        />
        {showActionIcons && (
          <ODSIcon
            className="remove-question-icon"
            outeIconName="OUTECloseIcon"
            onClick={(event: MouseEvent) => {
              event.stopPropagation();
              onRemoveQuestion(questionId);
            }}
            buttonProps={{
              sx: {
                width: "1em",
                height: "1em",
                visibility: isHover || isSelected ? "visible" : "hidden",
                opacity: isHover || isSelected ? 1 : 0,
              },
            }}
          />
        )}
      </div>

      <QuestionSection
        viewPort={viewPort}
        questionData={question}
        isRequired={isRequired}
        editable={true}
        onChange={onQuestionSectionChange}
        theme={theme}
        autoFocus={false}
        mode={Mode.CARD}
        style={{
          width: "100%",
        }}
        questionAlignment={questionAlignment}
        variables={variables}
        showDescription={false}
      />

      <AnswerSection
        viewPort={viewPort}
        isCreator={true}
        questionData={question}
        theme={theme}
        value={question?.placeholder}
        onChange={(key: any, _value: any) => {
          onAnswerSectionChange({ key, _value, questionId });
        }}
        autoFocus={false}
        error={value?.error || ""}
        mode={Mode.CARD}
        variables={variables}
        state={state}
        answers={answers}
        node={node}
        style={{
          marginBottom: "1em",
        }}
      />

      <ODSButton
        label="+ ADD QUESTION"
        variant="contained"
        onClick={onAddNewQuestionClick}
        style={styles.getAddNewQuestionButtonStyles}
        buttonProps={{
          "data-testid": "multi-question-add-new-question-button",
        }}
      />
    </div>
  );
};
