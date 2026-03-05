import React, { forwardRef, useCallback, useMemo } from "react";
import { ICreatorQuestionRepeator } from "./types";
import { styles } from "./styles";
import { QuestionRepeatorWrapper } from "./components/question-repeater-wrapper";

export const CreatorQuestionRepeator = forwardRef<
  HTMLDivElement,
  ICreatorQuestionRepeator
>(
  (
    {
      viewPort,
      onChange,
      theme,
      variables,
      state,
      answers,
      question,
      node,
      onAddQuestionClick,
      onQuestionSelect,
      selectedQuestionId,
      value = [],
      isAlignmentCenter,
    },
    ref
  ) => {
    const questions = useMemo(() => {
      return question?.questions || {};
    }, [question?.questions]);

    const QUESTION_KEYS = useMemo(() => {
      return Object.keys(questions);
    }, [questions]);

    const minimizedSizedTheme = useMemo(() => {
      return {
        ...theme,
        styles: {
          ...theme?.styles,
          questionSize: "S",
        },
      };
    }, [theme]);

    const onQuestionSectionChange = useCallback(
      (key: string, value: any) => {
        const updatedQuestion = {
          ...questions,
          [selectedQuestionId]: {
            ...questions[selectedQuestionId],
            [key]: value,
          },
        };
        onChange("questions", updatedQuestion);
      },
      [onChange, questions, selectedQuestionId]
    );

    const onAnswerSectionChange = useCallback(
      ({
        key,
        _value,
        questionId,
      }: {
        key: string;
        _value: any;
        questionId: string;
      }) => {
        const updatedQuestion = {
          ...questions,
          [questionId]: {
            ...questions[questionId],
            [key]: _value,
          },
        };
        onChange("questions", updatedQuestion);
      },
      [onChange, questions]
    );

    const onRemoveQuestion = useCallback(
      (questionId: string) => {
        const updatedQuestions = { ...questions };
        delete updatedQuestions[questionId];
        onChange("questions", updatedQuestions);

        if (selectedQuestionId === questionId) {
          onQuestionSelect(null);
        }
      },
      [onChange, onQuestionSelect, questions, selectedQuestionId]
    );

    return (
      <div
        ref={ref}
        style={styles.container({ isAlignmentCenter })}
        aria-label="Creator Question Repeator"
        role="form"
        data-testid="creator-question-repeator"
      >
        {QUESTION_KEYS?.map((questionId, index) => {
          const isSelected = selectedQuestionId === questionId;
          return (
            <QuestionRepeatorWrapper
              key={questionId}
              viewPort={viewPort}
              questionId={questionId}
              question={questions[questionId]}
              theme={minimizedSizedTheme}
              isSelected={isSelected}
              isNoQuestionSelected={selectedQuestionId === null}
              onQuestionClick={() => {
                if (selectedQuestionId === questionId) {
                  return;
                } else {
                  onQuestionSelect(questionId);
                }
              }}
              onRemoveQuestion={onRemoveQuestion}
              onAddNewQuestionClick={() => {
                onAddQuestionClick(questionId);
                onQuestionSelect(questionId);
              }}
              onQuestionSectionChange={onQuestionSectionChange}
              onAnswerSectionChange={onAnswerSectionChange}
              variables={variables}
              state={state}
              answers={answers}
              node={node}
              value={value[questionId]}
              questionAlignment={question?.settings?.questionAlignment}
              showActionIcons={QUESTION_KEYS.length > 1}
              data-testid={`repeator-question-${index + 1}`}
            />
          );
        })}
      </div>
    );
  }
);

CreatorQuestionRepeator.displayName = "CreatorQuestionRepeator";
