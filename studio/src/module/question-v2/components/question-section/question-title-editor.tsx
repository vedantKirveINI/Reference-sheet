import React, { useMemo, useState } from "react";
import { Editor } from "@src/module/editor";
import { Mode, QuestionType, QuestionAlignments } from "@src/module/constants";
import { AiRewriteButton } from "../ai-rewrite-button";
import { getQuestionFontStyles } from "./styles";
import { getQuestionPlaceholder } from "../../utils";

const QuestionTitleEditor = ({
  editable,
  questionTitle,
  onChange,
  isRecalledQuestionUsed,
  isLoading,
  variables,
  questionTheme,
  questionType,
  questionTitleToShow,
  questionAlignment,
  isQuestionEmpty,
  hideQuestionIndex,
  questionIndex,
  isRequired,
  setIsLoading,
  mode,
}) => {
  const [isFocused, setIsFocused] = useState(false);

  const editorKey = useMemo(() => {
    if (editable && questionType !== QuestionType.STRIPE_PAYMENT) {
      return "question-title-editor";
    }
    return `question-title-editor-${questionTitleToShow}`;
  }, [editable, questionTitleToShow, questionType]);

  const editorClassName = useMemo(() => {
    const classes = ['question-editor'];
    classes.push(editable ? 'question-editor-editable' : 'question-editor-readonly');
    if (mode === Mode.CLASSIC) {
      classes.push('classic-mode');
    }
    return classes.join(' ');
  }, [editable, mode]);

  const showIndex = !hideQuestionIndex && questionIndex && !editable;
  const themeColor = questionTheme?.color || "#263238";
  const themeFontFamily = questionTheme?.fontFamily || "Noto Serif";

  // When we have title content, use compact layout (title + AI icon beside each other).
  // When empty, use full width so placeholder can grow vertically as before.
  const hasTitleContent =
    editable && questionTitle && !isRecalledQuestionUsed && !isQuestionEmpty;
  const baseFontStyles = getQuestionFontStyles({
    questionTheme,
    questionAlignment,
    questionType,
    mode: mode || Mode.CARD,
  });

  return (
    <>
      <div
        style={{
          width: (() => {
            // Creator: full width when empty (placeholder grows vertically), fit-content when has content
            if (editable) return hasTitleContent ? "fit-content" : "100%";
            const hasTitle = questionTitle && !isRecalledQuestionUsed;
            if (hasTitle) return "fit-content";
            if (
              questionAlignment === QuestionAlignments.RIGHT ||
              questionAlignment === QuestionAlignments.CENTER
            ) {
              return "fit-content";
            }
            return "100%";
          })(),
          display: "flex",
          alignItems: hasTitleContent ? "center" : "flex-start",
          gap: "0.5em",
          maxWidth: "100%",
        }}
        data-required={isRequired ? "true" : "false"}
        data-empty={isQuestionEmpty ? "true" : "false"}
      >
        {showIndex && (
          <span
            style={{
              color: themeColor,
              fontFamily: themeFontFamily,
              fontWeight: questionTheme?.fontWeight ?? 500,
              fontSize: questionTheme?.fontSize ?? "1em",
              marginRight: "0.25em",
            }}
          >
            {questionIndex}.{" "}
          </span>
        )}
        {hasTitleContent ? (
          <div
            className="inline-flex max-w-full items-end gap-2"
            style={{ width: "fit-content" }}
          >
            <div
              className="min-w-0 shrink grow-0"
              style={{ alignSelf: "stretch" }}
            >
              <Editor
                key={editorKey}
                onChange={(_ques) => {
                  if (editable) {
                    onChange("question", _ques);
                  }
                }}
                editable={editable}
                placeholder={
                  isRequired
                    ? `${getQuestionPlaceholder(questionType)} *`
                    : getQuestionPlaceholder(questionType)
                }
                value={questionTitleToShow}
                theme={questionTheme}
                style={{
                  ...baseFontStyles,
                  width: "fit-content",
                  minWidth: 0,
                }}
                contentStyle={{ width: "fit-content" }}
                className={editorClassName}
                enableFXPicker={editable}
                variables={variables}
                autoFocus={true}
                testId={"question-editor"}
                enableLinkCreation={true}
                onFocus={() => {
                  setIsFocused(true);
                }}
                onBlur={(event: React.FocusEvent<HTMLDivElement>) => {
                  if (
                    event?.relatedTarget?.closest?.(".lexical-text-format-popup") ||
                    event?.relatedTarget?.closest?.(".lexical-link-editor")
                  ) {
                    return;
                  }
                  setIsFocused(false);
                }}
              />
            </div>
            {isFocused && (
              <span className="shrink-0 self-end">
                <AiRewriteButton
                  isLoading={isLoading.title}
                  onLoadToggle={(status) =>
                    setIsLoading((prevState) => ({
                      ...prevState,
                      title: status,
                    }))
                  }
                  questionTitle={questionTitle}
                  onRewrite={(newTitle) => onChange("question", newTitle)}
                  type="title"
                />
              </span>
            )}
          </div>
        ) : (
          <Editor
            key={editorKey}
            onChange={(_ques) => {
              if (editable) {
                onChange("question", _ques);
              }
            }}
            editable={editable}
            placeholder={
              isRequired
                ? `${getQuestionPlaceholder(questionType)} *`
                : getQuestionPlaceholder(questionType)
            }
            value={questionTitleToShow}
            theme={questionTheme}
            style={baseFontStyles}
            className={editorClassName}
            enableFXPicker={editable}
            variables={variables}
            autoFocus={true}
            testId={"question-editor"}
            enableLinkCreation={true}
            onFocus={() => {
              setIsFocused(true);
            }}
            onBlur={(event: React.FocusEvent<HTMLDivElement>) => {
              if (
                event?.relatedTarget?.closest?.(".lexical-text-format-popup") ||
                event?.relatedTarget?.closest?.(".lexical-link-editor")
              ) {
                return;
              }
              setIsFocused(false);
            }}
          />
        )}
      </div>
    </>
  );
};

export default QuestionTitleEditor;
