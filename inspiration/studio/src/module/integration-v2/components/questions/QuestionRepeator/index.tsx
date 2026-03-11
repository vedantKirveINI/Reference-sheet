import { forwardRef, useCallback, useEffect, useMemo } from "react";
import { IQuestionRepeatorProps } from "./types";
import { styles } from "./styles";
import { QuestionRepeatorWrapper } from "./components/question-repeator-wrapper";
import { ODSIcon, ODSButton } from "@src/module/ods";
export const getDefaultQuestionRepeatorValue = (question: any) => {
  const defaultQuestionRepeatorValue = {
    _id: Date.now(),
  };

  for (const questionId of Object.keys(question?.questions)) {
    defaultQuestionRepeatorValue[questionId] = {
      response: undefined,
      error: "",
    };
  }

  return defaultQuestionRepeatorValue;
};

export const QuestionRepeator = forwardRef<
  HTMLDivElement,
  IQuestionRepeatorProps
>(({ answers, onChange, theme, variables, question, value = [] }, ref) => {
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

  const onFillerValueChange = useCallback(
    ({
      _value,
      questionId,
      valueIndex,
    }: {
      _value: any;
      questionId: string;
      valueIndex: number;
    }) => {
      const newQuestionValue = [...value];
      newQuestionValue[valueIndex][questionId] = {
        response: _value,
        error: "",
      };
      onChange("", newQuestionValue);
    },
    [onChange, value]
  );

  const onAddQuestionClick = useCallback(() => {
    const defaultQuestionRepeatorValue =
      getDefaultQuestionRepeatorValue(question);
    const newValue = [...value, defaultQuestionRepeatorValue];
    onChange("", newValue);
  }, [value, question]);

  useEffect(() => {
    if (value?.length === 0) {
      const defaultQuestionRepeatorValue =
        getDefaultQuestionRepeatorValue(question);
      onChange("", [defaultQuestionRepeatorValue]);
    }
  }, []);

  return (
    <div
      ref={ref}
      style={styles.container({ isAlignmentCenter: false })}
      aria-label="Integration Question Repeator"
      role="form"
      data-testid="integration-question-repeator"
    >
      <div style={styles.innerRepeaterBlock}>
        {value?.map((questionValue, index) => (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "1em",
            }}
            key={questionValue?._id}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                gap: "1em",
              }}
            >
              <span
                style={{
                  fontSize: "1rem",
                  color: "rgb(38, 50, 56)",
                }}
              >
                {(question?.settings?.groupName || "Item") +
                  " " +
                  (index + 1)?.toString()}
              </span>
              {value?.length > 0 && (
                <ODSIcon
                  outeIconName="OUTECloseIcon"
                  outeIconProps={{
                    sx: {
                      height: "2rem",
                      width: "2rem",
                    },
                  }}
                  onClick={() => {
                    const newQuestionValue = value.filter(
                      (_, i) => i !== index
                    );
                    onChange("", newQuestionValue);
                  }}
                  buttonProps={{
                    "data-testid": "item-delete-icon",
                  }}
                />
              )}
            </div>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "1em",
                paddingLeft: "1em",
              }}
            >
              {QUESTION_KEYS?.map((questionId) => (
                <QuestionRepeatorWrapper
                  key={`${questionId}-${index}`}
                  answers={answers}
                  question={questions[questionId]}
                  theme={minimizedSizedTheme}
                  variables={variables}
                  value={questionValue?.[questionId]}
                  onAnswerSectionChange={({ _value }) => {
                    onFillerValueChange({
                      _value,
                      questionId,
                      valueIndex: index,
                    });
                  }}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
      <ODSButton
        style={{
          width: "fit-content",
          marginTop: "1em",
        }}
        variant="black"
        label="Add Item"
        onClick={onAddQuestionClick}
      ></ODSButton>
    </div>
  );
});

QuestionRepeator.displayName = "QuestionRepeator";
