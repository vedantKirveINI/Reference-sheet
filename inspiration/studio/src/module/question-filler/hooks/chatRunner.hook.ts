import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { isControlFlowNode, sanitizedAnswers } from "../utils/helpers";
import { questionsValidation } from "../validation/questions-validation";
import { handlePreHooks } from "../pre-hooks";
import {
  getNodeTypeToExecuteTransformedNode,
  executeTransformedNode,
} from "../utils/executeTransformedNode";
import { QuestionType } from "@src/module/constants";
import { TAnswers, TNode } from "../types";
import { getStartNode } from "../utils/get-start-node";
import { TRuntimeError } from "../components/runtime-error-screen/types";
import { MAX_JUMP_TO_NODE_ITERATIONS } from "../constant/node-marker";
import { isEmpty } from "lodash";
import { resolveFXContent } from "../utils/resolve-fx-content";
import { VALIDATION_MESSAGE } from "../constant/validationMessages";

const useChatRunner = ({
  allNodes,
  taskGraph,
  initialAnswers,
  initialPipeline,
  onSubmission,
  onSubmissionStateChange,
  variables,
  onEvent,
  assetId,
  executeNodeDependencies = {},
}) => {
  const startNode = getStartNode(allNodes);

  const [isLoading, setIsLoading] = useState(false);
  const [answers, setAnswers] = useState(initialAnswers || {}); // it has answers of all nodes even http and if/else
  const [executedNodes, setExecutedNodes] = useState([]); // it has ids of all the nodes that are executed
  const [pipeline, setPipeline] = useState(initialPipeline ?? []); // it has only question nodes
  const [initializingPipeline, setInitializingPipeline] =
    useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [runtimeError, setRuntimeError] = useState<TRuntimeError | null>(null);
  const answeredIds = useRef(new Set());
  const visitedJumpToNodesCount = useRef<Map<string, number>>(new Map());
  const stripePaymentQuestionId = useMemo(() => {
    return Object.values(allNodes as TNode).find(
      (node) => node.type === QuestionType.STRIPE_PAYMENT
    )?.id;
  }, [allNodes]);
  const stripePaymentQuestionRef = useRef<React.MutableRefObject<any>>(null);
  const isStripePaymentAvailable = !isEmpty(stripePaymentQuestionId);

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
      const isPaymentElementEmpty = paymentRef.isPaymentElementEmpty();

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
          errorMessage:
            confirmError.message ||
            VALIDATION_MESSAGE.STRIPE_PAYMENT.STRIPE_PAYMENT_FAILED,
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
        errorMessage: "Payment intent not available",
      };
    } catch (error: any) {
      const errorMessage =
        error?.message || "An error occurred while processing your payment";

      return {
        status: false,
        errorMessage: errorMessage,
      };
    }
  };

  const executeJumpToNode = ({ node, pipeline, answers }) => {
    const nodeIdToJumpOn = node?.config?.jump_to_id;
    const indexInPipeline = pipeline.findIndex((item) => {
      return item.qId === nodeIdToJumpOn;
    });
    const messageContent = isEmpty(node?.config?.message_content)
      ? VALIDATION_MESSAGE.JUMP_TO_NODE.GENERIC_MESSAGE
      : node?.config?.message_content;
    const resolvedMessageContent = resolveFXContent({
      answers,
      content: messageContent,
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

  const initializePipeline = async () => {
    let nodeId = startNode?.id;
    let shouldSubmit = false;

    //skipping the loading question type here
    while (allNodes[nodeId]?.type === QuestionType.LOADING) {
      const currentNode = allNodes[nodeId];
      if (currentNode?.node_marker === "END") {
        if (onSubmission) {
          await onSubmission(
            sanitizedAnswers({
              answers: { ...answers },
              pipeline,
            })
          );
          // Update submission state to SUBMITTED after successful submission
          if (onSubmissionStateChange) {
            onSubmissionStateChange("SUBMITTED");
          }
        }

        shouldSubmit = true;
        break;
      }
      const nextNodeId = allNodes[nodeId]?.next_node_ids[0];
      nodeId = nextNodeId;
    }

    if (shouldSubmit) {
      return;
    }

    const node = allNodes[nodeId];
    const isControlFlowNodeType = isControlFlowNode(node);
    if (isControlFlowNodeType) {
      await executeControlFlowNode({ nodeId: nodeId, answersTemp: {} });
      setExecutedNodes([...executedNodes, Object.keys(allNodes)[0]]);
    } else {
      setPipeline([
        {
          qId: nodeId,
          index: 1,
        },
      ]);
    }
  };

  useEffect(() => {
    if (initialPipeline && initialPipeline?.length) {
      setInitializingPipeline(false);
      return;
    }
    initializePipeline();
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

  const validateUserAnswer = (node, ref, nodeAnswers) => {
    const error = questionsValidation({
      node: node,
      answer: nodeAnswers,
      ref: ref?.current,
    });

    setError(error);
    return error;
  };

  const executeControlFlowNode = async ({ nodeId, answersTemp = answers }) => {
    const handleFormCompletion = async (updatedAnswers) => {
      if (onSubmission) {
        let finalAnswers = { ...updatedAnswers, ...answers };
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
            answers: { ...finalAnswers },
            pipeline,
          })
        );
        // Update submission state to SUBMITTED after successful submission
        if (onSubmissionStateChange) {
          onSubmissionStateChange("SUBMITTED");
        }
      }
    };

    const updatePipeline = ({ qId, index }) => {
      setPipeline((prevPipeLine) => [...prevPipeLine, { qId, index }]);
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

    const processNode = async (
      currentNodeId: string,
      currentAnswers: TAnswers
    ) => {
      if (!isControlFlowNode(allNodes[currentNodeId])) return;

      const currentNode = allNodes[currentNodeId];

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
          updatedAnswers = { ...answers, ...updatedAnswers };
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

        setExecutedNodes((prev) => [...prev, nodeId, nextToExecuteNodeId]);
        setPipeline((prevPipeline) => {
          return [
            ...prevPipeline,
            {
              qId: nextToExecuteNodeId,
              index: prevPipeline?.length + 1,
            },
          ];
        });
        setAnswers((prevAnswers) => {
          return {
            ...prevAnswers,
            ...updatedAnswers,
          };
        });
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

  const executeQuestionsNode = async ({
    ref,
    indexBeingEdited,
    nodeAnswers = {},
  }) => {
    const currentNode =
      allNodes[pipeline[indexBeingEdited ?? pipeline?.length - 1]?.qId];
    let nextNodeId = currentNode?.next_node_ids[0];

    // handling settings validation of questions
    const qError = validateUserAnswer(currentNode, ref, nodeAnswers);
    if (qError) {
      onEvent({
        node: currentNode,
        response: qError,
        type: "error",
      });
      return;
    }

    const {
      error,
      earlyExit,
      preHookAnswers = {},
    } = await handlePreHooks({
      node: currentNode,
      ref:
        currentNode?.type === QuestionType.STRIPE_PAYMENT
          ? stripePaymentQuestionRef
          : ref,
      setAnswers: setAnswers,
      setLoading: setIsLoading,
      answers: answers,
    });
    if (error || earlyExit) {
      setError(error);
      if (error) {
        onEvent({
          node: currentNode,
          response: error,
          type: "error",
        });
      }
      return;
    }

    onEvent({
      node: currentNode,
      response: { ...nodeAnswers, ...preHookAnswers }?.[currentNode.id]
        ?.response,
      type: "success",
      answers: { ...nodeAnswers, ...preHookAnswers },
      pipeline,
    });

    if (allNodes[nextNodeId]?.type === QuestionType.LOADING) {
      nextNodeId = allNodes[nextNodeId]?.next_node_ids[0];
    }

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

    // Checking if all questions are answered
    if (!nextNodeId || allNodes[nextNodeId].type === QuestionType.ENDING) {
      const updatePipeline = (qId: string) => {
        setPipeline((prevPipeLine) => [
          ...prevPipeLine,
          {
            qId: qId,
            index: null,
          },
        ]);
      };

      if (onSubmission) {
        let finalAnswers = { ...answers, ...preHookAnswers };
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
            pipeline,
          })
        );
        // Update submission state to SUBMITTED after successful submission
        if (onSubmissionStateChange) {
          onSubmissionStateChange("SUBMITTED");
        }
      }

      if (allNodes[nextNodeId]?.type === QuestionType.ENDING) {
        updatePipeline(nextNodeId);
      }

      return;
    }

    if (indexBeingEdited !== undefined && indexBeingEdited !== null) return;

    const nextNode = allNodes[nextNodeId];
    if (isControlFlowNode(nextNode)) {
      /*
      if nextNode is dependent, call executeDependentNode
    */
      await executeControlFlowNode({
        nodeId: nextNodeId,
        answersTemp: { ...answers, ...preHookAnswers, ...nodeAnswers },
      });
      return;
    }

    setPipeline((prevPipeline) => {
      const prevNodes = prevPipeline.slice(0, prevPipeline?.length - 1);
      return [
        ...prevNodes,
        {
          qId: prevPipeline[prevPipeline?.length - 1]?.qId,
          index: prevPipeline[prevPipeline?.length - 1]?.index,
        },
        {
          qId: nextNodeId,
          index: prevPipeline[prevPipeline?.length - 1]?.index + 1,
        },
      ];
    });
    setExecutedNodes([...executedNodes, nextNodeId]);
  };

  return {
    allNodes,
    isLoading,
    pipeline,
    answers,
    setAnswers,
    setIsLoading,
    setPipeline,
    executeQuestionsNode,
    executedNodes,
    setExecutedNodes,
    initializingPipeline,
    error,
    setError,
    runtimeError,
    answeredIds: answeredIds?.current,
    stripePaymentQuestionId,
    stripePaymentQuestionRef,
  };
};

export default useChatRunner;
