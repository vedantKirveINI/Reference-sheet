import { useEffect, useMemo, useRef, useState } from "react";
import { TAnswers, TNode, TPipeLine } from "../types";
import { TAnswerValue, TEventType, TNodes } from "./types";
import { getStartNode } from "../utils/get-start-node";
import { QuestionType } from "@src/module/constants";
import { isEmpty } from "lodash";
import { checkNodeDependency } from "@oute/oute-ds.common.core.utils";
import { executeJumpToNode } from "../utils/execute-jump-to-node";
import { TRuntimeError } from "../components/runtime-error-screen/types";
import { MAX_JUMP_TO_NODE_ITERATIONS } from "../constant/node-marker";
import { isControlFlowNode, isQuestionNode } from "../utils/helpers";
import {
  getNodeTypeToExecuteTransformedNode,
  executeTransformedNode,
} from "../utils/executeTransformedNode";
import { toast } from "sonner";
import { questionsValidation } from "../validation/questions-validation";
import { getQuestionIndex } from "../utils/classic.helpers";
import { VALIDATION_MESSAGE } from "../constant/validationMessages";
import { handlePreHooks } from "../pre-hooks";

export interface IClassicRunnerProps {
  allNodes: TNodes;
  taskGraph: any[];
  variables: any;
  getNodeRef: (nodeId: string) => any;
  triggerIfAllNodesValid: () => void;
  executeNodeDependencies?: Record<string, string>;
  initialAnswers?: TAnswers;
  onSubmission?: (answers: TAnswers) => Promise<void>;
  onSubmissionStateChange?: (state: string) => void;
  onEvent: ({ node, response, type }: TEventType) => void;
}

