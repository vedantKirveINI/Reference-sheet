import { useEffect, useState, forwardRef, useCallback, lazy, useRef } from "react";
import { Mode, ViewPort, questionHelpers, getScalingFactor } from "@src/module/constants";
import "@src/module/constants/shared/shared.css";
import { getMainContainerStyles } from "./styles";
import useWindowSize from "./hooks/use-window-size";
import { variableSDKServices } from "./services/variableSDKServices";
import SuspenseComponent from "./components/suspense-component";
import { type SubmissionState, SUBMISSION_STATES } from "@src/module/constants";

const QuestionFillerCard = lazy(() =>
  import("./components/card").then((module) => ({
    default: module.QuestionFillerCard,
  }))
);
const QuestionFillerChat = lazy(() =>
  import("./components/chat").then((module) => ({
    default: module.QuestionFillerChat,
  }))
);
const QuestionFillerClassic = lazy(() =>
  import("./components/classic").then((module) => ({
    default: module.QuestionFillerClassic,
  }))
);

export type QuestionFillerProps = {
  theme?: any;
  viewPort?: any;
  mode?: any;
  questions?: any;
  taskGraph?: any;
  ref?: any;
  showFooter?: boolean;
  variables?: any;
  resourceIds?: Record<string, any>;
  initialAnswers?: any;
  initialPipeline?: any;
  hideQuestionIndex?: any;
  onSuccess?: (answers: any) => Promise<void>;
  annotation?: any;
  onEvent?: any;
  isPreviewMode?: boolean;
  containerWidth?: number;
  onAnalyticsEvent?: (...args: any) => void;
  onRestart?: () => void;
  hideBrandingButton?: boolean;
  showEndingScreen?: boolean;
  afterSubmitRedirectUrl?: string;
  submissionState: SubmissionState;
  onSubmissionStateChange?: (state: SubmissionState) => void;
};

