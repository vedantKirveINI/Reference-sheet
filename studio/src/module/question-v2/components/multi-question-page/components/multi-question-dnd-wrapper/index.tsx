import { HTMLAttributes, useState } from "react";
import { styles } from "./styles";
import { Mode, ViewPort } from "@oute/oute-ds.core.constants";
import { AnswerSection } from "../../../answer-section";
import { QuestionSection } from "../../../question-section";

import { ODSChip } from "@src/module/ods";
import { ODSIcon } from "@src/module/ods";
import { ODSButton } from "@src/module/ods";
import DragIndicatorIcon from "../../../../assets/icon/drag-indicator-icon";
import { useSortable } from "@dnd-kit/sortable";
import { QuestionValue } from "../../types";
import { ODSError as Error } from "@src/module/ods";
import { sanatizeQuestionTypeToText } from "../../../../utils";

interface MultiQuestionDndWrapperProps extends HTMLAttributes<HTMLDivElement> {
  viewPort: ViewPort;
  questionId: string;
  question: any;
  theme: any;
  isCreator: boolean;
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

const MultiQuestionDndWrapper = ({
  isSelected,
  viewPort,
  isCreator,
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
}: MultiQuestionDndWrapperProps) => {
  const [isHover, setIsHover] = useState(false);
  const sortable = useSortable({ id: questionId });

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    setActivatorNodeRef,
    active,
  } = sortable;
  const isRequired = question?.settings?.required;
  const isDraggable = isCreator;
  const hasError = !!value?.error;

  const dndStyles = transform && {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
    transition: transition,
    zIndex: active?.id === questionId && 10,
  };

  return (
    <>
      <div
        ref={isDraggable ? setNodeRef : undefined}
        style={{
          ...(styles.getQuestionContainerStyles({
            isNoQuestionSelected: isNoQuestionSelected,
            isSelected: isSelected,
            isCreator,
          })),
          ...dndStyles,
        }}
        onClick={() => {
          isCreator && onQuestionClick();
        }}
        onMouseOver={() => setIsHover(true)}
        onMouseLeave={() => {
          setIsHover(false);
        }}
        {...(isDraggable && attributes)}
        {...(!isDraggable ? listeners : undefined)}
        aria-activedescendant={isHover ? "true" : "false"}
        aria-selected={isSelected}
        {...props}
      >
        {isCreator && (
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
        )}
        <QuestionSection
          viewPort={viewPort}
          questionData={question}
          isRequired={isRequired}
          editable={isCreator}
          onChange={onQuestionSectionChange}
          theme={theme}
          autoFocus={false}
          mode={Mode.CARD}
          style={{
            width: "100%",
          }}
          questionAlignment={questionAlignment}
          variables={variables}
        />

        <AnswerSection
          viewPort={viewPort}
          isCreator={isCreator}
          questionData={question}
          theme={theme}
          value={isCreator ? question?.placeholder : value}
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
            marginBottom: isCreator ? "1em" : "0",
          }}
        />

        {isCreator &&
          showActionIcons &&
          (isSelected || isHover ? (
            <div
              {...(isDraggable && listeners)}
              {...(isDraggable && { ref: setActivatorNodeRef })}
              style={styles.getDragIconStyles}
            >
              <DragIndicatorIcon style={{ width: "2em", height: "2em" }} />
            </div>
          ) : null)}
        {isCreator && (
          <ODSButton
            label="+ ADD QUESTION"
            variant="contained"
            onClick={onAddNewQuestionClick}
            style={styles.getAddNewQuestionButtonStyles}
            buttonProps={{
              "data-testid": "multi-question-add-new-question-button",
            }}
          />
        )}
        {hasError && (
          <Error
            text={value?.error}
            style={{
              background: "fff",
              borderRadius: "0.5em",
              boxShadow: "0px 6px 12px 0px rgba(122, 124, 141, 0.20)",
            }}
          />
        )}
      </div>
    </>
  );
};

export default MultiQuestionDndWrapper;
