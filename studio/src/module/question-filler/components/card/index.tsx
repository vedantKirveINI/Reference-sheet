import { useRef, forwardRef, useImperativeHandle, useState, useMemo, useCallback, useEffect } from "react";
import { Mode, QuestionType, SUBMISSION_STATES, ViewPort } from "@src/module/constants";
import { QuestionRenderer } from "@oute/oute-ds.skeleton.question-v2";
import { getQuestionContainerStyles } from "../../styles";
import "@src/module/constants/shared/shared.css";
import { useCardRunner } from "../../hooks/cardRunner.hook";
import Footer from "../card-footer";
import { sanitizedAnswers } from "../../utils/helpers";
import { motion } from "framer-motion";
import { QuestionNavigationDirection } from "../../constant/questionNavigationDirection";
import { ProgressBar } from "../progress-bar";
import { DEFAULT_END_NODE_VALUE } from "../../constant/default-end-node";
import { getTransitionConfig } from "../../animation/card.transition";
import EndingScreen from "../ending-screen";
import useEnterKeyPress from "../../hooks/useEnterKeyPress";
import InitialPipelineLoader from "../initial-pipeline-loader";
import RuntimeErrorScreen from "../runtime-error-screen";
import { isEmpty } from "lodash";
import RedirectScreen from "../redirect-screen";
import { type SubmissionState } from "@src/module/constants";

export type QuestionFillerCardProps = {
  theme?: any;
  viewPort?: any;
  questions?: any;
  taskGraph?: any;
  fillerRef?: any;
  resourceIds?: Record<string, any>;
  initialAnswers?: any;
  initialPipeline?: any;
  showFooter?: boolean;
  hideQuestionIndex?: any;
  onSuccess: (answers: any) => Promise<void>;
  state?: any;
  variables?: any;
  onNodeChange?: any;
  onEvent?: any;
  onAnalyticsEvent?: (...args: any) => void;
  mode?: any;
  isPreviewMode?: boolean;
  onRestart?: () => void;
  hideBrandingButton?: boolean;
  showEndingScreen?: boolean;
  afterSubmitRedirectUrl?: string;
  submissionState: SubmissionState;
  onSubmissionStateChange?: (state: SubmissionState) => void;
};

