import { QuestionType } from "@src/module/constants";
import { handlePhoneNumber } from "./phoneNumber";
import { TAnswers, TNode } from "../types";
import { handleEmail } from "./email";
import { handleFilesUpload } from "./filesUpload";
import { handleSignatureUpload } from "./signatureUpload";
import { handleStripePayment } from "./ stripePayment";

type THandlePreHooks = {
  node: TNode;
  ref: any;
  setAnswers: React.Dispatch<React.SetStateAction<any>>;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
  answers?: TAnswers;
};
export const handlePreHooks = async ({
  node,
  ref,
  setAnswers,
  setLoading,
  answers,
}: THandlePreHooks): Promise<{
  error: string;
  earlyExit: boolean;
  preHookAnswers?: TAnswers;
}> => {
  let caughtError = "";
  let isLoading: boolean = false;
  let earlyExit = false;
  let preHookAnswers: TAnswers = {};
  let isRequired = node?.config?.settings?.required;

  if (node.type === QuestionType.PHONE_NUMBER) {
    setLoading(true);
    if (
      !ref?.current?.canSendOtp ||
      (!isRequired && !answers?.[node._id]?.response?.phoneNumber)
    ) {
      setLoading(false);
      return {
        error: "",
        earlyExit: false,
      };
    }
    const { earlyExit, error } = await handlePhoneNumber({
      node: node,
      ref,
    });
    if (error) {
      caughtError = error;
    }

    setLoading(false);
    if (earlyExit) {
      return {
        error: caughtError,
        earlyExit: earlyExit,
      };
    }
  }

  if (node.type === QuestionType.EMAIL) {
    setLoading(true);
    if (!isRequired && !answers?.[node._id]?.response) {
      setLoading(false);
      return {
        error: "",
        earlyExit: false,
      };
    }
    const { error = "", earlyExit } = await handleEmail({
      node: node,
      ref,
    });
    if (error) {
      caughtError = error;
    }

    setLoading(false);
    if (earlyExit) {
      return {
        error: caughtError,
        earlyExit: earlyExit,
      };
    }
  }

  if (node.type === QuestionType.FILE_PICKER) {
    setLoading(true);
    const { urls, error } = await handleFilesUpload({
      node: node,
      ref,
    });
    if (error) {
      caughtError = error;
      setLoading(false);
      return {
        error: caughtError,
        earlyExit: earlyExit,
      };
    }
    // setting pre hook answers
    preHookAnswers = {
      [node._id]: {
        response: urls,
      },
    };
    setAnswers((prevAnswer) => {
      return {
        ...prevAnswer,
        [node._id]: {
          response: urls,
        },
      };
    });
    setLoading(false);
  }

  if (node.type === QuestionType.SIGNATURE) {
    setLoading(true);
    const { url, error } = await handleSignatureUpload({
      ref,
    });
    if (error) {
      caughtError = error;
      setLoading(false);
      return {
        error: caughtError,
        earlyExit: earlyExit,
      };
    }
    // setting pre hook answers
    preHookAnswers = {
      [node._id]: {
        response: url,
      },
    };
    setAnswers((prevAnswer) => {
      return {
        ...prevAnswer,
        [node._id]: {
          response: url,
        },
      };
    });
    setLoading(false);
  }

  if (node.type === QuestionType.NUMBER) {
    if (!answers?.[node._id]?.response) {
      return {
        error: "",
        earlyExit: false,
      };
    }
    const parsedNumber = parseFloat(answers?.[node._id]?.response);
    preHookAnswers = {
      [node._id]: {
        response: parsedNumber,
      },
    };
    setAnswers((prevAnswer) => {
      return {
        ...prevAnswer,
        [node._id]: {
          response: parsedNumber,
        },
      };
    });
  }

  if (node.type === QuestionType.STRIPE_PAYMENT) {
    setLoading(true);
    const { error = "" } = await handleStripePayment({
      node: node,
      ref,
    });
    if (error) {
      caughtError = error;
    }
    setLoading(false);
  }

  return {
    error: caughtError,
    earlyExit: earlyExit,
    preHookAnswers: preHookAnswers,
  };
};
