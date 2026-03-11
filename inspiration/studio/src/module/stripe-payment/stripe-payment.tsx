import { forwardRef } from "react";
import { StripePaymentCreator } from "./components/StripePaymentCreator";
import { StripePaymentFillerRoot } from "./components/StripePaymentFillerRoot";
import { StripePaymentFillerRef } from "./types";

export type StripePaymentProps = {
  isCreator: boolean;
  question: any;
  onChange: any;
  theme?: any;
  error?: string;
  disabled?: boolean;
  value?: any;
};

export const StripePayment = forwardRef<
  StripePaymentFillerRef,
  StripePaymentProps
>(
  (
    {
      isCreator,
      question,
      onChange,
      theme = {},
      error,
      disabled = false,
      value,
    },
    ref
  ) => {
    if (isCreator) {
      return (
        <StripePaymentCreator ref={ref} question={question} theme={theme} />
      );
    }

    return (
      <StripePaymentFillerRoot
        ref={ref}
        question={question}
        theme={theme}
        onChange={onChange}
        disabled={disabled}
        error={error}
        value={value}
      />
    );
  }
);