export const QuestionFiller = forwardRef(
  (props: QuestionFillerProps, ref: any): any => {
    const {
      theme = {},
      mode,
      viewPort: viewportFromProps,
      questions,
      taskGraph = [],
      resourceIds = {},
      variables,
      initialAnswers,
      initialPipeline,
      showFooter,
      hideQuestionIndex = false,
      onSuccess,
      isPreviewMode,
      containerWidth,
      annotation,
      onEvent = () => { },
      onAnalyticsEvent = () => { },
      onRestart = () => { },
      hideBrandingButton = false,
      showEndingScreen = true,
      afterSubmitRedirectUrl = null,
      submissionState,
      onSubmissionStateChange,
    } = props;
    const [transformedState, setTransformedState] = useState(null);
    // Initialize viewport from props, will be updated by useEffect
    const [viewPort, setViewPort] = useState(viewportFromProps || ViewPort.DESKTOP);
    const [activeQuestion, setActiveQuestion] = useState<any>({});
    const [key, setKey] = useState<number>(1);

    const restartHandler = useCallback(() => {
      setKey((prev) => prev + 1);
      onRestart();
    }, [onRestart]);

    // Only use window size hook if NOT in preview mode
    // In preview mode, viewport is controlled by user selection, not window size
    const windowSize = useWindowSize();
    const width = isPreviewMode ? undefined : windowSize.width;

    const fetchTransformedState = useCallback(async () => {
      if (variables) {
        const transformedState =
          await variableSDKServices.transformedToState(variables);
        setTransformedState(transformedState?.result);
      }
    }, [variables]);

    useEffect(() => {
      fetchTransformedState();
    }, [fetchTransformedState]);

    // Reset submission state to IDLE in preview mode when form restarts (key changes)
    const prevKeyRef = useRef(key);
    useEffect(() => {
      if (isPreviewMode && key !== prevKeyRef.current && onSubmissionStateChange) {
        onSubmissionStateChange("IDLE");
      }
      prevKeyRef.current = key;
    }, [key, isPreviewMode, onSubmissionStateChange]);

    useEffect(() => {
      /* In preview mode, always use the viewport from props (user selection).
         Outside preview mode, determine viewport based on window width if not provided. */
      console.log("[PREVIEW_DEBUG] QuestionFiller viewport effect:", {
        isPreviewMode,
        viewportFromProps,
        width,
        currentViewPort: viewPort,
      });

      if (isPreviewMode) {
        // In preview mode, always respect the viewport prop
        if (viewportFromProps) {
          console.log("[PREVIEW_DEBUG] QuestionFiller setting viewport from props:", viewportFromProps);
          setViewPort(viewportFromProps);
        }
      } else {
        // Outside preview mode, use window width to determine viewport if not provided
        if (!viewportFromProps) {
          if (width && width <= 750) {
            setViewPort(ViewPort.MOBILE);
          } else {
            setViewPort(ViewPort.DESKTOP);
          }
        } else {
          setViewPort(viewportFromProps);
        }
      }
    }, [isPreviewMode, viewportFromProps, width]);

    const questionData = activeQuestion?.config ?? activeQuestion;
    const questionBackgroundStyles =
      questionHelpers.getQuestionBackgroundStyles(
        theme,
        viewPort,
        mode,
        questionData
      );

    const isAugmentorBackground =
      mode === Mode.CARD &&
      !!questionData?.augmentor?.url &&
      (viewPort === ViewPort.DESKTOP
        ? questionData?.augmentor?.alignment?.cardDesktop === "background"
        : questionData?.augmentor?.alignment?.cardMobile === "background");

    // In preview mode, use containerWidth if provided, otherwise use viewport-specific defaults
    // Outside preview mode, use window.innerWidth for desktop, 400 for mobile
    const widthForScaling = isPreviewMode
      ? (containerWidth || (viewPort === ViewPort.MOBILE ? 390 : 1280))
      : (viewPort === ViewPort.MOBILE ? 400 : window.innerWidth);

    // Debug logging for scaling
    useEffect(() => {
      if (isPreviewMode) {
        console.log("[PREVIEW_DEBUG] QuestionFiller scaling:", {
          containerWidth,
          viewPort,
          widthForScaling,
          isPreviewMode,
        });
      }
    }, [isPreviewMode, containerWidth, viewPort, widthForScaling]);

    const fontSize = getScalingFactor(widthForScaling);

    const handleOnSuccess = async (answers: any) => {
      try {
        onSuccess && (await onSuccess(answers));
      } catch (error) {
        // Silently handle errors in onSuccess callback
      } finally {
        // Update submission state after successful submission
        // SubmissionState is the key type, so we pass "SUBMITTED" not the value
        onSubmissionStateChange?.("SUBMITTED" as SubmissionState);
      }
    };

    return (
      <div
        data-testid="question-filler-root"
        style={getMainContainerStyles({
          bgStyles: isAugmentorBackground
            ? { backgroundColor: theme?.styles?.backgroundColor ?? "#FFFFFF" }
            : questionBackgroundStyles,
          fontSize,
        })}
      >
        {isAugmentorBackground && questionData?.augmentor?.url && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              zIndex: 0,
              borderRadius: isPreviewMode ? 0 : "1.25rem",
              overflow: "hidden",
              pointerEvents: "none",
            }}
            aria-hidden
          >
            <img
              src={questionData.augmentor.url}
              alt=""
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                objectPosition: "center",
                opacity: (questionData.augmentor.opacity ?? 100) / 100,
              }}
            />
          </div>
        )}
        {mode === Mode.CARD ? (
          <div
            style={
              isAugmentorBackground
                ? {
                    position: "relative",
                    zIndex: 1,
                    flex: 1,
                    minHeight: 0,
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "flex-end",
                  }
                : { display: "contents" }
            }
          >
            <SuspenseComponent>
              <QuestionFillerCard
                key={key}
                ref={ref}
                isPreviewMode={isPreviewMode}
                mode={mode}
                theme={theme}
                viewPort={viewPort}
                questions={questions}
                taskGraph={taskGraph}
                resourceIds={resourceIds}
                initialAnswers={initialAnswers}
                initialPipeline={initialPipeline}
                showFooter={showFooter}
                hideQuestionIndex={hideQuestionIndex}
                onSuccess={handleOnSuccess}
                state={transformedState}
                variables={variables}
                onNodeChange={({ nextNode }) => {
                  setActiveQuestion(nextNode);
                }}
                hideBrandingButton={hideBrandingButton}
                onEvent={onEvent}
                onAnalyticsEvent={onAnalyticsEvent}
                onRestart={restartHandler}
                showEndingScreen={showEndingScreen}
                afterSubmitRedirectUrl={afterSubmitRedirectUrl}
                submissionState={submissionState}
                onSubmissionStateChange={onSubmissionStateChange}
              />
            </SuspenseComponent>
          </div>
        ) : null}
        {mode === Mode.CHAT ? (
          <SuspenseComponent>
            <QuestionFillerChat
              key={key}
              ref={ref}
              isPreviewMode={isPreviewMode}
              mode={mode}
              theme={theme}
              viewPort={viewPort}
              questions={questions}
              taskGraph={taskGraph}
              resourceIds={resourceIds}
              initialAnswers={initialAnswers}
              initialPipeline={initialPipeline}
              showFooter={showFooter}
              hideQuestionIndex={hideQuestionIndex}
              onSuccess={handleOnSuccess}
              state={transformedState}
              variables={variables}
              onEvent={onEvent}
              hideBrandingButton={hideBrandingButton}
              onRestart={restartHandler}
              showEndingScreen={showEndingScreen}
              afterSubmitRedirectUrl={afterSubmitRedirectUrl}
              submissionState={submissionState}
              onSubmissionStateChange={onSubmissionStateChange}
            />
          </SuspenseComponent>
        ) : null}
        {mode === Mode.CLASSIC ? (
          <SuspenseComponent>
            {/* <></> */}
            <QuestionFillerClassic
              key={key}
              ref={ref}
              isPreviewMode={isPreviewMode}
              mode={mode}
              theme={theme}
              viewPort={viewPort}
              questions={questions}
              taskGraph={taskGraph}
              variables={variables}
              resourceIds={resourceIds}
              initialAnswers={initialAnswers}
              showFooter={showFooter}
              hideQuestionIndex={hideQuestionIndex}
              annotation={annotation}
              onSuccess={handleOnSuccess}
              state={transformedState}
              onEvent={onEvent}
              onRestart={restartHandler}
              hideBrandingButton={hideBrandingButton}
              showEndingScreen={showEndingScreen}
              afterSubmitRedirectUrl={afterSubmitRedirectUrl}
              submissionState={submissionState}
              onSubmissionStateChange={onSubmissionStateChange}
            />
          </SuspenseComponent>
        ) : null}
      </div>
    );
  }
);
