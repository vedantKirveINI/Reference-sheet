import React, {
  useMemo,
  forwardRef,
  useImperativeHandle,
  useRef,
  useEffect,
  useState,
} from "react";
import { Stripe, StripeElementsOptions } from "@stripe/stripe-js";

import {
  Elements,
  PaymentElement,
  useElements,
  useStripe,
} from "@stripe/react-stripe-js";
import {
  getContainerStyles,
  getAmountDisplayStyles,
  getPaymentFormStyles,
  getPaymentElementContainerStyles,
} from "../styles";
import {
  createPaymentIntent,
  getStripePromise,
  convertAmountToSmallestUnit,
} from "../utils";
import {
  StripeConnectionData,
  StripePaymentFillerProps,
  StripePaymentFillerRef,
} from "../types";
import { useStripePayment } from "../hooks/useStripePayment";
import { StripeElements } from "@stripe/stripe-js";

type StripePaymentFormProps = {
  theme?: any;
  onChange: (value: any) => void;
  disabled?: boolean;
  transactionAmount?: string;
  sendReceipt: boolean;
  initialName?: string;
  initialEmail?: string;
  onFormStateChange?: (name: string, email: string) => void;
  currency?: string;
};

type StripePaymentFormRef = {
  getStripe: () => Stripe | null;
  getElements: () => StripeElements | null;
  isPaymentElementEmpty: () => boolean;
  isPaymentElementCompleted: boolean;
};

const StripePaymentForm = forwardRef<
  StripePaymentFormRef,
  StripePaymentFormProps
>(
  (
    {
      theme,
      onChange,
      disabled,
      transactionAmount,
      sendReceipt,
      initialName,
      initialEmail,
      onFormStateChange,
      currency,
    },
    ref
  ) => {
    const [paymentElementState, setPaymentElementState] = useState({
      empty: false,
      isCompleted: false,
    });
    const elements = useElements();
    const stripe = useStripe();

    useImperativeHandle(
      ref,
      () => ({
        getStripe: () => stripe,
        getElements: () => elements,
        isPaymentElementEmpty: () => {
          return paymentElementState.empty;
        },
        isPaymentElementCompleted: paymentElementState.isCompleted,
      }),
      [elements, stripe, paymentElementState]
    );

    const { name, email, setName, setEmail } = useStripePayment({
      sendReceipt,
      onChange,
      initialName,
      initialEmail,
      transactionAmount,
      currency,
    });

    useEffect(() => {
      if (onFormStateChange) {
        onFormStateChange(name, email);
      }
    }, [name, email, onFormStateChange]);

    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "1em",
        }}
      >
        <div style={getPaymentElementContainerStyles(theme)}>
          <PaymentElement
            options={{
              layout: "tabs",
              fields: {
                billingDetails: {
                  address: {
                    country: "auto", // Stripe will collect country
                  },
                },
              },
            }}
            onChange={(event) => {
              setPaymentElementState({
                empty: event.empty,
                isCompleted: event.complete,
              });
            }}
          />
        </div>

        <div>
          <label
            style={{
              display: "block",
              marginBottom: "0.5em",
              fontSize: "0.875em",
              fontWeight: 500,
              color: theme?.styles?.questions || "#000",
              fontFamily: theme?.styles?.fontFamily || "Inter",
            }}
          >
            Name on card
          </label>
          <input
            type="text"
            style={{
              width: "100%",
              padding: "0.75em",
              border: "1px solid rgba(0, 0, 0, 0.2)",
              borderRadius: "0.375em",
              fontSize: "16px",
              fontFamily: theme?.styles?.fontFamily || "Inter",
              color: theme?.styles?.questions || "#000",
              backgroundColor: disabled ? "#f5f5f5" : "#fff",
            }}
            placeholder="John Smith"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={disabled}
          />
        </div>

        {sendReceipt && (
          <div>
            <label
              style={{
                display: "block",
                marginBottom: "0.5em",
                fontSize: "0.875em",
                fontWeight: 500,
                color: theme?.styles?.questions || "#000",
                fontFamily: theme?.styles?.fontFamily || "Inter",
              }}
            >
              Email
            </label>
            <input
              type="email"
              style={{
                width: "100%",
                padding: "0.75em",
                border: "1px solid rgba(0, 0, 0, 0.2)",
                borderRadius: "0.375em",
                fontSize: "16px",
                fontFamily: theme?.styles?.fontFamily || "Inter",
                color: theme?.styles?.questions || "#000",
                backgroundColor: disabled ? "#f5f5f5" : "#fff",
              }}
              placeholder="example@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={disabled}
            />
          </div>
        )}
      </div>
    );
  }
);

