import { useState, useCallback } from "react";

export type UseStripePaymentParams = {
  sendReceipt: boolean;
  onChange: (value: any) => void;
  initialName?: string;
  initialEmail?: string;
  transactionAmount?: string;
  currency?: string;
};

export type UseStripePaymentReturn = {
  name: string;
  email: string;
  setName: (value: string) => void;
  setEmail: (value: string) => void;
};

export const useStripePayment = ({
  sendReceipt,
  onChange,
  initialName = "",
  initialEmail = "",
  transactionAmount = "",
  currency,
}: UseStripePaymentParams): UseStripePaymentReturn => {
  const [name, setName] = useState(initialName);
  const [email, setEmail] = useState(initialEmail);

  const handleNameChange = useCallback(
    (value: string) => {
      setName(value);
      onChange({
        name: value,
        email: sendReceipt ? email : "",
        amount: transactionAmount,
        currency: currency,
      });
    },
    [email, sendReceipt, onChange, transactionAmount]
  );

  const handleEmailChange = useCallback(
    (value: string) => {
      setEmail(value);
      onChange({
        name: name,
        email: value,
        amount: transactionAmount,
      });
    },
    [name, onChange, transactionAmount]
  );

  return {
    name,
    email,
    setName: handleNameChange,
    setEmail: handleEmailChange,
  };
};
