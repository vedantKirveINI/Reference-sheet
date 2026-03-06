import { useRef, forwardRef, useImperativeHandle, useCallback, useState, useEffect, useMemo, } from "react";
import { Mode, QuestionType, SUBMISSION_STATES, SubmissionState, ViewPort } from "@src/module/constants";
import { getQuestionsWrapperStyles } from "../../styles";
import "@src/module/constants/shared/shared.css";
import Footer from "../classic-footer";
import { useClassicRunner } from "../../hooks/classicRunner.hook";
import EndingScreen from "../ending-screen";
import { motion } from "framer-motion";
import { getTransitionConfig } from "../../animation/classic.transition";
import { DEFAULT_END_NODE_VALUE } from "../../constant/default-end-node";
import { CONTROL_FLOW_NODES } from "../../constant/nodesTypes";
import InitialPipelineLoader from "../initial-pipeline-loader";
import ThreeDotsWave from "../three-dot-wave";
import { QuestionRenderer } from "@oute/oute-ds.skeleton.question-v2";
import RuntimeErrorScreen from "../runtime-error-screen";
import { useClassicStripeView } from "../../hooks/useClassicStripeView";
import RedirectScreen from "../redirect-screen";

export type QuestionFillerClassicProps = {
  theme?: any;
  viewPort?: any;
  questions?: any;
  taskGraph?: any;
  ref?: any;
  variables?: any;
  resourceIds?: Record<string, any>;
  initialAnswers?: any;
  showFooter?: boolean;
  hideQuestionIndex?: any;
  annotation?: any;
  onSuccess: (answers: any) => Promise<void>;
  state?: any;
  onEvent?: any;
  mode?: any;
  isPreviewMode?: boolean;
  onRestart?: () => void;
  hideBrandingButton?: boolean;
  showEndingScreen?: boolean;
  afterSubmitRedirectUrl?: string;
  submissionState: SubmissionState;
  onSubmissionStateChange?: (state: SubmissionState) => void;
};