export const StripePaymentFiller = forwardRef<
  StripePaymentFillerRef,
  StripePaymentFillerProps
>(({ question, theme = {}, onChange, disabled = false, error, value }, ref) => {
  const stripePaymentFormRef = useRef<StripePaymentFormRef>(null);
  const settings = question?.settings || {};
  const amount = parseFloat(settings?.amount || "0");
  const currency = settings?.currency || "USD";
  const sendReceipt = settings?.sendReceipt || false;

  const initialName = value?.name || "";
  const initialEmail = value?.email || "";

  const formStateRef = useRef<{ name: string; email: string }>({
    name: initialName,
    email: initialEmail,
  });

  const connectionData = question?.settings
    ?.stripe_connection_data as StripeConnectionData;

  const stripePromise = useMemo(
    () =>
      getStripePromise(connectionData?.configs?.stripe_publishable_key || ""),
    [connectionData?.configs?.stripe_publishable_key]
  );

  // Convert amount to smallest currency unit for Elements based on currency decimal places
  const amountInSmallestUnit = useMemo(
    () => convertAmountToSmallestUnit(amount, currency),
    [amount, currency]
  );

  const elementsOptions: StripeElementsOptions = useMemo(
    () => ({
      appearance: {
        theme: "stripe",
        variables: {
          colorPrimary: theme?.styles?.buttons || "#000",
          colorText: theme?.styles?.questions || "#000",
          fontFamily: theme?.styles?.fontFamily || "Inter",
        },
      },
      mode: "payment",
      currency: currency.toLowerCase(),
      amount: amountInSmallestUnit,
      locale: "en",
    }),
    [amountInSmallestUnit, currency, theme]
  );

  React.useEffect(() => {
    formStateRef.current = {
      name: initialName,
      email: initialEmail,
    };
  }, [initialName, initialEmail]);

  useImperativeHandle(
    ref,
    () => ({
      validate: async (): Promise<string> => {
        const elements = stripePaymentFormRef.current?.getElements();
        const isPaymentElementEmpty =
          stripePaymentFormRef.current?.isPaymentElementEmpty();
        const isPaymentElementCompleted =
          stripePaymentFormRef.current?.isPaymentElementCompleted;
        if (!elements) {
          return "Payment form is not ready";
        }

        if (isPaymentElementEmpty) {
          return "";
        }

        if (!isPaymentElementCompleted) {
          return "Please fill in all the payment details";
        }

        const { error: submitError } = await elements.submit();

        if (submitError) {
          return submitError.message || "Invalid payment details";
        }

        return "";
      },
      getStripe: () => stripePaymentFormRef.current?.getStripe(),
      getElements: () => stripePaymentFormRef.current?.getElements(),
      isPaymentElementEmpty: () =>
        stripePaymentFormRef.current?.isPaymentElementEmpty(),
      createPaymentIntent: async () => {
        return await createPaymentIntent({
          amount: amount,
          currency: currency.toLowerCase(),
          accessToken: connectionData?.configs?.access_token || "",
          receiptEmail: initialEmail,
        });
      },
    }),
    [amount, connectionData?.configs?.access_token, currency, initialEmail]
  );
  return (
    <div style={getContainerStyles()} data-testid="stripe-payment-filler">
      <div style={getAmountDisplayStyles(theme)}>
        Pay {currency} {amount}
      </div>
      <div style={getPaymentFormStyles()}>
        <Elements stripe={stripePromise} options={elementsOptions}>
          <StripePaymentForm
            ref={stripePaymentFormRef}
            theme={theme}
            onChange={onChange}
            transactionAmount={amount?.toString?.()}
            disabled={disabled}
            sendReceipt={sendReceipt}
            initialName={initialName}
            initialEmail={initialEmail}
            onFormStateChange={(name, email) => {
              formStateRef.current = { name, email };
            }}
            currency={currency}
          />
        </Elements>
      </div>
    </div>
  );
});
