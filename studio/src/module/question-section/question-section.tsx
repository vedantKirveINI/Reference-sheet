import React, { useState } from "react";
import { Editor } from "@src/module/editor";
import { useInView } from "react-intersection-observer";
import { ODSIcon } from "@src/module/ods";
import { ODSTooltip as Tooltip } from "@src/module/ods";
import { Mode, QuestionAlignments, fontSizeMappingForDescription, fontSizeMappingForQuestion, removeTagsFromString,  } from "@oute/oute-ds.core.constants";
import { QuestionSectionProps } from "./types";
import { getQuestionPlaceholder } from "./utils";
import _ from "lodash";
import { getQuestionFontStyles, getDescriptionFontStyles, getQuestionContainerStyles, getquestionTitleStickyStyles, getInteractionGuidelineStyles, toolTipStyles, skeletonStyle,  } from "./styles";
import { InteractionGuideline } from "./components/InteractionGuideline";
import AiIconLottieData from "./assets/AiIconLottieData.json";
import Lottie from "lottie-react";
import promptServices from "./services/prompt-services-sdk";

export function QuestionSection(props: QuestionSectionProps) {
  const {
    editable,
    questionTitle = "",
    description = "",
    onChange,
    theme,
    isRequired = false,
    questionIndex,
    questionIndexTheme,
    questionAlignment,
    mode,
    hideQuestionIndex,
    isCreator = false,
    variables = {},
    answers = {},
    questionType,
    isAugmentorAvailable,
    viewPort,
    style = {},
    question = {},
    onFocus = () => {},
    autoFocus = true,
  } = props;
  const [isLoading, setIsLoading] = useState(false);

  const questionTheme = {
    fontWeight: theme?.styles?.questionSize === "XS" ? 400 : undefined,
    fontSize: fontSizeMappingForQuestion[theme?.styles?.questionSize],
    color: theme?.styles?.questions,
    fontFamily: theme?.styles?.fontFamily,
  };

  const { ref: questionRef, inView } = useInView({
    threshold: 0,
  });

  const descriptionTheme = {
    fontWeight: theme?.styles?.questionSize === "XS" ? 400 : undefined,
    fontSize: fontSizeMappingForDescription[theme?.styles?.questionSize],
    color: theme?.styles?.description,
    opacity: 0.7,
    fontFamily: theme?.styles?.fontFamily,
  };

  //Question alignment center is only applied to card mode
  const questionAlignmentCenter =
    mode === Mode.CARD && questionAlignment === QuestionAlignments.CENTER;

  const isQuestionEmpty = _.isEmpty(removeTagsFromString(questionTitle));

  const recallQuestionToAnswerConverter = (question) => {
    if (isCreator) return question;

    const parser = new DOMParser();
    const doc = parser.parseFromString(question, "text/html");
    const spans = doc.querySelectorAll("span[node-id]");

    if (!spans || spans.length === 0) return question;

    spans.forEach((span) => {
      const nodeId = span.getAttribute("node-id");
      const pathStr = span.getAttribute("data-lexical-recall-path");
      const answerSpan = doc.createElement("span");
      answerSpan.textContent = _.isEmpty(pathStr)
        ? answers[nodeId]?.response
        : _.get(answers[nodeId], pathStr);
      span.parentNode.insertBefore(answerSpan, span.nextSibling);

      span.remove();
    });

    // not using XMLSerializer because it serializes the entire document,
    // including the <html> and <body> tags.
    const modifiedHtmlString = doc.body.innerHTML;
    return modifiedHtmlString;
  };

  const handleAiSearch = async () => {
    try {
      const prompt = `You are an agent tasked with rewriting a question title based on the following inputs. 
      Your goal is to improve the title according to the specified objective, 
      while preserving its original meaning and incorporating any contextual cues.
      Inputs:
      Original Question Title: ${questionTitle}
      Rewriting Objective: It should be clearer, more concise, and more engaging,
      Optional Tone/Style Preference:  rewrite this in a neutral tone,
      Task: Rewrite the provided question title to meet the rewriting objective and reflect any contextual cues or style preferences. 
      Focus on clarity and engagement.`;

      setIsLoading(true);
      const response = await promptServices.prompt(prompt);
      if (response?.status === "success") {
        const choices = response?.result?.data?.choices;
        const content = choices[0]?.message?.content;
        const result = content.replace(/^"|"$/g, "");
        onChange("question", result);
      }
      setIsLoading(false);
    } catch (error) {
      setIsLoading(false);
    }
  };

  return (
    <div
      style={{ ...style, ...(getQuestionContainerStyles({
        questionAlignmentCenter,
        mode: mode,
      })) }}
      id="question-section-editor"
    >
      <div style={{ height: "2.5em" }}>
        {isCreator && questionTitle && (
          <Tooltip
            title="Rewrite with AI"
            placement="right"
            arrow={false}
            slotProps={{
              popper: {
                modifiers: [
                  {
                    name: "offset",
                    options: {
                      offset: [-20, 20],
                    },
                  },
                ],
              },
              tooltip: {
                className: "custom-tooltip",
                sx: toolTipStyles,
              },
            }}
          >
            <div>
              <Lottie
                onClick={() => !isLoading && handleAiSearch()}
                animationData={AiIconLottieData}
                style={{
                  height: "2.5em",
                  cursor: "pointer",
                }}
              />
            </div>
          </Tooltip>
        )}
      </div>
      {!isCreator && !inView && questionTitle && mode == Mode.CARD ? (
        <div
          style={getquestionTitleStickyStyles({ viewPort, questionTheme })}
          data-testid="floating-question-title"
        >
          <div className="flex items-center gap-3 min-w-0">
            <span className="overflow-hidden text-ellipsis whitespace-nowrap shrink min-w-0">
              {`${questionIndex}. ${removeTagsFromString(questionTitle)} `}
              {isRequired && " *"}
            </span>
            {questionTitle && question?.settings?.toolTipText?.length > 0 && (
              <Tooltip
                title={question?.settings?.toolTipText || ""}
                placement="top"
                arrow={false}
              >
                <span
                  className="inline-flex items-center cursor-help pointer-events-auto shrink-0"
                  data-testid="floating-question-title-info-icon"
                >
                  <ODSIcon
                    outeIconName="OUTEInfoIcon"
                    outeIconProps={{
                      "data-testid": "info-icon",
                    }}
                    buttonProps={{
                      sx: {
                        padding: 0,
                      },
                    }}
                    onClick={() => {}}
                  />
                </span>
              </Tooltip>
            )}
          </div>
        </div>
      ) : null}

      {!editable && !questionTitle ? null : (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.75em",
            width: "100%",
            maxWidth: questionTitle && !isLoading && "fit-content",
          }}
          ref={questionRef}
        >
          {isLoading ? (
            <div style={skeletonStyle}></div>
          ) : (
            <Editor
              onChange={(_ques) => {
                onChange("question", _ques);
              }}
              editable={editable}
              placeholder={
                isRequired
                  ? `${getQuestionPlaceholder(questionType)} *`
                  : getQuestionPlaceholder(questionType)
              }
              value={recallQuestionToAnswerConverter(questionTitle)}
              theme={questionTheme}
              style={getQuestionFontStyles({
                isRequired,
                questionTheme,
                isQuestionEmpty,
                hideQuestionIndex,
                questionIndex,
                isCreator,
                questionAlignmentCenter,
                questionType,
              })}
              enableFXPicker={isCreator}
              variables={variables}
              autoFocus={autoFocus}
              testId={"question-editor"}
              onFocus={onFocus}
              enableLinkCreation={true}
            />
          )}

          {questionTitle && question?.settings?.toolTipText?.length > 0 && (
            <Tooltip
              title={question?.settings?.toolTipText || ""}
              placement="top"
              arrow={false}
            >
              <ODSIcon
                outeIconName="OUTEInfoIcon"
                outeIconProps={{
                  "data-testid": "info-icon",
                }}
                buttonProps={{
                  sx: {
                    padding: 0,
                  },
                }}
                onClick={() => {}}
              />
            </Tooltip>
          )}
        </div>
      )}
      {!editable && !description ? null : (
        <Editor
          editable={editable}
          placeholder="Description (optional)"
          value={recallQuestionToAnswerConverter(description)}
          theme={descriptionTheme}
          onChange={(_desc) => {
            onChange("description", _desc);
          }}
          enableFXPicker={isCreator}
          variables={variables}
          style={getDescriptionFontStyles({
            questionAlignmentCenter,
            questionType,
            theme: descriptionTheme,
          })}
          testId={"description-editor"}
          onFocus={onFocus}
          enableLinkCreation={true}
          autoFocus={false}
        />
      )}
      {isCreator ? null : (
        <InteractionGuideline
          type={questionType}
          theme={theme}
          settings={question?.settings}
          value={answers[question?.node_id]?.response}
          style={getInteractionGuidelineStyles()}
        />
      )}
    </div>
  );
}
