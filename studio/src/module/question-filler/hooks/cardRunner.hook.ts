import {
  useState,
  useEffect,
  Dispatch,
  SetStateAction,
  useRef,
  useMemo,
} from "react";
import { TAnswers, TPipeLine, TNode } from "../types";
import {
  getQuestionIndex,
  isControlFlowNode,
  isContentNode,
  sanitizedAnswers,
} from "../utils/helpers";
import { questionsValidation } from "../validation/questions-validation";
import { handlePreHooks } from "../pre-hooks";
import { QuestionType, type SubmissionState } from "@src/module/constants";
import { toast } from "sonner";
import {
  executeTransformedNode,
  getNodeTypeToExecuteTransformedNode,
} from "../utils/executeTransformedNode";
import { QuestionNavigationDirection } from "../constant/questionNavigationDirection";
import { QUESTION_NODES } from "../constant/nodesTypes";
import {
  UATU_FORM_FILLER,
  UATU_PREDICATE_EVENTS,
} from "@oute/oute-ds.common.core.utils";
import { getStartNode } from "../utils/get-start-node";
import { MAX_JUMP_TO_NODE_ITERATIONS } from "../constant/node-marker";
import { TRuntimeError } from "../components/runtime-error-screen/types";
import { isEmpty } from "lodash";
import { resolveFXContent } from "../utils/resolve-fx-content";
import { VALIDATION_MESSAGE } from "../constant/validationMessages";

type TODO = any;

interface IUseCardRunner {
  allNodes: TNode;
  taskGraph: TODO;
  initialAnswers: TAnswers;
  initialPipeline: any;
  onSubmission?: (answers: any) => Promise<void>;
  questionRef?: React.MutableRefObject<any>;
  setQuestionNavigationDirection: Dispatch<
    SetStateAction<QuestionNavigationDirection>
  >;
  variables: any;
  onNodeChange?: any;
  onEvent?: any;
  onAnalyticsEvent?: (...args: any) => void;
  executeNodeDependencies?: Record<string, string>;
  onSubmissionStateChange?: (state: SubmissionState) => void;
}

/**
 * Creates an initial pipeline for a given node ID.
 *
 * @param {string} nodeID - The ID of the node.
 * @return {TCardPipeLine[]} The initial pipeline.
 */
const createInitialPipeline = (nodeID: string): TPipeLine[] => [
  {
    qId: nodeID,
    index: 0,
  },
];

type ExecuteControlFlowNodeArgs = {
  nodeId: string;
  answersTemp?: TAnswers;
};

const initializePipeline = async (
  allNodes: TNode,
  nodeID: string,
  executeControlFlowNode: (args: ExecuteControlFlowNodeArgs) => Promise<void>,
  setPipeline: React.Dispatch<React.SetStateAction<TPipeLine[]>>,
  setIsInitializingPipeline: (isLoading: boolean) => void
): Promise<void> => {
  setIsInitializingPipeline(true);

  const node = allNodes[nodeID];
  if (isControlFlowNode(node)) {
    await executeControlFlowNode({ nodeId: nodeID, answersTemp: {} });
  } else {
    const isNonInteractive = isContentNode(node);
    const initialPipeline = createInitialPipeline(nodeID);
    const pipelineIndex = isNonInteractive
      ? null
      : getQuestionIndex(initialPipeline, allNodes);
    setPipeline([{ qId: nodeID, index: pipelineIndex }]);
  }
  setIsInitializingPipeline(false);
};

