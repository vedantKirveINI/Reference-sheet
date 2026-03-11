import { useCallback, useMemo } from "react";

import { styles } from "./styles";
import MultiQuestionDndWrapper from "./components/multi-question-dnd-wrapper";
import { IMultiQuestionPage } from "./types";

import DndKitProvider from "./provider/dnd-kit-provider";
import { DragEndEvent } from "@dnd-kit/core";
import { arrayMove, rectSortingStrategy, SortableContext,  } from "@dnd-kit/sortable";

export const MultiQuestionPage = ({
  isCreator,
  onChange,
  theme,
  variables,
  state,
  answers,
  viewPort,
  question,
  node = {},
  onAddQuestionClick = () => {},
  onQuestionSelect = () => {},
  selectedQuestionId,
  value = {},
}: IMultiQuestionPage) => {
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

  const onCreatorValueChange = useCallback(
    (key: string, _value: any, questionId: string) => {
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

  const onFillerValueChange = useCallback(
    (_value: string, questionId: string) => {
      onChange({
        ...value,
        [questionId]: {
          response: _value,
        },
      });
    },
    [onChange, value]
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
      if (isCreator) {
        onCreatorValueChange(key, _value, questionId);
      } else {
        const answer = key;
        onFillerValueChange(answer, questionId);
      }
    },
    [isCreator, onCreatorValueChange, onFillerValueChange]
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

  const onDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;

      if (active.id !== over?.id) {
        const oldIndex = QUESTION_KEYS.findIndex(
          (option) => option === active.id
        );
        const newIndex = QUESTION_KEYS.findIndex(
          (option) => option === over?.id
        );
        const NEW_QUESTIONS_KEYS = arrayMove(QUESTION_KEYS, oldIndex, newIndex);
        const updatedQuestion = {};

        for (const key of NEW_QUESTIONS_KEYS) {
          updatedQuestion[key] = questions[key];
        }

        onChange("questions", updatedQuestion);
      }
    },
    [QUESTION_KEYS, onChange, questions]
  );

  return (
    <div
      style={styles.container}
      aria-label="Multi Question Page"
      role="form"
      data-testid="multi-question-page"
    >
      {isCreator ? (
        <DndKitProvider
          onDragEnd={onDragEnd}
          shouldRestrictToVerticalAxis={true}
        >
          <SortableContext items={QUESTION_KEYS} strategy={rectSortingStrategy}>
            {QUESTION_KEYS?.map((questionId, index) => {
              const isSelected = selectedQuestionId === questionId;
              return (
                <MultiQuestionDndWrapper
                  key={questionId}
                  answers={answers}
                  isCreator={isCreator}
                  isNoQuestionSelected={selectedQuestionId === null}
                  isSelected={isSelected}
                  node={node}
                  onAddNewQuestionClick={() => {
                    onAddQuestionClick(questionId);
                    onQuestionSelect(questionId);
                  }}
                  onAnswerSectionChange={onAnswerSectionChange}
                  onQuestionSectionChange={onQuestionSectionChange}
                  onQuestionClick={() => onQuestionSelect(questionId)}
                  onRemoveQuestion={onRemoveQuestion}
                  questionId={questionId}
                  question={questions[questionId]}
                  state={state}
                  variables={variables}
                  theme={minimizedSizedTheme}
                  viewPort={viewPort}
                  value={value[questionId]}
                  questionAlignment={question?.settings?.questionAlignment}
                  showActionIcons={QUESTION_KEYS.length > 1}
                  data-testid={`multi-question-${index + 1}`}
                />
              );
            })}
          </SortableContext>
        </DndKitProvider>
      ) : (
        <>
          {QUESTION_KEYS?.map((questionId, index) => {
            const isSelected = selectedQuestionId === questionId;
            return (
              <MultiQuestionDndWrapper
                key={questionId}
                answers={answers}
                isCreator={isCreator}
                isNoQuestionSelected={selectedQuestionId === null}
                isSelected={isSelected}
                node={node}
                onAddNewQuestionClick={() => {}}
                onAnswerSectionChange={onAnswerSectionChange}
                onQuestionSectionChange={onQuestionSectionChange}
                onQuestionClick={() => onQuestionSelect(questionId)}
                onRemoveQuestion={onRemoveQuestion}
                questionId={questionId}
                question={questions[questionId]}
                state={state}
                variables={variables}
                theme={minimizedSizedTheme}
                viewPort={viewPort}
                value={value[questionId]}
                questionAlignment={question?.settings?.questionAlignment}
                data-testid={`multi-question-${index + 1}`}
                showActionIcons={questions?.length > 1}
              />
            );
          })}
        </>
      )}
    </div>
  );
};
