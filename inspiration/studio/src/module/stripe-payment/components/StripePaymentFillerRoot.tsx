import React, { forwardRef } from "react";
import {
  StripeConnectionData,
  StripePaymentFillerProps,
  StripePaymentFillerRef,
} from "../types";
import { StripePaymentFiller } from "./StripePaymentFiller";
import {
  getAmountDisplayStyles,
  getContainerStyles,
  getPaymentFormStyles,
} from "../styles";
import { ODSError as Error } from "@src/module/ods";

export const StripePaymentFillerRoot = forwardRef<
  StripePaymentFillerRef,
  StripePaymentFillerProps
>(({ question, theme, onChange, disabled, error, value }, ref) => {
  const settings = question?.settings || {};
  const connectionData = question?.settings
    ?.stripe_connection_data as StripeConnectionData;
  const accessToken = connectionData?.configs?.access_token;
  const amount = parseFloat(settings?.amount || "0");
  const currency = settings?.currency || "USD";

  if (amount <= 0) {
    return (
      <div style={getContainerStyles()} data-testid="stripe-payment-filler">
        <Error text="Looks like there's nothing to charge. Please check the amount." />
      </div>
    );
  }

  if (!accessToken) {
    return (
      <div style={getContainerStyles()} data-testid="stripe-payment-filler">
        <div style={getAmountDisplayStyles(theme)}>
          Pay {currency} {amount}
        </div>
        <div style={getPaymentFormStyles()}>
          <Error text="Stripe connection not configured. Please check your settings." />
        </div>
      </div>
    );
  }

  return (
    <StripePaymentFiller
      ref={ref}
      question={question}
      theme={theme}
      onChange={onChange}
      disabled={disabled}
      error={error}
      value={value}
    />
  );
});
