import { QuestionRenderer } from "@src/module/question-v2";
import { useCallback, useRef } from "react";
import {
  type TQuestion,
  Mode,
  QuestionTab,
  ViewPort,
  questionHelpers,
  SETTINGS_INPUT_NAMES,
  getScalingFactor,
} from "@src/module/constants";
import Placeholder from "./components/placeholder/index";
import { getContainerStyles } from "./styles";
import "@src/module/constants/shared/shared.css";
import {
  useCanvasConfigContext,
  useQuestionContext,
} from "@src/module/contexts";

export type QuestionCreatorProps = {
  styles?: React.CSSProperties;
  goToTab?: (questionTab: string) => void;
  showSidebar?: (sidebarKey: string) => void;
};

export function QuestionCreator({
  styles,
  goToTab = () => {},
  showSidebar = () => {},
}: QuestionCreatorProps) {
  const {
    question,
    mode,
    viewPort,
    theme,
    activeQuestionIdToShow,
    onQuestionChange,
    onSettingsInputToFocusChange,
    onActiveQuestionIdToShowChange,
  } = useQuestionContext();
  const { variables, workspaceId } = useCanvasConfigContext();

  const ref = useRef(null);

  const fontSize = getScalingFactor(
    viewPort === ViewPort.MOBILE ? 400 : window.innerWidth
  );

  const setQuestionHandler = (key, val) => {
    onQuestionChange({ [key]: val });
  };

  const onSubQuestionSelect = useCallback(
    (questionId: string) => {
      onActiveQuestionIdToShowChange(questionId);
    },
    [onActiveQuestionIdToShowChange]
  );

  const onQuestionEditorFocus = useCallback(() => {
    onActiveQuestionIdToShowChange(null);
  }, [onActiveQuestionIdToShowChange]);

  if (!question || !Object?.keys?.(question)?.length) {
    return null;
  }

  const questionBackgroundStyles = questionHelpers.getQuestionBackgroundStyles(
    theme,
    viewPort,
    mode,
    question
  );

  const isAugmentorAvailable = question?.augmentor?.url;

  const isAugmentorBackground =
    mode === Mode.CARD &&
    isAugmentorAvailable &&
    (viewPort === ViewPort.DESKTOP
      ? question?.augmentor?.alignment?.cardDesktop === "background"
      : question?.augmentor?.alignment?.cardMobile === "background");

  const containerBgStyles =
    isAugmentorBackground
      ? {
          ...questionBackgroundStyles,
          backgroundColor: theme?.styles?.backgroundColor ?? "#FFFFFF",
          backgroundImage: "none",
        }
      : questionBackgroundStyles;

  return (
    <div
      style={getContainerStyles({
        bgStyles: containerBgStyles,
        fontSize,
        styles,
        mode,
        viewPort,
        isAugmentorAvailable,
      })}
      id="capture-question"
      data-testid="question-creator-root"
      data-viewport={viewPort}
      aria-label={`Question Creator ${viewPort}`}
    >
      {isAugmentorBackground && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            zIndex: 0,
            borderRadius: "1.25rem",
            overflow: "hidden",
            ...questionBackgroundStyles,
            opacity: (question?.augmentor?.opacity ?? 100) / 100,
          }}
          aria-hidden
        />
      )}
      {mode === Mode.CLASSIC && (
        <Placeholder
          mode={mode}
          questionType={question?.type}
          viewPort={viewPort}
        />
      )}
      {/* We are handling padding for question component within Question component. 
                It can be handled from here but augmentor(mobile) is end to end */}
      <QuestionRenderer
        ref={ref}
        handlers={{
          onCTAClick: () => {
            goToTab(QuestionTab.SETTINGS);
            onSettingsInputToFocusChange(SETTINGS_INPUT_NAMES.CTA_EDITOR);
          },
          onChange: setQuestionHandler,
          onSubQuestionSelect: onSubQuestionSelect,
          goToTab: goToTab,
          showSidebar: showSidebar,
          onQuestionEditorFocus: onQuestionEditorFocus,
          onCountryClick: () => {
            goToTab(QuestionTab.SETTINGS);
            // added timeout because dropdown list was overlapping with the question section
            setTimeout(() => {
              onSettingsInputToFocusChange(
                SETTINGS_INPUT_NAMES.DEFAULT_COUNTRY_PICKER
              );
            }, 200);
          },
        }}
        uiConfig={{
          mode,
          viewPort,
          theme,
        }}
        questionData={question as TQuestion}
        stateConfig={{
          isCreator: true,
          selectedSubQuestionId: activeQuestionIdToShow,
        }}
        nodeConfig={{}}
        variables={variables}
        value={question?.placeholder || question?.blocks}
        questionIndex={"1"}
        canvasConfig={{ workspaceId: workspaceId || "" }}
      />
      {/* <Question
        ref={ref}
        questionIndex={1}
        mode={mode}
        viewPort={viewPort}
        theme={theme}
        question={question}
        isCreator
        value={question?.placeholder || question?.blocks}
        onChange={setQuestionHandler}
        variables={variables}
        goToTab={goToTab}
        showSidebar={showSidebar}
        onSubQuestionSelect={onSubQuestionSelect}
        selectedSubQuestionId={activeQuestionIdToShow}
        onQuestionEditorFocus={onQuestionEditorFocus}
        onCTAClick={() => {
          goToTab(QuestionTab.SETTINGS);
          onSettingsInputToFocusChange(SETTINGS_INPUT_NAMES.CTA_EDITOR);
        }}
      /> */}
    </div>
  );
}