export const useClassicRunner = ({
  initialAnswers = {},
  allNodes = {},
  onSubmission = () => Promise.resolve(),
  onSubmissionStateChange,
  getNodeRef,
  taskGraph,
  variables,
  executeNodeDependencies = {},
  onEvent,
  triggerIfAllNodesValid,
}: IClassicRunnerProps) => {
  const [answers, setAnswers] = useState<TAnswers>(initialAnswers);
  const [pipeline, setPipeline] = useState<TPipeLine[]>([]);
  const [initializingPipeline, setInitializingPipeline] = useState(true);
  const [isPipelineFilling, setIsPipelineFilling] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [runtimeError, setRuntimeError] = useState<TRuntimeError | null>(null);
  const visitedJumpToNodesCount = useRef<Map<string, number>>(new Map());
  const answeredIds = useRef(new Set<string>());
  let stagedAnswers: TAnswers = { ...answers };
  let stagedPipeline: TPipeLine[] = [...pipeline];

  const stripePaymentQuestionId = useMemo(() => {
    return Object.values(allNodes).find(
      (node) => node.type === QuestionType.STRIPE_PAYMENT
    )?.id;
  }, [allNodes]);

  const stripePaymentQuestionRef = useRef<React.MutableRefObject<any>>(null);
  const isStripePaymentAvailable = !isEmpty(stripePaymentQuestionId);

  const saveState = () => {
    setAnswers(stagedAnswers);
    setPipeline(stagedPipeline);
  };

  const onAnswerChange = (nodeId, value: TAnswerValue) => {
    setAnswers((prevAnswers) => {
      // Setting previous answer of multi question page to response as all question renders in one page
      const newValue =
        allNodes[nodeId]?.type === QuestionType.MULTI_QUESTION_PAGE
          ? {
            response: {
              ...(prevAnswers[nodeId]?.response || {}),
              ...(value?.response || {}),
            },
          }
          : { ...value };
      return {
        ...prevAnswers,
        [nodeId]: newValue,
      };
    });

    const dependentPipelineItem = stagedPipeline.find((pipelineItem) => {
      const node = allNodes[pipelineItem.qId];
      const config = node?.config;
      const usedRefNodes = config?.used_ref_src_ids || [];
      return usedRefNodes.includes(nodeId);
    });

    let newPipeline = structuredClone(stagedPipeline);
    newPipeline = newPipeline.map((pipelineItem) => {
      if (pipelineItem.qId === nodeId) {
        return { ...pipelineItem, isValidated: false };
      }
      return pipelineItem;
    });

    if (dependentPipelineItem) {
      const dependentIndex = newPipeline.findIndex(
        (pipelineItem) => pipelineItem.qId === dependentPipelineItem.qId
      );
      if (dependentIndex !== -1) {
        newPipeline = newPipeline.slice(0, dependentIndex);
      }
    }

    setPipeline(newPipeline);
  };

  const executeNode = async (
    node: TNode
  ): Promise<{
    shouldHalt?: boolean;
    errorMessage?: string;
    nextNodeId: string | null;
    result: any;
  } | null> => {
    if (node.type === QuestionType.FILE_PICKER) {
      const questionRef = getNodeRef(node.id);
      if (questionRef) {
        try {
          const urls = await questionRef?.uploadFiles();
          return { errorMessage: null, nextNodeId: null, result: urls };
        } catch (e) {
          return { errorMessage: e?.message, nextNodeId: null, result: null };
        }
      }
    }

    if (node.type === QuestionType.SIGNATURE) {
      const questionRef = getNodeRef(node.id);
      if (questionRef) {
        try {
          const url = await questionRef?.uploadSignature();
          return { errorMessage: null, nextNodeId: null, result: url };
        } catch (e) {
          return { errorMessage: e?.message, nextNodeId: null, result: null };
        }
      }
    }

    if (node.type === QuestionType.EMAIL) {
      const emailRef = getNodeRef(node.id);
      if (emailRef) {
        const isRequired = node?.config?.settings?.required;
        const isValidationEnabled = node?.config?.settings?.verifyEmail;

        if (!isValidationEnabled || !emailRef) return;

        if (!isRequired && !answers[node.id]?.response) {
          return {
            shouldHalt: false,
            nextNodeId: node.nextNodeId,
            result: answers[node.id]?.response,
          };
        }

        try {
          if (!emailRef?.isOtpSent) {
            await emailRef?.sendOtp();
            return {
              shouldHalt: true,
              nextNodeId: null,
              result: answers[node.id]?.response,
            };
          }
          if (node?.config?.settings?.verifyEmail && emailRef?.isOtpSent) {
            const data = await emailRef?.verifyOtp();

            if (!data?.status) {
              return {
                shouldHalt: true,
                errorMessage:
                  data?.message ||
                  "Oops! Something went wrong. Please contact support.",
                nextNodeId: null,
                result: null,
              };
            }
          }
        } catch (e) {
          return { errorMessage: e?.message, nextNodeId: null, result: null };
        }
      }
    }

    if (node.type === QuestionType.PHONE_NUMBER) {
      const phoneNumberRef = getNodeRef(node.id);

      const isValidationEnabled =
        node?.config?.settings?.isPhoneValidationEnabled;

      const isRequired = node?.config?.settings?.required;

      if (!isValidationEnabled || !phoneNumberRef) return;

      // Skip OTP flow for unsupported countries (aligns with Card/Chat pre-hooks)
      if (!phoneNumberRef.canSendOtp) {
        return {
          shouldHalt: false,
          nextNodeId: node.nextNodeId,
          result: answers[node.id]?.response,
        };
      }

      if (!isRequired && !answers[node.id]?.response?.phoneNumber) {
        return {
          shouldHalt: false,
          nextNodeId: node.nextNodeId,
          result: answers[node.id]?.response,
        };
      }

      if (!phoneNumberRef.isOtpSent) {
        await phoneNumberRef.sendOtp();
        return {
          shouldHalt: true,
          nextNodeId: null,
          result: answers[node.id]?.response,
        };
      } else {
        const data = await phoneNumberRef.verifyOtp();
        if (!data?.status) {
          return {
            shouldHalt: true,
            errorMessage: data?.message,
            nextNodeId: null,
            result: null,
          };
        }
      }
    }

    if (node.type === QuestionType.STRIPE_PAYMENT) {
      const nodeId = node?.id;
      const nodeResult = answers[nodeId]?.response || {};
      if ((stripePaymentQuestionRef.current as any)?.validate) {
        const error = await (
          stripePaymentQuestionRef.current as any
        ).validate();
        if (error) {
          return { errorMessage: error, nextNodeId: null, result: nodeResult };
        }
      }
      return { nextNodeId: node.nextNodeId, result: nodeResult };
    }

    if (isControlFlowNode(node)) {
      let nextNodeId: string | null = null;

      try {
        const transformedNodeType = getNodeTypeToExecuteTransformedNode(node);

        const res = await executeTransformedNode({
          currentNode: node,
          type: transformedNodeType,
          allNodes,
          taskGraph,
          answers: stagedAnswers,
          variables,
          executeNodeDependencies,
        });

        if (res?.status !== "success") {
          throw new Error(`Something went wrong.`);
        }

        const result = res?.result;

        nextNodeId =
          transformedNodeType === "IFELSE" ||
            transformedNodeType === "IFELSE_V2"
            ? result?.id
            : node?.next_node_ids?.[0];

        onEvent({
          node,
          response: result,
          type: "success",
        });

        return { nextNodeId, result };
      } catch (error) {
        const errorMessage = error?.message;
        toast.error("Execution Error", {
          description: errorMessage,
        });
        onEvent({
          node,
          response: errorMessage,
          type: "error",
        });

        return { errorMessage, nextNodeId: null, result: null };
      }
    }
  };

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

      const paymentAnswer = stagedAnswers[stripePaymentQuestionId];
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

  const executeStripePaymentBeforeSubmission = async () => {
    // Execute Stripe payment before submission if available
    if (isStripePaymentAvailable) {
      const paymentResult = await executeStripePaymentNode();
      if (!paymentResult.status) {
        toast.error("Payment Error", {
          description: paymentResult.errorMessage || "Payment processing failed",
        });
        return { isPaymentFailed: true };
      }
      // Include payment data in answers
      if (paymentResult.data && stripePaymentQuestionId) {
        stagedAnswers[stripePaymentQuestionId] = {
          ...stagedAnswers[stripePaymentQuestionId],
          response: {
            ...(stagedAnswers[stripePaymentQuestionId]?.response || {}),
            paymentData: paymentResult.data,
          },
        };
        saveState();
      }
      return { isPaymentFailed: false, paymentData: paymentResult.data };
    }
  };

  const handleEndingJourney = async ({ nodeId }: { nodeId: string }) => {
    if (allNodes[nodeId]?.type === QuestionType.ENDING) {
      setPipeline((prevPipeLine) => {
        return [...prevPipeLine, { qId: nodeId, index: null }];
      });
    }
    const paymentResult = await executeStripePaymentBeforeSubmission();
    if (paymentResult?.isPaymentFailed) {
      return;
    }
    await onSubmission(stagedAnswers);
    // Update submission state to SUBMITTED after successful submission
    if (onSubmissionStateChange) {
      onSubmissionStateChange("SUBMITTED");
    }
  };

  const isEndingNode = (nextNodeId: string) => {
    if (
      isEmpty(nextNodeId) ||
      allNodes[nextNodeId]?.type === QuestionType.ENDING
    ) {
      return true;
    }
    return false;
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

  const renderer = async (
    startNodeId: string,
    isInitializing: boolean = true
  ) => {
    let currentNodeId = startNodeId;
    if (isEndingNode(startNodeId)) {
      await handleEndingJourney({
        nodeId: startNodeId,
      });
      return;
    }
    setIsPipelineFilling(true);
    let hasRenderedQuestionNode = false; // If true, means we have rendered a question node
    try {
      while (currentNodeId) {
        const currentNode = allNodes[currentNodeId];

        const shouldBreak = checkNodeDependency({
          answers: stagedAnswers,
          node: currentNode,
          executedNodesHashSet: new Set(stagedPipeline.map((node) => node.qId)),
        });

        if (shouldBreak) break;

        if (currentNode.type === ("JUMP_TO" as QuestionType)) {
          if (isInitializing && !hasRenderedQuestionNode) break;
          if (isInitializing && hasRenderedQuestionNode) break;
          const jumpToNodeResponse = executeJumpToNode({
            node: currentNode,
            stagedAnswers,
            stagedPipeline,
            answeredIds: answeredIds.current,
          });
          if (jumpToNodeResponse.hasError) {
            setRuntimeError({
              errorType: "invalid_jump",
              technicalDetails: {
                errorCode: "INVALID_JUMP",
                timestamp: new Date().toISOString(),
              },
            });
            return;
          }
          let updatedAnswers = {
            ...(jumpToNodeResponse.answers || {}),
          };
          incrementJumpToNodeIterations(jumpToNodeResponse.jumpToNodeId);
          validateMaxJumpToNodeIterations(jumpToNodeResponse.jumpToNodeId);
          if (jumpToNodeResponse?.message) {
            updatedAnswers[jumpToNodeResponse.jumpToNodeId] = {
              error: jumpToNodeResponse?.message,
            };
          }

          stagedAnswers = updatedAnswers;
          stagedPipeline = jumpToNodeResponse.pipeline;
          break;
        }

        if (currentNode.type === QuestionType.LOADING) {
          if (hasRenderedQuestionNode) break;
          currentNodeId = currentNode?.next_node_ids[0];
          if (
            !hasRenderedQuestionNode &&
            isEndingNode(currentNodeId) &&
            isInitializing
          ) {
            stagedPipeline = [
              ...stagedPipeline,
              { qId: currentNodeId, index: null },
            ];
            await handleEndingJourney({
              nodeId: currentNodeId,
            });
            return;
          }
          continue;
        }

        if (isControlFlowNode(currentNode)) {
          const executedNode = await executeNode(currentNode);
          if (!executedNode) break;
          // Do not proceed or submit when control flow node failed (e.g. enrichment error, wrong email)
          if (executedNode.errorMessage) {
            break;
          }
          const dbNodeAnswer = executedNode.result ?? null;
          stagedAnswers = {
            ...stagedAnswers,
            [currentNodeId]: dbNodeAnswer,
          };
          // Flush answers immediately so next question sees DB node response when it mounts (avoids needing to reopen DB node)
          setAnswers((prev) => ({ ...prev, [currentNodeId]: dbNodeAnswer }));
          stagedPipeline = [
            ...stagedPipeline,
            { qId: currentNodeId, index: null },
          ];
          let nextNode = executedNode.nextNodeId
            ? allNodes[executedNode.nextNodeId]
            : null;
          if (!nextNode) {
            if (hasRenderedQuestionNode) break;
            // POINT :  If the form has only one control flow node so checking if not isEndingNode then break else submit the form
            if (isInitializing && !isEndingNode(executedNode?.nextNodeId))
              break; //POINT: if the form is initializing, we don't want to submit the form
            // User clicked Next (isInitializing false) but next node missing – don't go to end screen (e.g. DB node next_node_ids empty or key mismatch)
            if (!isInitializing) {
              saveState();
              break;
            }
            saveState();
            const paymentResult = await executeStripePaymentBeforeSubmission();
            if (paymentResult?.isPaymentFailed) {
              return;
            }
            onSubmission && (await onSubmission(stagedAnswers));
            // Update submission state to SUBMITTED after successful submission
            if (onSubmissionStateChange) {
              onSubmissionStateChange("SUBMITTED");
            }
            return;
          }

          // Handling Ending node
          if (
            nextNode.type === QuestionType.ENDING &&
            !hasRenderedQuestionNode
          ) {
            stagedPipeline = [
              ...stagedPipeline,
              { qId: nextNode.id, index: null },
            ];
            saveState();
            const paymentResult = await executeStripePaymentBeforeSubmission();
            if (paymentResult?.isPaymentFailed) {
              return;
            }
            onSubmission && (await onSubmission(stagedAnswers));
            // Update submission state to SUBMITTED after successful submission
            if (onSubmissionStateChange) {
              onSubmissionStateChange("SUBMITTED");
            }
            return;
          }
          currentNodeId = executedNode.nextNodeId;
        }

        if (isQuestionNode(currentNode)) {
          if (currentNode.type === QuestionType.ENDING) {
            break;
          }
          hasRenderedQuestionNode = true;
          const index = getQuestionIndex(
            [...stagedPipeline.map((node) => node.qId), currentNodeId],
            allNodes
          );
          stagedPipeline = [...stagedPipeline, { qId: currentNodeId, index }];

          if (currentNode?.config?.settings?.isPhoneValidationEnabled) {
            break;
          }

          if (currentNode?.config?.settings?.verifyEmail) {
            break;
          }

          if (currentNode.type === QuestionType.FILE_PICKER) {
            break;
          }

          currentNodeId = currentNode?.next_node_ids?.[0] || null;
        }
      }
    } catch (error) {
    } finally {
      setIsPipelineFilling(false);
      saveState();
    }
  };

  const getNextNodeId = (lastNode: TNode) => {
    if (
      (lastNode?.type as any) === "IFELSE" ||
      (lastNode?.type as any) === "IFELSE_V2"
    ) {
      return answers?.[lastNode.id]?.id ?? lastNode?.next_node_ids[0];
    }
    return lastNode?.next_node_ids[0];
  };

  const validateNode = async (node: TNode) => {
    const questionRef =
      isStripePaymentAvailable && node.type === QuestionType.STRIPE_PAYMENT
        ? stripePaymentQuestionRef.current
        : getNodeRef(node.id);
    let errorMessage = "";

    if (pipeline[node.id]?.isValidated) return "";

    errorMessage = questionsValidation({
      node,
      answer: structuredClone(stagedAnswers),
      ref: questionRef,
    });

    onEvent({
      node,
      response: errorMessage,
      type: "error",
    });

    return errorMessage;
  };

  const getMultiQuestionErrors = (nodeId, errors = {}) => {
    const clonedStagedAnswers = structuredClone(stagedAnswers);
    const questionKeysWithError = Object.keys(errors);
    const prevMultiQuestionResponse = {
      ...(clonedStagedAnswers[nodeId]?.response || {}),
    };
    for (const key of questionKeysWithError) {
      prevMultiQuestionResponse[key] = {
        ...prevMultiQuestionResponse[key],
        error: errors[key],
      };
    }

    return {
      response: prevMultiQuestionResponse,
    };
  };

  const validatesNodes = async () => {
    let firstNodeIDWithError = null;
    let doesErrorExist = false;
    let shouldHalt = false;
    for (const pipelineItem of stagedPipeline) {
      const node = allNodes[pipelineItem.qId];
      if (isControlFlowNode(node)) continue;

      // Setting response to null if user has not answered the question
      stagedAnswers[pipelineItem.qId] = {
        ...stagedAnswers[pipelineItem.qId],
        response: stagedAnswers[pipelineItem.qId]?.response || null,
      };
      let error = await validateNode(node);

      let executedResponse: Awaited<ReturnType<typeof executeNode>> = null;
      if (!error) {
        if (
          node.type === QuestionType.FILE_PICKER ||
          node.type === QuestionType.SIGNATURE
        ) {
          const ref = { current: getNodeRef(node.id) };
          const preResult = await handlePreHooks({
            node,
            ref,
            setAnswers,
            setLoading: setIsLoading,
            answers: stagedAnswers,
          });
          if (preResult.error) {
            error = preResult.error;
          } else if (preResult.earlyExit) {
            executedResponse = {
              shouldHalt: true,
              nextNodeId: null,
              result: null,
              errorMessage: preResult.error || null,
            };
          } else if (
            preResult.preHookAnswers &&
            Object.keys(preResult.preHookAnswers).length > 0
          ) {
            Object.assign(stagedAnswers, preResult.preHookAnswers);
            const nodeKey = node._id ?? node.id ?? pipelineItem.qId;
            executedResponse = {
              errorMessage: null,
              nextNodeId: null,
              result: preResult.preHookAnswers[nodeKey]?.response,
            };
          }
        }
        if (executedResponse === null && !error) {
          executedResponse = await executeNode(node);
        }
        if (executedResponse?.shouldHalt) {
          shouldHalt = true;
        }
        if (executedResponse) {
          if (executedResponse?.errorMessage) {
            doesErrorExist = true;
            error = executedResponse.errorMessage;
            stagedAnswers[pipelineItem.qId] = {
              ...stagedAnswers[pipelineItem.qId],
              error: executedResponse.errorMessage,
            };
          } else {
            stagedAnswers[pipelineItem.qId] = {
              error: "",
              response: executedResponse.result,
            };
          }
          stagedPipeline = stagedPipeline.map((node) => {
            if (node.qId === pipelineItem.qId) {
              return {
                ...node,
                isValidated: executedResponse.errorMessage ? false : true,
              };
            }
            return node;
          });
        }
      }
      if (error && firstNodeIDWithError === null) {
        if (node.type === QuestionType.MULTI_QUESTION_PAGE) {
          if (Object.keys(error).length > 0) {
            firstNodeIDWithError = Object.keys(error)[0];
            doesErrorExist = true;
          }
        } else {
          firstNodeIDWithError = pipelineItem.qId;
          doesErrorExist = true;
        }
      }

      stagedPipeline = stagedPipeline.map((node) => {
        if (node.qId === pipelineItem.qId) {
          return {
            ...node,
            isValidated: error ? false : true,
          };
        }
        return node;
      });

      stagedAnswers[pipelineItem.qId] =
        allNodes[pipelineItem.qId].type === QuestionType.MULTI_QUESTION_PAGE
          ? {
            ...stagedAnswers[pipelineItem.qId],
            ...(getMultiQuestionErrors(pipelineItem.qId, error) || {}),
          }
          : { ...stagedAnswers[pipelineItem.qId], error: error };
    }

    setPipeline(stagedPipeline);
    setAnswers(stagedAnswers);

    return { isFormInvalid: doesErrorExist, firstNodeIDWithError, shouldHalt };
  };

  const onNextStep = async () => {
    setIsLoading(true);
    const lastNode = allNodes[pipeline[pipeline.length - 1].qId];
    let nextNodeId = getNextNodeId(lastNode);
    const formStatus = await validatesNodes();
    if (formStatus?.isFormInvalid || formStatus?.shouldHalt) {
      setIsLoading(false);
      if (formStatus.shouldHalt) return;

      const questionElement = document.getElementById(
        formStatus?.firstNodeIDWithError
      );

      if (questionElement) {
        questionElement.scrollIntoView();
      }
      setIsLoading(false);
      return;
    } else {
      triggerIfAllNodesValid();
    }

    while (
      nextNodeId &&
      allNodes?.[nextNodeId]?.type === QuestionType.LOADING
    ) {
      nextNodeId = allNodes[nextNodeId]?.next_node_ids?.[0];
    }

    if (allNodes[nextNodeId]?.type === ("JUMP_TO" as QuestionType)) {
      const jumpToNodeResponse = executeJumpToNode({
        node: allNodes[nextNodeId],
        stagedAnswers,
        stagedPipeline,
        answeredIds: answeredIds.current,
      });
      if (jumpToNodeResponse.hasError) {
        setRuntimeError({
          errorType: "invalid_jump",
          technicalDetails: {
            errorCode: "INVALID_JUMP",
            timestamp: new Date().toISOString(),
          },
        });
      }
      incrementJumpToNodeIterations(jumpToNodeResponse.jumpToNodeId);
      validateMaxJumpToNodeIterations(jumpToNodeResponse.jumpToNodeId);
      let updatedAnswers = {
        ...(jumpToNodeResponse.answers || {}),
      };
      if (jumpToNodeResponse?.message) {
        updatedAnswers[jumpToNodeResponse.jumpToNodeId] = {
          response: null,
          error: jumpToNodeResponse?.message,
        };
      }
      setAnswers(updatedAnswers);
      setPipeline(jumpToNodeResponse.pipeline);
      setIsLoading(false);
      return null;
    }

    await renderer(nextNodeId, false);
    setIsLoading(false);
    return null;
  };

  useEffect(() => {
    const initializeClassicRunner = async () => {
      setInitializingPipeline(true);
      const startNode = getStartNode(allNodes);
      await renderer(startNode?.id);
      setInitializingPipeline(false);
    };
    initializeClassicRunner();
  }, []);

  return {
    answers,
    pipeline,
    isLoading,
    initializingPipeline,
    onNextStep,
    onAnswerChange,
    isPipelineFilling,
    answeredIds: answeredIds.current,
    runtimeError,
    stripePaymentQuestionId,
    stripePaymentQuestionRef,
  };
};