export const useCardRunner = ({
  allNodes,
  initialAnswers,
  taskGraph,
  onSubmission,
  questionRef,
  setQuestionNavigationDirection,
  variables,
  onNodeChange,
  onEvent = () => { },
  onAnalyticsEvent = () => { },
  executeNodeDependencies = {},
  initialPipeline,
  onSubmissionStateChange,
}: IUseCardRunner) => {
  const startNode = getStartNode(allNodes);
  const isFirstQuestionSubmitted = useRef(false);

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [pipeline, setPipeline] = useState<TPipeLine[]>(initialPipeline ?? []);
  const [answers, setAnswers] = useState<TAnswers>(initialAnswers || {});
  const [error, setError] = useState<string>("");
  const [isInitializingPipeline, setIsInitializingPipeline] = useState(false);
  const [runtimeError, setRuntimeError] = useState<TRuntimeError | null>(null);
  const answeredIds = useRef(new Set());
  const visitedJumpToNodesCount = useRef<Map<string, number>>(new Map());
  const stripePaymentQuestionId = useMemo(() => {
    return Object.values(allNodes).find(
      (node) => node.type === QuestionType.STRIPE_PAYMENT
    )?.id;
  }, [allNodes]);

  const stripePaymentQuestionRef = useRef<React.MutableRefObject<any>>(null);
  const isStripePaymentAvailable = !isEmpty(stripePaymentQuestionId);
  const isCurrentNodeStripePayment = useMemo(() => {
    return pipeline[pipeline?.length - 1]?.qId === stripePaymentQuestionId;
  }, [pipeline, stripePaymentQuestionId]);

  const executeStripePaymentNode = async (): Promise<{
    status: boolean;
    errorMessage?: string;
    data?: Record<string, unknown>;
  }> => {
    try {
      const stripePaymentNode = allNodes[stripePaymentQuestionId]?.config;
      if (!stripePaymentNode) {
        return {
          status: false,
          errorMessage:
            VALIDATION_MESSAGE.STRIPE_PAYMENT.STRIPE_PAYMENT_QUESTION_NOT_FOUND,
        };
      }

      const settings = stripePaymentNode?.settings || {};
      const amount = parseFloat(settings?.amount || "0");
      const currency = settings?.currency || "USD";
      const sendReceipt = settings?.sendReceipt || false;
      const isRequired = settings?.required || false;
      const connectionData = settings?.stripe_connection_data;
      const accessToken = connectionData?.configs?.access_token;

      const paymentRef = stripePaymentQuestionRef.current as any;
      if (!paymentRef) {
        return {
          status: false,
          errorMessage:
            VALIDATION_MESSAGE.STRIPE_PAYMENT.STRIPE_QUESTION_NOT_CONFIGURED,
        };
      }
      const isPaymentElementEmpty = paymentRef.isPaymentElementEmpty;

      if (!isRequired && isPaymentElementEmpty) {
        return {
          status: true,
          data: {},
        };
      }

      const validationError = await paymentRef.validate();
      if (validationError) {
        return {
          status: false,
          errorMessage: validationError,
        };
      }

      const stripe = paymentRef.getStripe();
      const elements = paymentRef.getElements();

      if (!stripe) {
        return {
          status: false,
          errorMessage:
            VALIDATION_MESSAGE.STRIPE_PAYMENT.STRIPE_INSTANCE_NOT_AVAILABLE,
        };
      }

      if (!elements) {
        return {
          status: false,
          errorMessage:
            VALIDATION_MESSAGE.STRIPE_PAYMENT.STRIPE_QUESTION_NOT_CONFIGURED,
        };
      }

      if (!accessToken) {
        return {
          status: false,
          errorMessage:
            VALIDATION_MESSAGE.STRIPE_PAYMENT.STRIPE_QUESTION_NOT_CONFIGURED,
        };
      }

      if (amount <= 0) {
        return {
          status: false,
          errorMessage:
            VALIDATION_MESSAGE.STRIPE_PAYMENT.INVALID_PAYMENT_AMOUNT,
        };
      }

      const paymentAnswer = answers[stripePaymentQuestionId];
      const formData = paymentAnswer?.response || {};
      const name = formData?.name || "";
      const email = sendReceipt ? formData?.email || "" : undefined;

      if (isRequired) {
        if (!name || name.trim() === "") {
          return {
            status: false,
            errorMessage: VALIDATION_MESSAGE.STRIPE_PAYMENT.NAME_REQUIRED,
          };
        }

        if (sendReceipt && (!email || email.trim() === "")) {
          return {
            status: false,
            errorMessage:
              VALIDATION_MESSAGE.STRIPE_PAYMENT.SEND_RECEIPT_REQUIRED,
          };
        }
      }

      const clientSecret = await paymentRef.createPaymentIntent();

      if (!clientSecret) {
        return {
          status: false,
          errorMessage: VALIDATION_MESSAGE.STRIPE_PAYMENT.STRIPE_PAYMENT_FAILED,
        };
      }

      const returnUrl = window.location.href;

      const billingDetails: any = {};
      if (name && name.trim() !== "") {
        billingDetails.name = name;
      }
      if (sendReceipt && email && email.trim() !== "") {
        billingDetails.email = email;
      }

      const { error: confirmError, paymentIntent } =
        await stripe.confirmPayment({
          elements,
          clientSecret,
          confirmParams: {
            return_url: returnUrl,
            payment_method_data: {
              billing_details:
                Object.keys(billingDetails).length > 0
                  ? billingDetails
                  : undefined,
            },
          },
          redirect: "if_required",
        });

      if (confirmError) {
        return {
          status: false,
          errorMessage: VALIDATION_MESSAGE.STRIPE_PAYMENT.STRIPE_PAYMENT_FAILED,
        };
      }

      if (paymentIntent) {
        if (paymentIntent.status === "succeeded") {
          return {
            status: true,
            data: {
              amount: amount,
              currency: currency,
              ...paymentIntent,
            },
          };
        } else if (paymentIntent.status === "requires_action") {
          return {
            status: false,
            errorMessage: "Payment requires additional authentication",
          };
        } else {
          return {
            status: false,
            errorMessage: `Payment status: ${paymentIntent.status}`,
          };
        }
      }

      return {
        status: false,
        errorMessage: VALIDATION_MESSAGE.STRIPE_PAYMENT.STRIPE_PAYMENT_FAILED,
      };
    } catch (error: any) {
      const errorMessage =
        error?.message ||
        VALIDATION_MESSAGE.STRIPE_PAYMENT.STRIPE_PAYMENT_FAILED;

      return {
        status: false,
        errorMessage: errorMessage,
      };
    }
  };

  const executeJumpToNode = ({ node, pipeline, answers }) => {
    const nodeIdToJumpOn = node?.config?.jump_to_id;
    const messageContent = isEmpty(node?.config?.message_content)
      ? VALIDATION_MESSAGE.JUMP_TO_NODE.GENERIC_MESSAGE
      : node?.config?.message_content;
    const resolvedMessageContent = resolveFXContent({
      answers,
      content: messageContent,
    });

    const indexInPipeline = pipeline.findIndex((item) => {
      return item.qId === nodeIdToJumpOn;
    });
    if (indexInPipeline === -1) {
      setRuntimeError({
        errorType: "invalid_jump",
        technicalDetails: {
          errorCode: "INVALID_JUMP",
          timestamp: new Date().toISOString(),
        },
      });
      return;
    }

    const pipelineTemp = [...pipeline];
    const answersTemp = { ...answers };
    const qIdsToRemove = pipelineTemp
      .splice(indexInPipeline + 1)
      .map((item) => item.qId);
    qIdsToRemove.forEach((qId) => delete answersTemp[qId]);
    delete answersTemp[nodeIdToJumpOn];
    return {
      pipeline: pipelineTemp,
      answers: answersTemp,
      jumpToNodeId: nodeIdToJumpOn,
      message:
        resolvedMessageContent ??
        VALIDATION_MESSAGE.JUMP_TO_NODE.GENERIC_MESSAGE,
    };
  };

  const validateMaxJumpToNodeIterations = (nodeId: string) => {
    if (
      visitedJumpToNodesCount.current.get(nodeId) >= MAX_JUMP_TO_NODE_ITERATIONS
    ) {
      setRuntimeError({
        errorType: "infinite_loop",
        technicalDetails: {
          errorCode: "INFINITE_LOOP",
          timestamp: new Date().toISOString(),
        },
      });
    }
  };

  const incrementJumpToNodeIterations = (nodeId: string) => {
    visitedJumpToNodesCount.current.set(
      nodeId,
      (visitedJumpToNodesCount.current.get(nodeId) || 0) + 1
    );
  };

  const executeControlFlowNode = async ({
    nodeId,
    answersTemp = answers,
  }: ExecuteControlFlowNodeArgs): Promise<void> => {
    if (!isFirstQuestionSubmitted.current) {
      isFirstQuestionSubmitted.current = true;
      onAnalyticsEvent(UATU_FORM_FILLER, {
        subEvent: UATU_PREDICATE_EVENTS.FORM_SUBMISSION_STARTED,
      });
    }
    const updatePipeline = ({ qId, index }) => {
      setPipeline((prevPipeLine) => [...prevPipeLine, { qId, index }]);
    };

    const handleFormCompletion = async (updatedAnswers) => {
      if (onSubmission) {
        setIsLoading(true);
        try {
          let finalAnswers = { ...updatedAnswers };
          if (isStripePaymentAvailable) {
            const paymentResult = await executeStripePaymentNode();
            if (!paymentResult.status) {
              // Payment failed, show error and stop submission
              if (paymentResult.errorMessage) {
                setIsLoading(false);
                setError(paymentResult.errorMessage);
              }
              return;
            } else {
              const paymentData = paymentResult.data || {};
              finalAnswers = {
                ...finalAnswers,
                [stripePaymentQuestionId]: {
                  response: {
                    ...(finalAnswers[stripePaymentQuestionId]?.response || {}),
                    ...paymentData,
                  },
                },
              };
            }
          }
          await onSubmission(
            sanitizedAnswers({
              answers: finalAnswers,
              pipeline,
            })
          );
        } catch (error) {
        } finally {
          setIsLoading(false);
        }
      }
      onNodeChange({
        nextNode: {},
      });
    };

    const handleFormCompletionFlow = async (
      nextNodeId: string,
      currentAnswers: TAnswers
    ) => {
      if (!nextNodeId || allNodes[nextNodeId]?.type === QuestionType.ENDING) {
        if (allNodes[nextNodeId]?.type === QuestionType.ENDING) {
          await handleFormCompletion(currentAnswers);
          updatePipeline({ qId: nextNodeId, index: null });
          return true;
        }

        await handleFormCompletion(currentAnswers);
        return true;
      }
      return false;
    };

    const updatePipelineWithNodeAndAnswer = (nodeId, updatedAnswers) => {
      const isContentNodeType = isContentNode(allNodes[nodeId]);
      const newPipeline = [
        ...(pipeline || []),
        {
          qId: nodeId,
          index: isContentNodeType
            ? null
            : getQuestionIndex([...pipeline, { qId: nodeId }], allNodes),
        },
      ];
      setAnswers((prevAnswers) => {
        return {
          ...prevAnswers,
          ...updatedAnswers,
        };
      });
      setPipeline(newPipeline);
      onNodeChange({
        nextNode: allNodes[newPipeline[newPipeline?.length - 1]?.qId],
      });
    };

    const processNode = async (
      currentNodeId: string,
      currentAnswers: TAnswers
    ) => {
      const currentNode = allNodes[currentNodeId];

      //Not handling for IFELSE because it may contain more node
      // if (currentNode.type !== "IFELSE" && !currentNode?.next_node_ids[0]) {
      //   handleFormCompletion(answers);
      //   return;
      // }

      //Handling Execution of nodes
      try {
        setIsLoading(true);

        const transformedNodeType =
          getNodeTypeToExecuteTransformedNode(currentNode);

        const res = await executeTransformedNode({
          currentNode: currentNode,
          type: transformedNodeType,
          allNodes: allNodes,
          taskGraph: taskGraph,
          answers: currentAnswers,
          variables: variables,
          executeNodeDependencies,
        });

        if (res?.status !== "success") {
          throw new Error(`Something went wrong.`);
        }

        const result = res?.result;

        let updatedAnswers = {
          ...currentAnswers,
        };

        let nextToExecuteNodeId = null;

        if (
          transformedNodeType === "IFELSE" ||
          transformedNodeType === "IFELSE_V2"
        ) {
          nextToExecuteNodeId = result?.id;
        } else {
          nextToExecuteNodeId = currentNode?.next_node_ids[0];
          updatedAnswers = {
            ...currentAnswers,
            [currentNode?._id]: { ...result },
          };
        }

        onEvent({
          node: currentNode,
          response: result,
          type: "success",
          answers: updatedAnswers,
          pipeline,
        });

        const nextNodeToExecute = allNodes[nextToExecuteNodeId];

        if (
          await handleFormCompletionFlow(nextToExecuteNodeId, updatedAnswers)
        ) {
          setAnswers((prevAnswers) => {
            return {
              ...prevAnswers,
              ...updatedAnswers,
            };
          });
          return;
        }

        if (isControlFlowNode(nextNodeToExecute)) {
          await processNode(nextToExecuteNodeId, updatedAnswers);
          return;
        }

        if (nextNodeToExecute && nextNodeToExecute?.type === "JUMP_TO") {
          const jumpToNodeResponse = executeJumpToNode({
            node: nextNodeToExecute,
            pipeline,
            answers,
          }) as any;
          if (!jumpToNodeResponse) return;
          incrementJumpToNodeIterations(jumpToNodeResponse?.jumpToNodeId);
          validateMaxJumpToNodeIterations(jumpToNodeResponse?.jumpToNodeId);
          setPipeline(jumpToNodeResponse?.pipeline);
          setAnswers(jumpToNodeResponse?.answers);
          if (jumpToNodeResponse?.message) {
            setError(jumpToNodeResponse?.message);
          }
          return;
        }
        updatePipelineWithNodeAndAnswer(nextNodeToExecute?.id, updatedAnswers);
      } catch (error) {
        const errorMessage = error?.message;
        toast.error("Execution Error", {
          description: errorMessage,
        });
        onEvent({
          node: currentNode,
          response: errorMessage,
          type: "error",
        });
      } finally {
        setIsLoading(false);
      }
    };

    await processNode(nodeId, answersTemp);
  };

  useEffect(() => {
    if (initialPipeline && initialPipeline?.length) {
      setIsInitializingPipeline(false);
      // If half filled form is loaded, emit the form load event
      onAnalyticsEvent(UATU_FORM_FILLER, {
        subEvent: UATU_PREDICATE_EVENTS.FORM_LOAD,
        loadedTime: Date.now(),
      });
      return;
    }
    const startNodeId = startNode?.id;
    initializePipeline(
      allNodes,
      startNodeId,
      executeControlFlowNode,
      setPipeline,
      setIsInitializingPipeline
    );
    const isEndingNode = allNodes[startNodeId]?.type === QuestionType.ENDING;
    if (!isFirstQuestionSubmitted.current && isEndingNode) {
      isFirstQuestionSubmitted.current = true;
      onAnalyticsEvent(UATU_FORM_FILLER, {
        subEvent: UATU_PREDICATE_EVENTS.FORM_SUBMISSION_STARTED,
      });
    }
    onAnalyticsEvent(UATU_FORM_FILLER, {
      subEvent: UATU_PREDICATE_EVENTS.FORM_LOAD,
      loadedTime: Date.now(),
    });
    if (isEndingNode && onSubmission) {
      onSubmission(
        sanitizedAnswers({
          answers: answers,
          pipeline: pipeline,
        })
      );
    }
    onNodeChange({
      nextNode: allNodes[startNodeId],
    });
  }, []);

  useEffect(() => {
    let timer = null;
    if (error) {
      timer = setTimeout(() => {
        setError("");
      }, 5000);
    }

    return () => clearTimeout(timer);
  }, [error]);

  const validateUserAnswer = (
    visibleNode: TNode,
    userAnswers: any,
    ref: any
  ): any => {
    const error = questionsValidation({
      node: visibleNode,
      answer: userAnswers,
      ref: ref?.current,
    });

    if (visibleNode.type === QuestionType.MULTI_QUESTION_PAGE) {
      const questionKeysWithError = Object.keys(error);
      const prevMultiQuestionResponse = {
        ...(userAnswers[visibleNode._id]?.response || {}),
      };
      for (const key of questionKeysWithError) {
        prevMultiQuestionResponse[key] = {
          ...prevMultiQuestionResponse[key],
          error: error[key],
        };
      }

      setAnswers((prevAnswers) => {
        return {
          ...prevAnswers,
          [visibleNode._id]: {
            ...prevAnswers[visibleNode._id],
            response: prevMultiQuestionResponse,
          },
        };
      });
      return questionKeysWithError.length === 0 ? "" : "error";
    }

    setError(error);
    return error;
  };

  const executeQuestionNode = async ({
    ref,
    userAnswers = answers,
  }: {
    ref: React.MutableRefObject<any>;
    userAnswers?: TAnswers;
  }) => {
    if (!isFirstQuestionSubmitted.current) {
      isFirstQuestionSubmitted.current = true;
      onAnalyticsEvent(UATU_FORM_FILLER, {
        subEvent: UATU_PREDICATE_EVENTS.FORM_SUBMISSION_STARTED,
      });
    }
    setQuestionNavigationDirection(QuestionNavigationDirection.DOWN);
    const visibleNode: TNode = allNodes[pipeline[pipeline.length - 1].qId];
    const nextNodeId: string = visibleNode?.next_node_ids[0];
    const nodeResponse = userAnswers?.[visibleNode.id]?.response;

    // Validate user input
    const qError = validateUserAnswer(visibleNode, userAnswers, ref);
    if (!!qError) {
      onAnalyticsEvent(UATU_FORM_FILLER, {
        subEvent: UATU_PREDICATE_EVENTS.FIELD_VALIDATION_ERROR,
        node: visibleNode,
        error: qError,
        response: nodeResponse,
      });
      // log validation error
      onEvent({
        node: visibleNode,
        response: qError,
        type: "error",
      });
      return;
    }

    // handle prehooks
    const {
      error,
      earlyExit,
      preHookAnswers = {},
    } = await handlePreHooks({
      node: visibleNode,
      ref: isCurrentNodeStripePayment ? stripePaymentQuestionRef : ref,
      setAnswers: setAnswers,
      setLoading: setIsLoading,
      answers: userAnswers,
    });

    if (error || earlyExit) {
      setError(error);
      // log prehook errors
      if (error) {
        onEvent({
          node: visibleNode,
          response: error,
          type: "error",
        });

        onAnalyticsEvent(UATU_FORM_FILLER, {
          subEvent: UATU_PREDICATE_EVENTS.FIELD_VALIDATION_ERROR,
          node: visibleNode,
          error: error,
          response: nodeResponse,
        });
      }

      return;
    }

    // log question answering
    onEvent({
      node: visibleNode,
      response: { ...userAnswers, ...preHookAnswers }?.[visibleNode.id]
        ?.response,
      type: "success",
      answers: { ...userAnswers, ...preHookAnswers },
      pipeline,
    });

    if (nextNodeId && allNodes[nextNodeId].type === "JUMP_TO") {
      const jumpToNodeResponse = executeJumpToNode({
        node: allNodes[nextNodeId],
        pipeline,
        answers,
      }) as any;
      if (!jumpToNodeResponse) return;
      incrementJumpToNodeIterations(jumpToNodeResponse?.jumpToNodeId);
      validateMaxJumpToNodeIterations(jumpToNodeResponse?.jumpToNodeId);
      setPipeline(jumpToNodeResponse?.pipeline);
      setAnswers(jumpToNodeResponse?.answers);
      if (jumpToNodeResponse?.message) {
        setError(jumpToNodeResponse?.message);
      }
      return;
    }
    // Check if there is no next node or if the next node is an ENDING node to set the pipeline
    // and submit the form if the nextNode is Ending
    if (!nextNodeId || allNodes[nextNodeId].type === QuestionType.ENDING) {
      if (onSubmission) {
        setIsLoading(true);
        try {
          let finalAnswers = { ...userAnswers, ...preHookAnswers };
          if (isStripePaymentAvailable) {
            const paymentResult = await executeStripePaymentNode();
            if (!paymentResult.status) {
              // Payment failed, show error and stop submission
              if (paymentResult.errorMessage) {
                setIsLoading(false);
                setError(paymentResult.errorMessage);
              }
              return;
            } else {
              const paymentData = paymentResult.data || {};
              finalAnswers = {
                ...finalAnswers,
                [stripePaymentQuestionId]: {
                  response: {
                    ...((finalAnswers[stripePaymentQuestionId]
                      ?.response as any) || {}),
                    ...paymentData,
                  },
                },
              };
            }
          }
          await onSubmission(
            sanitizedAnswers({
              answers: { ...finalAnswers },
              pipeline: pipeline,
            })
          );
          // Update submission state to SUBMITTED after successful submission
          if (onSubmissionStateChange) {
            onSubmissionStateChange("SUBMITTED");
          }
        } catch (error) {
        } finally {
          setIsLoading(false);
        }
      }
      if (allNodes[nextNodeId]?.type === QuestionType.ENDING) {
        setPipeline((prevPipeLine) => [
          ...prevPipeLine,
          {
            qId: nextNodeId,
            index: null,
          },
        ]);

        onNodeChange({
          nextNode: allNodes[nextNodeId],
        });
      }

      onAnalyticsEvent(UATU_FORM_FILLER, {
        subEvent: UATU_PREDICATE_EVENTS.FIELD_TIME_SPENT,
        prevNode: visibleNode,
        node: allNodes[nextNodeId],
        response: nodeResponse,
      });
      onNodeChange({
        nextNode: allNodes[nextNodeId],
      });
      return;
    }

    //check whether the nextNode is Dependent node
    if (isControlFlowNode(allNodes[nextNodeId])) {
      await executeControlFlowNode({
        nodeId: nextNodeId,
        answersTemp: { ...userAnswers, ...preHookAnswers },
      });

      onAnalyticsEvent(UATU_FORM_FILLER, {
        subEvent: UATU_PREDICATE_EVENTS.FIELD_TIME_SPENT,
        prevNode: visibleNode,
        node: allNodes[nextNodeId],
        response: nodeResponse,
      });
      return;
    }

    onAnalyticsEvent(UATU_FORM_FILLER, {
      subEvent: UATU_PREDICATE_EVENTS.FIELD_TIME_SPENT,
      prevNode: visibleNode,
      node: allNodes[nextNodeId],
      response: nodeResponse,
    });

    setPipeline((prevPipeline) => {
      const isNextContentNode = isContentNode(allNodes[nextNodeId]);
      onNodeChange({
        nextNode: allNodes[nextNodeId],
      });
      const prevNodes = prevPipeline.slice(0, prevPipeline?.length - 1);

      return [
        ...prevNodes,
        {
          qId: prevPipeline[prevPipeline?.length - 1]?.qId,
          index: prevPipeline[prevPipeline?.length - 1]?.index,
        },
        {
          qId: nextNodeId,
          index: isNextContentNode
            ? null
            : getQuestionIndex(
              [...prevPipeline, { qId: nextNodeId }],
              allNodes
            ),
        },
      ];
    });
  };

  const goPreviousQuestion = () => {
    if (pipeline.length <= 1) return; // Ensure there is at least one item remaining
    const newPipeline = [...pipeline] as any;

    // Reset error state
    setError("");

    let lastNode = allNodes[pipeline[pipeline.length - 1].qId];

    const questionNodesWithoutLoading = QUESTION_NODES.filter(
      (questionType) => questionType !== QuestionType?.LOADING
    );

    do {
      newPipeline.pop();
      lastNode = allNodes[newPipeline[newPipeline?.length - 1]?.qId];
    } while (!questionNodesWithoutLoading?.includes(lastNode?.type));
    setPipeline(newPipeline);
    onNodeChange({
      nextNode: allNodes[newPipeline[newPipeline?.length - 1]?.qId],
    });
  };

  return {
    answers,
    setAnswers,
    isLoading,
    pipeline,
    goPreviousQuestion,
    executeQuestionNode,
    allNodes,
    error,
    setError,
    isInitializingPipeline,
    answeredIds: answeredIds.current,
    runtimeError,
    stripePaymentQuestionId,
    stripePaymentQuestionRef,
  };
};
