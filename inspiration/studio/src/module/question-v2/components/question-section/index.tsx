import { CSSProperties, useMemo, useRef, useState } from "react";
import { useInView } from "react-intersection-observer";
import { ODSIcon } from "@src/module/ods";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { icons } from "@/components/icons";
import { Mode, QuestionAlignments, TQuestion, ViewPort, fontSizeMappingForDescription, fontSizeMappingForQuestion, removeTagsFromString,  } from "@oute/oute-ds.core.constants";
import { isEmpty } from "lodash";

import { convertRecallQuestionToAnswer } from "../../utils";
import { getQuestionContainerStyles, getquestionTitleStickyStyles, getInteractionGuidelineStyles, skeletonStyle,  } from "./styles";
import { InteractionGuidelines } from "../interaction-guidelines";
import QuestionTitleEditor from "./question-title-editor";
import QuestionDescriptionEditor from "./question-desciption-editor";

interface QuestionSectionProps {
  editable: boolean;
  showDescription?: boolean;
  viewPort: ViewPort;
  mode: Mode;
  questionIndex?: string;
  onChange: (key: string, value: string) => void;
  theme?: any;
  isRequired?: boolean;
  questionAlignment?: string;
  questionData: TQuestion;
  variables?: any;
  answers?: any;
  style?: CSSProperties;
  onFocus?: () => void;
  onBlur?: () => void;
  autoFocus?: boolean;
  hideQuestionIndex?: boolean;
}

