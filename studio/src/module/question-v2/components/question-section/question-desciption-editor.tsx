import { useMemo, useState } from "react";
import { Editor } from "@src/module/editor";
import { Mode, QuestionType } from "@src/module/constants";

import { getDescriptionFontStyles } from "./styles";
import { AiRewriteButton } from "../ai-rewrite-button";

const QuestionDescriptionEditor = ({
  description,
  descriptionTheme,
  onChange,
  editable,
  setIsLoading,
  isLoading,
  isRecalledQuestionUsed,
  answers,
  variables,
  questionType,
  questionAlignment,
  convertRecallQuestionToAnswer,
  mode,
}) => {
  const [focused, setIsFocused] = useState(false);
  const descriptionToShow = useMemo(() => {
    return editable
      ? description
      : convertRecallQuestionToAnswer(description, answers);
  }, [answers, convertRecallQuestionToAnswer, description, editable]);

  const editorKey = useMemo(() => {
    if (editable && questionType !== QuestionType.STRIPE_PAYMENT) {
      return "question-description-editor";
    }
    return `question-description-editor-${descriptionToShow}`;
  }, [editable, descriptionToShow, questionType]);

  const hasDescriptionContent =
    editable && description && !isRecalledQuestionUsed;
  const baseDescriptionStyles = getDescriptionFontStyles({
    questionAlignment,
    questionType,
    theme: descriptionTheme,
    mode: mode || Mode.CARD,
  });

  // Single Editor instance so focus is preserved when typing first character
  // (layout and optional AiRewriteButton still depend on hasDescriptionContent)
  return (
    <div
      className={
        hasDescriptionContent
          ? "inline-flex max-w-full items-end gap-2"
          : "flex w-full"
      }
      style={{
        width: hasDescriptionContent
          ? "fit-content"
          : description && !isRecalledQuestionUsed
            ? "fit-content"
            : "100%",
      }}
    >
      <div
        className={
          hasDescriptionContent
            ? "min-w-0 shrink grow-0"
            : "min-w-0 w-full"
        }
        style={hasDescriptionContent ? { alignSelf: "stretch" } : undefined}
      >
        <Editor
          key={editorKey}
          editable={editable}
          placeholder="Description (optional)"
          value={descriptionToShow}
          theme={descriptionTheme}
          onChange={(_desc) => {
            if (editable) {
              onChange("description", _desc);
            }
          }}
          enableFXPicker={editable}
          variables={variables}
          style={
            hasDescriptionContent
              ? {
                  ...baseDescriptionStyles,
                  width: "fit-content",
                  minWidth: 0,
                }
              : baseDescriptionStyles
          }
          contentStyle={
            hasDescriptionContent ? { width: "fit-content" } : undefined
          }
          className="description-editor"
          testId={"description-editor"}
          onFocus={() => {
            setIsFocused(true);
          }}
          onBlur={(event: React.FocusEvent<HTMLDivElement>) => {
            if (
              event.relatedTarget?.closest(".lexical-text-format-popup") ||
              event.relatedTarget?.closest(".lexical-link-editor")
            ) {
              return;
            }
            setIsFocused(false);
          }}
          enableLinkCreation={true}
        />
      </div>
      {hasDescriptionContent && focused && (
        <span className="shrink-0 self-end">
          <AiRewriteButton
            isLoading={isLoading.description}
            onLoadToggle={(status) => {
              setIsLoading((prevState) => ({
                ...prevState,
                description: status,
              }));
            }}
            questionDescription={description}
            onRewrite={(newDescription) => {
              onChange("description", newDescription);
            }}
            type="description"
          />
        </span>
      )}
    </div>
  );
};

export default QuestionDescriptionEditor;