export const QuestionFillerClassic = forwardRef(
  (props: QuestionFillerClassicProps, ref: any): any => {
    const {
      theme = {},
      viewPort,
      questions: allNodes,
      taskGraph = [],
      resourceIds = {},
      showFooter = true,
      initialAnswers,
      hideQuestionIndex,
      annotation,
      onSuccess,
      state,
      variables,
      mode,
      onEvent = () => null,
      isPreviewMode,
      onRestart = () => { },
      hideBrandingButton = false,
      showEndingScreen = true,
      afterSubmitRedirectUrl,
      submissionState,
      onSubmissionStateChange,
    } = props;

    const questionRefs = useRef<Record<string, any>>({});
    const parentRef = useRef(null);
    const [scrollProgress, setScrollProgress] = useState(0);
    const [isSubmittedLocally, setIsSubmittedLocally] = useState(false);
    const [localSubmissionState, setLocalSubmissionState] = useState<SubmissionState>(submissionState);

    // Sync local state with prop state when onSubmissionStateChange is available
    useEffect(() => {
      if (onSubmissionStateChange) {
        setLocalSubmissionState(submissionState);
      }
    }, [submissionState, onSubmissionStateChange]);

    const {
      answers,
      pipeline,
      onAnswerChange,
      isLoading,
      initializingPipeline,
      isPipelineFilling,
      onNextStep,
      answeredIds,
      runtimeError,
      stripePaymentQuestionId,
      stripePaymentQuestionRef,
    } = useClassicRunner({
      allNodes: allNodes || {},
      taskGraph,
      initialAnswers,
      onSubmission: async (answers: any) => {
        await onSuccess(answers);
        // Mark as submitted locally if onSubmissionStateChange is not available
        if (!onSubmissionStateChange) {
          setIsSubmittedLocally(true);
        }
      },
      onSubmissionStateChange: onSubmissionStateChange,
      variables,
      onEvent,
      getNodeRef: (nodeId) => {
        return questionRefs.current[nodeId];
      },
      triggerIfAllNodesValid: () => {
        setTimeout(() => {
          if (parentRef.current)
            parentRef.current.scrollTop = parentRef.current.scrollHeight;
        }, 500);
      },
      executeNodeDependencies: {
        assetId: resourceIds?.assetId,
        _id: resourceIds?._id,
        canvasId: resourceIds?.canvasId,
        projectId: resourceIds?.projectId,
        workspaceId: resourceIds?.workspaceId,
        snapshotCanvasId: resourceIds?.snapshotCanvasId,
      },
    });

    // Reset submissionState to IDLE after successful question navigation
    // Watch pipeline changes to detect when navigation occurs
    const prevPipelineLengthRef = useRef(pipeline.length);
    useEffect(() => {
      if (pipeline.length === 0) {
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
      if (!isLastQuestion) {
        const currentState = onSubmissionStateChange ? submissionState : localSubmissionState;
        if (SUBMISSION_STATES[currentState] !== SUBMISSION_STATES.SUBMITTED) {
          if (onSubmissionStateChange) {
            onSubmissionStateChange("IDLE");
          } else {
            setLocalSubmissionState("IDLE");
          }
        }
      }
    }, [pipeline, allNodes, submissionState, onSubmissionStateChange, localSubmissionState]);

    // Also reset to IDLE on initial mount if not already IDLE and not SUBMITTED
    useEffect(() => {
      if (pipeline.length > 0) {
        const currentQId = pipeline[pipeline.length - 1]?.qId;
        const currentNode = allNodes[currentQId];
        const nextNodeId = currentNode?.next_node_ids?.[0];
        const isLastQuestion = !nextNodeId || allNodes[nextNodeId]?.type === QuestionType.ENDING;

        if (!isLastQuestion) {
          const currentState = onSubmissionStateChange ? submissionState : localSubmissionState;
          if (SUBMISSION_STATES[currentState] !== SUBMISSION_STATES.IDLE &&
            SUBMISSION_STATES[currentState] !== SUBMISSION_STATES.SUBMITTED) {
            if (onSubmissionStateChange) {
              onSubmissionStateChange("IDLE");
            } else {
              setLocalSubmissionState("IDLE");
            }
          }
        }
      }
    }, []); // Only run on mount

    const shouldShowStripe = useMemo(() => {
      if (!stripePaymentQuestionId) return false;
      return pipeline.some((q) => q?.qId === stripePaymentQuestionId);
    }, [stripePaymentQuestionId, pipeline]);

    const { stripeComponentRef, stripePlaceholderRef, stripeQuestionIndex } =
      useClassicStripeView({
        stripePaymentQuestionId,
        pipeline: pipeline,
        shouldShowStripe,
        parentRef,
        viewPort,
      });

    const setQuestionRefs = useCallback((nodeId, ref) => {
      questionRefs.current = {
        ...questionRefs.current,
        [nodeId]: ref || null,
      };
    }, []);

    useImperativeHandle(
      ref,
      () => ({
        restart: onRestart,
        getData: () => answers,
        onSubmit: async () => {
          await onNextStep();
        },
        pipeline,
      }),
      [answers, onNextStep, pipeline, onRestart]
    );

    const handleOnChange = (nodeId, _value) => {
      onAnswerChange(nodeId, {
        response: _value,
        error: "",
      });
    };

    // Track scroll progress for progress bar
    useEffect(() => {
      const scrollContainer = parentRef.current;
      if (!scrollContainer) return;

      const handleScroll = () => {
        const { scrollTop, scrollHeight, clientHeight } = scrollContainer;
        const totalScrollable = scrollHeight - clientHeight;

        if (totalScrollable <= 0) {
          setScrollProgress(100); // If no scroll, consider it complete
          return;
        }

        const progress = (scrollTop / totalScrollable) * 100;
        setScrollProgress(Math.min(100, Math.max(0, progress)));
      };

      // Initial calculation
      handleScroll();

      scrollContainer.addEventListener("scroll", handleScroll);

      // Also listen for resize to recalculate when content changes
      const resizeObserver = new ResizeObserver(() => {
        handleScroll();
      });
      resizeObserver.observe(scrollContainer);

      return () => {
        scrollContainer.removeEventListener("scroll", handleScroll);
        resizeObserver.disconnect();
      };
    }, [pipeline?.length]); // Re-run when questions change

    if (runtimeError)
      return (
        <RuntimeErrorScreen
          theme={theme}
          errorType={runtimeError.errorType}
          errorMessage={runtimeError.errorMessage}
          technicalDetails={runtimeError.technicalDetails}
          onRestart={onRestart}
        />
      );

    const isSubmitted = SUBMISSION_STATES[submissionState] === SUBMISSION_STATES.SUBMITTED || isSubmittedLocally;
    if (isSubmitted && showEndingScreen) {
      if (afterSubmitRedirectUrl) {
        return (
          <RedirectScreen theme={theme} redirectUrl={afterSubmitRedirectUrl} />
        );
      }

      const question = allNodes?.[pipeline?.[pipeline?.length - 1]?.qId];
      let config = structuredClone(question?.config);
      if (question?.type !== QuestionType.ENDING) {
        config = structuredClone(DEFAULT_END_NODE_VALUE.config);
        if (hideBrandingButton) {
          config.settings.brandText = "";
        }
      }
      return (
        <EndingScreen
          key={`Ending-screen-question-${config?.id}`}
          answers={answers}
          theme={theme}
          viewport={viewPort}
          autoFocus={false}
          error={answers?.[pipeline?.[pipeline?.length - 1]?.qId]?.error || ""}
          question={config}
          onSubmit={async () => null}
          questionRef={null}
          isPreviewMode={isPreviewMode}
          onRestart={onRestart}
        />
      );
    }

    if (initializingPipeline && pipeline.length == 0)
      return <InitialPipelineLoader theme={theme} />;

    // Progress bar is based on scroll position in classic mode
    const progressPercentage = scrollProgress;

    return (
      <>
        {pipeline.length > 0 && (
          <div>
            <div
              style={{
                height: "4px",
                width: "100%",
                backgroundColor: "rgba(0, 0, 0, 0.1)",
                borderRadius: "9999px",
                position: "relative",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  height: "100%",
                  width: `${progressPercentage}%`,
                  backgroundColor: theme?.styles?.buttons || "#0D0D0D",
                  borderRadius: "9999px",
                  transition: "width 0.5s ease-in-out",
                }}
              />
            </div>
          </div>
        )}
        <div
          style={{
            ...(getQuestionsWrapperStyles({
              mode: Mode.CLASSIC,
              viewPort,
            })), position: "relative"
          }}
          ref={parentRef}
          id="scroll"
          data-testid={`question-classic`}
        >
          {pipeline?.map?.((node, pipelineIndex) => {
            if (CONTROL_FLOW_NODES.includes(allNodes[node.qId]?.type))
              return null;
            const pipeLineValue = node;
            const isAnswered = answeredIds.has(node.qId);
            // Key includes preceding nodes' answers so question remounts when DB/action node response arrives and FX can re-resolve
            const precedingAnswersKey = pipeline
              ?.slice(0, pipelineIndex)
              .map((p) => (answers[p.qId] != null ? "1" : "0"))
              .join("") ?? "";

            // Return placeholder for Stripe payment question
            if (allNodes[node.qId]?.type === QuestionType.STRIPE_PAYMENT) {
              return (
                <div
                  key={`stripe-placeholder-${node.qId}`}
                  ref={stripePlaceholderRef}
                  style={{
                    width: "100%",
                    transition: "height 0.2s ease-in-out",
                    display: "block",
                  }}
                />
              );
            }

            return (
              <motion.div
                key={`classic-question-wrapper-${node.qId}`}
                initial={getTransitionConfig.hidden}
                animate={getTransitionConfig.show(pipeLineValue.index)}
                exit={getTransitionConfig.remove(pipeLineValue.index)}
              >
                <QuestionRenderer
                  key={`classic-question-${node.qId}-${precedingAnswersKey}`}
                  id={node.qId}
                  nodeConfig={{
                    node: allNodes[node.qId],
                    state: state,
                  }}
                  stateConfig={{
                    isCreator: false,
                    isPreviewMode: isPreviewMode,
                    answers: answers,
                    annotation: annotation,
                    hideQuestionIndex: hideQuestionIndex,
                    isAnswered: isAnswered,
                  }}
                  uiConfig={{
                    mode: Mode.CLASSIC,
                    viewPort,
                    theme,
                  }}
                  handlers={{
                    onChange: (_value) => {
                      handleOnChange(node.qId, _value);
                      answeredIds.add(node.qId);
                    },
                    onRestart: onRestart,
                  }}
                  ref={(ref) => setQuestionRefs(node.qId, ref)}
                  questionIndex={String(pipeLineValue.index)}
                  questionData={allNodes[node.qId]?.config}
                  value={answers[node.qId]}
                  error={answers[node.qId]?.error}
                  variables={variables}
                />
              </motion.div>
            );
          })}

          {/* Render Stripe payment question outside map */}
          {stripePaymentQuestionId && (
            <motion.div
              id="stripe-payment-question-outside"
              ref={stripeComponentRef}
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                zIndex: 10,
                display: shouldShowStripe ? "block" : "none",
              }}
              initial={getTransitionConfig.hidden}
              animate={
                shouldShowStripe
                  ? getTransitionConfig.show(stripeQuestionIndex)
                  : getTransitionConfig.hidden
              }
              exit={getTransitionConfig.remove(stripeQuestionIndex)}
            >
              <QuestionRenderer
                key={`classic-stripe-question-${stripePaymentQuestionId}`}
                id={stripePaymentQuestionId}
                nodeConfig={{
                  node: allNodes[stripePaymentQuestionId],
                  state: state,
                }}
                stateConfig={{
                  isCreator: false,
                  isPreviewMode: isPreviewMode,
                  answers: answers,
                  annotation: annotation,
                  hideQuestionIndex: hideQuestionIndex,
                  isAnswered: answeredIds.has(stripePaymentQuestionId),
                }}
                uiConfig={{
                  mode: Mode.CLASSIC,
                  viewPort,
                  theme,
                }}
                handlers={{
                  onChange: (_value) => {
                    handleOnChange(stripePaymentQuestionId, _value);
                    answeredIds.add(stripePaymentQuestionId);
                  },
                  onRestart: onRestart,
                }}
                ref={(ref) => {
                  setQuestionRefs(stripePaymentQuestionId, ref);
                  stripePaymentQuestionRef.current = ref as any;
                }}
                questionIndex={String(stripeQuestionIndex)}
                questionData={allNodes[stripePaymentQuestionId]?.config}
                value={answers[stripePaymentQuestionId]}
                error={answers[stripePaymentQuestionId]?.error}
                variables={variables}
                autoFocus={stripeQuestionIndex === pipeline.length - 1}
              />
            </motion.div>
          )}
          {isPipelineFilling && pipeline.length > 0 && <ThreeDotsWave />}
        </div>
        {showFooter && pipeline?.length && (
          <Footer
            isLastNode={pipeline?.length === 1}
            viewPort={viewPort}
            mode={mode}
            isLoading={
              isLoading ||
              SUBMISSION_STATES[submissionState] === SUBMISSION_STATES.SUBMITTING ||
              SUBMISSION_STATES[submissionState] === SUBMISSION_STATES.RETRYING
            }
            theme={theme}
            goNextQuestion={async () => {
              const effectiveState = onSubmissionStateChange ? submissionState : localSubmissionState;
              const isBlockingState = SUBMISSION_STATES[effectiveState] === SUBMISSION_STATES.SUBMITTING ||
                SUBMISSION_STATES[effectiveState] === SUBMISSION_STATES.RETRYING;
              const isSubmitted = SUBMISSION_STATES[effectiveState] === SUBMISSION_STATES.SUBMITTED || isSubmittedLocally;
              const canProceed = !isBlockingState && !isSubmitted;

              if (canProceed) {
                onNextStep();
              }
            }}
            hideBrandingButton={hideBrandingButton}
            submissionState={submissionState}
          />
        )}
      </>
    );
  }
);
