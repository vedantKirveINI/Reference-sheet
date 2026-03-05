import { useMemo } from "react";
import { IQuestionRepeatorProps, QuestionValue } from "../../types";
import { Mode, ViewPort } from "@oute/oute-ds.core.constants";
import AnswerSection from "../../../../AnswerSection";
import { Editor } from "@src/module/editor";
import { cn } from "@/lib/utils";

interface QuestionRepeatorWrapperProps {
  answers: IQuestionRepeatorProps["answers"];
  question: IQuestionRepeatorProps["question"];
  theme: IQuestionRepeatorProps["theme"];
  variables: IQuestionRepeatorProps["variables"];
  value: QuestionValue;
  onAnswerSectionChange: ({ _value }: { _value: any }) => void;
}

export const QuestionRepeatorWrapper = ({
  answers,
  question,
  theme,
  variables,
  value,
  onAnswerSectionChange,
}: QuestionRepeatorWrapperProps) => {
  const isRequired = question?.settings?.required;
  const hasError = !!value?.error;

  const questionTheme = useMemo(
    () => ({
      fontSize: "14px",
      color: theme?.styles?.questions || "#18181b",
      fontFamily: "Inter",
    }),
    [theme?.styles?.questions]
  );

  return (
    <div className="flex flex-col gap-2">
      {question?.question && (
        <div className="flex items-start gap-1 w-full">
          <Editor
            editable={false}
            value={question?.question}
            theme={questionTheme}
            style={{ fontSize: "14px", fontWeight: 500, lineHeight: 1.4 }}
            enableFXPicker={false}
          />
          {isRequired && <span className="text-destructive text-sm">*</span>}
        </div>
      )}

      <AnswerSection
        type={question?.type}
        key={question?.id}
        viewPort={ViewPort.MOBILE}
        isCreator={false}
        question={question}
        theme={theme}
        value={value}
        onChange={(fillerValue: any) => {
          onAnswerSectionChange({ _value: fillerValue });
        }}
        error={value?.error || ""}
        mode={Mode.CLASSIC}
        variables={variables}
        answers={answers}
        id={`repeator-${question?.id}`}
      />

      {hasError && (
        <p className={cn(
          "text-sm text-destructive",
          "px-3 py-2 rounded-md",
          "bg-destructive/10"
        )}>
          {value?.error}
        </p>
      )}
    </div>
  );
};
