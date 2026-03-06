import { forwardRef, useCallback, useEffect, useMemo } from "react";
import { IQuestionRepeatorProps } from "./types";
import { QuestionRepeatorWrapper } from "./components/question-repeator-wrapper";
import { Button } from "@/components/ui/button";
import { Plus, X } from "lucide-react";
import { cn } from "@/lib/utils";

export const getDefaultQuestionRepeatorValue = (question: any) => {
  const defaultQuestionRepeatorValue: Record<string, any> = {
    _id: Date.now(),
  };

  for (const questionId of Object.keys(question?.questions || {})) {
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
  }, [value, question, onChange]);

  const onRemoveItem = useCallback(
    (index: number) => {
      const newQuestionValue = value.filter((_, i) => i !== index);
      onChange("", newQuestionValue);
    },
    [value, onChange]
  );

  useEffect(() => {
    if (value?.length === 0) {
      const defaultQuestionRepeatorValue =
        getDefaultQuestionRepeatorValue(question);
      onChange("", [defaultQuestionRepeatorValue]);
    }
  }, []);

  const groupName = question?.settings?.groupName || "Item";

  return (
    <div
      ref={ref}
      className="flex flex-col gap-4"
      aria-label="Integration Question Repeator"
      role="form"
      data-testid="integration-question-repeator"
    >
      <div className="flex flex-col gap-4">
        {value?.map((questionValue, index) => (
          <div
            key={questionValue?._id}
            className={cn(
              "flex flex-col gap-3 p-4 rounded-lg",
              "border border-border/50 bg-muted/20"
            )}
          >
            <div className="flex items-center justify-between gap-3">
              <span className="text-sm font-medium text-foreground">
                {groupName} {index + 1}
              </span>
              {value?.length > 1 && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:text-destructive"
                  onClick={() => onRemoveItem(index)}
                  data-testid="item-delete-icon"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
            
            <div className="flex flex-col gap-3 pl-2 border-l-2 border-border/30">
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
      
      <Button
        variant="outline"
        onClick={onAddQuestionClick}
        className="w-fit gap-2"
      >
        <Plus className="h-4 w-4" />
        Add {groupName}
      </Button>
    </div>
  );
});

QuestionRepeator.displayName = "QuestionRepeator";
