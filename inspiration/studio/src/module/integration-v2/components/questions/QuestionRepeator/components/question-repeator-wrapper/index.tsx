import React, { useMemo } from "react";
import { IQuestionRepeatorProps, QuestionValue } from "../../types";
import { Mode, ViewPort } from "@oute/oute-ds.core.constants";
import AnswerSection from "../../../../answer-section";
import { ODSError as Error } from "@src/module/ods";
import { Editor } from "@src/module/editor";
import { styles } from "./styles";
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
    <>
      <div style={styles.getQuestionContainerStyles()}>
        {question?.question && (
          <div className="flex items-start gap-1" style={{ width: "100%" }}>
            <Editor
              editable={false}
              value={question?.question}
              theme={questionTheme}
              style={{ fontSize: "14px", fontWeight: 500, lineHeight: 1.4 }}
              enableFXPicker={false}
            />
            {isRequired && <span className="text-destructive">*</span>}
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
          style={{
            marginBottom: "0",
          }}
        />

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