export const QuestionFillerCard = forwardRef(
  (props: QuestionFillerCardProps, ref: any): any => {
    const {
      theme = {},
      viewPort,
      questions,
      taskGraph = [],
      resourceIds = {},
      showFooter = true,
      initialAnswers,
      initialPipeline,
      hideQuestionIndex,
      onSuccess,
      state,
      variables,
      onNodeChange,
      isPreviewMode,
      onEvent = () => { },
      onAnalyticsEvent = () => { },
      onRestart = () => { },
      mode,
      hideBrandingButton,
      showEndingScreen = true,
      afterSubmitRedirectUrl,
      submissionState,
      onSubmissionStateChange,
    } = props;
    const [questionNavigationDirection, setQuestionNavigationDirection] =
      useState(QuestionNavigationDirection.DOWN);
    const [isSubmittedLocally, setIsSubmittedLocally] = useState(false);

    const questionRef = useRef(null);

    const {
      answers,
      allNodes,
      pipeline,
      isLoading,
      setAnswers,
      executeQuestionNode,
      goPreviousQuestion,
      error,
      setError,
      isInitializingPipeline,
      answeredIds,
      runtimeError,
      stripePaymentQuestionId,
      stripePaymentQuestionRef,
    } = useCardRunner({
      allNodes: questions || {},
      taskGraph,
      initialAnswers,
      initialPipeline,
      questionRef: questionRef,
      onSubmission: async (answers: any) => {
        await onSuccess(answers);
        // Mark as submitted locally if onSubmissionStateChange is not available
        if (!onSubmissionStateChange) {
          setIsSubmittedLocally(true);
        }
      },
      setQuestionNavigationDirection: setQuestionNavigationDirection,
      variables,
      onNodeChange: onNodeChange,
      onEvent,
      onAnalyticsEvent,
      executeNodeDependencies: {
        assetId: resourceIds?.assetId,
        _id: resourceIds?._id,
        canvasId: resourceIds?.canvasId,
        projectId: resourceIds?.projectId,
        workspaceId: resourceIds?.workspaceId,
        snapshotCanvasId: resourceIds?.snapshotCanvasId,
      },
      onSubmissionStateChange,
    });

    const nodeInPipeline = pipeline?.[pipeline?.length - 1];
    const pipelineIndex = nodeInPipeline?.index;
    const qId = nodeInPipeline?.qId;
    const isAnswered = answeredIds?.has(qId) || false;
    const isStripePaymentAvailable = !isEmpty(stripePaymentQuestionId);
    const isStripePaymentQuestion =
      isStripePaymentAvailable &&
      allNodes[qId]?.type === QuestionType.STRIPE_PAYMENT;

    // Reset submissionState to IDLE after successful question navigation
    // Watch pipeline changes to detect when navigation occurs
    const prevPipelineLengthRef = useRef(pipeline.length);
    useEffect(() => {
      if (!onSubmissionStateChange || pipeline.length === 0) {
        prevPipelineLengthRef.current = pipeline.length;
        return;
      }

      // Only reset if pipeline actually changed (navigation occurred)
      const pipelineChanged = pipeline.length !== prevPipelineLengthRef.current;
      prevPipelineLengthRef.current = pipeline.length;

      if (!pipelineChanged) return;

      const currentQId = pipeline[pipeline.length - 1]?.qId;
      const currentNode = allNodes[currentQId];
      const nextNodeId = currentNode?.next_node_ids?.[0];
      const isLastQuestion = !nextNodeId || allNodes[nextNodeId]?.type === QuestionType.ENDING;

      // Reset to IDLE if: pipeline changed (navigation occurred), not last question, and not SUBMITTED
      // This ensures submissionState is reset after successful navigation between questions
      if (!isLastQuestion && SUBMISSION_STATES[submissionState] !== SUBMISSION_STATES.SUBMITTED) {
        onSubmissionStateChange("IDLE");
      }
    }, [pipeline, allNodes, submissionState, onSubmissionStateChange]);

    // Also reset to IDLE on initial mount if not already IDLE and not SUBMITTED
    useEffect(() => {
      if (onSubmissionStateChange &&
        SUBMISSION_STATES[submissionState] !== SUBMISSION_STATES.IDLE &&
        SUBMISSION_STATES[submissionState] !== SUBMISSION_STATES.SUBMITTED &&
        pipeline.length > 0) {
        const currentQId = pipeline[pipeline.length - 1]?.qId;
        const currentNode = allNodes[currentQId];
        const nextNodeId = currentNode?.next_node_ids?.[0];
        const isLastQuestion = !nextNodeId || allNodes[nextNodeId]?.type === QuestionType.ENDING;

        if (!isLastQuestion) {
          onSubmissionStateChange("IDLE");
        }
      }
    }, []); // Only run on mount

    // Wrap executeQuestionNode (no changes needed, useEffect handles state reset)
    const wrappedExecuteQuestionNode = executeQuestionNode;

    // Memoize the Enter key handler to prevent unnecessary re-renders
    // submissionState is the key "IDLE", SUBMISSION_STATES.IDLE is the value "idle"
    // Convert key to value for comparison: SUBMISSION_STATES[submissionState] === SUBMISSION_STATES.IDLE
    // Allow Enter key when not in blocking states (SUBMITTING, RETRYING) and not loading
    const handleEnterPress = useCallback(async () => {
      const isBlockingState = SUBMISSION_STATES[submissionState] === SUBMISSION_STATES.SUBMITTING ||
        SUBMISSION_STATES[submissionState] === SUBMISSION_STATES.RETRYING;
      const isSubmitted = SUBMISSION_STATES[submissionState] === SUBMISSION_STATES.SUBMITTED;
      const canProceed = !isBlockingState && !isSubmitted && !isLoading;

      if (canProceed) {
        await wrappedExecuteQuestionNode({ ref: questionRef });
      }
    }, [submissionState, isLoading, wrappedExecuteQuestionNode, pipeline]);

    useEnterKeyPress({
      onEnterPress: handleEnterPress,
      debounceMs: 300,
    });

    useImperativeHandle(
      ref,
      () => ({
        restart: onRestart,
        getData: () =>
          sanitizedAnswers({ answers: answers, pipeline: pipeline }),
      }),
      [answers, onRestart]
    );

    const transitionConfig = useMemo(
      () => getTransitionConfig(questionNavigationDirection),
      [questionNavigationDirection]
    );

    if (runtimeError) {
      return (
        <RuntimeErrorScreen
          theme={theme}
          errorType={runtimeError.errorType}
          errorMessage={runtimeError.errorMessage}
          technicalDetails={runtimeError.technicalDetails}
          onRestart={onRestart}
        />
      );
    }

    // Show ending screen if submissionState is SUBMITTED OR if we've submitted locally (fallback)
    const isSubmitted = SUBMISSION_STATES[submissionState] === SUBMISSION_STATES.SUBMITTED || isSubmittedLocally;
    if (isSubmitted && showEndingScreen) {
      if (afterSubmitRedirectUrl) {
        return (
          <RedirectScreen theme={theme} redirectUrl={afterSubmitRedirectUrl} />
        );
      }

      const node = allNodes[qId];
      let config = structuredClone(node?.config);
      if (node?.type !== QuestionType.ENDING) {
        config = structuredClone(DEFAULT_END_NODE_VALUE.config);
        if (hideBrandingButton) {
          config.settings.brandText = "";
        }
      }
      return (
        <EndingScreen
          key={`Ending-screen-question-${node?.config?.id}`}
          answers={answers}
          theme={theme}
          onRestart={onRestart}
          isPreviewMode={isPreviewMode}
          viewport={viewPort}
          autoFocus={false}
          error={answers[pipeline[pipeline?.length - 1]?.qId]?.error}
          question={config}
          onSubmit={async () => { }}
          questionRef={questionRef}
        />
      );
    }
    // Because we want to rerender whole component when use restarts it. If we dont set it null then default values do not set as useEffects dont fire in that case
    if (isInitializingPipeline || pipeline.length === 0)
      return <InitialPipelineLoader theme={theme} />;

    return (
      <>
        <ProgressBar
          bgcolor={theme?.styles?.buttons}
          allNodes={allNodes}
          pipeline={pipeline}
          answers={answers}
          qId={qId}
        />
        {isStripePaymentAvailable && (
          <motion.div
            key="stripe-payment-question"
            style={{
              ...(getQuestionContainerStyles()),
              overflowY: viewPort === ViewPort.DESKTOP ? "unset" : "scroll",
              display: isStripePaymentQuestion ? "block" : "none",
              visibility: isStripePaymentQuestion ? "visible" : "hidden",
              opacity: isStripePaymentQuestion ? 1 : 0,
              pointerEvents: isStripePaymentQuestion ? "auto" : "none",
            }}
            variants={transitionConfig}
            initial="hidden"
            animate="show"
            exit="remove"
          >
            <QuestionRenderer
              handlers={{
                onChange: (_value: any, options) => {
                  if (options?.clearError) {
                    setError(null);
                    return;
                  }
                  const shouldDestructure =
                    allNodes[qId]?.type === QuestionType.MULTI_QUESTION_PAGE;
                  answeredIds.add(qId);

                  setError(null);

                  setAnswers((prevAnswer) => {
                    const newValue = shouldDestructure
                      ? {
                        ...(prevAnswer[qId]?.response || {}),
                        ...(_value || {}),
                      }
                      : _value;
                    const updatedAnswer = {
                      ...prevAnswer,
                      [qId]: {
                        response: newValue,
                      },
                    };

                    if (options?.executeNode) {
                      setTimeout(() => {
                        executeQuestionNode({
                          ref: questionRef,
                          userAnswers: updatedAnswer,
                        });
                      }, 500);
                    }

                    return updatedAnswer;
                  });
                },
                onSubmit: () => {
                  executeQuestionNode({
                    ref: questionRef,
                  });
                },
                onMount: () => {
                  if (allNodes[qId]?.type === QuestionType.LOADING) {
                    executeQuestionNode({
                      ref: questionRef,
                    });
                  }
                },
                onRestart: onRestart,
              }}
              uiConfig={{
                viewPort,
                theme,
                mode: Mode.CARD,
              }}
              stateConfig={{
                isCreator: false,
                answers: answers,
                isAnswered: isAnswered,
                isPreviewMode: isPreviewMode,
                isRetrying: SUBMISSION_STATES[submissionState] === SUBMISSION_STATES.RETRYING,
              }}
              nodeConfig={{
                state: state,
                node: allNodes[stripePaymentQuestionId],
              }}
              questionData={allNodes[stripePaymentQuestionId]?.config}
              loading={isLoading}
              ref={stripePaymentQuestionRef}
              value={answers[stripePaymentQuestionId]}
              error={error}
              autoFocus
              questionIndex={pipelineIndex ? String(pipelineIndex) : null}
            />
          </motion.div>
        )}
        {!isStripePaymentQuestion && (
          <motion.div
            key={`${allNodes[qId]?.config?.question}+${qId}`}
            style={{
              ...(getQuestionContainerStyles()),
              overflowY: viewPort === ViewPort.DESKTOP ? "unset" : "scroll",
            }}
            variants={transitionConfig}
            initial="hidden"
            animate="show"
            exit="remove"
          >
            <QuestionRenderer
              handlers={{
                onChange: (_value: any, options) => {
                  if (options?.clearError) {
                    setError(null);
                    return;
                  }
                  const shouldDestructure =
                    allNodes[qId]?.type === QuestionType.MULTI_QUESTION_PAGE;
                  answeredIds.add(qId);

                  setError(null);

                  setAnswers((prevAnswer) => {
                    const newValue = shouldDestructure
                      ? {
                        ...(prevAnswer[qId]?.response || {}),
                        ...(_value || {}),
                      }
                      : _value;
                    const updatedAnswer = {
                      ...prevAnswer,
                      [qId]: {
                        response: newValue,
                      },
                    };

                    if (options?.executeNode) {
                      setTimeout(() => {
                        executeQuestionNode({
                          ref: questionRef,
                          userAnswers: updatedAnswer,
                        });
                      }, 500);
                    }

                    return updatedAnswer;
                  });
                },
                onSubmit: () => {
                  executeQuestionNode({
                    ref: questionRef,
                  });
                },
                onMount: () => {
                  if (allNodes[qId]?.type === QuestionType.LOADING) {
                    executeQuestionNode({
                      ref: questionRef,
                    });
                  }
                },
                onRestart: onRestart,
              }}
              uiConfig={{
                viewPort,
                theme,
                mode: Mode.CARD,
              }}
              stateConfig={{
                isCreator: false,
                answers: answers,
                isAnswered: isAnswered,
                isPreviewMode: isPreviewMode,
                isRetrying: SUBMISSION_STATES[submissionState] === SUBMISSION_STATES.RETRYING,
              }}
              nodeConfig={{
                state: state,
                node: allNodes[qId],
              }}
              questionData={
                allNodes[qId]?.type === QuestionType.LOADING
                  ? allNodes[qId]
                  : allNodes[qId]?.config
              }
              loading={
                isLoading ||
                SUBMISSION_STATES[submissionState] === SUBMISSION_STATES.SUBMITTING ||
                SUBMISSION_STATES[submissionState] === SUBMISSION_STATES.RETRYING
              }
              ref={questionRef}
              value={answers[qId]}
              error={error}
              autoFocus
              questionIndex={pipelineIndex ? String(pipelineIndex) : null}
            />
          </motion.div>
        )}
        {showFooter && (
          <Footer
            goNextQuestion={() => {
              const isBlockingState = SUBMISSION_STATES[submissionState] === SUBMISSION_STATES.SUBMITTING ||
                SUBMISSION_STATES[submissionState] === SUBMISSION_STATES.RETRYING;
              const isSubmitted = SUBMISSION_STATES[submissionState] === SUBMISSION_STATES.SUBMITTED;
              const canProceed = !isBlockingState && !isSubmitted;

              if (canProceed) {
                wrappedExecuteQuestionNode({
                  ref: questionRef,
                });
              }
            }}
            hideBrandingButton={hideBrandingButton}
            viewPort={viewPort}
            goPreviousQuestion={() => {
              if (SUBMISSION_STATES[submissionState] === SUBMISSION_STATES.IDLE) {
                setQuestionNavigationDirection(QuestionNavigationDirection.UP);
                goPreviousQuestion();
              }
            }}
            theme={theme}
            isFirstNode={pipeline.length === 1}
            isLastNode={allNodes[qId]?.node_marker === "END"}
            mode={mode}
            loading={
              isLoading ||
              SUBMISSION_STATES[submissionState] === SUBMISSION_STATES.SUBMITTING ||
              SUBMISSION_STATES[submissionState] === SUBMISSION_STATES.RETRYING
            }
          />
        )}
      </>
    );
  }
);
