import { useRef, forwardRef, useImperativeHandle, useEffect, useState, useMemo, } from "react";
import { Mode, QuestionType, SUBMISSION_STATES, SubmissionState } from "@src/module/constants";
import { QuestionRenderer } from "@oute/oute-ds.skeleton.question-v2";
import { getQuestionsWrapperStyles } from "../../styles";
import "@src/module/constants/shared/shared.css";
import { sanitizedAnswers } from "../../utils/helpers";
import _ from "lodash";
import useChatRunner from "../../hooks/chatRunner.hook";
import Footer from "../chat-footer";
import { motion } from "framer-motion";
import { CONTROL_FLOW_NODES } from "../../constant/nodesTypes";
import EndingScreen from "../ending-screen";
import { ProgressBar } from "../progress-bar";
import { getTransitionConfig } from "../../animation/chat.transition";
import { DEFAULT_END_NODE_VALUE } from "../../constant/default-end-node";
import InitialPipelineLoader from "../initial-pipeline-loader";
import RuntimeErrorScreen from "../runtime-error-screen";
import { useClassicStripeView } from "../../hooks/useClassicStripeView";
import RedirectScreen from "../redirect-screen";

export type QuestionFillerChatProps = {
  theme?: any;
  viewPort?: any;
  questions?: any;
  taskGraph?: any;
  ref?: any;
  resourceIds?: Record<string, any>;
  initialAnswers?: any;
  initialPipeline?: any;
  showFooter?: boolean;
  hideQuestionIndex?: any;
  onSuccess: (answers: any) => Promise<void>;
  state?: any;
  variables?: any;
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

export const QuestionFillerChat = forwardRef(
  (props: QuestionFillerChatProps, ref: any): any => {
    const {
      theme = {},
      viewPort,
      questions,
      taskGraph = [],
      resourceIds = {},
      showFooter = true,
      initialAnswers,
      initialPipeline,
      onSuccess,
      state,
      variables,
      mode,
      isPreviewMode,
      onEvent = () => { },
      onRestart = () => { },
      hideBrandingButton,
      showEndingScreen = true,
      afterSubmitRedirectUrl,
      submissionState,
      onSubmissionStateChange,
    } = props;

    const [indexBeingEdited, setIndexBeingEdited] = useState(null);
    const [isSubmittedLocally, setIsSubmittedLocally] = useState(false);

    const {
      answers,
      allNodes,
      pipeline,
      setPipeline,
      setAnswers,
      isLoading,
      executeQuestionsNode,
      executedNodes,
      setExecutedNodes,
      initializingPipeline,
      error,
      setError,
      answeredIds,
      runtimeError,
      stripePaymentQuestionId,
      stripePaymentQuestionRef,
    } = useChatRunner({
      allNodes: questions || {},
      taskGraph,
      initialAnswers,
      initialPipeline,
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
      assetId: resourceIds?.assetId,
      executeNodeDependencies: {
        assetId: resourceIds?.assetId,
        _id: resourceIds?._id,
        canvasId: resourceIds?.canvasId,
        projectId: resourceIds?.projectId,
        workspaceId: resourceIds?.workspaceId,
        snapshotCanvasId: resourceIds?.snapshotCanvasId,
      },
    }) as any;

    const questionRef = useRef(null);
    const parentRef = useRef(null);

    // Check if Stripe question should be displayed
    const shouldShowStripe = useMemo(() => {
      if (!stripePaymentQuestionId || !pipeline) return false;
      const index = pipeline.findIndex(
        (q) => q?.qId === stripePaymentQuestionId
      );
      return index >= 0 && index < pipeline.length;
    }, [stripePaymentQuestionId, pipeline]);

    // Use custom hook for Stripe view management
    const { stripeComponentRef, stripePlaceholderRef, stripeQuestionIndex } =
      useClassicStripeView({
        stripePaymentQuestionId,
        pipeline,
        shouldShowStripe,
        parentRef,
        viewPort,
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

    const handleIndexBeingEdited = (index) => {
      if (!(pipeline.length - 1 === index)) {
        setPipeline((prevPipeline) => prevPipeline.slice(0, index + 1));
        setExecutedNodes((prev) => prev.slice(0, index + 1));
      }
      setIndexBeingEdited(index);
    };

    const onChange = (question, val) => {
      setError(null);
      // if not creator && !independentNodes?.includes(allNodes[nextNodeId]?.type) then remove eveything in pipeline after this node and remove all answers also after this node
      setAnswers({
        ...answers,
        [question?.qId]: {
          response: val,
        },
      });
    };

    const handleEnterKeyPress = (event) => {
      if (indexBeingEdited === null) return;
      if (event.key === "Enter") {
        event.preventDefault();
        executeQuestionsNode({
          ref: questionRef,
          indexBeingEdited: indexBeingEdited,
          nodeAnswers: { ...answers },
        });
        setTimeout(() => {
          // Check to handle the case of End Node As full screen doesn't have parentRef
          if (parentRef.current)
            parentRef.current.scrollTop = parentRef.current.scrollHeight;
        }, 100);
        setIndexBeingEdited(null);
      }
    };
    useEffect(() => {
      document.addEventListener("keypress", handleEnterKeyPress);
      return () => {
        document.removeEventListener("keypress", handleEnterKeyPress);
      };
    }, [pipeline, allNodes, answers]);

    const showAnswerInput = (index) => {
      if (indexBeingEdited === index) return true;

      if (pipeline?.length - 1 === index) return true;

      return false;
    };

    const transitionConfig = useMemo(() => getTransitionConfig, []);

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

    if (
      (initializingPipeline || !pipeline?.length) &&
      SUBMISSION_STATES[submissionState] === SUBMISSION_STATES.IDLE
    )
      return <InitialPipelineLoader theme={theme} />;

    const isSubmitted = SUBMISSION_STATES[submissionState] === SUBMISSION_STATES.SUBMITTED || isSubmittedLocally;
    if (isSubmitted && showEndingScreen) {
      if (afterSubmitRedirectUrl) {
        return (
          <RedirectScreen theme={theme} redirectUrl={afterSubmitRedirectUrl} />
        );
      }
      let question = allNodes[pipeline[pipeline?.length - 1]?.qId];
      let config = structuredClone(question?.config);
      if (question?.type !== QuestionType.ENDING) {
        config = structuredClone(DEFAULT_END_NODE_VALUE.config);
        if (hideBrandingButton) {
          config.settings.brandText = "";
        }
      }
      return (
        <EndingScreen
          key={`Ending-screen-question-${question?.config?.id}`}
          answers={answers}
          onRestart={onRestart}
          isPreviewMode={isPreviewMode}
          theme={theme}
          viewport={viewPort}
          autoFocus={false}
          error={answers[pipeline[pipeline?.length - 1]?.qId]?.error}
          question={config}
          onSubmit={async () => { }}
          questionRef={questionRef}
        />
      );
    }

    const nodeInPipeline = pipeline?.[pipeline?.length - 1];
    const qId = nodeInPipeline?.qId;
    const isAnswered = answeredIds?.has(qId) || false;

    return (
      <>
        <ProgressBar
          bgcolor={theme?.styles?.buttons}
          allNodes={allNodes}
          pipeline={pipeline}
          answers={answers}
          qId={qId}
        />
        <div
          style={{
            ...(getQuestionsWrapperStyles({
              mode: Mode.CHAT,
              viewPort,
            })), position: "relative"
          }}
          ref={parentRef}
          id="scroll"
          data-testid={`question-chat`}
        >
          {_.isArray(pipeline) &&
            pipeline?.map((question, index) => {
              if (CONTROL_FLOW_NODES.includes(allNodes[question?.qId]?.type))
                return null;

              const isStripePaymentQuestion =
                allNodes[question?.qId]?.type === QuestionType.STRIPE_PAYMENT;

              // Return placeholder for Stripe payment question
              if (isStripePaymentQuestion) {
                return (
                  <div
                    key={`stripe-payment-placeholder-${index}`}
                    ref={stripePlaceholderRef}
                    style={{
                      width: "100%",
                      display: "block",
                      boxSizing: "border-box",
                      flexShrink: 0,
                      flexGrow: 0,
                      transition: "height 0.2s ease-in-out",
                    }}
                  />
                );
              }

              return (
                <motion.div
                  key={`chat-questions-${index}`}
                  variants={transitionConfig}
                  initial="hidden"
                  animate="show"
                  exit="remove"
                  style={{ width: "100%" }}
                >
                  <QuestionRenderer
                    key={`chat-question-${index}`}
                    ref={questionRef}
                    handlers={{
                      onChange: (_value, options) => {
                        if (options?.clearError) {
                          setError(null);
                          return;
                        }
                        answeredIds.add(question?.qId);
                        onChange(question, _value);
                        if (options?.executeNode) {
                          setTimeout(() => {
                            executeQuestionsNode({
                              ref: questionRef,
                              indexBeingEdited: indexBeingEdited,
                              nodeAnswers: {
                                ...answers,
                                [question?.qId]: {
                                  response: _value,
                                },
                              },
                            });
                          }, 500);
                        }
                      },
                      onRestart: onRestart,
                    }}
                    uiConfig={{
                      mode: Mode.CHAT,
                      viewPort: viewPort,
                      theme: theme,
                      styles: {
                        cardModeStyles: {
                          height: "max-content",
                          overflowY: "unset",
                          paddingBottom: "0px",
                        },
                      },
                    }}
                    nodeConfig={{ node: allNodes[question?.qId], state: state }}
                    stateConfig={{
                      isCreator: false,
                      isAnswering: showAnswerInput(index),
                      setIsAnswering: () => {
                        handleIndexBeingEdited(index);
                      },
                      answers: answers,
                      isAnswered: isAnswered,
                      isPreviewMode: isPreviewMode,
                    }}
                    questionData={allNodes[question?.qId]?.config}
                    questionIndex={question?.index}
                    value={answers[question?.qId]}
                    error={error}
                    autoFocus={index === pipeline.length - 1}
                  />
                </motion.div>
              );
            })}

          {/* Stripe Payment Question - Rendered Outside Map (Always in DOM if available) */}
          {stripePaymentQuestionId && (
            <motion.div
              id="stripe-payment-question-outside"
              ref={stripeComponentRef}
              key={`stripe-payment-question-outside`}
              variants={transitionConfig}
              initial="hidden"
              animate={shouldShowStripe ? "show" : "hidden"}
              exit="remove"
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                pointerEvents: shouldShowStripe ? "auto" : "none",
                display: shouldShowStripe ? "block" : "none",
                visibility: shouldShowStripe ? "visible" : "hidden",
                opacity: shouldShowStripe ? 1 : 0,
              }}
            >
              <QuestionRenderer
                ref={stripePaymentQuestionRef}
                handlers={{
                  onChange: (_value, options) => {
                    if (options?.clearError) {
                      setError(null);
                      return;
                    }
                    const stripeQuestion = pipeline[stripeQuestionIndex - 1];
                    if (stripeQuestion) {
                      answeredIds.add(stripeQuestion?.qId);
                      onChange(stripeQuestion, _value);
                      if (options?.executeNode) {
                        setTimeout(() => {
                          executeQuestionsNode({
                            ref: stripePaymentQuestionRef,
                            indexBeingEdited: indexBeingEdited,
                            nodeAnswers: {
                              ...answers,
                              [stripeQuestion?.qId]: {
                                response: _value,
                              },
                            },
                          });
                        }, 500);
                      }
                    }
                  },
                  onRestart: onRestart,
                }}
                uiConfig={{
                  mode: Mode.CHAT,
                  viewPort: viewPort,
                  theme: theme,
                  styles: {
                    cardModeStyles: {
                      height: "max-content",
                      overflowY: "unset",
                      paddingBottom: "0px",
                    },
                  },
                }}
                nodeConfig={{
                  node: allNodes[stripePaymentQuestionId],
                  state: state,
                }}
                stateConfig={{
                  isCreator: false,
                  isAnswering: showAnswerInput(stripeQuestionIndex - 1),
                  setIsAnswering: () => {
                    handleIndexBeingEdited(stripeQuestionIndex - 1);
                  },
                  answers: answers,
                  isAnswered: isAnswered,
                  isPreviewMode: isPreviewMode,
                }}
                questionData={allNodes[stripePaymentQuestionId]?.config}
                questionIndex={String(stripeQuestionIndex)}
                value={answers[stripePaymentQuestionId]}
                error={error}
              />
            </motion.div>
          )}
        </div>
        {showFooter && (
          <Footer
            mode={mode}
            viewPort={viewPort}
            isLoading={
              isLoading ||
              SUBMISSION_STATES[submissionState] === SUBMISSION_STATES.SUBMITTING ||
              SUBMISSION_STATES[submissionState] === SUBMISSION_STATES.RETRYING
            }
            hideBrandingButton={hideBrandingButton}
            theme={theme}
            submissionState={submissionState}
            goNextQuestion={() => {
              executeQuestionsNode({
                ref: questionRef,
                indexBeingEdited: indexBeingEdited,
                nodeAnswers: {
                  ...answers,
                },
              });
              setTimeout(() => {
                if (
                  parentRef.current &&
                  SUBMISSION_STATES[submissionState] === SUBMISSION_STATES.IDLE
                )
                  parentRef.current.scrollTop = parentRef.current.scrollHeight;
              }, 500);
              setIndexBeingEdited(null);
            }}
            error={error}
            isInEditMode={
              indexBeingEdited !== undefined && indexBeingEdited !== null
            }
          />
        )}
      </>
    );
  }
);