export function QuestionSection(props: QuestionSectionProps) {
  const {
    editable,
    onChange,
    theme,
    isRequired = false,
    questionIndex,
    questionAlignment,
    mode,
    variables = {},
    answers = {},
    viewPort,
    style = {},
    questionData,
    autoFocus = true,
    showDescription = true,
    hideQuestionIndex = false,
  } = props;

  const questionTitle = questionData?.question;
  const description = questionData?.description;
  const questionType = questionData?.type;
  const [isLoading, setIsLoading] = useState({
    title: false,
    description: false,
  });

  const questionTheme = useMemo(() => {
    return {
      fontWeight: theme?.styles?.questionSize === "XS" && "400 !important",
      fontSize: fontSizeMappingForQuestion[theme?.styles?.questionSize],
      color: theme?.styles?.questions,
      fontFamily: theme?.styles?.fontFamily,
    };
  }, [
    theme?.styles?.fontFamily,
    theme?.styles?.questionSize,
    theme?.styles?.questions,
  ]);

  const { ref: questionRef, inView } = useInView({
    threshold: 0,
  });

  const descriptionTheme = useMemo(() => {
    return {
      fontWeight: theme?.styles?.questionSize === "XS" && "400 !important",
      fontSize: fontSizeMappingForDescription[theme?.styles?.questionSize],
      color: theme?.styles?.description,
      opacity: 0.7,
      fontFamily: theme?.styles?.fontFamily,
    };
  }, [
    theme?.styles?.description,
    theme?.styles?.fontFamily,
    theme?.styles?.questionSize,
  ]);

  // Only apply alignment in CARD and CLASSIC modes
  const shouldApplyAlignment = mode === Mode.CARD || mode === Mode.CLASSIC;
  
  // Calculate justifyContent for the title container
  const getJustifyContent = () => {
    if (!shouldApplyAlignment || !questionAlignment) return "flex-start";
    return questionAlignment;
  };

  const { questionTitleToShow, isQuestionEmpty } = useMemo(() => {
    if (editable) {
      let isQuestionEmpty = false;
      if (questionTitle?.includes?.("data-lexical-recall-question")) {
        isQuestionEmpty = false;
      } else {
        isQuestionEmpty = isEmpty(removeTagsFromString(questionTitle));
      }

      return {
        questionTitleToShow: questionTitle,
        isQuestionEmpty: isQuestionEmpty,
      };
    } else {
      const convertedQuestion = convertRecallQuestionToAnswer(
        questionTitle,
        answers
      );
      const isQuestionEmpty = isEmpty(removeTagsFromString(convertedQuestion));
      return {
        questionTitleToShow: isQuestionEmpty
          ? `...${isRequired ? "*" : ""}`
          : convertedQuestion,
        isQuestionEmpty,
      };
    }
  }, [editable, questionTitle, answers, isRequired]);

  const isRecalledQuestionUsed = useMemo(() => {
    return (
      questionTitle?.includes?.("data-lexical-recall-question") ||
      questionTitle?.includes?.("node-id")
    );
  }, [questionTitle]);

  return (
    <div
      style={{ ...style, ...(getQuestionContainerStyles({
        questionAlignment: shouldApplyAlignment ? questionAlignment : undefined,
        mode: mode,
      })) }}
      id="question-section-editor"
      data-testid="question-section-editor"
    >
      {!editable && !inView && questionTitle && mode == Mode.CARD ? (
        <div
          style={getquestionTitleStickyStyles({ viewPort, questionTheme })}
          data-testid="floating-question-title"
        >
          <div className="flex items-center gap-3 min-w-0">
            <span className="overflow-hidden text-ellipsis whitespace-nowrap shrink min-w-0">
              {hideQuestionIndex || questionIndex == null || questionIndex === ""
                ? `${removeTagsFromString(questionTitle)}`
                : `${questionIndex}. ${removeTagsFromString(questionTitle)} `}
              {isRequired && " *"}
            </span>
            {questionTitle && questionData?.settings?.toolTipText?.length > 0 && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span
                      className="inline-flex items-center cursor-help pointer-events-auto shrink-0"
                      data-testid="floating-question-title-info-icon"
                    >
                      {icons.info && <icons.info className="size-5 shrink-0" />}
                    </span>
                  </TooltipTrigger>
                  <TooltipContent
                    side="top"
                    sideOffset={8}
                    className="z-[10000] max-w-[20rem] whitespace-normal break-words bg-[rgba(38,50,56,0.9)] text-white text-[0.875rem] leading-[1.4] px-3 py-2 rounded border-0"
                    style={{
                      wordBreak: "break-word",
                      overflowWrap: "break-word",
                    }}
                  >
                    <span
                      className="block whitespace-normal break-words max-w-[20rem] leading-[1.4]"
                      style={{
                        wordWrap: "break-word",
                        overflowWrap: "break-word",
                        wordBreak: "break-word",
                      }}
                    >
                      {questionData?.settings?.toolTipText || ""}
                    </span>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>
        </div>
      ) : null}

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "0.75em",
          width: "100%",
          justifyContent: getJustifyContent(),
          maxWidth:
            questionTitle &&
            questionData?.settings?.toolTipText &&
            !isLoading &&
            "fit-content",
        }}
        ref={questionRef}
      >
        {isLoading.title ? (
          <div
            style={skeletonStyle}
            aria-label="Loading AI generated content"
            role="progressbar"
          ></div>
        ) : (
          <QuestionTitleEditor
            editable={editable}
            onChange={onChange}
            questionTitleToShow={questionTitleToShow}
            variables={variables}
            questionTitle={questionTitle}
            isRecalledQuestionUsed={isRecalledQuestionUsed}
            isLoading={isLoading}
            setIsLoading={setIsLoading}
            isRequired={isRequired}
            questionTheme={questionTheme}
            isQuestionEmpty={isQuestionEmpty}
            hideQuestionIndex={hideQuestionIndex}
            questionIndex={questionIndex}
            questionAlignment={shouldApplyAlignment ? questionAlignment : undefined}
            questionType={questionType}
            mode={mode}
          />
        )}

        {questionTitle && questionData?.settings?.toolTipText?.length > 0 && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    cursor: "help",
                    pointerEvents: "auto",
                  }}
                  data-testid="question-tooltip"
                >
                  <ODSIcon
                    outeIconName="OUTEInfoIcon"
                    outeIconProps={{
                      "data-testid": "info-icon",
                      style: {
                        width: "1.25rem",
                        height: "1.25rem",
                        color: "inherit",
                      },
                    }}
                  />
                </span>
              </TooltipTrigger>
              <TooltipContent
                side="top"
                sideOffset={8}
                className="z-[10000] max-w-[20rem] whitespace-normal break-words bg-[rgba(38,50,56,0.9)] text-white text-[0.875rem] leading-[1.4] px-3 py-2 rounded border-0"
                style={{
                  wordBreak: "break-word",
                  overflowWrap: "break-word",
                }}
              >
                <span
                  style={{
                    display: "block",
                    whiteSpace: "normal",
                    wordWrap: "break-word",
                    overflowWrap: "break-word",
                    wordBreak: "break-word",
                    maxWidth: "20rem",
                    lineHeight: "1.4",
                  }}
                >
                  {questionData?.settings?.toolTipText || ""}
                </span>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>

      {showDescription &&
        (!editable && !description ? null : isLoading.description ? (
          <div
            style={skeletonStyle}
            aria-label="Loading AI generated content"
            role="progressbar"
          ></div>
        ) : (
          <QuestionDescriptionEditor
            editable={editable}
            onChange={onChange}
            description={description}
            isRecalledQuestionUsed={isRecalledQuestionUsed}
            isLoading={isLoading}
            variables={variables}
            descriptionTheme={descriptionTheme}
            questionType={questionType}
            answers={answers}
            convertRecallQuestionToAnswer={convertRecallQuestionToAnswer}
            questionAlignment={shouldApplyAlignment ? questionAlignment : undefined}
            setIsLoading={setIsLoading}
            mode={mode}
          />
        ))}

      {editable ? null : (
        <InteractionGuidelines
          type={questionType}
          settings={questionData?.settings}
          value={answers[questionData?._id]?.response}
          style={getInteractionGuidelineStyles({ questionAlignment, theme })}
        />
      )}
    </div>
  );
}
